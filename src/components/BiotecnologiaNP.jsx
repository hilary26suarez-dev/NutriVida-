import { useState } from 'react'
import { ChevronDown, ChevronUp, Dna, FlaskConical, Sparkles } from 'lucide-react'

const componentes = [
  {
    emoji: '🧬',
    nombre: 'Aminoácidos',
    subtitulo: 'La proteína que reconstruye tu cuerpo',
    color: { bg: 'bg-teal-50', border: 'border-teal-200', titulo: 'text-teal-800', badge: 'bg-teal-100 text-teal-700' },
    como: 'Los aminoácidos cristalinos de tu bolsa se producen mediante fermentación microbiana. Bacterias como Corynebacterium glutamicum o Escherichia coli son modificadas genéticamente para producir y secretar aminoácidos específicos (L-leucina, L-lisina, L-glutamina...) al medio de cultivo. El proceso dura 30–72 horas en biorreactores de miles de litros, seguido de purificación por cromatografía.',
    funcion: 'Síntesis de proteínas estructurales, enzimas, anticuerpos y tejidos. En pacientes en NP, son la única fuente de nitrógeno para mantener la masa muscular y la respuesta inmune.',
    curiosidad: 'La producción mundial de L-glutamina por fermentación supera 2 millones de toneladas por año. La misma tecnología que da sabor al glutamato monosódico alimenta tu recuperación.',
  },
  {
    emoji: '⚡',
    nombre: 'Dextrosa (D-glucosa)',
    subtitulo: 'El combustible directo para cada célula',
    color: { bg: 'bg-amber-50', border: 'border-amber-200', titulo: 'text-amber-800', badge: 'bg-amber-100 text-amber-700' },
    como: 'La dextrosa se obtiene por hidrólisis enzimática del almidón de maíz o trigo. La enzima alfa-amilasa rompe el almidón en cadenas cortas (dextrinas), luego la glucoamilasa libera glucosa individual. El producto se purifica, concentra y esteriliza para uso parenteral. La dextrosa monohidratada tiene 3.4 kcal/g (no 4 kcal/g como la glucosa oral).',
    funcion: 'Principal fuente de energía para el cerebro, eritrocitos y tejidos en cicatrización. En NP, se controla la velocidad de infusión de glucosa (VIG) para evitar hiperglucemia e hígado graso.',
    curiosidad: 'Las soluciones de dextrosa al 50% tienen una osmolalidad de ~2500 mOsm/L — más de 8 veces la sangre. Por eso nunca se infunden sin diluir en NP.',
  },
  {
    emoji: '🐟',
    nombre: 'Emulsión Lipídica (SMOF)',
    subtitulo: 'Cuatro fuentes de grasa en perfecta armonía',
    color: { bg: 'bg-violet-50', border: 'border-violet-200', titulo: 'text-violet-800', badge: 'bg-violet-100 text-violet-700' },
    como: 'Las emulsiones SMOF combinan cuatro fuentes: aceite de Soja (omega-6), Triglicéridos de Cadena Media (TCM, metabolismo rápido), aceite de Oliva (omega-9, efecto antiinflamatorio) y aceite de Pescado (omega-3: EPA/DHA). Se estabilizan con lecitina de huevo como emulsionante, formando gotas de 0.2–0.5 µm — invisibles al ojo, estables durante semanas si se mantienen a 2–8 °C.',
    funcion: 'Fuente densa de energía (9 kcal/g), aporte de ácidos grasos esenciales, vehículo de vitaminas liposolubles (A, D, E, K). Los omega-3 modulan la inflamación, reducen el daño hepático por NP prolongada.',
    curiosidad: 'Antes de las emulsiones de pescado, la NP prolongada causaba enfermedad hepática severa en muchos pacientes. El omega-3 cambió el pronóstico de miles de personas con NP crónica.',
  },
  {
    emoji: '🔬',
    nombre: 'Vitaminas',
    subtitulo: 'Micronutrientes que hacen funcionar todo lo demás',
    color: { bg: 'bg-blue-50', border: 'border-blue-200', titulo: 'text-blue-800', badge: 'bg-blue-100 text-blue-700' },
    como: 'Las vitaminas en NP provienen de síntesis química (C, B1, B12, ácido fólico) o extracción biológica. Se formulan en presentaciones estables: las hidrosolubles (B, C) se separan de las liposolubles (A, D, E, K) para prevenir incompatibilidades. Se agregan a la NP en el último momento de la preparación para minimizar degradación por luz y temperatura.',
    funcion: 'Cofactores enzimáticos esenciales. Sin vitamina B1 (tiamina) en NP, el paciente puede desarrollar encefalopatía de Wernicke. La vitamina K puede interferir con anticoagulantes y se monitorea cuidadosamente.',
    curiosidad: 'La vitamina C se degrada rápidamente con la luz. Las bolsas de NP se envuelven en fundas opacas no por estética sino para proteger las vitaminas durante la infusión.',
  },
  {
    emoji: '⚙️',
    nombre: 'Oligoelementos',
    subtitulo: 'Minerales traza con funciones gigantes',
    color: { bg: 'bg-emerald-50', border: 'border-emerald-200', titulo: 'text-emerald-800', badge: 'bg-emerald-100 text-emerald-700' },
    como: 'Los oligoelementos (zinc, cobre, manganeso, selenio, cromo, molibdeno) se formulan como sales inorgánicas o quelatos orgánicos de alta biodisponibilidad. Las preparaciones multitrace estándar están calibradas para adultos con función renal normal; en falla renal o estados de depleción se ajustan individualmente.',
    funcion: 'El zinc es esencial para más de 300 enzimas y para la cicatrización. El selenio protege contra el estrés oxidativo. El cobre es cofactor del sistema inmune. La deficiencia de zinc es la más frecuente en NP prolongada, especialmente con ostomías de alto gasto.',
    curiosidad: 'El manganeso se acumula en el cerebro con NP prolongada y puede causar síntomas similares al Parkinson. Por eso muchas guías modernas recomiendan no añadirlo de rutina después de varios meses de NP.',
  },
]

