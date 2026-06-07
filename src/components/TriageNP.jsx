import { Phone } from 'lucide-react'
import { useState } from 'react'

const PREGUNTAS = {
  q1: { texto: '¿Tiene dificultad para respirar o dolor en el pecho?',                                          si: 'ROJO_CARDIO',      no: 'q2' },
  q2: { texto: '¿Tiene fiebre mayor de 38 °C o escalofríos intensos?',                                         si: 'q3',               no: 'q4' },
  q3: { texto: '¿Los síntomas comenzaron durante o justo después de iniciar la infusión de NP?',               si: 'ROJO_SEPSIS',      no: 'AMARILLO_FIEBRE' },
  q4: { texto: '¿El sitio del catéter está enrojecido, caliente, hinchado o tiene secreción?',                 si: 'AMARILLO_CATER',   no: 'q5' },
  q5: { texto: '¿La bolsa de NP tiene aspecto anormal: capas separadas, color diferente o partículas?',        si: 'AMARILLO_BOLSA',   no: 'q6' },
  q6: { texto: '¿Tiene mareo intenso, confusión repentina o pérdida de fuerza en algún miembro?',              si: 'ROJO_NEURO',       no: 'VERDE' },
}

const RESULTADOS = {
  ROJO_CARDIO: {
    nivel: 'rojo',
    icono: '🔴',
    titulo: 'Llame al 911 AHORA',
    instruccion: 'Diga: "Tengo dificultad para respirar durante mi nutrición parenteral". Suspenda la infusión, cierre el clamp del catéter. No conduzca usted mismo.',
    accion: 'Suspender infusión · Clamp cerrado · Llamar al 911',
  },
  ROJO_SEPSIS: {
    nivel: 'rojo',
    icono: '🔴',
    titulo: 'Llame al 911 o su médico AHORA',
    instruccion: 'Fiebre durante la infusión de NP es posible sepsis por catéter. Suspenda la infusión, cierre el clamp y llame inmediatamente. No espere a ver si mejora.',
    accion: 'Suspender infusión · Clamp cerrado · Llamar al 911',
  },
  ROJO_NEURO: {
    nivel: 'rojo',
    icono: '🔴',
    titulo: 'Llame al 911 AHORA',
    instruccion: 'Los síntomas neurológicos súbitos son una emergencia. Suspenda la infusión, cierre el clamp y llame al 911 inmediatamente.',
    accion: 'Suspender infusión · Clamp cerrado · Llamar al 911',
  },
  AMARILLO_FIEBRE: {
    nivel: 'amarillo',
    icono: '🟡',
    titulo: 'Contacte a su equipo médico hoy',
    instruccion: 'Fiebre sin relación directa con la infusión. Monitoree temperatura cada 2 horas. Si supera 38.5 °C o aparecen escalofríos, cambie a llamar al 911.',
    accion: 'Llamar a su enfermera o médico en las próximas 4 horas',
  },
  AMARILLO_CATER: {
    nivel: 'amarillo',
    icono: '🟡',
    titulo: 'Contacte a su equipo médico hoy',
    instruccion: 'Signos de posible infección del sitio del catéter. No toque ni limpie el catéter por su cuenta. Llame a su enfermera para curación de emergencia.',
    accion: 'Llamar a su enfermera o médico en las próximas 4 horas',
  },
  AMARILLO_BOLSA: {
    nivel: 'amarillo',
    icono: '🟡',
    titulo: 'Suspenda la infusión — no use esa bolsa',
    instruccion: 'Una bolsa con aspecto anormal puede estar contaminada o desestabilizada. Suspenda la infusión si ya inició y conserve la bolsa para que su equipo la evalúe.',
    accion: 'Suspender infusión · Guardar bolsa · Llamar a su equipo hoy',
  },
  VERDE: {
    nivel: 'verde',
    icono: '🟢',
    titulo: 'Continúe con su plan habitual',
    instruccion: 'No identificamos señales de alerta inmediata. Continúe su infusión normalmente. Registre cualquier cambio nuevo y coméntelo en su próxima consulta.',
    accion: 'Continuar infusión · Anotar síntomas · Próxima consulta',
  },
}

const TOTAL = Object.keys(PREGUNTAS).length

const ESTILOS = {
  rojo:     { bg: 'bg-red-50',     border: 'border-red-300',     text: 'text-red-800',     badge: 'bg-red-600 text-white'     },
  amarillo: { bg: 'bg-amber-50',   border: 'border-amber-300',   text: 'text-amber-800',   badge: 'bg-amber-500 text-white'   },
  verde:    { bg: 'bg-emerald-50', border: 'border-emerald-300', text: 'text-emerald-800', badge: 'bg-emerald-600 text-white' },
}

export default function TriageNP({ onFinalizar }) {
  const [actual, setActual]       = useState('q1')
  const [numero, setNumero]       = useState(1)
  const [resultado, setResultado] = useState(null)

  const responder = (clave) => {
    const siguiente = PREGUNTAS[actual][clave]
    if (siguiente.startsWith('q')) {
      setActual(siguiente)
      setNumero(n => n + 1)
    } else {
      setResultado(RESULTADOS[siguiente])
    }
  }

  if (resultado) {
    const c = ESTILOS[resultado.nivel]
    return (
      <div className={`rounded-2xl border ${c.bg} ${c.border} p-4 text-sm space-y-3`}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{resultado.icono}</span>
          <span className={`font-bold text-xs px-2 py-0.5 rounded-full ${c.badge}`}>
            CÓDIGO {resultado.nivel.toUpperCase()}
          </span>
        </div>

        <p className={`font-bold text-base leading-tight ${c.text}`}>{resultado.titulo}</p>
        <p className={`text-xs leading-relaxed ${c.text}`}>{resultado.instruccion}</p>

        <div className={`text-xs font-semibold px-3 py-1.5 rounded-lg inline-block ${c.badge}`}>
          {resultado.accion}
        </div>

        {resultado.nivel === 'rojo' && (
          <a
            href="tel:911"
            className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl py-2.5 text-sm transition-colors"
          >
            <Phone size={16} /> Llamar al 911
          </a>
        )}

        <p className="text-xs text-slate-400 border-t pt-2">
          Triaje automático NutriVida · No sustituye evaluación médica presencial · Si empeora, llame al 911.
        </p>

        {onFinalizar && (
          <button
            onClick={onFinalizar}
            className="text-xs text-slate-500 hover:text-slate-700 underline"
          >
            Continuar conversación con NutriAsistente →
          </button>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-teal-700 uppercase tracking-wide">Triaje de síntomas</span>
        <span className="text-xs text-slate-400">{numero} / {TOTAL}</span>
      </div>

      <div className="w-full bg-teal-100 rounded-full h-1.5">
        <div
          className="bg-teal-500 h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${(numero / TOTAL) * 100}%` }}
        />
      </div>

      <p className="font-medium text-slate-800 leading-snug">{PREGUNTAS[actual].texto}</p>

      <div className="flex gap-2">
        <button
          onClick={() => responder('si')}
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl py-2.5 text-sm transition-colors"
        >
          Sí
        </button>
        <button
          onClick={() => responder('no')}
          className="flex-1 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-xl py-2.5 text-sm border border-slate-200 transition-colors"
        >
          No
        </button>
      </div>

      <p className="text-xs text-slate-400 text-center">
        Responda sobre sus síntomas actuales · Las respuestas no se guardan
      </p>
    </div>
  )
}
