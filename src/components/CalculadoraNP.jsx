import { useState } from 'react'
import { AlertTriangle, CheckCircle, AlertCircle, Info, Printer, RotateCcw, Dna } from 'lucide-react'

const CONDICIONES = [
  { id: 'reposo', label: 'Sin estrés / reposo', factor: 1.0, proteina: [1.0, 1.2] },
  { id: 'postop_menor', label: 'Posoperatorio menor', factor: 1.1, proteina: [1.2, 1.5] },
  { id: 'trauma_moderado', label: 'Infección / trauma moderado', factor: 1.2, proteina: [1.5, 1.8] },
  { id: 'cirugia_mayor', label: 'Cirugía mayor / infección severa', factor: 1.3, proteina: [1.5, 2.0] },
  { id: 'sepsis', label: 'Sepsis / trauma severo', factor: 1.4, proteina: [1.5, 2.0] },
  { id: 'quemaduras', label: 'Quemaduras extensas (>40% SCT)', factor: 1.5, proteina: [1.5, 2.5] },
]

const LIPIDOS = [
  { id: 'soja', label: 'Soja (Intralipid®)', omega3: false },
  { id: 'oliva_soja', label: 'Oliva/Soja (ClinOleic®)', omega3: false },
  { id: 'mixto', label: 'Mixto SMOF (soja/MCT/oliva/pez)', omega3: true },
  { id: 'microalgas', label: 'Omega-3 / Microalgas (Omegaven®)', omega3: true },
]

const SEMAFORO_BG = {
  rojo: 'bg-red-50 border-red-200',
  amarillo: 'bg-amber-50 border-amber-200',
  verde: 'bg-emerald-50 border-emerald-200',
}

const SEMAFORO_TEXT = {
  rojo: 'text-red-700',
  amarillo: 'text-amber-700',
  verde: 'text-emerald-700',
}

function SemaforoIcon({ nivel }) {
  if (nivel === 'rojo') return <AlertTriangle size={22} className="text-red-600" />
  if (nivel === 'amarillo') return <AlertCircle size={22} className="text-amber-500" />
  return <CheckCircle size={22} className="text-emerald-500" />
}

function calcBEE(peso, talla, edad, sexo) {
  if (sexo === 'M') return 66.5 + 13.75 * peso + 5.003 * talla - 6.775 * edad
  return 655.1 + 9.563 * peso + 1.85 * talla - 4.676 * edad
}

function calcEstabilidad(caTotal, po4Total, mgTotal, volumen, conLipidos) {
  if (!caTotal || !po4Total || !volumen) return null
  const caConc = (caTotal / volumen) * 1000
  const po4Conc = (po4Total / volumen) * 1000
  const mgConc = (mgTotal / volumen) * 1000
  const producto = caConc * po4Conc
  const divalentes = caConc + mgConc

  let nivel = 'verde'
  let mensajes = []

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
    mensajes.push(`Cationes divalentes totales (Ca²⁺ + Mg²⁺): ${divalentes.toFixed(1)} mEq/L. Riesgo de coalescencia lipídica (límite: 10 mEq/L).`)
  } else if (conLipidos) {
    mensajes.push(`Cationes divalentes (Ca²⁺ + Mg²⁺): ${divalentes.toFixed(1)} mEq/L — dentro del límite para emulsión lipídica.`)
  }

  return {
    nivel,
    caConc: caConc.toFixed(1),
    po4Conc: po4Conc.toFixed(1),
    mgConc: mgConc.toFixed(1),
    producto: Math.round(producto),
    mensajes,
  }
}

