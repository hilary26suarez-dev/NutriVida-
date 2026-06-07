import { useState } from 'react'
import NavBar from '../components/NavBar'
import {
  BookOpen,
  Calculator,
  FlaskConical,
  GitBranch,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react'

// ─── Utility ────────────────────────────────────────────────────────────────

function r(n, d = 1) {
  return Math.round(n * 10 ** d) / 10 ** d
}

// ─── Formula Step Display ────────────────────────────────────────────────────

function PasoCalculo({ numero, titulo, formula, sustitucion, resultado, color = 'teal', nota }) {
  const colores = {
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', num: 'bg-teal-600', titulo: 'text-teal-800', res: 'text-teal-700' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', num: 'bg-blue-600', titulo: 'text-blue-800', res: 'text-blue-700' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-200', num: 'bg-violet-600', titulo: 'text-violet-800', res: 'text-violet-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', num: 'bg-amber-500', titulo: 'text-amber-800', res: 'text-amber-700' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', num: 'bg-emerald-600', titulo: 'text-emerald-800', res: 'text-emerald-700' },
  }
  const c = colores[color] || colores.teal

  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-5`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`${c.num} text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0`}>
          {numero}
        </div>
        <p className={`font-bold text-base ${c.titulo}`}>{titulo}</p>
      </div>
      <div className="bg-white rounded-xl p-4 font-mono text-sm space-y-1 border border-slate-100">
        <p className="text-slate-500">{formula}</p>
        <p className="text-slate-600">= {sustitucion}</p>
        <p className={`font-bold text-base ${c.res}`}>= {resultado}</p>
      </div>
      {nota && (
        <p className="mt-3 text-sm text-slate-500 flex items-start gap-2">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          {nota}
        </p>
      )}
    </div>
  )
}

// ─── Accordion ──────────────────────────────────────────────────────────────

function Seccion({ titulo, icono: Icono, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        {Icono && <Icono size={20} className="text-teal-600 flex-shrink-0" />}
        <span className="font-bold text-slate-800 text-base flex-1">{titulo}</span>
        {open ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-4">{children}</div>}
    </div>
  )
}

// ─── Píldora de dato ─────────────────────────────────────────────────────────

function Dato({ label, valor, color = 'teal' }) {
  const paleta = {
    teal: 'bg-teal-50 text-teal-700 border-teal-200',
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    violet: 'bg-violet-50 text-violet-700 border-violet-200',
  }
  return (
    <div className={`border rounded-xl p-3 ${paleta[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-0.5">{label}</p>
      <p className="font-bold text-base">{valor}</p>
    </div>
  )
}

// ─── Tab: Fundamentos ────────────────────────────────────────────────────────

function Fundamentos() {
  return (
    <div className="space-y-4">
      <Seccion titulo="¿Qué es la Nutrición Parenteral?" icono={BookOpen} defaultOpen>
        <p className="text-slate-600 text-base leading-relaxed">
          La nutrición parenteral (NP) es la administración intravenosa de todos los nutrientes necesarios para mantener el metabolismo cuando el tracto gastrointestinal no puede usarse. La mezcla contiene aminoácidos, dextrosa, lípidos, electrolitos, vitaminas y oligoelementos en una sola bolsa (3-en-1 o "todo en uno").
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Dato label="NP Central" valor="Vena cava superior · Osmolaridad libre" color="teal" />
          <Dato label="NP Periférica" valor="Vena periférica · ≤ 900 mOsm/L" color="blue" />
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
          <p className="font-bold text-slate-700 text-sm mb-2">Indicaciones principales</p>
          <ul className="space-y-1.5 text-slate-600 text-sm">
            {['Síndrome de intestino corto', 'Enfermedad de Crohn activa grave', 'Fístulas enterocutáneas de alto gasto',
              'Íleo postoperatorio prolongado (> 7 días)', 'Oncología con tracto gastrointestinal no funcional',
              'Prematuridad extrema (neonatología)'].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle size={14} className="text-teal-500 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Seccion>

      <Seccion titulo="Macronutrientes y su función" icono={FlaskConical}>
        <div className="space-y-4">
          <div className="border-l-4 border-teal-400 pl-4">
            <p className="font-bold text-teal-800 text-base">Aminoácidos (proteínas)</p>
            <p className="text-slate-600 text-sm mt-1 leading-relaxed">Fuente nitrogenada para síntesis proteica, cicatrización y función inmune. Concentraciones habituales: 8.5–15 %. Producidos por fermentación microbiana de <em>Corynebacterium glutamicum</em>.</p>
            <p className="text-slate-500 text-sm mt-1">Rango clínico: 0.8 – 2.0 g/kg/día · Aporte calórico: 4 kcal/g</p>
          </div>
          <div className="border-l-4 border-amber-400 pl-4">
            <p className="font-bold text-amber-800 text-base">Dextrosa (glucosa)</p>
            <p className="text-slate-600 text-sm mt-1 leading-relaxed">Principal fuente energética. Concentraciones: 5–70 %. La dextrosa monohidratada aporta 3.4 kcal/g (no 4 kcal/g como glucosa oral). VIG máximo adulto: 5 mg/kg/min.</p>
          </div>
          <div className="border-l-4 border-violet-400 pl-4">
            <p className="font-bold text-violet-800 text-base">Emulsión lipídica</p>
            <p className="text-slate-600 text-sm mt-1 leading-relaxed">Las emulsiones SMOF (soja, TCM, oliva, pescado) combinan omega-3 y omega-6 para modular inflamación. Aportan 9 kcal/g. La emulsión al 20 % es iso-osmótica (~350 mOsm/L).</p>
            <p className="text-slate-500 text-sm mt-1">Máx: 2.5 g/kg/día · Velocidad máx: 0.1 g/kg/h</p>
          </div>
        </div>
      </Seccion>

      <Seccion titulo="Micronutrientes, electrolitos y oligoelementos" icono={FlaskConical}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-teal-50 text-teal-700">
                <th className="text-left p-3 rounded-l-lg font-semibold">Componente</th>
                <th className="text-left p-3 font-semibold">Rango adulto/día</th>
                <th className="text-left p-3 rounded-r-lg font-semibold">Consideración clave</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                ['Sodio (Na⁺)', '1–2 mEq/kg', 'Ajustar en hipernatremia / edema'],
                ['Potasio (K⁺)', '1–2 mEq/kg', 'Monitorear en falla renal; riesgo arritmia'],
                ['Fósforo (PO₄)', '20–40 mmol', 'Crítico: riesgo de síndrome de realimentación'],
                ['Calcio (Ca²⁺)', '10–15 mEq', 'Ca × P < 200 (precipitación)'],
                ['Magnesio (Mg²⁺)', '8–24 mEq', 'Hipomagnesemia frecuente en NP prolongada'],
                ['Vitaminas A/C/E/K', 'Preparado estándar', 'Vitamina K puede interferir con anticoagulantes'],
                ['Zinc, cobre, selenio', 'Multitrace estándar', 'Zinc extra en ostomías de alto gasto'],
              ].map(([comp, rango, nota], i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-700">{comp}</td>
                  <td className="p-3 text-teal-700 font-mono text-xs">{rango}</td>
                  <td className="p-3 text-slate-500">{nota}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Seccion>
    </div>
  )
}

// ─── Tab: Calculadora Educativa ──────────────────────────────────────────────

const condiciones = {
  normal:   { label: 'Sin estrés metabólico', factor: 1.2, prot: [0.8, 1.0] },
  leve:     { label: 'Estrés leve (cirugía menor, infección leve)', factor: 1.3, prot: [1.0, 1.2] },
  moderado: { label: 'Estrés moderado (trauma, sepsis leve)', factor: 1.4, prot: [1.2, 1.5] },
  severo:   { label: 'Estrés severo (quemados, sepsis grave, TCE)', factor: 1.5, prot: [1.5, 2.0] },
  renal:    { label: 'Insuficiencia renal (sin diálisis)', factor: 1.2, prot: [0.6, 0.8] },
  dialisis: { label: 'Diálisis / TRRC activa', factor: 1.3, prot: [1.2, 1.5] },
}

function CalculadoraEducativa() {
  const [form, setForm] = useState({ peso: '', talla: '', edad: '', sexo: 'M', condicion: 'normal' })
  const [resultado, setResultado] = useState(null)

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }))

  const calcular = () => {
    const P = parseFloat(form.peso)
    const A = parseFloat(form.talla)
    const E = parseFloat(form.edad)
    if (!P || !A || !E || P <= 0 || A <= 0 || E <= 0) return

    const cond = condiciones[form.condicion]
    const ree =
      form.sexo === 'M'
        ? 66.5 + 13.75 * P + 5.003 * A - 6.775 * E
        : 655.1 + 9.563 * P + 1.85 * A - 4.676 * E

    const totalKcal = ree * cond.factor
    const [pMin, pMax] = cond.prot
    const protMin = pMin * P
    const protMax = pMax * P
    const protKcalMin = protMin * 4

    const kcalNoProteinicas = totalKcal - protKcalMin
    const glucosaG = r((kcalNoProteinicas * 0.65) / 3.4)
    const lipidosG = r((kcalNoProteinicas * 0.35) / 9)
    const vig = r((glucosaG * 1000) / (P * 1440), 2)

    const osmEstimada = r(glucosaG * 5.5 + r(protMin) * 8 + 154)

    setResultado({ P, A, E, ree: r(ree), totalKcal: r(totalKcal), factor: cond.factor,
      protMin: r(protMin), protMax: r(protMax), protKcalMin: r(protKcalMin),
      glucosaG, lipidosG, vig, osmEstimada, condLabel: cond.label,
      pMin, pMax, sexo: form.sexo })
  }

  return (
    <div className="space-y-5">
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <p className="text-blue-800 font-bold text-base mb-1">Calculadora paso a paso</p>
        <p className="text-blue-600 text-sm leading-relaxed">
          Ingrese los datos del paciente y vea cómo se calcula cada requerimiento con la fórmula completa. Modo educativo — no para uso clínico directo.
        </p>
      </div>

      {/* Formulario */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Peso (kg)</label>
            <input type="number" placeholder="ej: 70" value={form.peso}
              onChange={e => set('peso', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-teal-400 bg-slate-50" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Talla (cm)</label>
            <input type="number" placeholder="ej: 170" value={form.talla}
              onChange={e => set('talla', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-teal-400 bg-slate-50" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Edad (años)</label>
            <input type="number" placeholder="ej: 45" value={form.edad}
              onChange={e => set('edad', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-teal-400 bg-slate-50" />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1.5">Sexo</label>
            <select value={form.sexo} onChange={e => set('sexo', e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-teal-400 bg-slate-50">
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1.5">Condición clínica</label>
          <select value={form.condicion} onChange={e => set('condicion', e.target.value)}
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:border-teal-400 bg-slate-50">
            {Object.entries(condiciones).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        <button onClick={calcular}
          className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-xl text-base transition-colors flex items-center justify-center gap-2">
          <Calculator size={20} />
          Calcular paso a paso
        </button>
      </div>

      {/* Resultados */}
      {resultado && (
        <div className="space-y-4">
          <div className="bg-teal-600 text-white rounded-2xl p-4 text-center">
            <p className="text-teal-200 text-sm font-medium mb-1">Paciente: {resultado.P} kg · {resultado.A} cm · {resultado.E} años · {resultado.sexo === 'M' ? 'Masculino' : 'Femenino'}</p>
            <p className="font-bold text-lg">{resultado.condLabel}</p>
          </div>

          <PasoCalculo
            numero="1" color="teal"
            titulo={`Gasto Energético en Reposo — Harris-Benedict (${resultado.sexo === 'M' ? 'Hombre' : 'Mujer'})`}
            formula={resultado.sexo === 'M'
              ? 'REE = 66.5 + (13.75 × P) + (5.003 × A) - (6.775 × edad)'
              : 'REE = 655.1 + (9.563 × P) + (1.850 × A) - (4.676 × edad)'}
            sustitucion={resultado.sexo === 'M'
              ? `66.5 + (13.75 × ${resultado.P}) + (5.003 × ${resultado.A}) - (6.775 × ${resultado.E})`
              : `655.1 + (9.563 × ${resultado.P}) + (1.850 × ${resultado.A}) - (4.676 × ${resultado.E})`}
            resultado={`${resultado.ree} kcal/día`}
          />

          <PasoCalculo
            numero="2" color="blue"
            titulo="Requerimiento calórico total (con factor de estrés)"
            formula="GET = REE × Factor de estrés"
            sustitucion={`${resultado.ree} × ${resultado.factor}`}
            resultado={`${resultado.totalKcal} kcal/día`}
            nota={`Factor ${resultado.factor} corresponde a: ${resultado.condLabel}`}
          />

          <PasoCalculo
            numero="3" color="emerald"
            titulo="Proteínas"
            formula={`Proteínas = ${resultado.pMin}–${resultado.pMax} g/kg/día × peso`}
            sustitucion={`${resultado.pMin}–${resultado.pMax} × ${resultado.P} kg`}
            resultado={`${resultado.protMin}–${resultado.protMax} g/día  (${resultado.protKcalMin}–${r(resultado.protMax * 4)} kcal de proteína)`}
          />

          <PasoCalculo
            numero="4" color="amber"
            titulo="Dextrosa — con control del VIG"
            formula="Glucosa (g) = (kcal no proteínicas × 65%) ÷ 3.4 kcal/g"
            sustitucion={`(${r(resultado.totalKcal - resultado.protKcalMin)} × 0.65) ÷ 3.4`}
            resultado={`${resultado.glucosaG} g/día`}
            nota={`VIG = ${resultado.vig} mg/kg/min ${resultado.vig > 5 ? '⚠️ Supera el máximo de 5 mg/kg/min — reducir dosis' : '✓ Dentro del rango seguro (≤ 5 mg/kg/min)'}`}
          />

          <PasoCalculo
            numero="5" color="violet"
            titulo="Lípidos"
            formula="Lípidos (g) = (kcal no proteínicas × 35%) ÷ 9 kcal/g"
            sustitucion={`(${r(resultado.totalKcal - resultado.protKcalMin)} × 0.35) ÷ 9`}
            resultado={`${resultado.lipidosG} g/día  (máx recomendado: ${r(resultado.P * 2.5)} g/día)`}
            nota={resultado.lipidosG > resultado.P * 2.5 ? `⚠️ Supera 2.5 g/kg/día — ajustar distribución calórica` : undefined}
          />

          <PasoCalculo
            numero="6" color="teal"
            titulo="Osmolaridad estimada (simplificada)"
            formula="Osm ≈ (AA g × 8) + (Dextrosa g × 5.5) + electrolitos base"
            sustitucion={`(${resultado.protMin} × 8) + (${resultado.glucosaG} × 5.5) + 154`}
            resultado={`≈ ${resultado.osmEstimada} mOsm/L → ${resultado.osmEstimada > 900 ? '🔴 Vía CENTRAL obligatoria' : '🟢 Compatible con vía periférica'}`}
            nota="Esta fórmula es una estimación educativa. La osmolalidad real depende de todos los aditivos."
          />

          {/* Resumen compacto */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
            <p className="font-bold text-slate-700 text-base mb-3">Resumen del perfil diario</p>
            <div className="grid grid-cols-2 gap-3">
              <Dato label="Energía total" valor={`${resultado.totalKcal} kcal`} color="teal" />
              <Dato label="Proteínas" valor={`${resultado.protMin}–${resultado.protMax} g`} color="teal" />
              <Dato label="Dextrosa" valor={`${resultado.glucosaG} g`} color="amber" />
              <Dato label="Lípidos" valor={`${resultado.lipidosG} g`} color="violet" />
              <Dato label="VIG" valor={`${resultado.vig} mg/kg/min`} color={resultado.vig > 5 ? 'red' : 'blue'} />
              <Dato label="Osmolaridad" valor={`≈ ${resultado.osmEstimada} mOsm/L`} color={resultado.osmEstimada > 900 ? 'red' : 'blue'} />
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <p className="text-amber-700 text-sm leading-relaxed">
              <span className="font-bold">Nota académica: </span>
              Estos cálculos son una estimación inicial. En la práctica clínica se ajustan según balance nitrogenado, glucometría, perfil de lípidos y función renal/hepática del paciente.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Estabilidad ────────────────────────────────────────────────────────

function Estabilidad() {
  return (
    <div className="space-y-4">
      <Seccion titulo="Osmolalidad y acceso venoso" icono={FlaskConical} defaultOpen>
        <p className="text-slate-600 text-base leading-relaxed">
          La osmolalidad determina si la NP puede administrarse por una vena periférica. Concentraciones hiperosmolares dañan el endotelio venoso y causan flebitis química.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <Dato label="Periférica (seguro)" valor="≤ 900 mOsm/L" color="teal" />
          <Dato label="Central (obligatorio)" valor="> 900 mOsm/L" color="red" />
        </div>
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 font-mono text-sm">
          <p className="text-slate-500 text-xs mb-2 font-sans font-semibold">Fórmula simplificada:</p>
          <p>Osm ≈ (AA g/L × 8)</p>
          <p>    + (Dextrosa g/L × 5.5)</p>
          <p>    + (Na mEq/L × 2)</p>
          <p>    + (K mEq/L × 2)</p>
          <p>    + otros electrolitos</p>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed">Los lípidos son iso-osmóticos (≈ 350 mOsm/L) y no elevan significativamente la osmolalidad total de la mezcla 3-en-1.</p>
      </Seccion>

      <Seccion titulo="Producto Ca × P — precipitación" icono={AlertTriangle}>
        <p className="text-slate-600 text-base leading-relaxed">
          La precipitación de fosfato de calcio es un riesgo letal en NP. El precipitado puede pasar a la circulación y causar embolia pulmonar.
        </p>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="font-bold text-red-800 text-base mb-2">Límite de seguridad</p>
          <p className="font-mono text-red-700 text-base">Ca (mEq/L) × P (mmol/L) &lt; 200</p>
          <p className="text-red-600 text-sm mt-2">Muchas instituciones usan &lt; 150 como margen de seguridad adicional.</p>
        </div>
        <div className="space-y-2 text-slate-600 text-sm">
          <p className="flex items-start gap-2"><CheckCircle size={14} className="text-teal-500 flex-shrink-0 mt-0.5" />Los aminoácidos actúan como quelantes y aumentan el límite de solubilidad del Ca-P.</p>
          <p className="flex items-start gap-2"><CheckCircle size={14} className="text-teal-500 flex-shrink-0 mt-0.5" />pH más ácido (pH 5-6 en bolsas sin bicarbonato) favorece la solubilidad del fosfato.</p>
          <p className="flex items-start gap-2"><CheckCircle size={14} className="text-teal-500 flex-shrink-0 mt-0.5" />El calcio debe añadirse al final, con agitación, y antes de los fosfatos si es posible.</p>
          <p className="flex items-start gap-2"><AlertTriangle size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />El EDUS calcula automáticamente este producto y alerta si se supera el límite institucional.</p>
        </div>
      </Seccion>

      <Seccion titulo="Estabilidad de la emulsión lipídica" icono={FlaskConical}>
        <p className="text-slate-600 text-base leading-relaxed">
          Las emulsiones lipídicas son sistemas termodinámicamente inestables. La coalescencia (fusión de gotas de grasa) puede causar embolia grasa.
        </p>
        <div className="grid grid-cols-1 gap-3">
          {[
            { factor: 'pH', efecto: 'pH &lt; 5 o &gt; 8 desestabiliza la emulsión. Rango seguro: 5.5–8.0' },
            { factor: 'Cationes divalentes (Ca²⁺, Mg²⁺)', efecto: 'Concentraciones elevadas reducen el potencial zeta y promueven coalescencia.' },
            { factor: 'Temperatura', efecto: 'La emulsión debe mantenerse entre 2–8 °C hasta 24–48 h antes del uso.' },
            { factor: 'Luz UV', efecto: 'Degrada vitaminas liposolubles y puede oxidar los ácidos grasos poliinsaturados.' },
          ].map((item, i) => (
            <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <p className="font-semibold text-slate-700 text-sm">{item.factor}</p>
              <p className="text-slate-500 text-sm mt-0.5">{item.efecto}</p>
            </div>
          ))}
        </div>
      </Seccion>
    </div>
  )
}

// ─── Tab: Flujo CCSS ─────────────────────────────────────────────────────────

function FlujoCCSS() {
  const pasos = [
    {
      num: 1, titulo: 'Prescripción médica en EDUS',
      desc: 'El médico ingresa al módulo de NP en el EDUS y completa: datos del paciente, macronutrientes (g/kg/día), electrolitos, vitaminas y vía de acceso. El sistema aplica las guías institucionales (ASPEN/ESPEN/CCSS) y genera un cálculo inicial.',
      icon: '👨‍⚕️',
    },
    {
      num: 2, titulo: 'Validación farmacéutica',
      desc: 'El farmacéutico de la Unidad de Nutrición Parenteral (UNP) revisa la prescripción en su bandeja del EDUS. Verifica: dosis de macronutrientes, osmolalidad, producto Ca×P, compatibilidad fisicoquímica. Puede modificar y deja constancia digital.',
      icon: '💊',
    },
    {
      num: 3, titulo: 'Generación de hoja de preparación',
      desc: 'Una vez validada, el EDUS genera automáticamente: fórmula maestra con volúmenes exactos por insumo, etiquetas con código de barras para cada bolsa (nombre, composición, fecha de caducidad, velocidad de infusión) y orden para el técnico en farmacia.',
      icon: '📋',
    },
    {
      num: 4, titulo: 'Preparación (cabina de flujo laminar)',
      desc: 'En hospitales de alta complejidad, las etiquetas se escanean y los datos se envían a compounders automáticos (Baxter ExactaMix, B. Braun APEX) que dosifican cada ingrediente con precisión. En centros más pequeños, la preparación es manual con doble control.',
      icon: '🧪',
    },
    {
      num: 5, titulo: 'Control de calidad y liberación',
      desc: 'El farmacéutico realiza la verificación final: inspección visual, gravimetría (pesaje) y revisión del código de barras. El lote de cada insumo queda registrado y asociado al paciente en el EDUS para trazabilidad total.',
      icon: '✅',
    },
    {
      num: 6, titulo: 'Dispensación y cadena de frío',
      desc: 'La bolsa se almacena a 2–8 °C hasta su entrega. Para NP domiciliaria, el paciente retira las bolsas de la farmacia hospitalaria y las transporta en frío. La caducidad es de 5–7 días en refrigeración.',
      icon: '❄️',
    },
  ]

  return (
    <div className="space-y-4">
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
        <p className="text-teal-800 text-base leading-relaxed">
          Desde 2020–2021 la CCSS implementó el módulo de NP en el EDUS, primero en hospitales nacionales y luego en toda la red. Esto reemplazó las hojas de cálculo manuales y estandarizó el proceso.
        </p>
      </div>

      <div className="space-y-3">
        {pasos.map((paso) => (
          <div key={paso.num} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start gap-4">
            <div className="bg-teal-50 border border-teal-200 rounded-xl w-12 h-12 flex items-center justify-center text-xl flex-shrink-0">
              {paso.icon}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">Paso {paso.num}</span>
                <p className="font-bold text-slate-800 text-base">{paso.titulo}</p>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed">{paso.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
        <p className="font-bold text-slate-700 text-base mb-3">El rol del farmacéutico en la CCSS</p>
        <p className="text-slate-600 text-sm leading-relaxed mb-3">
          El farmacéutico ya no hace los cálculos manualmente — el EDUS lo hace. Su rol es el de <strong>validador experto</strong>: interpreta los resultados, ajusta la terapia a la fisiología del paciente, garantiza la calidad del preparado estéril y documenta cada intervención.
        </p>
        <div className="grid grid-cols-2 gap-2 text-sm">
          {['Verificación clínica', 'Compatibilidad fisicoquímica', 'Control de osmolalidad', 'Supervisión de preparación', 'Trazabilidad de insumos', 'Seguimiento domiciliario'].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-600">
              <CheckCircle size={14} className="text-teal-500 flex-shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

const tabs = [
  { id: 'fundamentos', label: 'Fundamentos', icon: BookOpen },
  { id: 'calculadora', label: 'Calculadora', icon: Calculator },
  { id: 'estabilidad', label: 'Estabilidad', icon: FlaskConical },
  { id: 'flujo', label: 'Flujo CCSS', icon: GitBranch },
]

export default function Estudiante() {
  const [activeTab, setActiveTab] = useState('fundamentos')

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
            NutriVida Biotech · Módulo Educativo
          </div>
          <h1 className="text-3xl font-bold text-slate-900 leading-tight">Nutrición Parenteral</h1>
          <p className="text-slate-500 mt-1 text-base">
            Fundamentos, cálculos paso a paso y flujo clínico para estudiantes de Farmacia, Medicina y Nutrición.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
          <p className="text-amber-800 text-sm leading-relaxed">
            <span className="font-bold">Herramienta educativa — </span>
            Los cálculos son orientativos. Toda prescripción de NP debe ser realizada y validada por profesionales de salud calificados.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold transition-colors flex-shrink-0 ${
                  activeTab === id
                    ? 'bg-violet-50 text-violet-700 border-b-2 border-violet-600'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </div>
          <div className="p-5">
            {activeTab === 'fundamentos' && <Fundamentos />}
            {activeTab === 'calculadora' && <CalculadoraEducativa />}
            {activeTab === 'estabilidad' && <Estabilidad />}
            {activeTab === 'flujo' && <FlujoCCSS />}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          Basado en ESPEN 2023 · ASPEN 2022 · Protocolos CCSS Costa Rica
        </p>
      </div>
    </div>
  )
}
