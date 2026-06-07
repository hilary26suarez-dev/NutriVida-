import { useState } from 'react'
import { AlertTriangle, CheckCircle, ChevronDown, ChevronUp, MessageCircle, ShieldCheck } from 'lucide-react'

const pasos = [
  {
    numero: 1,
    titulo: 'Preparar el área y los materiales',
    instrucciones: [
      'Lávese las manos con agua y jabón durante al menos 20 segundos.',
      'Desinfecte una superficie plana con alcohol al 70% y deje secar.',
      'Reúna todo el material: bolsa de NP, tubuladura estéril, gasa, alcohol al 70%, guantes.',
      'Cierre ventanas y puertas para evitar corrientes de aire.',
      'Asegúrese de tener buena iluminación antes de comenzar.',
    ],
    alerta: 'NO realice el procedimiento si tiene dudas sobre la limpieza del área. Mejor consultar que arriesgar una infección.',
    tip: 'Tenga a mano el número de su equipo de salud antes de empezar.',
  },
  {
    numero: 2,
    titulo: 'Verificar la bolsa de NP',
    instrucciones: [
      'Confirme que la bolsa fue sacada del refrigerador al menos 90 minutos antes.',
      'Verifique la fecha de vencimiento en la etiqueta.',
      'Inspeccione visualmente: la mezcla debe ser homogénea, sin partículas ni capas separadas.',
      'Compruebe que la bolsa no tenga fugas ni daños en los sellos.',
      'Confirme que el nombre en la etiqueta corresponde al paciente correcto.',
    ],
    alerta: 'Si ve partículas flotando, colores diferentes o capas separadas: NO USE ESA BOLSA. Llame a la farmacia del hospital.',
    tip: null,
  },
  {
    numero: 3,
    titulo: 'Revisar el sitio del catéter',
    instrucciones: [
      'Exponga el sitio de inserción con buena iluminación.',
      'Busque activamente: enrojecimiento, calor, hinchazón, secreción o dolor en la zona.',
      'Limpie el conector del catéter con alcohol al 70%, frote por fricción durante 15 segundos.',
      'Deje secar el conector al aire. NUNCA sople para secarlo más rápido.',
    ],
    alerta: 'Si nota enrojecimiento, hinchazón, calor, dolor o secreción en el sitio: NO CONTINÚE. Contacte al equipo de salud de inmediato.',
    tip: 'La limpieza del conector por fricción es la medida más importante para prevenir infecciones.',
  },
  {
    numero: 4,
    titulo: 'Preparar y purgar la tubuladura',
    instrucciones: [
      'Abra el empaque de la tubuladura estéril sin tocar la punta con los dedos.',
      'Inserte la cámara de goteo en el puerto de la bolsa con un movimiento firme y recto.',
      'Cuelgue la bolsa en el soporte de infusión.',
      'Llene la cámara de goteo hasta la mitad presionando suavemente.',
      'Purgue la tubuladura abriendo la llave hasta que salga todo el aire por la punta.',
      'Cierre la llave antes de conectar al paciente.',
    ],
    alerta: 'Si queda aire visible en la tubuladura, vuelva a purgar. No conecte con aire en el sistema.',
    tip: null,
  },
  {
    numero: 5,
    titulo: 'Conectar e iniciar la infusión',
    instrucciones: [
      'Con técnica limpia, conecte la punta estéril de la tubuladura al catéter.',
      'Confirme que la conexión es firme y sin fugas.',
      'Si usa bomba de infusión: programe exactamente la velocidad indicada por el médico (mL/hora).',
      'Si es por gravedad: regule el goteo según la indicación médica.',
      'Anote la hora de inicio de la infusión.',
    ],
    alerta: 'NO cambie la velocidad de infusión sin indicación médica. Un ritmo incorrecto puede causar complicaciones graves.',
    tip: 'Tome una foto de la pantalla de la bomba con la velocidad programada para tener registro.',
  },
  {
    numero: 6,
    titulo: 'Vigilar durante la infusión',
    instrucciones: [
      'Permanezca cerca del paciente durante los primeros 30 minutos.',
      'Verifique el sitio del catéter cada hora: no debe haber hinchazón local.',
      'Esté atento a síntomas: fiebre, escalofríos, dificultad para respirar, náuseas repentinas.',
      'Confirme que la bolsa está vaciando a la velocidad esperada.',
      'Anote cualquier cambio en el estado del paciente.',
    ],
    alerta: 'Fiebre > 38 °C, escalofríos intensos, dificultad para respirar o hinchazón súbita: DETENGA LA INFUSIÓN y llame al 911.',
    tip: null,
  },
  {
    numero: 7,
    titulo: 'Desconectar y cerrar el catéter',
    instrucciones: [
      'Al terminar la infusión, cierre la llave de la tubuladura.',
      'Limpie nuevamente el conector con alcohol al 70% antes de desconectar.',
      'Realice el lavado (flush) con solución salina según el protocolo indicado.',
      'Aplique sellado con heparina si está prescrito por el médico.',
      'Coloque una tapa estéril nueva en el conector.',
      'Deseche la bolsa vacía, tubuladura y agujas en el recipiente de biopeligrosos.',
    ],
    alerta: 'Nunca deje el catéter descubierto. El tapón estéril es la última barrera contra infecciones.',
    tip: 'Lávese las manos nuevamente al terminar. Registre la hora de fin de la infusión.',
  },
]

