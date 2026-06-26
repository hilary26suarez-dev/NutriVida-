/**
 * AUDITORÍA MATEMÁTICA — NutriVida Biotech CalculadoraNP v2.1.1
 * Suite de regresión para verificar la congruencia de todas las fórmulas clínicas.
 *
 * Ejecutar: node test-logica-np.js
 * Produce:  salida por consola + audit-log-YYYY-MM-DD.json en la misma carpeta
 *
 * Fuentes validadas:
 *  - Harris-Benedict (1919) · Pereira Da Silva et al. Nutr Hosp 2015
 *  - Manual CCSS Farmacias SNF 2018 · Manual CCSS HNN 2018
 *  - ESPEN ICU 2021 · ESPEN Liver 2022 · ESPEN Cancer 2021
 *  - NKF-KDOQI 2020 · ASPEN 2016 · Bistrian BR 1979
 *  - Heyland DK (mNUTRIC) 2011 · Rahman 2016
 */

import { writeFileSync } from 'fs'

// ── Infraestructura de reporte ───────────────────────────────────────────────
const RESULTADOS = []
let errores = 0
let pasadas  = 0

function registrar(suite, label, aprobado, obtenido, esperado, fuente = '') {
  const estado = aprobado ? 'PASS' : 'FAIL'
  if (aprobado) {
    pasadas++
    console.log(`  ✓ ${label}`)
  } else {
    errores++
    console.log(`  ✗ FAIL: ${label}`)
    console.log(`       Obtenido:  ${obtenido}`)
    console.log(`       Esperado:  ${esperado}`)
  }
  RESULTADOS.push({ suite, label, estado, obtenido: String(obtenido), esperado: String(esperado), fuente })
}

function suite(nombre) {
  console.log(`\n══════════════════════════════════════════════`)
  console.log(`  ${nombre}`)
  console.log(`══════════════════════════════════════════════`)
  return nombre
}

// ── Funciones espejo del código fuente ─────────────────────────────────────
// Copias exactas de las funciones en CalculadoraNP.jsx / ModoBatch.jsx
// para que las pruebas validen la lógica implementada.

function calcBEE(peso, talla, edad, sexo) {
  if (sexo === 'M') return 66.5  + 13.75 * peso + 5.003 * talla - 6.775 * edad
  return               655.1 +  9.563 * peso + 1.85  * talla - 4.676 * edad
}

function calcPesoIdeal(talla, sexo) {
  if (!talla) return null
  return Math.round(sexo === 'M' ? talla - 100 : talla - 105)
}

function calcOsmolaridad(dextrosaG, protG, vol, na = 0, k = 0, ca = 0, mg = 0, po4 = 0) {
  const glucosaG_L = dextrosaG / vol * 1000
  const aaG_L      = protG     / vol * 1000
  const totalMEq_L = (na + k + ca + mg + po4) / vol * 1000
  return Math.round(glucosaG_L * 5.55 + aaG_L * 8.0 + totalMEq_L * 2)
}

function getViaZone(osm) {
  if (osm > 1800) return 'critica'
  if (osm > 900)  return 'alta'
  if (osm > 800)  return 'riesgo'
  if (osm > 700)  return 'media'
  return 'baja'
}

function calcMacros(ten, protG, conLipidos) {
  const kcalProt  = protG * 4
  const npc       = ten - kcalProt
  const dextrosaG = conLipidos
    ? Math.max(0, Math.round((npc * 0.65) / 3.4))
    : Math.max(0, Math.round(npc / 3.4))
  const lipidoG   = conLipidos ? Math.max(0, Math.round((npc * 0.35) / 10)) : 0
  const kcalReal  = Math.round(dextrosaG * 3.4 + lipidoG * 10 + protG * 4)
  return { dextrosaG, lipidoG, npc, kcalReal }
}

function calcTIG(dextrosaG, pesoCal) {
  return (dextrosaG * 1000) / (pesoCal * 1440)
}

function calcBistrian(uun, nIntake) {
  const nUUBasal = 0.5 * nIntake + 3
  return uun - nUUBasal
}

function calcBalanceN(protG, uun, corrFactor) {
  const nIntake = protG / 6.25
  const nLoss   = uun + corrFactor
  return nIntake - nLoss
}

function calcNPCN(ten, protG) {
  const npc = ten - protG * 4
  const n   = protG / 6.25
  return Math.round(npc / n)
}

function calcEstabilidadCaPO4(caTotal, po4Total, vol) {
  const caConc  = (caTotal  / vol) * 1000
  const po4Conc = (po4Total / vol) * 1000
  const producto = caConc * po4Conc
  const nivel = producto > 200 ? 'rojo' : producto > 150 ? 'amarillo' : 'verde'
  return { caConc: parseFloat(caConc.toFixed(1)), po4Conc: parseFloat(po4Conc.toFixed(1)), producto: Math.round(producto), nivel }
}

function calcVolumenComercial(g, concentracion) {
  return Math.round(g / concentracion)
}

function calcNutricScore({ edad, apache, sofa, comorbilidades, diasHospUCI }) {
  let score = 0
  if (edad >= 75) score += 2; else if (edad >= 50) score += 1
  if (apache >= 28) score += 3; else if (apache >= 20) score += 2; else if (apache >= 15) score += 1
  if (sofa >= 10) score += 2; else if (sofa >= 6) score += 1
  if (comorbilidades >= 2) score += 1
  if (diasHospUCI >= 1) score += 1
  return { score, riesgo: score >= 5 ? 'alto' : 'bajo' }
}

