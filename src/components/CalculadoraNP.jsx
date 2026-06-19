import { Activity, AlertCircle, AlertTriangle, Baby, BookOpen, CheckCircle, ChevronDown, ChevronUp, Clock, Dna, Download, Info, Printer, RotateCcw, Scale, Syringe } from 'lucide-react'
import { useState, useEffect } from 'react'

const CONDICIONES = [
  { id: 'reposo',          label: 'Sin estrés / reposo',              factor: 1.0, proteina: [1.0, 1.2], kcalRange: [20, 25] },
  { id: 'postop_menor',    label: 'Posoperatorio menor',               factor: 1.1, proteina: [1.2, 1.5], kcalRange: [20, 25] },
  { id: 'trauma_moderado', label: 'Infección / trauma moderado',       factor: 1.2, proteina: [1.5, 1.8], kcalRange: [22, 28] },
  { id: 'cirugia_mayor',   label: 'Cirugía mayor / infección severa',  factor: 1.3, proteina: [1.5, 2.0], kcalRange: [25, 30] },
  { id: 'sepsis',          label: 'Sepsis / trauma severo',            factor: 1.4, proteina: [1.5, 2.0], kcalRange: [25, 30] },
  { id: 'quemaduras',      label: 'Quemaduras extensas (>40% SCT)',    factor: 1.5, proteina: [1.5, 2.5], kcalRange: [30, 35] },
]

const LIPIDOS = [
  { id: 'soja',       label: 'Soja (Intralipid®)',               omega3: false },
  { id: 'oliva_soja', label: 'Oliva/Soja (ClinOleic®)',          omega3: false },
  { id: 'mixto',      label: 'Mixto SMOF (soja/MCT/oliva/pez)', omega3: true  },
  { id: 'microalgas', label: 'Omega-3 / Microalgas (Omegaven®)', omega3: true  },
]

// Perfiles patológicos clínicos (KDOQI 2020, ESPEN Renal 2024, ESPEN Liver 2022, ESPEN Cancer 2021)
const PERFILES_PATOLOGICOS = [
  {
    id: 'estandar',
    label: 'Estándar / General',
    grupo: null,
    kcalRange: null,
    proteina: null,
    tipoPesoSugerido: 'actual',
    fuente: null,
    nota: null,
    restricciones: [],
  },
  {
    id: 'renal_prediálisis',
    label: 'Renal — Pre-diálisis (TFG <25 mL/min)',
    grupo: 'renal',
    kcalRange: [30, 35],
    proteina: [0.60, 0.75],
    tipoPesoSugerido: 'seco',
    fuente: 'NKF-KDOQI 2020 · ESPEN Renal 2024',
    nota: 'Único escenario que justifica restricción proteica. Objetivo: retrasar inicio de diálisis. Si hay catabolismo significativo, subir a 0.75 g/kg/día.',
    restricciones: ['Fósforo: 10–15 mg/kg/día', 'Potasio: según ionograma del día', 'Líquidos: según diuresis residual'],
  },
  {
    id: 'renal_hd',
    label: 'Renal — Hemodiálisis crónica',
    grupo: 'renal',
    kcalRange: [30, 35],
    proteina: [1.2, 1.2],
    tipoPesoSugerido: 'seco',
    fuente: 'NKF-KDOQI 2020',
    nota: 'Usar peso seco post-diálisis. El filtro elimina AA libres (pérdida iatrogénica); el aporte debe compensarla.',
    restricciones: ['Fósforo: 10–15 mg/kg/día', 'Potasio: validar ionograma previo al cálculo'],
  },
  {
    id: 'renal_dp',
    label: 'Renal — Diálisis peritoneal',
    grupo: 'renal',
    kcalRange: [30, 35],
    proteina: [1.2, 1.3],
    tipoPesoSugerido: 'seco',
    fuente: 'NKF-KDOQI 2020 · ESPEN Renal 2024',
    nota: 'Pérdida proteica peritoneal continua. Contar calorías del dializante glucosado en el balance calórico total.',
    restricciones: ['Fósforo: 10–15 mg/kg/día', 'Contabilizar glucosa del líquido de diálisis'],
  },
  {
    id: 'renal_trrc',
    label: 'Renal — TRRC (terapia continua UCI)',
    grupo: 'renal',
    kcalRange: [25, 35],
    proteina: [1.5, 2.5],
    tipoPesoSugerido: 'actual',
    fuente: 'ESPEN ICU 2021 · ESPEN Renal 2024',
    nota: 'Hemofiltración elimina 10–15 g AA/día. Hipercatabolismo del paciente crítico requiere entrega masiva de nitrógeno.',
    restricciones: ['Fósforo: monitoreo c/24h', 'Potasio: ionograma c/8h', 'Vigilar hipofosfatemia de realimentación'],
  },
  {
    id: 'hepatico_compensado',
    label: 'Hepático — Cirrosis compensada',
    grupo: 'hepatico',
    kcalRange: [30, 35],
    proteina: [1.2, 1.5],
    tipoPesoSugerido: 'seco',
    fuente: 'ESPEN Liver Disease 2022',
    nota: 'Usar peso sin ascitis. Evitar ayuno >3h (ayuno acelerado cirrótico). Lípidos preferidos en esteatorrea: MCT/LCT.',
    restricciones: ['Sodio: restricción si ascitis', 'Zinc, vitaminas liposolubles: frecuentemente depletadas', 'Evitar sobrecarga de glucosa (IR frecuente)'],
  },
  {
    id: 'hepatico_descompensado',
    label: 'Hepático — Cirrosis descompensada / encefalopatía',
    grupo: 'hepatico',
    kcalRange: [35, 40],
    proteina: [1.2, 1.5],
    tipoPesoSugerido: 'seco',
    fuente: 'ESPEN Liver Disease 2022',
    nota: 'NO restringir proteínas en encefalopatía — el músculo sano detoxifica NH₃. Si hay intolerancia comprobada: AACR (leucina, isoleucina, valina), NO reducir dosis.',
    restricciones: ['Sodio: restricción estricta', 'AACR si intolerancia a proteína mixta', 'Reponer vitaminas liposolubles'],
  },
  {
    id: 'oncologico',
    label: 'Oncológico / Caquexia tumoral',
    grupo: 'oncologico',
    kcalRange: [20, 25],
    proteina: [1.0, 1.5],
    tipoPesoSugerido: 'actual',
    fuente: 'ESPEN Cancer 2021 · ASPEN Oncology Guidelines',
    nota: 'No sobrealimentar — solo agrava insulinorresistencia tumoral. Objetivo: ralentizar atrofia muscular, no revertir peso. Omega-3 (EPA) puede atenuar inflamación catabólica.',
    restricciones: ['Lípidos: 30–50% de cal no proteicas', 'Preferir Omega-3 (EPA) si disponible', 'Monitoreo de hiperglucemia frecuente'],
    tigMax: null,
  },
  // ── Perfiles Neonatal / Pediátrico ─────────────────────────────────────────
  // Fuentes: Manual CCSS Farmacias Soporte Nutricional 2018 (Anexo 4-5, HNN); ASPEN Pediatric PN Guidelines
  {
    id: 'neonato_prematuro',
    label: 'Neonatal — Prematuro extremo',
    grupo: 'pediatrico',
    kcalRange: [110, 150],
    proteina: [3.5, 4.0],
    tipoPesoSugerido: 'actual',
    fuente: 'Manual CCSS HNN 2018 · ASPEN Pediatric Guidelines',
    nota: 'Al nacer cesa la infusión placentaria de nutrientes. Sin AA desde las primeras horas se produce catabolismo severo que afecta irreversiblemente el neurodesarrollo.',
    restricciones: ['TIG inicio: 4–6 mg/kg/min → máx 11–12 mg/kg/min (Manual CCSS HNN)', 'Exceder TIG 12 → lipogénesis hepática + retención CO₂ → falla en extubación', 'Calcio y fósforo: curva de solubilidad crítica en prematuros', 'Nunca exceder 16–18 g glucosa/kg/día (riesgo de esteatosis hepática fulminante)'],
    tigInicio: [4, 6],
    tigMax: 12,
  },
  {
    id: 'neonato_termino',
    label: 'Neonatal — Neonato a término (0–1 año)',
    grupo: 'pediatrico',
    kcalRange: [90, 100],
    proteina: [2.5, 3.5],
    tipoPesoSugerido: 'actual',
    fuente: 'Manual CCSS HNN 2018 · ASPEN Pediatric Guidelines',
    nota: 'Iniciar AA en las primeras 24h. Aporte calórico no proteico suficiente es obligatorio para evitar que los AA se usen como energía.',
    restricciones: ['TIG inicio: 6–8 mg/kg/min → máx 11–12 mg/kg/min (Manual CCSS HNN)', 'Glucosa >12 mg/kg/min → esteatosis hepática; nunca exceder 16–18 g/kg/día', 'Oligoelementos: Cu, Mn, Zn, Se (0.2 mL/kg/día multi-oligo pediátrico)'],
    tigInicio: [6, 8],
    tigMax: 12,
  },
  {
    id: 'pediatrico_infante',
    label: 'Pediátrico — Infante (1–7 años)',
    grupo: 'pediatrico',
    kcalRange: [75, 90],
    proteina: [1.5, 2.0],
    tipoPesoSugerido: 'actual',
    fuente: 'Manual CCSS HNN 2018 · ASPEN Pediatric Guidelines',
    nota: 'Ajustar progresivamente según tolerancia. Lípidos: 30–40% de calorías no proteicas. Monitoreo glucémico estricto.',
    restricciones: ['TIG máximo: 12 mg/kg/min', 'Monitoreo de triglicéridos c/3 días si infusión lipídica >1 g/kg/día'],
    tigInicio: [6, 8],
    tigMax: 12,
  },
  {
    id: 'pediatrico_escolar',
    label: 'Pediátrico — Escolar (7–12 años)',
    grupo: 'pediatrico',
    kcalRange: [60, 75],
    proteina: [1.5, 2.0],
    tipoPesoSugerido: 'actual',
    fuente: 'Manual CCSS HNN 2018 · ASPEN Pediatric Guidelines',
    nota: 'Requerimientos decrecientes con la edad. TIG similar al adulto. Vigilar sobrecarga calórica en NP prolongada.',
    restricciones: ['TIG máximo: 7–10 mg/kg/min', 'Vigilar síndrome de realimentación si desnutrición previa severa'],
    tigInicio: [5, 7],
    tigMax: 10,
  },
  {
    id: 'pediatrico_adolescente',
    label: 'Pediátrico — Adolescente (12–18 años)',
    grupo: 'pediatrico',
    kcalRange: [35, 50],
    proteina: [1.0, 1.5],
    tipoPesoSugerido: 'actual',
    fuente: 'Manual CCSS HNN 2018 · ASPEN Pediatric Guidelines',
    nota: 'Aproximación gradual al metabolismo adulto. Usar peso actual; si hay obesidad, calcular peso ajustado igual que en adultos.',
    restricciones: ['TIG máximo: 7 mg/kg/min (igual al adulto)', 'Vigilar hiperglucemia y dislipidemia'],
    tigInicio: [4, 6],
    tigMax: 7,
  },
]

