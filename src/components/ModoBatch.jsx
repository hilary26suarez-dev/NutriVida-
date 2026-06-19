import { AlertCircle, AlertTriangle, CheckCircle, Download, Info, Plus, RotateCcw, Trash2, Users } from 'lucide-react'
import { useState, useRef } from 'react'

const PERFILES_BATCH = [
  { id: 'estandar',             label: 'Estándar',          kcal: [20, 25], prot: [1.0, 1.5] },
  { id: 'renal_prediálisis',    label: 'Renal pre-HD',      kcal: [30, 35], prot: [0.60, 0.75] },
  { id: 'renal_hd',             label: 'Renal HD',          kcal: [30, 35], prot: [1.2, 1.2] },
  { id: 'renal_dp',             label: 'Renal DP',          kcal: [30, 35], prot: [1.2, 1.3] },
  { id: 'renal_trrc',           label: 'Renal TRRC',        kcal: [25, 35], prot: [1.5, 2.5] },
  { id: 'hepatico_compensado',  label: 'Hepático comp.',    kcal: [30, 35], prot: [1.2, 1.5] },
  { id: 'hepatico_descomp',     label: 'Hepático descomp.', kcal: [35, 40], prot: [1.2, 1.5] },
  { id: 'oncologico',           label: 'Oncológico',        kcal: [20, 25], prot: [1.0, 1.5] },
]

// Osmolarity (Pereira Da Silva — simplified for batch without electrolytes)
function estimarOsm(dextrosaG, protG, vol) {
  if (!vol) return 0
  return Math.round((dextrosaG / vol * 1000 * 5.55) + (protG / vol * 1000 * 8.0))
}

function getViaZone(osm) {
  if (osm > 1800) return { label: 'ALERTA crítica',          color: 'red',     badge: 'bg-red-200 text-red-900' }
  if (osm > 900)  return { label: 'Central exclusiva',       color: 'red',     badge: 'bg-red-100 text-red-800' }
  if (osm > 800)  return { label: 'Central recomendada',     color: 'orange',  badge: 'bg-orange-100 text-orange-800' }
  if (osm > 600)  return { label: 'Periférica c/ cautela',  color: 'amber',   badge: 'bg-amber-100 text-amber-800' }
  return             { label: 'Periférica segura',           color: 'emerald', badge: 'bg-emerald-100 text-emerald-800' }
}

function calcPaciente(p) {
  const peso   = parseFloat(p.peso)
  const vol    = parseFloat(p.volumen) || 2000
  const perfil = PERFILES_BATCH.find(x => x.id === p.perfil) || PERFILES_BATCH[0]

  if (!peso || peso <= 0) return null

  const kcalKg   = (perfil.kcal[0] + perfil.kcal[1]) / 2
  const protKg   = (perfil.prot[0] + perfil.prot[1]) / 2
  const ten      = Math.round(kcalKg * peso)
  const protG    = Math.round(protKg * peso)
  const kcalProt = protG * 4
  const npc      = ten - kcalProt
  const dextrosaG = Math.max(0, Math.round((npc * 0.65) / 3.4))
  const lipidoG   = Math.max(0, Math.round((npc * 0.35) / 10))
  const osm       = estimarOsm(dextrosaG, protG, vol)
  const via       = getViaZone(osm)

  const volAA   = Math.round(protG    / 0.1)
  const volDex  = Math.round(dextrosaG / 0.5)
  const volLip  = Math.round(lipidoG  / 0.2)

  const alerts = []
  if (p.acceso === 'periferica' && osm > 800)
    alerts.push(`Osmolaridad ${osm} mOsm/L incompatible con acceso periférico declarado`)
  if (perfil.id.startsWith('renal') && !p.pesoSeco)
    alerts.push('Perfil renal: se recomienda verificar que el peso ingresado sea el peso seco')
  if (osm > 1800)
    alerts.push('Osmolaridad extrema — revisar dilución volumétrica urgente')

  return { ten, protG, protKg: protKg.toFixed(2), kcalKg: kcalKg.toFixed(0), dextrosaG, lipidoG, osm, via, volAA, volDex, volLip, alerts }
}

