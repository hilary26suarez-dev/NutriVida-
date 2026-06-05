import { AlertTriangle, ShieldCheck } from 'lucide-react'

export default function SafetyNotice({ variant = 'patient' }) {
  const isProfessional = variant === 'professional'

  return (
    <div className={`rounded-xl border p-4 text-sm ${
      isProfessional
        ? 'bg-amber-50 border-amber-200 text-amber-800'
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      <div className="flex items-start gap-3">
        {isProfessional
          ? <ShieldCheck size={19} className="flex-shrink-0 mt-0.5" />
          : <AlertTriangle size={19} className="flex-shrink-0 mt-0.5" />
        }
        <div className="space-y-1.5">
          <p className="font-bold">
            {isProfessional ? 'Uso clínico responsable' : 'Señales de alarma'}
          </p>
          {isProfessional ? (
            <p>
              Esta herramienta apoya cálculos y revisión inicial. No sustituye la validación del equipo de soporte nutricional,
              farmacia clínica ni la prescripción médica final.
            </p>
          ) : (
            <p>
              Si presenta fiebre mayor de 38 °C, escalofríos, dificultad para respirar, dolor en el pecho,
              enrojecimiento del catéter o una bolsa con aspecto anormal, detenga la infusión y contacte a su equipo médico o al 911.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
