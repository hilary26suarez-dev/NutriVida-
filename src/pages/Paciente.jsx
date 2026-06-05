import { useState } from 'react'
import NavBar from '../components/NavBar'
import LogisticaDomiciliaria from '../components/LogisticaDomiciliaria'
import AsistenteIA from '../components/AsistenteIA'
import SafetyNotice from '../components/SafetyNotice'
import { Droplets, MessageCircle, AlertTriangle, Phone } from 'lucide-react'

const tabs = [
  { id: 'infusion', label: 'Mi Infusión', icon: Droplets },
  { id: 'asistente', label: 'Asistente IA', icon: MessageCircle },
  { id: 'urgencias', label: 'Urgencias', icon: AlertTriangle },
]

export default function Paciente() {
  const [activeTab, setActiveTab] = useState('infusion')

  return (
    <div className="min-h-screen bg-teal-50">
      <NavBar />

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Greeting */}
        <div className="text-center mb-6">
          <p className="text-teal-500 text-base font-medium mb-1">Bienvenido/a a su espacio</p>
          <h1 className="text-3xl font-bold text-teal-900">Aquí está en buenas manos</h1>
          <p className="text-slate-500 mt-2 text-base leading-relaxed">
            Todo lo que necesita para su nutrición parenteral en casa, en un solo lugar.
          </p>
        </div>

        <div className="mb-4">
          <SafetyNotice />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
          <div className="flex border-b border-teal-100">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex flex-col items-center gap-1 py-3 px-2 text-xs font-semibold transition-colors flex-1 ${
                  activeTab === id
                    ? id === 'urgencias'
                      ? 'bg-red-50 text-red-600 border-b-2 border-red-500'
                      : 'bg-teal-50 text-teal-700 border-b-2 border-teal-600'
                    : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            ))}
          </div>

          <div className="p-5">
            {activeTab === 'infusion' && <LogisticaDomiciliaria />}
            {activeTab === 'asistente' && <AsistenteIA />}
            {activeTab === 'urgencias' && <Urgencias />}
          </div>
        </div>
      </div>
    </div>
  )
}

function Urgencias() {
  const alarmas = [
    { emoji: '🌡️', titulo: 'Fiebre mayor de 38°C', descripcion: 'Durante o después de la infusión, sin causa evidente clara.' },
    { emoji: '🔴', titulo: 'Enrojecimiento en el catéter', descripcion: 'Calor, hinchazón, dolor o secreción en el sitio de inserción.' },
    { emoji: '❄️', titulo: 'Escalofríos intensos', descripcion: 'Temblores fuertes mientras recibe la infusión.' },
    { emoji: '💨', titulo: 'Dificultad para respirar', descripcion: 'Sensación de falta de aire o dolor en el pecho durante la infusión.' },
    { emoji: '🫸', titulo: 'Hinchazón en brazo o cuello', descripcion: 'Del mismo lado donde está colocado el catéter.' },
    { emoji: '🧫', titulo: 'Bolsa con aspecto anormal', descripcion: 'Color diferente, capas separadas visibles o partículas flotando.' },
  ]

  return (
    <div className="space-y-4">
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5 text-center">
        <p className="text-red-800 font-bold text-lg mb-1">Si presenta alguna de estas señales:</p>
        <p className="text-red-700 text-base">
          Detenga la infusión y contacte a su equipo médico <strong>de inmediato</strong>
        </p>
      </div>

      <div className="space-y-3">
        {alarmas.map((a, i) => (
          <div key={i} className="bg-white border border-red-100 rounded-xl p-4 flex gap-3 items-start">
            <span className="text-2xl">{a.emoji}</span>
            <div>
              <p className="font-bold text-slate-800 text-base">{a.titulo}</p>
              <p className="text-slate-500 text-sm mt-0.5">{a.descripcion}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-3">
          <Phone size={20} className="text-teal-600" />
          <span className="font-bold text-teal-800 text-base">Contactos de Emergencia</span>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-white rounded-xl p-3">
            <span className="text-slate-700 font-medium">Emergencias CCSS</span>
            <a href="tel:911" className="bg-red-500 text-white font-bold px-4 py-1.5 rounded-lg text-sm hover:bg-red-600 transition-colors">
              911
            </a>
          </div>
          <div className="flex justify-between items-center bg-white rounded-xl p-3">
            <span className="text-slate-700 font-medium">Ebáis / Área de Salud</span>
            <span className="text-slate-400 text-sm">Su número local</span>
          </div>
          <div className="flex justify-between items-center bg-white rounded-xl p-3">
            <span className="text-slate-700 font-medium">ACONEP</span>
            <span className="text-teal-600 text-sm font-medium">aconep.cr</span>
          </div>
        </div>
      </div>

      <p className="text-center text-slate-400 text-xs">
        En caso de duda, siempre es mejor llamar. Su equipo médico prefiere que consulte.
      </p>
    </div>
  )
}
