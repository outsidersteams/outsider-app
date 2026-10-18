
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
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function normalizeSearch(value) {
  return safeText(value, 1000)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) return admin.app();

  const projectId = process.env.FIREBASE_PROJECT_ID?.trim();
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
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
  const expected = process.env.OUTSIDER_AI_API_KEY?.trim();
  const supplied = (req.headers.authorization || "").trim();
  const bearerPrefix = "Bearer ";

  const hasExpectedKey = Boolean(expected);
  const hasBearer = supplied.startsWith(bearerPrefix);
  const suppliedKey = hasBearer
    ? supplied.slice(bearerPrefix.length).trim()
    : "";

  const authorized =
    hasExpectedKey &&
    hasBearer &&
    suppliedKey.length > 0 &&
    suppliedKey === expected;

  console.log("OUTSIDER AI auth diagnostic:", {
    envKeyPresent: hasExpectedKey,
    bearerReceived: hasBearer,
    suppliedKeyPresent: Boolean(suppliedKey),
    authorized: Boolean(authorized),
  });

  return Boolean(authorized);
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

  if (!image || typeof image !== "object") return null;

  const url = safeText(image.url || image.src || image.fileUrl, 1000);
  if (!url) return null;

  return {
    url,
    fileId: safeText(image.fileId, 200) || null,
  };
}

function normalizeSize(size) {
  if (!size || typeof size !== "object") return null;

  return {
    id: safeText(size.id, 100),
    name: safeText(size.name || size.label, 80),
    sku: safeText(size.sku, 120) || null,
    price: normalizePrice(size.price),
    active: size.active !== false,
  };
}

function normalizeVariant(variant) {
  if (!variant || typeof variant !== "object") return null;

  return {
    id: safeText(variant.id, 100),
    name: safeText(
      variant.name || variant.colorName || variant.color || variant.id,
      120
    ),
    active: variant.active !== false,
    images: Array.isArray(variant.images)
      ? variant.images.map(normalizeImage).filter(Boolean).slice(0, 10)
      : [],
    sizes: Array.isArray(variant.sizes)
      ? variant.sizes.map(normalizeSize).filter(Boolean)
      : [],
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

  for (const variant of Array.isArray(product.variants) ? product.variants : []) {
    terms.push(variant?.id, variant?.name, variant?.color, variant?.colorName);

    for (const size of Array.isArray(variant?.sizes) ? variant.sizes : []) {
      terms.push(size?.id, size?.name, size?.label, size?.sku);
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

  const sizes = variants.flatMap((variant) =>
    variant.sizes
      .filter((size) => size.active)
      .map((size) => ({
        ...size,
        variantId: variant.id,
        variantName: variant.name,
      }))
  );

  const prices = sizes
    .map((size) => size.price)
    .filter((price) => price !== null);

  return {
    id,
    name: safeText(product.name, 160),
    slug: safeText(product.slug, 180),
    description: safeText(product.description, 3000),
    categoryId: safeText(product.categoryId, 120),
    categoryName: safeText(product.categoryName || product.category, 120),
    fulfillment: {
      type: safeText(product.fulfillment?.type, 80) || "physical",
    },
    images,
    variants,
    sizes,
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

    const snapshot = await admin
      .firestore()
      .collection("products")
      .where("active", "==", true)
      .where("publishedActive.web", "==", true)
      .limit(MAX_CATALOG_SCAN)
      .get();

    const needle = normalizeSearch(search);

    const products = snapshot.docs
      .map((doc) => ({ id: doc.id, data: doc.data() }))
      .filter(({ data }) => searchableText(data).includes(needle))
      .slice(0, MAX_RESULTS)
      .map(({ id, data }) => publicProduct(data, id));

    return sendJson(res, 200, {
      query: search,
      count: products.length,
      products,
      catalogScanLimit: MAX_CATALOG_SCAN,
      note:
        "Prices are in GTQ. Active sizes do not guarantee stock; verify availability separately.",
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