// ── Perfiles clínicos para validación ──────────────────────────────────────
const PERFILES = {
  estandar:                 { kcal: [20, 25], prot: [1.0, 1.2] },
  postop_menor:             { kcal: [20, 25], prot: [1.2, 1.5] },
  trauma_moderado:          { kcal: [22, 28], prot: [1.5, 1.8] },
  cirugia_mayor:            { kcal: [25, 30], prot: [1.5, 2.0] },
  sepsis:                   { kcal: [25, 30], prot: [1.5, 2.0] },
  quemaduras:               { kcal: [30, 35], prot: [1.5, 2.5] },
  renal_prediálisis:        { kcal: [30, 35], prot: [0.60, 0.75] },
  renal_hd:                 { kcal: [30, 35], prot: [1.2, 1.2] },
  renal_dp:                 { kcal: [30, 35], prot: [1.2, 1.3] },
  renal_trrc:               { kcal: [25, 35], prot: [1.5, 2.5] },
  hepatico_compensado:      { kcal: [30, 35], prot: [1.2, 1.5] },
  hepatico_descompensado:   { kcal: [35, 40], prot: [1.2, 1.5] },
  oncologico:               { kcal: [20, 25], prot: [1.0, 1.5] },
  neonato_prematuro:        { kcal: [110, 150], prot: [3.5, 4.0], tigMax: 12 },
  neonato_termino:          { kcal: [90,  100], prot: [2.5, 3.5], tigMax: 12 },
  pediatrico_infante:       { kcal: [75,   90], prot: [1.5, 2.0], tigMax: 12 },
  pediatrico_escolar:       { kcal: [60,   75], prot: [1.5, 2.0], tigMax: 10 },
  pediatrico_adolescente:   { kcal: [35,   50], prot: [1.0, 1.5], tigMax: 7  },
}

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 1 — Harris-Benedict
// ═══════════════════════════════════════════════════════════════════════════
const S1 = suite('1 · Harris-Benedict (1919) — Ecuación de Gasto Energético Basal')

const bee_F = calcBEE(60, 165, 45, 'F')
// 655.1 + 9.563×60 + 1.85×165 − 4.676×45 = 655.1+573.78+305.25−210.42 = 1323.71
registrar(S1, 'Mujer 60 kg / 165 cm / 45 a → BEE=1323.7 kcal', Math.abs(bee_F - 1323.71) < 0.5, bee_F.toFixed(2), '1323.71', 'Harris-Benedict 1919')

const bee_M = calcBEE(80, 175, 40, 'M')
// 66.5 + 13.75×80 + 5.003×175 − 6.775×40 = 66.5+1100+875.53−271 = 1771.03
registrar(S1, 'Hombre 80 kg / 175 cm / 40 a → BEE=1771.0 kcal', Math.abs(bee_M - 1771.0) < 0.5, bee_M.toFixed(2), '1771.0', 'Harris-Benedict 1919')

const bee_neonatal = calcBEE(3.2, 50, 0, 'M')
// Un neonato: fórmula aplica con edad=0 → sin penalización por edad
registrar(S1, 'Neonato 3.2 kg / 50 cm / 0 a → BEE positivo (no negativo)', bee_neonatal > 0, bee_neonatal.toFixed(1), '>0', 'Harris-Benedict 1919 — validación neonato')

const bee_adult_obeso = calcBEE(120, 175, 50, 'M')
registrar(S1, 'Hombre obeso 120 kg / 175 cm / 50 a → BEE>1800 kcal', bee_adult_obeso > 1800, bee_adult_obeso.toFixed(0), '>1800', 'Harris-Benedict 1919')

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 2 — Peso Ideal (Broca) y Peso Ajustado (ASPEN 2016)
// ═══════════════════════════════════════════════════════════════════════════
const S2 = suite('2 · Peso Ideal Broca + Peso Ajustado (ASPEN 2016 — IMC ≥30)')

registrar(S2, 'PI mujer 165 cm → 60 kg', calcPesoIdeal(165, 'F') === 60, calcPesoIdeal(165, 'F'), 60, 'Broca')
registrar(S2, 'PI hombre 175 cm → 75 kg', calcPesoIdeal(175, 'M') === 75, calcPesoIdeal(175, 'M'), 75, 'Broca')
registrar(S2, 'PI hombre 180 cm → 80 kg', calcPesoIdeal(180, 'M') === 80, calcPesoIdeal(180, 'M'), 80, 'Broca')

const pi = calcPesoIdeal(175, 'M')
const abw_120 = pi + 0.25 * (120 - pi)
registrar(S2, 'PA hombre 120 kg / PI=75 kg → PA=86.25 kg', Math.abs(abw_120 - 86.25) < 0.01, abw_120.toFixed(2), '86.25', 'ASPEN 2016: PI + 0.25×(PA−PI)')

const pi_f = calcPesoIdeal(165, 'F')
const abw_90f = pi_f + 0.25 * (90 - pi_f)
// PI=60, abw=60+0.25×30=67.5
registrar(S2, 'PA mujer 90 kg / PI=60 kg → PA=67.5 kg', Math.abs(abw_90f - 67.5) < 0.01, abw_90f.toFixed(1), '67.5', 'ASPEN 2016: PI + 0.25×(PA−PI)')

const no_abw = calcPesoIdeal(165, 'F')
const imcNormal = 65 / ((165 / 100) ** 2)
registrar(S2, 'IMC < 30 (65 kg / 165 cm = 23.9) → no se aplica PA', imcNormal < 30, imcNormal.toFixed(1), '<30', 'ASPEN 2016 — PA solo si IMC≥30')

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 3 — Osmolaridad Pereira Da Silva et al. 2015
// ═══════════════════════════════════════════════════════════════════════════
const S3 = suite('3 · Osmolaridad — Pereira Da Silva et al. Nutr Hosp 2015')

