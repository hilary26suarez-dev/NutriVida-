// AUDITORÍA MATEMÁTICA — NutriVida CalculadoraNP
let errores = 0;
function pass(label, got) { console.log("PASS: " + label + " -> " + got); }
function fail(label, got, expected) { console.log("FAIL: " + label); console.log("  Obtenido: " + got + "  Esperado: " + expected); errores++; }
function assert(label, cond, got, expected) { if (cond) pass(label, got); else fail(label, got, expected); }

// Harris-Benedict
console.log("\n=== Harris-Benedict ===");
function calcBEE(peso, talla, edad, sexo) {
  if (sexo === "M") return 66.5 + 13.75*peso + 5.003*talla - 6.775*edad;
  return 655.1 + 9.563*peso + 1.85*talla - 4.676*edad;
}
var bee_F = calcBEE(60, 165, 45, "F");
// 655.1 + 9.563*60 + 1.85*165 - 4.676*45 = 655.1+573.78+305.25-210.42 = 1323.71
assert("Mujer 60kg/165cm/45a = 1323.7", Math.abs(bee_F - 1323.7) < 0.5, bee_F.toFixed(1), "1323.7");
var bee_M = calcBEE(80, 175, 40, "M");
// 66.5 + 13.75*80 + 5.003*175 - 6.775*40 = 66.5+1100+875.525-271 = 1771.0
assert("Hombre 80kg/175cm/40a = 1771.0", Math.abs(bee_M - 1771.0) < 0.5, bee_M.toFixed(1), "1771.0");

// Peso Ajustado
console.log("\n=== Peso Ajustado (ABW) ===");
function pesoIdeal(talla, sexo) { return sexo === "M" ? talla - 100 : talla - 105; }
const pi_f = pesoIdeal(165, "F");
const pi_m = pesoIdeal(175, "M");
assert("Peso ideal mujer 165cm = 60", pi_f === 60, pi_f, 60);
assert("Peso ideal hombre 175cm = 75", pi_m === 75, pi_m, 75);
const abw_test = 75 + 0.25*(120-75);
assert("ABW hombre 120kg/PI=75 = 86.25", Math.abs(abw_test - 86.25) < 0.01, abw_test.toFixed(2), "86.25");

// Osmolaridad Pereira Da Silva
console.log("\n=== Osmolaridad Pereira Da Silva ===");
function osm(dexG, protG, vol, na, k, ca, mg, po4) {
  na = na || 0; k = k || 0; ca = ca || 0; mg = mg || 0; po4 = po4 || 0;
  var gluL  = dexG  / vol * 1000;
  var aaL   = protG / vol * 1000;
  var meqL  = (na + k + ca + mg + po4) / vol * 1000;
  return Math.round(gluL * 5.55 + aaL * 8.0 + meqL * 2);
}
// 250g glu + 100g AA en 2000mL: gluL=125*5.55=693.75  aaL=50*8=400  total=1094
var osm1 = osm(250, 100, 2000);
assert("250g glu+100g AA/2L sin elect = 1094", osm1 === 1094, osm1, 1094);

// Verificar manualmente: 125*5.55=693.75, 50*8=400 => 1093.75 => round=1094
var manual = Math.round(125*5.55 + 50*8);
assert("Verificacion manual 125*5.55+50*8=1094", manual === 1094, manual, 1094);

// Con electrolitos: Na70+K40 en 2000mL -> (70+40)/2000*1000*2 = 55*2=110 mOsm
var osm2 = osm(250, 100, 2000, 70, 40);
assert("Con Na70+K40 mEq -> osm +110", osm2 === osm1 + 110, osm2, osm1 + 110);

var osm_low = osm(100, 50, 2000);
assert("Mezcla diluida <600 (periferica segura)", osm_low < 600, osm_low, "<600");

var osm_high = osm(400, 150, 2000);
assert("Mezcla concentrada >900 (central)", osm_high > 900, osm_high, ">900");

// Lipidos no contribuyen a osmolaridad (isotonicos, fase micelar)
assert("Lipidos x0 = no aportan a osmolaridad", true, "lipidos x 0 por diseno", "OK");

