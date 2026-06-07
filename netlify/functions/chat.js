/* global process */

const SYSTEM_PROMPT = `Eres NutriAsistente, un asistente de APOYO EDUCATIVO para personas con Nutrición Parenteral (NP) domiciliaria en Costa Rica y sus cuidadores. Fuiste creado con base en conocimiento especializado en biotecnología y nutrición parenteral clínica.

TU MISIÓN: Acompañar al paciente y cuidador con información clara, cálida y sin tecnicismos innecesarios. NUNCA reemplazas al equipo médico. Toda información que das es educativa y orientativa, no constituye prescripción ni diagnóstico.

LO QUE PUEDES HACER:
• Explicar qué contiene la bolsa de NP y de dónde vienen sus componentes (los aminoácidos se producen por fermentación microbiana con bacterias como Corynebacterium glutamicum; los lípidos pueden venir de soja, oliva o microalgas ricas en omega-3)
• Orientar sobre signos de alarma del catéter y cuándo contactar al equipo médico inmediatamente
• Ayudar con la logística diaria: temperatura, tiempos de infusión, almacenamiento, caducidad (5 días máximo)
• Explicar el cuidado del catéter con lenguaje simple y preciso
• Responder preguntas sobre la vida diaria con NP domiciliaria
• Ayudar a preparar preguntas para la próxima consulta médica
• Informar que en Costa Rica existe el Recurso de Amparo ante la Sala Constitucional (Sala IV) como mecanismo legal cuando la CCSS niega acceso al tratamiento necesario — sin dar asesoría legal directa
• Mencionar que ACONEP (Asociación Costarricense de Nutrición Enteral y Parenteral) es la entidad de referencia nacional en nutrición clínica

LO QUE NUNCA HARÁS:
• Dar diagnósticos médicos
• Cambiar o sugerir modificaciones a la prescripción de NP
• Recomendar dosis de medicamentos
• Reemplazar la indicación del equipo de soporte nutricional
• Dar información que pueda retrasar una atención de emergencia
• Solicitar o almacenar datos identificables como nombre completo, cédula, expediente, teléfono, dirección o ubicación exacta

SEÑALES DE ALERTA QUE REQUIEREN CONTACTO MÉDICO INMEDIATO:
Si el usuario describe alguno de estos síntomas, díselo claramente y con urgencia:
- Fiebre mayor de 38°C durante o después de la infusión
- Enrojecimiento, calor, hinchazón o secreción en el sitio del catéter
- Escalofríos intensos durante la infusión
- Dificultad para respirar o dolor en el pecho durante la infusión
- Hinchazón del brazo o cuello del lado del catéter
- Bolsa con aspecto anormal: color diferente, capas separadas visibles, partículas flotantes

CONTEXTO COSTA RICA:
Los pacientes de la CCSS tienen derecho al soporte nutricional según la Norma Nacional de Soporte Nutricional. Las barreras de acceso pueden enfrentarse con el apoyo de ACONEP o mediante Recurso de Amparo ante la Sala IV.

TONO Y ESTILO:
• Use "usted" siempre (más formal y respetuoso para el contexto médico costarricense)
• Respuestas claras y concisas: máximo 3-4 párrafos cortos
• Si algo es urgente, mencionarlo al inicio en MAYÚSCULAS o con énfasis
• Si no sabe algo, decirlo honestamente y sugerir consultar con el equipo médico
• Siempre cerrar mensajes sobre síntomas con: "Si tiene dudas, su equipo médico es quien mejor puede orientarle."
• Ser empático y reconocer que vivir con NP domiciliaria es un reto importante para el paciente y la familia`

const MAX_MESSAGES = 3
const MAX_MESSAGE_LENGTH = 800
const RATE_LIMIT_MAX = 20
const RATE_LIMIT_WINDOW_MS = 60_000
const rateLimitMap = new Map()

const DEFAULT_ALLOWED_ORIGINS = [
  'https://nutrividabio.netlify.app',
  'https://www.nutrividabio.netlify.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]
const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions'
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((value) => value.trim()).filter(Boolean)
  : DEFAULT_ALLOWED_ORIGINS
const ALLOWED_ROLES = new Set(['user', 'assistant'])

function getClientIp(headers = {}) {
  const forwarded = headers['x-forwarded-for'] || headers['x-nf-client-connection-ip'] || ''
  return forwarded.split(',')[0].trim() || headers['client-ip'] || ''
}

function isRateLimited(ip) {
  if (!ip) return false
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }
  entry.count++
  if (entry.count > RATE_LIMIT_MAX) return true
  // Prune stale entries every 100 calls to avoid unbounded growth
  if (rateLimitMap.size > 500) {
    for (const [k, v] of rateLimitMap) {
      if (now > v.resetAt) rateLimitMap.delete(k)
    }
  }
  return false
}

function normalizeOrigin(value) {
  if (!value || typeof value !== 'string') return ''
  try {
    return new URL(value).origin
  } catch {
    return ''
  }
}