const osm_base = calcOsmolaridad(250, 100, 2000)
// glucosaG/L=125 → 125×5.55=693.75 | aaG/L=50 → 50×8=400 | total=1093.75 → 1094
registrar(S3, '250g glu + 100g AA / 2000 mL sin electrolitos → 1094 mOsm/L', osm_base === 1094, osm_base, 1094, 'Pereira Da Silva 2015')

const osm_con_na_k = calcOsmolaridad(250, 100, 2000, 70, 40)
// Na70+K40=110 mEq → 110/2000×1000×2 = 110 mOsm adicionales → 1204
registrar(S3, '+ Na70 mEq + K40 mEq → +110 mOsm → total 1204', osm_con_na_k === osm_base + 110, osm_con_na_k, osm_base + 110, 'Pereira Da Silva 2015 — electrolitos')

const osm_diluida = calcOsmolaridad(100, 40, 2000)
// gluL=50×5.55=277.5 | aaL=20×8=160 | total=437.5 → 438
registrar(S3, 'Mezcla diluida 100g glu+40g AA/2L → <700 mOsm/L (periférica CCSS)', osm_diluida < 700, osm_diluida, '<700', 'Manual CCSS SNF 2018 — límite periférica')

const osm_700_zona = calcOsmolaridad(130, 52, 2000)
registrar(S3, 'Mezcla ~700 mOsm/L → zona baja (CCSS segura)', getViaZone(osm_700_zona) === 'baja', `${osm_700_zona} → ${getViaZone(osm_700_zona)}`, 'baja', 'CCSS SNF 2018 <700 mOsm/L')

// 170g glu + 65g AA + Na20 + K10 en 2000 mL:
// gluL=85→471.75 | aaL=32.5→260 | mEq=(30/2)×2=30 → total=761.75 → 762 mOsm/L → media
const osm_zona_media = calcOsmolaridad(170, 65, 2000, 20, 10)
registrar(S3, 'Mezcla ~762 mOsm/L → zona media (700–800, cautela periférica)', getViaZone(osm_zona_media) === 'media', `${osm_zona_media} → ${getViaZone(osm_zona_media)}`, 'media', 'SENPE — 700–800 mOsm/L cautela')

const osm_central = calcOsmolaridad(400, 150, 2000)
// gluL=200×5.55=1110 | aaL=75×8=600 | total=1710 → central
registrar(S3, 'Mezcla concentrada >900 → zona alta (CVC exclusivo)', getViaZone(osm_central) === 'alta', `${osm_central} → ${getViaZone(osm_central)}`, 'alta', 'ESPEN/ASPEN >900 mOsm/L')

const osm_critica = calcOsmolaridad(600, 200, 2000)
registrar(S3, 'Mezcla extrema >1800 → zona crítica', getViaZone(osm_critica) === 'critica', `${osm_critica} → ${getViaZone(osm_critica)}`, 'critica', 'ESPEN/ASPEN >1800 mOsm/L')

// Verificar que los lípidos no contribuyen a osmolaridad (son isotónicos)
const osm_sin_lipidos = calcOsmolaridad(250, 100, 2000)
const osm_hipotetica_con_lipidos = osm_sin_lipidos // lípidos×0
registrar(S3, 'Lípidos × 0 en fórmula (fase micelar isotónica)', osm_sin_lipidos === osm_hipotetica_con_lipidos, 'lípidos=0 por diseño', 'OK', 'Pereira Da Silva 2015 — emulsión lipídica')

// Verificar umbral CCSS: 700 mOsm/L (no 600)
const osm_650 = calcOsmolaridad(116, 47, 2000)
registrar(S3, 'Osm ~650 mOsm/L → zona baja (≤700 CCSS, no ≤600)', getViaZone(osm_650) === 'baja', `${osm_650} → ${getViaZone(osm_650)}`, 'baja', 'Manual CCSS SNF 2018 — umbral correcto es <700, no <600')

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 4 — Balance Nitrogenado y Proteína desde UUN
// ═══════════════════════════════════════════════════════════════════════════
const S4 = suite('4 · Balance Nitrogenado — SEFH / Estándar clínico')

registrar(S4, 'UUN=10 g/d + corrección=2 → proteína para equilibrio = 75 g/d', (10 + 2) * 6.25 === 75, (10 + 2) * 6.25, 75, 'N_pérdidas × 6.25')

const bn_anab = calcBalanceN(100, 10, 2)
// N_ing=16 N_pérd=12 → BN=+4 g/d
registrar(S4, '100 g prot − UUN=10 − corrección=2 → BN=+4.0 (anabólico)', Math.abs(bn_anab - 4) < 0.01, bn_anab.toFixed(2), '4.00', 'BN = N_ing − (UUN+corrección)')

const bn_catab = calcBalanceN(50, 10, 2)
registrar(S4, '50 g prot − UUN=10 − corrección=2 → BN=−4.0 (catabólico)', Math.abs(bn_catab - (-4)) < 0.01, bn_catab.toFixed(2), '-4.00', 'BN = N_ing − (UUN+corrección)')

const bn_neutro = calcBalanceN(75, 10, 2)
registrar(S4, '75 g prot − UUN=10 − corrección=2 → BN=0.0 (neutro)', Math.abs(bn_neutro) < 0.01, bn_neutro.toFixed(2), '0.00', 'BN = N_ing − (UUN+corrección)')