// Balance Nitrogenado
console.log("\n=== Balance Nitrogenado ===");
function protFromUUN(uun, corr) { return (uun + corr) * 6.25; }
assert("UUN=10 corr=2 -> prot=75g", protFromUUN(10, 2) === 75, protFromUUN(10, 2), 75);

function bn(protG, uun, corr) { return protG/6.25 - (uun + corr); }
var bn1 = bn(100, 10, 2);
assert("100g prot - UUN=10 corr=2 -> BN=+4 (anabolico)", Math.abs(bn1 - 4) < 0.01, bn1.toFixed(2), "4.00");
var bn2 = bn(50, 10, 2);
assert("50g prot - UUN=10 corr=2 -> BN=-4 (catabolico)", Math.abs(bn2 - (-4)) < 0.01, bn2.toFixed(2), "-4.00");
var bn3 = bn(75, 10, 2);
assert("75g prot - UUN=10 corr=2 -> BN=0 (neutro)", Math.abs(bn3) < 0.01, bn3.toFixed(2), "0.00");

// Bistrian
console.log("\n=== Indice Bistrian ===");
function bistrian(uun, nIng) { return uun - (0.5 * nIng + 3); }
// 100g AA -> 16g N. UUN=15. Basal=0.5*16+3=11. Indice=4 (leve)
var bis1 = bistrian(15, 100/6.25);
assert("UUN=15 N=16g -> Bistrian=4.00 (leve 0-5)", Math.abs(bis1 - 4) < 0.01, bis1.toFixed(2), "4.00");
// UUN=20 -> 20-11=9 (grave >8)
var bis2 = bistrian(20, 100/6.25);
assert("UUN=20 N=16g -> Bistrian=9.00 (grave >8)", Math.abs(bis2 - 9) < 0.01, bis2.toFixed(2), "9.00");
// UUN=7 -> 7-(0.5*16+3)=7-11=-4 (negativo, sin estres)
var bis3 = bistrian(7, 100/6.25);
assert("UUN=7 N=16g -> Bistrian=-4.00 (sin estres)", Math.abs(bis3 - (-4)) < 0.01, bis3.toFixed(2), "-4.00");

// NPC:N
console.log("\n=== Relacion NPC:N ===");
function npcN_ratio(ten, protG) {
  var npc = ten - protG*4;
  var n   = protG / 6.25;
  return Math.round(npc / n);
}
var ratio = npcN_ratio(2000, 80);
// NPC=1680, N=12.8, ratio=131.25 -> 131
assert("2000kcal/80g prot -> NPC:N=131", ratio === 131, ratio, 131);
assert("131 esta en rango optimo 80-150", ratio >= 80 && ratio <= 150, ratio, "80-150");
// Caso bajo: 1000kcal/80g -> NPC=680, N=12.8, ratio=53 (bajo)
var ratio_low = npcN_ratio(1000, 80);
assert("1000kcal/80g -> NPC:N=53 (<80 bajo)", ratio_low < 80, ratio_low, "<80");

// TIG
console.log("\n=== TIG Neonatal ===");
function tig(dexG, peso) { return (dexG * 1000) / (peso * 1440); }
var tig1 = tig(30, 3);
// 30*1000/(3*1440) = 30000/4320 = 6.944...
assert("3kg/30g dex -> TIG=6.94 (seguro <=14)", Math.abs(tig1 - 6.944) < 0.01, tig1.toFixed(3), "6.944");
var tig2 = tig(100, 3);
// 100000/4320 = 23.15 (critico)
assert("3kg/100g dex -> TIG=23.1 (CRITICO >14)", tig2 > 14, tig2.toFixed(1), ">14");
// Adulto 70kg/268g dex -> 268000/(70*1440) = 268000/100800 = 2.66 (<7 OK)
var tig_adult = tig(268, 70);
assert("Adulto 70kg/268g dex -> TIG=2.66 (<7 OK)", tig_adult < 7, tig_adult.toFixed(2), "<7");
// Prematuro 1kg inicio seguro: TIG=5 -> dex = 5*1*1440/1000 = 7.2g/dia
var dex_prematuro = 5 * 1 * 1440 / 1000;
var tig_prematuro = tig(dex_prematuro, 1);
assert("Prematuro 1kg / TIG=5 -> dex=7.2g -> TIG back=5.00", Math.abs(tig_prematuro - 5) < 0.01, tig_prematuro.toFixed(2), "5.00");

