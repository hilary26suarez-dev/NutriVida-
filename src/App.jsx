import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Profesional from './pages/Profesional'
import Paciente from './pages/Paciente'
import Estudiante from './pages/Estudiante'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/profesional" element={<Profesional />} />
        <Route path="/paciente" element={<Paciente />} />
        <Route path="/estudiante" element={<Estudiante />} />
      </Routes>
    </BrowserRouter>
  )
}
