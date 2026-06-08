import { XCircle, AlertTriangle, CheckCircle } from 'lucide-react'

const prohibiciones = [
  {
    titulo: 'NO cambie la velocidad de infusión',
    detalle: 'Solo su equipo médico puede ajustar el ritmo. Un cambio puede causar sobrecarga de líquidos o hipoglucemia.',
  },
  {
    titulo: 'NO reutilice tubuladuras ni jeringas',
    detalle: 'Cada conexión al catéter debe usar material estéril nuevo. La reutilización es la causa más frecuente de infección.',
  },
  {
    titulo: 'NO use una bolsa con aspecto anormal',
    detalle: 'Si la mezcla tiene partículas, capas separadas o color extraño, no la use aunque no esté vencida.',
  },
  {
    titulo: 'NO deje el catéter descubierto',
    detalle: 'Al desconectar, coloque el tapón estéril de inmediato. Segundos sin protección aumentan el riesgo de infección.',
  },
  {
    titulo: 'NO sople ni toque el conector con los dedos',
    detalle: 'Soplar para secar introduce bacterias de la boca directamente al torrente sanguíneo.',
  },
  {
    titulo: 'NO doble ni comprima la tubuladura',
    detalle: 'Puede detener el flujo sin que lo note, o crear una bolsa de aire que entre al sistema.',
  },
  {
    titulo: 'NO mezcle medicamentos en la bolsa',
    detalle: 'Ningún fármaco debe añadirse en casa. La compatibilidad se verifica en la farmacia hospitalaria.',
  },
  {
    titulo: 'NO ignore la fiebre durante la infusión',
    detalle: 'Fiebre mayor de 38 °C mientras infunde es señal de infección hasta que se demuestre lo contrario. Detenga y llame.',
  },
  {
    titulo: 'NO deseche residuos en la basura común',
    detalle: 'Bolsas vacías, tubuladuras y agujas son residuos biopeligrosos. Guárdelos en el recipiente asignado.',
  },
  {
    titulo: 'NO guarde la bolsa fuera del refrigerador más de 24 h',
    detalle: 'Una vez sacada del frío, debe infundirse el mismo día. No vuelva a refrigerar una bolsa ya temperada.',
  },
]

const señalesInmediatas = [
  'Fiebre mayor de 38 °C sin otra causa evidente',
  'Escalofríos o temblores durante la infusión',
  'Enrojecimiento, hinchazón o secreción en el sitio del catéter',
  'Dificultad para respirar o dolor en el pecho',
  'La bomba no avanza o el goteo se detiene',
  'La bolsa tiene aspecto diferente al habitual',
]

export default function CuidadosNP() {
  return (
    <div className="space-y-6">
      {/* Intro */}
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle size={24} className="text-red-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-800 text-lg">Lo que protege su vida en casa</p>
            <p className="text-red-600 text-base mt-1 leading-relaxed">
              Estos errores son los más comunes en NP domiciliaria y los más prevenibles. Compártalos también con su cuidador.
            </p>
          </div>
        </div>
      </div>

      {/* Lista de prohibiciones */}
      <div className="space-y-3">
        {prohibiciones.map((item, i) => (
          <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="bg-red-100 rounded-full p-1.5 flex-shrink-0">
              <XCircle size={22} className="text-red-500" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-base leading-snug">{item.titulo}</p>
              <p className="text-slate-500 text-base mt-1.5 leading-relaxed">{item.detalle}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Señales que no puede ignorar */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-5">
        <p className="font-bold text-amber-800 text-lg mb-4">Llame de inmediato si nota:</p>
        <div className="space-y-3">
          {señalesInmediatas.map((s, i) => (
            <div key={i} className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 text-base leading-snug">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Regla de oro */}
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <CheckCircle size={22} className="text-teal-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-teal-800 text-base">Regla de oro</p>
            <p className="text-teal-700 text-base mt-1 leading-relaxed">
              Si algo no luce bien, no suena bien o no se siente bien: <strong>detenga la infusión y llame</strong>. Su equipo prefiere atender una duda que tratar una complicación.
            </p>
          </div>
        </div>
      </div>

      <p className="text-center text-slate-400 text-sm pb-2">
        Basado en guías ESPEN 2023 y protocolos hospitalarios de NP domiciliaria.
      </p>
    </div>
  )
}
