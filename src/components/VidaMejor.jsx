import { useState } from 'react'
import { ChevronDown, ChevronUp, CheckCircle, AlertTriangle } from 'lucide-react'

const secciones = [
  {
    emoji: '🌙',
    titulo: 'Dormir con NP',
    subtitulo: 'Descanse bien aunque la infusión corra de noche',
    color: { bg: 'bg-blue-50', border: 'border-blue-200', titulo: 'text-blue-800' },
    consejos: [
      'Coloque la bomba de infusión a la misma altura que su cama para reducir la presión en el catéter.',
      'Use una mesa de noche o soporte lateral para la bolsa — no es necesario que esté suspendida muy alto si la bomba es activa.',
      'Vístase con ropa holgada o camisas con botones para facilitar el acceso al catéter sin despertar por completo.',
      'Use tapones para oídos si el sonido de la bomba le dificulta dormir. Las bombas modernas son silenciosas, pero el primer tiempo cuesta.',
      'Configure las alarmas de la bomba en el nivel mínimo necesario si el modelo lo permite.',
      'Coloque la tubuladura de modo que no quede por debajo de usted — evita presionar y doblar la línea mientras duerme.',
    ],
    alerta: 'Si siente calor, tirantez o presión en el sitio del catéter durante la noche, revíselo antes de continuar durmiendo.',
  },
  {
    emoji: '🏃',
    titulo: 'Actividad física',
    subtitulo: 'Moverse es parte de su recuperación',
    color: { bg: 'bg-emerald-50', border: 'border-emerald-200', titulo: 'text-emerald-800' },
    consejos: [
      'Caminar es el ejercicio más recomendado. Empiece con 10–15 minutos y aumente gradualmente.',
      'Informe a su equipo médico antes de comenzar cualquier programa de ejercicio o rehabilitación.',
      'Puede hacer actividad física fuera de las horas de infusión si su horario lo permite.',
      'Las actividades de bajo impacto (yoga suave, estiramientos, natación en piscinas limpias con catéter protegido) son generalmente bien toleradas.',
      'Evite actividades de contacto fuerte que puedan jalar el catéter o comprimir la zona de inserción.',
      'Si tiene un PICC line: consulte sobre actividades que involucren el brazo del catéter.',
      'La fatiga es normal y varía día a día. Respete el cuerpo en los días difíciles.',
    ],
    alerta: 'Detenga cualquier actividad si siente dolor en el sitio del catéter, falta de aire o palpitaciones inusuales.',
  },
  {
    emoji: '🚿',
    titulo: 'Higiene y baño personal',
    subtitulo: 'Cuidarse sin comprometer el catéter',
    color: { bg: 'bg-teal-50', border: 'border-teal-200', titulo: 'text-teal-800' },
    consejos: [
      'Puede ducharse con la mayoría de los catéteres venosos centrales usando un apósito impermeable oclusivo (tegaderm, film protector).',
      'Proteja el sitio del catéter y el conector con fundas impermeables disponibles en farmacia.',
      'Evite sumergir el catéter en tinas, jacuzzi, ríos o mar.',
      'Después del baño, revise que el apósito esté seco y bien adherido. Si se levantó o mojó, notifique a su equipo.',
      'Realice el cambio de apósito según el protocolo indicado (generalmente cada 5–7 días para apósitos transparentes).',
      'Use jabón antibacterial al lavar la zona periférica del catéter, nunca directamente sobre el apósito.',
    ],
    alerta: 'Nunca quite el apósito por completo para bañarse sin haber recibido instrucción de su equipo médico.',
  },
  {
    emoji: '👥',
    titulo: 'Vida social y trabajo',
    subtitulo: 'La NP no define lo que puede hacer',
    color: { bg: 'bg-pink-50', border: 'border-pink-200', titulo: 'text-pink-800' },
    consejos: [
      'Infunda de noche si su horario lo permite — esto libera el día para actividades sociales y laborales.',
      'No tiene ninguna obligación de explicarle su tratamiento a nadie que no quiera.',
      'Las bombas portátiles de infusión permiten salir de casa durante la infusión. Consulte con su equipo sobre la disponibilidad.',
      'Puede llevar su material de infusión en una mochila discreta al trabajo o lugares públicos.',
      'Informar a una persona de confianza en el trabajo o entorno social es recomendable por seguridad, no obligatorio.',
      'Las redes de apoyo (familia, amigos, grupos como ACONEP) son parte del tratamiento, no un lujo.',
    ],
    alerta: null,
  },
  {
    emoji: '✈️',
    titulo: 'Viajes con NP domiciliaria',
    subtitulo: 'Planificar bien permite viajar con tranquilidad',
    color: { bg: 'bg-amber-50', border: 'border-amber-200', titulo: 'text-amber-800' },
    consejos: [
      'Coordine el suministro de bolsas de NP en el destino con al menos 4–6 semanas de anticipación a través de su farmacia hospitalaria o proveedor autorizado.',
      'Lleve siempre una carta médica en español e inglés con su diagnóstico, tratamiento y contactos del equipo de salud.',
      'Transporte material de infusión (tubuladuras, alcohol, guantes, gasas) en su equipaje de mano o de bodega en empaques bien etiquetados.',
      'Identifique el hospital de referencia más cercano en su destino antes de salir.',
      'Las bolsas de NP deben mantenerse refrigeradas durante el transporte. Use coolers médicos con monitoreo de temperatura.',
      'Para viajes internacionales, verifique los requisitos aduaneros para transportar medicamentos y material médico.',
    ],
    alerta: 'No viaje sin haber confirmado el suministro de insumos en destino. La improvisación con NP puede ser peligrosa.',
  },
  {
    emoji: '🏠',
    titulo: 'Organizar el hogar para NP',
    subtitulo: 'Un espacio ordenado hace el proceso más seguro y tranquilo',
    color: { bg: 'bg-violet-50', border: 'border-violet-200', titulo: 'text-violet-800' },
    consejos: [
      'Designe un espacio exclusivo limpio para sus insumos: un cajón o estante de fácil acceso, lejos de humedad y luz directa.',
      'Organice el refrigerador: las bolsas de NP van en la parte más fría, bien separadas de alimentos. Etiquete con fecha de vencimiento a la vista.',
      'Tenga siempre a mano: número de emergencia de su equipo médico, el recipiente de biopeligrosos y el kit básico (gasas, alcohol, guantes).',
      'Use una lista visual pegada en la pared cerca de su área de infusión con los pasos del procedimiento — útil para usted y para cualquier cuidador.',
      'Mantenga el recipiente de biopeligrosos en un lugar visible y accesible. Cámbielo en cada visita al hospital.',
      'Registre fecha y hora de cada infusión en un cuaderno o app sencilla — útil para consultas médicas.',
    ],
    alerta: null,
  },
  {
    emoji: '🍽️',
    titulo: 'Alimentación oral y NP',
    subtitulo: 'Comer y recibir NP al mismo tiempo — lo que debe saber',
    color: { bg: 'bg-orange-50', border: 'border-orange-200', titulo: 'text-orange-800' },
    consejos: [
      'Si su médico permite cierta ingesta oral, esto es positivo — mantiene el tracto gastrointestinal activo.',
      'La NP generalmente cubre todos los requerimientos nutricionales. La ingesta oral, si existe, es complementaria.',
      'Alimentos muy dulces en grandes cantidades pueden generar hiperglucemia al combinarse con la dextrosa de la NP.',
      'Nunca ajuste los volúmenes de NP por lo que comió ese día sin consultar a su médico o nutricionista.',
      'La higiene oral es especialmente importante aunque no se coma por boca — previene infecciones orales y mejora el bienestar.',
      'Si tiene náuseas o vomita durante la infusión, infórmelo a su equipo. Puede ser señal de intolerancia o velocidad inadecuada.',
    ],
    alerta: 'Nunca interrumpa su NP sin indicación médica porque comió bien ese día. Los ajustes siempre requieren evaluación clínica.',
  },
]