const PACIENTE_VACIO = {
  id: '', peso: '', perfil: 'estandar', volumen: '2000',
  acceso: 'central', pesoSeco: false,
}

function nuevoId(n) { return `P${n}` }

export default function ModoBatch() {
  const nextIdRef = useRef(2) // 1 ya fue usado en el estado inicial
  const [pacientes, setPacientes] = useState([
    { ...PACIENTE_VACIO, id: nuevoId(1) },
  ])
  const [resultados, setResultados] = useState(null)
  const [error, setError] = useState('')

  const agregarFila = () => {
    // ID calculado ANTES del updater para evitar efectos secundarios dentro de setState
    const id = nuevoId(nextIdRef.current++)
    setPacientes(prev => [...prev, { ...PACIENTE_VACIO, id }])
    setResultados(null)
  }

  const eliminarFila = (idx) => {
    setPacientes(p => p.filter((_, i) => i !== idx))
    setResultados(null)
  }

  const actualizarFila = (idx, campo, valor) => {
    setPacientes(p => p.map((row, i) => i === idx ? { ...row, [campo]: valor } : row))
    setResultados(null)
  }

  const calcularLote = () => {
    const filasSinPeso = pacientes.filter(p => !parseFloat(p.peso))
    if (filasSinPeso.length > 0) {
      setError(`Complete el peso de todos los pacientes antes de calcular.`)
      return
    }
    setError('')

    const res = pacientes.map(p => ({
      ...p,
      calc: calcPaciente(p),
    }))
    setResultados(res)
  }

  const exportarCSV = () => {
    if (!resultados) return
    const cabecera = 'ID,Perfil,Peso (kg),Vol (mL),Energía (kcal/día),Proteína (g/día),Prot (g/kg/día),Dextrosa (g),Lípidos (g),Vol AA 10% (mL),Vol Dex 50% (mL),Vol Lip 20% (mL),Osmolaridad (mOsm/L),Vía recomendada,Alertas'
    const filas = resultados.map(r => {
      const c = r.calc
      if (!c) return `${r.id},—,${r.peso},${r.volumen},error,error,error,error,error,error,error,error,error,error,—`
      return [
        r.id,
        PERFILES_BATCH.find(p => p.id === r.perfil)?.label ?? r.perfil,
        r.peso,
        r.volumen,
        c.ten,
        c.protG,
        c.protKg,
        c.dextrosaG,
        c.lipidoG,
        c.volAA,
        c.volDex,
        c.volLip,
        c.osm,
        c.via.label,
        c.alerts.join(' | '),
      ].join(',')
    })

    const csv = [cabecera, ...filas].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `nutrivida-batch-${new Date().toISOString().slice(0,10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Summary of total supplies
  const totalInsumos = resultados ? resultados.reduce((acc, r) => {
    if (!r.calc) return acc
    return {
      aaG:   acc.aaG   + r.calc.protG,
      dexG:  acc.dexG  + r.calc.dextrosaG,
      lipG:  acc.lipG  + r.calc.lipidoG,
      volAA: acc.volAA + r.calc.volAA,
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
            Procesa múltiples pacientes simultáneamente aplicando la ecuación de Pereira Da Silva para osmolaridad
            y los rangos KDOQI/ESPEN por perfil patológico. Reduce de 15–20 min/paciente a segundos.
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
        <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
        <p>Cálculos basados en promedios de rangos ESPEN/KDOQI. Cada prescripción final debe ser validada individualmente por el farmacéutico o médico tratante. Osmolaridad estimada sin electrolitos individuales (para cálculo de precisión, usar la Calculadora NP individual).</p>
      </div>

      {/* Tabla de entrada */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600">
              <th className="text-left px-3 py-2 rounded-tl-xl font-semibold">ID / Nombre</th>
              <th className="text-left px-3 py-2 font-semibold">Peso (kg)</th>
              <th className="text-left px-3 py-2 font-semibold">Perfil clínico</th>
              <th className="text-left px-3 py-2 font-semibold">Volumen (mL)</th>
              <th className="text-left px-3 py-2 font-semibold">Acceso venoso</th>
              <th className="text-left px-3 py-2 rounded-tr-xl font-semibold"></th>
            </tr>
          </thead>
          <tbody>
            {pacientes.map((p, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2">
                  <input
                    type="text"
                    value={p.id}
                    onChange={e => actualizarFila(idx, 'id', e.target.value)}
                    className={inputCls}
                    placeholder={`Pac-${idx + 1}`}
                  />
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={p.peso}
                    onChange={e => actualizarFila(idx, 'peso', e.target.value)}
                    className={inputCls}
                    placeholder="70"
                    min="1" max="300"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={p.perfil}
                    onChange={e => actualizarFila(idx, 'perfil', e.target.value)}
                    className={inputCls}
                  >
                    {PERFILES_BATCH.map(pf => (
                      <option key={pf.id} value={pf.id}>{pf.label}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={p.volumen}
                    onChange={e => actualizarFila(idx, 'volumen', e.target.value)}
                    className={inputCls}
                    placeholder="2000"
                    min="500" max="5000"
                  />
                </td>
                <td className="px-3 py-2">
                  <select
                    value={p.acceso}
                    onChange={e => actualizarFila(idx, 'acceso', e.target.value)}
                    className={inputCls}
                  >
                    <option value="central">Central (CVC/PICC)</option>
                    <option value="periferica">Periférica</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() => eliminarFila(idx)}
                    disabled={pacientes.length === 1}
                    className="text-slate-300 hover:text-red-500 transition-colors disabled:cursor-not-allowed"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Controles */}
      <div className="flex gap-3 flex-wrap">
        <button
          onClick={agregarFila}
          className="flex items-center gap-1.5 text-sm text-teal-700 border border-teal-300 bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded-xl transition-colors"
        >
          <Plus size={15} /> Agregar paciente
        </button>
        <button
          onClick={calcularLote}
          className="flex-1 min-w-[180px] bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 px-4 rounded-xl transition-colors text-sm"
        >
          Calcular lote ({pacientes.length} paciente{pacientes.length !== 1 ? 's' : ''})
        </button>
        {resultados && (
          <>
            <button
              onClick={exportarCSV}
              className="flex items-center gap-1.5 text-sm text-teal-600 border border-teal-200 px-3 py-2 rounded-xl hover:bg-teal-50 transition-colors font-medium"
            >
              <Download size={14} /> Exportar CSV
            </button>
            <button
              onClick={() => {
                const id = nuevoId(nextIdRef.current++)
                setResultados(null)
                setPacientes([{ ...PACIENTE_VACIO, id }])
              }}
              className="text-slate-400 hover:text-slate-600 px-3 py-2 rounded-xl border border-slate-200 transition-colors"
            >
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

          {/* Resumen de insumos */}
          {totalInsumos && (
            <div className="bg-teal-700 text-white rounded-2xl p-5">
              <p className="font-bold text-sm mb-3 flex items-center gap-2">
                <Info size={15} className="text-teal-300" />
                Resumen de Insumos — Central de Mezclas
                <span className="text-teal-300 font-normal text-xs ml-auto">{resultados.length} pacientes · {new Date().toLocaleDateString('es-CR')}</span>
              </p>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {[
                  { label: 'AA (g totales)',       value: totalInsumos.aaG,   unit: 'g' },
                  { label: 'Dextrosa (g totales)', value: totalInsumos.dexG,  unit: 'g' },
                  { label: 'Lípidos (g totales)',  value: totalInsumos.lipG,  unit: 'g' },
                  { label: 'AA 10% (mL)',           value: totalInsumos.volAA,  unit: 'mL' },
                  { label: 'Dex 50% (mL)',          value: totalInsumos.volDex, unit: 'mL' },
                  { label: 'Lip 20% (mL)',          value: totalInsumos.volLip, unit: 'mL' },
                ].map((s, i) => (
                  <div key={i} className="bg-teal-600 rounded-xl p-3 text-center">
                    <p className="text-teal-200 text-[10px] mb-1">{s.label}</p>
                    <p className="font-bold text-lg text-white">{s.value.toLocaleString()}</p>
                    <p className="text-teal-300 text-[10px]">{s.unit}</p>
                  </div>
                ))}
              </div>
              {totalInsumos.alertas > 0 && (
                <div className="mt-3 flex items-center gap-2 bg-red-500/30 rounded-xl px-3 py-2 text-sm">
                  <AlertTriangle size={15} className="text-red-200" />
                  <span className="text-red-100 font-semibold">{totalInsumos.alertas} alerta{totalInsumos.alertas !== 1 ? 's' : ''} clínica{totalInsumos.alertas !== 1 ? 's' : ''} — revisar filas marcadas en rojo</span>
                </div>
              )}
            </div>
          )}

          {/* Tabla de resultados */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-600">
                  <th className="text-left px-3 py-2 rounded-tl-xl font-semibold">ID</th>
                  <th className="text-left px-3 py-2 font-semibold">Perfil</th>
                  <th className="text-right px-3 py-2 font-semibold">Energía</th>
                  <th className="text-right px-3 py-2 font-semibold">Proteína</th>
                  <th className="text-right px-3 py-2 font-semibold">Dex 50%</th>
                  <th className="text-right px-3 py-2 font-semibold">AA 10%</th>
                  <th className="text-right px-3 py-2 font-semibold">Lip 20%</th>
                  <th className="text-right px-3 py-2 font-semibold">Osm.</th>
                  <th className="text-left px-3 py-2 font-semibold">Vía</th>
                  <th className="text-left px-3 py-2 rounded-tr-xl font-semibold">Alertas</th>
                </tr>
              </thead>
              <tbody>
                {resultados.map((r, i) => {
                  const c = r.calc
                  const hasAlerts = c?.alerts?.length > 0
                  return (
                    <tr
                      key={i}
                      className={`border-b border-slate-100 ${hasAlerts ? 'bg-red-50' : i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}
                    >
                      <td className="px-3 py-2 font-semibold text-slate-700">{r.id || `Pac-${i + 1}`}</td>
                      <td className="px-3 py-2 text-slate-500">{PERFILES_BATCH.find(p => p.id === r.perfil)?.label}</td>
                      {!c ? (
                        <td colSpan={8} className="px-3 py-2 text-red-500">Error — verificar datos de entrada</td>
                      ) : (
                        <>
                          <td className="px-3 py-2 text-right font-medium text-slate-700">{c.ten} kcal</td>
                          <td className="px-3 py-2 text-right">
                            <span className="font-medium text-slate-700">{c.protG} g</span>
                            <span className="text-slate-400 ml-1">({c.protKg}/kg)</span>
                          </td>
                          <td className="px-3 py-2 text-right text-slate-600">{c.volDex} mL</td>
                          <td className="px-3 py-2 text-right text-slate-600">{c.volAA} mL</td>
                          <td className="px-3 py-2 text-right text-slate-600">{c.volLip} mL</td>
                          <td className="px-3 py-2 text-right font-mono font-semibold text-slate-700">{c.osm}</td>
                          <td className="px-3 py-2">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${c.via.badge}`}>
                              {c.via.label}
                            </span>
                          </td>
                          <td className="px-3 py-2">
                            {c.alerts.length === 0 ? (
                              <CheckCircle size={13} className="text-emerald-500" />
                            ) : (
                              <div className="space-y-0.5">
                                {c.alerts.map((a, ai) => (
                                  <div key={ai} className="flex items-start gap-1 text-[10px] text-red-700">
                                    <AlertTriangle size={10} className="flex-shrink-0 mt-0.5" />
                                    {a}
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
            Energía = promedio del rango ESPEN/KDOQI del perfil. Proteína = promedio del rango del perfil. Macronutrientes: 65% NPC → dextrosa, 35% NPC → lípidos.
            Osmolaridad estimada por Pereira Da Silva sin electrolitos individuales — para cálculo de precisión, usar Calculadora NP individual.
            <span className="font-semibold text-red-600 ml-1">Cada prescripción requiere validación farmacéutica individual.</span>
          </p>
        </div>
      )}
    </div>
  )
}