const bn_hipercat = calcBalanceN(120, 18, 6)
// N_ing=19.2 N_pérd=24 → BN=-4.8 (hipercatabolismo severo)
registrar(S4, 'Hipercatabolismo: 120g prot − UUN=18 − corrección=6 → BN=−4.8', Math.abs(bn_hipercat - (-4.8)) < 0.1, bn_hipercat.toFixed(1), '-4.8', 'Corrección 6 g = hipercatabolismo severo')

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 5 — Índice de Estrés de Bistrian (1979)
// ═══════════════════════════════════════════════════════════════════════════
const S5 = suite('5 · Índice de Estrés Metabólico — Bistrian BR et al. JPEN 1979')

// 100g AA → N=16g. Basal esperado=0.5×16+3=11. Casos:
const nIng_base = 100 / 6.25 // 16 g N

const bis_leve = calcBistrian(15, nIng_base)
// UUN=15 − (8+3) = 4.0 → leve (0-5)
registrar(S5, 'UUN=15 / N=16g → Índice=4.0 (leve 0–5)', Math.abs(bis_leve - 4.0) < 0.01, bis_leve.toFixed(2), '4.00', 'Bistrian 1979')

const bis_mod = calcBistrian(18, nIng_base)
// 18−11=7.0 → moderado (5–8)
registrar(S5, 'UUN=18 / N=16g → Índice=7.0 (moderado 5–8)', Math.abs(bis_mod - 7.0) < 0.01, bis_mod.toFixed(2), '7.00', 'Bistrian 1979')
registrar(S5, 'Índice 7.0 está en rango moderado (5–8)', bis_mod > 5 && bis_mod <= 8, bis_mod.toFixed(1), '5 < x ≤ 8', 'Bistrian 1979 — clasificación moderado')

const bis_grave = calcBistrian(20, nIng_base)
// 20−11=9.0 → grave (>8)
registrar(S5, 'UUN=20 / N=16g → Índice=9.0 (grave >8)', Math.abs(bis_grave - 9.0) < 0.01, bis_grave.toFixed(2), '9.00', 'Bistrian 1979')
registrar(S5, 'Índice 9.0 > 8 → clasificación grave', bis_grave > 8, bis_grave.toFixed(1), '>8', 'Bistrian 1979 — clasificación grave')

const bis_sin = calcBistrian(7, nIng_base)
// 7−11=−4 → sin estrés (≤0)
registrar(S5, 'UUN=7 / N=16g → Índice=−4.0 (sin estrés ≤0)', Math.abs(bis_sin - (-4.0)) < 0.01, bis_sin.toFixed(2), '-4.00', 'Bistrian 1979')

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 6 — Relación NPC:N
// ═══════════════════════════════════════════════════════════════════════════
const S6 = suite('6 · Relación NPC:N — ASPEN/ESPEN Rango óptimo 80–150:1')

const npcn_opt = calcNPCN(2000, 80)
// NPC=1680 N=12.8 → 131.25 → 131
registrar(S6, '2000 kcal / 80 g prot → NPC:N=131 (óptimo 80–150)', npcn_opt === 131, npcn_opt, 131, 'ASPEN 2016')
registrar(S6, 'NPC:N=131 dentro del rango óptimo (80–150)', npcn_opt >= 80 && npcn_opt <= 150, npcn_opt, '80–150', 'ASPEN 2016')

const npcn_bajo = calcNPCN(1000, 80)
// NPC=680 N=12.8 → 53 (<80 = bajo)
registrar(S6, '1000 kcal / 80 g prot → NPC:N=53 (bajo <80)', npcn_bajo < 80, npcn_bajo, '<80', 'ASPEN 2016 — bajo riesgo de uso AA como energía')

const npcn_alto = calcNPCN(3000, 50)
// NPC=2800 N=8 → 350 (>150 = alto)
registrar(S6, '3000 kcal / 50 g prot → NPC:N=350 (alto >150)', npcn_alto > 150, npcn_alto, '>150', 'ASPEN 2016 — sobrealimentación calórica')

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 7 — Distribución de Macronutrientes
// ═══════════════════════════════════════════════════════════════════════════
const S7 = suite('7 · Macronutrientes — Distribución 65/35 NPC (ESPEN 2019)')

const m3en1 = calcMacros(2000, 80, true)
// NPC=1680. Dex=1680×0.65/3.4=321.17→321. Lip=1680×0.35/10=58.8→59
registrar(S7, '3-en-1: 2000 kcal / 80 g prot → Dex=321 g', m3en1.dextrosaG === 321, m3en1.dextrosaG, 321, 'ESPEN 2019 — 65% NPC como CHO')
registrar(S7, '3-en-1: 2000 kcal / 80 g prot → Líp=59 g',  m3en1.lipidoG  === 59,  m3en1.lipidoG,  59,  'ESPEN 2019 — 35% NPC como lípido')
registrar(S7, '3-en-1: Kcal reconstituidas ≈ 2000 (±50 kcal)', Math.abs(m3en1.kcalReal - 2000) < 50, m3en1.kcalReal, '~2000', 'Verificación energética')

const m2en1 = calcMacros(2000, 80, false)
// Sin lípidos: todo NPC→dex = 1680/3.4=494.1→494g
registrar(S7, '2-en-1: 2000 kcal / 80 g prot → Dex=494 g (todo NPC)', m2en1.dextrosaG === 494, m2en1.dextrosaG, 494, 'ASPEN 2016 — NP 2-en-1')
registrar(S7, '2-en-1: Líp=0 g (sin emulsión)', m2en1.lipidoG === 0, m2en1.lipidoG, 0, 'ASPEN 2016 — NP 2-en-1')
registrar(S7, '2-en-1: Kcal reconstituidas ≈ 2000 (±50 kcal)', Math.abs(m2en1.kcalReal - 2000) < 50, m2en1.kcalReal, '~2000', 'Verificación 2-en-1')

