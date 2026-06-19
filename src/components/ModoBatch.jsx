import { AlertCircle, AlertTriangle, Baby, CheckCircle, Download, Info, Plus, RotateCcw, Scale, Trash2, Users } from 'lucide-react'
import { useState, useRef } from 'react'

// ── Perfiles clínicos con rangos ESPEN/KDOQI/ASPEN ──────────────────────────
const PERFILES_BATCH = [
  // ── Adulto — General ────────────────────────────────────────────────────────
  { id: 'estandar',              label: 'Estándar / General',          grupo: 'adulto', sub: 'General',       kcal: [20, 25], prot: [1.0, 1.2] },
  // ── Adulto — UCI / Agudo (ESPEN ICU 2021 · ASPEN Critical Care) ─────────────
  { id: 'postop_menor',          label: 'Posoperatorio menor',         grupo: 'adulto', sub: 'UCI / Agudo',   kcal: [20, 25], prot: [1.2, 1.5] },
  { id: 'trauma_moderado',       label: 'Infección / Trauma moderado', grupo: 'adulto', sub: 'UCI / Agudo',   kcal: [22, 28], prot: [1.5, 1.8] },
  { id: 'cirugia_mayor',         label: 'Cirugía mayor / UCI quirúrg.',grupo: 'adulto', sub: 'UCI / Agudo',   kcal: [25, 30], prot: [1.5, 2.0] },
  { id: 'sepsis',                label: 'Sepsis / Trauma severo',      grupo: 'adulto', sub: 'UCI / Agudo',   kcal: [25, 30], prot: [1.5, 2.0] },
  { id: 'quemaduras',            label: 'Quemaduras (>40% SCT)',       grupo: 'adulto', sub: 'UCI / Agudo',   kcal: [30, 35], prot: [1.5, 2.5] },
  // ── Adulto — Renal (KDOQI 2020 · ESPEN Renal 2024) ─────────────────────────
  { id: 'renal_prediálisis',     label: 'Renal — Pre-diálisis',        grupo: 'adulto', sub: 'Renal',         kcal: [30, 35], prot: [0.60, 0.75] },
  { id: 'renal_hd',              label: 'Renal — HD crónica',          grupo: 'adulto', sub: 'Renal',         kcal: [30, 35], prot: [1.2,  1.2]  },
  { id: 'renal_dp',              label: 'Renal — Diálisis peritoneal', grupo: 'adulto', sub: 'Renal',         kcal: [30, 35], prot: [1.2,  1.3]  },
  { id: 'renal_trrc',            label: 'Renal — TRRC (UCI)',          grupo: 'adulto', sub: 'Renal',         kcal: [25, 35], prot: [1.5,  2.5]  },
  // ── Adulto — Hepático (ESPEN Liver 2022) ────────────────────────────────────
  { id: 'hepatico_compensado',   label: 'Hepático — Compensado',       grupo: 'adulto', sub: 'Hepático',      kcal: [30, 35], prot: [1.2, 1.5] },
  { id: 'hepatico_descompensado',label: 'Hepático — Descompensado',    grupo: 'adulto', sub: 'Hepático',      kcal: [35, 40], prot: [1.2, 1.5] },
  // ── Adulto — Oncológico (ESPEN Cancer 2021) ──────────────────────────────────
  { id: 'oncologico',            label: 'Oncológico / Caquexia tumoral',grupo:'adulto', sub: 'Oncológico',    kcal: [20, 25], prot: [1.0, 1.5] },
  // ── Pediátrico / Neonatal — Manual CCSS HNN 2018 · ASPEN Pediatric ──────────
  { id: 'neonato_prematuro',     label: 'Neonatal — Prematuro',        grupo: 'pediatrico', sub: 'Neonatal',  kcal: [110, 150], prot: [3.5, 4.0], tigMax: 12, tigInicio: [4, 6] },
  { id: 'neonato_termino',       label: 'Neonatal — Término (0–1 a)',  grupo: 'pediatrico', sub: 'Neonatal',  kcal: [90,  100], prot: [2.5, 3.5], tigMax: 12, tigInicio: [6, 8] },
  { id: 'pediatrico_infante',    label: 'Pediátrico — Infante (1–7 a)',grupo: 'pediatrico', sub: 'Pediátrico',kcal: [75,   90], prot: [1.5, 2.0], tigMax: 12, tigInicio: [6, 8] },
  { id: 'pediatrico_escolar',    label: 'Pediátrico — Escolar (7–12 a)',grupo:'pediatrico', sub: 'Pediátrico',kcal: [60,   75], prot: [1.5, 2.0], tigMax: 10, tigInicio: [5, 7] },
  { id: 'pediatrico_adolescente',label: 'Pediátrico — Adolescente (12–18 a)',grupo:'pediatrico',sub:'Pediátrico',kcal:[35,50],prot:[1.0,1.5],tigMax:7,tigInicio:[4,6] },
]

