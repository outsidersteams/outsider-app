
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

  if (!expected || !authorization.startsWith("Bearer ")) {
    return false;
  }

  const supplied = authorization.slice(7).trim();
  return Boolean(supplied) && supplied === expected;
}

function getMessageBody(req) {
  if (req.body && typeof req.body === "object") {
    return req.body;
  }

  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
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
    "para", "como", "tienen", "tiene", "quiero", "quisiera",
    "puedo", "pueden", "precio", "precios", "disponible",
    "disponibilidad", "hay", "una", "uno", "unas", "unos",
    "por", "favor", "hola", "buenas", "buenos", "dias",
    "tardes", "noches", "que", "con", "del", "las", "los",
    "este", "esta", "esto", "esa", "ese", "son", "seria",
    "me", "mi", "de", "la", "el", "en", "y", "o", "un",
    "al", "es", "si", "se", "lo", "le", "te", "venden",
    "vender", "comprar", "pedido", "hacer", "realizar",
    "cuanto", "cuesta", "cuestan", "talla"
  ]);

  const words = normalizeSearch(message)
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/);

  const unique = [];

  for (const word of words) {
    if (
      word.length < 3 ||
      stopWords.has(word) ||
      unique.includes(word)
    ) {
      continue;
    }

    unique.push(word);

    if (unique.length >= MAX_CATALOG_TERMS) {
      break;
    }
  }

  return unique;
}

function getBaseUrl(req) {
  const configured =
    process.env.OUTSIDER_APP_BASE_URL ||
    process.env.VERCEL_URL;

  if (configured) {
    const value = configured.trim().replace(/\/$/, "");

    return value.startsWith("http://") ||
      value.startsWith("https://")
      ? value
      : `https://${value}`;
  }

  const host =
    req.headers["x-forwarded-host"] ||
    req.headers.host;

  if (host && !String(host).includes("localhost")) {
    const protocol =
      req.headers["x-forwarded-proto"] || "https";

    return `${protocol}://${host}`;
  }

  return "";
}