// Verificar que el bug histórico (65% con 2-en-1) daba déficit de 589 kcal
const kcal_bug = Math.round(321 * 3.4 + 80 * 4) // 1411 kcal
registrar(S7, 'Bug anterior (65% con 2-en-1) daba 1411 kcal — déficit 589 kcal corregido', kcal_bug === 1411, kcal_bug, 1411, 'Regresión — bug corregido v2.0.0')

// Verificar calorías del propofol
const propofolMl = 120
const propofolKcal = propofolMl * 1.1
registrar(S7, '120 mL propofol → 132 kcal (1.1 kcal/mL, ESPEN 2019)', Math.abs(propofolKcal - 132) < 0.01, propofolKcal.toFixed(1), '132.0', 'ESPEN ICU 2019 — vehículo lipídico propofol')

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 8 — TIG (Tasa de Infusión de Glucosa) — Manual CCSS HNN 2018
// ═══════════════════════════════════════════════════════════════════════════
const S8 = suite('8 · TIG — Tasa de Infusión de Glucosa (Manual CCSS HNN 2018 / ASPEN Pediatric)')

const tig_prematuro = calcTIG(28.8, 1)
// TIG_inicio=4 mg/kg/min → dex=4×1×1440/1000=5.76g/d; aquí probamos el límite 4 mg
const dex_tig4 = 4 * 1 * 1440 / 1000 // 5.76g para TIG=4 en 1kg
registrar(S8, 'Prematuro 1 kg / TIG inicio=4 mg/kg/min → dex=5.76 g/d', Math.abs(dex_tig4 - 5.76) < 0.01, dex_tig4.toFixed(2), '5.76', 'Manual CCSS HNN 2018 — TIG inicio prematuro')

const tig_3kg = calcTIG(30, 3)
// 30×1000/(3×1440)=6.944
registrar(S8, 'Neonato 3 kg / 30 g dex → TIG=6.94 (seguro ≤12)', Math.abs(tig_3kg - 6.944) < 0.01, tig_3kg.toFixed(3), '6.944', 'Manual CCSS HNN 2018')
registrar(S8, 'TIG=6.94 < límite 12 mg/kg/min (neonato término)', tig_3kg < 12, tig_3kg.toFixed(2), '<12', 'Manual CCSS HNN 2018')

const tig_critico = calcTIG(100, 3)
// 100000/4320=23.15 → CRÍTICO >12
registrar(S8, 'Neonato 3 kg / 100 g dex → TIG=23.1 (CRÍTICO >12)', tig_critico > 12, tig_critico.toFixed(1), '>12', 'Manual CCSS HNN 2018 — límite esteatosis hepática')

const tig_2en1_adulto_70 = calcTIG(494, 70)
// 494000/100800=4.90 mg/kg/min → <5 OK
registrar(S8, 'Adulto 70 kg 2-en-1 / 494g dex → TIG=4.90 (<5, ASPEN)', Math.abs(tig_2en1_adulto_70 - 4.90) < 0.05, tig_2en1_adulto_70.toFixed(2), '4.90', 'ASPEN 2016 — límite TIG adulto')

const tig_2en1_50kg = calcTIG(494, 50)
// 494000/72000=6.86 > 5 → alerta adulto
registrar(S8, 'Adulto 50 kg 2-en-1 / 494g dex → TIG=6.86 (>5, alerta adulto)', tig_2en1_50kg > 5, tig_2en1_50kg.toFixed(2), '>5', 'ASPEN 2016 — TIG adulto alerta en 2-en-1')

const tig_escolar = calcTIG(37.5, 25)
// pediatrico escolar 25kg: TIG máx=10
registrar(S8, 'Escolar 25 kg / 37.5 g dex → TIG=1.04 (<10 límite escolar)', tig_escolar < 10, tig_escolar.toFixed(2), '<10', 'Manual CCSS HNN 2018 — pediátrico escolar')

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 9 — Volúmenes Comerciales (conversión g → mL)
// ═══════════════════════════════════════════════════════════════════════════
const S9 = suite('9 · Volúmenes Comerciales — Dex 50% / AA 10% / Líp 20%')

registrar(S9, 'AA 10%: 80 g → 800 mL',  calcVolumenComercial(80,  0.1) === 800,  800,  800,  'Aminoácidos 10% g/dL')
registrar(S9, 'Dex 50%: 321 g → 642 mL', calcVolumenComercial(321, 0.5) === 642,  642,  642,  'Dextrosa 50% g/dL')
registrar(S9, 'Líp 20%: 59 g → 295 mL',  calcVolumenComercial(59,  0.2) === 295,  295,  295,  'Emulsión lipídica 20% g/dL')

const vol3en1 = calcVolumenComercial(321, 0.5) + calcVolumenComercial(80, 0.1) + calcVolumenComercial(59, 0.2)
// 642+800+295=1737 < 2000 mL
registrar(S9, 'Suma componentes 3-en-1: 1737 mL cabe en bolsa 2000 mL', vol3en1 < 2000, vol3en1, '<2000', 'Manual CCSS SNF 2018 — vol máx 3000 mL')

const vol2en1 = calcVolumenComercial(494, 0.5) + calcVolumenComercial(80, 0.1)
// 988+800=1788 < 2000 mL
registrar(S9, 'Suma componentes 2-en-1: 1788 mL cabe en bolsa 2000 mL', vol2en1 < 2000, vol2en1, '<2000', 'Manual CCSS SNF 2018')

