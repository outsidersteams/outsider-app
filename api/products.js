const admin = require("firebase-admin");

const MAX_QUERY_LENGTH = 120;
const MAX_RESULTS = 8;

function sendJson(res, status, payload) {
  return res.status(status).setHeader("Content-Type", "application/json; charset=utf-8").json(payload);
}

function safeText(value, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function initializeFirebaseAdmin() {
  if (admin.apps.length) return admin.app();

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing Firebase Admin environment variables.");
  }

  return admin.initializeApp({
    credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
    projectId,
  });
}

function isAuthorized(req) {
  const expected = process.env.OUTSIDER_AI_API_KEY;
  const supplied = req.headers.authorization || "";
  return Boolean(expected) && supplied === `Bearer ${expected}`;
}

function publicProduct(product, id) {
  // Allowlist only customer-facing fields. Never return internal cost,
  // supplier, inventory documents, analytics, or administrative metadata.
  const variants = Array.isArray(product.variants)
    ? product.variants.slice(0, 30).map((variant) => ({
        id: safeText(variant?.id, 100),
        name: safeText(variant?.name, 120),
        price: Number.isFinite(Number(variant?.price)) ? Number(variant.price) : null,
        sizes: Array.isArray(variant?.sizes)
          ? variant.sizes.slice(0, 30).map((size) => ({
              id: safeText(size?.id, 100),
              name: safeText(size?.name || size?.label, 80),
            }))
          : [],
      }))
    : [];

  return {
    id,
    name: safeText(product.name, 160),
    description: safeText(product.description, 1200),
    category: safeText(product.categoryName || product.category, 120),
    price: Number.isFinite(Number(product.price)) ? Number(product.price) : null,
    variants,
    images: Array.isArray(product.images)
      ? product.images.slice(0, 5).map((image) =>
          typeof image === "string" ? safeText(image, 1000) : safeText(image?.url, 1000)
        ).filter(Boolean)
      : [],
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
    return sendJson(res, 400, { error: "Query parameter q must contain at least 2 characters." });
  }

  try {
    initializeFirebaseAdmin();
    const db = admin.firestore();

    // Firestore rules are bypassed by Admin SDK, so the public-catalog
    // constraints are enforced explicitly here.
    const snapshot = await db.collection("products")
      .where("active", "==", true)
      .where("publishedActive.web", "==", true)
      .limit(100)
      .get();

    const needle = search.toLocaleLowerCase("es");
    const products = snapshot.docs
      .map((doc) => ({ id: doc.id, data: doc.data() }))
      .map(({ id, data }) => ({ id, data, searchable: [
        data.name,
        data.description,
        data.categoryName,
        data.category,
        ...(Array.isArray(data.tags) ? data.tags : []),
        ...(Array.isArray(data.variants) ? data.variants.flatMap((v) => [v?.name, ...(Array.isArray(v?.sizes) ? v.sizes.map((s) => s?.name || s?.label) : [])]) : []),
      ].filter(Boolean).join(" ").toLocaleLowerCase("es") }))
      .filter((item) => item.searchable.includes(needle))
      .slice(0, MAX_RESULTS)
      .map(({ id, data }) => publicProduct(data, id));

    return sendJson(res, 200, {
      query: search,
      count: products.length,
      products,
      note: "Catalog search only. Availability and order status must be verified separately.",
    });
  } catch (error) {
    console.error("OUTSIDER AI product lookup failed:", error?.message || error);
    return sendJson(res, 500, { error: "Product lookup unavailable." });
  }
};