function ComponenteCard({ comp }) {
  const [abierto, setAbierto] = useState(false)
  const c = comp.color

  return (
    <div className={`${c.bg} border-2 ${c.border} rounded-2xl overflow-hidden`}>
      <button
        onClick={() => setAbierto(!abierto)}
        className="w-full flex items-center gap-4 p-5 text-left hover:brightness-95 transition-all"
      >
        <span className="text-4xl flex-shrink-0">{comp.emoji}</span>
        <div className="flex-1">
          <p className={`font-bold text-lg leading-tight ${c.titulo}`}>{comp.nombre}</p>
          <p className="text-slate-500 text-sm mt-0.5">{comp.subtitulo}</p>
        </div>
        {abierto
          ? <ChevronUp size={20} className="text-slate-400 flex-shrink-0" />
          : <ChevronDown size={20} className="text-slate-400 flex-shrink-0" />}
      </button>

      {abierto && (
        <div className="px-5 pb-5 space-y-4">
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${c.titulo}`}>¿Cómo se produce?</p>
            <p className="text-slate-600 text-base leading-relaxed">{comp.como}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${c.titulo}`}>¿Qué hace en tu cuerpo?</p>
            <p className="text-slate-600 text-base leading-relaxed">{comp.funcion}</p>
          </div>
          <div className={`${c.bg} border ${c.border} rounded-xl p-4`}>
            <div className="flex items-start gap-2">
              <Sparkles size={16} className="flex-shrink-0 mt-0.5 text-slate-400" />
              <p className="text-slate-600 text-sm leading-relaxed italic">{comp.curiosidad}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function BiotecnologiaNP() {
  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
        <div className="flex items-start gap-3 mb-3">
          <div className="bg-white/20 p-2 rounded-xl flex-shrink-0">
            <Dna size={22} />
          </div>
          <div>
            <p className="text-teal-200 text-sm font-medium">Ciencia en tu tratamiento</p>
            <h2 className="font-bold text-xl leading-tight">Tu bolsa de NP es biotecnología pura</h2>
          </div>
        </div>
        <p className="text-teal-100 text-base leading-relaxed">
          Cada componente de tu nutrición parenteral es el resultado de décadas de investigación científica. Esto es lo que hay detrás de cada goteo.
        </p>
      </div>

      {/* Proceso de fabricación */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <FlaskConical size={20} className="text-teal-600" />
          <p className="font-bold text-slate-800 text-base">La bolsa "todo en uno" (3-en-1)</p>
        </div>
        <p className="text-slate-600 text-base leading-relaxed mb-3">
          La mezcla 3-en-1 combina aminoácidos, dextrosa y lípidos en una sola bolsa EVA multicapa, fabricada en cabinas de flujo laminar con clase ISO 5 (menos bacterias por m³ que una sala de cirugía). El proceso requiere un orden específico de adición de componentes para evitar que el calcio y el fósforo precipiten, y que los cationes divalentes desestabilicen la emulsión lipídica.
        </p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {['Cabina ISO 5', 'Orden controlado', 'Prueba visual final'].map((paso, i) => (
            <div key={i} className="bg-teal-50 border border-teal-100 rounded-xl py-3 px-2">
              <p className="font-bold text-teal-700">{paso}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Componentes */}
      <div className="space-y-3">
        {componentes.map((c, i) => <ComponenteCard key={i} comp={c} />)}
      </div>

      <p className="text-center text-slate-400 text-sm pb-2">
        Información educativa basada en ESPEN 2023 y literatura científica revisada por pares.
      </p>
    </div>
  )
}