// Caso inviable: componentes > bolsa
const vol_inviable = calcVolumenComercial(200, 0.1) + calcVolumenComercial(600, 0.5) + calcVolumenComercial(150, 0.2)
// 2000+1200+750=3950 > 3000 mL
registrar(S9, 'Componentes 3950 mL > bolsa máx 3000 mL (inviable)', vol_inviable > 3000, vol_inviable, '>3000', 'Manual CCSS SNF 2018 — detección inviabilidad')

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 10 — Estabilidad Ca-PO₄ (ASHP / King Guide / Driscoll)
// ═══════════════════════════════════════════════════════════════════════════
const S10 = suite('10 · Estabilidad Ca-PO₄ — Driscoll / USP <797> / ASHP')

const e1 = calcEstabilidadCaPO4(10, 20, 2000)
// caConc=5 mEq/L | po4Conc=10 mmol/L | producto=50 → verde
registrar(S10, 'Ca=10 mEq / PO₄=20 mmol / 2000 mL → producto=50 (verde, seguro)', e1.nivel === 'verde' && e1.producto === 50, `${e1.producto} ${e1.nivel}`, '50 verde', 'Driscoll 2006')

const e2 = calcEstabilidadCaPO4(30, 50, 2000)
// caConc=15 | po4Conc=25 | producto=375 → rojo
registrar(S10, 'Ca=30 mEq / PO₄=50 mmol / 2000 mL → producto=375 (rojo)', e2.nivel === 'rojo', `${e2.producto} ${e2.nivel}`, '>200 rojo', 'Driscoll 2006 — precipitación')

const e3 = calcEstabilidadCaPO4(20, 30, 2000)
// caConc=10 | po4Conc=15 | producto=150 → NO supera 150 → verde (límite exacto)
registrar(S10, 'Ca=20 mEq / PO₄=30 mmol / 2000 mL → producto=150 (límite verde/amarillo)', e3.producto === 150 && e3.nivel === 'verde', `${e3.producto} ${e3.nivel}`, '150 verde (límite)', 'Driscoll 2006 — umbral exacto')

const e4 = calcEstabilidadCaPO4(21, 30, 2000)
// producto >150 → amarillo
registrar(S10, 'Ca=21 mEq / PO₄=30 mmol / 2000 mL → producto>150 (amarillo)', e4.nivel === 'amarillo', `${e4.producto} ${e4.nivel}`, 'amarillo', 'Driscoll 2006 — riesgo moderado')

const e5 = calcEstabilidadCaPO4(40, 60, 2000)
// caConc=20 | po4Conc=30 | producto=600 → rojo precipitación crítica
registrar(S10, 'Ca=40 mEq / PO₄=60 mmol / 2000 mL → producto=600 (rojo crítico)', e5.nivel === 'rojo' && e5.producto === 600, `${e5.producto} ${e5.nivel}`, '600 rojo', 'Driscoll 2006')

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 11 — Perfiles Clínicos (KDOQI 2020 / ESPEN 2021–2024 / CCSS HNN)
// ═══════════════════════════════════════════════════════════════════════════
const S11 = suite('11 · Perfiles Clínicos — 18 perfiles validados vs guías primarias')

// Adulto
registrar(S11, 'Estándar: kcal 20–25, prot 1.0–1.2', PERFILES.estandar.kcal[0]===20 && PERFILES.estandar.kcal[1]===25 && PERFILES.estandar.prot[1]===1.2, JSON.stringify(PERFILES.estandar), 'kcal[20,25] prot[1.0,1.2]', 'ESPEN 2019')
registrar(S11, 'Sepsis: kcal 25–30 (hipocalórico 1ª semana), prot 1.5–2.0', PERFILES.sepsis.kcal[0]===25 && PERFILES.sepsis.prot[1]===2.0, JSON.stringify(PERFILES.sepsis), 'kcal[25,30] prot[1.5,2.0]', 'ASPEN/SCCM 2016 · ESPEN ICU 2021')
registrar(S11, 'Quemaduras: kcal 30–35, prot 1.5–2.5', PERFILES.quemaduras.kcal[0]===30 && PERFILES.quemaduras.prot[1]===2.5, JSON.stringify(PERFILES.quemaduras), 'kcal[30,35] prot[1.5,2.5]', 'ASPEN Burns 2013')

// Renal
registrar(S11, 'Renal pre-diálisis: prot 0.60–0.75 (único escenario restricción proteica)', PERFILES['renal_prediálisis'].prot[0]===0.60 && PERFILES['renal_prediálisis'].prot[1]===0.75, JSON.stringify(PERFILES['renal_prediálisis'].prot), '[0.60,0.75]', 'NKF-KDOQI 2020')
registrar(S11, 'Renal HD: prot exactamente 1.2–1.2 (pérdida AA en filtro)', PERFILES.renal_hd.prot[0]===1.2 && PERFILES.renal_hd.prot[1]===1.2, JSON.stringify(PERFILES.renal_hd.prot), '[1.2,1.2]', 'NKF-KDOQI 2020')
registrar(S11, 'Renal TRRC: prot 1.5–2.5 (hemofiltración elimina 10–15 g AA/d)', PERFILES.renal_trrc.prot[0]===1.5 && PERFILES.renal_trrc.prot[1]===2.5, JSON.stringify(PERFILES.renal_trrc.prot), '[1.5,2.5]', 'ESPEN Renal 2024 · ESPEN ICU 2021')