const BASE_CONOCIMIENTO = {
  postop_menor: {
    titulo: 'Respuesta metabólica al estrés quirúrgico menor',
    mecanismo: 'La cirugía activa el eje hipotálamo-hipófisis-suprarrenal elevando cortisol y catecolaminas 2–4× sobre basal durante 24–72 horas. Esto produce proteólisis muscular leve y resistencia periférica a la insulina por reducción de GLUT-4 en músculo.',
    cambios: [
      'Proteólisis muscular leve — balance nitrogenado negativo transitorio',
      'Hiperglucemia de estrés por gluconeogénesis hepática aumentada',
      'Síntesis de proteínas de fase aguda: PCR, fibrinógeno (↑ consumo de aminoácidos)',
      'Retención hídrica moderada mediada por ADH y aldosterona',
    ],
    fundamento: 'ESPEN 2019 recomienda 1.2–1.5 g proteína/kg/día en cirugía electiva menor. El factor de estrés ×1.1 se aplica sobre el GEB calculado por Harris-Benedict para estimar el GET real.',
    referencias: [
      'ESPEN Guidelines on Clinical Nutrition in Surgery. Clin Nutr. 2017;36(3):623-650.',
      'ASPEN Clinical Guidelines: Nutrition Support of Hospitalized Adult Patients (2016).',
    ],
  },
  trauma_moderado: {
    titulo: 'Síndrome de Respuesta Inflamatoria Sistémica (SIRS)',
    mecanismo: 'La infección o trauma desencadena liberación de IL-1β, IL-6 y TNF-α. Estas citoquinas aceleran el catabolismo proteico en músculo esquelético para proveer aminoácidos a la síntesis de proteínas de emergencia y proliferación de células inmunitarias. La glutamina es consumida a 3–5× sobre la tasa basal.',
    cambios: [
      'Catabolismo proteico acelerado: hasta 20% sobre basal',
      'Gluconeogénesis hepática sostenida — hiperglucemia resistente al aporte calórico exógeno',
      'Hipertrigliceridemia por lipólisis mediada por TNF-α e IL-6',
      'Déficit de zinc, selenio y vitaminas antioxidantes (A, C, E) por consumo aumentado',
    ],
    fundamento: 'ASPEN/SCCM 2016 recomiendan 1.5–1.8 g proteína/kg/día en SIRS moderado. La relación NPC:N de 100–150:1 minimiza la utilización de aminoácidos como sustrato energético.',
    referencias: [
      'ASPEN/SCCM Guidelines for Provision of Nutrition Support Therapy in the Adult Critically Ill Patient (2016).',
      'ESPEN Intensive Care Guidelines. Clin Nutr. 2019;38(1):48-79.',
    ],
  },
  cirugia_mayor: {
    titulo: 'Respuesta catabólica severa — cirugía mayor / infección grave',
    mecanismo: 'La cirugía mayor provoca pico de cortisol 4–6× sobre basal sostenido 48–72 horas. La GH sube paradójicamente pero con resistencia periférica (estado catabólico paradójico). La proteólisis muscular puede alcanzar 150–200 g de músculo/día sin soporte nutricional adecuado.',
    cambios: [
      'Pérdida muscular de 0.5–1 kg/día si el aporte proteico es insuficiente',
      'Hiperglucemia de estrés — objetivo glucémico UCI: 140–180 mg/dL (ASPEN 2016)',
      'Síntesis hepática prioritaria de fibrinógeno, PCR, alfa-2 macroglobulina',
      'Hipocalemia e hipofosfatemia por captación celular aumentada durante la síntesis proteica',
    ],
    fundamento: 'ESPEN 2021: iniciar NP dentro de 24–48h si la vía enteral es imposible. Aporte proteico 1.5–2.0 g/kg/día. En IMC >30 ajustar al peso ideal. Evitar sobrealimentación calórica la primera semana.',
    referencias: [
      'ESPEN Guidelines on Clinical Nutrition in Surgery. Clin Nutr. 2017;36(3):623-650.',
      'ESPEN ICU Guidelines — actualización 2021. Clin Nutr. 2021;40(10):5271-5319.',
    ],
  },
  sepsis: {
    titulo: 'Sepsis y trauma severo — estado hipercatabólico',
    mecanismo: 'La sepsis induce "metabolic reprogramming" en macrófagos M1: la glucólisis aeróbica (efecto Warburg inmune) consume glucosa y glutamina a velocidad 10× basal. La proteólisis muscular puede superar 300 g de tejido/día.',
    cambios: [
      'Depleción de glutamina plasmática (< 420 μmol/L = marcador de mal pronóstico)',
      'Gluconeogénesis hepática sostenida incluso con aportes exógenos de glucosa',
      'Disfunción mitocondrial — reducida capacidad oxidativa celular',
      'Insulinorresistencia severa — frecuente necesidad de insulina en infusión continua',
    ],
    fundamento: 'ASPEN/SCCM 2016: en sepsis iniciar NP hipocalórica (<20 kcal/kg/día) la primera semana. La sobrealimentación eleva el CO₂ y empeora el pronóstico ventilatorio. Meta proteica: 1.5–2.0 g/kg/día.',
    referencias: [
      'ASPEN/SCCM Guidelines for Adult ICU Nutrition (2016). JPEN. 2016;40(2):159-211.',
      'ESPEN Intensive Care Guidelines. Clin Nutr. 2019;38(1):48-79.',
    ],
  },
  quemaduras: {
    titulo: 'Quemaduras extensas — hipermetabolismo extremo',
    mecanismo: 'El paciente quemado presenta el mayor estado hipercatabólico conocido. La destrucción de la barrera cutánea genera pérdida proteica directa por exudado (30–50 g/m² SCQ/día). Las catecolaminas permanecen elevadas semanas.',
    cambios: [
      'GEB 1.5–2.0× sobre basal sostenido semanas (no solo días)',
      'Pérdida proteica directa por herida: 30–50 g/m² de SCQ quemada/día',
      'Hipercatabolismo muscular: pérdida de 15–25% de masa muscular en 3 semanas',
      'Insulinorresistencia severa — prácticamente universal en quemaduras >30% SCT',
    ],
    fundamento: 'ASPEN 2013: iniciar NE/NP dentro de 6 horas del quemado severo. Meta proteica: 1.5–2.5 g/kg/día. En quemaduras >50% SCT, el factor ×1.5 subestima; preferir calorimetría indirecta o fórmula de Curreri.',
    referencias: [
      'ASPEN Burn Support Nutrition Guidelines (2013). JPEN. 2013;37(3):305-316.',
      'ESPEN Guidelines on Clinical Nutrition in Surgery (2017).',
    ],
  },
}

function calcPesoIdeal(talla, sexo) {
  if (!talla) return null
  return Math.round(sexo === 'M' ? talla - 100 : talla - 105)
}