async function findProducts(req, message) {
  const apiKey = process.env.OUTSIDER_AI_API_KEY?.trim();
  const baseUrl = getBaseUrl(req);

  if (!apiKey || !baseUrl) {
    return {
      products: [],
      catalogAvailable: false
    };
  }

  const terms = searchTerms(message);
  const collected = new Map();
  let successfulLookups = 0;

  for (const term of terms) {
    try {
      const url = new URL("/api/products", baseUrl);
      url.searchParams.set("q", term);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`
        },
        signal: AbortSignal.timeout(7000)
      });

      if (!response.ok) {
        continue;
      }

      const data = await response.json();

      if (!data || !Array.isArray(data.products)) {
        continue;
      }

      successfulLookups += 1;

      for (const product of data.products) {
        if (product && product.id) {
          collected.set(product.id, product);
        }
      }
    } catch (error) {
      console.error(
        "OUTSIDER agent catalog lookup failed:",
        error?.message || "Unknown error"
      );
    }
  }

  return {
    products: Array.from(collected.values())
      .slice(0, MAX_CATALOG_PRODUCTS),
    catalogAvailable: successfulLookups > 0
  };
}

function cleanHistory(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.slice(-MAX_HISTORY_ITEMS).flatMap((item) => {
    if (
      !item ||
      !["user", "assistant"].includes(item.role)
    ) {
      return [];
    }

    const content = safeText(
      item.content || item.message,
      1000
    );

    return content
      ? [{ role: item.role, content }]
      : [];
  });
}

function extractOutputText(data) {
  if (
    typeof data.output_text === "string" &&
    data.output_text.trim()
  ) {
    return data.output_text.trim();
  }

  const parts = [];

  for (
    const item of Array.isArray(data.output)
      ? data.output
      : []
  ) {
    for (
      const content of Array.isArray(item.content)
        ? item.content
        : []
    ) {
      if (
        content.type === "output_text" &&
        typeof content.text === "string"
      ) {
        parts.push(content.text);
      }
    }
  }

  return parts.join("\n").trim();
}

function parseAgentResult(text) {
  try {
    const parsed = JSON.parse(text);

    return {
      reply: safeText(parsed.reply, 3000) ||
        "¡Claro! Cuéntame qué producto estás buscando y te ayudo a encontrarlo.",
      needs_human: parsed.needs_human === true,
      reason: safeText(parsed.reason, 300) || null
    };
  } catch {
    return {
      reply: safeText(text, 3000) ||
        "¡Claro! Cuéntame qué producto estás buscando y te ayudo a encontrarlo.",
      needs_human: false,
      reason: null
    };
  }
}

function getEscalation(message) {
  const normalized = normalizeSearch(message);

  const rules = [
    {
      reason: "Solicitud explícita de atención humana",
      pattern: /\b(hablar|comunicarme|contactar|atenderme|quiero|necesito|prefiero)\b.{0,50}\b(persona|humano|humana|asesor|asesora|agente|representante|vendedor|vendedora)\b|\b(persona|humano|humana|asesor|asesora|agente|representante)\b.{0,35}\b(real|humano|humana)\b/
    },
    {
      reason: "Reclamo o inconformidad",
      pattern: /\b(reclamo|queja|estafa|estafaron|fraude|molesto|molesta|inconforme|mala experiencia|producto defectuoso|vino danado|llego danado)\b/
    },
    {
      reason: "Solicitud de devolución o reembolso",
      pattern: /\b(devolucion|devolver|reembolso|reembolsar|cambio por defecto|garantia)\b/
    },
    {
      reason: "Pago o problema de cobro",
      pattern: /\b(pague|pago realizado|problema con el pago|problema con mi pago|cobro|me cobraron|cobrado|transferencia realizada|deposito realizado|comprobante de pago|reversar pago|no se refleja mi pago)\b/
    },
    {
      reason: "Problema con un pedido existente",
      pattern: /\b(mi pedido|pedido existente|pedido no|no ha llegado|no llego|donde esta mi|seguimiento de mi pedido|pedido equivocado|pedido incorrecto|pedido atrasado|pedido retrasado)\b/
    }
  ];

  return rules.find((rule) =>
    rule.pattern.test(normalized)
  ) || null;
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return sendJson(res, 405, {
      error: "Method not allowed."
    });
  }

  if (!isAuthorized(req)) {
    return sendJson(res, 401, {
      error: "Unauthorized."
    });
  }

  const body = getMessageBody(req);
  const rawMessage =
    typeof body.message === "string"
      ? body.message.trim()
      : "";

  if (!rawMessage) {
    return sendJson(res, 400, {
      error: "A message is required."
    });
  }

  if (rawMessage.length > MAX_MESSAGE_LENGTH) {
    return sendJson(res, 400, {
      error: `Message must not exceed ${MAX_MESSAGE_LENGTH} characters.`
    });
  }

  const message = rawMessage;
  const company = safeText(
    body.company || "OUTSIDER",
    40
  ).toUpperCase();

  if (company !== "OUTSIDER") {
    return sendJson(res, 400, {
      error: "This agent is currently configured for OUTSIDER only."
    });
  }

  const escalation = getEscalation(message);

  if (escalation) {
    return sendJson(res, 200, {
      company: "OUTSIDER",
      reply: "Claro, este caso necesita que nuestro equipo lo revise directamente. No puedo confirmar una gestión desde este chat.",
      needs_human: true,
      reason: escalation.reason,
      model: OPENAI_MODEL,
      catalog_matches: 0,
      catalog_available: false
    });
  }

  const openAiKey = process.env.OPENAI_API_KEY?.trim();

  if (!openAiKey) {
    return sendJson(res, 503, {
      error: "OpenAI is not configured for this deployment."
    });
  }

  try {
    // Search the catalog automatically; never ask the customer
    // for permission to perform a lookup the system can do.
    const [history, catalog] = [
      cleanHistory(body.history),
      await findProducts(req, message)
    ];

    const instructions = [
      "IDENTIDAD Y PERSONALIDAD",
      "Eres el asesor comercial digital de OUTSIDER, una tienda de streetwear en Guatemala.",
      "Atiendes como un vendedor real que conoce la tienda, los productos y la cultura streetwear.",
      "Tu tono es cercano y profesional. Usa español natural y emojis moderados solo cuando encajen.",
      "No suenes como un chatbot, un formulario, un manual ni un anuncio genérico.",
      "",
      "OBJETIVO COMERCIAL",
      "Ayuda al cliente a encontrar un producto que encaje con sus gustos y facilita la compra cuando tenga intención de comprar.",
      "Persuade con recomendaciones relevantes, beneficios reales y buena atención. Nunca presiones ni manipules.",
      "No intentes cerrar una venta en todos los mensajes. Adapta tu estrategia a la intención del cliente.",
      "",
      "INICIATIVA Y AUTONOMÍA",
      "El sistema ya consulta el catálogo automáticamente antes de generar tu respuesta.",
      "No preguntes al cliente si quiere que consultes el catálogo, revises la disponibilidad o realices una comprobación que el sistema ya puede hacer.",
      "Si tienes información suficiente, responde directamente y avanza al siguiente paso comercial.",
      "Pregunta solo por datos que realmente necesites del cliente, como una talla para continuar una compra.",
      "No repitas preguntas que el cliente ya respondió en la conversación.",
      "No afirmes que has ejecutado acciones externas que no están disponibles.",
      "",
      "ESTILO DE RESPUESTA",
      "Normalmente responde en una a tres frases, salvo que el cliente necesite más detalle.",
      "Responde primero a la pregunta concreta del cliente.",
      "Incluye solo la información relevante para ese momento. No recites todas las características del producto sin necesidad.",
      "No menciones el modelo de fabricación POD en todas las respuestas; explícalo cuando ayude a aclarar el proceso, una solicitud de fotos o una pregunta de entrega.",
      "No termines siempre con una pregunta. Hazlo solo si ayuda a elegir o avanzar.",
      "No uses frases robóticas como 'no quiero darte información incorrecta', 'si quieres puedo revisarlo' o '¿quieres que lo consulte?' cuando el sistema ya realizó la consulta.",
      "",
      "RECOMENDACIÓN Y PERSUASIÓN",
      "Si el cliente está explorando, despierta interés y descubre sus preferencias con una pregunta útil.",
      "Si compara productos, recomienda opciones basadas en sus preferencias y en datos reales del catálogo.",
      "Puedes sugerir espontáneamente otros modelos pertinentes cuando ayuden al cliente, sin desviar innecesariamente la conversación.",
      "Si el cliente expresa una objeción, reconoce su preocupación y ofrece una respuesta útil o una alternativa real.",
      "Si está listo para comprar, facilita el siguiente paso y solicita solo los datos necesarios.",
      "Nunca inventes popularidad, testimonios, escasez, descuentos, calidad, beneficios o urgencia.",
      "",
      "PRECIOS",
      "Los precios del catálogo están expresados en quetzales guatemaltecos (GTQ).",
      "Si preguntan el precio, responde directamente con el precio verificado.",
      "No ocultes ni retrases artificialmente el precio para persuadir.",
      "No inventes promociones, envío gratis, cargos, descuentos ni políticas.",
      "",
      "POD Y FOTOGRAFÍAS",
      "Los productos cuyo fulfillment.type sea 'made_to_order' se trabajan bajo pedido y no deben describirse como stock físico.",
      "Explica este proceso con naturalidad cuando sea relevante, sin disculpas automáticas ni detalles operativos innecesarios.",
      "Si solicitan más fotos, comparte solo recursos que realmente estén disponibles. Puedes orientar a las redes de OUTSIDER si son una alternativa real, pero no afirmes haber enviado fotos si no lo hiciste.",
      "",
      "DISPONIBILIDAD: REGLAS OBLIGATORIAS",
      "El catálogo proporcionado es la fuente de verdad disponible para productos, precios, variantes, tallas y disponibilidad.",
      "Para productos POD con availability.status 'available' y orderable true, puedes decir que se trabajan bajo pedido; no los describas como unidades físicas en stock.",
      "Para productos físicos, afirma que hay stock solo cuando el estado correspondiente sea 'available' y orderable sea true.",
      "Si el estado es 'out_of_stock', informa directamente que está agotado por el momento y, si resulta útil, ofrece una alternativa del catálogo.",
      "Si el estado es 'unknown', no digas que está agotado ni que está disponible. Explica con naturalidad que el modelo aparece en el catálogo pero que por ahora no figura con disponibilidad confirmada. Puedes recomendar alternativas reales.",
      "No le pidas al cliente permiso para comprobar el inventario: la consulta al catálogo ya se ha realizado automáticamente.",
      "Si catalog_available es false, la consulta no pudo confirmarse técnicamente. No afirmes que revisaste correctamente el inventario ni inventes un resultado.",
      "No inventes tallas, colores, modelos, precios ni existencias cuando no aparezcan en los datos proporcionados.",
      "",
      "PEDIDOS Y LÍMITES",
      "Puedes asesorar y recopilar intención de compra, pero no puedes crear pedidos, cobrar, reservar productos ni confirmar una compra con esta API.",
      "No digas que una compra está completada ni que una reserva quedó hecha.",
      "Los reclamos, devoluciones, problemas de pago, problemas con pedidos existentes y solicitudes explícitas de atención humana requieren intervención humana.",
      "Nunca afirmes que una persona ya fue notificada o que la conversación fue transferida si no existe una integración que lo haya realizado.",
      "",
      "FORMATO DE SALIDA",
      "Devuelve exclusivamente un objeto JSON válido con las claves: reply (string), needs_human (boolean), reason (string o null).",
      "reason debe explicar brevemente el motivo de escalamiento o ser null.",
      "",
      "DATOS ACTUALES DEL CATÁLOGO",
      JSON.stringify(catalog.products),
      "",
      `¿Al menos una consulta válida al catálogo respondió?: ${catalog.catalogAvailable ? "sí" : "no"}.`
    ].join("\n");

    const input = [
      ...history,
      {
        role: "user",
        content: message
      }
    ];

    const response = await fetch(
      "https://api.openai.com/v1/responses",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: OPENAI_MODEL,
          instructions,
          input,
          max_output_tokens: 500,
          store: false
        }),
        signal: AbortSignal.timeout(25000)
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(
        "OpenAI agent request failed:",
        response.status,
        data?.error?.code ||
          data?.error?.type ||
          "API error"
      );

      return sendJson(
        res,
        response.status === 429 ? 429 : 502,
        {
          error: response.status === 429
            ? "AI rate limit or quota reached."
            : "AI response unavailable."
        }
      );
    }

    const outputText = extractOutputText(data);

    if (!outputText) {
      return sendJson(res, 502, {
        error: "OpenAI returned an empty response."
      });
    }

    const result = parseAgentResult(outputText);

    return sendJson(res, 200, {
      company: "OUTSIDER",
      ...result,
      model: OPENAI_MODEL,
      catalog_matches: catalog.products.length,
      catalog_available: catalog.catalogAvailable
    });
  } catch (error) {
    console.error(
      "OUTSIDER agent failed:",
      error?.message || "Unknown server error"
    );

    return sendJson(res, 500, {
      error: "Agent request failed."
    });
  }
};
