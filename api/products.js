
const admin = require("firebase-admin");

const MAX_QUERY_LENGTH = 120;
const MAX_RESULTS = 8;
const PAGE_SIZE = 200;
const MAX_CATALOG_SCAN = 5000;

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
  return safeText(value, 3000)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es")
    .trim();
}

function initializeFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.app();
  }

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
  const authorization = req.headers.authorization || "";

  if (!expected || !authorization.startsWith("Bearer ")) {
    return false;
  }

  const supplied = authorization.slice(7).trim();

  return Boolean(supplied) && supplied === expected;
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

  return Number.isFinite(price) && price >= 0
    ? price
    : null;
}

function normalizeImage(image) {
  if (typeof image === "string") {
    const url = safeText(image, 1000);
    return url ? { url } : null;
  }

  if (!image || typeof image !== "object") {
    return null;
  }

  const url = safeText(
    image.url || image.src || image.fileUrl,
    1000
  );

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
    images: Array.isArray(variant.images)
      ? variant.images
          .map(normalizeImage)
          .filter(Boolean)
          .slice(0, 10)
      : [],
    sizes: Array.isArray(variant.sizes)
      ? variant.sizes
          .map(normalizeSize)
          .filter(Boolean)
      : [],
  };
}

function publicProduct(product, id) {
  const variants = Array.isArray(product.variants)
    ? product.variants
        .map(normalizeVariant)
        .filter(Boolean)
        .filter((variant) => variant.active)
    : [];

  const images = Array.isArray(product.images)
    ? product.images
        .map(normalizeImage)
        .filter(Boolean)
        .slice(0, 10)
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
    categoryName: safeText(
      product.categoryName || product.category,
      120
    ),
    fulfillment: {
      type: safeText(product.fulfillment?.type, 80).toLowerCase() || "physical",
    },
    availabilityMode:
      safeText(product.fulfillment?.type, 80).toLowerCase() === "made_to_order"
        ? "made_to_order"
        : "inventory",
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

  for (const variant of Array.isArray(product.variants)
    ? product.variants
    : []) {
    terms.push(
      variant?.id,
      variant?.name,
      variant?.color,
      variant?.colorName
    );

    for (const size of Array.isArray(variant?.sizes)
      ? variant.sizes
      : []) {
      terms.push(
        size?.id,
        size?.name,
        size?.label,
        size?.sku
      );
    }
  }

  return normalizeSearch(
    terms.filter((term) => typeof term === "string").join(" ")
  );
}

function containsExactSku(product, query) {
  const target = normalizeSearch(query);

  for (const variant of Array.isArray(product.variants)
    ? product.variants
    : []) {
    for (const size of Array.isArray(variant?.sizes)
      ? variant.sizes
      : []) {
      if (normalizeSearch(size?.sku || "") === target) {
        return true;
      }
    }
  }

  return false;
}

async function fetchPublishedProducts(db) {
  const products = [];
  let lastDocument = null;
  let scanned = 0;

  while (scanned < MAX_CATALOG_SCAN) {
    let query = db
      .collection("products")
      .where("active", "==", true)
      .where("publishedActive.web", "==", true)
      .orderBy(admin.firestore.FieldPath.documentId())
      .limit(Math.min(PAGE_SIZE, MAX_CATALOG_SCAN - scanned));

    if (lastDocument) {
      query = query.startAfter(lastDocument);
    }

    const snapshot = await query.get();

    if (snapshot.empty) {
      return {
        products,
        scanned,
        scanLimitReached: false,
      };
    }

    for (const doc of snapshot.docs) {
      products.push({
        id: doc.id,
        data: doc.data(),
      });
    }

    scanned += snapshot.size;
    lastDocument = snapshot.docs[snapshot.docs.length - 1];

    if (snapshot.size < PAGE_SIZE) {
      return {
        products,
        scanned,
        scanLimitReached: false,
      };
    }
  }

  return {
    products,
    scanned,
    scanLimitReached: true,
  };
}