function SeccionVida({ sec }) {
  const [abierto, setAbierto] = useState(false)
  const c = sec.color

  return (
    <div className={`${c.bg} border-2 ${c.border} rounded-2xl overflow-hidden`}>
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center gap-4 p-5 text-left hover:brightness-95 transition-all"
      >
        <span className="text-3xl flex-shrink-0">{sec.emoji}</span>
        <div className="flex-1">
          <p className={`font-bold text-lg leading-tight ${c.titulo}`}>{sec.titulo}</p>
          <p className="text-slate-500 text-sm mt-0.5">{sec.subtitulo}</p>
        </div>
        {abierto
          ? <ChevronUp size={20} className="text-slate-400 flex-shrink-0" />
          : <ChevronDown size={20} className="text-slate-400 flex-shrink-0" />}
      </button>

      {abierto && (
        <div className="px-5 pb-5 space-y-3">
          <div className="space-y-3">
            {sec.consejos.map((t, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-3 border border-white/80">
                <CheckCircle size={17} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-slate-600 text-base leading-relaxed">{t}</p>
              </div>
            ))}
          </div>
          {sec.alerta && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
              <AlertTriangle size={17} className="text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-base leading-relaxed font-medium">{sec.alerta}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function VidaMejor() {
  return (
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
        <p className="font-bold text-green-800 text-lg mb-1">La NP es parte de su vida, no toda su vida</p>
        <p className="text-green-700 text-base leading-relaxed">
          Miles de personas en Costa Rica y el mundo viven con NP domiciliaria por años manteniendo su trabajo, vida social y actividades. Estos consejos son para que eso sea más fácil y seguro.
        </p>
      </div>

      {secciones.map((sec, i) => <SeccionVida key={i} sec={sec} />)}

      <p className="text-center text-slate-400 text-sm pb-2">
        Recomendaciones basadas en guías ESPEN 2023 y experiencia clínica en NP domiciliaria.
      </p>
    </div>
  )
}