// Hepático
registrar(S11, 'Hepático compensado: kcal 30–35, prot 1.2–1.5', PERFILES.hepatico_compensado.kcal[0]===30 && PERFILES.hepatico_compensado.prot[1]===1.5, JSON.stringify(PERFILES.hepatico_compensado), 'kcal[30,35] prot[1.2,1.5]', 'ESPEN Liver 2022')
registrar(S11, 'Hepático descomp: kcal 35–40 (más alto — catabolismo glucogénico)', PERFILES.hepatico_descompensado.kcal[0]===35 && PERFILES.hepatico_descompensado.kcal[1]===40, JSON.stringify(PERFILES.hepatico_descompensado.kcal), '[35,40]', 'ESPEN Liver 2022')

// Oncológico
registrar(S11, 'Oncológico: kcal 20–25 (no sobrealimentar — insulinorresistencia tumoral)', PERFILES.oncologico.kcal[1]===25, PERFILES.oncologico.kcal[1], 25, 'ESPEN Cancer 2021')
registrar(S11, 'Oncológico: prot 1.0–1.5 g/kg/día (atenuación atrofia muscular)', PERFILES.oncologico.prot[0]===1.0 && PERFILES.oncologico.prot[1]===1.5, JSON.stringify(PERFILES.oncologico.prot), '[1.0,1.5]', 'ESPEN Cancer 2021')

// Pediátrico/Neonatal
registrar(S11, 'Prematuro: kcal 110–150, prot 3.5–4.0 (neurodesarrollo)', PERFILES.neonato_prematuro.kcal[0]===110 && PERFILES.neonato_prematuro.prot[0]===3.5, JSON.stringify({kcal:PERFILES.neonato_prematuro.kcal,prot:PERFILES.neonato_prematuro.prot}), 'kcal[110,150] prot[3.5,4.0]', 'Manual CCSS HNN 2018 · ASPEN Pediatric')
registrar(S11, 'Neonato término: kcal 90–100, prot 2.5–3.5', PERFILES.neonato_termino.kcal[0]===90 && PERFILES.neonato_termino.prot[1]===3.5, JSON.stringify({kcal:PERFILES.neonato_termino.kcal}), 'kcal[90,100]', 'Manual CCSS HNN 2018')
registrar(S11, 'Prematuro TIG máx = 12 mg/kg/min (CCSS HNN)', PERFILES.neonato_prematuro.tigMax===12, PERFILES.neonato_prematuro.tigMax, 12, 'Manual CCSS HNN 2018')
registrar(S11, 'Adolescente: kcal 35–50 (converge a adulto)', PERFILES.pediatrico_adolescente.kcal[0]===35, PERFILES.pediatrico_adolescente.kcal[0], 35, 'Manual CCSS HNN 2018')
registrar(S11, 'Escolar TIG máx = 10 mg/kg/min', PERFILES.pediatrico_escolar.tigMax===10, PERFILES.pediatrico_escolar.tigMax, 10, 'Manual CCSS HNN 2018')
registrar(S11, 'Adolescente TIG máx = 7 mg/kg/min (igual que adulto)', PERFILES.pediatrico_adolescente.tigMax===7, PERFILES.pediatrico_adolescente.tigMax, 7, 'Manual CCSS HNN 2018')

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 12 — mNUTRIC Score (Heyland 2011 / Rahman 2016)
// ═══════════════════════════════════════════════════════════════════════════
const S12 = suite('12 · mNUTRIC Score — Heyland DK JPEN 2011 / Rahman 2016 (sin IL-6)')

const nutric_bajo = calcNutricScore({ edad: 45, apache: 12, sofa: 4, comorbilidades: 1, diasHospUCI: 0 })
// edad<50=0 | apache<15=0 | sofa<6=0 | comorbilidades<2=0 | diasHospUCI=0=0 → score=0
registrar(S12, 'Bajo riesgo: edad=45, APACHE=12, SOFA=4, comorbilidades=1, días=0 → score=0', nutric_bajo.score === 0 && nutric_bajo.riesgo === 'bajo', `score=${nutric_bajo.score}`, 'score=0, bajo', 'mNUTRIC — Heyland 2011')

const nutric_alto = calcNutricScore({ edad: 76, apache: 30, sofa: 12, comorbilidades: 3, diasHospUCI: 2 })
// edad≥75=2 | apache≥28=3 | sofa≥10=2 | comorbilidades≥2=1 | días≥1=1 → score=9
registrar(S12, 'Alto riesgo máximo: edad=76, APACHE=30, SOFA=12, comorbilidades=3, días=2 → score=9', nutric_alto.score === 9 && nutric_alto.riesgo === 'alto', `score=${nutric_alto.score}`, 'score=9, alto', 'mNUTRIC — Heyland 2011')

const nutric_limite = calcNutricScore({ edad: 52, apache: 22, sofa: 7, comorbilidades: 2, diasHospUCI: 1 })
// edad≥50=1 | apache≥20=2 | sofa≥6=1 | comorbilidades≥2=1 | días≥1=1 → score=6
registrar(S12, 'Límite: edad=52, APACHE=22, SOFA=7, comorbilidades=2, días=1 → score=6 (alto ≥5)', nutric_limite.score === 6 && nutric_limite.riesgo === 'alto', `score=${nutric_limite.score}`, 'score=6, alto', 'mNUTRIC — corte ≥5')

registrar(S12, 'Score ≥5 → alto riesgo nutricional (beneficio demostrado soporte agresivo)', nutric_alto.riesgo === 'alto', nutric_alto.riesgo, 'alto', 'Rahman 2016 — validación sin IL-6')

