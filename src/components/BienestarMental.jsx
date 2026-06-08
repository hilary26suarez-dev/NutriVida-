import { useEffect, useState } from 'react'
import { Heart, RefreshCw, Phone, Users, Wind } from 'lucide-react'

// ─── Datos ───────────────────────────────────────────────────────────────────

const afirmaciones = [
  'Cada día que recibo mi tratamiento es un día que cuido mi vida.',
  'Mi valentía no se mide en lo que no siento, sino en lo que enfrento a pesar de todo.',
  'Pedir ayuda es un acto de fortaleza, no de debilidad.',
  'Mi cuerpo trabaja junto a la ciencia para mantenerme aquí. Eso es extraordinario.',
  'No necesito estar bien todo el tiempo. Solo necesito seguir adelante.',
  'Cada pequeño paso cuenta. Hoy ya tomé uno.',
  'Merezco cuidado, descanso y compasión — comenzando por la que me doy a mí mismo.',
  'La paciencia conmigo mismo es parte del tratamiento.',
  'Hay personas a mi alrededor que quieren apoyarme. Puedo dejarlas hacerlo.',
  'Un día difícil no define mi camino. Solo es un día.',
]

const FASES = [
  { id: 'inhala', label: 'Inhala', instruccion: 'Respira profundo por la nariz', segundos: 4, grande: true, color: 'teal' },
  { id: 'sostén', label: 'Sostén', instruccion: 'Mantén el aire suavemente', segundos: 4, grande: true, color: 'blue' },
  { id: 'exhala', label: 'Exhala', instruccion: 'Suelta el aire lentamente por la boca', segundos: 4, grande: false, color: 'violet' },
  { id: 'pausa', label: 'Pausa', instruccion: 'Espera un momento antes de inhalar', segundos: 4, grande: false, color: 'slate' },
]

const estadosMood = {
  bien: {
    emoji: '😊',
    label: 'Bien',
    color: 'bg-emerald-50 border-emerald-300 text-emerald-700',
    activo: 'bg-emerald-500 border-emerald-500 text-white',
  },
  regular: {
    emoji: '😐',
    label: 'Regular',
    color: 'bg-amber-50 border-amber-300 text-amber-700',
    activo: 'bg-amber-500 border-amber-500 text-white',
  },
  dificil: {
    emoji: '😔',
    label: 'Difícil',
    color: 'bg-blue-50 border-blue-300 text-blue-700',
    activo: 'bg-blue-500 border-blue-500 text-white',
  },
}

// ─── Respiración ─────────────────────────────────────────────────────────────

function Respiracion() {
  const [activo, setActivo] = useState(false)
  const [faseIdx, setFaseIdx] = useState(0)
  const [cuenta, setCuenta] = useState(FASES[0].segundos)

  useEffect(() => {
    if (!activo) return
    if (cuenta > 0) {
      const t = setTimeout(() => setCuenta((c) => c - 1), 1000)
      return () => clearTimeout(t)
    }
    const siguiente = (faseIdx + 1) % FASES.length
    setFaseIdx(siguiente)
    setCuenta(FASES[siguiente].segundos)
  }, [activo, cuenta, faseIdx])

  const fase = FASES[faseIdx]

  const colorCirculo = {
    teal: 'border-teal-400 bg-teal-50',
    blue: 'border-blue-400 bg-blue-50',
    violet: 'border-violet-400 bg-violet-50',
    slate: 'border-slate-300 bg-slate-50',
  }

  const resetear = () => {
    setActivo(false)
    setFaseIdx(0)
    setCuenta(FASES[0].segundos)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-5">
      <div className="flex items-center justify-center gap-2">
        <Wind size={20} className="text-teal-600" />
        <p className="font-bold text-slate-800 text-lg">Respiración 4-4-4-4</p>
      </div>
      <p className="text-slate-500 text-base">Una técnica usada para calmar el sistema nervioso en momentos de tensión.</p>

      {/* Círculo visual */}
      <div className="flex items-center justify-center py-4">
        <div
          className={`border-4 rounded-full flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${colorCirculo[fase.color]} ${
            activo && fase.grande ? 'w-44 h-44' : 'w-32 h-32'
          }`}
        >
          <p className="font-bold text-2xl text-slate-700">{activo ? cuenta : '4'}</p>
          <p className="text-sm font-semibold text-slate-500 mt-1">{activo ? fase.label : 'listo'}</p>
        </div>
      </div>

      {activo && (
        <p className="text-base text-slate-600 font-medium">{fase.instruccion}</p>
      )}

      <div className="flex gap-3">
        {!activo ? (
          <button
            onClick={() => { resetear(); setTimeout(() => setActivo(true), 50) }}
            className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl text-base transition-colors"
          >
            Comenzar
          </button>
        ) : (
          <button
            onClick={resetear}
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-4 rounded-xl text-base transition-colors"
          >
            Detener
          </button>
        )}
      </div>

      <p className="text-slate-400 text-sm">Repita 3–4 ciclos para sentir el efecto calmante.</p>
    </div>
  )
}

// ─── Afirmación del día ───────────────────────────────────────────────────────

function Afirmacion() {
  const [idx, setIdx] = useState(() => Math.floor(Math.random() * afirmaciones.length))

  const siguiente = () => setIdx((i) => (i + 1) % afirmaciones.length)

  return (
    <div className="bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Heart size={18} className="text-pink-500" />
        <p className="font-bold text-pink-800 text-base">Para hoy</p>
      </div>
      <p className="text-slate-700 text-lg leading-relaxed font-medium italic mb-4">
        "{afirmaciones[idx]}"
      </p>
      <button
        onClick={siguiente}
        className="flex items-center gap-2 text-pink-600 font-semibold text-sm hover:text-pink-800 transition-colors"
      >
        <RefreshCw size={14} />
        Otra afirmación
      </button>
    </div>
  )
}