function BaseConocimientoPanel({ datos }) {
  const [abierto, setAbierto] = useState(false)
  return (
    <div className="border border-indigo-200 rounded-xl bg-indigo-50 overflow-hidden">
      <button
        onClick={() => setAbierto(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-indigo-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <BookOpen size={15} className="text-indigo-600 flex-shrink-0" />
          <span className="text-xs font-bold text-indigo-700">{datos.titulo}</span>
          <span className="text-[10px] bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full font-semibold">ASPEN / ESPEN</span>
        </div>
        {abierto ? <ChevronUp size={14} className="text-indigo-500" /> : <ChevronDown size={14} className="text-indigo-500" />}
      </button>

      {abierto && (
        <div className="px-4 pb-4 space-y-3 border-t border-indigo-200">
          <div className="pt-3">
            <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Mecanismo fisiológico</p>
            <p className="text-xs text-indigo-900 leading-relaxed">{datos.mecanismo}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Cambios metabólicos esperados</p>
            <ul className="space-y-1">
              {datos.cambios.map((c, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs text-indigo-900">
                  <span className="text-indigo-400 mt-0.5 flex-shrink-0">▸</span>{c}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white rounded-lg p-3 border border-indigo-100">
            <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Fundamento científico</p>
            <p className="text-xs text-slate-700 leading-relaxed">{datos.fundamento}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-indigo-700 uppercase tracking-wide mb-1">Referencias</p>
            {datos.referencias.map((r, i) => (
              <p key={i} className="text-[11px] text-slate-500 italic leading-snug">{r}</p>
            ))}
          </div>
          <p className="text-[10px] text-indigo-400 text-center pt-1 border-t border-indigo-100">
            Contenido educativo — no sustituye valoración clínica individualizada
          </p>
        </div>
      )}
    </div>
  )
}

const SEMAFORO_BG   = { rojo: 'bg-red-50 border-red-200',    amarillo: 'bg-amber-50 border-amber-200',   verde: 'bg-emerald-50 border-emerald-200' }
const SEMAFORO_TEXT = { rojo: 'text-red-700',                 amarillo: 'text-amber-700',                 verde: 'text-emerald-700' }

function SemaforoIcon({ nivel }) {
  if (nivel === 'rojo')     return <AlertTriangle size={22} className="text-red-600" />
  if (nivel === 'amarillo') return <AlertCircle   size={22} className="text-amber-500" />
  return <CheckCircle size={22} className="text-emerald-500" />
}

function calcBEE(peso, talla, edad, sexo) {
  if (sexo === 'M') return 66.5  + 13.75 * peso + 5.003 * talla - 6.775 * edad
  return               655.1 +  9.563 * peso + 1.85  * talla - 4.676 * edad
}

// mNUTRIC Score sin IL-6 (Heyland 2011; Rahman 2016 validación)
// Variables: edad, APACHE II, SOFA, nº comorbilidades, días hospital→UCI
function calcNutricScore({ edad, apache, sofa, comorbilidades, diasHospUCI }) {
  let score = 0
  if (edad >= 75) score += 2
  else if (edad >= 50) score += 1
  if (apache >= 28) score += 3
  else if (apache >= 20) score += 2
  else if (apache >= 15) score += 1
  if (sofa >= 10) score += 2
  else if (sofa >= 6) score += 1
  if (comorbilidades >= 2) score += 1
  if (diasHospUCI >= 1) score += 1
  return {
    score,
    riesgo: score >= 5 ? 'alto' : 'bajo',
    label:  score >= 5 ? 'Alto riesgo nutricional — beneficio demostrado de soporte agresivo' : 'Bajo riesgo — soporte estándar',
    color:  score >= 5 ? 'red' : 'emerald',
    detalle: [
      { var: 'Edad',                    pts: edad >= 75 ? 2 : edad >= 50 ? 1 : 0,    ref: `${edad} años` },
      { var: 'APACHE II',               pts: apache >= 28 ? 3 : apache >= 20 ? 2 : apache >= 15 ? 1 : 0, ref: apache },
      { var: 'SOFA',                    pts: sofa >= 10 ? 2 : sofa >= 6 ? 1 : 0,     ref: sofa },
      { var: 'Comorbilidades (nº)',      pts: comorbilidades >= 2 ? 1 : 0,            ref: comorbilidades },
      { var: 'Días hospital → UCI',      pts: diasHospUCI >= 1 ? 1 : 0,              ref: `${diasHospUCI}d` },
    ],
  }
}

function calcEstabilidad(caTotal, po4Total, mgTotal, volumen, conLipidos) {
  if (!caTotal || !po4Total || !volumen) return null
  const caConc  = (caTotal  / volumen) * 1000
  const po4Conc = (po4Total / volumen) * 1000
  const mgConc  = (mgTotal  / volumen) * 1000
  const producto  = caConc * po4Conc
  const divalentes = caConc + mgConc

  let nivel = 'verde'
  const mensajes = []

  if (caConc > 15 || po4Conc > 20 || producto > 200) {
    nivel = 'rojo'
    mensajes.push('Riesgo ALTO de precipitación calcio-fosfato. Revisar con farmacéutico antes de preparar.')
  } else if (caConc > 10 || po4Conc > 15 || producto > 150) {
    nivel = 'amarillo'
    mensajes.push('Riesgo moderado Ca-PO₄. Verificar orden de mezcla y pH con farmacéutico.')
  } else {
    mensajes.push('Estabilidad calcio-fosfato dentro de parámetros seguros.')
  }

  if (conLipidos && divalentes > 10) {
    if (nivel === 'verde') nivel = 'amarillo'
    mensajes.push(`Cationes divalentes (Ca²⁺ + Mg²⁺): ${divalentes.toFixed(1)} mEq/L — supera límite de 10 mEq/L para emulsión lipídica.`)
  } else if (conLipidos) {
    mensajes.push(`Cationes divalentes (Ca²⁺ + Mg²⁺): ${divalentes.toFixed(1)} mEq/L — dentro del límite para emulsión lipídica.`)
  }

  return { nivel, caConc: caConc.toFixed(1), po4Conc: po4Conc.toFixed(1), mgConc: mgConc.toFixed(1), producto: Math.round(producto), mensajes }
}

// 5-level osmolarity classification (Pereira Da Silva / CCSS Manual SNF 2018 / SENPE / ASPEN)
// CCSS establece <700 mOsm/L para vía periférica segura (Manual Farmacias Soporte Nutricional, 2018)
function getViaZone(osm) {
  if (osm > 1800) return { zone: 'critica', color: 'red',     label: 'CVC OBLIGATORIO — alerta fisicoquímica crítica', desc: 'Riesgo de inestabilidad fisicoquímica y precipitación de sales. Revisar dilución volumétrica urgente.' }
  if (osm > 900)  return { zone: 'alta',    color: 'red',     label: 'Venosa central exclusiva (CVC / PICC)',           desc: 'Osmolaridad >900 mOsm/L: riesgo grave de tromboflebitis en venas periféricas. CVC obligatorio (ESPEN/ASPEN).' }
  if (osm > 800)  return { zone: 'riesgo',  color: 'orange',  label: 'Transición a central — periférica contraindicada', desc: 'Zona de alto riesgo. Límite absoluto tolerado periféricamente. Alta incidencia de esclerosis vascular si se mantiene.' }
  if (osm > 700)  return { zone: 'media',   color: 'amber',   label: 'Periférica con cautela (≤ 5 días)',                desc: 'Tolerable en venas de buen calibre. Requiere rotación de sitios de punción. Máximo 5 días periférico (SENPE). CCSS establece <700 como límite seguro.' }
  return             { zone: 'baja',    color: 'emerald', label: 'Periférica segura (<700 mOsm/L — CCSS)',           desc: 'Dentro del límite CCSS (<700 mOsm/L). Solución con riesgo mínimo de daño endotelial periférico.' }
}

const VIA_ZONE_STYLES = {
  red:     'bg-red-50 border-red-200 text-red-700',
  orange:  'bg-orange-50 border-orange-200 text-orange-700',
  amber:   'bg-amber-50 border-amber-200 text-amber-700',
  emerald: 'bg-emerald-50 border-emerald-200 text-emerald-700',
}
const VIA_ICON_COLOR = {
  red:     'text-red-500',
  orange:  'text-orange-500',
  amber:   'text-amber-500',
  emerald: 'text-emerald-500',
}

const REFERENCIAS_CLINICAS = [
  { label: 'Manual CCSS Farmacias SNF 2018',              descripcion: 'Manual de Procedimientos de las Farmacias de Soporte Nutricional Clínico. CCSS / CENDEISSS. Código MP.GM.DDSS.ARSDT.CNSF.201118 Versión 01.',                                          uso: 'Osmolaridad periférica <700 mOsm/L · Na ≤154 · K ≤80 · Mg ≤20 mEq/L · Volumen máx 3000 mL · Glucosa mín 5% en 3-en-1 · Estabilidad mezclas' },
  { label: 'Manual CCSS HNN 2018',                        descripcion: 'Manual de Procedimientos Farmacia Hospital Nacional de Niños. CCSS. San José, Costa Rica.',                                                                                              uso: 'TIG máx 11-12 mg/kg/min neonatos · Oligoelementos 0.2 mL/kg/día · Glucosa máx 18 g/kg/día pediátrico' },
  { label: 'Protocolo Soporte Nutricional COVID-19 CCSS', descripcion: 'Protocolo de Atención de Pacientes Hospitalizados Portadores de COVID-19 que Requieren Soporte Nutricional. Código PAC.GM.DDSS-CN 250320. Gerencia Médica CCSS, 2020.',              uso: 'NPS indicada cuando aporte previo <66% del requerimiento · Osmolaridad >800 mOsm → catéter central · Retirar NP cuando enteral cubre ≥66-80%' },
  { label: 'Pereira Da Silva et al., Nutr Hosp 2015',     descripcion: 'Ecuación de estimación de osmolaridad de mezclas de NP. Mejor correlación clínica vs osmometría real.',                                                                               uso: 'Cálculo de osmolaridad: glucosaG/L × 5.55 + aaG/L × 8.0 + mEq electrolitos/L × 2' },
  { label: 'Harris-Benedict (1919), revisión Roza 1984',  descripcion: 'Ecuación predictiva del gasto energético basal (GEB/BEE) según peso, talla, edad y sexo.',                                                                                           uso: 'GEB en todos los perfiles adultos cuando se usa método Harris-Benedict' },
  { label: 'ASPEN Clinical Nutrition Guidelines 2016',     descripcion: 'American Society for Parenteral and Enteral Nutrition. Clinical Nutrition Guidelines. 2016.',                                                                                           uso: 'Peso ajustado obesidad: PI + 0.25×(PA−PI) con IMC ≥30 · TIG adultos ≤5 mg/kg/min en NP 2-en-1' },
  { label: 'ESPEN Guidelines ICU 2019',                    descripcion: 'Clin Nutr. 2019;38(1):48-79. ESPEN guideline on clinical nutrition in the ICU.',                                                                                                       uso: 'Propofol: 1.1 kcal/mL (vehículo lipídico) · NP suplementaria · Retiro NP cuando enteral ≥66-80%' },
  { label: 'ESPEN Liver Disease 2020',                     descripcion: 'Clin Nutr. 2020. ESPEN clinical nutrition guideline on clinical nutrition in liver disease.',                                                                                           uso: 'Perfil hepático: proteína 1.2-1.5 g/kg/día · kcal 25-35 · calorías nocturnas' },
  { label: 'ESPEN Oncology 2021',                          descripcion: 'Clin Nutr. 2021. ESPEN guideline on clinical nutrition in cancer.',                                                                                                                    uso: 'Perfil oncológico: kcal 25-30 · proteína 1.2-2.0 g/kg/día' },
  { label: 'NKF-KDOQI 2020',                              descripcion: 'National Kidney Foundation — Kidney Disease Outcomes Quality Initiative. Clinical Practice Guidelines for Nutrition in CKD 2020.',                                                       uso: 'Perfil renal: restricción K, P, Na · kcal 25-35 · proteína según modalidad diálisis' },
  { label: 'Bistrian BR et al., JPEN 1979',               descripcion: 'Bistrian BR, Blackburn GL, Scrimshaw NS. Cellular immunity in semistarved states in hospitalized adults. Am J Clin Nutr.',                                                          uso: 'Índice de Estrés Metabólico: NUU_obs − (0.5 × N_ingerido + 3)' },
  { label: 'Heyland DK et al., JPEN 2011 (mNUTRIC)',      descripcion: 'Heyland DK et al. Identifying critically ill patients who benefit the most from nutritional therapy. Crit Care Med. 2011. Modificado por Rahman 2016 (sin IL-6).',                 uso: 'mNUTRIC Score: edad · APACHE II · SOFA · comorbilidades · días hospital→UCI. 0-4 bajo riesgo · 5-9 alto riesgo' },
  { label: 'Holliday-Segar (1957)',                        descripcion: 'Holliday MA, Segar WE. The maintenance need for water in parenteral fluid therapy. Pediatrics. 1957.',                                                                               uso: 'Estimación fluidos pediátricos: 0-10 kg 100 mL/kg; 10-20 kg 1000+50/kg; >20 kg 1500+20/kg' },
  { label: 'CENDEISSS — búsqueda de actualización',        descripcion: 'Búsqueda activa de actualizaciones del Manual SNF realizada en CENDEISSS, BINASSS y repositorio CCSS (junio 2026). El Manual SNF 2018 permanece como versión vigente única.',       uso: 'Confirmación de vigencia del Manual SNF 2018 como normativa oficial CCSS' },
]

const CHECKLIST_ENFERMERIA = [
  'Verificar aspecto de la bolsa antes de conectar: color uniforme, sin capas separadas ni partículas flotantes.',
  'Conectar con técnica aséptica estricta. Proteger la bolsa de la luz directa durante la infusión.',
  'Registrar glicemia capilar al inicio, a las 2 h y al finalizar; ajustar insulina según protocolo.',
  'Curaciones de vía central: cada 72 h con membrana Tegaderm, o antes si hay signos de infección.',
  'Registrar balance hídrico completo (ingesta/excreta) y curva febril en cada turno.',
  'Traslado a quirófano/imagen: suspender NP y conectar Dextrosa 10% a 83 cc/h hasta reanudar.',
  'Al suspender NP: mantener Dextrosa 10% al menos 1 h para evitar hipoglucemia de rebote.',
  'Iniciar destete cuando el paciente tolere ≥66% de requerimientos por vía enteral u oral.',
]

export default function CalculadoraNP() {
  const [form, setForm] = useState({
    peso: '', talla: '', edad: '', sexo: 'F',
    modoCalculo: 'harris_benedict',
    kcalKg: '', ambulatorio: false,
    condicion: 'reposo', proteinaGKg: '',
    uun24h: '', corrFactor: '2', diabetico: false,
    horasInfusion: '24', pediatrico: false,
    conLipidos: true, lipido: 'mixto', volumen: '',
    // Electrolitos (mEq totales en la bolsa)
    na: '', k: '', ca: '', po4: '', mg: '',
    // Perfil patológico y tipo de peso
    perfilPatologico: 'estandar',
    tipoPeso: 'actual',
    pesoSeco: '',
    // NP Parcial / Suplementaria — aportes previos orales/enterales/propofol
    tipNP: 'total',
    aporteOralKcal: '', aporteOralProt: '', propofolML: '',
    // mNUTRIC Score (Heyland 2011) — UCI adultos
    nutricEdad: '', nutricApache: '', nutricSofa: '', nutricComorbilidades: '', nutricDiasHospUCI: '',
  })
  const [resultado, setResultado] = useState(null)
  const [errores, setErrores]     = useState([])
  const [nutricResult, setNutricResult] = useState(null)
  const [showNutric, setShowNutric]     = useState(false)
  const [showRefs, setShowRefs]         = useState(false)

  // Identidad profesional — solo en localStorage del dispositivo del usuario, nunca en servidor
  const [profesional, setProfesional] = useState(() => {
    try {
      const s = localStorage.getItem('nutrivida_pro')
      return s ? JSON.parse(s) : { nombre: '', colegiado: '' }
    } catch { return { nombre: '', colegiado: '' } }
  })
  useEffect(() => {
    try { localStorage.setItem('nutrivida_pro', JSON.stringify(profesional)) } catch {}
  }, [profesional])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const condActual   = CONDICIONES.find(c => c.id === form.condicion)
  const perfilActual = PERFILES_PATOLOGICOS.find(p => p.id === form.perfilPatologico)

  // Derived anthropometric values for display
  const pesoActualN = parseFloat(form.peso) || 0
  const tallaN      = parseFloat(form.talla) || 0
  const pesoIdealCalc  = tallaN ? calcPesoIdeal(tallaN, form.sexo) : null
  const imcCalc        = (tallaN && pesoActualN) ? (pesoActualN / ((tallaN / 100) ** 2)).toFixed(1) : null
  const pesoAjustadoCalc = (pesoIdealCalc && pesoActualN > pesoIdealCalc)
    ? Math.round(pesoIdealCalc + 0.25 * (pesoActualN - pesoIdealCalc))
    : null
  const esObeso = imcCalc && parseFloat(imcCalc) >= 30

  // Energy range: profile overrides condition when active
  const kcalMin = form.ambulatorio ? 30
    : (perfilActual?.kcalRange?.[0] ?? condActual?.kcalRange[0] ?? 20)
  const kcalMax = form.ambulatorio ? 35
    : (perfilActual?.kcalRange?.[1] ?? condActual?.kcalRange[1] ?? 25)

  // Protein range: profile overrides condition when active
  const protMin = perfilActual?.proteina?.[0] ?? condActual?.proteina[0] ?? 1.0
  const protMax = perfilActual?.proteina?.[1] ?? condActual?.proteina[1] ?? 1.5

  const calcular = () => {
    const peso  = parseFloat(form.peso)
    const vol   = parseFloat(form.volumen)
    const horas = parseFloat(form.horasInfusion) || 24

    const faltantes = []
    if (!peso) faltantes.push('Peso real (kg)')
    if (!vol)  faltantes.push('Volumen total de la mezcla (mL)')
    if (form.modoCalculo === 'kcal_kg') {
      if (!parseFloat(form.kcalKg)) faltantes.push('Objetivo calórico (kcal/kg/día)')
    } else {
      if (!parseFloat(form.talla)) faltantes.push('Talla (cm)')
      if (!parseFloat(form.edad))  faltantes.push('Edad (años)')
    }
    if (faltantes.length > 0) { setErrores(faltantes); return }
    setErrores([])

    // ── Validación volumen máximo CCSS (Manual Farmacias SNF 2018, p.12) ─────
    if (vol > 3000) {
      setErrores([`Volumen ${vol} mL supera el máximo de 3000 mL por bolsa establecido por el Manual CCSS de Farmacias de Soporte Nutricional (p. 12). Ajustar volumen o dividir en dos bolsas.`])
      return
    }

    // ── Peso de cálculo ──────────────────────────────────────────────────────
    let pesoCal = peso
    let pesoCalDesc = 'Peso actual'
    if (form.tipoPeso === 'seco' && parseFloat(form.pesoSeco)) {
      pesoCal = parseFloat(form.pesoSeco)
      pesoCalDesc = 'Peso seco'
    } else if (form.tipoPeso === 'ajustado' && pesoIdealCalc && peso > pesoIdealCalc) {
      pesoCal = pesoIdealCalc + 0.25 * (peso - pesoIdealCalc)
      pesoCalDesc = `Peso ajustado (obeso)`
    }

    // ── NP Parcial — aportes previos que la NP debe descontar ────────────────
    const esParcial      = form.tipNP === 'parcial'
    const aporteKcalPrev = esParcial ? (parseFloat(form.aporteOralKcal) || 0) + (parseFloat(form.propofolML) || 0) * 1.1 : 0
    const aportePrevProt = esParcial ? (parseFloat(form.aporteOralProt) || 0) : 0

    // ── Energía ──────────────────────────────────────────────────────────────
    let tenTotal, bee
    if (form.modoCalculo === 'kcal_kg') {
      bee = null
      tenTotal = parseFloat(form.kcalKg) * pesoCal
    } else {
      const talla = parseFloat(form.talla)
      const edad  = parseFloat(form.edad)
      bee = calcBEE(pesoCal, talla, edad, form.sexo)
      tenTotal = bee * condActual.factor
    }
    // La NP solo cubre el déficit en modo parcial
    const ten = Math.max(0, tenTotal - aporteKcalPrev)

    // ── Proteína ─────────────────────────────────────────────────────────────
    const corrFactor    = parseFloat(form.corrFactor) || 2
    const uun           = parseFloat(form.uun24h)
    const protFormulaTotal = (parseFloat(form.proteinaGKg) || ((protMin + protMax) / 2)) * pesoCal
    const protFromUUN   = uun > 0 ? (uun + corrFactor) * 6.25 : null
    const protTotal     = protFromUUN ?? protFormulaTotal
    // NP Parcial: descontar proteína ya recibida vía oral/enteral
    const protG         = Math.max(0, protTotal - aportePrevProt)
    const protFormula   = Math.max(0, protFormulaTotal - aportePrevProt)

    // ── Macronutrientes ───────────────────────────────────────────────────────
    const kcalProt  = protG * 4
    const npc       = ten - kcalProt
    // Sin lípidos (2-en-1): todo el NPC va a dextrosa (65% sería déficit calórico)
    const dextrosaG = form.conLipidos
      ? Math.max(0, (npc * 0.65) / 3.4)
      : Math.max(0, npc / 3.4)
    const lipidoG   = form.conLipidos ? Math.max(0, (npc * 0.35) / 10) : 0
    const nitrogeno = protG / 6.25
    const npcN      = npc / (nitrogeno || 1)

    // ── Osmolaridad — Ecuación Pereira Da Silva et al. 2015 ──────────────────
    // Formula: (g glucosa/L × 5.55) + (g AA/L × 8.0) + (lípidos × 0) + (mEq electrolitos/L × 2)
    // Lípidos no contribuyen: son isotónicos (~300 mOsm intrínseco), fase dispersa micelar
    const glucosaG_L  = dextrosaG / vol * 1000
    const aaG_L       = protG    / vol * 1000
    const naTotal     = parseFloat(form.na)  || 0
    const kTotal      = parseFloat(form.k)   || 0
    const caTotal_e   = parseFloat(form.ca)  || 0
    const mgTotal_e   = parseFloat(form.mg)  || 0
    const po4Total_e  = parseFloat(form.po4) || 0
    const totalMEq_L  = (naTotal + kTotal + caTotal_e + mgTotal_e + po4Total_e) / vol * 1000
    const osmolaridad = Math.round(glucosaG_L * 5.55 + aaG_L * 8.0 + totalMEq_L * 2)

    const viaInfo = getViaZone(osmolaridad)

    // ── Estabilidad Ca-PO4 ───────────────────────────────────────────────────
    const caTotal  = parseFloat(form.ca)  || 0
    const po4Total = parseFloat(form.po4) || 0
    const mgTotal  = parseFloat(form.mg)  || 0
    const estabilidad = caTotal > 0 || po4Total > 0
      ? calcEstabilidad(caTotal, po4Total, mgTotal, vol, form.conLipidos)
      : null

    // ── Balance nitrogenado ──────────────────────────────────────────────────
    let balanceN    = null
    let bistrianData = null
    if (uun > 0) {
      const nIntake  = nitrogeno
      const nLoss    = uun + corrFactor
      const nBalance = nIntake - nLoss
      balanceN = {
        nBalance:      nBalance.toFixed(1),
        estado:        nBalance > 1 ? 'anabolico' : nBalance < -1 ? 'catabolico' : 'neutro',
        protFormula:   Math.round(protFormula),
        protNeutral:   Math.round((uun + corrFactor) * 6.25),
        protNeutralKg: ((uun + corrFactor) * 6.25 / pesoCal).toFixed(2),
        nLoss:         nLoss.toFixed(1),
      }

      // Índice de Estrés de Bistrian: NUU_obs − (0.5 × N_ingerido + 3)
      const nUUBasal = 0.5 * nIntake + 3
      const indice   = uun - nUUBasal
      bistrianData = {
        indice:      indice.toFixed(1),
        nUUBasal:    nUUBasal.toFixed(1),
        nivel:       indice > 8 ? 'grave' : indice > 5 ? 'moderado' : indice > 0 ? 'leve' : 'minimo',
        descripcion: indice > 8
          ? 'Estrés grave — sepsis fulminante, gran quemado, SDMO'
          : indice > 5
          ? 'Estrés moderado — infección sistémica, trauma extenso'
          : indice > 0
          ? 'Estrés leve — respuesta a trauma quirúrgico menor'
          : 'Sin estrés metabólico significativo',
        color: indice > 8 ? 'red' : indice > 5 ? 'orange' : 'amber',
      }
    }

    // ── TIG — Tasa de Infusión de Glucosa ───────────────────────────────────
    // TIG (mg/kg/min) = g glucosa/día × 1000 / (pesoCal × 1440)
    const tigVal = (dextrosaG * 1000) / (pesoCal * 1440)
    let tigData = null
    if (perfilActual?.tigMax) {
      // Perfiles pediátricos/neonatales — panel completo
      tigData = {
        tig: tigVal.toFixed(2),
        tigMax: perfilActual.tigMax,
        tigInicio: perfilActual.tigInicio,
        seguro: tigVal <= perfilActual.tigMax,
        nivel: tigVal > perfilActual.tigMax ? 'critico'
          : tigVal > perfilActual.tigMax * 0.85 ? 'limite' : 'seguro',
      }
    }
    // Adultos en NP 2-en-1: la dextrosa asume todo el NPC → verificar límite ASPEN (5 mg/kg/min)
    const tigAdultoAlerta = !perfilActual?.tigMax && !form.conLipidos && tigVal > 5

    // ── Volúmenes comerciales ─────────────────────────────────────────────────
    const volAA     = Math.round(protG    / 0.1)
    const volDex    = Math.round(dextrosaG / 0.5)
    const volLipido = form.conLipidos ? Math.round(lipidoG / 0.2) : 0
    const volumenComponentes = volAA + volDex + volLipido
    const porcentajeOcupado  = (volumenComponentes / vol) * 100
    // Reserva obligatoria para electrolitos + vitaminas + oligoelementos (mínimo 100 mL)
    const MIN_ADITIVOS_ML    = 100
    const volumenExcedido    = volumenComponentes > vol
    // Físicamente posible pero sin espacio para aditivos obligatorios
    const sinEspacioAditivos = !volumenExcedido && (volumenComponentes > vol - MIN_ADITIVOS_ML)
    const dextrosaGKg        = dextrosaG / pesoCal

    // ── Validación concentración electrolitos — Manual CCSS Farmacias SNF 2018, p.18 ──
    // Límites de seguridad fisicoquímica (en mEq/L del volumen final de la bolsa)
    const volL = vol / 1000
    const alertasElectrolitos = []
    if (naTotal / volL > 154)
      alertasElectrolitos.push(`Na⁺ ${(naTotal/volL).toFixed(0)} mEq/L > límite CCSS 154 mEq/L`)
    if (kTotal / volL > 80)
      alertasElectrolitos.push(`K⁺ ${(kTotal/volL).toFixed(0)} mEq/L > límite CCSS 80 mEq/L`)
    if (mgTotal_e / volL > 20)
      alertasElectrolitos.push(`Mg²⁺ ${(mgTotal_e/volL).toFixed(0)} mEq/L > límite CCSS 20 mEq/L`)
    if (po4Total_e / volL > 15 && form.conLipidos)
      alertasElectrolitos.push(`PO₄³⁻ ${(po4Total_e/volL).toFixed(0)} mmol/L > límite CCSS 15 mmol/L en NP 3-en-1`)

    // ── Concentración de glucosa en bolsa (CCSS: mínimo 5% en 3-en-1) ────────
    const glucosaConc = (dextrosaG / vol) * 100
    const glucosaBajaCCSSAlerta = form.conLipidos && glucosaConc < 5
    const glucosaAltaCCSSAlerta = (dextrosaG / pesoCal) > 18 && perfilActual?.grupo === 'pediatrico'

    // ── Cobertura NPS — Protocolo COVID-19 CCSS 2020 + ESPEN 2019 ────────────
    // Umbrales: <66% → NPS indicada; 66-80% → NPS apropiada; >80% → evaluar retiro
    const coberturaKcalPct  = tenTotal > 0 ? Math.round((aporteKcalPrev / tenTotal) * 100) : 0
    const coberturaProtPct  = protTotal > 0 ? Math.round((aportePrevProt / protTotal) * 100) : 0
    const npsIndStatus =
      coberturaKcalPct >= 80 ? 'retirar'    // CCSS HNN: retiro cuando enteral ≥80%
      : coberturaKcalPct >= 66 ? 'opcional' // ESPEN 2019: NPS apropiada pero vigilar
      : 'indicada'                           // CCSS Protocolo COVID-19 2020: NPS indicada <66%

    // ── Concentraciones electrolitos en mEq/L (para display en resultados) ──
    const volL_r = vol / 1000
    const concNa  = naTotal  > 0 ? parseFloat((naTotal  / volL_r).toFixed(1)) : 0
    const concK   = kTotal   > 0 ? parseFloat((kTotal   / volL_r).toFixed(1)) : 0
    const concCa  = caTotal  > 0 ? parseFloat((caTotal  / volL_r).toFixed(1)) : 0
    const concMg  = mgTotal  > 0 ? parseFloat((mgTotal  / volL_r).toFixed(1)) : 0
    const concPo4 = po4Total > 0 ? parseFloat((po4Total / volL_r).toFixed(1)) : 0

    setResultado({
      bee: bee ? Math.round(bee) : null,
      ten: Math.round(ten),
      tenTotal: Math.round(tenTotal),
      esParcial, aporteKcalPrev: Math.round(aporteKcalPrev), aportePrevProt: Math.round(aportePrevProt),
      protTotal: Math.round(protTotal),
      coberturaKcalPct, coberturaProtPct, npsIndStatus,
      concElectrolitos: { na: concNa, k: concK, ca: concCa, mg: concMg, po4: concPo4 },
      aporteOralKcal: parseFloat(form.aporteOralKcal) || 0,
      propofolKcal: parseFloat(form.propofolML) > 0 ? parseFloat(((parseFloat(form.propofolML)||0)*1.1).toFixed(1)) : 0,
      protG: Math.round(protG), protGKg: (protG / pesoCal).toFixed(2),
      protFuente: protFromUUN ? 'UUN (laboratorio)' : 'Ecuación metabólica',
      dextrosaG: Math.round(dextrosaG), lipidoG: Math.round(lipidoG),
      dextrosaGKg: parseFloat(dextrosaGKg.toFixed(2)),
      nitrogeno: nitrogeno.toFixed(1), npcN: Math.round(npcN),
      volAA, volDex, volLipido,
      volumenComponentes,
      porcentajeOcupado:  Math.round(porcentajeOcupado),
      volumenExcedido,
      sinEspacioAditivos,
      alertasElectrolitos, glucosaBajaCCSSAlerta, glucosaAltaCCSSAlerta,
      glucosaConc: parseFloat(glucosaConc.toFixed(1)),
      volumenJusto:       !volumenExcedido && !sinEspacioAditivos && porcentajeOcupado > 90,
      volSugerido:        Math.ceil((volumenComponentes + 150) / 100) * 100,
      alertaDpGlucosa:    perfilActual?.id === 'renal_dp' && dextrosaGKg > 3.5,
      osmolaridad, viaInfo,
      npcNEstado:  npcN < 80 ? 'bajo' : npcN > 150 ? 'alto' : 'optimo',
      estabilidad,
      lipido:      LIPIDOS.find(l => l.id === form.lipido),
      balanceN,
      bistrianData,
      tigAdultoAlerta, tigAdultoVal: parseFloat(tigVal.toFixed(2)),
      insulina:        form.diabetico ? Math.round(dextrosaG / 10) : null,
      oligoelementos:  form.pediatrico ? { multiOligo: (pesoCal * 0.2).toFixed(2), selenio: (pesoCal * 0.1).toFixed(2) } : null,
      tasaInfusion:    (vol / horas).toFixed(1),
      horasInfusion:   horas,
      volTotal:        vol,
      // Peso info
      pesoCal:         Math.round(pesoCal),
      pesoCalDesc,
      perfilLabel:     perfilActual?.label ?? 'Estándar',
      perfilRestricciones: perfilActual?.restricciones ?? [],
      tigData,
    })
  }

  const calcularNutric = () => {
    const edad = parseInt(form.nutricEdad) || 0
    const apache = parseInt(form.nutricApache) || 0
    const sofa = parseInt(form.nutricSofa) || 0
    const comorbilidades = parseInt(form.nutricComorbilidades) || 0
    const diasHospUCI = parseInt(form.nutricDiasHospUCI) || 0
    if (!edad || !apache) return
    setNutricResult(calcNutricScore({ edad, apache, sofa, comorbilidades, diasHospUCI }))
  }

  const resetForm = () => {
    setForm(p => ({
      ...p,
      peso: '', talla: '', edad: '', volumen: '',
      na: '', k: '', ca: '', po4: '', mg: '',
      proteinaGKg: '', kcalKg: '', uun24h: '',
      pesoSeco: '',
      diabetico: false, pediatrico: false,
    }))
    setResultado(null)
    setErrores([])
  }

  const exportarFHIR = () => {
    if (!resultado) return
    const now = new Date().toISOString()
    const id  = `nutrivida-${Date.now()}`
    const fhir = {
      resourceType: 'NutritionOrder',
      id,
      meta: {
        versionId: '1',
        lastUpdated: now,
        profile: ['http://hl7.org/fhir/StructureDefinition/NutritionOrder'],
        source: 'NutriVida-Biotech-v2.1',
        tag: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ActReason', code: 'HTEST', display: 'Estimación educativa — requiere validación clínica' }],
      },
      status: 'proposed',
      intent: 'proposal',
      dateTime: now,
      enteralFormula: {
        baseFormulaType: { coding: [{ system: 'http://snomed.info/sct', code: '229912004', display: 'Nutrición Parenteral Total (NPT)' }] },
        routeofAdministration: { coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-RouteOfAdministration', code: 'IV', display: resultado.viaInfo.label }] },
        administration: [{ rate: { rateQuantity: { value: parseFloat(resultado.tasaInfusion), unit: 'mL/h', system: 'http://unitsofmeasure.org', code: 'mL/h' } } }],
        administrationInstruction: `${resultado.volTotal} mL en ${resultado.horasInfusion}h a ${resultado.tasaInfusion} mL/h.`,
      },
      extension: [
        {
          url: 'https://nutrividabio.netlify.app/fhir/StructureDefinition/np-macronutrientes',
          extension: [
            { url: 'energiaTotal', valueQuantity: { value: resultado.ten, unit: 'kcal/d' } },
            ...(resultado.bee !== null ? [{ url: 'gastoBasal', valueQuantity: { value: resultado.bee, unit: 'kcal/d' } }] : []),
            { url: 'proteina',     valueQuantity: { value: resultado.protG, unit: 'g/d' } },
            { url: 'proteinaKg',   valueQuantity: { value: parseFloat(resultado.protGKg), unit: 'g/kg/d' } },
            { url: 'fuenteProteina', valueString: resultado.protFuente },
            { url: 'dextrosa',     valueQuantity: { value: resultado.dextrosaG, unit: 'g/d' } },
            { url: 'lipidos',      valueQuantity: { value: resultado.lipidoG, unit: 'g/d' } },
            { url: 'nitrogeno',    valueQuantity: { value: parseFloat(resultado.nitrogeno), unit: 'g/d' } },
            { url: 'relacionNPCN', valueQuantity: { value: resultado.npcN, unit: '1' } },
            { url: 'estadoNPCN',   valueString: resultado.npcNEstado },
          ],
        },
        {
          url: 'https://nutrividabio.netlify.app/fhir/StructureDefinition/np-osmolaridad-pereiraDaSilva',
          extension: [
            { url: 'osmolaridad',  valueQuantity: { value: resultado.osmolaridad, unit: 'mOsm/L' } },
            { url: 'zonaVascular', valueString: resultado.viaInfo.zone },
            { url: 'viaRecomendada', valueString: resultado.viaInfo.label },
            { url: 'metodo',       valueString: 'Pereira Da Silva et al. Nutr Hosp 2015' },
          ],
        },
        {
          url: 'https://nutrividabio.netlify.app/fhir/StructureDefinition/np-perfil-patologico',
          extension: [
            { url: 'perfil', valueString: resultado.perfilLabel },
            { url: 'pesoCal', valueQuantity: { value: resultado.pesoCal, unit: 'kg' } },
            { url: 'tipoPeso', valueString: resultado.pesoCalDesc },
          ],
        },
        ...(resultado.balanceN ? [{
          url: 'https://nutrividabio.netlify.app/fhir/StructureDefinition/np-balance-nitrogenado',
          extension: [
            { url: 'balanceN',      valueDecimal: parseFloat(resultado.balanceN.nBalance) },
            { url: 'estado',        valueString:  resultado.balanceN.estado },
            { url: 'nLoss',         valueQuantity: { value: parseFloat(resultado.balanceN.nLoss), unit: 'g/d' } },
            { url: 'protNeutral',   valueQuantity: { value: resultado.balanceN.protNeutral, unit: 'g/d' } },
            { url: 'protNeutralKg', valueQuantity: { value: parseFloat(resultado.balanceN.protNeutralKg), unit: 'g/kg/d' } },
            ...(resultado.bistrianData ? [
              { url: 'bistrianIndice', valueDecimal: parseFloat(resultado.bistrianData.indice) },
              { url: 'bistrianNivel',  valueString:  resultado.bistrianData.nivel },
            ] : []),
          ],
        }] : []),
        ...(resultado.estabilidad ? [{
          url: 'https://nutrividabio.netlify.app/fhir/StructureDefinition/np-estabilidad-caPO4',
          extension: [
            { url: 'semaforo',      valueString:   resultado.estabilidad.nivel },
            { url: 'caConc',        valueQuantity: { value: parseFloat(resultado.estabilidad.caConc),  unit: 'mEq/L'  } },
            { url: 'po4Conc',       valueQuantity: { value: parseFloat(resultado.estabilidad.po4Conc), unit: 'mmol/L' } },
            { url: 'productoCaPO4', valueInteger:  resultado.estabilidad.producto },
          ],
        }] : []),
        ...(resultado.insulina !== null ? [{
          url: 'https://nutrividabio.netlify.app/fhir/StructureDefinition/np-insulina-inicial',
          valueQuantity: { value: resultado.insulina, unit: '[iU]', system: 'http://unitsofmeasure.org', code: '[iU]' },
        }] : []),
        ...(resultado.oligoelementos ? [{
          url: 'https://nutrividabio.netlify.app/fhir/StructureDefinition/np-oligoelementos-pediatricos',
          extension: [
            { url: 'multiOligo', valueQuantity: { value: parseFloat(resultado.oligoelementos.multiOligo), unit: 'mL/d' } },
            { url: 'selenio',    valueQuantity: { value: parseFloat(resultado.oligoelementos.selenio),    unit: 'mL/d' } },
          ],
        }] : []),
      ],
      note: [
        { time: now, text: `Generado por NutriVida Biotech v2.1 — Estimación educativa basada en ESPEN/ASPEN. NO constituye prescripción médica. Requiere validación del equipo de soporte nutricional.${profesional.nombre ? ` Calculado por: ${profesional.nombre}` : ''}${profesional.colegiado ? ` · Colegio Profesional: ${profesional.colegiado}` : ''}` },
        { text: `Osmolaridad calculada por ecuación Pereira Da Silva et al. (Nutr Hosp 2015). Perfil: ${resultado.perfilLabel}. Peso de cálculo: ${resultado.pesoCal} kg (${resultado.pesoCalDesc}).` },
      ],
    }

    const blob = new Blob([JSON.stringify(fhir, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `np-fhir-${id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const inputCls = 'w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100'
  const inputSmCls = 'w-full border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-teal-400 bg-white'

  return (
    <div className="space-y-6">

      {/* Identificación profesional — localStorage del dispositivo */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
        <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mb-3">
          <BookOpen size={13} className="text-teal-500" />
          Identificación profesional
          <span className="ml-auto text-[10px] font-normal text-slate-400 flex items-center gap-1">
            <Scale size={10} /> Solo en este dispositivo · No se envía al servidor
          </span>
        </p>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            placeholder="Nombre completo"
            value={profesional.nombre}
            onChange={e => setProfesional(p => ({ ...p, nombre: e.target.value }))}
            className={inputSmCls}
          />
          <input
            type="text"
            placeholder="Código de colegio profesional"
            value={profesional.colegiado}
            onChange={e => setProfesional(p => ({ ...p, colegiado: e.target.value }))}
            className={inputSmCls}
          />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
        <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Herramienta de estimación clínica — Apoyo al equipo de soporte nutricional.</p>
          <p className="mt-1">Cálculos basados en ESPEN/ASPEN/KDOQI. <strong>Deben ser validados por médico, farmacéutico o nutricionista</strong> antes de preparar o administrar cualquier mezcla parenteral.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* ── SECCIÓN 1: Paciente y Energía ──────────────────────────────── */}
        <div className="space-y-4">
          <h3 className="font-bold text-teal-800 flex items-center gap-2">
            <span className="bg-teal-100 text-teal-600 text-xs font-bold px-2 py-0.5 rounded-md">1</span>
            Paciente y Energía
          </h3>

          {/* Perfil patológico clínico */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Perfil clínico especializado
              <span className="ml-2 text-[10px] bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-semibold">KDOQI · ESPEN · ASPEN</span>
            </label>
            <select value={form.perfilPatologico} onChange={e => set('perfilPatologico', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 bg-white">
              <optgroup label="General">
                <option value="estandar">Estándar / General</option>
              </optgroup>
              <optgroup label="Insuficiencia Renal">
                <option value="renal_prediálisis">Renal — Pre-diálisis (TFG &lt;25 mL/min)</option>
                <option value="renal_hd">Renal — Hemodiálisis crónica</option>
                <option value="renal_dp">Renal — Diálisis peritoneal</option>
                <option value="renal_trrc">Renal — TRRC (terapia continua UCI)</option>
              </optgroup>
              <optgroup label="Insuficiencia Hepática">
                <option value="hepatico_compensado">Hepático — Cirrosis compensada</option>
                <option value="hepatico_descompensado">Hepático — Cirrosis descompensada / encefalopatía</option>
              </optgroup>
              <optgroup label="Oncología">
                <option value="oncologico">Oncológico / Caquexia tumoral</option>
              </optgroup>
              <optgroup label="Neonatal / Pediátrico">
                <option value="neonato_prematuro">Neonatal — Prematuro extremo</option>
                <option value="neonato_termino">Neonatal — Neonato a término (0–1 año)</option>
                <option value="pediatrico_infante">Pediátrico — Infante (1–7 años)</option>
                <option value="pediatrico_escolar">Pediátrico — Escolar (7–12 años)</option>
                <option value="pediatrico_adolescente">Pediátrico — Adolescente (12–18 años)</option>
              </optgroup>
            </select>

            {perfilActual?.nota && (
              <div className="mt-2 bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-xs text-blue-800">
                <p className="font-semibold text-blue-700 mb-0.5">{perfilActual.fuente}</p>
                <p>{perfilActual.nota}</p>
                {perfilActual.restricciones.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5">
                    {perfilActual.restricciones.map((r, i) => (
                      <li key={i} className="flex items-start gap-1">
                        <span className="text-blue-400 flex-shrink-0">▸</span>{r}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Datos antropométricos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Peso real (kg)</label>
              <input type="number" value={form.peso} onChange={e => set('peso', e.target.value)}
                className={inputCls} placeholder="70" min="1" max="300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Talla (cm) {form.modoCalculo === 'kcal_kg' && <span className="text-slate-400 font-normal">(opcional)</span>}
              </label>
              <input type="number" value={form.talla} onChange={e => set('talla', e.target.value)}
                className={inputCls} placeholder="165" min="50" max="250" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Edad (años) {form.modoCalculo === 'kcal_kg' && <span className="text-slate-400 font-normal">(opcional)</span>}
              </label>
              <input type="number" value={form.edad} onChange={e => set('edad', e.target.value)}
                className={inputCls} placeholder="45" min="0" max="120" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Sexo</label>
              <select value={form.sexo} onChange={e => set('sexo', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 bg-white">
                <option value="F">Femenino</option>
                <option value="M">Masculino</option>
              </select>
            </div>
          </div>

          {/* IMC y peso derivado (dinámico) */}
          {(imcCalc || pesoIdealCalc) && (
            <div className={`rounded-xl border p-3 text-xs space-y-1 ${esObeso ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Scale size={13} className={esObeso ? 'text-amber-600' : 'text-teal-600'} />
                Valores derivados
              </div>
              <div className="grid grid-cols-3 gap-2 mt-1">
                {imcCalc && (
                  <div className="bg-white rounded-lg p-2 text-center">
                    <p className="text-slate-400">IMC</p>
                    <p className={`font-bold ${esObeso ? 'text-amber-700' : 'text-slate-800'}`}>{imcCalc}</p>
                    <p className="text-slate-400 text-[10px]">{parseFloat(imcCalc) < 18.5 ? 'Bajo peso' : parseFloat(imcCalc) < 25 ? 'Normal' : parseFloat(imcCalc) < 30 ? 'Sobrepeso' : 'Obesidad'}</p>
                  </div>
                )}
                {pesoIdealCalc && (
                  <div className="bg-white rounded-lg p-2 text-center">
                    <p className="text-slate-400">Peso ideal</p>
                    <p className="font-bold text-slate-800">{pesoIdealCalc} kg</p>
                    <p className="text-slate-400 text-[10px]">Broca</p>
                  </div>
                )}
                {pesoAjustadoCalc && (
                  <div className="bg-white rounded-lg p-2 text-center">
                    <p className="text-slate-400">Peso ajustado</p>
                    <p className="font-bold text-amber-700">{pesoAjustadoCalc} kg</p>
                    <p className="text-slate-400 text-[10px]">PI + 0.25×(PA–PI)</p>
                  </div>
                )}
              </div>
              {esObeso && <p className="text-amber-700 font-medium">IMC ≥ 30 — se recomienda usar peso ajustado para el cálculo (ver Tipo de peso).</p>}
            </div>
          )}

          {/* Tipo de peso de cálculo */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Tipo de peso para el cálculo</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'actual',   title: 'Actual',    sub: 'Peso real del paciente' },
                { id: 'seco',     title: 'Seco',      sub: 'Renal/hepático con edema' },
                { id: 'ajustado', title: 'Ajustado',  sub: esObeso ? `${pesoAjustadoCalc ?? '—'} kg (IMC ≥30)` : 'Solo si IMC ≥30' },
              ].map(t => (
                <button key={t.id} onClick={() => set('tipoPeso', t.id)}
                  disabled={t.id === 'ajustado' && !esObeso}
                  className={`p-2 rounded-xl border text-left transition-colors ${
                    form.tipoPeso === t.id
                      ? 'bg-teal-600 text-white border-teal-600'
                      : t.id === 'ajustado' && !esObeso
                      ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                  }`}>
                  <p className="font-semibold text-xs">{t.title}</p>
                  <p className={`text-[10px] mt-0.5 ${form.tipoPeso === t.id ? 'text-teal-100' : 'text-slate-400'}`}>{t.sub}</p>
                </button>
              ))}
            </div>
            {form.tipoPeso === 'seco' && (
              <div className="mt-2">
                <label className="block text-xs text-slate-500 mb-1">Peso seco / euvolémico (kg)</label>
                <input type="number" value={form.pesoSeco} onChange={e => set('pesoSeco', e.target.value)}
                  className={inputSmCls} placeholder="ej. peso post-diálisis" min="1" max="300" />
              </div>
            )}
          </div>

          {/* Ambulatorio */}
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
            <input type="checkbox" id="ambulatorio" checked={form.ambulatorio} onChange={e => set('ambulatorio', e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded" />
            <label htmlFor="ambulatorio" className="text-sm font-medium text-slate-700 cursor-pointer">
              Paciente ambulatorio — objetivo 30–35 kcal/kg/día (ESPEN)
            </label>
          </div>

          {/* Modo de cálculo energético */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-2">Método de cálculo energético</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'harris_benedict', title: 'Harris-Benedict',  sub: 'Preciso — requiere talla y edad' },
                { id: 'kcal_kg',         title: 'Objetivo kcal/kg', sub: `${kcalMin}–${kcalMax} kcal/kg/día` },
              ].map(m => (
                <button key={m.id} onClick={() => set('modoCalculo', m.id)}
                  className={`p-2.5 rounded-xl border text-left transition-colors ${
                    form.modoCalculo === m.id
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300'
                  }`}>
                  <p className="font-semibold text-xs">{m.title}</p>
                  <p className={`text-xs mt-0.5 ${form.modoCalculo === m.id ? 'text-teal-100' : 'text-slate-400'}`}>{m.sub}</p>
                </button>
              ))}
            </div>
          </div>

          {form.modoCalculo === 'kcal_kg' && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Objetivo calórico (kcal/kg/día)</label>
              <input type="number" value={form.kcalKg} onChange={e => set('kcalKg', e.target.value)}
                className={inputCls} placeholder={`${kcalMin}–${kcalMax} según perfil`} step="1" min="10" max="50" />
              <p className="text-xs text-teal-600 mt-1 flex items-center gap-1">
                <Info size={12} />
                {perfilActual?.id !== 'estandar' ? `Perfil ${perfilActual?.label}: ${kcalMin}–${kcalMax} kcal/kg/día` : 'Encamado 20–25 · Ambulatorio 30–35 · Pediátrico hasta 120'}
              </p>
            </div>
          )}

          {/* Condición clínica */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Condición clínica / Factor de estrés</label>
            <select value={form.condicion} onChange={e => set('condicion', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 bg-white">
              {CONDICIONES.map(c => (
                <option key={c.id} value={c.id}>{c.label} (×{c.factor})</option>
              ))}
            </select>
            <p className="text-xs text-teal-600 mt-1 flex items-center gap-1">
              <Info size={12} />
              Proteína: {protMin}–{protMax} g/kg/día
              {perfilActual?.id !== 'estandar' && <span className="text-blue-600 ml-1">(perfil {perfilActual?.label})</span>}
            </p>
          </div>

          {BASE_CONOCIMIENTO[form.condicion] && (
            <BaseConocimientoPanel datos={BASE_CONOCIMIENTO[form.condicion]} />
          )}

          {/* Proteína manual */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Proteína (g/kg/día) — opcional</label>
            <input type="number" value={form.proteinaGKg} onChange={e => set('proteinaGKg', e.target.value)}
              className={inputCls} placeholder={`${protMin}–${protMax} (vacío = promedio)`} step="0.1" min="0.5" max="3.5" />
          </div>

          {/* Balance nitrogenado — UUN */}
          <div className="border border-slate-200 rounded-xl p-3 space-y-3 bg-slate-50">
            <p className="text-sm font-bold text-slate-700 flex items-center gap-2">
              <Activity size={14} className="text-teal-600" />
              Balance Nitrogenado — UUN 24h (opcional)
            </p>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">NUU 24h (g)</label>
                <input type="number" value={form.uun24h} onChange={e => set('uun24h', e.target.value)}
                  className={inputSmCls} placeholder="ej. 8–12 g" step="0.1" min="0" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Factor corrección (g N)</label>
                <select value={form.corrFactor} onChange={e => set('corrFactor', e.target.value)}
                  className={inputSmCls}>
                  <option value="2">2 g — pérdidas normales</option>
                  <option value="4">4 g — catabolismo moderado</option>
                  <option value="6">6 g — hipercatabolismo severo</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Si se ingresa NUU, la proteína se estima por balance nitrogenado. También activa el Índice de Estrés de Bistrian.
            </p>
          </div>

          {/* Volumen e infusión */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Volumen total (mL)</label>
              <input type="number" value={form.volumen} onChange={e => set('volumen', e.target.value)}
                className={inputCls} placeholder="2000" min="500" max="5000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Horas infusión/día</label>
              <input type="number" value={form.horasInfusion} onChange={e => set('horasInfusion', e.target.value)}
                className={inputCls} placeholder="24" min="8" max="24" />
              <p className="text-xs text-slate-400 mt-1">24h continua · 12–16h cíclica</p>
            </div>
          </div>
        </div>

        {/* ── SECCIÓN 2: Lípidos, Electrolitos y Opciones ────────────────── */}
        <div className="space-y-4">
          <h3 className="font-bold text-teal-800 flex items-center gap-2">
            <span className="bg-teal-100 text-teal-600 text-xs font-bold px-2 py-0.5 rounded-md">2</span>
            Lípidos, Electrolitos y Opciones
          </h3>

          {/* Toggle NP Total vs NP Parcial — ESPEN 2019; Manual CCSS SNF 2018 */}
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3 space-y-2">
            <p className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
              <span className="bg-indigo-200 text-indigo-900 px-1.5 py-0.5 rounded text-[10px] font-bold">CCSS</span>
              Tipo de Soporte Nutricional Parenteral
            </p>
            <div className="flex gap-2">
              {[
                { val: 'total',   label: 'NPT — Total',                   desc: '100% requerimientos vía NP' },
                { val: 'parcial', label: 'NPS — Parcial / Suplementaria', desc: 'Complementa aporte oral o enteral' },
              ].map(opt => (
                <button key={opt.val} onClick={() => set('tipNP', opt.val)}
                  className={`flex-1 rounded-lg px-3 py-2 text-left transition-all border ${form.tipNP === opt.val
                    ? 'bg-indigo-600 text-white border-indigo-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300'}`}>
                  <p className="text-xs font-bold">{opt.label}</p>
                  <p className={`text-[10px] ${form.tipNP === opt.val ? 'text-indigo-200' : 'text-slate-400'}`}>{opt.desc}</p>
                </button>
              ))}
            </div>
            {form.tipNP === 'parcial' && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label className="block text-[10px] font-medium text-indigo-700 mb-1">Aporte oral/enteral (kcal/día)</label>
                  <input type="number" value={form.aporteOralKcal} onChange={e => set('aporteOralKcal', e.target.value)}
                    className="border border-indigo-200 rounded-lg px-2 py-1.5 text-xs w-full focus:outline-none focus:border-indigo-500 bg-white" placeholder="800" min="0" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-indigo-700 mb-1">Proteína oral/enteral (g/día)</label>
                  <input type="number" value={form.aporteOralProt} onChange={e => set('aporteOralProt', e.target.value)}
                    className="border border-indigo-200 rounded-lg px-2 py-1.5 text-xs w-full focus:outline-none focus:border-indigo-500 bg-white" placeholder="30" min="0" />
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-indigo-700 mb-1">Propofol (mL/día) → 1.1 kcal/mL</label>
                  <input type="number" value={form.propofolML} onChange={e => set('propofolML', e.target.value)}
                    className="border border-indigo-200 rounded-lg px-2 py-1.5 text-xs w-full focus:outline-none focus:border-indigo-500 bg-white" placeholder="0" min="0" />
                </div>
                <p className="col-span-3 text-[10px] text-indigo-500">La NP cubrirá solo el déficit: Requerimiento total − aportes previos. Propofol aporta 1.1 kcal/mL (vehículo lipídico, ESPEN 2019). NPS indicada cuando aporte previo cubre &lt;66% del requerimiento (Protocolo CCSS 2020).</p>
              </div>
            )}
          </div>

          {/* ── mNUTRIC Score — Heyland 2011 / Rahman 2016 ─────────────────── */}
          <div className="border border-violet-200 rounded-xl overflow-hidden">
            <button onClick={() => setShowNutric(v => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 bg-violet-50 text-sm font-semibold text-violet-800 hover:bg-violet-100 transition-colors">
              <span className="flex items-center gap-2">
                <Activity size={14} className="text-violet-500" />
                mNUTRIC Score — Riesgo nutricional UCI
                <span className="text-[10px] font-normal bg-violet-200 text-violet-700 px-1.5 py-0.5 rounded">Heyland 2011</span>
              </span>
              {showNutric ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
            {showNutric && (
              <div className="p-3 space-y-2 bg-white">
                <p className="text-[10px] text-slate-400">Puntuación para pacientes UCI adultos. Score 0-4: bajo riesgo · 5-9: alto riesgo nutricional. No requiere IL-6 (versión modificada validada por Rahman 2016).</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { field: 'nutricEdad',          label: 'Edad (años)',                   hint: '≥50 → 1pt · ≥75 → 2pt' },
                    { field: 'nutricApache',         label: 'APACHE II',                     hint: '15-19 → 1pt · 20-27 → 2pt · ≥28 → 3pt' },
                    { field: 'nutricSofa',           label: 'SOFA score',                    hint: '6-9 → 1pt · ≥10 → 2pt' },
                    { field: 'nutricComorbilidades', label: 'Nº comorbilidades crónicas',    hint: '≥2 → 1pt' },
                    { field: 'nutricDiasHospUCI',    label: 'Días hospital → UCI (retraso)', hint: '≥1 día → 1pt' },
                  ].map(({ field, label, hint }) => (
                    <div key={field}>
                      <label className="block text-[10px] font-medium text-slate-600 mb-0.5">{label}</label>
                      <input type="number" min="0" value={form[field]}
                        onChange={e => set(field, e.target.value)}
                        className="border border-slate-200 rounded-lg px-2 py-1.5 text-xs w-full focus:outline-none focus:border-violet-400 bg-white" />
                      <p className="text-[9px] text-slate-400">{hint}</p>
                    </div>
                  ))}
                  <div className="flex items-end">
                    <button onClick={calcularNutric}
                      className="w-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                      Calcular mNUTRIC
                    </button>
                  </div>
                </div>
                {nutricResult && (
                  <div className={`rounded-xl p-3 mt-1 border ${nutricResult.riesgo === 'alto' ? 'bg-red-50 border-red-300' : 'bg-emerald-50 border-emerald-300'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className={`text-sm font-bold ${nutricResult.riesgo === 'alto' ? 'text-red-800' : 'text-emerald-800'}`}>
                        Score {nutricResult.score}/9 — {nutricResult.riesgo === 'alto' ? 'ALTO' : 'BAJO'} riesgo nutricional
                      </p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${nutricResult.riesgo === 'alto' ? 'bg-red-200 text-red-800' : 'bg-emerald-200 text-emerald-800'}`}>
                        {nutricResult.score}/9
                      </span>
                    </div>
                    <p className={`text-[10px] mb-2 ${nutricResult.riesgo === 'alto' ? 'text-red-700' : 'text-emerald-700'}`}>{nutricResult.label}</p>
                    <div className="grid grid-cols-5 gap-1">
                      {nutricResult.detalle.map((d, i) => (
                        <div key={i} className={`text-center rounded p-1 ${d.pts > 0 ? 'bg-red-100' : 'bg-slate-100'}`}>
                          <p className="text-[8px] text-slate-500">{d.var}</p>
                          <p className="text-[9px] text-slate-600">{d.ref}</p>
                          <p className={`text-xs font-bold ${d.pts > 0 ? 'text-red-700' : 'text-slate-400'}`}>+{d.pts}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl border border-teal-100">
            <input type="checkbox" id="conLipidos" checked={form.conLipidos} onChange={e => set('conLipidos', e.target.checked)}
              className="w-4 h-4 accent-teal-600 rounded" />
            <label htmlFor="conLipidos" className="text-sm font-medium text-slate-700 cursor-pointer">
              Incluir emulsión lipídica (NP 3-en-1)
            </label>
          </div>

          {form.conLipidos && (
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Fuente lipídica <span className="text-teal-500 text-xs font-normal">(origen biotecnológico)</span>
              </label>
              <select value={form.lipido} onChange={e => set('lipido', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 bg-white">
                {LIPIDOS.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
              </select>
              {LIPIDOS.find(l => l.id === form.lipido)?.omega3 && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-teal-600">
                  <Dna size={12} /> Contiene omega-3 de origen biotecnológico (microalgas/aceite de pescado)
                </div>
              )}
            </div>
          )}

          {/* Electrolitos — osmolaridad + estabilidad */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <p className="text-sm font-medium text-slate-600">Electrolitos — osmolaridad y estabilidad</p>
              <span className="text-[10px] bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-semibold">Pereira Da Silva</span>
            </div>
            <p className="text-xs text-slate-400 mb-2">Na⁺ y K⁺ para cálculo de osmolaridad. Ca²⁺, PO₄³⁻ y Mg²⁺ también activan el semáforo de estabilidad. Todos en mEq totales en la bolsa.</p>

            <div className="grid grid-cols-5 gap-2">
              {[
                { key: 'na',  label: 'Na⁺',   placeholder: '70', unit: 'mEq' },
                { key: 'k',   label: 'K⁺',    placeholder: '40', unit: 'mEq' },
                { key: 'ca',  label: 'Ca²⁺',  placeholder: '10', unit: 'mEq' },
                { key: 'mg',  label: 'Mg²⁺',  placeholder: '8',  unit: 'mEq' },
                { key: 'po4', label: 'PO₄³⁻', placeholder: '20', unit: 'mmol' },
              ].map(e => (
                <div key={e.key}>
                  <label className="block text-[10px] text-slate-500 mb-1 font-medium">{e.label} {e.unit}</label>
                  <input type="number" value={form[e.key]} onChange={ev => set(e.key, ev.target.value)}
                    className="w-full border border-slate-200 rounded-lg px-2 py-2 text-xs focus:outline-none focus:border-violet-400 bg-white"
                    placeholder={e.placeholder} min="0" />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-violet-600 mt-1.5 flex items-center gap-1">
              <Info size={10} /> Osmolaridad: glucosa×5.55 + AA×8.0 + Σelectrolitos×2 (lípidos=0, isotónicos) · PO₄ en <strong>mmol</strong> — Na/K/Ca/Mg en mEq
            </p>
          </div>

          {/* Opciones adicionales */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-600">Opciones adicionales</p>
            <div className="flex items-center gap-3 p-2.5 bg-purple-50 rounded-xl border border-purple-100">
              <input type="checkbox" id="diabetico" checked={form.diabetico} onChange={e => set('diabetico', e.target.checked)}
                className="w-4 h-4 accent-purple-600 rounded" />
              <label htmlFor="diabetico" className="text-sm text-slate-700 cursor-pointer">
                Diabético / intolerancia a glucosa — sugerir insulina inicial
              </label>
            </div>
            <div className="flex items-center gap-3 p-2.5 bg-pink-50 rounded-xl border border-pink-100">
              <input type="checkbox" id="pediatrico" checked={form.pediatrico} onChange={e => set('pediatrico', e.target.checked)}
                className="w-4 h-4 accent-pink-600 rounded" />
              <label htmlFor="pediatrico" className="text-sm text-slate-700 cursor-pointer">
                Pediátrico / neonato — calcular oligoelementos hospitalarios
              </label>
            </div>
          </div>

          {/* Tabla de umbrales de osmolaridad */}
          <div className="border border-violet-100 rounded-xl overflow-hidden bg-violet-50">
            <div className="px-3 py-2 bg-violet-100 flex items-center gap-2">
              <Info size={13} className="text-violet-600" />
              <span className="text-xs font-bold text-violet-700">Umbrales de osmolaridad — Vía de acceso</span>
            </div>
            <div className="p-2 space-y-1 text-[10px]">
              {[
                { rango: '< 600',       color: 'text-emerald-700 bg-emerald-50', via: 'Periférica segura' },
                { rango: '600–800',     color: 'text-amber-700 bg-amber-50',     via: 'Periférica c/ cautela (≤5 días)' },
                { rango: '800–900',     color: 'text-orange-700 bg-orange-50',   via: 'Central — periférica contraindicada' },
                { rango: '900–1800',    color: 'text-red-700 bg-red-50',         via: 'Venosa central exclusiva' },
                { rango: '> 1800',      color: 'text-red-900 bg-red-100 font-bold', via: 'ALERTA fisicoquímica crítica' },
              ].map((t, i) => (
                <div key={i} className={`flex items-center justify-between rounded-lg px-2 py-1 ${t.color}`}>
                  <span className="font-mono font-semibold">{t.rango} mOsm/L</span>
                  <span>{t.via}</span>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-violet-500 px-3 pb-2">Fuente: Pereira Da Silva et al. Nutr Hosp 2015; SENPE; ASPEN Clinical Practice</p>
          </div>
        </div>
      </div>

      {/* ── Botones ──────────────────────────────────────────────────────── */}
      <div className="flex gap-3">
        <button onClick={calcular}
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors text-sm">
          Calcular NP
        </button>
        <button onClick={resetForm}
          className="border border-slate-200 text-slate-500 hover:text-slate-700 px-4 py-3 rounded-xl transition-colors">
          <RotateCcw size={17} />
        </button>
        {resultado && (
          <>
            <button onClick={() => window.print()}
              className="flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 px-3 py-2 rounded-xl hover:text-slate-700 transition-colors">
              <Printer size={13} /> Imprimir
            </button>
            <button onClick={exportarFHIR}
              title="Exportar como NutritionOrder FHIR R4"
              className="flex items-center gap-1.5 text-xs text-teal-600 border border-teal-200 px-3 py-2 rounded-xl hover:bg-teal-50 transition-colors font-medium">
              <Download size={13} /> FHIR R4
            </button>
          </>
        )}
      </div>

      {/* Errores de validación */}
      {errores.length > 0 && (
        <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800">
          <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold mb-1">Complete los siguientes campos para calcular:</p>
            <ul className="list-disc list-inside space-y-0.5 text-xs">
              {errores.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          </div>
        </div>
      )}

      {/* ── RESULTADOS ─────────────────────────────────────────────────────── */}
      {resultado && (
        <div className="space-y-4 border-t border-teal-100 pt-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-teal-800">Resultado del Cálculo</h3>
            <div className="text-xs text-slate-500 bg-slate-100 rounded-lg px-2 py-1">
              Peso de cálculo: <strong>{resultado.pesoCal} kg</strong> ({resultado.pesoCalDesc}) · Perfil: {resultado.perfilLabel}
            </div>
          </div>

          {/* Encabezado de identidad profesional en resultados */}
          {(profesional.nombre || profesional.colegiado) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs bg-teal-50 border border-teal-200 rounded-xl px-4 py-2.5">
              <BookOpen size={13} className="text-teal-500 flex-shrink-0" />
              {profesional.nombre && (
                <span className="text-teal-800">Calculado por: <strong>{profesional.nombre}</strong></span>
              )}
              {profesional.colegiado && (
                <span className="text-teal-700">Colegio: <strong>{profesional.colegiado}</strong></span>
              )}
              <span className="ml-auto text-teal-500">
                {new Date().toLocaleDateString('es-CR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </span>
            </div>
          )}

          {/* Panel NP Parcial — balance de aportes + semáforo CCSS */}
          {resultado.esParcial && (
            <div className="bg-indigo-50 border border-indigo-300 rounded-xl p-4 space-y-3">
              <p className="text-xs font-bold text-indigo-800 flex items-center gap-1.5">
                <AlertCircle size={13} className="text-indigo-500" />
                NPS — Nutrición Parenteral Suplementaria · Balance de Aportes
              </p>

              {/* Barra de cobertura */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-500 mb-0.5">
                  <span>Cobertura calórica por aportes previos</span>
                  <span className="font-bold">{resultado.coberturaKcalPct}%</span>
                </div>
                <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${
                    resultado.coberturaKcalPct >= 80 ? 'bg-emerald-500'
                    : resultado.coberturaKcalPct >= 66 ? 'bg-amber-400'
                    : 'bg-red-500'
                  }`} style={{ width: `${Math.min(resultado.coberturaKcalPct, 100)}%` }} />
                </div>
                <div className="flex justify-between text-[9px] text-slate-400 mt-0.5">
                  <span>0%</span><span className="text-red-400">66%</span><span className="text-amber-400">80%</span><span>100%</span>
                </div>
              </div>

              {/* Indicación clínica según cobertura */}
              <div className={`rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-2 ${
                resultado.npsIndStatus === 'retirar'  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : resultado.npsIndStatus === 'opcional' ? 'bg-amber-100 text-amber-800 border border-amber-300'
                : 'bg-red-100 text-red-800 border border-red-300'
              }`}>
                {resultado.npsIndStatus === 'retirar'
                  ? '✓ Aporte previo ≥80% — Evaluar retiro de NP (Manual CCSS HNN; ESPEN 2019)'
                  : resultado.npsIndStatus === 'opcional'
                  ? '~ Aporte previo 66-80% — NPS apropiada, vigilar metas calóricas (ESPEN 2019)'
                  : '! Aporte previo <66% — NPS indicada (Protocolo Soporte Nutricional CCSS 2020)'}
              </div>

              {/* Desglose numérico */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white rounded-lg p-2">
                  <p className="text-slate-400 text-[10px]">Requerimiento total (TEN)</p>
                  <p className="font-bold text-slate-800">{resultado.tenTotal} kcal</p>
                  <p className="text-slate-400 text-[9px]">{resultado.protTotal ?? resultado.protG + resultado.aportePrevProt} g proteína</p>
                </div>
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
                  <p className="text-orange-600 text-[10px]">Ya recibe (oral/enteral/propofol)</p>
                  <p className="font-bold text-orange-700">−{resultado.aporteKcalPrev} kcal ({resultado.coberturaKcalPct}%)</p>
                  {resultado.propofolKcal > 0 && (
                    <p className="text-orange-400 text-[9px]">propofol: {resultado.propofolKcal} kcal · oral: {resultado.aporteOralKcal} kcal</p>
                  )}
                  <p className="text-orange-500 text-[9px]">−{resultado.aportePrevProt} g proteína ({resultado.coberturaProtPct}%)</p>
                </div>
                <div className="bg-indigo-100 rounded-lg p-2 ring-2 ring-indigo-400">
                  <p className="text-indigo-600 text-[10px] font-bold">NP prescribe (déficit)</p>
                  <p className="font-bold text-indigo-800">{resultado.ten} kcal ({100 - resultado.coberturaKcalPct}%)</p>
                  <p className="text-indigo-600 text-[9px]">{resultado.protG} g proteína</p>
                </div>
              </div>

              {resultado.aporteKcalPrev > resultado.tenTotal && (
                <p className="text-[10px] text-red-700 font-semibold bg-red-50 border border-red-200 rounded-lg px-2 py-1.5">
                  ⚠ Aportes previos superan el requerimiento calculado ({resultado.coberturaKcalPct}%). Riesgo de sobrealimentación — revisar con el equipo clínico. Verificar estimación del gasto energético.
                </p>
              )}
            </div>
          )}

          {/* Tarjetas principales */}
          <div className="bg-teal-50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3 border border-teal-100">
            {[
              resultado.bee !== null && { label: 'Gasto Basal (Harris-B.)', value: resultado.bee, unit: 'kcal/día' },
              { label: resultado.esParcial ? 'Energía NP (déficit)' : 'Energía Total (TEN)', value: resultado.ten, unit: 'kcal/día', highlight: true },
              { label: `Proteína (${resultado.protFuente})`, value: `${resultado.protG}g`, unit: `${resultado.protGKg} g/kg/día` },
              { label: 'Osmolaridad (Pereira Da Silva)', value: resultado.osmolaridad, unit: 'mOsm/L' },
            ].filter(Boolean).map((item, i) => (
              <div key={i} className={`bg-white rounded-lg p-3 text-center ${item.highlight ? 'ring-2 ring-teal-300' : ''}`}>
                <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                <p className={`font-bold text-lg ${item.highlight ? 'text-teal-700' : 'text-slate-800'}`}>{item.value}</p>
                {item.unit && <p className="text-xs text-slate-400">{item.unit}</p>}
              </div>
            ))}
          </div>

          {/* Alertas concentración electrolitos — Manual CCSS SNF 2018, p.18 */}
          {resultado.alertasElectrolitos?.length > 0 && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-3">
              <p className="text-xs font-bold text-red-800 mb-1.5">Concentración de electrolitos excede límites CCSS (Manual Farmacias SNF 2018, p. 18)</p>
              {resultado.alertasElectrolitos.map((a, i) => (
                <div key={i} className="flex items-start gap-1.5 text-xs text-red-700">
                  <AlertTriangle size={11} className="flex-shrink-0 mt-0.5 text-red-500" />{a}
                </div>
              ))}
              <p className="text-[10px] text-red-500 mt-1">Concentraciones altas de cationes desestabilizan la emulsión lipídica y aumentan el riesgo de precipitación de sales.</p>
            </div>
          )}

          {/* Alerta glucosa mínima 5% en 3-en-1 (CCSS) */}
          {resultado.glucosaBajaCCSSAlerta && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-xs text-amber-800">
              <strong>Glucosa por debajo del mínimo CCSS:</strong> {resultado.glucosaConc}% en bolsa — el Manual CCSS exige mínimo 5% en NP 3-en-1 para estabilidad de la emulsión lipídica. Aumentar dextrosa o reducir lípidos.
            </div>
          )}

          {/* Alerta glucosa máxima pediátrica */}
          {resultado.glucosaAltaCCSSAlerta && (
            <div className="bg-red-50 border border-red-300 rounded-xl p-3 text-xs text-red-800">
              <strong>Glucosa excede 18 g/kg/día:</strong> riesgo de esteatosis hepática fulminante (Manual CCSS HNN). Reducir dextrosa y distribuir calorías hacia lípidos.
            </div>
          )}

          {/* Concentraciones de electrolitos en mEq/L — visualización explícita */}
          {Object.values(resultado.concElectrolitos || {}).some(v => v > 0) && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
                <Info size={12} className="text-slate-400" />
                Concentraciones en bolsa final — Verificación CCSS (Manual SNF 2018, p. 18)
              </p>
              <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
                {[
                  { ion: 'Na⁺',   val: resultado.concElectrolitos.na,  max: 154, unit: 'mEq/L' },
                  { ion: 'K⁺',    val: resultado.concElectrolitos.k,   max: 80,  unit: 'mEq/L' },
                  { ion: 'Ca²⁺',  val: resultado.concElectrolitos.ca,  max: null, unit: 'mEq/L' },
                  { ion: 'Mg²⁺',  val: resultado.concElectrolitos.mg,  max: 20,  unit: 'mEq/L' },
                  { ion: 'PO₄³⁻', val: resultado.concElectrolitos.po4, max: 15,  unit: 'mmol/L' },
                ].map(({ ion, val, max, unit }) => val > 0 ? (
                  <div key={ion} className={`rounded-lg p-1.5 border ${max && val > max ? 'bg-red-50 border-red-300' : 'bg-white border-slate-200'}`}>
                    <p className="text-slate-400">{ion}</p>
                    <p className={`font-bold text-sm ${max && val > max ? 'text-red-700' : 'text-slate-800'}`}>{val}</p>
                    <p className="text-slate-400">{unit}</p>
                    {max && <p className={`text-[8px] ${val > max ? 'text-red-500 font-bold' : 'text-slate-300'}`}>máx {max}</p>}
                  </div>
                ) : null)}
              </div>
            </div>
          )}

          {/* Restricciones del perfil (si aplica) */}
          {resultado.perfilRestricciones.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <p className="text-xs font-bold text-blue-700 mb-1.5">Restricciones del perfil: {resultado.perfilLabel}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                {resultado.perfilRestricciones.map((r, i) => (
                  <div key={i} className="flex items-start gap-1.5 text-xs text-blue-800">
                    <AlertCircle size={11} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    {r}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conversión a soluciones comerciales */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Conversión a soluciones comerciales</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Dextrosa 50%',    g: resultado.dextrosaG, vol: resultado.volDex },
                { label: 'Aminoácidos 10%', g: resultado.protG,     vol: resultado.volAA  },
                ...(form.conLipidos ? [{ label: 'Lípidos 20%', g: resultado.lipidoG, vol: resultado.volLipido }] : []),
              ].map((m, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-3 text-center shadow-sm">
                  <p className="text-xs text-slate-400 mb-1">{m.label}</p>
                  <p className="font-bold text-slate-800">{m.g} g</p>
                  <p className="text-xs text-teal-600 font-semibold">≈ {m.vol} mL</p>
                </div>
              ))}
            </div>

            {resultado.volumenExcedido ? (
              <div className="mt-3 flex items-start gap-3 bg-red-50 border border-red-300 rounded-xl p-4 text-sm">
                <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-800">Inviabilidad física — la mezcla no cabe en la bolsa</p>
                  <p className="text-xs text-red-700 mt-1">
                    Componentes puros: <strong>{resultado.volumenComponentes} mL</strong> ({resultado.porcentajeOcupado}%) &gt; bolsa {resultado.volTotal} mL.
                  </p>
                  <p className="text-xs text-red-800 font-semibold mt-1">
                    Opciones: aumentar volumen a ≥{resultado.volSugerido} mL · o solicitar AA 15% / Dextrosa 70%.
                  </p>
                </div>
              </div>
            ) : resultado.sinEspacioAditivos ? (
              <div className="mt-3 flex items-start gap-3 bg-orange-50 border border-orange-300 rounded-xl p-4 text-sm">
                <AlertTriangle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-orange-800">Sin espacio para aditivos obligatorios</p>
                  <p className="text-xs text-orange-700 mt-1">
                    Componentes: <strong>{resultado.volumenComponentes} mL</strong> — remanente: <strong>{resultado.volTotal - resultado.volumenComponentes} mL</strong>.
                    Se requieren mínimo 100 mL para electrolitos, vitaminas y oligoelementos.
                  </p>
                  <p className="text-xs text-orange-800 font-semibold mt-1">
                    Aumentar bolsa a ≥{resultado.volSugerido} mL · o reducir aporte de macronutrientes.
                  </p>
                </div>
              </div>
            ) : resultado.volumenJusto ? (
              <div className="mt-3 flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl p-4 text-sm">
                <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800">Espacio remanente limitado ({100 - resultado.porcentajeOcupado}%)</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Componentes: {resultado.volumenComponentes} mL ({resultado.porcentajeOcupado}%). Solo <strong>{resultado.volTotal - resultado.volumenComponentes} mL</strong> para aditivos. Verificar con farmacia.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                Espacio remanente: <strong className="mx-1">{resultado.volTotal - resultado.volumenComponentes} mL</strong> ({100 - resultado.porcentajeOcupado}%) — disponible para electrolitos y agua estéril.
              </div>
            )}
          </div>

          {/* Tasa de infusión */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
            <Clock size={18} className="text-slate-500 flex-shrink-0" />
            <div>
              <span className="font-semibold text-slate-700">Tasa de infusión: {resultado.tasaInfusion} mL/h</span>
              <p className="text-xs text-slate-400">{resultado.volTotal} mL ÷ {resultado.horasInfusion}h{resultado.horasInfusion < 24 ? ' — NP cíclica' : ' — NP continua'}</p>
            </div>
          </div>

          {/* NPC:N */}
          <div className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${resultado.npcNEstado === 'optimo' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
            {resultado.npcNEstado === 'optimo'
              ? <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              : <AlertCircle  size={18} className="text-amber-500  flex-shrink-0 mt-0.5" />}
            <div>
              <span className="font-semibold">Relación NPC:N = {resultado.npcN}:1</span>
              <span className="text-slate-500 ml-2 text-xs">
                ({resultado.npcNEstado === 'optimo' ? 'Óptimo 80–150:1' : resultado.npcNEstado === 'bajo' ? 'Bajo <80:1' : 'Alto >150:1'})
              </span>
              <p className="text-slate-600 text-xs mt-0.5">Nitrógeno total: {resultado.nitrogeno} g/día</p>
            </div>
          </div>

          {/* Vía de administración — 5 zonas Pereira Da Silva */}
          <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${VIA_ZONE_STYLES[resultado.viaInfo.color]}`}>
            <Info size={18} className={`flex-shrink-0 mt-0.5 ${VIA_ICON_COLOR[resultado.viaInfo.color]}`} />
            <div className="w-full">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold">{resultado.viaInfo.label}</span>
                <span className="text-xs font-mono bg-white/50 rounded px-2 py-0.5">{resultado.osmolaridad} mOsm/L</span>
              </div>
              <p className="text-xs opacity-80">{resultado.viaInfo.desc}</p>
              <p className="text-[10px] opacity-60 mt-1">Fuente: Pereira Da Silva et al. Nutr Hosp 2015; SENPE; ASPEN</p>
            </div>
          </div>

          {/* Balance nitrogenado */}
          {resultado.balanceN && (
            <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
              resultado.balanceN.estado === 'anabolico'  ? 'bg-emerald-50 border-emerald-200' :
              resultado.balanceN.estado === 'catabolico' ? 'bg-red-50 border-red-200'         :
                                                           'bg-blue-50 border-blue-200'
            }`}>
              <Activity size={18} className={`flex-shrink-0 mt-0.5 ${
                resultado.balanceN.estado === 'anabolico'  ? 'text-emerald-500' :
                resultado.balanceN.estado === 'catabolico' ? 'text-red-500'     : 'text-blue-500'
              }`} />
              <div className="w-full">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">Balance Nitrogenado</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    resultado.balanceN.estado === 'anabolico'  ? 'bg-emerald-200 text-emerald-800' :
                    resultado.balanceN.estado === 'catabolico' ? 'bg-red-200 text-red-800'         :
                                                                 'bg-blue-200 text-blue-800'
                  }`}>
                    {resultado.balanceN.estado === 'anabolico' ? 'Anabólico' : resultado.balanceN.estado === 'catabolico' ? 'Catabólico' : 'Neutro'}
                  </span>
                </div>
                <p className="text-slate-700">
                  BN = <strong>{resultado.balanceN.nBalance} g N/día</strong> — Pérdidas: {resultado.balanceN.nLoss} g (NUU + factor)
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Proteína para equilibrio: <strong>{resultado.balanceN.protNeutral} g/día</strong> ({resultado.balanceN.protNeutralKg} g/kg/día)
                  {resultado.balanceN.estado === 'catabolico' && ' — Para +1 g BN positivo: añadir 6.25 g AA adicionales.'}
                  {resultado.balanceN.estado === 'anabolico' && ' — Estado metabólico favorable.'}
                </p>
              </div>
            </div>
          )}

          {/* Índice de Estrés de Bistrian */}
          {resultado.bistrianData && (
            <div className={`border rounded-xl p-4 text-sm ${
              resultado.bistrianData.nivel === 'grave'    ? 'bg-red-50 border-red-200' :
              resultado.bistrianData.nivel === 'moderado' ? 'bg-orange-50 border-orange-200' :
              resultado.bistrianData.nivel === 'leve'     ? 'bg-amber-50 border-amber-200' :
                                                            'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Activity size={16} className={
                    resultado.bistrianData.nivel === 'grave'    ? 'text-red-500' :
                    resultado.bistrianData.nivel === 'moderado' ? 'text-orange-500' :
                    resultado.bistrianData.nivel === 'leve'     ? 'text-amber-500' : 'text-slate-400'
                  } />
                  <span className="font-semibold text-slate-800">Índice de Estrés Metabólico (Bistrian)</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  resultado.bistrianData.nivel === 'grave'    ? 'bg-red-200 text-red-800' :
                  resultado.bistrianData.nivel === 'moderado' ? 'bg-orange-200 text-orange-800' :
                  resultado.bistrianData.nivel === 'leve'     ? 'bg-amber-200 text-amber-800' :
                                                                'bg-slate-200 text-slate-600'
                }`}>
                  {resultado.bistrianData.nivel === 'grave' ? 'ESTRÉS GRAVE' :
                   resultado.bistrianData.nivel === 'moderado' ? 'Estrés Moderado' :
                   resultado.bistrianData.nivel === 'leve' ? 'Estrés Leve' : 'Sin estrés'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="bg-white/60 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-400">Índice = NUU − (0.5 × N_ing + 3)</p>
                  <p className={`font-bold text-lg ${resultado.bistrianData.nivel === 'grave' ? 'text-red-700' : resultado.bistrianData.nivel === 'moderado' ? 'text-orange-700' : 'text-amber-700'}`}>
                    {resultado.bistrianData.indice}
                  </p>
                </div>
                <div className="bg-white/60 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-400">NUU basal esperado</p>
                  <p className="font-bold text-slate-700">{resultado.bistrianData.nUUBasal} g/día</p>
                </div>
              </div>
              <p className="text-xs text-slate-600">{resultado.bistrianData.descripcion}</p>
              <div className="mt-2 text-[10px] text-slate-400 border-t border-white/50 pt-2">
                Escala: 0–5 Leve · 5–8 Moderado · &gt;8 Grave · Fuente: Bistrian BR et al.; SEFH Biblioteca Virtual
              </div>
            </div>
          )}

          {/* TIG — Tasa de Infusión de Glucosa (pediátrico/neonatal) */}
          {resultado.tigData && (
            <div className={`border rounded-xl p-4 text-sm ${
              resultado.tigData.nivel === 'critico' ? 'bg-red-50 border-red-300' :
              resultado.tigData.nivel === 'limite'  ? 'bg-amber-50 border-amber-300' :
                                                      'bg-emerald-50 border-emerald-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Baby size={16} className={resultado.tigData.nivel === 'critico' ? 'text-red-500' : resultado.tigData.nivel === 'limite' ? 'text-amber-500' : 'text-emerald-500'} />
                  <span className="font-semibold text-slate-800">Tasa de Infusión de Glucosa (TIG)</span>
                </div>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  resultado.tigData.nivel === 'critico' ? 'bg-red-200 text-red-900' :
                  resultado.tigData.nivel === 'limite'  ? 'bg-amber-200 text-amber-900' :
                                                          'bg-emerald-200 text-emerald-900'
                }`}>
                  {resultado.tigData.nivel === 'critico' ? 'EXCEDE LÍMITE' : resultado.tigData.nivel === 'limite' ? 'Próximo al límite' : 'Segura'}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-2">
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-400">TIG calculada</p>
                  <p className={`font-bold text-xl ${resultado.tigData.nivel === 'critico' ? 'text-red-700' : resultado.tigData.nivel === 'limite' ? 'text-amber-700' : 'text-emerald-700'}`}>
                    {resultado.tigData.tig}
                  </p>
                  <p className="text-xs text-slate-400">mg/kg/min</p>
                </div>
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-400">Inicio recomendado</p>
                  <p className="font-bold text-slate-700">{resultado.tigData.tigInicio[0]}–{resultado.tigData.tigInicio[1]}</p>
                  <p className="text-xs text-slate-400">mg/kg/min</p>
                </div>
                <div className="bg-white/70 rounded-lg p-2 text-center">
                  <p className="text-xs text-slate-400">Límite máximo</p>
                  <p className={`font-bold ${resultado.tigData.nivel === 'critico' ? 'text-red-700' : 'text-slate-700'}`}>{resultado.tigData.tigMax}</p>
                  <p className="text-xs text-slate-400">mg/kg/min</p>
                </div>
              </div>
              {resultado.tigData.nivel === 'critico' && (
                <p className="text-xs text-red-700 font-semibold">
                  ALERTA: TIG excede el límite. El exceso de glucosa se deriva a lipogénesis hepática → esteatosis fulminante y retención de CO₂ → imposibilita la extubación. Reducir dextrosa o aumentar volumen.
                </p>
              )}
              <p className="text-[10px] text-slate-400 mt-1">
                TIG = g glucosa/día × 1000 ÷ (peso × 1440 min) · Fuente: Manual CCSS HNN 2018; ASPEN Pediatric PN Guidelines
              </p>
            </div>
          )}

          {/* TIG adulto — alerta en NP 2-en-1 */}
          {resultado.tigAdultoAlerta && (
            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-300 rounded-xl text-sm">
              <AlertTriangle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-orange-800">Carga glucídica elevada — NP 2-en-1</p>
                <p className="text-xs text-orange-700 mt-1">
                  TIG calculada: <strong>{resultado.tigAdultoVal} mg/kg/min</strong> — supera el límite recomendado de 5 mg/kg/min (ASPEN 2016).
                  Sin lípidos, toda la energía no proteica se entrega como glucosa.
                </p>
                <p className="text-xs text-orange-800 font-semibold mt-1">
                  Revisar: agregar emulsión lipídica (NP 3-en-1) o reducir el objetivo calórico. Riesgo de esteatosis hepática y retención de CO₂.
                </p>
              </div>
            </div>
          )}

          {/* Insulina */}
          {resultado.insulina !== null && (
            <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl text-sm">
              <Syringe size={18} className="text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-purple-800">Insulina corriente inicial sugerida</span>
                <p className="text-purple-700 font-bold text-base mt-0.5">{resultado.insulina} UI</p>
                <p className="text-xs text-purple-600 mt-0.5">
                  Dextrosa ({resultado.dextrosaG}g) ÷ 10 = {resultado.insulina} UI — Ajustar según glicemia capilar c/2h. Requiere validación médica.
                </p>
              </div>
            </div>
          )}

          {/* Alerta de sobrecarga glucídica — Diálisis Peritoneal */}
          {resultado.alertaDpGlucosa && (
            <div className="flex items-start gap-3 p-4 bg-orange-50 border border-orange-300 rounded-xl text-sm">
              <AlertTriangle size={18} className="text-orange-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-orange-800">Sobrecarga glucídica — Perfil Diálisis Peritoneal</p>
                <p className="text-xs text-orange-700 mt-1">
                  Carga de dextrosa parenteral: <strong>{resultado.dextrosaGKg} g/kg/día</strong> — supera 3.5 g/kg/día en paciente con DP.
                  Estos pacientes absorben 60–80% de la glucosa del dializante peritoneal, predisponiendo a
                  hiperglucemia sostenida, hipertrigliceridemia grave y esteatosis hepática.
                </p>
                <p className="text-xs text-orange-800 font-semibold mt-1">
                  Revisar: reducir dextrosa parenteral e incrementar proporción de calorías lipídicas (lípidos IV).
                  Fuente: ISPD Nutrition Guidelines 2021 · NKF-KDOQI 2020.
                </p>
              </div>
            </div>
          )}

          {/* Semáforo de estabilidad */}
          {resultado.estabilidad && (
            <div className={`border rounded-xl p-4 ${SEMAFORO_BG[resultado.estabilidad.nivel]}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${resultado.estabilidad.nivel === 'rojo' ? 'bg-red-500' : resultado.estabilidad.nivel === 'amarillo' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                <SemaforoIcon nivel={resultado.estabilidad.nivel} />
                <span className={`font-bold text-sm ${SEMAFORO_TEXT[resultado.estabilidad.nivel]}`}>
                  Semáforo de Estabilidad Fisicoquímica
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                {[
                  { label: 'Ca²⁺ final',  value: `${resultado.estabilidad.caConc} mEq/L`  },
                  { label: 'PO₄³⁻ final', value: `${resultado.estabilidad.po4Conc} mmol/L` },
                  { label: 'Ca × PO₄',    value: resultado.estabilidad.producto             },
                ].map((s, i) => (
                  <div key={i} className="bg-white/60 rounded-lg p-2 text-center">
                    <p className="text-slate-400">{s.label}</p>
                    <p className={`font-bold ${SEMAFORO_TEXT[resultado.estabilidad.nivel]}`}>{s.value}</p>
                  </div>
                ))}
              </div>
              {resultado.estabilidad.mensajes.map((m, i) => (
                <p key={i} className={`text-xs ${SEMAFORO_TEXT[resultado.estabilidad.nivel]}`}>• {m}</p>
              ))}
            </div>
          )}

          {/* Oligoelementos pediátricos */}
          {resultado.oligoelementos && (
            <div className="flex items-start gap-3 p-4 bg-pink-50 border border-pink-200 rounded-xl text-sm">
              <Baby size={18} className="text-pink-500 flex-shrink-0 mt-0.5" />
              <div className="w-full">
                <p className="font-bold text-pink-800 mb-2">Oligoelementos Pediátricos</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/70 rounded-lg p-2">
                    <p className="text-slate-500">Cu, Mn, Cr, Zn (multi-oligo)</p>
                    <p className="font-bold text-pink-700 text-base">{resultado.oligoelementos.multiOligo} mL/día</p>
                    <p className="text-slate-400">{resultado.pesoCal} kg × 0.2 mL/kg/día</p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-2">
                    <p className="text-slate-500">Selenio</p>
                    <p className="font-bold text-pink-700 text-base">{resultado.oligoelementos.selenio} mL/día</p>
                    <p className="text-slate-400">{resultado.pesoCal} kg × 0.1 mL/kg/día</p>
                  </div>
                </div>
                <p className="text-xs text-pink-700 mt-2 font-medium">Verificar con farmacia hospitalaria antes de preparar.</p>
              </div>
            </div>
          )}

          {/* Insight biotecnológico */}
          {resultado.lipido?.omega3 && (
            <div className="bg-teal-700 text-white rounded-xl p-4 flex gap-3">
              <Dna size={20} className="flex-shrink-0 text-teal-300 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-sm mb-1">Insight Biotecnológico</p>
                <p className="text-teal-100">
                  Los ácidos grasos omega-3 de esta formulación provienen de aceite de pescado o microalgas marinas (fermentación biotecnológica). Reducen fitoesteroles hepatotóxicos asociados a IFALD en NP de larga duración, y pueden atenuar las vías inflamatorias del catabolismo oncológico (EPA).
                </p>
              </div>
            </div>
          )}

          {/* Checklist de enfermería */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
            <p className="font-bold text-slate-700 text-sm flex items-center gap-1.5 mb-3">
              <CheckCircle size={14} className="text-teal-500" />
              Checklist de Enfermería — Control NP
            </p>
            {CHECKLIST_ENFERMERIA.map((item, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <div className="w-4 h-4 border border-slate-300 rounded flex-shrink-0 mt-0.5 bg-white" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Panel de referencias expandible */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden">
        <button onClick={() => setShowRefs(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors">
          <span className="flex items-center gap-2">
            <BookOpen size={13} className="text-slate-400" />
            Fuentes de evidencia clínica consultadas ({REFERENCIAS_CLINICAS.length} documentos verificados)
          </span>
          {showRefs ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        {showRefs && (
          <div className="px-4 pb-4 space-y-1.5">
            {REFERENCIAS_CLINICAS.map((r, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px] text-slate-500">
                <span className="text-teal-500 font-bold flex-shrink-0 w-4">{i+1}.</span>
                <div>
                  <span className="font-semibold text-slate-700">{r.label}</span>
                  {' — '}{r.descripcion}
                  {r.uso && <span className="text-teal-600"> · Aplicado en: {r.uso}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="px-4 py-2 bg-red-50 border-t border-red-100">
          <p className="text-[10px] font-semibold text-red-700">
            RESULTADO PROVISIONAL — requiere revisión y autorización del equipo de soporte nutricional antes de cualquier acción clínica.
          </p>
        </div>
      </div>
    </div>
  )
}
