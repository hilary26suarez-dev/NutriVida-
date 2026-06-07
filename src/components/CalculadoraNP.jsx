import { Activity, AlertCircle, AlertTriangle, Baby, CheckCircle, Clock, Dna, Info, Printer, RotateCcw, Syringe } from 'lucide-react'
import { useState } from 'react'

const CONDICIONES = [
  { id: 'reposo',          label: 'Sin estrés / reposo',              factor: 1.0, proteina: [1.0, 1.2], kcalRange: [20, 25] },
  { id: 'postop_menor',    label: 'Posoperatorio menor',               factor: 1.1, proteina: [1.2, 1.5], kcalRange: [20, 25] },
  { id: 'trauma_moderado', label: 'Infección / trauma moderado',       factor: 1.2, proteina: [1.5, 1.8], kcalRange: [22, 28] },
  { id: 'cirugia_mayor',   label: 'Cirugía mayor / infección severa',  factor: 1.3, proteina: [1.5, 2.0], kcalRange: [25, 30] },
  { id: 'sepsis',          label: 'Sepsis / trauma severo',            factor: 1.4, proteina: [1.5, 2.0], kcalRange: [25, 30] },
  { id: 'quemaduras',      label: 'Quemaduras extensas (>40% SCT)',    factor: 1.5, proteina: [1.5, 2.5], kcalRange: [30, 35] },
]

const LIPIDOS = [
  { id: 'soja',       label: 'Soja (Intralipid®)',                   omega3: false },
  { id: 'oliva_soja', label: 'Oliva/Soja (ClinOleic®)',              omega3: false },
  { id: 'mixto',      label: 'Mixto SMOF (soja/MCT/oliva/pez)',      omega3: true  },
  { id: 'microalgas', label: 'Omega-3 / Microalgas (Omegaven®)',     omega3: true  },
]

const SEMAFORO_BG   = { rojo: 'bg-red-50 border-red-200',     amarillo: 'bg-amber-50 border-amber-200',  verde: 'bg-emerald-50 border-emerald-200' }
const SEMAFORO_TEXT = { rojo: 'text-red-700',                  amarillo: 'text-amber-700',                verde: 'text-emerald-700' }

function SemaforoIcon({ nivel }) {
  if (nivel === 'rojo')    return <AlertTriangle size={22} className="text-red-600" />
  if (nivel === 'amarillo') return <AlertCircle  size={22} className="text-amber-500" />
  return <CheckCircle size={22} className="text-emerald-500" />
}

function calcBEE(peso, talla, edad, sexo) {
  if (sexo === 'M') return 66.5  + 13.75 * peso + 5.003 * talla - 6.775 * edad
  return               655.1 +  9.563 * peso + 1.85  * talla - 4.676 * edad
}

