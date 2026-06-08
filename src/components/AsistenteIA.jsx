import { Bot, Dna, Loader, RefreshCw, Send, ShieldAlert, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import TriageNP from './TriageNP'

const SUGERENCIAS = [
  '¿Qué hay dentro de mi bolsa de NP?',
  '¿Qué hago si hay enrojecimiento en el catéter?',
  '¿Cómo cuido el catéter en casa?',
  '¿Por qué debo sacar la bolsa del frío antes de usarla?',
  '¿Cuáles son mis derechos como paciente hospitalizado?',
  '¿De dónde vienen los aminoácidos de mi nutrición?',
]

const MENSAJE_BIENVENIDA = {
  role: 'assistant',
  content: '¡Hola! Soy NutriAsistente, su acompañante en nutrición parenteral. Estoy aquí para resolver sus dudas sobre su tratamiento, la logística en casa y el cuidado de su catéter.\n\n¿En qué puedo ayudarle hoy?',
}

const MAX_INPUT_LENGTH = 800

// Keywords that trigger the offline triage tree instead of the AI chat
const PALABRAS_TRIAGE = /fiebre|escalofr[ií][oó]|cat[eé]ter.*rojo|rojo.*cat[eé]ter|dolor.{0,25}pecho|pecho.{0,25}dolor|dificultad.{0,25}respirar|respirar.{0,25}dificultad|no puedo respirar|enrojecimiento|secreci[oó]n|hinchaz[oó]n|bolsa.*anormal|anormal.*bolsa|part[ií]culas.*bolsa|mareo\s+intenso|confusi[oó]n repentina|p[eé]rdida.*fuerza|emergencia|urgente|me siento mal.*cat[eé]ter|cat[eé]ter.*me siento mal/i

function sanitizeInput(text) {
  return String(text || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_INPUT_LENGTH)
}

export default function AsistenteIA() {
  const [mensajes, setMensajes] = useState([MENSAJE_BIENVENIDA])
  const [input, setInput]       = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError]       = useState(null)
  const bottomRef = useRef(null)
  const inputRef  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, cargando])

  const enviar = async (texto) => {
    const msg = sanitizeInput(texto || input)
    if (!msg || cargando) return

    setInput('')
    setError(null)

    // — Modo triaje: síntomas detectados → árbol offline, sin llamada a API —
    if (PALABRAS_TRIAGE.test(msg)) {
      setMensajes(prev => [
        ...prev,
        { role: 'user',   content: msg },
        { role: 'triage', content: null },
      ])
      return
    }

    // — Modo educativo: pregunta general → OpenRouter —
    const nuevos = [...mensajes, { role: 'user', content: msg }]
    setMensajes(nuevos)
    setCargando(true)

    try {
      const historial = nuevos
        .filter(m => m.role === 'user' || (m.role === 'assistant' && m.content !== MENSAJE_BIENVENIDA.content))
        .slice(-3)
        .map(({ role, content }) => ({ role, content: sanitizeInput(content) }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historial }),
      })

      if (!res.ok) {
        const errorPayload = await res.json().catch(() => null)
        throw new Error(errorPayload?.message || `Error ${res.status}`)
      }

      const data = await res.json()
      const respuesta = typeof data?.message === 'string' && data.message.length > 0
        ? data.message
        : 'Lo siento, no pude procesar la consulta. Por favor intente de nuevo.'
      setMensajes(prev => [...prev, { role: 'assistant', content: respuesta }])
    } catch (e) {
      console.error('AsistenteIA error:', e)
      setError(e.message || 'No se pudo conectar con el asistente. Verifique su conexión e intente de nuevo.')
    } finally {
      setCargando(false)
      inputRef.current?.focus()
    }
  }

  const reiniciar = () => {
    setMensajes([MENSAJE_BIENVENIDA])
    setError(null)
    setInput('')
  }

  const renderTexto = (texto) => {
    if (!texto || typeof texto !== 'string') return null
    return texto.split('\n').map((linea, i, arr) => (
      <span key={i}>
        {linea}
        {i < arr.length - 1 && <br />}
      </span>
    ))
  }

  return (
    <div className="flex flex-col" style={{ height: '520px' }}>
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-teal-100 mb-3">
        <div className="flex items-center gap-2">
          <div className="bg-teal-600 text-white p-1.5 rounded-xl">
            <Dna size={18} />
          </div>
          <div>
            <p className="font-bold text-teal-800 text-base">NutriAsistente</p>
            <p className="text-xs text-teal-500">Asistente IA · NP Costa Rica</p>
          </div>
        </div>
        <button
          onClick={reiniciar}
          className="text-slate-400 hover:text-slate-600 p-2 rounded-lg hover:bg-slate-100 transition-colors"
          title="Nueva conversación"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      {/* Aviso clínico permanente */}
      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800 mb-3 flex-shrink-0">
        <ShieldAlert size={13} className="flex-shrink-0" />
        <p>
          <strong>Apoyo educativo</strong> — no sustituye consulta médica. Emergencias: <strong>911</strong> o su equipo de soporte nutricional.
        </p>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        {mensajes.map((m, i) => {
          // — Render del árbol de triaje —
          if (m.role === 'triage') {
            return (
              <div key={i} className="flex gap-2 flex-row chat-bubble-enter">
                <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center flex-shrink-0">
                  <Bot size={16} className="text-white" />
                </div>
                <div className="flex-1 max-w-xs lg:max-w-sm">
                  <TriageNP onFinalizar={() => inputRef.current?.focus()} />
                </div>
              </div>
            )
          }

          // — Render de burbuja normal (user / assistant) —
          return (
            <div
              key={i}
              className={`flex gap-2 chat-bubble-enter ${m.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                m.role === 'user' ? 'bg-teal-100' : 'bg-teal-600'
              }`}>
                {m.role === 'user'
                  ? <User size={16} className="text-teal-700" />
                  : <Bot size={16} className="text-white" />
                }
              </div>
              <div className={`max-w-xs lg:max-w-sm rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-teal-600 text-white rounded-tr-sm'
                  : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-sm'
              }`}>
                {renderTexto(m.content)}
              </div>
            </div>
          )
        })}

        {cargando && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
              <Bot size={16} className="text-white" />
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">
            {error}
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Sugerencias — solo al inicio */}
      {mensajes.length === 1 && (
        <div className="py-2 space-y-1.5">
          <p className="text-xs text-slate-400 font-medium">Preguntas frecuentes:</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGERENCIAS.slice(0, 4).map((s, i) => (
              <button
                key={i}
                onClick={() => enviar(s)}
                className="text-xs bg-teal-50 text-teal-700 border border-teal-200 px-3 py-1.5 rounded-full hover:bg-teal-100 transition-colors text-left"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 pt-3 border-t border-teal-100">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && enviar()}
          placeholder="Escriba su pregunta aquí..."
          className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
          disabled={cargando}
        />
        <button
          onClick={() => enviar()}
          disabled={!input.trim() || cargando}
          className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 text-white p-3 rounded-xl transition-colors flex items-center justify-center"
        >
          {cargando ? <Loader size={20} className="animate-spin" /> : <Send size={20} />}
        </button>
      </div>

      <p className="text-center text-xs text-slate-300 mt-2">
        NutriAsistente no reemplaza la indicación de su equipo médico
      </p>
    </div>
  )
}