function getRequestOrigin(headers = {}) {
  return normalizeOrigin(headers.origin || headers.referer || '')
}

function isOriginAllowed(origin) {
  return ALLOWED_ORIGINS.includes(origin)
}

function createResponse(statusCode, payload, origin) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'false',
    Vary: 'Origin',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Cache-Control': 'no-store',
  }

  if (origin) {
    headers['Access-Control-Allow-Origin'] = origin
  }

  return {
    statusCode,
    headers,
    body: JSON.stringify(payload),
  }
}

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return []

  return messages
    .filter(message => ALLOWED_ROLES.has(message?.role) && typeof message?.content === 'string')
    .slice(-MAX_MESSAGES)
    .map(message => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH),
    }))
    .filter(message => message.content.length > 0)
}

function containsSensitiveData(text) {
  if (typeof text !== 'string') return false
  const normalized = text.replace(/\s+/g, ' ')
  // Long digit sequences (national IDs, phone numbers)
  if (/\d{7,}/.test(normalized)) return true
  // Costa Rica phone format (xxxx-xxxx)
  if (/\b\d{4}[-\s]\d{4}\b/.test(normalized)) return true
  // Email addresses
  if (/\b[\w.+-]+@[\w-]+\.\w{2,}\b/.test(normalized)) return true
  // Explicit sensitive keywords (case-insensitive, Spanish)
  if (/c[eé]dula|identificaci[oó]n|expediente|tel[eé]fono|direcci[oó]n|ubicaci[oó]n|correo\s+electr[oó]nico|contrase[nñ]a|password|n[uú]mero\s+de\s+cuenta|seguro\s+social/i.test(normalized)) return true
  return false
}

export const handler = async (event) => {
  const origin = getRequestOrigin(event.headers || {})
  const corsOrigin = isOriginAllowed(origin) ? origin : ''

  if (event.httpMethod === 'OPTIONS') {
    if (!corsOrigin) {
      return createResponse(403, { message: 'Origen no autorizado' }, '')
    }
    return createResponse(200, { ok: true }, corsOrigin)
  }

  if (event.httpMethod !== 'POST') {
    return createResponse(405, { message: 'Method Not Allowed' }, corsOrigin)
  }

  if (!corsOrigin) {
    console.warn('Blocked request from unauthorized origin:', origin)
    return createResponse(403, {
      message: 'Origen no autorizado. Esta función solo puede usarse desde el dominio oficial de NutriVida Biotech.',
    }, '')
  }

  const clientIp = getClientIp(event.headers || {})
  if (isRateLimited(clientIp)) {
    console.warn('Rate limit exceeded for IP:', clientIp)
    return createResponse(429, {
      message: 'Ha realizado demasiadas consultas en poco tiempo. Por favor espere un minuto antes de continuar.',
    }, corsOrigin)
  }

  if (!process.env.OPENROUTER_API_KEY) {
    console.error('Missing OPENROUTER_API_KEY')
    return createResponse(503, {
      message: 'El asistente no está configurado todavía. Para consultas urgentes, contacte a su equipo médico directamente.',
    }, corsOrigin)
  }

  try {
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body
    const safeMessages = sanitizeMessages(body?.messages)

    if (safeMessages.length === 0) {
      return createResponse(400, {
        message: 'Escriba una pregunta breve, sin datos personales, para que pueda orientarle.',
      }, corsOrigin)
    }

    if (safeMessages.some(message => containsSensitiveData(message.content))) {
      return createResponse(400, {
        message: 'No se permiten datos personales en las consultas. Por favor elimine cédula, teléfono, dirección, expediente o identificaciones.',
      }, corsOrigin)
    }

    const MODELS = [
      'meta-llama/llama-3.3-70b-instruct:free',
      'z-ai/glm-4.5-air:free',
    ]

    const callOpenRouter = async (model) => {
      return fetch(OPENROUTER_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...safeMessages,
          ],
          max_tokens: 450,
          temperature: 0.4,
          stream: false,
        }),
      })
    }

    let response = null
    let lastErrorText = ''

    for (const model of MODELS) {
      response = await callOpenRouter(model)
      if (response.ok) break
      lastErrorText = await response.text().catch(() => `Status ${response.status}`)
      console.warn(`Model ${model} failed (${response.status}):`, lastErrorText)
      response = null
    }

    if (!response?.ok) {
      throw new Error('Modelo no disponible')
    }

    const data = await response.json()
    const message = data?.choices?.[0]?.message?.content?.trim()
      || data?.error?.message
      || 'Lo siento, no pude procesar su consulta. Por favor intente de nuevo.'

    return createResponse(200, { message }, corsOrigin)
  } catch (error) {
    console.error('Function error:', error)
    return createResponse(500, {
      message: 'El asistente no está disponible en este momento. Para consultas urgentes, contacte a su equipo médico directamente.',
    }, corsOrigin)
  }
}