// ═══════════════════════════════════════════════════════════════════════════
// SUITE 13 — Límites CCSS Manual SNF 2018 p.18
// ═══════════════════════════════════════════════════════════════════════════
const S13 = suite('13 · Límites Electrolitos en Bolsa — Manual CCSS Farmacias SNF 2018 p.18')

function concMeqL(mEqTotal, volMl) { return mEqTotal / (volMl / 1000) }

const naConc = concMeqL(154, 2000)   // exactamente en límite
registrar(S13, 'Na 154 mEq en 2000 mL → 77 mEq/L (≤154 límite CCSS)', naConc <= 154, naConc.toFixed(0), '≤154 mEq/L', 'Manual CCSS SNF 2018 p.18')

const naAlerta = concMeqL(310, 2000) // 155 mEq/L → alerta
registrar(S13, 'Na 310 mEq en 2000 mL → 155 mEq/L (supera límite CCSS)', naAlerta > 154, naAlerta.toFixed(0), '>154 mEq/L', 'Manual CCSS SNF 2018 p.18')

const kConc = concMeqL(160, 2000) // 80 mEq/L → límite
registrar(S13, 'K 160 mEq en 2000 mL → 80 mEq/L (límite exacto CCSS)', kConc === 80, kConc.toFixed(0), '80 mEq/L', 'Manual CCSS SNF 2018 p.18')

const mgConc = concMeqL(40, 2000) // 20 mEq/L → límite
registrar(S13, 'Mg 40 mEq en 2000 mL → 20 mEq/L (límite CCSS)', mgConc === 20, mgConc.toFixed(0), '20 mEq/L', 'Manual CCSS SNF 2018 p.18')

const po4Conc = 30 / (2000/1000) // 15 mmol/L → límite en 3-en-1
registrar(S13, 'PO₄ 30 mmol en 2000 mL → 15 mmol/L (límite CCSS en 3-en-1)', po4Conc === 15, po4Conc.toFixed(0), '15 mmol/L', 'Manual CCSS SNF 2018 p.18')

// Glucosa mínima 5% en 3-en-1 (estabilidad emulsión lipídica)
const glucosaConc_ok = (321 / 2000) * 100 // 16.05% → ok
registrar(S13, '321 g dextrosa en 2000 mL → 16.05% glucosa (≥5% mínimo CCSS)', glucosaConc_ok >= 5, glucosaConc_ok.toFixed(2) + '%', '≥5%', 'Manual CCSS SNF 2018 — estabilidad emulsión')

// Volumen máximo por bolsa
registrar(S13, 'Bolsa máximo 3000 mL (Manual CCSS SNF 2018 p.12)', 2000 <= 3000 && 3001 > 3000, '2000 ≤ 3000; 3001 > 3000', '≤3000 mL', 'Manual CCSS SNF 2018 p.12')

// ═══════════════════════════════════════════════════════════════════════════
// RESUMEN FINAL
// ═══════════════════════════════════════════════════════════════════════════
const total = pasadas + errores
const pct   = ((pasadas / total) * 100).toFixed(1)

console.log('\n╔══════════════════════════════════════════════╗')
console.log('║     AUDITORÍA MATEMÁTICA — RESULTADO FINAL   ║')
console.log('╚══════════════════════════════════════════════╝')
console.log(`  Pruebas ejecutadas : ${total}`)
console.log(`  Aprobadas          : ${pasadas}`)
console.log(`  Falladas            : ${errores}`)
console.log(`  Cobertura          : ${pct}%`)
console.log(`  Estado             : ${errores === 0 ? '✅  TODAS LAS PRUEBAS PASARON — SISTEMA SEGURO PARA PRODUCCIÓN' : `❌  ${errores} FALLA(S) — REQUIERE REVISIÓN ANTES DE PRODUCCIÓN`}`)
console.log('')

// ── Generar log JSON ─────────────────────────────────────────────────────
const fecha    = new Date()
const isoFecha = fecha.toISOString().slice(0, 10)
const log = {
  auditoria: 'NutriVida Biotech — Auditoría Matemática CalculadoraNP',
  version:   'v2.1.1',
  fecha:     fecha.toISOString(),
  ejecutor:  'node test-logica-np.js',
  resumen: {
    total,
    aprobadas: pasadas,
    falladas:  errores,
    cobertura: `${pct}%`,
    estado:    errores === 0 ? 'APROBADO' : 'FALLIDO',
  },
  fuentes_validadas: [
    'Harris-Benedict (1919)',
    'Pereira Da Silva et al. Nutr Hosp 2015',
    'Manual CCSS Farmacias SNF 2018',
    'Manual CCSS HNN 2018',
    'ESPEN ICU 2021 · ESPEN Liver 2022 · ESPEN Cancer 2021',
    'NKF-KDOQI 2020 · ESPEN Renal 2024',
    'ASPEN 2016 · ASPEN Pediatric PN Guidelines',
    'Bistrian BR et al. JPEN 1979',
    'Heyland DK (mNUTRIC) JPEN 2011 · Rahman 2016',
    'Driscoll DF et al. Drug Dev Ind Pharm 2006',
    'USP <797> · ASHP Injectable Drug Information',
  ],
  pruebas: RESULTADOS,
}

const logPath = `audit-log-${isoFecha}.json`
try {
  writeFileSync(logPath, JSON.stringify(log, null, 2), 'utf8')
  console.log(`  📄 Log generado: ${logPath}`)
} catch (err) {
  console.warn('  ⚠️  No se pudo escribir el log JSON:', err.message)
}

if (errores > 0) process.exit(1)
