const MAX_MESSAGE_LENGTH = 2000;
const MAX_HISTORY_ITEMS = 8;
const MAX_CATALOG_TERMS = 5;
const MAX_CATALOG_PRODUCTS = 12;
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4.1-mini";

function sendJson(res, status, payload) {
  return res
    .status(status)
    .setHeader("Content-Type", "application/json; charset=utf-8")
    .setHeader("Cache-Control", "private, no-store")
    .setHeader("X-Content-Type-Options", "nosniff")
    .json(payload);
}

function safeText(value, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function isAuthorized(req) {
  const expected = process.env.OUTSIDER_AI_API_KEY?.trim();
  const authorization = req.headers.authorization || "";
  if (!expected || !authorization.startsWith("Bearer ")) return false;
  const supplied = authorization.slice(7).trim();
  return Boolean(supplied) && supplied === expected;
}

function getMessageBody(req) {
  if (req.body && typeof req.body === "object") return req.body;
  if (typeof req.body === "string") {
    try { return JSON.parse(req.body); } catch { return {}; }
  }
  return {};
}

function normalizeSearch(value) {
  return safeText(value, 3000)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("es");
}

function searchTerms(message) {
  const stopWords = new Set([
    "para", "como", "tienen", "tiene", "quiero", "quisiera", "puedo",
    "pueden", "precio", "precios", "disponible", "disponibilidad", "hay",
    "una", "uno", "unas", "unos", "por", "favor", "hola", "buenas",
    "buenos", "dias", "tardes", "noches", "que", "con", "del", "las",
    "los", "una", "este", "esta", "esto", "esa", "ese", "son", "seria",
    "me", "mi", "de", "la", "el", "en", "y", "o", "un", "al", "es",
    "si", "se", "lo", "le", "te", "hay", "venden", "vender", "comprar",
    "pedido", "hacer", "realizar", "cuanto", "cuesta", "cuestan", "talla"
  ]);
  const words = normalizeSearch(message).replace(/[^a-z0-9\s-]/g, " ").split(/\s+/);
  const unique = [];
  for (const word of words) {
    if (word.length < 3 || stopWords.has(word) || unique.includes(word)) continue;
    unique.push(word);
    if (unique.length >= MAX_CATALOG_TERMS) break;
  }
  return unique;
}

function getBaseUrl(req) {
  const configured = process.env.OUTSIDER_APP_BASE_URL || process.env.VERCEL_URL;
  if (configured) {
    const value = configured.trim().replace(/\/$/, "");
    return value.startsWith("http://") || value.startsWith("https://")
      ? value
      : `https://${value}`;
  }
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  if (host && !String(host).includes("localhost")) {
    const protocol = req.headers["x-forwarded-proto"] || "https";
    return `${protocol}://${host}`;
  }
  return "";
}

async function findProducts(req, message) {
  const apiKey = process.env.OUTSIDER_AI_API_KEY?.trim();
  const baseUrl = getBaseUrl(req);
  if (!apiKey || !baseUrl) {
    return { products: [], catalogAvailable: false };
  }

  const terms = searchTerms(message);
  const collected = new Map();

  for (const term of terms) {
    try {
      const url = new URL("/api/products", baseUrl);
      url.searchParams.set("q", term);
      const response = await fetch(url, {
        method: "GET",
        headers: { Authorization: `Bearer ${apiKey}` },
        signal: AbortSignal.timeout(7000),
      });
      if (!response.ok) continue;
      const data = await response.json();
      for (const product of Array.isArray(data.products) ? data.products : []) {
        if (product && product.id) collected.set(product.id, product);
      }
    } catch (error) {
      console.error("OUTSIDER agent catalog lookup failed:", error?.message || "Unknown error");
    }
  }

  return {
    products: Array.from(collected.values()).slice(0, MAX_CATALOG_PRODUCTS),
    catalogAvailable: terms.length > 0,
  };
}

function cleanHistory(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(-MAX_HISTORY_ITEMS).flatMap((item) => {
    if (!item || !["user", "assistant"].includes(item.role)) return [];
    const content = safeText(item.content || item.message, 1000);
    return content ? [{ role: item.role, content }] : [];
  });
}

function extractOutputText(data) {
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const parts = [];
  for (const item of Array.isArray(data.output) ? data.output : []) {
    for (const content of Array.isArray(item.content) ? item.content : []) {
      if (content.type === "output_text" && typeof content.text === "string") parts.push(content.text);
    }
  }
  return parts.join("\n").trim();
}

function parseAgentResult(text) {
  try {
    const parsed = JSON.parse(text);
    return {
      reply: safeText(parsed.reply, 3000) || "¿Me puedes dar un poco más de detalle para ayudarte?",
      needs_human: parsed.needs_human === true,
      reason: safeText(parsed.reason, 300) || null,
    };
  } catch {
    return {
      reply: safeText(text, 3000) || "En este momento no pude preparar una respuesta. ¿Te puedo ayudar con algo más?",
      needs_human: false,
      reason: null,
    };
  }
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return sendJson(res, 405, { error: "Method not allowed." });
  }

  if (!isAuthorized(req)) {
    return sendJson(res, 401, { error: "Unauthorized." });
  }

  const body = getMessageBody(req);
  const message = safeText(body.message, MAX_MESSAGE_LENGTH);
  const company = safeText(body.company || "OUTSIDER", 40).toUpperCase();

  if (!message) return sendJson(res, 400, { error: "A message is required." });
  if (message.length > MAX_MESSAGE_LENGTH) {
    return sendJson(res, 400, { error: `Message must not exceed ${MAX_MESSAGE_LENGTH} characters.` });
  }
  if (company !== "OUTSIDER") {
    return sendJson(res, 400, { error: "This agent is currently configured for OUTSIDER only." });
  }

  const openAiKey = process.env.OPENAI_API_KEY?.trim();
  if (!openAiKey) return sendJson(res, 503, { error: "OpenAI is not configured for this deployment." });

  try {
    const catalog = await findProducts(req, message);
    const history = cleanHistory(body.history);
    const instructions = [
      "Eres el asistente de ventas oficial de OUTSIDER, una tienda de streetwear en Guatemala.",
      "Responde en español natural, amable, breve y orientado a ayudar a comprar sin presionar.",
      "Usa únicamente la información del catálogo proporcionado para afirmar nombres, precios, tallas o disponibilidad.",
      "Los precios del catálogo están en quetzales guatemaltecos (GTQ). No inventes precios, descuentos, envíos, tiempos de entrega ni políticas.",
      "Si availability.status es 'available' y orderable es true, puedes decir que figura disponible. Si es 'out_of_stock', informa que no hay disponibilidad. Si es 'unknown' o no hay datos, di que necesitas confirmarlo; no afirmes que hay stock.",
      "Los productos con fulfillment.type 'made_to_order' se fabrican bajo pedido según el catálogo; no los describas como stock físico.",
      "Si no encuentras el producto en los resultados, pide el nombre, modelo o una descripción más específica. No afirmes que la tienda no lo vende solo porque no apareció en la búsqueda.",
      "Puedes orientar y recopilar intención de compra, pero no puedes crear pedidos, cobrar, confirmar compras ni prometer que una venta quedó completada.",
      "Solicita intervención humana si el cliente pide una persona, hay reclamo, devolución, pago, excepción de precio, pregunta fuera de los datos disponibles, problema con un pedido existente o cualquier situación sensible/ambigua.",
      "Devuelve exclusivamente un objeto JSON válido con estas claves: reply (string), needs_human (boolean), reason (string o null). reason debe explicar brevemente el motivo de escalamiento o ser null.",
    ].join("\n");

    const input = [
      { role: "user", content: `Mensaje actual del cliente:\n${message}` },
      ...history,
      {
        role: "user",
        content: `Datos de catálogo consultados (JSON; pueden estar incompletos):\n${JSON.stringify(catalog.products)}\n\n¿La búsqueda de catálogo se pudo intentar?: ${catalog.catalogAvailable ? "sí" : "no"}. Responde al cliente siguiendo las instrucciones.`,
      },
    ];

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        instructions,
        input,
        max_output_tokens: 500,
        store: false,
      }),
      signal: AbortSignal.timeout(25000),
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      console.error("OpenAI agent request failed:", response.status, data?.error?.code || data?.error?.type || "API error");
      return sendJson(res, response.status === 429 ? 429 : 502, {
        error: response.status === 429 ? "AI rate limit or quota reached." : "AI response unavailable.",
      });
    }

    const outputText = extractOutputText(data);
    if (!outputText) return sendJson(res, 502, { error: "OpenAI returned an empty response." });

    const result = parseAgentResult(outputText);
    return sendJson(res, 200, {
      company: "OUTSIDER",
      ...result,
      model: OPENAI_MODEL,
      catalog_matches: catalog.products.length,
      catalog_available: catalog.catalogAvailable,
    });
  } catch (error) {
    console.error("OUTSIDER agent failed:", error?.message || "Unknown server error");
    return sendJson(res, 500, { error: "Agent request failed." });
  }
};