export default function GuiaCuidador({ onOpenAI }) {
  const [expanded, setExpanded] = useState(null)

  const toggle = (num) => setExpanded(expanded === num ? null : num)

  return (
    <div className="space-y-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck size={20} className="text-emerald-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-emerald-800 text-base">Antes de empezar</p>
            <p className="text-emerald-700 text-sm mt-1 leading-relaxed">
              Esta guía complementa el entrenamiento de su equipo de salud. Si algo no luce bien o
              tiene alguna duda, siempre es correcto pausar y consultar antes de continuar.
            </p>
          </div>
        </div>
      </div>

      {pasos.map((paso) => (
        <div key={paso.numero} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
          <button
            onClick={() => toggle(paso.numero)}
            className="w-full flex items-center gap-3 p-4 text-left hover:bg-slate-50 transition-colors"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-base text-white transition-colors ${
                expanded === paso.numero ? 'bg-emerald-600' : 'bg-teal-500'
              }`}
            >
              {paso.numero}
            </div>
            <p className="font-semibold text-slate-800 flex-1 text-base leading-snug">{paso.titulo}</p>
            {expanded === paso.numero ? (
              <ChevronUp size={20} className="text-slate-400 flex-shrink-0" />
            ) : (
              <ChevronDown size={20} className="text-slate-400 flex-shrink-0" />
            )}
          </button>

          {expanded === paso.numero && (
            <div className="px-5 pb-5 space-y-3">
              <div className="space-y-3">
                {paso.instrucciones.map((inst, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-slate-600 text-base leading-relaxed">{inst}</p>
                  </div>
                ))}
              </div>

              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-red-700 text-base leading-relaxed font-medium">{paso.alerta}</p>
              </div>

              {paso.tip && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <p className="text-amber-700 text-base leading-relaxed">
                    <span className="font-bold">Recuerde: </span>
                    {paso.tip}
                  </p>
                </div>
              )}

              <button
                onClick={onOpenAI}
                className="w-full flex items-center justify-center gap-2 text-teal-600 font-semibold text-base border border-teal-200 rounded-xl py-3.5 hover:bg-teal-50 transition-colors"
              >
                <MessageCircle size={18} />
                Tengo una duda sobre este paso
              </button>
            </div>
          )}
        </div>
      ))}

      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <MessageCircle size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-blue-800 text-base mb-1">¿Tiene alguna duda?</p>
            <p className="text-blue-600 text-sm mb-3 leading-relaxed">
              El Asistente IA de NutriVida puede responder sus preguntas en lenguaje claro, las 24 horas.
            </p>
            <button
              onClick={onOpenAI}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition-colors w-full"
            >
              Consultar al Asistente IA
            </button>
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-slate-400 pb-2">
        Esta guía no reemplaza el entrenamiento de su equipo médico. Ante cualquier duda, consulte a
        su farmacéutico o enfermera.
      </p>
    </div>
  )
}