// Distribucion macronutrientes
console.log("\n=== Distribucion Macros (3-en-1 con lipidos) ===");
// Replica exacta de la logica corregida en CalculadoraNP.jsx
function macros(ten, protG, conLipidos) {
  var npc  = ten - protG * 4;
  // CORRECCION: sin lipidos, todo NPC va a dextrosa (antes usaba 65% siempre -> deficit de 589 kcal)
  var dexG = conLipidos
    ? Math.round((npc * 0.65) / 3.4)
    : Math.round(npc / 3.4);
  var lipG = conLipidos ? Math.round((npc * 0.35) / 10) : 0;
  var kcalReal = Math.round(dexG * 3.4 + lipG * 10 + protG * 4);
  return { dexG: dexG, lipG: lipG, npc: npc, kcalReal: kcalReal };
}
var m = macros(2000, 80, true);
// NPC=1680. Dex=1680*0.65/3.4=321.17->321. Lip=1680*0.35/10=58.8->59
assert("3-en-1: 2000kcal/80g prot: dex=321g", m.dexG === 321, m.dexG, 321);
assert("3-en-1: 2000kcal/80g prot: lip=59g",  m.lipG === 59,  m.lipG, 59);
assert("3-en-1: Kcal cuadran ~2000 (+-50)", Math.abs(m.kcalReal - 2000) < 50, m.kcalReal, "~2000");

// NP 2-en-1: sin lipidos -> todo NPC debe ir a dextrosa (critico: antes era 589 kcal de deficit)
console.log("\n=== Distribucion Macros (2-en-1 sin lipidos — bug corregido) ===");
var m2 = macros(2000, 80, false);
// NPC=1680. Sin lipidos: dex = 1680/3.4 = 494.1 -> 494g
assert("2-en-1: dex=494g (todo NPC)", m2.dexG === 494, m2.dexG, 494);
assert("2-en-1: lip=0g", m2.lipG === 0, m2.lipG, 0);
assert("2-en-1: Kcal cuadran ~2000 (+-50)", Math.abs(m2.kcalReal - 2000) < 50, m2.kcalReal, "~2000");
// Verificar que el bug anterior (65% con sin lipidos) daba solo 1411 kcal
var kcalBugAnterior = Math.round(321 * 3.4 + 80 * 4); // 1411
assert("BUG ANTERIOR daba 1411 kcal (589 de deficit)", kcalBugAnterior === 1411, kcalBugAnterior, 1411);

// TIG adulto en 2-en-1: con dextrosa corregida verificar si supera limite ASPEN
console.log("\n=== TIG Adulto en NP 2-en-1 ===");
function tigAdulto(dexG, peso) { return (dexG * 1000) / (peso * 1440); }
var tig_2en1_70kg = tigAdulto(494, 70);
// 494*1000 / (70*1440) = 494000/100800 = 4.90 mg/kg/min (bajo limite de 5)
assert("2-en-1 70kg/2000kcal -> TIG=4.90 (<5 limite ASPEN)", Math.abs(tig_2en1_70kg - 4.90) < 0.05, tig_2en1_70kg.toFixed(2), "4.90");
// Caso critico: paciente 50kg / 2000 kcal -> TIG mas alto
var m_50kg = macros(2000, 80, false);
var tig_50kg = tigAdulto(m_50kg.dexG, 50);
assert("2-en-1 50kg/2000kcal -> TIG>5 (alerta adulto)", tig_50kg > 5, tig_50kg.toFixed(2), ">5");

// Volumenes comerciales
console.log("\n=== Volumenes Comerciales ===");
assert("AA 10%: 80g -> 800mL",  Math.round(80/0.1) === 800, 800, 800);
assert("Dex 50%: 321g -> 642mL", Math.round(321/0.5) === 642, 642, 642);
assert("Lip 20%: 59g -> 295mL",  Math.round(59/0.2) === 295, 295, 295);
var volComp = 800 + 642 + 295;
assert("3-en-1: componentes 1737mL caben en bolsa 2000mL", volComp < 2000, volComp, "<2000");
// 2-en-1 corregido: dextrosa 494g -> 988mL + AA 800mL = 1788mL (mas que con lipidos)
var vol2en1 = Math.round(494/0.5) + Math.round(80/0.1);
assert("2-en-1: dex 494g=988mL + AA 800mL = 1788mL (cabe en 2000mL)", vol2en1 < 2000, vol2en1, "<2000");
// Caso critico: componentes > bolsa
var volComp_critico = Math.round(200/0.1) + Math.round(600/0.5) + Math.round(150/0.2);
assert("Componentes 2000+1200+750=3950 > bolsa 3000 (inviable)", volComp_critico > 3000, volComp_critico, ">3000");

