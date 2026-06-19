# NutriVida Biotech

> **Plataforma clínica y educativa de nutrición parenteral para Costa Rica**  
> Cálculo con rigor científico · Seguridad del paciente domiciliario · Interoperabilidad FHIR R4

![Build](https://img.shields.io/badge/build-passing-brightgreen)
![Version](https://img.shields.io/badge/versión-2.1.0--beta-teal)
![Stack](https://img.shields.io/badge/stack-React%2019%20%2B%20Vite%208-blue)
![Standards](https://img.shields.io/badge/estándares-ESPEN%20%7C%20ASPEN%20%7C%20KDOQI-indigo)
![Tests](https://img.shields.io/badge/pruebas%20matemáticas-50%2F50%20✓-success)
![License](https://img.shields.io/badge/licencia-uso%20clínico%20restringido-orange)

---

## Descripción general

NutriVida Biotech es una herramienta web de apoyo al equipo de soporte nutricional de Costa Rica. Integra tres audiencias en una sola plataforma: el **profesional clínico** que formula y valida la NP, el **paciente o cuidador** que la administra en casa, y el **estudiante de ciencias de la salud** que construye su base fisiopatológica.

El motor de cálculo está auditado matemáticamente (50 pruebas de regresión), documentado con referencias primarias (ESPEN/ASPEN/KDOQI) y validado contra casos clínicos reales del contexto costarricense. No diagnostica, no prescribe y no reemplaza la validación del farmacéutico.

---

## Arquitectura

```
nutrivida-biotech/
├── src/
│   ├── pages/
│   │   ├── Landing.jsx          — Punto de entrada por audiencia
│   │   ├── Profesional.jsx      — Módulo clínico (3 pestañas)
│   │   ├── Paciente.jsx         — Portal domiciliario (8 secciones)
│   │   └── Estudiante.jsx       — Módulo educativo + Atlas
│   ├── components/
│   │   ├── CalculadoraNP.jsx    — Motor de cálculo principal
│   │   ├── ModoBatch.jsx        — Modo farmacéutico multi-paciente
│   │   ├── Compatibilidad.jsx   — Base de datos de compatibilidades IV
│   │   ├── GuiaCuidador.jsx     — Protocolo domiciliario paso a paso
│   │   ├── TriageNP.jsx         — Árbol decisional de emergencia
│   │   ├── AsistenteIA.jsx      — Chatbot clínico serverless
│   │   ├── InspectorInfecciones.jsx — Checklist de infección por catéter
│   │   ├── LogisticaDomiciliaria.jsx — Cadena de frío y timers
│   │   ├── BiotecnologiaNP.jsx  — Contenido educativo biotecnológico
│   │   ├── BienestarMental.jsx  — Apoyo emocional para el hogar
│   │   └── VidaMejor.jsx        — Calidad de vida con NP
│   └── data/
│       └── compatibilidades.json — 75 fármacos (Trissel's / ASHP)
├── api/
│   └── chat.js                  — Función serverless (Vercel) con rate-limit
├── test-logica-np.js            — Suite de auditoría matemática (50 pruebas)
└── vercel.json                  — Headers de seguridad CDN
```

---

## Módulos

### Módulo Profesional

#### Calculadora NP — Motor de cálculo clínico

El núcleo computacional del sistema. Genera formulaciones de nutrición parenteral adulta, pediátrica y neonatal con base en guías clínicas internacionales.

| Función | Método | Fuente |
|---|---|---|
| Energía basal | Harris-Benedict (1919, revisado) | ESPEN 2023 |
| Factor de estrés | ×1.0 → ×1.5 (6 niveles) | ASPEN/SCCM 2016 |
| Distribución macros | 65 % CHO / 35 % lípidos del NPC | ESPEN 2019 |
| Osmolaridad | Pereira Da Silva et al. 2015 | Nutr Hosp |
| Estabilidad Ca-PO₄ | Producto iónico + cationes divalentes | ASHP / USP |
| Balance nitrogenado | BN = N_ing − (NUU + corrección) | SEFH |
| Índice de Bistrian | NUU_obs − (0.5 × N_ing + 3) | Bistrian BR |
| TIG neonatal/pediátrico | g_glu × 1000 / (kg × 1440) | Manual CCSS HNN 2018 |
| Peso ajustado (obesidad) | PI + 0.25 × (PA − PI) | ASPEN 2016 |

**Perfiles patológicos implementados (KDOQI 2020 / ESPEN 2022–2024):**

| Grupo | Perfiles |
|---|---|
| Renal | Pre-diálisis · Hemodiálisis · Diálisis Peritoneal · TRRC |
| Hepático | Cirrosis compensada · Cirrosis descompensada / encefalopatía |
| Oncológico | Caquexia tumoral |
| Pediátrico/Neonatal | Prematuro extremo · Neonato a término · Infante · Escolar · Adolescente |

**Alertas de seguridad automáticas:**

- 5 zonas de osmolaridad (periférica segura → alerta fisicoquímica crítica >1800 mOsm/L)
- Semáforo Ca-PO₄ con 3 niveles (precipitación, riesgo moderado, seguro)
- TIG con límite por grupo de edad (neonatal: 14 mg/kg/min; pediátrico: 7–12 mg/kg/min)
- TIG adulto en NP 2-en-1 cuando supera 5 mg/kg/min (ASPEN 2016)
- Sobrecarga glucídica en diálisis peritoneal (>3.5 g/kg/día, absorción peritoneal 60–80%)
- Validación de volumen con reserva mínima obligatoria de 100 mL para aditivos

**Exportaciones:**
- **FHIR R4** `NutritionOrder` — interoperabilidad con sistemas clínicos
- **Impresión** — reporte clínico directo desde el navegador

#### Modo Batch Farmacéutico

Formulación multi-paciente en una sola sesión de trabajo. Genera resumen de insumos consolidado y exporta CSV para compras y preparación.

- Hasta N pacientes simultáneos
- Detección automática de alertas por acceso vascular vs. osmolaridad
- Exportación CSV con insumos totales (AA 10%, Dex 50%, Lípidos 20%)

#### Base de Datos de Compatibilidades IV

75 fármacos referenciados contra Trissel's Handbook on Injectable Drugs, King Guide to Parenteral Admixtures y ASHP Injectable Drug Information.

- Búsqueda en tiempo real por nombre o clasificación
- Filtro por estado: compatible · cautela · incompatible
- Compatibilidad con NP ternaria (3-en-1) y en Y simultáneo

---

### Módulo Paciente / Cuidador

| Sección | Descripción | Estado |
|---|---|---|
| Mi Infusión | Timers de infusión, recordatorios de vencimiento y cadena de frío | ✅ Activo |
| Guía del Cuidador | Protocolo domiciliario paso a paso con imágenes de referencia | ✅ Activo |
| Señales de Alarma | Árbol decisional de triage (6 nodos, 3 niveles de urgencia) | ✅ Activo |
| Asistente IA | Chatbot especializado en NP domiciliaria con filtro de PII | ✅ Activo |
| Mi Bienestar | Recursos de apoyo emocional y comunidades de pacientes | ✅ Activo |
| Inspector de Infecciones | Checklist diferencial: CRBSI vs infección local | ✅ Activo |
| Biotecnología de mi NP | Explicación accesible de los componentes biotecnológicos | ✅ Activo |
| Vida Mejor | Estrategias de calidad de vida con NP de larga duración | ✅ Activo |

---

### Módulo Estudiante

Portal educativo integrado con el **Atlas Bioinformático Interactivo** — plataforma externa con más de 30 proteínas y enzimas clave documentadas con visualización 3D (RCSB PDB), relevancia clínica en NP y contexto bioquímico traslacional.

---

## Auditoría matemática

El archivo `test-logica-np.js` contiene 50 pruebas de regresión que cubren cada función del motor de cálculo. Ejecutable con Node.js sin dependencias adicionales.

```bash
node test-logica-np.js
```

**Áreas cubiertas:**

| Módulo | Pruebas | Resultado |
|---|---|---|
| Harris-Benedict (ambos sexos) | 2 | ✅ |
| Peso ideal Broca / ABW obesidad | 3 | ✅ |
| Osmolaridad Pereira Da Silva | 5 | ✅ |
| Balance nitrogenado | 4 | ✅ |
| Índice de Bistrian | 3 | ✅ |
| Relación NPC:N | 3 | ✅ |
| TIG neonatal (casos límite) | 4 | ✅ |
| Distribución macros 3-en-1 | 3 | ✅ |
| Distribución macros 2-en-1 | 4 | ✅ |
| TIG adulto en 2-en-1 | 2 | ✅ |
| Volúmenes comerciales | 5 | ✅ |
| Estabilidad Ca-PO₄ | 4 | ✅ |
| Rangos clínicos por perfil | 6 | ✅ |
| **Total** | **50** | **50/50** |

**Correcciones aplicadas (v2.1.0-beta):**

- **NP 2-en-1**: corregido error crítico donde la dextrosa se calculaba como el 65% del NPC aun sin lípidos, generando un déficit de 589 kcal/día respecto al objetivo calórico declarado.
- **PO₄**: etiqueta corregida de "mEq" a "mmol", consistente con la práctica clínica de farmacia hospitalaria en la CCSS y con el estándar Pereira Da Silva.

---

## Marco regulatorio — Costa Rica

| Norma | Aplicación |
|---|---|
| **RTCR 436:2009** | Verificación de concentraciones y categorización de suplementos a la dieta |
| **RTCA 67.04.54:10** | Contraste con la lista de aditivos alimentarios permitidos en Centroamérica |
| **RTCA 67.01.07:10** | Requisitos de etiquetado general |
| **RTCA 67.01.60:10** | Etiquetado nutricional cuantitativo |
| **BPM (Ministerio de Salud CR)** | Prerrequisitos de inocuidad, control de alérgenos y trazabilidad |
| **Codex Alimentarius** | Estándar base adoptado por Costa Rica |
| **Norma Nacional CCSS** | Derechos del paciente al soporte nutricional especializado |

Toda formulación generada por este sistema debe ser validada y firmada por un director técnico farmacéutico antes de la preparación. El sistema no emite recetas, prescripciones ni certificados de registro sanitario.

---

## Estándares clínicos

| Área | Fuentes primarias |
|---|---|
| Adulto general | ESPEN Clinical Nutrition 2023; ASPEN 2022 |
| Renal | NKF-KDOQI 2020; ESPEN Renal 2024; ISPD Nutrition Guidelines 2021 |
| UCI / Crítico / TRRC | ESPEN ICU 2021; SCCM/ASPEN Critical Care Nutrition Guidelines 2016 |
| Hepático | ESPEN Liver Disease 2022 |
| Oncológico | ESPEN Cancer 2021; ASPEN Oncology Guidelines |
| Pediátrico / Neonatal | Manual CCSS HNN 2018; ASPEN Pediatric PN Guidelines |
| Osmolaridad | Pereira Da Silva et al. Nutr Hosp 2015; SENPE |
| Estabilidad | USP <797>; ASHP Injectable Drug Information; Trissel's |
| Interoperabilidad | HL7 FHIR R4 — NutritionOrder |

---

## Seguridad técnica

### Frontend

- CSP estricto: `default-src 'self'`, sin `unsafe-eval`, sin iframes (`frame-src 'none'`)
- Sin persistencia de datos clínicos en cliente — arquitectura stateless por diseño
- Identificación profesional solo en `localStorage` del dispositivo; nunca enviada al servidor

### API Serverless (`api/chat.js`)

| Vector | Mitigación |
|---|---|
| Origen no autorizado | Whitelist CORS explícita; rechaza con HTTP 403 |
| Abuso de tasa | Rate limiting: 20 req/min por IP; HTTP 429 con `Retry-After: 60` |
| Payload malicioso | Límite 4096 bytes antes del parsing JSON |
| Datos personales (PII) | Regex multi-patrón: cédula CR, teléfono, email, expediente médico |
| Clickjacking | `X-Frame-Options: DENY` |
| MIME sniffing | `X-Content-Type-Options: nosniff` |
| Cache de respuestas | `Cache-Control: no-store` |
| Feature abuse | `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=()` |
| API servida como HTML | `Content-Security-Policy: default-src 'none'` en respuestas API |
| Fuga de Referer | `Referrer-Policy: no-referrer` |
| Variación CORS | `Vary: Origin` |

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| UI | React 19 + React Router 7 + Tailwind CSS 4 |
| Build | Vite 8 |
| Íconos | Lucide React |
| API | Vercel Serverless Functions (Node.js) |
| LLM | OpenRouter (modelo configurable) |
| Despliegue | Vercel (CDN + Edge Network) |
| Interoperabilidad | HL7 FHIR R4 |
| Pruebas | Node.js (sin dependencias — ejecución nativa) |

---

## Configuración y despliegue

### Desarrollo local

```bash
npm install
npm run dev
```

Variables de entorno necesarias (`.env.local`):

```env
OPENROUTER_API_KEY=sk-or-...
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

### Producción (Vercel)

```env
OPENROUTER_API_KEY=sk-or-...
ALLOWED_ORIGINS=https://nutri-vida-khaki.vercel.app
```

### Pruebas matemáticas

```bash
node test-logica-np.js
# Resultado esperado: 50/50 pruebas — Total errores: 0
```

### Build de producción

```bash
npm run build
# Output: dist/ — bundle ~496 kB (gzip ~143 kB)
```

---

## Nota clínica y descargo de responsabilidad

NutriVida Biotech es una herramienta de apoyo educativo y operativo al equipo de soporte nutricional. **No diagnostica, no prescribe, no modifica dosis y no reemplaza la valoración clínica individualizada.** Todo resultado es provisional y debe ser revisado, interpretado y autorizado por el médico, farmacéutico o nutricionista responsable antes de cualquier acción terapéutica.

El uso de esta herramienta no exime al profesional de su responsabilidad clínica y ética. Los cálculos son estimaciones basadas en ecuaciones poblacionales; el paciente individual puede requerir ajustes significativos.

---

*Desarrollado en Costa Rica · En honor a Gerardo Fonseca, por una vida que inspira cuidado, ciencia y humanidad.*
