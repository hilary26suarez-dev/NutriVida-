import { Link } from 'react-router-dom'
import { Dna, Stethoscope, Heart, ShieldCheck, FlaskConical, Users, ChevronRight, Star } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 via-white to-teal-50">
      {/* Header */}
      <header className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-teal-600 text-white p-2 rounded-xl">
            <Dna size={22} />
          </div>
          <div>
            <span className="font-bold text-teal-800 text-lg block leading-tight">NutriVida Biotech</span>
            <span className="text-teal-500 text-xs">Costa Rica</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1 rounded-full">
            Donado a Costa Rica
          </span>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 pt-10 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Star size={14} className="fill-teal-500 text-teal-500" />
          Primera herramienta de NP con enfoque biotecnológico en Costa Rica
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-teal-900 leading-tight mb-4">
          Nutrición Parenteral de Precisión,
          <br />
          <span className="text-teal-600">con Ciencia y Humanidad</span>
        </h1>

        <p className="text-slate-600 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          Una herramienta gratuita para profesionales de la salud y personas en NP domiciliaria.
          Diseñada con biotecnología. Hecha con corazón.
        </p>

        {/* Two main paths */}
        <div className="grid md:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <Link
            to="/profesional"
            className="group bg-white border-2 border-teal-200 hover:border-teal-500 rounded-2xl p-7 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="bg-teal-600 text-white w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-teal-700 transition-colors">
              <Stethoscope size={24} />
            </div>
            <h2 className="text-xl font-bold text-teal-900 mb-2">Soy profesional de salud</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              Calculadora de NP con semáforo de estabilidad, base de datos de compatibilidades farmacológicas y herramientas de seguimiento.
            </p>
            <div className="flex items-center gap-1 text-teal-600 font-semibold text-sm">
              Entrar al módulo profesional <ChevronRight size={16} />
            </div>
          </Link>

          <Link
            to="/paciente"
            className="group bg-white border-2 border-emerald-200 hover:border-emerald-500 rounded-2xl p-7 text-left transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5"
          >
            <div className="bg-emerald-500 text-white w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:bg-emerald-600 transition-colors">
              <Heart size={24} />
            </div>
            <h2 className="text-xl font-bold text-teal-900 mb-2">Soy paciente o cuidador</h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-4">
              Acompañamiento diario, recordatorios inteligentes, asistente IA y guías para la logística de tu NP en casa.
            </p>
            <div className="flex items-center gap-1 text-emerald-600 font-semibold text-sm">
              Entrar al espacio del paciente <ChevronRight size={16} />
            </div>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-14">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-2xl font-bold text-teal-900 text-center mb-10">
            Por qué NutriVida Biotech es diferente
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="bg-teal-100 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FlaskConical size={26} className="text-teal-600" />
              </div>
              <h3 className="font-bold text-teal-900 mb-2">Fundamento Biotecnológico</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                El algoritmo de estabilidad evalúa el producto calcio-fosfato y el riesgo de coalescencia lipídica — química real, no estimaciones.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-emerald-100 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShieldCheck size={26} className="text-emerald-600" />
              </div>
              <h3 className="font-bold text-teal-900 mb-2">Seguridad del Paciente</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Recordatorios de cadena de frío, temporizadores de infusión y alertas de vencimiento diseñados para la realidad del hogar costarricense.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="bg-blue-100 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users size={26} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-teal-900 mb-2">Asistente IA Especializado</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                NutriAsistente conoce el contexto de la CCSS, los derechos del paciente y habla en un lenguaje claro y empático.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Biotech section */}
      <section className="max-w-5xl mx-auto px-6 py-14">
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-3xl p-8 md:p-10 text-white">
          <div className="flex items-start gap-4 mb-5">
            <div className="bg-white/20 p-2.5 rounded-xl">
              <Dna size={24} />
            </div>
            <div>
              <span className="text-teal-200 text-sm font-medium">Innovación que cuida</span>
              <h3 className="text-2xl font-bold">¿Sabías que tu bolsa de NP es biotecnología pura?</h3>
            </div>
          </div>
          <p className="text-teal-100 leading-relaxed mb-6 max-w-2xl">
            Los aminoácidos de tu nutrición son producidos por bacterias como <em>Corynebacterium glutamicum</em> mediante fermentación microbiana. Los lípidos pueden venir de microalgas ricas en omega-3. Cada componente es el resultado de décadas de investigación biotecnológica al servicio de la vida.
          </p>
          <Link
            to="/paciente"
            className="inline-flex items-center gap-2 bg-white text-teal-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-50 transition-colors text-sm"
          >
            Explorar mi tratamiento <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-teal-100 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="bg-teal-600 text-white p-1.5 rounded-lg">
            <Dna size={16} />
          </div>
          <span className="font-bold text-teal-800">NutriVida Biotech</span>
        </div>
        <p className="text-slate-400 text-sm">
          Herramienta donada a Costa Rica · Uso libre para profesionales y pacientes
        </p>
        <p className="text-slate-400 text-xs mt-1">
          Desarrollada con apoyo de ACONEP y FELANPE · No reemplaza la indicación médica
        </p>
        <p className="text-slate-300 text-xs mt-3">
          En honor a Gerardo Fonseca, por una vida que inspira cuidado, ciencia y humanidad.
        </p>
      </footer>
    </div>
  )
}
