import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing'
import Profesional from './pages/Profesional'
import Paciente from './pages/Paciente'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/profesional" element={<Profesional />} />
        <Route path="/paciente" element={<Paciente />} />
      </Routes>
    </BrowserRouter>
  )
}
