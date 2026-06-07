import { useState } from 'react'
import { AlertTriangle, CheckCircle, Phone, Eye, XCircle } from 'lucide-react'

const signos = [
  { id: 'enrojecimiento', label: 'Enrojecimiento en el sitio del catéter', severidad: 'amarillo' },
  { id: 'hinchazon', label: 'Hinchazón o edema alrededor del catéter', severidad: 'amarillo' },
  { id: 'calor', label: 'Calor al tocar la zona del catéter', severidad: 'amarillo' },
  { id: 'dolor', label: 'Dolor o molestia en el sitio', severidad: 'amarillo' },
  { id: 'diferente', label: 'El sitio luce diferente a ayer', severidad: 'amarillo' },
  { id: 'secrecion', label: 'Secreción, líquido o pus en el sitio', severidad: 'rojo' },
  { id: 'fiebre', label: 'Fiebre mayor de 38 °C', severidad: 'rojo' },
  { id: 'escalofrios', label: 'Escalofríos fuertes o temblores', severidad: 'rojo' },
]

const rojoIds = new Set(['secrecion', 'fiebre', 'escalofrios'])

function calcularNivel(seleccionados) {
  if (seleccionados.length === 0) return null
  const tieneRojo = seleccionados.some((id) => rojoIds.has(id))
  const amarillos = seleccionados.filter((id) => !rojoIds.has(id)).length
  if (tieneRojo || amarillos >= 3) return 'rojo'
  return 'amarillo'
}

const resultados = {
  verde: {
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    iconBg: 'bg-emerald-500',
    titulo: 'El sitio luce bien',
    mensaje:
      'No hay señales de alarma visibles. Continúe con su rutina habitual y revise el sitio nuevamente antes de la próxima infusión.',
    accion: null,
  },
  amarillo: {
    bg: 'bg-amber-50',
    border: 'border-amber-400',
    iconBg: 'bg-amber-500',
    titulo: 'Preste atención',
    mensaje:
      'Hay signos que deben monitorearse. No interrumpa la infusión aún, pero contacte a su equipo de salud en las próximas 24 horas.',
    accion: 'Llame a su equipo de salud hoy',
  },
  rojo: {
    bg: 'bg-red-50',
    border: 'border-red-500',
    iconBg: 'bg-red-500',
    titulo: 'Señal de alarma',
    mensaje:
      'Estos síntomas pueden indicar una infección activa. Detenga la infusión de inmediato y contacte a su equipo de salud o llame al 911.',
    accion: '911',
  },
}

export default function InspectorInfecciones() {
  const [seleccionados, setSeleccionados] = useState([])

  const toggle = (id) =>
    setSeleccionados((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )

  const nivel = seleccionados.length === 0 ? 'verde' : calcularNivel(seleccionados)
  const resultado = resultados[nivel]

  return (
    <div className="space-y-5">
      {/* Intro */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200">
        <div className="flex items-start gap-3">
          <div className="bg-teal-600 text-white p-2.5 rounded-xl flex-shrink-0">
            <Eye size={22} />
          </div>
          <div>
            <p className="font-bold text-slate-800 text-lg leading-snug">
              ¿Cómo está el sitio del catéter hoy?
            </p>
            <p className="text-slate-500 text-base mt-1 leading-relaxed">
              Marque todo lo que observe ahora mismo. La app le dirá qué hacer.
            </p>
          </div>
        </div>
      </div>

      {/* Signos */}
      <div className="space-y-3">
        {signos.map((signo) => {
          const activo = seleccionados.includes(signo.id)
          const esRojo = rojoIds.has(signo.id)
          return (
            <button
              key={signo.id}
              onClick={() => toggle(signo.id)}
              className={`w-full flex items-center gap-4 rounded-2xl border-2 px-5 py-4 text-left transition-all duration-150 ${
                activo
                  ? esRojo
                    ? 'bg-red-50 border-red-400'
                    : 'bg-amber-50 border-amber-400'
                  : 'bg-white border-slate-200 hover:border-teal-300'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-colors ${
                  activo
                    ? esRojo
                      ? 'bg-red-500 border-red-500'
                      : 'bg-amber-500 border-amber-500'
                    : 'bg-white border-slate-300'
                }`}
              >
                {activo && <CheckCircle size={18} className="text-white" />}
              </div>
              <span
                className={`text-base font-medium leading-snug ${
                  activo
                    ? esRojo
                      ? 'text-red-800'
                      : 'text-amber-800'
                    : 'text-slate-700'
                }`}
              >
                {signo.label}
              </span>
              {esRojo && activo && (
                <span className="ml-auto flex-shrink-0 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded-lg">
                  Urgente
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Limpiar selección */}
      {seleccionados.length > 0 && (
        <button
          onClick={() => setSeleccionados([])}
          className="flex items-center gap-2 text-slate-400 text-sm font-medium hover:text-slate-600 transition-colors mx-auto"
        >
          <XCircle size={16} />
          Limpiar selección
        </button>
      )}

      {/* Resultado */}
      <div className={`rounded-2xl border-2 p-5 ${resultado.bg} ${resultado.border} transition-all duration-300`}>
        <div className="flex items-start gap-4">
          <div className={`${resultado.iconBg} text-white p-3 rounded-xl flex-shrink-0`}>
            {nivel === 'verde' && <CheckCircle size={26} />}
            {nivel === 'amarillo' && <AlertTriangle size={26} />}
            {nivel === 'rojo' && <AlertTriangle size={26} />}
          </div>
          <div className="flex-1">
            <p
              className={`font-bold text-xl leading-tight mb-2 ${
                nivel === 'verde'
                  ? 'text-emerald-800'
                  : nivel === 'amarillo'
                  ? 'text-amber-800'
                  : 'text-red-800'
              }`}
            >
              {resultado.titulo}
            </p>
            <p
              className={`text-base leading-relaxed ${
                nivel === 'verde'
                  ? 'text-emerald-700'
                  : nivel === 'amarillo'
                  ? 'text-amber-700'
                  : 'text-red-700'
              }`}
            >
              {resultado.mensaje}
            </p>

            {nivel === 'rojo' && (
              <a
                href="tel:911"
                className="mt-4 flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-2xl text-xl transition-colors w-full"
              >
                <Phone size={24} />
                Llamar al 911
              </a>
            )}
            {nivel === 'amarillo' && (
              <div className="mt-4 bg-white rounded-xl p-4 border border-amber-200 space-y-3">
                <p className="text-amber-800 font-bold text-base">Contactos de su equipo</p>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 text-base">Ébais / Área de Salud</span>
                  <span className="text-slate-400 text-sm">Su número local</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 text-base">ACONEP</span>
                  <span className="text-teal-600 text-base font-medium">aconep.cr</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Siempre disponible: emergencia */}
      {nivel !== 'rojo' && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex items-center justify-between">
          <div>
            <p className="font-bold text-slate-700 text-base">Emergencias CCSS</p>
            <p className="text-slate-400 text-sm">Disponible las 24 horas</p>
          </div>
          <a
            href="tel:911"
            className="bg-red-500 hover:bg-red-600 text-white font-bold px-6 py-3 rounded-xl text-lg transition-colors"
          >
            911
          </a>
        </div>
      )}

      <p className="text-center text-slate-400 text-sm pb-2">
        Esta herramienta no reemplaza la evaluación de su equipo médico.
      </p>
    </div>
  )
}
