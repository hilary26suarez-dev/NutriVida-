import { useState } from 'react'
import NavBar from '../components/NavBar'
import {
  BookOpen, Calculator, ChevronDown, ChevronLeft, ChevronRight, ChevronUp,
  CheckCircle, AlertTriangle, ExternalLink, FlaskConical, GitBranch, Info,
  Users, Heart, Microscope, Stethoscope, Pill,
} from 'lucide-react'

const ATLAS_URL = 'https://atlas-proteico.vercel.app/'

function PortalAtlas() {
  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-7 text-white text-center">
        <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Microscope size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Atlas Bioinformático Interactivo de NP</h2>
        <p className="text-violet-200 text-base leading-relaxed max-w-sm mx-auto mb-6">
          Visualización 3D de proteínas y enzimas clave que median la respuesta metabólica del paciente ante la NP. Bioinformática estructural al servicio de la clínica.
        </p>
        <a
          href={ATLAS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-white text-violet-700 font-bold px-6 py-3 rounded-xl hover:bg-violet-50 transition-colors text-base"
        >
          Abrir el Atlas <ExternalLink size={18} />
        </a>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { emoji: '🧬', titulo: 'Lipoproteína Lipasa', desc: 'Metabolismo de lípidos en NP' },
          { emoji: '🔵', titulo: 'Glucocinasa', desc: 'Sensor de glucosa, hiperglucemia' },
          { emoji: '⚡', titulo: 'Na⁺/K⁺-ATPasa', desc: 'Síndrome de realimentación' },
          { emoji: '🟡', titulo: 'Albúmina sérica', desc: 'Transporte y estado nutricional' },
          { emoji: '💉', titulo: 'Insulina', desc: 'Regulación metabólica en NP' },
        ].map((p, i) => (
          <div key={i} className={`bg-slate-50 border border-slate-200 rounded-xl p-4 ${i === 4 ? 'col-span-2' : ''}`}>
            <span className="text-2xl mb-2 block">{p.emoji}</span>
            <p className="font-bold text-slate-700 text-sm">{p.titulo}</p>
            <p className="text-slate-400 text-xs mt-0.5">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="bg-violet-50 border border-violet-200 rounded-2xl p-4 flex items-start gap-3">
        <Info size={18} className="text-violet-500 flex-shrink-0 mt-0.5" />
        <p className="text-violet-700 text-sm leading-relaxed">
          El Atlas es una plataforma independiente con visualizaciones 3D cargadas directamente desde el RCSB Protein Data Bank. Requiere conexión a internet y abre en una nueva pestaña.
        </p>
      </div>
    </div>
  )
}

// ─── Lema ────────────────────────────────────────────────────────────────────

function LemaEquipo() {
  return (
    <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-5 text-white mb-5">
      <p className="font-bold text-lg leading-tight text-center">
        Un equipo multidisciplinario unido para salvar vidas
      </p>
      <div className="flex items-center justify-center gap-2 mt-3 flex-wrap">
        {[
          { label: 'Farmacia', color: 'bg-violet-400' },
          { label: 'Medicina', color: 'bg-blue-400' },
          { label: 'Nutrición', color: 'bg-emerald-400' },
          { label: 'Enfermería', color: 'bg-pink-400' },
        ].map((c, i, arr) => (
          <span key={c.label} className="flex items-center gap-2">
            <span className={`${c.color} text-white text-xs font-bold px-3 py-1.5 rounded-full`}>{c.label}</span>
            {i < arr.length - 1 && <span className="text-teal-300 font-bold">+</span>}
          </span>
        ))}
      </div>
      <p className="text-teal-200 text-sm text-center mt-3 leading-relaxed">
        Cada carrera es una pieza esencial. Juntos garantizan que el paciente reciba su NP de forma segura, eficaz y humana.
      </p>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function r(n, d = 1) { return Math.round(n * 10 ** d) / 10 ** d }

function Acordeon({ titulo, icono: Icono, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-slate-50 transition-colors">
        {Icono && <Icono size={18} className="text-teal-600 flex-shrink-0" />}
        <span className="font-bold text-slate-800 text-base flex-1">{titulo}</span>
        {open ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
      </button>
      {open && <div className="px-5 pb-5 space-y-3">{children}</div>}
    </div>
  )
}

function Dato({ label, valor, color = 'teal' }) {
  const p = { teal: 'bg-teal-50 text-teal-700 border-teal-200', blue: 'bg-blue-50 text-blue-700 border-blue-200', amber: 'bg-amber-50 text-amber-700 border-amber-200', red: 'bg-red-50 text-red-700 border-red-200', violet: 'bg-violet-50 text-violet-700 border-violet-200', emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
  return (
    <div className={`border rounded-xl p-3 ${p[color] || p.teal}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70 mb-0.5">{label}</p>
      <p className="font-bold text-base">{valor}</p>
    </div>
  )
}

function PasoCalculo({ numero, titulo, formula, sustitucion, resultado, color = 'teal', nota }) {
  const c = {
    teal: { bg: 'bg-teal-50', border: 'border-teal-200', num: 'bg-teal-600', titulo: 'text-teal-800', res: 'text-teal-700' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', num: 'bg-amber-500', titulo: 'text-amber-800', res: 'text-amber-700' },
    violet: { bg: 'bg-violet-50', border: 'border-violet-200', num: 'bg-violet-600', titulo: 'text-violet-800', res: 'text-violet-700' },
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', num: 'bg-blue-600', titulo: 'text-blue-800', res: 'text-blue-700' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', num: 'bg-emerald-600', titulo: 'text-emerald-800', res: 'text-emerald-700' },
  }[color] || {}
  return (
    <div className={`${c.bg} border ${c.border} rounded-2xl p-5`}>
      <div className="flex items-start gap-3 mb-3">
        <div className={`${c.num} text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0`}>{numero}</div>
        <p className={`font-bold text-base ${c.titulo}`}>{titulo}</p>
      </div>
      <div className="bg-white rounded-xl p-4 font-mono text-sm space-y-1 border border-slate-100">
        <p className="text-slate-500">{formula}</p>
        <p className="text-slate-600">= {sustitucion}</p>
        <p className={`font-bold text-base ${c.res}`}>= {resultado}</p>
      </div>
      {nota && <p className="mt-3 text-sm text-slate-500 flex items-start gap-2"><Info size={14} className="flex-shrink-0 mt-0.5" />{nota}</p>}
    </div>
  )
}

// ─── FARMACIA ─────────────────────────────────────────────────────────────────

const condicionesF = {
  normal:   { label: 'Sin estrés', factor: 1.2, prot: [0.8, 1.0] },
  leve:     { label: 'Estrés leve', factor: 1.3, prot: [1.0, 1.2] },
  moderado: { label: 'Estrés moderado', factor: 1.4, prot: [1.2, 1.5] },
  severo:   { label: 'Estrés severo', factor: 1.5, prot: [1.5, 2.0] },
  renal:    { label: 'IRC sin diálisis', factor: 1.2, prot: [0.6, 0.8] },
}

function FarmaciaCalculadora() {
  const [form, setForm] = useState({ peso: '', talla: '', edad: '', sexo: 'M', condicion: 'normal' })
  const [res, setRes] = useState(null)
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }))
  const calcular = () => {
    const P = parseFloat(form.peso), A = parseFloat(form.talla), E = parseFloat(form.edad)
    if (!P || !A || !E) return
    const cond = condicionesF[form.condicion]
    const ree = form.sexo === 'M' ? 66.5 + 13.75*P + 5.003*A - 6.775*E : 655.1 + 9.563*P + 1.85*A - 4.676*E
    const get = ree * cond.factor
    const [pMin] = cond.prot
    const protG = r(pMin * P), protKcal = r(protG * 4)
    const npCal = r(get - protKcal)
    const dexG = r(npCal * 0.65 / 3.4), lipG = r(npCal * 0.35 / 9)
    const vig = r(dexG * 1000 / (P * 1440), 2)
    const osm = r(protG * 8 + dexG * 5.5 + 154)
    setRes({ P, A, E, ree: r(ree), get: r(get), factor: cond.factor, pMin, pMax: cond.prot[1],
      protMin: r(cond.prot[0]*P), protMax: r(cond.prot[1]*P), protKcal, dexG, lipG, vig, osm, condLabel: cond.label, sexo: form.sexo })
  }
  return (
    <div className="space-y-4">
      <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[['peso','Peso (kg)','ej: 70'],['talla','Talla (cm)','ej: 170'],['edad','Edad (años)','ej: 45']].map(([k,l,p]) => (
            <div key={k} className={k === 'edad' ? '' : ''}>
              <label className="block text-sm font-semibold text-slate-600 mb-1">{l}</label>
              <input type="number" placeholder={p} value={form[k]} onChange={e => set(k, e.target.value)}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:border-teal-400 bg-slate-50" />
            </div>
          ))}
          <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Sexo</label>
            <select value={form.sexo} onChange={e => set('sexo', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:border-teal-400 bg-slate-50">
              <option value="M">Masculino</option><option value="F">Femenino</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-semibold text-slate-600 mb-1">Condición clínica</label>
          <select value={form.condicion} onChange={e => set('condicion', e.target.value)} className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-base focus:outline-none focus:border-teal-400 bg-slate-50">
            {Object.entries(condicionesF).map(([k,v]) => <option key={k} value={k}>{v.label}</option>)}
          </select>
        </div>
        <button onClick={calcular} className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl text-base transition-colors flex items-center justify-center gap-2">
          <Calculator size={18} /> Calcular con fórmulas
        </button>
      </div>
      {res && (
        <div className="space-y-3">
          <div className="bg-violet-600 text-white rounded-2xl p-4 text-center">
            <p className="text-violet-200 text-sm">{res.P} kg · {res.A} cm · {res.E} años · {res.sexo === 'M' ? 'M' : 'F'} · {res.condLabel}</p>
          </div>
          <PasoCalculo numero="1" color="violet" titulo={`Harris-Benedict (${res.sexo === 'M' ? 'Hombre' : 'Mujer'})`}
            formula={res.sexo === 'M' ? 'REE = 66.5 + (13.75×P) + (5.003×A) - (6.775×edad)' : 'REE = 655.1 + (9.563×P) + (1.850×A) - (4.676×edad)'}
            sustitucion={res.sexo === 'M' ? `66.5+(13.75×${res.P})+(5.003×${res.A})-(6.775×${res.E})` : `655.1+(9.563×${res.P})+(1.850×${res.A})-(4.676×${res.E})`}
            resultado={`${res.ree} kcal/día`} />
          <PasoCalculo numero="2" color="teal" titulo="GET con factor de estrés" formula="GET = REE × Factor"
            sustitucion={`${res.ree} × ${res.factor}`} resultado={`${res.get} kcal/día`} nota={`Factor ${res.factor} = ${res.condLabel}`} />
          <PasoCalculo numero="3" color="emerald" titulo="Proteínas" formula={`${res.pMin}–${res.pMax} g/kg/día × ${res.P} kg`}
            sustitucion={`rango ${res.pMin}–${res.pMax}`} resultado={`${res.protMin}–${res.protMax} g/día`} />
          <PasoCalculo numero="4" color="amber" titulo="Dextrosa (65% kcal no prot.)" formula="g = (kcalNP × 0.65) ÷ 3.4"
            sustitucion={`(${r(res.get-res.protKcal)} × 0.65) ÷ 3.4`} resultado={`${res.dexG} g/día — VIG: ${res.vig} mg/kg/min ${res.vig > 5 ? '⚠️ supera máx' : '✓'}`} />
          <PasoCalculo numero="5" color="violet" titulo="Lípidos (35% kcal no prot.)" formula="g = (kcalNP × 0.35) ÷ 9"
            sustitucion={`(${r(res.get-res.protKcal)} × 0.35) ÷ 9`} resultado={`${res.lipG} g/día (máx ${r(res.P*2.5)} g/día)`} />
          <PasoCalculo numero="6" color="teal" titulo="Osmolalidad estimada" formula="Osm ≈ (AA×8) + (Dex×5.5) + base"
            sustitucion={`(${res.protMin}×8) + (${res.dexG}×5.5) + 154`}
            resultado={`≈ ${res.osm} mOsm/L → ${res.osm > 900 ? '🔴 Vía CENTRAL' : '🟢 Periférica posible'}`} />
        </div>
      )}
    </div>
  )
}

function FarmaciaEstabilidad() {
  return (
    <div className="space-y-4">
      <Acordeon titulo="Osmolalidad y acceso venoso" icono={FlaskConical} defaultOpen>
        <div className="grid grid-cols-2 gap-3">
          <Dato label="Periférica" valor="≤ 900 mOsm/L" color="teal" />
          <Dato label="Central" valor="> 900 mOsm/L" color="red" />
        </div>
        <div className="bg-slate-50 border rounded-xl p-4 font-mono text-sm">
          <p className="font-sans text-xs font-bold text-slate-500 mb-2">Fórmula simplificada:</p>
          <p>Osm ≈ (AA g/L × 8) + (Dextrosa g/L × 5.5)</p>
          <p>    + (Na mEq/L × 2) + (K mEq/L × 2)</p>
        </div>
      </Acordeon>
      <Acordeon titulo="Producto Ca × P — precipitación letal" icono={AlertTriangle}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="font-mono text-red-700 text-base font-bold">Ca (mEq/L) × P (mmol/L) &lt; 200</p>
          <p className="text-red-600 text-sm mt-1">Límite institucional CCSS y mayoría de centros: &lt; 150 para margen de seguridad.</p>
        </div>
        {['Los aminoácidos quelatan el calcio y aumentan la solubilidad del Ca-P.',
          'pH ácido (5–6 en bolsas sin bicarbonato) favorece la solubilidad del fosfato.',
          'El EDUS calcula y alerta automáticamente cuando se supera el límite.',
          'Agregar el calcio al final, con agitación, y separado del fosfato en el proceso.'].map((t, i) => (
          <div key={i} className="flex items-start gap-2 text-slate-600 text-sm">
            <CheckCircle size={14} className="text-teal-500 flex-shrink-0 mt-0.5" />{t}
          </div>
        ))}
      </Acordeon>
      <Acordeon titulo="Estabilidad de la emulsión lipídica" icono={FlaskConical}>
        {[
          { factor: 'pH', efecto: 'Rango seguro: 5.5–8.0. Fuera de este rango puede haber coalescencia.' },
          { factor: 'Ca²⁺ y Mg²⁺', efecto: 'Concentraciones altas reducen el potencial zeta y desestabilizan la emulsión.' },
          { factor: 'Temperatura', efecto: 'Conservar 2–8 °C. La emulsión no debe congelarse ni exponerse a calor.' },
          { factor: 'Luz UV', efecto: 'Degrada vitaminas liposolubles y oxida PUFA. Usar bolsas con cobertura opaca.' },
        ].map((it, i) => (
          <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <p className="font-semibold text-slate-700 text-sm">{it.factor}</p>
            <p className="text-slate-500 text-sm mt-0.5">{it.efecto}</p>
          </div>
        ))}
      </Acordeon>
      <Acordeon titulo="Preparación estéril — área blanca">
        <p className="text-slate-600 text-base leading-relaxed">La NP se prepara en cabinas de flujo laminar (ISO 5 / clase A) ubicadas en zona limpia (ISO 7 / clase B). El técnico en farmacia sigue el orden de adición de componentes para evitar incompatibilidades. En hospitales con compounder automático (Baxter ExactaMix, B. Braun APEX), las instrucciones del EDUS se envían directamente al equipo.</p>
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          {['ISO 5 — flujo laminar', 'Orden controlado Ca/P', 'Gravimetría de verificación'].map((p, i) => (
            <div key={i} className="bg-violet-50 border border-violet-100 rounded-xl py-3 px-2">
              <p className="font-bold text-violet-700">{p}</p>
            </div>
          ))}
        </div>
      </Acordeon>
    </div>
  )
}

function FarmaciaFlujoCCSS() {
  return <FlujoCCSS carrera="farmacia" />
}

// ─── MEDICINA ─────────────────────────────────────────────────────────────────

function MedicinaIndicaciones() {
  return (
    <div className="space-y-4">
      <Acordeon titulo="Indicaciones establecidas de NP" icono={Stethoscope} defaultOpen>
        <p className="text-slate-600 text-base leading-relaxed">La NP está indicada cuando el tracto gastrointestinal no es funcional, accesible o seguro por un período significativo (generalmente &gt; 7 días en adultos). <strong>Siempre</strong> es preferible la vía enteral o oral cuando sea factible.</p>
        <div className="space-y-2">
          {[
            { cond: 'Síndrome de intestino corto', detalle: 'Principal indicación de NP crónica. < 100–150 cm de intestino delgado funcional.' },
            { cond: 'Fístulas enterocutáneas alto gasto', detalle: '> 500 mL/día. Reposo intestinal mientras se planea manejo quirúrgico.' },
            { cond: 'Obstrucción intestinal no resoluble', detalle: 'Cuando la cirugía no es inmediata y el paciente no puede tolerar enteral.' },
            { cond: 'Enfermedad de Crohn activa grave', detalle: 'Cuando la nutrición enteral no es tolerada o está contraindicada.' },
            { cond: 'Quimioterapia con mucositis severa', detalle: 'Grado 3–4 que impide ingesta oral o enteral por más de 7–10 días.' },
            { cond: 'Post-op de cirugía GI mayor', detalle: 'Cuando se anticipa ayuno > 7 días o el íleo es prolongado.' },
          ].map((it, i) => (
            <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <p className="font-bold text-slate-700 text-sm">{it.cond}</p>
              <p className="text-slate-500 text-sm mt-0.5">{it.detalle}</p>
            </div>
          ))}
        </div>
      </Acordeon>
      <Acordeon titulo="Contraindicaciones relativas" icono={AlertTriangle}>
        {['Tracto GI funcional y accesible — siempre preferir nutrición enteral.',
          'Pronóstico que no justifica el riesgo (terminalidad con confort como objetivo).',
          'Paciente hemodinámicamente inestable (iniciar NP solo tras estabilización).',
          'Ayuno esperado < 5–7 días en paciente previamente bien nutrido.',
          'Acceso venoso central con riesgo muy elevado.'].map((t, i) => (
          <div key={i} className="flex items-start gap-2 text-slate-600 text-base">
            <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />{t}
          </div>
        ))}
      </Acordeon>
      <Acordeon titulo="Monitoreo del paciente con NP" icono={BookOpen}>
        <p className="text-slate-600 text-sm mb-3">Frecuencia orientativa — ajustar según estabilidad clínica:</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-blue-50 text-blue-700">
              <th className="text-left p-3 rounded-l-lg font-semibold">Parámetro</th>
              <th className="text-left p-3 font-semibold">Inicio</th>
              <th className="text-left p-3 rounded-r-lg font-semibold">Estable</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {[['Glucemia','c/ 6h','1× día'],['Electrolitos (Na,K,Mg,P)','Diario','2–3×/sem'],['BUN/creatinina','Diario','Semanal'],['Hemograma','Diario','Semanal'],['Función hepática','2–3×/sem','Mensual'],['Triglicéridos','Basal + c/72h','Semanal'],['Balance nitrogenado','Semanal','Mensual']].map(([p,i,e], idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-700">{p}</td>
                  <td className="p-3 text-blue-600 font-mono text-xs">{i}</td>
                  <td className="p-3 text-slate-500">{e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Acordeon>
      <Acordeon titulo="Complicaciones principales" icono={AlertTriangle}>
        <div className="space-y-3">
          {[
            { tipo: 'Infecciosas', items: ['Bacteremia asociada a catéter (CLABSI) — la más grave', 'Infección del sitio de inserción', 'Fungemia (Candida) en pacientes inmunodeprimidos'] },
            { tipo: 'Metabólicas', items: ['Hiperglucemia — riesgo en UCI, diabetes, sepsis', 'Síndrome de realimentación (hipoP, hipoK, hipoMg) — especialmente en desnutrición grave', 'Enfermedad hepática asociada a NP (IFALD) — en NP prolongada', 'Hiperlipidemia por infusión de lípidos excesiva'] },
            { tipo: 'Mecánicas', items: ['Neumotórax en inserción de CVC', 'Trombosis venosa relacionada a catéter', 'Oclusión del catéter', 'Extravasación y tromboflebitis (vía periférica)'] },
          ].map((grupo, i) => (
            <div key={i}>
              <p className="font-bold text-slate-700 text-sm mb-2">{grupo.tipo}</p>
              {grupo.items.map((it, j) => (
                <div key={j} className="flex items-start gap-2 text-slate-600 text-sm py-1">
                  <AlertTriangle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />{it}
                </div>
              ))}
            </div>
          ))}
        </div>
      </Acordeon>
    </div>
  )
}

// ─── NUTRICIÓN ────────────────────────────────────────────────────────────────

function NutricionEvaluacion() {
  return (
    <div className="space-y-4">
      <Acordeon titulo="Tamizaje nutricional" icono={BookOpen} defaultOpen>
        <p className="text-slate-600 text-base leading-relaxed mb-3">El tamizaje identifica el riesgo nutricional antes de iniciar NP. En la CCSS se usan principalmente NRS-2002 (adultos hospitalizados) y MUST (comunitario/ambulatorio).</p>
        <div className="space-y-3">
          {[
            { herr: 'NRS-2002', cuando: 'Adultos hospitalizados', puntaje: '≥ 3 = riesgo nutricional. Indicar intervención.', dim: 'Estado nutricional + severidad de enfermedad + edad > 70' },
            { herr: 'MUST', cuando: 'Comunidad y ambulatorio', puntaje: '0 = bajo riesgo, 1 = riesgo medio, ≥ 2 = alto riesgo', dim: 'IMC + pérdida de peso + enfermedad aguda' },
            { herr: 'NUTRIC Score', cuando: 'UCI', puntaje: '≥ 5 (sin IL-6) = alto riesgo. Inicio precoz de soporte nutricional.', dim: 'Edad, APACHE II, SOFA, comorbilidades' },
          ].map((h, i) => (
            <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded-full">{h.herr}</span>
                <span className="text-slate-500 text-xs">{h.cuando}</span>
              </div>
              <p className="text-slate-600 text-sm">{h.dim}</p>
              <p className="text-emerald-700 font-semibold text-sm mt-1">{h.puntaje}</p>
            </div>
          ))}
        </div>
      </Acordeon>
      <Acordeon titulo="Parámetros de evaluación nutricional" icono={Calculator}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-emerald-50 text-emerald-700">
              <th className="text-left p-3 rounded-l-lg font-semibold">Parámetro</th>
              <th className="text-left p-3 font-semibold">Referencia</th>
              <th className="text-left p-3 rounded-r-lg font-semibold">Limitaciones</th>
            </tr></thead>
            <tbody className="divide-y divide-slate-100">
              {[['IMC','18.5–24.9 kg/m²','No refleja composición corporal'],['Albúmina','3.5–5.0 g/dL','Reactante de fase aguda — no es marcador nutricional puro'],['Prealbúmina (transtirretina)','18–45 mg/dL','Mejor para seguimiento a corto plazo'],['PCR','< 5 mg/L','Refleja inflamación; inversamente relacionada con prealbúmina'],['Balance nitrogenado','> 0 = anabolismo','N ingerido(g) - N excretado(g de urea+4)'],['Fuerza de agarre (dinamometría)','≥ 30 kg (H), ≥ 20 kg (M)','Marcador funcional — no depende de inflamación']].map(([p,r,l], i) => (
                <tr key={i} className="hover:bg-slate-50">
                  <td className="p-3 font-medium text-slate-700">{p}</td>
                  <td className="p-3 text-emerald-700 font-mono text-xs">{r}</td>
                  <td className="p-3 text-slate-400 text-xs">{l}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Acordeon>
      <Acordeon titulo="Síndrome de realimentación" icono={AlertTriangle}>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-3">
          <p className="font-bold text-red-800 text-base">Complicación metabólica grave al reiniciar la nutrición</p>
          <p className="text-red-700 text-sm mt-1 leading-relaxed">Ocurre al iniciar NP (o nutrición enteral) en pacientes con desnutrición grave, ayuno prolongado o alcoholismo crónico. La entrada de carbohidratos activa la insulina → captación celular de fosfato, potasio y magnesio → hipofosforemia, hipocalemia e hipomagnesemia severas.</p>
        </div>
        <p className="font-semibold text-slate-700 text-sm mb-2">Factores de riesgo:</p>
        {['IMC < 16 kg/m²', 'Pérdida de peso > 15% en 3–6 meses', 'Ayuno > 10 días', 'Alcoholismo crónico', 'Anorexia nerviosa'].map((t, i) => (
          <div key={i} className="flex items-start gap-2 text-slate-600 text-sm"><CheckCircle size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />{t}</div>
        ))}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mt-3">
          <p className="font-bold text-amber-800 text-sm">Prevención:</p>
          <p className="text-amber-700 text-sm mt-1">Iniciar con 10 kcal/kg/día (máx 20 kcal/kg/día) los primeros 2–3 días. Reponer tiamina (B1) ANTES de iniciar la NP. Monitorear electrolitos cada 6–12h el primer día.</p>
        </div>
      </Acordeon>
      <Acordeon titulo="Transición NP → Nutrición Enteral → Oral">
        <p className="text-slate-600 text-base leading-relaxed mb-3">La transición debe ser gradual para evitar desnutrición durante el cambio. El criterio principal es que la vía enteral/oral cubra al menos el 60% de los requerimientos antes de suspender la NP.</p>
        <div className="space-y-2">
          {['Iniciar NE o ingesta oral en cuanto el GI sea funcional, aunque sea parcialmente.',
            'Reducir la NP en un 25–50% por cada comida tolerada de modo significativo.',
            'Suspender la NP cuando el aporte oral o enteral cubre ≥ 60% de las necesidades por 2 días consecutivos.',
            'Monitorear el peso, la glucemia y los electrolitos durante la transición.',
            'En intestino corto: la adaptación intestinal puede tardar 1–2 años. La NP puede reducirse progresivamente.'].map((t, i) => (
            <div key={i} className="flex items-start gap-2 text-slate-600 text-sm"><CheckCircle size={13} className="text-emerald-500 flex-shrink-0 mt-0.5" />{t}</div>
          ))}
        </div>
      </Acordeon>
    </div>
  )
}

// ─── ENFERMERÍA ───────────────────────────────────────────────────────────────

function EnfermeriaContenido() {
  return (
    <div className="space-y-4">
      <Acordeon titulo="Técnica aséptica en administración de NP" icono={CheckCircle} defaultOpen>
        <div className="space-y-3">
          {[
            { paso: '1. Higiene de manos', detalle: 'Lavado quirúrgico o uso de alcohol gel al 70% antes de cualquier manipulación. Es la intervención más eficaz para prevenir CLABSI.' },
            { paso: '2. Preparar el campo estéril', detalle: 'Superficie limpia y desinfectada. Materiales abiertos sin contaminar la punta. Gorro, mascarilla y guantes según protocolo institucional.' },
            { paso: '3. Desinfección del conector', detalle: 'Frotar el conector needlefree con torunda de alcohol 70% durante 15 segundos con fricción activa. Dejar secar 15 segundos antes de conectar.' },
            { paso: '4. Verificación de la bolsa', detalle: 'Confirmar: nombre del paciente, fecha de elaboración, fecha de vencimiento, aspecto visual (homogéneo, sin partículas). No usar si hay dudas.' },
            { paso: '5. Purga de la tubuladura', detalle: 'Eliminar todo el aire antes de conectar. Una pequeña cantidad de aire puede causar embolia gaseosa en vía central.' },
            { paso: '6. Registro', detalle: 'Anotar hora de inicio, volumen de la bolsa, velocidad de infusión y estado del sitio de inserción al inicio.' },
          ].map((p, i) => (
            <div key={i} className="flex items-start gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4">
              <CheckCircle size={18} className="text-pink-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-slate-700 text-sm">{p.paso}</p>
                <p className="text-slate-500 text-sm mt-0.5 leading-relaxed">{p.detalle}</p>
              </div>
            </div>
          ))}
        </div>
      </Acordeon>
      <Acordeon titulo="Cuidados del catéter venoso central" icono={Heart}>
        {[
          { aspecto: 'Apósito', cuidado: 'Cambio cada 5–7 días con apósito transparente semipermeable, o antes si está húmedo, despegado o sucio. Usar clorhexidina en gel para limpieza del sitio.' },
          { aspecto: 'Conector needlefree', cuidado: 'Cambiar según protocolo institucional (generalmente cada 72–96 h). Limpiar siempre antes de usar.' },
          { aspecto: 'Tubuladura de NP', cuidado: 'Cambio cada 24 horas para la NP, dado el alto contenido en nutrientes que favorece el crecimiento bacteriano.' },
          { aspecto: 'Permeabilidad del catéter', cuidado: 'Flush con solución salina antes y después de la infusión. Heparinización según indicación. No forzar si hay resistencia.' },
          { aspecto: 'Restricciones en el lumen NP', cuidado: 'Idealmente dedicar un lumen exclusivo para la NP. No extraer sangre ni administrar otros medicamentos por el mismo lumen durante la infusión de NP.' },
        ].map((it, i) => (
          <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl p-3">
            <p className="font-semibold text-pink-700 text-sm">{it.aspecto}</p>
            <p className="text-slate-600 text-sm mt-0.5 leading-relaxed">{it.cuidado}</p>
          </div>
        ))}
      </Acordeon>
      <Acordeon titulo="Monitoreo durante la infusión">
        <p className="text-slate-600 text-sm mb-3">Controles mínimos durante la infusión de NP en paciente hospitalizado:</p>
        <div className="space-y-2">
          {[
            ['Cada 30 min (primeras 2h)', 'Signos vitales, sitio de inserción, flujo correcto'],
            ['Cada 1–2 horas', 'Temperatura, presión arterial, estado de conciencia'],
            ['Cada 4–6 horas', 'Glucometría capilar en paciente con riesgo de hiperglucemia'],
            ['Inicio y fin de cada bolsa', 'Registro de la hora, volumen infundido, aspecto del catéter'],
            ['Al detectar cambios', 'Enrojecimiento, fiebre, escalofríos, rechazo de flujo → notificar de inmediato'],
          ].map(([fr, acc], i) => (
            <div key={i} className="flex gap-3 bg-slate-50 border border-slate-200 rounded-xl p-3">
              <span className="bg-pink-100 text-pink-700 text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 h-fit">{fr}</span>
              <p className="text-slate-600 text-sm leading-relaxed">{acc}</p>
            </div>
          ))}
        </div>
      </Acordeon>
      <Acordeon titulo="Educación al paciente y familia para NP domiciliaria">
        <p className="text-slate-600 text-base leading-relaxed mb-3">La enfermería lidera el proceso educativo antes del alta. El paciente y cuidador deben demostrar competencia práctica antes de ir a casa.</p>
        <div className="space-y-2">
          {['Preparación del área y materiales (demostración práctica devuelta).',
            'Verificación visual de la bolsa — qué es normal y qué no.',
            'Conexión y desconexión con técnica aséptica.',
            'Programación y manejo básico de la bomba de infusión.',
            'Reconocimiento de señales de alarma y protocolo de acción.',
            'Cuidado del apósito y cuándo llamar al equipo.',
            'Gestión de residuos biopeligrosos en el hogar.',
            'Número de emergencia del equipo y del hospital.'].map((t, i) => (
            <div key={i} className="flex items-start gap-2 text-slate-600 text-sm"><CheckCircle size={13} className="text-pink-500 flex-shrink-0 mt-0.5" />{t}</div>
          ))}
        </div>
        <div className="bg-pink-50 border border-pink-200 rounded-xl p-3 mt-2">
          <p className="text-pink-700 text-sm font-bold">Regla de oro en educación al paciente:</p>
          <p className="text-pink-600 text-sm mt-0.5">"Diga uno, muestre uno, haga uno." El paciente o cuidador debe realizar el procedimiento supervisado antes del alta.</p>
        </div>
      </Acordeon>
    </div>
  )
}

// ─── Flujo CCSS (compartido) ──────────────────────────────────────────────────

function FlujoCCSS({ carrera }) {
  const enfasis = {
    farmacia: { pasos: [1, 2, 3, 4, 5], nota: 'El farmacéutico es el validador experto del sistema: interpreta los cálculos del EDUS, verifica la compatibilidad fisicoquímica y garantiza la calidad del preparado estéril.' },
    medicina: { pasos: [1, 5, 6], nota: 'El médico inicia el proceso prescribiendo en el EDUS con los datos clínicos del paciente. También monitorea la respuesta y decide cuándo transicionar o suspender la NP.' },
    nutricion: { pasos: [1, 5, 6], nota: 'El nutricionista define los requerimientos energéticos y proteicos, ajusta la prescripción según evolución metabólica y lidera la transición a alimentación enteral u oral.' },
    enfermeria: { pasos: [5, 6], nota: 'Enfermería administra la NP, monitorea al paciente, detecta complicaciones en tiempo real y educa al paciente y cuidador para el alta domiciliaria.' },
  }[carrera] || { pasos: [1,2,3,4,5,6], nota: '' }

  const pasos = [
    { num: 1, icon: '👨‍⚕️', titulo: 'Prescripción médica en EDUS', desc: 'El médico ingresa al módulo de NP en el EDUS. El sistema aplica guías ASPEN/ESPEN/CCSS y genera un cálculo inicial. El médico personaliza según el paciente.' },
    { num: 2, icon: '💊', titulo: 'Validación farmacéutica', desc: 'El farmacéutico revisa la prescripción: dosis, osmolalidad, producto Ca×P, compatibilidad fisicoquímica. Puede modificar y deja constancia digital de la intervención.' },
    { num: 3, icon: '📋', titulo: 'Generación de hoja de preparación', desc: 'El EDUS genera la fórmula maestra con volúmenes exactos, etiquetas con código de barras y la orden para el técnico en farmacia.' },
    { num: 4, icon: '🧪', titulo: 'Preparación estéril', desc: 'En cabina de flujo laminar (ISO 5). Con compounder automático en hospitales de alta complejidad. El farmacéutico supervisa y verifica el producto terminado.' },
    { num: 5, icon: '✅', titulo: 'Liberación y control de calidad', desc: 'Inspección visual, gravimetría y verificación de código de barras. Cada lote registrado en el EDUS vinculado al paciente para trazabilidad total.' },
    { num: 6, icon: '💉', titulo: 'Administración y seguimiento', desc: 'Enfermería administra con técnica aséptica, monitorea al paciente y registra el proceso. Nutrición y medicina ajustan la prescripción según evolución.' },
  ]

  return (
    <div className="space-y-4">
      {enfasis.nota && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4">
          <p className="text-teal-800 text-base leading-relaxed">{enfasis.nota}</p>
        </div>
      )}
      {pasos.map((paso) => (
        <div key={paso.num} className={`bg-white border rounded-2xl p-5 flex items-start gap-4 transition-all ${
          enfasis.pasos.includes(paso.num) ? 'border-teal-300 ring-1 ring-teal-100' : 'border-slate-200 opacity-70'
        }`}>
          <div className="bg-teal-50 border border-teal-200 rounded-xl w-12 h-12 flex items-center justify-center text-xl flex-shrink-0">{paso.icon}</div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${enfasis.pasos.includes(paso.num) ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-500'}`}>Paso {paso.num}</span>
              {enfasis.pasos.includes(paso.num) && <span className="text-xs font-bold text-teal-600">Tu rol activo</span>}
              <p className="font-bold text-slate-800 text-sm">{paso.titulo}</p>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">{paso.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Definición de carreras ───────────────────────────────────────────────────

const carreras = {
  farmacia: {
    label: 'Farmacia', emoji: '💊',
    descripcion: 'Cálculo, validación, estabilidad y preparación estéril',
    color: { bg: 'bg-violet-50', border: 'border-violet-300', iconBg: 'bg-violet-600', texto: 'text-violet-800', activo: 'bg-violet-600' },
    tabs: [
      { id: 'calculos', label: 'Cálculos', icon: Calculator, contenido: () => <FarmaciaCalculadora /> },
      { id: 'estabilidad', label: 'Estabilidad', icon: FlaskConical, contenido: () => <FarmaciaEstabilidad /> },
      { id: 'biotecnologia', label: 'Atlas 3D', icon: Microscope, contenido: () => <PortalAtlas /> },
      { id: 'flujo', label: 'Flujo CCSS', icon: GitBranch, contenido: () => <FlujoCCSS carrera="farmacia" /> },
    ],
  },
  medicina: {
    label: 'Medicina', emoji: '🩺',
    descripcion: 'Indicaciones, prescripción, monitoreo y complicaciones',
    color: { bg: 'bg-blue-50', border: 'border-blue-300', iconBg: 'bg-blue-600', texto: 'text-blue-800', activo: 'bg-blue-600' },
    tabs: [
      { id: 'indicaciones', label: 'Indicaciones', icon: Stethoscope, contenido: () => <MedicinaIndicaciones /> },
      { id: 'biotecnologia', label: 'Atlas 3D', icon: Microscope, contenido: () => <PortalAtlas /> },
      { id: 'flujo', label: 'Flujo CCSS', icon: GitBranch, contenido: () => <FlujoCCSS carrera="medicina" /> },
    ],
  },
  nutricion: {
    label: 'Nutrición', emoji: '🥗',
    descripcion: 'Evaluación, requerimientos, transición y seguimiento',
    color: { bg: 'bg-emerald-50', border: 'border-emerald-300', iconBg: 'bg-emerald-600', texto: 'text-emerald-800', activo: 'bg-emerald-600' },
    tabs: [
      { id: 'evaluacion', label: 'Evaluación', icon: BookOpen, contenido: () => <NutricionEvaluacion /> },
      { id: 'calculos', label: 'Requerimientos', icon: Calculator, contenido: () => <FarmaciaCalculadora /> },
      { id: 'biotecnologia', label: 'Atlas 3D', icon: Microscope, contenido: () => <PortalAtlas /> },
      { id: 'flujo', label: 'Flujo CCSS', icon: GitBranch, contenido: () => <FlujoCCSS carrera="nutricion" /> },
    ],
  },
  enfermeria: {
    label: 'Enfermería', emoji: '💉',
    descripcion: 'Administración, cuidados del catéter y educación al paciente',
    color: { bg: 'bg-pink-50', border: 'border-pink-300', iconBg: 'bg-pink-500', texto: 'text-pink-800', activo: 'bg-pink-500' },
    tabs: [
      { id: 'administracion', label: 'Administración', icon: CheckCircle, contenido: () => <EnfermeriaContenido /> },
      { id: 'biotecnologia', label: 'Atlas 3D', icon: Microscope, contenido: () => <PortalAtlas /> },
      { id: 'flujo', label: 'Flujo CCSS', icon: GitBranch, contenido: () => <FlujoCCSS carrera="enfermeria" /> },
    ],
  },
}

// ─── Página principal ─────────────────────────────────────────────────────────

export default function Estudiante() {
  const [carreraId, setCarreraId] = useState(null)
  const [activeTab, setActiveTab] = useState(null)

  const carrera = carreraId ? carreras[carreraId] : null

  const seleccionar = (id) => {
    setCarreraId(id)
    setActiveTab(carreras[id].tabs[0].id)
  }

  const volver = () => { setCarreraId(null); setActiveTab(null) }

  const tabActual = carrera?.tabs.find(t => t.id === activeTab)

  return (
    <div className="min-h-screen bg-slate-50">
      <NavBar />
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* ── Selector de carrera ─────────────────────────────────────── */}
        {!carreraId && (
          <div>
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-violet-100 text-violet-700 px-3 py-1 rounded-full text-xs font-semibold mb-3">
                NutriVida Biotech · Módulo Educativo
              </div>
              <h1 className="text-3xl font-bold text-slate-900 leading-tight">Para estudiantes de salud</h1>
              <p className="text-slate-500 mt-1 text-base leading-relaxed">
                Contenido clínico relevante para tu carrera, con base en guías ESPEN 2023, ASPEN 2022 y protocolos CCSS.
              </p>
            </div>

            <LemaEquipo />

            <p className="text-slate-600 font-semibold text-base mb-4">¿Cuál es tu carrera?</p>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(carreras).map(([id, c]) => (
                <button
                  key={id}
                  onClick={() => seleccionar(id)}
                  className={`text-left rounded-2xl p-5 border-2 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 active:scale-95 ${c.color.bg} ${c.color.border}`}
                >
                  <span className="text-4xl mb-3 block">{c.emoji}</span>
                  <p className={`font-bold text-lg leading-tight mb-1 ${c.color.texto}`}>{c.label}</p>
                  <p className="text-slate-500 text-sm leading-snug">{c.descripcion}</p>
                </button>
              ))}
            </div>

            <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-5">
              <p className="font-bold text-slate-700 text-base mb-3">Contenido compartido por todas las carreras</p>
              <div className="space-y-2">
                {[
                  '🧬 Biotecnología de los componentes NP — disponible en todas las carreras',
                  '⚙️ Flujo clínico completo EDUS-CCSS — con énfasis en el rol de cada profesión',
                  '📐 Calculadora educativa paso a paso — con fórmulas completas y VIG',
                ].map((t, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-600 text-sm">
                    <span className="text-teal-500 font-bold mt-0.5">→</span>{t}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-4">
              Herramienta educativa — no sustituye la formación clínica supervisada
            </p>
          </div>
        )}

        {/* ── Vista de carrera ─────────────────────────────────────────── */}
        {carreraId && carrera && (
          <div>
            <button onClick={volver} className="flex items-center gap-2 text-teal-600 font-semibold text-base mb-5 hover:text-teal-800 transition-colors py-2">
              <ChevronLeft size={20} />
              Cambiar carrera
            </button>

            <LemaEquipo />

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              {/* Career header */}
              <div className={`${carrera.color.bg} border-b ${carrera.color.border} px-5 py-4 flex items-center gap-3`}>
                <span className="text-3xl">{carrera.emoji}</span>
                <div>
                  <h2 className={`font-bold text-xl ${carrera.color.texto}`}>{carrera.label}</h2>
                  <p className="text-slate-500 text-sm">{carrera.descripcion}</p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 overflow-x-auto">
                {carrera.tabs.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`flex items-center gap-2 px-4 py-3.5 text-sm font-semibold transition-colors flex-shrink-0 ${
                      activeTab === id
                        ? `${carrera.color.bg} ${carrera.color.texto} border-b-2 ${carrera.color.border}`
                        : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-5">
                {tabActual && tabActual.contenido()}
              </div>
            </div>

            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <p className="text-amber-700 text-sm leading-relaxed">
                <span className="font-bold">Herramienta educativa — </span>
                Los cálculos son orientativos. Toda prescripción de NP debe ser realizada y validada por profesionales calificados con base en la evaluación clínica individual del paciente.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
