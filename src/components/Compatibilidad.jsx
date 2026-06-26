import { useState, useMemo } from 'react'
import { Search, CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react'
import datos from '../data/compatibilidades.json'

const CONFIG = {
  compatible: { label: 'Compatible', color: 'bg-emerald-100 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500', icon: CheckCircle, iconColor: 'text-emerald-500' },
  caution: { label: 'Cautela', color: 'bg-amber-100 text-amber-700 border-amber-200', dot: 'bg-amber-400', icon: AlertCircle, iconColor: 'text-amber-500' },
  incompatible: { label: 'Incompatible', color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500', icon: XCircle, iconColor: 'text-red-500' },
}

const FILTROS = ['Todos', 'compatible', 'caution', 'incompatible']

function Badge({ nivel }) {
  if (!nivel || !CONFIG[nivel]) return null
  const { label, color } = CONFIG[nivel]
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      {label}
    </span>
  )
}

export default function Compatibilidad() {
  const [busqueda, setBusqueda] = useState('')
  const [filtro, setFiltro] = useState('Todos')
  const [seleccionado, setSeleccionado] = useState(null)

  const resultados = useMemo(() => {
    return datos.filter(d => {
      const matchBusqueda = busqueda.length < 2 || d.farmaco.toLowerCase().includes(busqueda.toLowerCase()) || d.clasificacion.toLowerCase().includes(busqueda.toLowerCase())
      const matchFiltro = filtro === 'Todos' || d.np_ternaria === filtro || d.via_y === filtro
      return matchBusqueda && matchFiltro
    })
  }, [busqueda, filtro])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700">
        <Info size={15} className="flex-shrink-0" />
        Base de datos ({datos.length} fármacos) basada en Trissel's, King Guide y ASHP Injectable Drug Information. Siempre verificar con el farmacéutico de nutrición clínica.
      </div>

      {/* Búsqueda */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar fármaco (ej: vancomicina, insulina...)"
          className="w-full pl-9 pr-4 py-3 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-teal-400 focus:ring-1 focus:ring-teal-100"
        />
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {FILTROS.map(f => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filtro === f
                ? 'bg-teal-600 text-white'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-teal-300'
            }`}
          >
            {f === 'Todos' ? 'Todos' : CONFIG[f]?.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-400 self-center">{resultados.length} resultados</span>
      </div>

      {/* Leyenda */}
      <div className="flex gap-4 text-xs text-slate-500 flex-wrap">
        <span className="font-semibold text-slate-600">Leyenda:</span>
        {Object.entries(CONFIG).map(([k, v]) => (
          <span key={k} className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${v.dot}`} />
            {v.label}
          </span>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {resultados.map(d => {
          const IconNP = CONFIG[d.np_ternaria]?.icon || Info
          return (
            <div
              key={d.id}
              onClick={() => setSeleccionado(seleccionado?.id === d.id ? null : d)}
              className="bg-white border border-slate-100 rounded-xl p-3 cursor-pointer hover:border-teal-200 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <IconNP size={16} className={CONFIG[d.np_ternaria]?.iconColor || 'text-slate-400'} />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 text-sm truncate">{d.farmaco}</p>
                    <p className="text-xs text-slate-400">{d.clasificacion}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-shrink-0 items-center">
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-0.5">NP 3-en-1</p>
                    <Badge nivel={d.np_ternaria} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-400 mb-0.5">Vía Y</p>
                    <Badge nivel={d.via_y} />
                  </div>
                </div>
              </div>

              {seleccionado?.id === d.id && (
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                  <p className="text-xs text-slate-600"><span className="font-semibold">Descripción:</span> {d.descripcion}</p>
                  <p className={`text-xs font-medium p-2 rounded-lg ${CONFIG[d.np_ternaria]?.color}`}>
                    <span className="font-bold">Recomendación:</span> {d.recomendacion}
                  </p>
                  {d.fuente && (
                    <p className="text-[10px] text-slate-400 italic border-t border-slate-100 pt-1.5">
                      Fuente: {d.fuente}
                    </p>
                  )}
                </div>
              )}
            </div>
          )
        })}

        {resultados.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">
            No se encontraron resultados para "{busqueda}"
          </div>
        )}
      </div>
    </div>
  )
}