export default function CalculadoraNP() {
  const [form, setForm] = useState({
    peso: '', talla: '', edad: '', sexo: 'F',
    condicion: 'reposo', proteinaGKg: '',
    conLipidos: true, lipido: 'mixto', volumen: '',
    ca: '', po4: '', mg: '',
  })
  const [resultado, setResultado] = useState(null)

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))

  const condActual = CONDICIONES.find(c => c.id === form.condicion)

  const calcular = () => {
    const peso = parseFloat(form.peso)
    const talla = parseFloat(form.talla)
    const edad = parseFloat(form.edad)
    const vol = parseFloat(form.volumen)
    if (!peso || !talla || !edad || !vol) return

    const bee = calcBEE(peso, talla, edad, form.sexo)
    const ten = bee * condActual.factor
    const protGKg = parseFloat(form.proteinaGKg) || ((condActual.proteina[0] + condActual.proteina[1]) / 2)
    const protG = protGKg * peso
    const kcalProt = protG * 4
    const npc = ten - kcalProt
    const dextrosaKcal = npc * 0.65
    const lipidoKcal = form.conLipidos ? npc * 0.35 : 0
    const dextrosaG = dextrosaKcal / 3.4
    const lipidoG = lipidoKcal / 10
    const nitrogeno = protG / 6.25
    const npcN = npc / nitrogeno
    const osmolaridad = (dextrosaG / vol * 1000 * 5) + (protG / vol * 1000 * 10) + 300

    const caTotal = parseFloat(form.ca) || 0
    const po4Total = parseFloat(form.po4) || 0
    const mgTotal = parseFloat(form.mg) || 0
    const estabilidad = caTotal > 0 || po4Total > 0
      ? calcEstabilidad(caTotal, po4Total, mgTotal, vol, form.conLipidos)
      : null

    setResultado({
      bee: Math.round(bee), ten: Math.round(ten),
      protG: Math.round(protG), protGKg: protGKg.toFixed(2),
      dextrosaG: Math.round(dextrosaG), lipidoG: Math.round(lipidoG),
      nitrogeno: nitrogeno.toFixed(1), npcN: Math.round(npcN),
      volAA: Math.round(protG / 0.1),
      volDex: Math.round(dextrosaG / 0.5),
      volLipido: form.conLipidos ? Math.round(lipidoG / 0.2) : 0,
      osmolaridad: Math.round(osmolaridad),
      viaRecomendada: osmolaridad > 700 ? 'Central' : 'Periférica o Central',
      npcNEstado: npcN < 80 ? 'bajo' : npcN > 150 ? 'alto' : 'optimo',
      estabilidad,
      lipido: LIPIDOS.find(l => l.id === form.lipido),
    })
  }

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Datos del paciente */}
        <div className="space-y-4">
          <h3 className="font-bold text-teal-800 flex items-center gap-2">
            <span className="bg-teal-100 text-teal-600 text-xs font-bold px-2 py-0.5 rounded-md">1</span>
            Datos del Paciente
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Peso (kg)</label>
              <input type="number" value={form.peso} onChange={e => set('peso', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                placeholder="70" min="1" max="300" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Talla (cm)</label>
              <input type="number" value={form.talla} onChange={e => set('talla', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
                placeholder="165" min="50" max="250" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Edad (años)</label>
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

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Proteína (g/kg/día) — opcional</label>
            <input type="number" value={form.proteinaGKg} onChange={e => set('proteinaGKg', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
              placeholder={`${condActual?.proteina[0]}–${condActual?.proteina[1]} (dejar vacío = promedio)`}
              step="0.1" min="0.5" max="3" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">Volumen total de la mezcla (mL)</label>
            <input type="number" value={form.volumen} onChange={e => set('volumen', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
              placeholder="2000" min="500" max="5000" />
          </div>
        </div>

        {/* Lípidos y electrolitos */}
        <div className="space-y-4">
          <h3 className="font-bold text-teal-800 flex items-center gap-2">
            <span className="bg-teal-100 text-teal-600 text-xs font-bold px-2 py-0.5 rounded-md">2</span>
            Lípidos y Estabilidad
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
                Fuente lipídica
                <span className="ml-1 text-teal-500 text-xs">(origen biotecnológico)</span>
              </label>
              <select value={form.lipido} onChange={e => set('lipido', e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-teal-400 bg-white">
                {LIPIDOS.map(l => (
                  <option key={l.id} value={l.id}>{l.label}</option>
                ))}
              </select>
              {LIPIDOS.find(l => l.id === form.lipido)?.omega3 && (
                <div className="flex items-center gap-1.5 mt-1.5 text-xs text-teal-600">
                  <Dna size={12} />
                  Contiene omega-3 de origen biotecnológico (microalgas/aceite de pescado)
                </div>
              )}
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-slate-600 mb-2 flex items-center gap-1">
              <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-md">Semáforo</span>
              Electrolitos para análisis de estabilidad
            </p>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Ca²⁺ (mEq)</label>
                <input type="number" value={form.ca} onChange={e => set('ca', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-amber-400"
                  placeholder="10" min="0" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">PO₄³⁻ (mmol)</label>
                <input type="number" value={form.po4} onChange={e => set('po4', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-amber-400"
                  placeholder="20" min="0" />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Mg²⁺ (mEq)</label>
                <input type="number" value={form.mg} onChange={e => set('mg', e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:border-amber-400"
                  placeholder="8" min="0" />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Ingrese cantidades totales en la mezcla para activar el semáforo de estabilidad.
            </p>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button onClick={calcular}
          className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl transition-colors text-sm">
          Calcular NP
        </button>
        <button onClick={() => { setForm(p => ({ ...p, peso:'',talla:'',edad:'',volumen:'',ca:'',po4:'',mg:'',proteinaGKg:'' })); setResultado(null) }}
          className="border border-slate-200 text-slate-500 hover:text-slate-700 px-4 py-3 rounded-xl transition-colors">
          <RotateCcw size={17} />
        </button>
      </div>

      {/* Resultados */}
      {resultado && (
        <div className="space-y-4 border-t border-teal-100 pt-5">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-teal-800">Resultado del Cálculo</h3>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg">
              <Printer size={13} /> Imprimir
            </button>
          </div>

          {/* Energía */}
          <div className="bg-teal-50 rounded-xl p-4 grid grid-cols-2 md:grid-cols-4 gap-3 border border-teal-100">
            {[
              { label: 'Gasto Basal (Harris-B.)', value: resultado.bee, unit: 'kcal/día' },
              { label: 'Necesidad Total (TEN)', value: resultado.ten, unit: 'kcal/día', highlight: true },
              { label: 'Proteína', value: `${resultado.protG}g (${resultado.protGKg} g/kg/d)`, unit: '' },
              { label: 'Osmolaridad estimada', value: resultado.osmolaridad, unit: 'mOsm/L' },
            ].map((item, i) => (
              <div key={i} className={`bg-white rounded-lg p-3 text-center ${item.highlight ? 'ring-2 ring-teal-300' : ''}`}>
                <p className="text-xs text-slate-400 mb-1">{item.label}</p>
                <p className={`font-bold text-lg ${item.highlight ? 'text-teal-700' : 'text-slate-800'}`}>{item.value}</p>
                {item.unit && <p className="text-xs text-slate-400">{item.unit}</p>}
              </div>
            ))}
          </div>

          {/* Macronutrientes */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Dextrosa', g: resultado.dextrosaG, vol: resultado.volDex, conc: '50%', color: 'blue' },
              { label: 'Aminoácidos', g: resultado.protG, vol: resultado.volAA, conc: '10%', color: 'teal' },
              ...(form.conLipidos ? [{ label: resultado.lipido?.label?.split(' ')[0], g: resultado.lipidoG, vol: resultado.volLipido, conc: '20%', color: 'amber' }] : []),
            ].map((m, i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-xl p-3 text-center">
                <p className="text-xs text-slate-400 mb-1">{m.label}</p>
                <p className="font-bold text-slate-800">{m.g} g</p>
                <p className="text-xs text-slate-500">~{m.vol} mL sol. {m.conc}</p>
              </div>
            ))}
          </div>

          {/* NPC:N */}
          <div className={`flex items-start gap-3 p-3 rounded-xl border text-sm ${
            resultado.npcNEstado === 'optimo' ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'
          }`}>
            {resultado.npcNEstado === 'optimo'
              ? <CheckCircle size={18} className="text-emerald-500 flex-shrink-0 mt-0.5" />
              : <AlertCircle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            }
            <div>
              <span className="font-semibold">Relación NPC:N = {resultado.npcN}:1</span>
              <span className="text-slate-500 ml-2 text-xs">
                ({resultado.npcNEstado === 'optimo' ? 'Óptimo 80–150:1' : resultado.npcNEstado === 'bajo' ? 'Bajo: <80:1' : 'Alto: >150:1'})
              </span>
              <p className="text-slate-600 text-xs mt-0.5">Nitrógeno total: {resultado.nitrogeno} g/día</p>
            </div>
          </div>

          {/* Vía de administración */}
          <div className={`flex items-center gap-3 p-3 rounded-xl border text-sm ${
            resultado.osmolaridad > 700 ? 'bg-amber-50 border-amber-200' : 'bg-emerald-50 border-emerald-200'
          }`}>
            <Info size={18} className={resultado.osmolaridad > 700 ? 'text-amber-500' : 'text-emerald-500'} />
            <div>
              <span className="font-semibold">Vía recomendada: {resultado.viaRecomendada}</span>
              <p className="text-xs text-slate-500">
                {resultado.osmolaridad > 700
                  ? 'Osmolaridad >700 mOsm/L: requiere catéter venoso central.'
                  : 'Osmolaridad ≤700 mOsm/L: puede administrarse periféricamente, aunque se prefiere vía central.'}
              </p>
            </div>
          </div>

          {/* Semáforo biotecnológico */}
          {resultado.estabilidad && (
            <div className={`border rounded-xl p-4 ${SEMAFORO_BG[resultado.estabilidad.nivel]}`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 rounded-full semaforo-pulse ${resultado.estabilidad.nivel === 'rojo' ? 'bg-red-500' : resultado.estabilidad.nivel === 'amarillo' ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                <SemaforoIcon nivel={resultado.estabilidad.nivel} />
                <span className={`font-bold text-sm ${SEMAFORO_TEXT[resultado.estabilidad.nivel]}`}>
                  Semáforo de Estabilidad Biotecnológica
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                <div className="bg-white/60 rounded-lg p-2 text-center">
                  <p className="text-slate-400">Ca²⁺ final</p>
                  <p className={`font-bold ${SEMAFORO_TEXT[resultado.estabilidad.nivel]}`}>{resultado.estabilidad.caConc} mEq/L</p>
                </div>
                <div className="bg-white/60 rounded-lg p-2 text-center">
                  <p className="text-slate-400">PO₄³⁻ final</p>
                  <p className={`font-bold ${SEMAFORO_TEXT[resultado.estabilidad.nivel]}`}>{resultado.estabilidad.po4Conc} mmol/L</p>
                </div>
                <div className="bg-white/60 rounded-lg p-2 text-center">
                  <p className="text-slate-400">Ca × PO₄</p>
                  <p className={`font-bold ${SEMAFORO_TEXT[resultado.estabilidad.nivel]}`}>{resultado.estabilidad.producto}</p>
                </div>
              </div>
              {resultado.estabilidad.mensajes.map((m, i) => (
                <p key={i} className={`text-xs ${SEMAFORO_TEXT[resultado.estabilidad.nivel]}`}>• {m}</p>
              ))}
            </div>
          )}

          {/* Insight biotecnológico */}
          {resultado.lipido?.omega3 && (
            <div className="bg-teal-700 text-white rounded-xl p-4 flex gap-3">
              <Dna size={20} className="flex-shrink-0 text-teal-300 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold text-sm mb-1">Insight Biotecnológico</p>
                <p className="text-teal-100">
                  Los ácidos grasos omega-3 de esta formulación provienen de aceite de pescado o de microalgas marinas cultivadas mediante fermentación biotecnológica. Reducen la producción de fitoesteroles hepatotóxicos asociados a la enfermedad hepática en NP larga duración (IFALD).
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-500 leading-relaxed">
        <p className="font-bold text-slate-700 mb-1">Alcance del cálculo</p>
        <p>
          Estimaciones basadas en Harris-Benedict, factores de estrés, relación kcal no proteicas:nitrógeno,
          osmolaridad aproximada y reglas iniciales de estabilidad Ca-PO4. Deben validarse con el equipo de soporte nutricional,
          farmacia clínica y lineamientos institucionales vigentes antes de preparar o administrar una mezcla.
        </p>
      </div>
    </div>
  )
}