// ─── Recursos ─────────────────────────────────────────────────────────────────

function Recursos() {
  return (
    <div className="space-y-3">
      <p className="font-bold text-slate-700 text-base">No estás solo — recursos de apoyo</p>
      {[
        {
          nombre: 'ACONEP',
          desc: 'Asociación Costarricense de Nutrición Enteral y Parenteral. Grupos de apoyo para pacientes y familias.',
          contacto: 'aconep.cr',
          tipo: 'link',
          icon: Users,
          color: 'teal',
        },
        {
          nombre: 'Psicología hospitalaria',
          desc: 'Consulte en su centro de salud la disponibilidad de atención psicológica. Solicítela a través de su médico tratante.',
          contacto: 'Consulte en su centro de salud',
          tipo: 'info',
          icon: Heart,
          color: 'violet',
        },
        {
          nombre: 'Línea de apoyo emocional',
          desc: 'El Colegio de Psicólogos de Costa Rica ofrece orientación telefónica en momentos de crisis.',
          contacto: '2222-0425',
          tipo: 'tel',
          icon: Phone,
          color: 'blue',
        },
      ].map((r, i) => {
        const Icono = r.icon
        const paleta = {
          teal: 'bg-teal-50 border-teal-200',
          violet: 'bg-violet-50 border-violet-200',
          blue: 'bg-blue-50 border-blue-200',
        }
        return (
          <div key={i} className={`${paleta[r.color]} border rounded-2xl p-4 flex items-start gap-3`}>
            <Icono size={20} className={`text-${r.color}-600 flex-shrink-0 mt-0.5`} />
            <div className="flex-1">
              <p className="font-bold text-slate-800 text-base">{r.nombre}</p>
              <p className="text-slate-500 text-sm mt-0.5 leading-relaxed">{r.desc}</p>
              {r.tipo === 'tel' && (
                <a href={`tel:${r.contacto.replace(/-/g, '')}`} className="mt-2 inline-block font-bold text-blue-600 text-base">{r.contacto}</a>
              )}
              {r.tipo === 'link' && (
                <p className="mt-1 font-medium text-teal-600 text-sm">{r.contacto}</p>
              )}
              {r.tipo === 'info' && (
                <p className="mt-1 text-violet-600 text-sm font-medium">{r.contacto}</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ─── Componente principal ─────────────────────────────────────────────────────

export default function BienestarMental() {
  const [mood, setMood] = useState(null)

  return (
    <div className="space-y-5">
      {/* Check de estado */}
      <div className="bg-pink-50 border border-pink-200 rounded-2xl p-5">
        <p className="font-bold text-pink-800 text-lg mb-1">¿Cómo te sientes hoy?</p>
        <p className="text-pink-600 text-base mb-4 leading-relaxed">
          No hay respuesta correcta. Solo queremos acompañarte donde estás.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(estadosMood).map(([key, m]) => (
            <button
              key={key}
              onClick={() => setMood(mood === key ? null : key)}
              className={`flex flex-col items-center gap-2 py-4 rounded-2xl border-2 font-semibold text-base transition-all ${
                mood === key ? m.activo : m.color
              }`}
            >
              <span className="text-3xl">{m.emoji}</span>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Respuesta según mood */}
      {mood === 'bien' && (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
            <p className="font-bold text-emerald-800 text-base">¡Eso es maravilloso!</p>
            <p className="text-emerald-700 text-base mt-1 leading-relaxed">
              Cuando el bienestar llega, hay que recibirlo con gratitud. Aquí hay algo para ti:
            </p>
          </div>
          <Afirmacion />
          <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
            <p className="font-bold text-teal-800 text-base mb-2">Haz que dure</p>
            <ul className="space-y-2 text-teal-700 text-base">
              {['Comparte este bienestar con alguien que te importa hoy.',
                'Anota una cosa por la que estás agradecido esta semana.',
                'Date permiso de disfrutar el descanso sin culpa.'].map((t, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-teal-500 font-bold mt-0.5">→</span>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {mood === 'regular' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="font-bold text-amber-800 text-base">Es completamente válido sentirse así.</p>
            <p className="text-amber-700 text-base mt-1 leading-relaxed">
              "Regular" no es "mal". Es estar humano. Prueba este ejercicio para recuperar el centro:
            </p>
          </div>
          <Respiracion />
          <Afirmacion />
        </div>
      )}

      {mood === 'dificil' && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="font-bold text-blue-800 text-base">Gracias por decirlo.</p>
            <p className="text-blue-700 text-base mt-1 leading-relaxed">
              No tienes que estar bien todo el tiempo. Tratar una enfermedad crónica es genuinamente difícil. Empieza por respirar:
            </p>
          </div>
          <Respiracion />
          <Recursos />
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <p className="font-bold text-slate-700 text-base mb-2">Para el cuidador también</p>
            <p className="text-slate-600 text-base leading-relaxed">
              Cuidar a alguien con NP domiciliaria puede ser agotador. El agotamiento del cuidador es real y merece atención. Busca el apoyo de ACONEP y recuerda: no puedes dar de lo que no tienes.
            </p>
          </div>
        </div>
      )}

      {/* Si no seleccionó nada — mostrar respiración y afirmación de base */}
      {!mood && (
        <div className="space-y-4">
          <Respiracion />
          <Afirmacion />
          <Recursos />
        </div>
      )}

      <p className="text-center text-slate-400 text-sm pb-2">
        Este espacio es de apoyo emocional. Si tiene una emergencia de salud mental, llame al 911 o a su médico.
      </p>
    </div>
  )
}
