import { useState, useEffect, useCallback } from 'react'
import { Thermometer, Clock, Calendar, Trash2, Download, CheckCircle, AlertCircle, Timer } from 'lucide-react'
import { generateNPReminders, downloadICS } from '../utils/icsGenerator'

function useTimer(targetTime) {
  const [diff, setDiff] = useState(null)

  useEffect(() => {
    if (!targetTime) { setDiff(null); return }
    const tick = () => {
      const ms = new Date(targetTime) - Date.now()
      setDiff(ms)
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [targetTime])

  return diff
}

function formatDuration(ms) {
  if (ms === null) return '--:--:--'
  const abs = Math.abs(ms)
  const h = Math.floor(abs / 3600000)
  const m = Math.floor((abs % 3600000) / 60000)
  const s = Math.floor((abs % 60000) / 1000)
  const sign = ms < 0 ? '-' : ''
  return `${sign}${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

function formatDays(ms) {
  if (ms === null) return '—'
  const days = Math.floor(ms / 86400000)
  const hours = Math.floor((ms % 86400000) / 3600000)
  if (ms < 0) return 'Vencido'
  if (days === 0) return `${hours}h restantes`
  return `${days}d ${hours}h restantes`
}

export default function LogisticaDomiciliaria() {
  const [infusionHora, setInfusionHora] = useState('20:00')
  const [infusionInicio, setInfusionInicio] = useState(null)
  const [bolsaFecha, setBolsaFecha] = useState('')
  const [retiroFecha, setRetiroFecha] = useState('')
  const [configurado, setConfigurado] = useState(false)

  const salidaFrioTime = infusionInicio
    ? new Date(infusionInicio).getTime() - 90 * 60 * 1000
    : null
  const vencimientoTime = bolsaFecha
    ? new Date(bolsaFecha).getTime() + 5 * 24 * 60 * 60 * 1000
    : null
  const retiroTime = retiroFecha ? new Date(retiroFecha).getTime() : null

  const diffInfusion = useTimer(infusionInicio)
  const diffSalidaFrio = useTimer(salidaFrioTime)
  const diffVencimiento = useTimer(vencimientoTime)
  const diffRetiro = useTimer(retiroTime)

  const configurar = () => {
    if (!infusionHora || !bolsaFecha) return
    const [h, m] = infusionHora.split(':').map(Number)
    const inicio = new Date()
    inicio.setHours(h, m, 0, 0)
    if (inicio <= new Date()) inicio.setDate(inicio.getDate() + 1)
    setInfusionInicio(inicio.toISOString())
    setConfigurado(true)
  }

  const descargarRecordatorios = () => {
    const [h, m] = infusionHora.split(':').map(Number)
    const reminders = generateNPReminders(h, m)
    downloadICS(reminders.temperatura, 'NP-sacar-del-frio.ics')
    setTimeout(() => downloadICS(reminders.infusion, 'NP-iniciar-infusion.ics'), 500)
    setTimeout(() => downloadICS(reminders.vencimiento, 'NP-verificar-vencimiento.ics'), 1000)
  }

  const tarjetas = [
    {
      icon: Thermometer,
      titulo: 'Sacar del refrigerador',
      subtitulo: '90 min antes de la infusión',
      tiempo: diffSalidaFrio,
      formato: formatDuration,
      activo: !!salidaFrioTime,
      urgente: diffSalidaFrio !== null && diffSalidaFrio < 15 * 60 * 1000 && diffSalidaFrio > 0,
      colorBase: 'teal',
    },
    {
      icon: Timer,
      titulo: 'Inicio de infusión',
      subtitulo: 'Tiempo hasta la próxima dosis',
      tiempo: diffInfusion,
      formato: formatDuration,
      activo: !!infusionInicio,
      urgente: diffInfusion !== null && diffInfusion < 30 * 60 * 1000 && diffInfusion > 0,
      colorBase: 'blue',
    },
    {
      icon: Clock,
      titulo: 'Vencimiento de la bolsa',
      subtitulo: 'Vida útil máxima 5 días',
      tiempo: diffVencimiento,
      formato: formatDays,
      activo: !!vencimientoTime,
      urgente: diffVencimiento !== null && diffVencimiento < 24 * 3600000 && diffVencimiento > 0,
      colorBase: 'amber',
    },
    {
      icon: Calendar,
      titulo: 'Próximo retiro de bolsas',
      subtitulo: 'En la farmacia del hospital',
      tiempo: diffRetiro,
      formato: formatDays,
      activo: !!retiroTime,
      urgente: diffRetiro !== null && diffRetiro < 24 * 3600000 && diffRetiro > 0,
      colorBase: 'purple',
    },
  ]

  const colores = {
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', icon: 'text-teal-600', valor: 'text-teal-700' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-600', valor: 'text-blue-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-600', valor: 'text-amber-700' },
    purple: { bg: 'bg-violet-50', border: 'border-violet-200', icon: 'text-violet-600', valor: 'text-violet-700' },
  }

  return (
    <div className="space-y-5">
      {/* Configuración */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
        <h3 className="font-bold text-slate-700 text-base mb-4">Configurar mi rutina de NP</h3>
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              Hora de infusión diaria
            </label>
            <input
              type="time"
              value={infusionHora}
              onChange={e => setInfusionHora(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-3 text-base font-mono focus:outline-none focus:border-teal-400 bg-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              Fecha de preparación de la bolsa
            </label>
            <input
              type="date"
              value={bolsaFecha}
              onChange={e => setBolsaFecha(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-teal-400 bg-white"
            />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">
              Próxima visita al hospital (retiro de bolsas)
            </label>
            <input
              type="datetime-local"
              value={retiroFecha}
              onChange={e => setRetiroFecha(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-3 text-sm focus:outline-none focus:border-teal-400 bg-white"
            />
          </div>
        </div>
        <button
          onClick={configurar}
          disabled={!infusionHora || !bolsaFecha}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl transition-colors text-base"
        >
          {configurado ? 'Actualizar mis recordatorios' : 'Activar mis recordatorios'}
        </button>
      </div>

      {/* Tarjetas de tiempo */}
      <div className="grid grid-cols-2 gap-3">
        {tarjetas.map((t, i) => {
          const c = colores[t.colorBase]
          const Icon = t.icon
          return (
            <div
              key={i}
              className={`rounded-2xl p-4 border-2 transition-all ${
                t.urgente
                  ? 'bg-red-50 border-red-300 ring-2 ring-red-200'
                  : t.activo
                  ? `${c.bg} ${c.border}`
                  : 'bg-white border-slate-100'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon size={18} className={t.activo ? c.icon : 'text-slate-300'} />
                <p className={`text-xs font-semibold ${t.activo ? 'text-slate-600' : 'text-slate-300'}`}>
                  {t.titulo}
                </p>
              </div>
              <p className={`font-mono font-bold text-xl mb-1 ${
                t.urgente ? 'text-red-600' : t.activo ? c.valor : 'text-slate-300'
              }`}>
                {t.activo ? t.formato(t.tiempo) : '--:--:--'}
              </p>
              <p className={`text-xs ${t.activo ? 'text-slate-400' : 'text-slate-200'}`}>
                {t.subtitulo}
              </p>
              {t.urgente && (
                <div className="flex items-center gap-1 mt-1.5">
                  <AlertCircle size={12} className="text-red-500" />
                  <span className="text-xs text-red-600 font-semibold">¡Atención!</span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Descargar recordatorios .ics */}
      <div className="bg-teal-50 rounded-2xl p-4 border border-teal-200">
        <div className="flex items-start gap-3">
          <Download size={20} className="text-teal-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-bold text-teal-800 text-base">Agregar recordatorios al calendario</p>
            <p className="text-teal-600 text-sm mt-1 leading-relaxed">
              Descargue 3 eventos para su app de calendario (Apple, Google, etc.) con alarmas nativas en su teléfono. Sin permisos especiales necesarios.
            </p>
            <div className="mt-3 flex flex-col gap-2 text-xs text-teal-700">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-teal-500" />
                <span>Sacar bolsa del refrigerador (90 min antes)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-teal-500" />
                <span>Iniciar infusión de NP</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-teal-500" />
                <span>Verificar vencimiento de la bolsa</span>
              </div>
            </div>
            <button
              onClick={descargarRecordatorios}
              className="mt-4 w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-base transition-colors flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Descargar 3 recordatorios (.ics)
            </button>
            <p className="text-xs text-teal-500 text-center mt-2">
              Funciona en iPhone, Android y computadora
            </p>
          </div>
        </div>
      </div>

      {/* Gestión de residuos */}
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <div className="flex items-center gap-2 mb-3">
          <Trash2 size={18} className="text-slate-500" />
          <p className="font-bold text-slate-700 text-base">Recordatorio: Residuos Biopeligrosos</p>
        </div>
        <div className="space-y-2 text-sm text-slate-500">
          <p className="flex items-start gap-2">
            <span className="text-amber-500 font-bold flex-shrink-0">→</span>
            La bolsa vacía, tubuladuras y agujas deben guardarse en el recipiente de desechos biopeligrosos asignado.
          </p>
          <p className="flex items-start gap-2">
            <span className="text-amber-500 font-bold flex-shrink-0">→</span>
            Acumúlelos y llévelos en su próxima visita al hospital para disposición correcta.
          </p>
          <p className="flex items-start gap-2">
            <span className="text-amber-500 font-bold flex-shrink-0">→</span>
            NO desecharlos en la basura doméstica común.
          </p>
        </div>
      </div>
    </div>
  )
}
