import { useState } from 'react'
import NavBar from '../components/NavBar'
import LogisticaDomiciliaria from '../components/LogisticaDomiciliaria'
import AsistenteIA from '../components/AsistenteIA'
import GuiaCuidador from '../components/GuiaCuidador'
import {
  AlertTriangle,
  BookOpen,
  ChevronLeft,
  Dna,
  Droplets,
  Heart,
  Leaf,
  Lock,
  MessageCircle,
  Phone,
  Users,
} from 'lucide-react'
import InspectorInfecciones from '../components/InspectorInfecciones'
import CuidadosNP from '../components/CuidadosNP'
import BienestarMental from '../components/BienestarMental'
import BiotecnologiaNP from '../components/BiotecnologiaNP'
import VidaMejor from '../components/VidaMejor'

const sections = [
  {
    id: 'infusion',
    label: 'Mi Infusión',
    subtitle: 'Timers, recordatorios y checklist diario',
    icon: Droplets,
    iconBg: 'bg-teal-600',
    cardBg: 'bg-teal-50',
    border: 'border-teal-200',
    labelColor: 'text-teal-800',
    ready: true,
  },
  {
    id: 'cuidador',
    label: 'Guía del Cuidador',
    subtitle: 'Protocolo paso a paso para el hogar',
    icon: Users,
    iconBg: 'bg-emerald-600',
    cardBg: 'bg-emerald-50',
    border: 'border-emerald-200',
    labelColor: 'text-emerald-800',
    ready: true,
    badge: 'Nuevo',
  },
  {
    id: 'urgencias',
    label: 'Señales de Alarma',
    subtitle: 'Cuándo detener y a quién llamar',
    icon: AlertTriangle,
    iconBg: 'bg-red-500',
    cardBg: 'bg-red-50',
    border: 'border-red-200',
    labelColor: 'text-red-800',
    ready: true,
  },
  {
    id: 'asistente',
    label: 'Asistente IA',
    subtitle: 'Sus dudas respondidas en lenguaje claro',
    icon: MessageCircle,
    iconBg: 'bg-blue-600',
    cardBg: 'bg-blue-50',
    border: 'border-blue-200',
    labelColor: 'text-blue-800',
    ready: true,
  },
  {
    id: 'bienestar',
    label: 'Mi Bienestar',
    subtitle: 'Apoyo emocional para el hogar',
    icon: Heart,
    iconBg: 'bg-pink-400',
    cardBg: 'bg-pink-50',
    border: 'border-pink-200',
    labelColor: 'text-pink-800',
    ready: true,
    badge: 'Nuevo',
  },
  {
    id: 'biotecnologia',
    label: 'Biotecnología',
    subtitle: 'La ciencia detrás de su tratamiento',
    icon: Dna,
    iconBg: 'bg-violet-500',
    cardBg: 'bg-violet-50',
    border: 'border-violet-200',
    labelColor: 'text-violet-800',
    ready: true,
    badge: 'Nuevo',
  },
  {
    id: 'vidamejor',
    label: 'Vida Mejor',
    subtitle: 'Calidad de vida con NP domiciliaria',
    icon: Leaf,
    iconBg: 'bg-green-600',
    cardBg: 'bg-green-50',
    border: 'border-green-200',
    labelColor: 'text-green-800',
    ready: true,
    badge: 'Nuevo',
  },
  {
    id: 'cuidados',
    label: 'Cuidados NP',
    subtitle: 'Lo que NO debe hacer en casa',
    icon: BookOpen,
    iconBg: 'bg-orange-500',
    cardBg: 'bg-orange-50',
    border: 'border-orange-200',
    labelColor: 'text-orange-800',
    ready: true,
    badge: 'Nuevo',
  },
]

export default function Paciente() {
  const [activeSection, setActiveSection] = useState(null)

  const current = sections.find((s) => s.id === activeSection)
  const Icon = current?.icon

  return (
    <div className="min-h-screen bg-teal-50">
      <NavBar />
      <div className="max-w-2xl mx-auto px-4 py-6">
        {activeSection ? (
          <div>
            <button
              onClick={() => setActiveSection(null)}
              className="flex items-center gap-2 text-teal-600 font-semibold text-base mb-5 hover:text-teal-800 transition-colors py-2"
            >
              <ChevronLeft size={20} />
              Volver al inicio
            </button>

            <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
              <div className={`${current.cardBg} border-b ${current.border} px-5 py-4 flex items-center gap-3`}>
                <div className={`${current.iconBg} text-white p-2 rounded-xl`}>
                  <Icon size={20} />
                </div>
                <div>
                  <h2 className={`font-bold text-xl ${current.labelColor}`}>{current.label}</h2>
                  <p className="text-slate-500 text-base mt-0.5">{current.subtitle}</p>
                </div>
              </div>
              <div className="p-5">
                {activeSection === 'infusion' && <LogisticaDomiciliaria />}
                {activeSection === 'asistente' && <AsistenteIA />}
                {activeSection === 'urgencias' && <InspectorInfecciones />}
                {activeSection === 'cuidados' && <CuidadosNP />}
                {activeSection === 'bienestar' && <BienestarMental />}
                {activeSection === 'biotecnologia' && <BiotecnologiaNP />}
                {activeSection === 'vidamejor' && <VidaMejor />}
                {activeSection === 'cuidador' && (
                  <GuiaCuidador onOpenAI={() => setActiveSection('asistente')} />
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                NutriVida Biotech · NP Domiciliaria
              </div>
              <h1 className="text-3xl font-bold text-teal-900">Su espacio de apoyo</h1>
              <p className="text-slate-500 mt-2 text-sm leading-relaxed max-w-sm mx-auto">
                Información, acompañamiento y herramientas para su nutrición parenteral en casa.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {sections.map((section) => {
                const SectionIcon = section.icon
                return (
                  <button
                    key={section.id}
                    onClick={() => section.ready && setActiveSection(section.id)}
                    disabled={!section.ready}
                    className={`relative text-left rounded-2xl p-5 border-2 transition-all duration-200 ${
                      section.ready
                        ? `${section.cardBg} ${section.border} hover:shadow-md hover:-translate-y-0.5 active:scale-95`
                        : 'bg-slate-50 border-slate-200 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {section.badge && (
                      <span className="absolute top-2 right-2 bg-emerald-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {section.badge}
                      </span>
                    )}
                    {!section.ready && (
                      <span className="absolute top-2 right-2">
                        <Lock size={13} className="text-slate-400" />
                      </span>
                    )}

                    <div
                      className={`${section.ready ? section.iconBg : 'bg-slate-300'} text-white w-12 h-12 rounded-xl flex items-center justify-center mb-3`}
                    >
                      <SectionIcon size={24} />
                    </div>

                    <p className={`font-bold text-base leading-tight mb-1 ${section.ready ? section.labelColor : 'text-slate-400'}`}>
                      {section.label}
                    </p>
                    <p className="text-slate-400 text-sm leading-snug">{section.subtitle}</p>

                    {!section.ready && (
                      <p className="text-sm text-slate-400 font-medium mt-2">Próximamente</p>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Urgencias() {
  const alarmas = [
    { emoji: '🌡️', titulo: 'Fiebre mayor de 38 °C', descripcion: 'Durante o después de la infusión, sin causa evidente.' },
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
            <span className="text-slate-700 font-medium">Ébais / Área de Salud</span>
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