function availabilityKey(variantId, sizeId) {
  return `${String(variantId || "")}__${String(sizeId || "")}`;
}

function setSizeAvailability(size, status) {
  return {
    ...size,
    availability: {
      status: status.status,
      available: status.available,
      orderable: status.orderable,
      source: status.source,
    },
  };
}

function isImageOnlyVariantSet(variants) {
  if (!Array.isArray(variants) || variants.length < 2) return false;
  return variants.every((variant) => /^imagen\s*\d+$/i.test(safeText(variant.name, 120)));
}

function statusFromStock(stock, source) {
  if (!Number.isFinite(stock)) {
    return { status: "unknown", available: null, orderable: false, source };
  }
  const available = stock > 0;
  return {
    status: available ? "available" : "out_of_stock",
    available,
    orderable: available,
    source,
  };
}

function statusFromProjection(available) {
  if (typeof available !== "boolean") {
    return { status: "unknown", available: null, orderable: false, source: "productAvailability" };
  }
  return {
    status: available ? "available" : "out_of_stock",
    available,
    orderable: available,
    source: "productAvailability",
  };
}

async function attachAvailability(db, product) {
  if (product.fulfillment.type === "made_to_order") {
    const podStatus = {
      status: "available",
      available: true,
      orderable: true,
      source: "made_to_order",
    };
    const variants = product.variants.map((variant) => ({
      ...variant,
      sizes: variant.sizes.map((size) => setSizeAvailability(size, podStatus)),
    }));
    const sizes = product.sizes.map((size) => setSizeAvailability(size, podStatus));
    return {
      ...product,
      variants,
      sizes,
      availability: {
        status: "available",
        orderable: true,
        mode: "made_to_order",
        note: "Producto POD: se fabrica bajo pedido; no requiere stock físico.",
      },
    };
  }

  // Read real inventory quantities. productAvailability is used as a fallback
  // projection only when there is no matching inventory record.
  const [inventorySnapshot, availabilitySnapshot] = await Promise.all([
    db.collection("inventory").where("productId", "==", product.id).get(),
    db.collection("productAvailability").where("productId", "==", product.id).get(),
  ]);

  const inventoryBySize = new Map();
  for (const doc of inventorySnapshot.docs) {
    const row = doc.data();
    if (!row.variantId || !row.sizeId) continue;
    const key = availabilityKey(row.variantId, row.sizeId);
    const stock = Number(row.stock);
    // Duplicate inventory rows are not expected; if encountered, do not sum
    // them because that could double-count units.
    inventoryBySize.set(key, {
      stock: Number.isFinite(stock) ? stock : null,
      sku: safeText(row.sku, 120),
    });
  }

  const projectionBySize = new Map();
  for (const doc of availabilitySnapshot.docs) {
    const row = doc.data();
    if (!row.variantId || !row.sizeId) continue;
    projectionBySize.set(availabilityKey(row.variantId, row.sizeId), row.available);
  }

  const variantsAreVisual = isImageOnlyVariantSet(product.variants);
  const masterVariant = variantsAreVisual ? product.variants[0] : null;

  function getExactStatus(size) {
    const key = availabilityKey(size.variantId, size.id);
    const inventory = inventoryBySize.get(key);
    if (inventory) {
      if (inventory.stock === null) {
        return { status: "unknown", available: null, orderable: false, source: "inventory" };
      }
      return statusFromStock(inventory.stock, "inventory");
    }
    if (projectionBySize.has(key)) {
      return statusFromProjection(projectionBySize.get(key));
    }
    return { status: "unknown", available: null, orderable: false, source: "inventory" };
  }

  function physicalStatus(size) {
    const ownKey = availabilityKey(size.variantId, size.id);
    const ownInventory = inventoryBySize.get(ownKey);

    // For products whose variants are explicitly named Imagen 1/2/3, a
    // positive stock record on a non-master image proves it is independent.
    // Otherwise use Imagen 1 as the shared stock master, per the agreed rule.
    if (variantsAreVisual && masterVariant && size.variantId !== masterVariant.id) {
      if (ownInventory && Number.isFinite(ownInventory.stock) && ownInventory.stock > 0) {
        return statusFromStock(ownInventory.stock, "inventory_variant");
      }
      const masterKey = availabilityKey(masterVariant.id, size.id);
      const masterInventory = inventoryBySize.get(masterKey);
      if (masterInventory) {
        if (masterInventory.stock === null) {
          return { status: "unknown", available: null, orderable: false, source: "inventory_master" };
        }
        return statusFromStock(masterInventory.stock, "inventory_master_shared");
      }
      if (projectionBySize.has(masterKey)) {
        const projected = statusFromProjection(projectionBySize.get(masterKey));
        return { ...projected, source: "productAvailability_master_shared" };
      }
      return { status: "unknown", available: null, orderable: false, source: "inventory_master" };
    }

    return getExactStatus(size);
  }

  const variants = product.variants.map((variant) => ({
    ...variant,
    sizes: variant.sizes.map((size) => setSizeAvailability(
      { ...size, variantId: variant.id, variantName: variant.name },
      physicalStatus({ ...size, variantId: variant.id })
    )),
  }));
  const sizes = product.sizes.map((size) => setSizeAvailability(size, physicalStatus(size)));
  const statuses = sizes.map((size) => size.availability.status);
  const availableCount = statuses.filter((status) => status === "available").length;
  const outOfStockCount = statuses.filter((status) => status === "out_of_stock").length;
  const unknownCount = statuses.filter((status) => status === "unknown").length;

  return {
    ...product,
    variants,
    sizes,
    availability: {
      status: availableCount > 0 ? "available" : unknownCount > 0 ? "unknown" : "out_of_stock",
      orderable: availableCount > 0,
      mode: "inventory",
      availableSizes: availableCount,
      outOfStockSizes: outOfStockCount,
      unknownSizes: unknownCount,
      source: "inventory_and_productAvailability",
      note: unknownCount > 0
        ? "No se pudo confirmar la disponibilidad de todas las tallas. No ofrecer como disponible una talla con estado unknown."
        : variantsAreVisual
          ? "Las variantes Imagen N comparten el stock de Imagen 1 salvo que otra variante tenga inventario positivo propio."
          : "Disponibilidad consultada desde inventario y la proyección pública de la tienda.",
    },
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return sendJson(res, 405, {
      error: "Method not allowed.",
    });
  }

  if (!isAuthorized(req)) {
    return sendJson(res, 401, {
      error: "Unauthorized.",
    });
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
    const catalog = await fetchPublishedProducts(db);
    const needle = normalizeSearch(search);

    const candidates = catalog.products
      .map(({ id, data }) => ({
        id,
        data,
        exactSku: containsExactSku(data, search),
        searchable: searchableText(data),
      }))
      .filter(
        (item) =>
          item.exactSku || item.searchable.includes(needle)
      )
      .sort((a, b) => Number(b.exactSku) - Number(a.exactSku));

    const products = await Promise.all(
      candidates.slice(0, MAX_RESULTS).map(async ({ id, data }) => {
        const product = publicProduct(data, id);
        return attachAvailability(db, product);
      })
    );

    return sendJson(res, 200, {
      query: search,
      count: products.length,
      products,
      catalogScanned: catalog.scanned,
      catalogScanLimit: MAX_CATALOG_SCAN,
      scanLimitReached: catalog.scanLimitReached,
      exactSkuMatch: candidates.some((item) => item.exactSku),
      note:
        "Prices are in GTQ. POD (made_to_order) is orderable without physical stock. Physical products use inventory stock and productAvailability; visual Imagen N variants use Imagen 1 as shared stock unless they have positive independent inventory.",
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
