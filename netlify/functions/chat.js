/* global process */

const SYSTEM_PROMPT = `Eres NutriAsistente, un asistente de apoyo para personas con Nutrición Parenteral (NP) domiciliaria en Costa Rica y sus cuidadores. Fuiste creado con base en conocimiento especializado en biotecnología y nutrición parenteral clínica.

TU MISIÓN: Acompañar al paciente y cuidador con información clara, cálida y sin tecnicismos innecesarios. Nunca reemplazas al equipo médico.

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

const MAX_MESSAGES = 10
const MAX_MESSAGE_LENGTH = 1200
const ALLOWED_ROLES = new Set(['user', 'assistant'])

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

export const handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      console.error('Missing DEEPSEEK_API_KEY')
      return {
        statusCode: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          message: 'El asistente no está configurado todavía. Para consultas urgentes, contacte a su equipo médico directamente.',
        }),
      }
    }

    const { messages } = JSON.parse(event.body || '{}')
    const safeMessages = sanitizeMessages(messages)

    if (safeMessages.length === 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
          message: 'Escriba una pregunta breve, sin datos personales, para que pueda orientarle.',
        }),
      }
    }

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...safeMsgs,
        ],
        max_tokens: 450,
        temperature: 0.4,
        stream: false,
      }),
    })