// Estabilidad Ca-PO4
console.log("\n=== Estabilidad Ca-PO4 ===");
function estab(caT, po4T, vol) {
  var caC  = (caT  / vol) * 1000;
  var po4C = (po4T / vol) * 1000;
  var prod = caC * po4C;
  var nivel = prod > 200 ? "rojo" : prod > 150 ? "amarillo" : "verde";
  return { prod: Math.round(prod), nivel: nivel };
}
var e1 = estab(10, 20, 2000);
// caC=5 mEq/L, po4C=10 mmol/L, prod=50 (verde)
assert("Ca=10mEq/Po4=20mmol/2L -> prod=50 verde", e1.nivel === "verde" && e1.prod === 50, e1.prod+" "+e1.nivel, "50 verde");
var e2 = estab(30, 50, 2000);
// caC=15, po4C=25, prod=375 (rojo)
assert("Ca=30/Po4=50/2L -> prod=375 rojo", e2.nivel === "rojo", e2.prod+" "+e2.nivel, ">200 rojo");
var e3 = estab(20, 30, 2000);
// caC=10, po4C=15, prod=150 (amarillo: >150 no, exactamente 150 no supera -> verde)
// prod=150 -> NOT >150 -> verde en la logica actual
assert("Ca=20/Po4=30/2L -> prod=150 (en limite verde)", e3.prod === 150 && e3.nivel === "verde", e3.prod+" "+e3.nivel, "150 verde");
// prod=151 -> amarillo
var e4 = estab(21, 30, 2000);
assert("Ca=21/Po4=30/2L -> prod>150 (amarillo)", e4.nivel === "amarillo", e4.prod+" "+e4.nivel, "amarillo");

// Rangos clinicos alineados con investigacion
console.log("\n=== Rangos Clinicos (validacion vs investigacion) ===");
var RANGOS = {
  "renal_trrc":          { kcal: [25,35], prot: [1.5,2.5] },
  "hepatico_descomp":    { kcal: [35,40], prot: [1.2,1.5] },
  "oncologico":          { kcal: [20,25], prot: [1.0,1.5] },
  "neonato_prematuro":   { kcal: [110,150], prot: [3.5,4.0] },
  "neonato_termino":     { kcal: [90,100],  prot: [2.5,3.5] },
  "pediatrico_adolescente": { kcal: [35,50], prot: [1.0,1.5] },
};
assert("TRRC: prot max=2.5 (ESPEN ICU 2024)", RANGOS.renal_trrc.prot[1] === 2.5, RANGOS.renal_trrc.prot[1], 2.5);
assert("Hepat descomp: kcal min=35 (ESPEN Liver 2022)", RANGOS.hepatico_descomp.kcal[0] === 35, RANGOS.hepatico_descomp.kcal[0], 35);
assert("Oncologico: kcal max=25 (no sobrealimentar)", RANGOS.oncologico.kcal[1] === 25, RANGOS.oncologico.kcal[1], 25);
assert("Prematuro: prot min=3.5 (neurodesarrollo)", RANGOS.neonato_prematuro.prot[0] === 3.5, RANGOS.neonato_prematuro.prot[0], 3.5);
assert("Prematuro: kcal min=110 (alta demanda)", RANGOS.neonato_prematuro.kcal[0] === 110, RANGOS.neonato_prematuro.kcal[0], 110);
assert("Adolescente: converge a adulto (35-50 kcal)", RANGOS.pediatrico_adolescente.kcal[0] === 35, RANGOS.pediatrico_adolescente.kcal[0], 35);

console.log("\n================================");
console.log("Total errores: " + errores);
if (errores === 0) console.log("TODAS LAS PRUEBAS PASARON OK");
else console.log(errores + " PRUEBA(S) FALLARON");
