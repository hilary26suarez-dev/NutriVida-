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

const MAX_MESSAGES        = 3
const MAX_MESSAGE_LENGTH  = 800
const RATE_LIMIT_MAX      = 20
const RATE_LIMIT_WINDOW_MS = 60_000
const rateLimitMap        = new Map()

const DEFAULT_ALLOWED_ORIGINS = [
  'https://nutri-vida-khaki.vercel.app',
  'https://www.nutri-vida-khaki.vercel.app',
  'https://nutrividabio.netlify.app',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]

const OPENROUTER_API_URL = process.env.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions'

// Extra origins from env var are ADDED to the defaults, not a replacement
const extraOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(v => v.trim()).filter(Boolean)
  : []
const ALLOWED_ORIGINS = [...new Set([...DEFAULT_ALLOWED_ORIGINS, ...extraOrigins])]

const ALLOWED_ROLES = new Set(['user', 'assistant'])

function getClientIp(headers = {}) {
  // Vercel-specific headers first, then standard x-forwarded-for
  const forwarded = headers['x-real-ip']
    || headers['x-vercel-forwarded-for']
    || headers['x-forwarded-for']
    || ''
  return forwarded.split(',')[0].trim() || ''
}

function isRateLimited(ip) {
  if (!ip) return false
  const now   = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return false
  }
  entry.count++
  if (entry.count > RATE_LIMIT_MAX) return true
  if (rateLimitMap.size > 500) {
    for (const [k, v] of rateLimitMap) {
      if (now > v.resetAt) rateLimitMap.delete(k)
    }
  }
  return false
}

function normalizeOrigin(value) {
  if (!value || typeof value !== 'string') return ''
  try { return new URL(value).origin } catch { return '' }
}

function isOriginAllowed(origin) {
  if (ALLOWED_ORIGINS.includes(origin)) return true
  // Accept any Vercel preview deployment of this project
  if (/^https:\/\/nutri-vida[a-z0-9-]*\.vercel\.app$/.test(origin)) return true
  return false
}

function sanitizeMessages(messages) {
  if (!Array.isArray(messages)) return []
  return messages
    .filter(m => ALLOWED_ROLES.has(m?.role) && typeof m?.content === 'string')
    .slice(-MAX_MESSAGES)
    .map(m => ({ role: m.role, content: m.content.trim().slice(0, MAX_MESSAGE_LENGTH) }))
    .filter(m => m.content.length > 0)
}

function containsSensitiveData(text) {
  if (typeof text !== 'string') return false
  const n = text.replace(/\s+/g, ' ')
  if (/\d{7,}/.test(n)) return true
  if (/\b\d{4}[-\s]\d{4}\b/.test(n)) return true
  if (/\b[\w.+-]+@[\w-]+\.\w{2,}\b/.test(n)) return true
  if (/c[eé]dula|identificaci[oó]n|expediente|tel[eé]fono|direcci[oó]n|ubicaci[oó]n|correo\s+electr[oó]nico|contrase[nñ]a|password|n[uú]mero\s+de\s+cuenta|seguro\s+social/i.test(n)) return true
  return false
}

function setSecurityHeaders(res, corsOrigin) {
  if (corsOrigin) res.setHeader('Access-Control-Allow-Origin', corsOrigin)
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Credentials', 'false')
  res.setHeader('Vary', 'Origin')
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Cache-Control', 'no-store')
}

// Vercel Node.js serverless function handler
export default async function handler(req, res) {
  const origin    = normalizeOrigin(req.headers.origin || req.headers.referer || '')
  const corsOrigin = isOriginAllowed(origin) ? origin : ''

  if (req.method === 'OPTIONS') {
    if (!corsOrigin) { res.status(403).json({ message: 'Origen no autorizado' }); return }
    setSecurityHeaders(res, corsOrigin)
    res.status(200).json({ ok: true })
    return
  }

  if (req.method !== 'POST') {
    setSecurityHeaders(res, corsOrigin)
    res.status(405).json({ message: 'Method Not Allowed' })
    return
  }

  if (!corsOrigin) {
    console.warn('Blocked origin:', JSON.stringify(origin), '| Allowed:', ALLOWED_ORIGINS.join(', '))
    res.status(403).json({ message: 'Origen no autorizado. Esta función solo puede usarse desde el dominio oficial de NutriVida Biotech.' })
    return
  }

  setSecurityHeaders(res, corsOrigin)

  const clientIp = getClientIp(req.headers)
  if (isRateLimited(clientIp)) {
    console.warn('Rate limit exceeded for IP:', clientIp)
    res.setHeader('Retry-After', '60')
    res.status(429).json({ message: 'Ha realizado demasiadas consultas en poco tiempo. Por favor espere un minuto antes de continuar.' })
    return
  }

  if (!process.env.OPENROUTER_API_KEY) {
    console.error('Missing OPENROUTER_API_KEY')
    res.status(503).json({ message: 'El asistente no está configurado todavía. Para consultas urgentes, contacte a su equipo médico directamente.' })
    return
  }

  try {
    // Reject oversized payloads (Vercel auto-parses but content-length is still readable)
    const MAX_BODY_BYTES = 4096
    const contentLength = parseInt(req.headers['content-length'] || '0', 10)
    if (contentLength > MAX_BODY_BYTES) {
      res.status(413).json({ message: 'La solicitud excede el tamaño permitido.' })
      return
    }
    // Vercel auto-parses JSON body; guard against string body just in case
    const body        = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const safeMessages = sanitizeMessages(body?.messages)

    if (safeMessages.length === 0) {
      res.status(400).json({ message: 'Escriba una pregunta breve, sin datos personales, para que pueda orientarle.' })
      return
    }

    if (safeMessages.some(m => containsSensitiveData(m.content))) {
      res.status(400).json({ message: 'No se permiten datos personales en las consultas. Por favor elimine cédula, teléfono, dirección, expediente o identificaciones.' })
      return
    }

    const MODELS = [
      'deepseek/deepseek-chat-v3-0324:free',
      'google/gemini-2.0-flash-exp:free',
      'meta-llama/llama-3.3-70b-instruct:free',
      'qwen/qwen3-8b:free',
      'z-ai/glm-4.5-air:free',
    ]

    const callOpenRouter = async (model) => fetch(OPENROUTER_API_URL, {
      method: 'POST',
      signal: AbortSignal.timeout(9000),
      headers: {
        Authorization:  `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://nutri-vida-khaki.vercel.app',
        'X-Title':      'NutriVida Biotech',
      },
      body: JSON.stringify({
        model,
        messages:    [{ role: 'system', content: SYSTEM_PROMPT }, ...safeMessages],
        max_tokens:  450,
        temperature: 0.4,
        stream:      false,
      }),
    })

    let response = null
    for (const model of MODELS) {
      try {
        response = await callOpenRouter(model)
        if (response.ok) break
        const errText = await response.text().catch(() => `Status ${response.status}`)
        console.warn(`Model ${model} failed (${response.status}):`, errText)
        response = null
      } catch (modelErr) {
        console.warn(`Model ${model} threw:`, modelErr?.message || modelErr)
        response = null
      }
    }

    if (!response?.ok) throw new Error('All models unavailable')

    const data    = await response.json()
    const message = data?.choices?.[0]?.message?.content?.trim()
      || data?.error?.message
      || 'Lo siento, no pude procesar su consulta. Por favor intente de nuevo.'

    res.status(200).json({ message })
  } catch (error) {
    console.error('Function error:', error)
    res.status(500).json({ message: 'El asistente no está disponible en este momento. Para consultas urgentes, contacte a su equipo médico directamente.' })
  }
}
