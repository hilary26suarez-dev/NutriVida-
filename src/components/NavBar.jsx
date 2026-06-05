import { Link, useLocation } from 'react-router-dom'
import { Dna, Home, Stethoscope, Heart } from 'lucide-react'

export default function NavBar() {
  const location = useLocation()

  return (
    <nav className="bg-white border-b border-teal-100 shadow-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-teal-600 text-white p-1.5 rounded-lg group-hover:bg-teal-700 transition-colors">
            <Dna size={20} />
          </div>
          <div className="leading-tight">
            <span className="font-bold text-teal-800 text-sm block">NutriVida Biotech</span>
            <span className="text-teal-500 text-xs">Costa Rica</span>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/'
                ? 'bg-teal-50 text-teal-700'
                : 'text-slate-500 hover:text-teal-700 hover:bg-teal-50'
            }`}
          >
            <Home size={16} />
            <span className="hidden sm:inline">Inicio</span>
          </Link>

          <Link
            to="/profesional"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/profesional'
                ? 'bg-teal-600 text-white'
                : 'text-slate-500 hover:text-teal-700 hover:bg-teal-50'
            }`}
          >
            <Stethoscope size={16} />
            <span className="hidden sm:inline">Profesional</span>
          </Link>

          <Link
            to="/paciente"
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/paciente'
                ? 'bg-emerald-500 text-white'
                : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
            }`}
          >
            <Heart size={16} />
            <span className="hidden sm:inline">Paciente</span>
          </Link>
        </div>
      </div>
    </nav>
  )
}
