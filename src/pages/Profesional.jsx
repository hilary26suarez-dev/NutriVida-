import { useState } from 'react'
import NavBar from '../components/NavBar'
import CalculadoraNP from '../components/CalculadoraNP'
import Compatibilidad from '../components/Compatibilidad'
import SafetyNotice from '../components/SafetyNotice'
import { Calculator, Pill, FlaskConical } from 'lucide-react'

const tabs = [
  { id: 'calculadora', label: 'Calculadora NP', icon: Calculator },
  { id: 'compatibilidad', label: 'Compatibilidades', icon: Pill },
]

export default function Profesional() {
  const [activeTab, setActiveTab] = useState('calculadora')

  return (
    <div className="min-h-screen bg-teal-50">
      <NavBar />

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-teal-600 text-white p-2 rounded-xl">
              <FlaskConical size={20} />
            </div>
            <h1 className="text-2xl font-bold text-teal-900">Módulo Profesional</h1>
          </div>
          <p className="text-slate-500 text-sm ml-11">
            Herramientas clínicas con base biotecnológica para el equipo de soporte nutricional
          </p>
        </div>

        <div className="mb-4">
          <SafetyNotice variant="professional" />
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-teal-100 overflow-hidden">
          <div className="flex border-b border-teal-100">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors flex-1 justify-center ${
                  activeTab === id
                    ? 'bg-teal-50 text-teal-700 border-b-2 border-teal-600'
                    : 'text-slate-500 hover:text-teal-600 hover:bg-teal-50'
                }`}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>

          <div className="p-5 md:p-6">
            {activeTab === 'calculadora' && <CalculadoraNP />}
            {activeTab === 'compatibilidad' && <Compatibilidad />}
          </div>
        </div>

        {/* Disclaimer */}
        <p className="text-center text-xs text-slate-400 mt-4">
          Esta herramienta es un apoyo clínico. El profesional es responsable de la validación y prescripción final.
          Basada en lineamientos CCSS · ESPEN · ASPEN.
        </p>
      </div>
    </div>
  )
}