// Subgrupos para el dropdown organizado
const SUBGRUPOS_ADULTO = ['General', 'UCI / Agudo', 'Renal', 'Hepático', 'Oncológico']

// ── Utilidades de cálculo ────────────────────────────────────────────────────
function calcPesoIdeal(talla, sexo) {
  if (!talla) return null
  return sexo === 'M' ? talla - 100 : talla - 105
}

function estimarOsm(dextrosaG, protG, vol) {
  if (!vol) return 0
  return Math.round((dextrosaG / vol * 1000 * 5.55) + (protG / vol * 1000 * 8.0))
}

function getViaZone(osm) {
  if (osm > 1800) return { label: 'ALERTA crítica',         badge: 'bg-red-200 text-red-900' }
  if (osm > 900)  return { label: 'Central exclusiva',      badge: 'bg-red-100 text-red-800' }
  if (osm > 800)  return { label: 'Central recomendada',    badge: 'bg-orange-100 text-orange-800' }
  if (osm > 700)  return { label: 'Periférica c/ cautela',  badge: 'bg-amber-100 text-amber-800' }
  return             { label: 'Periférica segura <700',      badge: 'bg-emerald-100 text-emerald-800' }
}

function calcPaciente(p) {
  const peso   = parseFloat(p.peso)
  const talla  = parseFloat(p.talla)  || 0
  const vol    = parseFloat(p.volumen) || 2000
  const sexo   = p.sexo || 'M'
  const perfil = PERFILES_BATCH.find(x => x.id === p.perfil) || PERFILES_BATCH[0]

  if (!peso || peso <= 0) return null

  // ── IMC y peso de cálculo ────────────────────────────────────────────────
  const imc = talla > 0 ? parseFloat((peso / ((talla / 100) ** 2)).toFixed(1)) : null
  const esObeso = imc !== null && imc >= 30
  const pesoIdeal = talla > 0 ? calcPesoIdeal(talla, sexo) : null
  const pesoAjustado = (esObeso && pesoIdeal && peso > pesoIdeal)
    ? parseFloat((pesoIdeal + 0.25 * (peso - pesoIdeal)).toFixed(1))
    : null

  // Usar peso ajustado en adultos obesos; peso actual en pediátrico/neonatal
  const esPediatrico = perfil.grupo === 'pediatrico'
  const pesoCal = (!esPediatrico && pesoAjustado) ? pesoAjustado : peso
  const pesoCalDesc = (!esPediatrico && pesoAjustado) ? `ajustado ${pesoAjustado} kg` : 'actual'

  // ── NPS — aporte previo oral/enteral/propofol ────────────────────────────
  const tipNP          = p.tipNP || 'total'
  const esParcial      = tipNP === 'parcial'
  const aporteOralKcal = esParcial ? (parseFloat(p.aporteOralKcal) || 0) : 0
  const propofolKcal   = esParcial ? (parseFloat(p.propofolML) || 0) * 1.1 : 0
  const aporteKcalPrev = aporteOralKcal + propofolKcal

  // ── Energía y macros ─────────────────────────────────────────────────────
  const kcalKg    = (perfil.kcal[0] + perfil.kcal[1]) / 2
  const protKg    = (perfil.prot[0] + perfil.prot[1]) / 2
  const tenTotal  = Math.round(kcalKg * pesoCal)
  // NP solo cubre el déficit en modo parcial
  const ten       = esParcial ? Math.max(0, tenTotal - aporteKcalPrev) : tenTotal
  const coberturaKcalPct = tenTotal > 0 ? Math.round((aporteKcalPrev / tenTotal) * 100) : 0
  const npsStatus = coberturaKcalPct >= 80 ? 'retirar' : coberturaKcalPct >= 66 ? 'opcional' : 'indicada'

  const protG     = Math.round(protKg * pesoCal)
  const kcalProt  = protG * 4
  const npc       = ten - kcalProt
  const dextrosaG = Math.max(0, Math.round((npc * 0.65) / 3.4))
  const lipidoG   = Math.max(0, Math.round((npc * 0.35) / 10))
  const osm       = estimarOsm(dextrosaG, protG, vol)
  const via       = getViaZone(osm)

  const volAA  = Math.round(protG     / 0.1)
  const volDex = Math.round(dextrosaG / 0.5)
  const volLip = Math.round(lipidoG   / 0.2)

  // ── TIG — solo perfiles pediátricos/neonatales ───────────────────────────
  let tigVal = null, tigAlerta = false
  if (perfil.tigMax) {
    tigVal = parseFloat(((dextrosaG * 1000) / (pesoCal * 1440)).toFixed(2))
    tigAlerta = tigVal > perfil.tigMax
  }

  // ── Alertas clínicas ─────────────────────────────────────────────────────
  const alerts = []
  if (p.acceso === 'periferica' && osm > 800)
    alerts.push(`Osmolaridad ${osm} mOsm/L incompatible con acceso periférico`)
  if (osm > 1800)
    alerts.push('Osmolaridad extrema — revisar dilución urgente')
  if (perfil.id.startsWith('renal') && !p.pesoSeco)
    alerts.push('Perfil renal: verificar que el peso sea el peso seco')
  if (esObeso && !pesoAjustado)
    alerts.push('IMC ≥ 30 pero falta talla para calcular peso ajustado — ingrese talla')
  if (tigAlerta)
    alerts.push(`TIG ${tigVal} mg/kg/min supera límite ${perfil.tigMax} mg/kg/min — reducir dextrosa`)
  if (perfil.id === 'renal_dp' && (dextrosaG / pesoCal) > 3.5)
    alerts.push('Sobrecarga glucídica >3.5 g/kg/día en paciente con DP')

  return {
    ten, tenTotal, protG, protKg: protKg.toFixed(2), kcalKg: kcalKg.toFixed(0),
    dextrosaG, lipidoG, osm, via, volAA, volDex, volLip,
    imc, esObeso, pesoIdeal, pesoAjustado, pesoCal: parseFloat(pesoCal.toFixed(1)), pesoCalDesc,
    tigVal, tigAlerta, tigMax: perfil.tigMax ?? null, esPediatrico,
    esParcial, tipNP, aporteKcalPrev: Math.round(aporteKcalPrev), coberturaKcalPct, npsStatus,
    alerts,
  }
}

