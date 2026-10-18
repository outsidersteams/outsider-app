
const admin = require("firebase-admin");

const MAX_QUERY_LENGTH = 120;
const MAX_RESULTS = 8;
const MAX_CATALOG_SCAN = 500;

function sendJson(res, status, payload) {
  return res
    .status(status)
    .setHeader("Content-Type", "application/json; charset=utf-8")
    .json(payload);
}

function safeText(value, max = 500) {
  return typeof value === "string"
    ? value.trim().slice(0, max)
    : "";
}

function normalizeSearch(value) {
  return safeText(value, 1000)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

  // Convierte los "\n" literales de Vercel en saltos de línea reales.
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ?.replace(/\\n/g, "\n")
    .trim();

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin environment variables.");
  }

  return admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey,
    }),
    projectId,
  });
}

function isAuthorized(req) {
  const expected = process.env.OUTSIDER_AI_API_KEY;
  const supplied = req.headers.authorization || "";

  return Boolean(expected) && supplied === `Bearer ${expected}`;
}

function normalizePrice(value) {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value !== "number" && typeof value !== "string")
  ) {
    return null;
  }

  const price = Number(value);

  return Number.isFinite(price) && price >= 0 ? price : null;
}

function normalizeImage(image) {
  if (typeof image === "string") {
    const url = safeText(image, 1000);
    return url ? { url } : null;
  }

  if (!image || typeof image !== "object") {
    return null;
  }

  const url = safeText(image.url || image.src || image.fileUrl, 1000);

  if (!url) {
    return null;
  }

  return {
    url,
    fileId: safeText(image.fileId, 200) || null,
  };
}

function normalizeSize(size) {
  if (!size || typeof size !== "object") {
    return null;
  }

  return {
    id: safeText(size.id, 100),
    name: safeText(size.name || size.label, 80),
    sku: safeText(size.sku, 120) || null,
    price: normalizePrice(size.price),
    active: size.active !== false,
  };
}

function normalizeVariant(variant) {
  if (!variant || typeof variant !== "object") {
    return null;
  }

  const sizes = Array.isArray(variant.sizes)
    ? variant.sizes.map(normalizeSize).filter(Boolean)
    : [];

  const images = Array.isArray(variant.images)
    ? variant.images.map(normalizeImage).filter(Boolean).slice(0, 10)
    : [];

  return {
    id: safeText(variant.id, 100),
    name: safeText(
      variant.name ||
      variant.colorName ||
      variant.color ||
      variant.id,
      120
    ),
    active: variant.active !== false,
    images,
    sizes,
  };
}

function searchableText(product) {
  const terms = [
    product.name,
    product.description,
    product.categoryId,
    product.categoryName,
    product.category,
    product.slug,
    product.brand,
    product.fulfillment?.type,
    ...(Array.isArray(product.tags) ? product.tags : []),
  ];

  const variants = Array.isArray(product.variants)
    ? product.variants
    : [];

  for (const variant of variants) {
    terms.push(
      variant?.id,
      variant?.name,
      variant?.color,
      variant?.colorName
    );

    if (Array.isArray(variant?.sizes)) {
      for (const size of variant.sizes) {
        terms.push(
          size?.id,
          size?.name,
          size?.label,
          size?.sku
        );
      }
    }
  }

  return normalizeSearch(
    terms.filter((term) => typeof term === "string").join(" ")
  );
}

function publicProduct(product, id) {
  const variants = Array.isArray(product.variants)
    ? product.variants
        .map(normalizeVariant)
        .filter(Boolean)
        .filter((variant) => variant.active)
    : [];

  const images = Array.isArray(product.images)
    ? product.images.map(normalizeImage).filter(Boolean).slice(0, 10)
    : [];

  const allSizes = variants.flatMap((variant) =>
    variant.sizes
      .filter((size) => size.active)
      .map((size) => ({
        ...size,
        variantId: variant.id,
        variantName: variant.name,
      }))
  );

  const prices = allSizes
    .map((size) => size.price)
    .filter((price) => price !== null);

  return {
    id,
    name: safeText(product.name, 160),
    slug: safeText(product.slug, 180),
    description: safeText(product.description, 3000),
    categoryId: safeText(product.categoryId, 120),
    categoryName: safeText(product.categoryName || product.category, 120),
    active: product.active === true,
    publishedOnWeb: product.publishedActive?.web === true,
    fulfillment: {
      type: safeText(product.fulfillment?.type, 80) || "physical",
    },
    images,
    variants,
    sizes: allSizes,
    priceRange: prices.length
      ? {
          min: Math.min(...prices),
          max: Math.max(...prices),
          currency: "GTQ",
        }
      : null,
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  if (!isAuthorized(req)) {
    return sendJson(res, 401, { error: "Unauthorized." });
  }

  const search = safeText(req.query?.q, MAX_QUERY_LENGTH);

  if (search.length < 2) {
    return sendJson(res, 400, {
      error: "Query parameter q must contain at least 2 characters.",
    });
  }

  try {
    initializeFirebaseAdmin();

    const db = admin.firestore();

    // La búsqueda se limita a productos activos y publicados en la web.
    const snapshot = await db
      .collection("products")
      .where("active", "==", true)
      .where("publishedActive.web", "==", true)
      .limit(MAX_CATALOG_SCAN)
      .get();

    const needle = normalizeSearch(search);

    const matches = snapshot.docs
      .map((doc) => ({
        id: doc.id,
        data: doc.data(),
      }))
      .map(({ id, data }) => ({
        id,
        data,
        searchable: searchableText(data),
      }))
      .filter(({ searchable }) => searchable.includes(needle))
      .slice(0, MAX_RESULTS)
      .map(({ id, data }) => publicProduct(data, id));

    return sendJson(res, 200, {
      query: search,
      count: matches.length,
      products: matches,
      catalogScanLimit: MAX_CATALOG_SCAN,
      note:
        "Prices are listed per size in GTQ. Active sizes do not guarantee stock. Verify availability separately before confirming an order.",
    });
  } catch (error) {
    console.error(
      "OUTSIDER AI product lookup failed:",
      error?.message || "Unknown server error."
    );

    return sendJson(res, 500, {
      error: "Product lookup unavailable.",
    });
  }
};
