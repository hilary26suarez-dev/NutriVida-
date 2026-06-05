import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader, Dna, RefreshCw, ShieldAlert } from 'lucide-react'

const SUGERENCIAS = [
  '¿Qué hay dentro de mi bolsa de NP?',
  '¿Qué hago si hay enrojecimiento en el catéter?',
  '¿Cómo cuido el catéter en casa?',
  '¿Por qué debo sacar la bolsa del frío antes de usarla?',
  '¿Cuáles son mis derechos como paciente en la CCSS?',
  '¿De dónde vienen los aminoácidos de mi nutrición?',
]

const MENSAJE_BIENVENIDA = {
  role: 'assistant',
  content: '¡Hola! Soy NutriAsistente, su acompañante en nutrición parenteral. Estoy aquí para resolver sus dudas sobre su tratamiento, la logística en casa y el cuidado de su catéter.\n\n¿En qué puedo ayudarle hoy?',
}

export default function AsistenteIA() {
  const [mensajes, setMensajes] = useState([MENSAJE_BIENVENIDA])
  const [input, setInput] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState(null)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes, cargando])

  const enviar = async (texto) => {
    const msg = texto || input.trim()
    if (!msg || cargando) return

    const nuevos = [...mensajes, { role: 'user', content: msg }]
    setMensajes(nuevos)
    setInput('')
    setCargando(true)
    setError(null)

    try {
      const historial = nuevos
        .filter(m => m.role !== 'assistant' || m.content !== MENSAJE_BIENVENIDA.content)
        .slice(-10)
        .map(({ role, content }) => ({ role, content }))

      const res = await fetch('/.netlify/functions/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: historial }),
      })

      const data = await res.json()
      setMensajes(prev => [...prev, { role: 'assistant', content: data.message }])
    } catch {
      setError('No se pudo conectar con el asistente. Verifique su conexión e intente de nuevo.')
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
    return texto.split('\n').map((linea, i) => (
      <span key={i}>
        {linea}
        {i < texto.split('\n').length - 1 && <br />}
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

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 pb-2">
        {mensajes.map((m, i) => (
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
        ))}

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
          <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
            <ShieldAlert size={15} className="mt-0.5 flex-shrink-0" />
            <p>
              No escriba nombre completo, cédula, expediente, teléfono ni dirección. En síntomas urgentes, contacte a su equipo médico o al 911.
            </p>
          </div>
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