// ── Estado vacío por paciente ────────────────────────────────────────────────
const PACIENTE_VACIO = {
  id: '', peso: '', talla: '', sexo: 'M',
  perfil: 'estandar', volumen: '2000',
  acceso: 'central', pesoSeco: false,
  tipNP: 'total',         // 'total' | 'parcial'
  aporteOralKcal: '',     // kcal orales/enterales/día (solo NPS)
  propofolML: '',         // mL propofol/día — 1.1 kcal/mL (solo NPS)
}

function nuevoId(n) { return `P${n}` }

export default function ModoBatch() {
  const nextIdRef = useRef(2)
  const [pacientes, setPacientes] = useState([
    { ...PACIENTE_VACIO, id: nuevoId(1) },
  ])
  const [resultados, setResultados] = useState(null)
  const [error, setError]           = useState('')

  const agregarFila = () => {
    const id = nuevoId(nextIdRef.current++)
    setPacientes(prev => [...prev, { ...PACIENTE_VACIO, id }])
    setResultados(null)
  }

  const eliminarFila = (idx) => {
    setPacientes(prev => prev.filter((_, i) => i !== idx))
    setResultados(null)
  }

  const actualizarFila = (idx, campo, valor) => {
    setPacientes(prev => prev.map((row, i) => i === idx ? { ...row, [campo]: valor } : row))
    setResultados(null)
  }

  const calcularLote = () => {
    const sinPeso = pacientes.filter(p => !parseFloat(p.peso))
    if (sinPeso.length > 0) {
      setError('Complete el peso de todos los pacientes antes de calcular.')
      return
    }
    setError('')
    setResultados(pacientes.map(p => ({ ...p, calc: calcPaciente(p) })))
  }

  const exportarCSV = () => {
    if (!resultados) return
    const cab = 'ID,Perfil,Peso real (kg),Talla (cm),Sexo,IMC,Peso cálculo (kg),Tipo peso,Vol (mL),Tipo NP,Aporte previo (kcal),Req total (kcal),Energía NP (kcal),Cobertura %,Proteína (g/d),Prot (g/kg/d),Dex 50% (mL),AA 10% (mL),Lip 20% (mL),Osm (mOsm/L),Vía,TIG (mg/kg/min),Alertas'
    const filas = resultados.map(r => {
      const c = r.calc
      if (!c) return `${r.id},—,${r.peso},${r.talla},${r.sexo},—,—,—,${r.volumen},—,—,—,—,—,error,error,error,error,error,error,error,—,—`
      return [
        r.id,
        PERFILES_BATCH.find(p => p.id === r.perfil)?.label ?? r.perfil,
        r.peso, r.talla || '—', r.sexo,
        c.imc ?? '—',
        c.pesoCal, c.pesoCalDesc,
        r.volumen,
        c.tipNP === 'parcial' ? 'NPS' : 'NPT',
        c.esParcial ? c.aporteKcalPrev : '—',
        c.tenTotal,
        c.ten,
        c.esParcial ? `${c.coberturaKcalPct}%` : '100%',
        c.protG, c.protKg,
        c.volDex, c.volAA, c.volLip,
        c.osm, c.via.label,
        c.tigVal ?? '—',
        c.alerts.join(' | '),
      ].join(',')
    })
    const blob = new Blob([[cab, ...filas].join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `nutrivida-batch-${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
  }

  const totalInsumos = resultados ? resultados.reduce((acc, r) => {
    if (!r.calc) return acc
    return {
      aaG:    acc.aaG    + r.calc.protG,
      dexG:   acc.dexG   + r.calc.dextrosaG,
      lipG:   acc.lipG   + r.calc.lipidoG,
      volAA:  acc.volAA  + r.calc.volAA,
      volDex: acc.volDex + r.calc.volDex,
      volLip: acc.volLip + r.calc.volLip,
      alertas: acc.alertas + r.calc.alerts.length,
    }
  }, { aaG: 0, dexG: 0, lipG: 0, volAA: 0, volDex: 0, volLip: 0, alertas: 0 }) : null

  const inputCls = 'border border-slate-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:border-teal-400 bg-white w-full'

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start gap-3 bg-teal-50 border border-teal-200 rounded-2xl p-4">
        <Users size={20} className="text-teal-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="font-bold text-teal-800 text-sm">Modo Farmacéutico — Cálculo en Lote</p>
          <p className="text-xs text-teal-700 mt-1">
            Procesa múltiples pacientes — adultos, pediátricos y neonatales. Talla y sexo activan
            ajuste automático de peso en obesidad (IMC ≥ 30). TIG calculado para perfiles pediátricos.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
        <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
        <p>Cálculos basados en promedios de rangos ESPEN/KDOQI/ASPEN y Manual CCSS HNN. Cada prescripción
          debe ser validada individualmente. Osmolaridad estimada sin electrolitos individuales.</p>
      </div>

      {/* Tabla de entrada */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse min-w-[860px]">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th className="text-left px-2 py-2 rounded-tl-xl font-semibold">ID</th>
              <th className="text-left px-2 py-2 font-semibold">Peso (kg)</th>
              <th className="text-left px-2 py-2 font-semibold"><span className="flex items-center gap-1"><Scale size={11} className="text-teal-500" />Talla (cm)</span></th>
              <th className="text-left px-2 py-2 font-semibold">Sexo</th>
              <th className="text-left px-2 py-2 font-semibold">Perfil clínico</th>
              <th className="text-left px-2 py-2 font-semibold">Vol (mL)</th>
              <th className="text-left px-2 py-2 font-semibold">Acceso</th>
              <th className="text-left px-2 py-2 font-semibold">Tipo NP</th>
              <th className="text-left px-2 py-2 font-semibold">Oral/Prop (kcal)</th>
              <th className="text-left px-2 py-2 rounded-tr-xl font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((p, idx) => {
              const perfil = PERFILES_BATCH.find(x => x.id === p.perfil)
              const esPed = perfil?.grupo === 'pediatrico'
              const esNPS = p.tipNP === 'parcial'
              return (
                <tr key={p.id} className={`border-b border-slate-100 hover:bg-slate-50 ${esPed ? 'bg-pink-50/40' : ''}`}>
                  <td className="px-2 py-1.5">
                    <input type="text" value={p.id} autoComplete="off"
                      onChange={e => actualizarFila(idx, 'id', e.target.value)}
                      className={inputCls} placeholder={`Pac-${idx + 1}`} />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="number" value={p.peso} autoComplete="off"
                      onChange={e => actualizarFila(idx, 'peso', e.target.value)}
                      className={inputCls} placeholder={esPed ? '3.2' : '70'} min="0.3" max="300" step="0.1" />
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="number" value={p.talla} autoComplete="off"
                      onChange={e => actualizarFila(idx, 'talla', e.target.value)}
                      className={inputCls} placeholder={esPed ? '50' : '165'} min="30" max="250" />
                  </td>
                  <td className="px-2 py-1.5">
                    <select value={p.sexo} autoComplete="off"
                      onChange={e => actualizarFila(idx, 'sexo', e.target.value)} className={inputCls}>
                      <option value="M">M</option>
                      <option value="F">F</option>
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <select value={p.perfil} autoComplete="off"
                      onChange={e => actualizarFila(idx, 'perfil', e.target.value)} className={inputCls}>
                      {SUBGRUPOS_ADULTO.map(sub => (
                        <optgroup key={sub} label={`Adulto — ${sub}`}>
                          {PERFILES_BATCH.filter(pf => pf.grupo === 'adulto' && pf.sub === sub).map(pf => (
                            <option key={pf.id} value={pf.id}>{pf.label}</option>
                          ))}
                        </optgroup>
                      ))}
                      <optgroup label="Pediátrico / Neonatal">
                        {PERFILES_BATCH.filter(pf => pf.grupo === 'pediatrico').map(pf => (
                          <option key={pf.id} value={pf.id}>{pf.label}</option>
                        ))}
                      </optgroup>
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <input type="number" value={p.volumen} autoComplete="off"
                      onChange={e => actualizarFila(idx, 'volumen', e.target.value)}
                      className={inputCls} placeholder="2000" min="50" max="3000" />
                  </td>
                  <td className="px-2 py-1.5">
                    <select value={p.acceso} autoComplete="off"
                      onChange={e => actualizarFila(idx, 'acceso', e.target.value)} className={inputCls}>
                      <option value="central">Central</option>
                      <option value="periferica">Periférica</option>
                    </select>
                  </td>
                  {/* Tipo NP — NPT o NPS */}
                  <td className="px-2 py-1.5">
                    <select value={p.tipNP} autoComplete="off"
                      onChange={e => actualizarFila(idx, 'tipNP', e.target.value)}
                      className={`${inputCls} ${esNPS ? 'border-indigo-400 bg-indigo-50 font-semibold text-indigo-700' : ''}`}>
                      <option value="total">NPT</option>
                      <option value="parcial">NPS</option>
                    </select>
                  </td>
                  {/* Aporte oral/propofol — solo activo en NPS */}
                  <td className="px-2 py-1.5">
                    <input type="number" value={p.aporteOralKcal} autoComplete="off"
                      onChange={e => actualizarFila(idx, 'aporteOralKcal', e.target.value)}
                      className={`${inputCls} ${!esNPS ? 'opacity-30 cursor-not-allowed' : 'border-indigo-300'}`}
                      placeholder="kcal" min="0" disabled={!esNPS} />
                    {esNPS && (
                      <input type="number" value={p.propofolML} autoComplete="off"
                        onChange={e => actualizarFila(idx, 'propofolML', e.target.value)}
                        className={`${inputCls} mt-0.5 border-indigo-300`}
                        placeholder="prop. mL" min="0" />
                    )}
                  </td>
                  <td className="px-2 py-1.5">
                    <button onClick={() => eliminarFila(idx)}
                      disabled={pacientes.length === 1}
                      className="text-slate-300 hover:text-red-500 transition-colors disabled:cursor-not-allowed">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-[10px] text-slate-400 flex items-center gap-1">
        <Scale size={10} className="text-teal-400" />
        Talla + Sexo activan IMC automático y peso ajustado (obesidad). Filas rosadas = perfil pediátrico/neonatal.
      </p>

      {/* Controles */}
      <div className="flex gap-3 flex-wrap">
        <button onClick={agregarFila}
          className="flex items-center gap-1.5 text-sm text-teal-700 border border-teal-300 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-xl transition-colors">
          <Plus size={15} /> Agregar paciente
        </button>
        <button onClick={calcularLote}
          className="flex-1 min-w-[180px] bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-sm">
          Calcular lote ({pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''})
        </button>
        {resultados && (
          <>
            <button onClick={exportarCSV}
              className="flex items-center gap-1.5 text-sm text-teal-600 border border-teal-200 px-3 py-2 rounded-xl hover:bg-teal-50 transition-colors font-medium">
              <Download size={14} /> Exportar CSV
            </button>
            <button onClick={() => {
              const id = nuevoId(nextIdRef.current++)
              setResultados(null)
              setPacientes([{ ...PACIENTE_VACIO, id }])
            }} className="text-slate-400 hover:text-slate-600 px-3 py-2 rounded-xl border border-slate-200 transition-colors">
              <RotateCcw size={15} />
            </button>
          </>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
          <AlertCircle size={14} className="flex-shrink-0" /> {error}
        </div>
      )}

      {/* Resultados */}
      {resultados && (
        <div className="space-y-4">

          {/* Resumen insumos */}
          {totalInsumos && (
            <div className="bg-teal-700 text-white rounded-2xl p-5">
              <p className="font-bold text-sm mb-3 flex items-center gap-2">
                <Info size={15} className="text-teal-300" />
                Resumen de Insumos — Central de Mezclas
                <span className="text-teal-300 font-normal text-xs ml-auto">
                  {resultados.length} paciente{resultados.length !== 1 ? 's' : ''} · {new Date().toLocaleDateString('es-CR')}
                </span>
              </p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: 'AA (g)',       value: totalInsumos.aaG   },
                  { label: 'Dextrosa (g)', value: totalInsumos.dexG  },
                  { label: 'Lípidos (g)',  value: totalInsumos.lipG  },
                  { label: 'AA 10% (mL)',  value: totalInsumos.volAA  },
                  { label: 'Dex 50% (mL)',  value: totalInsumos.volDex },
                  { label: 'Lip 20% (mL)',  value: totalInsumos.volLip },
                ].map((s, i) => (
                  <div key={i} className="bg-teal-600 rounded-xl p-3 text-center">
                    <p className="text-teal-200 text-[10px] mb-1">{s.label}</p>
                    <p className="font-bold text-lg">{s.value.toLocaleString()}</p>
                  </div>
                ))}
              </div>
              {totalInsumos.alertas > 0 && (
                <div className="mt-3 flex items-center gap-2 bg-red-500/30 rounded-xl px-3 py-2 text-sm">
                  <AlertTriangle size={15} className="text-red-200" />
                  <span className="text-red-100 font-semibold">
                    {totalInsumos.alertas} alerta{totalInsumos.alertas !== 1 ? 's' : ''} clínica{totalInsumos.alertas !== 1 ? 's' : ''} — revisar filas marcadas
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Tabla resultados */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse min-w-[1050px]">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <th className="text-left px-2 py-2 rounded-tl-xl font-semibold">ID</th>
                  <th className="text-left px-2 py-2 font-semibold">Perfil</th>
                  <th className="text-center px-2 py-2 font-semibold">Tipo NP</th>
                  <th className="text-right px-2 py-2 font-semibold">IMC</th>
                  <th className="text-right px-2 py-2 font-semibold">Peso cal.</th>
                  <th className="text-right px-2 py-2 font-semibold">Energía NP</th>
                  <th className="text-right px-2 py-2 font-semibold">Cobertura</th>
                  <th className="text-right px-2 py-2 font-semibold">Proteína</th>
                  <th className="text-right px-2 py-2 font-semibold">Dex 50%</th>
                  <th className="text-right px-2 py-2 font-semibold">AA 10%</th>
                  <th className="text-right px-2 py-2 font-semibold">Lip 20%</th>
                  <th className="text-right px-2 py-2 font-semibold">Osm.</th>
                  <th className="text-left px-2 py-2 font-semibold">Vía</th>
                  <th className="text-left px-2 py-2 rounded-tr-xl font-semibold">Alertas / TIG</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((r, i) => {
                  const c = r.calc
                  const hasAlerts = c?.alerts?.length > 0
                  return (
                    <tr key={r.id} className={`border-b border-slate-100 ${
                      hasAlerts ? 'bg-red-50' : c?.esPediatrico ? 'bg-pink-50/40' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                    }`}>
                      <td className="px-2 py-2 font-semibold text-slate-700">{r.id || `Pac-${i + 1}`}</td>
                      <td className="px-2 py-2 text-slate-500">
                        <span className="flex items-center gap-1">
                          {c?.esPediatrico && <Baby size={10} className="text-pink-400 flex-shrink-0" />}
                          {PERFILES_BATCH.find(p => p.id === r.perfil)?.label}
                        </span>
                      </td>
                      {!c ? (
                        <td colSpan={12} className="px-2 py-2 text-red-500">Error — verificar datos</td>
                      ) : (
                        <>
                          {/* Tipo NP — NPT / NPS */}
                          <td className="px-2 py-2 text-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              c.esParcial ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'
                            }`}>{c.esParcial ? 'NPS' : 'NPT'}</span>
                          </td>
                          {/* IMC */}
                          <td className="px-2 py-2 text-right">
                            {c.imc != null ? (
                              <span className={`font-semibold ${c.esObeso ? 'text-amber-700' : 'text-slate-600'}`}>
                                {c.imc}
                                {c.esObeso && <span className="text-[9px] ml-0.5">▲</span>}
                              </span>
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                          {/* Peso de cálculo */}
                          <td className="px-2 py-2 text-right">
                            <span className={`font-medium ${c.esObeso && c.pesoAjustado ? 'text-amber-700' : 'text-slate-700'}`}>
                              {c.pesoCal} kg
                            </span>
                            {c.esObeso && c.pesoAjustado && (
                              <p className="text-[9px] text-amber-500">ajustado</p>
                            )}
                          </td>
                          {/* Energía NP (déficit en NPS) */}
                          <td className="px-2 py-2 text-right">
                            <span className="font-medium text-slate-700">{c.ten} kcal</span>
                            {c.esParcial && (
                              <p className="text-[9px] text-indigo-500">req {c.tenTotal} kcal</p>
                            )}
                          </td>
                          {/* Cobertura previa (solo NPS) */}
                          <td className="px-2 py-2 text-right">
                            {c.esParcial ? (
                              <span className={`text-[10px] font-bold px-1 py-0.5 rounded ${
                                c.coberturaKcalPct >= 80 ? 'bg-green-100 text-green-700'
                                : c.coberturaKcalPct >= 66 ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                              }`}>{c.coberturaKcalPct}%</span>
                            ) : <span className="text-slate-300">—</span>}
                          </td>
                          <td className="px-2 py-2 text-right">
                            <span className="font-medium text-slate-700">{c.protG} g</span>
                            <span className="text-slate-400 ml-1">({c.protKg}/kg)</span>
                          </td>
                          <td className="px-2 py-2 text-right text-slate-600">{c.volDex} mL</td>
                          <td className="px-2 py-2 text-right text-slate-600">{c.volAA} mL</td>
                          <td className="px-2 py-2 text-right text-slate-600">{c.volLip} mL</td>
                          <td className="px-2 py-2 text-right font-mono font-semibold text-slate-700">{c.osm}</td>
                          <td className="px-2 py-2">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${c.via.badge}`}>
                              {c.via.label}
                            </span>
                          </td>
                          {/* Alertas y TIG */}
                          <td className="px-2 py-2">
                            {c.tigVal !== null && (
                              <div className={`flex items-center gap-1 mb-1 text-[10px] font-semibold ${c.tigAlerta ? 'text-red-700' : 'text-emerald-700'}`}>
                                <Baby size={10} />
                                TIG {c.tigVal} / máx {c.tigMax} mg/kg/min
                              </div>
                            )}
                            {c.alerts.length === 0 ? (
                              <CheckCircle size={13} className="text-emerald-500" />
                            ) : (
                              <div className="space-y-0.5">
                                {c.alerts.map((a, ai) => (
                                  <div key={ai} className="flex items-start gap-1 text-[10px] text-red-700">
                                    <AlertTriangle size={10} className="flex-shrink-0 mt-0.5" />{a}
                                  </div>
                                ))}
                              </div>
                            )}
                          </td>
                        </>
                      )}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <p className="text-[10px] text-slate-400 leading-relaxed">
            Energía NP = requerimiento total − aporte previo oral/enteral/propofol (NPS) · Macros: 65/35 NPC.
            Cobertura NPS: &lt;66% indicada · 66-80% apropiada · ≥80% evaluar retiro (Protocolo CCSS 2020).
            Peso ajustado si IMC ≥ 30 (PI + 0.25 × [PA − PI], ASPEN 2016) · TIG en perfiles pediátricos (CCSS HNN 2018).
            <span className="font-semibold text-red-600 ml-1">Requiere validación farmacéutica individual.</span>
          </p>
        </div>
      )}
    </div>
  )
}