function calcEstabilidad(caTotal, po4Total, mgTotal, volumen, conLipidos) {
  if (!caTotal || !po4Total || !volumen) return null
  const caConc   = (caTotal  / volumen) * 1000
  const po4Conc  = (po4Total / volumen) * 1000
  const mgConc   = (mgTotal  / volumen) * 1000
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
    ca: '', po4: '', mg: '',
  })
  const [resultado, setResultado] = useState(null)
  const [errores, setErrores] = useState([])

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const condActual = CONDICIONES.find(c => c.id === form.condicion)
  const kcalMin = form.ambulatorio ? 30 : condActual?.kcalRange[0] ?? 20
  const kcalMax = form.ambulatorio ? 35 : condActual?.kcalRange[1] ?? 25

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

    if (faltantes.length > 0) {
      setErrores(faltantes)
      return
    }
    setErrores([])

    let ten, bee

    if (form.modoCalculo === 'kcal_kg') {
      const kcalKg = parseFloat(form.kcalKg)
      bee = null
      ten = kcalKg * peso
    } else {
      const talla = parseFloat(form.talla)
      const edad  = parseFloat(form.edad)
      bee = calcBEE(peso, talla, edad, form.sexo)
      ten = bee * condActual.factor
    }

    // Protein: UUN-based (lab) takes priority over formula estimate
    const corrFactor    = parseFloat(form.corrFactor) || 2
    const uun           = parseFloat(form.uun24h)
    const protFormula   = (parseFloat(form.proteinaGKg) || ((condActual.proteina[0] + condActual.proteina[1]) / 2)) * peso
    const protFromUUN   = uun > 0 ? (uun + corrFactor) * 6.25 : null
    const protG         = protFromUUN ?? protFormula

    const kcalProt     = protG * 4
    const npc          = ten - kcalProt
    const dextrosaG    = Math.max(0, (npc * 0.65) / 3.4)
    const lipidoG      = form.conLipidos ? Math.max(0, (npc * 0.35) / 10) : 0
    const nitrogeno    = protG / 6.25
    const npcN         = npc / (nitrogeno || 1)
    const osmolaridad  = Math.round((dextrosaG / vol * 1000 * 5) + (protG / vol * 1000 * 10) + 300)

    // Stability
    const caTotal  = parseFloat(form.ca)  || 0
    const po4Total = parseFloat(form.po4) || 0
    const mgTotal  = parseFloat(form.mg)  || 0
    const estabilidad = caTotal > 0 || po4Total > 0
      ? calcEstabilidad(caTotal, po4Total, mgTotal, vol, form.conLipidos)
      : null

    // Nitrogen balance result (explicit display)
    let balanceN = null
    if (uun > 0) {
      const nIntake  = nitrogeno
      const nLoss    = uun + corrFactor
      const nBalance = nIntake - nLoss
      balanceN = {
        nBalance:      nBalance.toFixed(1),
        estado:        nBalance > 1 ? 'anabolico' : nBalance < -1 ? 'catabolico' : 'neutro',
        protFormula:   Math.round(protFormula),
        protNeutral:   Math.round((uun + corrFactor) * 6.25),
        protNeutralKg: ((uun + corrFactor) * 6.25 / peso).toFixed(2),
        nLoss:         nLoss.toFixed(1),
      }
    }

    // Osmolarity zone
    const viaZone        = osmolaridad > 900 ? 'alta' : osmolaridad > 700 ? 'media' : 'baja'
    const viaRecomendada = osmolaridad > 900 ? 'Central — CVC obligatorio' : osmolaridad > 700 ? 'Preferir vía central' : 'Periférica o Central'

    const volAA     = Math.round(protG / 0.1)
    const volDex    = Math.round(dextrosaG / 0.5)
    const volLipido = form.conLipidos ? Math.round(lipidoG / 0.2) : 0
    const volumenComponentes = volAA + volDex + volLipido
    const porcentajeOcupado  = (volumenComponentes / vol) * 100

    setResultado({
      bee: bee ? Math.round(bee) : null,
      ten: Math.round(ten),
      protG: Math.round(protG), protGKg: (protG / peso).toFixed(2),
      protFuente: protFromUUN ? 'UUN (laboratorio)' : 'Ecuación metabólica',
      dextrosaG: Math.round(dextrosaG), lipidoG: Math.round(lipidoG),
      nitrogeno: nitrogeno.toFixed(1), npcN: Math.round(npcN),
      volAA, volDex, volLipido,
      volumenComponentes,
      porcentajeOcupado: Math.round(porcentajeOcupado),
      volumenExcedido:   volumenComponentes > vol,
      volumenJusto:      porcentajeOcupado > 90 && volumenComponentes <= vol,
      volSugerido:       Math.ceil((volumenComponentes + 150) / 100) * 100,
      osmolaridad, viaZone, viaRecomendada,
      npcNEstado: npcN < 80 ? 'bajo' : npcN > 150 ? 'alto' : 'optimo',
      estabilidad,
      lipido:         LIPIDOS.find(l => l.id === form.lipido),
      balanceN,
      insulina:       form.diabetico ? Math.round(dextrosaG / 10) : null,
      oligoelementos: form.pediatrico ? { multiOligo: (peso * 0.2).toFixed(2), selenio: (peso * 0.1).toFixed(2) } : null,
      tasaInfusion:   (vol / horas).toFixed(1),
      horasInfusion:  horas,
      volTotal:       vol,
    })
  }

  const resetForm = () => {
    setForm(p => ({
      ...p,
      peso: '', talla: '', edad: '', volumen: '', ca: '', po4: '', mg: '',
      proteinaGKg: '', kcalKg: '', uun24h: '', diabetico: false, pediatrico: false,
    }))
    setResultado(null)
    setErrores([])
  }

  return (
    <div className="space-y-6">
      {/* Disclaimer */}
      <div className="flex flex-col gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900">
        <div className="flex items-start gap-2">
          <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Herramienta de estimación educativa — Propuesta de apoyo clínico para la CCSS.</p>
            <p className="mt-1">
              Los cálculos son estimativos y <strong>deben ser validados por médico, farmacéutico o nutricionista especializado</strong> antes de preparar o administrar cualquier mezcla parenteral.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Sección 1 — Paciente y energía */}
        <div className="space-y-4">
          <h3 className="font-bold text-teal-800 flex items-center gap-2">
            <span className="bg-teal-100 text-teal-600 text-xs font-bold px-2 py-0.5 rounded-md">1</span>
            Paciente y Energía
          </h3>

          {/* Datos antropométricos */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Peso real (kg)</label>
              <input type="number" value={form.peso} onChange={e => set('peso', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                placeholder="70" min="1" max="300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Talla (cm) {form.modoCalculo === 'kcal_kg' && <span className="text-slate-400 font-normal">(opcional)</span>}
              </label>
              <input type="number" value={form.talla} onChange={e => set('talla', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                placeholder="165" min="50" max="250" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">
                Edad (años) {form.modoCalculo === 'kcal_kg' && <span className="text-slate-400 font-normal">(opcional)</span>}
              </label>
              <input type="number" value={form.edad} onChange={e => set('edad', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                placeholder="45" min="0" max="120" />
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
                { id: 'harris_benedict', title: 'Harris-Benedict',   sub: 'Preciso — requiere talla y edad' },
                { id: 'kcal_kg',         title: 'Objetivo kcal/kg',  sub: `ESPEN: ${kcalMin}–${kcalMax} kcal/kg/día` },
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
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                placeholder={`${kcalMin}–${kcalMax} según condición`} step="1" min="10" max="50" />
              <p className="text-xs text-teal-600 mt-1 flex items-center gap-1">
                <Info size={12} />
                Encamado 20–25 · Ambulatorio 30–35 · Pediátrico hasta 120 kcal/kg/día
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
            {condActual && (
              <p className="text-xs text-teal-600 mt-1 flex items-center gap-1">
                <Info size={12} />
                Proteína sugerida: {condActual.proteina[0]}–{condActual.proteina[1]} g/kg/día
              </p>
            )}
          </div>

          {/* Proteína */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Proteína (g/kg/día) — opcional</label>
            <input type="number" value={form.proteinaGKg} onChange={e => set('proteinaGKg', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
              placeholder={`${condActual?.proteina[0]}–${condActual?.proteina[1]} (vacío = promedio)`}
              step="0.1" min="0.5" max="3.5" />
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
                  className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-teal-400 bg-white"
                  placeholder="ej. 8–12 g" step="0.1" min="0" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Factor corrección (g N)</label>
                <select value={form.corrFactor} onChange={e => set('corrFactor', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-teal-400 bg-white">
                  <option value="2">2 g — pérdidas normales</option>
                  <option value="4">4 g — catabolismo moderado</option>
                  <option value="6">6 g — hipercatabolismo severo</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Si se ingresa NUU, la proteína de la mezcla se estima por balance nitrogenado. Proteína = (NUU + factor) × 6.25
            </p>
          </div>

          {/* Volumen e infusión */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Volumen total (mL)</label>
              <input type="number" value={form.volumen} onChange={e => set('volumen', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                placeholder="2000" min="500" max="5000" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Horas infusión/día</label>
              <input type="number" value={form.horasInfusion} onChange={e => set('horasInfusion', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                placeholder="24" min="8" max="24" />
              <p className="text-xs text-slate-400 mt-1">24h continua · 12–16h cíclica domiciliaria</p>
            </div>
          </div>
        </div>

        {/* Sección 2 — Lípidos, estabilidad y opciones */}
        <div className="space-y-4">
          <h3 className="font-bold text-teal-800 flex items-center gap-2">
            <span className="bg-teal-100 text-teal-600 text-xs font-bold px-2 py-0.5 rounded-md">2</span>
            Lípidos, Estabilidad y Opciones
          </h3>

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

          {/* Electrolitos para estabilidad */}
          <div>
            <p className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-1">
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-md">Semáforo</span>
              Electrolitos — análisis de estabilidad fisicoquímica
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Ca²⁺ (mEq total)</label>
                <input type="number" value={form.ca} onChange={e => set('ca', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-amber-400"
                  placeholder="10" min="0" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">PO₄³⁻ (mmol total)</label>
                <input type="number" value={form.po4} onChange={e => set('po4', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-amber-400"
                  placeholder="20" min="0" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Mg²⁺ (mEq total)</label>
                <input type="number" value={form.mg} onChange={e => set('mg', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-amber-400"
                  placeholder="8" min="0" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">Ingrese cantidades totales en la mezcla para activar el semáforo Ca-PO₄.</p>
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
                Pediátrico / neonato — calcular oligoelementos CCSS
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Botones */}
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
          <button onClick={() => window.print()}
            className="flex items-center gap-1.5 text-xs text-slate-500 border border-slate-200 px-3 py-2 rounded-xl hover:text-slate-700">
            <Printer size={13} /> Imprimir
          </button>
        )}
      </div>

      {/* Validación — campos faltantes */}
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

      {/* Resultados */}
      {resultado && (
        <div className="space-y-4 border-t border-teal-100 pt-5">
          <h3 className="font-bold text-teal-800">Resultado del Cálculo</h3>

          {/* Energía */}
          <div className="bg-teal-50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3 border border-teal-100">
            {[
              resultado.bee !== null && { label: 'Gasto Basal (Harris-B.)', value: resultado.bee, unit: 'kcal/día' },
              { label: 'Necesidad Total (TEN)', value: resultado.ten, unit: 'kcal/día', highlight: true },
              { label: `Proteína (${resultado.protFuente})`, value: `${resultado.protG}g`, unit: `${resultado.protGKg} g/kg/día` },
              { label: 'Osmolaridad estimada', value: resultado.osmolaridad, unit: 'mOsm/L' },
            ].filter(Boolean).map((item, i) => (
              <div key={i} className={`bg-white rounded-lg p-3 text-center ${item.highlight ? 'ring-2 ring-teal-300' : ''}`}>
                <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                <p className={`font-bold text-lg ${item.highlight ? 'text-teal-700' : 'text-slate-800'}`}>{item.value}</p>
                {item.unit && <p className="text-xs text-slate-400">{item.unit}</p>}
              </div>
            ))}
          </div>

          {/* Conversión a soluciones comerciales */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Conversión a soluciones comerciales</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Dextrosa 50%',   g: resultado.dextrosaG, vol: resultado.volDex },
                { label: 'Aminoácidos 10%', g: resultado.protG,     vol: resultado.volAA },
                ...(form.conLipidos ? [{ label: 'Lípidos 20%', g: resultado.lipidoG, vol: resultado.volLipido }] : []),
              ].map((m, i) => (
                <div key={i} className="bg-white border border-slate-100 rounded-xl p-3 text-center shadow-sm">
                  <p className="text-xs text-slate-400 mb-1">{m.label}</p>
                  <p className="font-bold text-slate-800">{m.g} g</p>
                  <p className="text-xs text-teal-600 font-semibold">≈ {m.vol} mL</p>
                </div>
              ))}
            </div>

            {/* Alerta de viabilidad física de la mezcla */}
            {resultado.volumenExcedido ? (
              <div className="mt-3 flex items-start gap-3 bg-red-50 border border-red-300 rounded-xl p-4 text-sm">
                <AlertTriangle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-800">Inviabilidad física — la mezcla no cabe en la bolsa</p>
                  <p className="text-xs text-red-700 mt-1">
                    Los componentes puros suman <strong>{resultado.volumenComponentes} mL</strong> ({resultado.porcentajeOcupado}% de la bolsa),
                    superando el volumen configurado de <strong>{resultado.volTotal} mL</strong>.
                    El farmacéutico no puede preparar esta mezcla sin desbordamiento ni alteración de concentraciones.
                  </p>
                  <p className="text-xs text-red-800 font-semibold mt-2">
                    Opciones: aumentar el volumen total a ≥{resultado.volSugerido} mL · o solicitar AA 15% / Dextrosa 70% (reduce el volumen de componentes).
                  </p>
                </div>
              </div>
            ) : resultado.volumenJusto ? (
              <div className="mt-3 flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-xl p-4 text-sm">
                <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-amber-800">Espacio remanente limitado ({100 - resultado.porcentajeOcupado}%)</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Los componentes puros ocupan <strong>{resultado.volumenComponentes} mL</strong> ({resultado.porcentajeOcupado}%) del total.
                    Quedan solo <strong>{resultado.volTotal - resultado.volumenComponentes} mL</strong> para electrolitos, agua estéril y oligoelementos.
                    Verificar con farmacia si el espacio es suficiente para los aditivos prescritos.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />
                <span>
                  Espacio remanente: <strong>{resultado.volTotal - resultado.volumenComponentes} mL</strong> ({100 - resultado.porcentajeOcupado}%) —
                  disponible para electrolitos y agua estéril.
                </span>
              </div>
            )}
          </div>

          {/* Tasa de infusión */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm">
            <Clock size={18} className="text-slate-500 flex-shrink-0" />
            <div>
              <span className="font-semibold text-slate-700">Tasa de infusión: {resultado.tasaInfusion} mL/h</span>
              <p className="text-xs text-slate-400">
                {resultado.volTotal} mL ÷ {resultado.horasInfusion}h
                {resultado.horasInfusion < 24 ? ' — NP cíclica' : ' — NP continua'}
              </p>
            </div>
          </div>

          {/* NPC:N */}
          <div className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
            resultado.npcNEstado === 'optimo' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
          }`}>
            {resultado.npcNEstado === 'optimo'
              ? <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              : <AlertCircle  size={18} className="text-amber-500  flex-shrink-0 mt-0.5" />
            }
            <div>
              <span className="font-semibold">Relación NPC:N = {resultado.npcN}:1</span>
              <span className="text-slate-500 ml-2 text-xs">
                ({resultado.npcNEstado === 'optimo' ? 'Óptimo 80–150:1' : resultado.npcNEstado === 'bajo' ? 'Bajo <80:1' : 'Alto >150:1'})
              </span>
              <p className="text-slate-600 text-xs mt-0.5">Nitrógeno total: {resultado.nitrogeno} g/día</p>
            </div>
          </div>

          {/* Vía de administración — 3 zonas */}
          <div className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
            resultado.viaZone === 'alta'  ? 'bg-red-50 border-red-200' :
            resultado.viaZone === 'media' ? 'bg-amber-50 border-amber-200' :
                                            'bg-emerald-50 border-emerald-200'
          }`}>
            <Info size={18} className={
              resultado.viaZone === 'alta'  ? 'text-red-500'   :
              resultado.viaZone === 'media' ? 'text-amber-500' : 'text-emerald-500'
            } />
            <div>
              <span className="font-semibold">Vía recomendada: {resultado.viaRecomendada}</span>
              <p className="text-xs text-slate-500 mt-0.5">
                {resultado.viaZone === 'alta'
                  ? 'Osmolaridad >900 mOsm/L: CVC obligatorio por riesgo de tromboflebitis grave en vena periférica (ESPEN/ASPEN).'
                  : resultado.viaZone === 'media'
                  ? 'Osmolaridad 700–900 mOsm/L: zona de precaución. Periférico posible a corto plazo en vena de gran calibre; preferir vía central.'
                  : 'Osmolaridad ≤700 mOsm/L: apta para vía periférica, aunque se prefiere central para NP prolongada.'}
              </p>
            </div>
          </div>

          {/* Balance nitrogenado — resultado explícito */}
          {resultado.balanceN && (
            <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm ${
              resultado.balanceN.estado === 'anabolico'  ? 'bg-emerald-50 border-emerald-200' :
              resultado.balanceN.estado === 'catabolico' ? 'bg-red-50 border-red-200'         :
                                                           'bg-blue-50 border-blue-200'
            }`}>
              <Activity size={18} className={
                resultado.balanceN.estado === 'anabolico'  ? 'text-emerald-500 flex-shrink-0 mt-0.5' :
                resultado.balanceN.estado === 'catabolico' ? 'text-red-500 flex-shrink-0 mt-0.5'     :
                                                             'text-blue-500 flex-shrink-0 mt-0.5'
              } />
              <div className="w-full">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">Balance Nitrogenado</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    resultado.balanceN.estado === 'anabolico'  ? 'bg-emerald-200 text-emerald-800' :
                    resultado.balanceN.estado === 'catabolico' ? 'bg-red-200 text-red-800'         :
                                                                 'bg-blue-200 text-blue-800'
                  }`}>
                    {resultado.balanceN.estado === 'anabolico' ? 'Anabólico' :
                     resultado.balanceN.estado === 'catabolico' ? 'Catabólico' : 'Neutro'}
                  </span>
                </div>
                <p className="text-slate-700">
                  Balance N = <strong>{resultado.balanceN.nBalance} g/día</strong>
                  {' '}— N pérdidas: {resultado.balanceN.nLoss} g (NUU + factor corrección)
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Proteína para balance neutro: <strong>{resultado.balanceN.protNeutral} g/día</strong> ({resultado.balanceN.protNeutralKg} g/kg/día)
                  {resultado.balanceN.estado === 'catabolico' && ' — Considerar aumentar aporte proteico en próxima bolsa.'}
                  {resultado.balanceN.estado === 'anabolico' && ' — Estado metabólico favorable.'}
                </p>
              </div>
            </div>
          )}

          {/* Insulina inicial sugerida */}
          {resultado.insulina !== null && (
            <div className="flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl text-sm">
              <Syringe size={18} className="text-purple-500 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-purple-800">Insulina corriente inicial sugerida</span>
                <p className="text-purple-700 font-bold text-base mt-0.5">{resultado.insulina} UI</p>
                <p className="text-xs text-purple-600 mt-0.5">
                  Dextrosa ({resultado.dextrosaG}g) ÷ 10 = {resultado.insulina} UI — Ajustar según glicemia capilar cada 2h. Requiere validación médica.
                </p>
              </div>
            </div>
          )}

          {/* Semáforo de estabilidad fisicoquímica */}
          {resultado.estabilidad && (
            <div className={`border rounded-xl p-4 ${SEMAFORO_BG[resultado.estabilidad.nivel]}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full semaforo-pulse ${
                  resultado.estabilidad.nivel === 'rojo' ? 'bg-red-500' :
                  resultado.estabilidad.nivel === 'amarillo' ? 'bg-amber-400' : 'bg-emerald-500'
                }`} />
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
                <p className="font-bold text-pink-800 mb-2">Oligoelementos Pediátricos — Dosis CCSS/HNN</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/70 rounded-lg p-2">
                    <p className="text-slate-500">Cu, Mn, Cr, Zn (multi-oligo)</p>
                    <p className="font-bold text-pink-700 text-base">{resultado.oligoelementos.multiOligo} mL/día</p>
                    <p className="text-slate-400">{form.peso} kg × 0.2 mL/kg/día</p>
                  </div>
                  <div className="bg-white/70 rounded-lg p-2">
                    <p className="text-slate-500">Selenio</p>
                    <p className="font-bold text-pink-700 text-base">{resultado.oligoelementos.selenio} mL/día</p>
                    <p className="text-slate-400">{form.peso} kg × 0.1 mL/kg/día</p>
                  </div>
                </div>
                <p className="text-xs text-pink-700 mt-2 font-medium">
                  Exactitud milimétrica requerida. Verificar con farmacia hospitalaria antes de preparar.
                </p>
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
                  Los ácidos grasos omega-3 de esta formulación provienen de aceite de pescado o de microalgas marinas cultivadas por fermentación biotecnológica. Reducen fitoesteroles hepatotóxicos asociados a enfermedad hepática en NP de larga duración (IFALD).
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

      {/* Alcance */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 leading-relaxed">
        <p className="font-bold text-slate-700 mb-1">Alcance y limitaciones del cálculo</p>
        <p>
          Estimaciones basadas en Harris-Benedict u objetivo kcal/kg (ESPEN/ASPEN 2019), factores de estrés metabólico,
          relación NPC:N, osmolaridad aproximada y criterios de estabilidad Ca-PO₄ (modelo Trissel simplificado).
          Umbral vía central: 900 mOsm/L (ESPEN). El balance nitrogenado requiere NUU de orina de 24h validada por laboratorio.
        </p>
        <p className="mt-2 font-semibold text-red-700">
          RESULTADO PROVISIONAL — requiere revisión y autorización del equipo de soporte nutricional antes de cualquier acción clínica.
        </p>
      </div>
    </div>
  )
}
