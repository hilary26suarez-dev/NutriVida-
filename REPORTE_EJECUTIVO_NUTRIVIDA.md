# Reporte Ejecutivo — NutriVida Biotech

**Versión:** 1.0  
**Fecha:** 7 de junio de 2026  
**Plataforma:** https://nutrividabio.netlify.app  
**Repositorio:** https://github.com/hilary26suarez-dev/NutriVida-.git  

---

## 1. Resumen Ejecutivo

NutriVida Biotech es una **aplicación web de apoyo educativo y clínico** diseñada para pacientes, cuidadores y profesionales de salud involucrados en **nutrición parenteral (NP) domiciliaria en Costa Rica**. La plataforma integra herramientas de cálculo clínico, inteligencia artificial, guías de cuidado y教育资源, con un enfoque biotecnológico diferenciador.

**Misión:** Reducir errores evitables, mejorar la educación del paciente y facilitar conversaciones más claras entre pacientes y equipos de salud.

**Aclaración legal:** NutriVida Biotech **no sustituye la prescripción médica**, la validación farmacéutica ni el entrenamiento clínico. Es una herramienta de acompañamiento y educación.

---

## 2. Arquitectura General del Sistema

### 2.1 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (SPA)                           │
│  React 19 + Vite 8 + Tailwind CSS 4 + React Router 7      │
│  ┌───────────┬───────────────┬──────────────┬────────────┐  │
│  │ Landing   │ Profesional   │  Paciente    │ Estudiante │  │
│  │ /         │ /profesional  │  /paciente   │ /estudiante│  │
│  └───────────┴───────────────┴──────────────┴────────────┘  │
│                          │                                   │
│                    API fetch POST                            │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────┼──────────────────────────────────┐
│               BACKEND SERVERLESS                            │
│  ┌───────────────────────┴──────────────────────────────┐   │
│  │  Netlify Functions    │  Vercel Serverless Functions  │   │
│  │  netlify/functions/   │  api/chat.js                  │   │
│  │  chat.js              │                               │   │
│  └───────────────────────┴──────────────────────────────┘   │
│                          │                                   │
│               OpenRouter API (LLM)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  meta-llama/llama-3.3-70b-instruct:free              │   │
│  │  z-ai/glm-4.5-air:free (fallback)                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Stack Tecnológico

| Capa | Tecnología | Versión | Propósito |
|------|-----------|---------|-----------|
| **Framework UI** | React | 19.2.6 | Biblioteca de interfaces de usuario |
| **Bundler** | Vite | 8.0.12 | Desarrollo y build de producción |
| **Estilos** | Tailwind CSS | 4.3.0 | Sistema de diseño utility-first |
| **Enrutamiento** | React Router DOM | 7.17.0 | Navegación SPA cliente-side |
| **Iconos** | Lucide React | 1.17.0 | Librería de iconografía SVG |
| **IA/LLM** | OpenRouter API | — | Acceso a modelos de lenguaje gratuitos |
| **Despliegue** | Netlify / Vercel | — | Hosting estático + functions serverless |
| **Linter** | ESLint | 10.3.0 | Análisis estático de código |

### 2.3 Despliegue Dual

La aplicación cuenta con configuración de despliegue para **una plataformas**:

- 
- **Vercel** (alternativa): `vercel.json` + `api/chat.js`

 Configuran headers de seguridad idénticos (CSP, HSTS, X-Frame-Options DENY, etc.) y redirecciones SPA para React Router.

---

## 3. Estructura de Archivos del Proyecto

```
NutriVida Biotech/
├── public/
│   ├── favicon.svg              # Icono de la aplicación
│   └── icons.svg                # Sprite de iconos
├── src/
│   ├── main.jsx                 # Punto de entrada React
│   ├── App.jsx                  # Router principal (4 rutas)
│   ├── App.css                  # Estilos globales y animaciones
│   ├── index.css                # Imports de Tailwind
│   ├── assets/
│   │   └── hero.png             # Imagen del hero
│   ├── components/
│   │   ├── AsistenteIA.jsx      # Chat IA con NutriAsistente
│   │   ├── BienestarMental.jsx  # Bienestar emocional del paciente
│   │   ├── BiotecnologiaNP.jsx  # Educación sobre biotecnología
│   │   ├── CalculadoraNP.jsx    # Calculadora clínica de NP
│   │   ├── Compatibilidad.jsx   # Consulta de compatibilidades
│   │   ├── CuidadosNP.jsx       # Prohibiciones y cuidados
│   │   ├── GuiaCuidador.jsx     # Protocolo paso a paso
│   │   ├── InspectorInfecciones.jsx # Inspector visual de infecciones
│   │   ├── LogisticaDomiciliaria.jsx # Timers y recordatorios
│   │   ├── NavBar.jsx           # Navegación superior
│   │   ├── SafetyNotice.jsx     # Avisos de seguridad
│   │   ├── TriageNP.jsx         # Triaje offline de síntomas
│   │   └── VidaMejor.jsx        # Calidad de vida con NP
│   ├── pages/
│   │   ├── Landing.jsx          # Página principal / acceso
│   │   ├── Profesional.jsx      # Módulo profesional de salud
│   │   ├── Paciente.jsx         # Módulo paciente/cuidador
│   │   └── Estudiante.jsx       # Módulo educativo
│   ├── data/
│   │   └── compatibilidades.json # BD de compatibilidades farmacológicas
│   └── utils/
│       └── icsGenerator.js      # Generador de recordatorios .ics
├── api/
│   └── chat.js                  # Backend Vercel (serverless function)
├── netlify/
│   └── functions/
│       └── chat.js           
├── package.json
├── vite.config.js
├── vercel.json
├── eslint.config.js
├── .env.example
├── .gitignore
└── README.md
```

---

## 4. Sistema de Rutas y Navegación

La aplicación utiliza **React Router v7** con rutas cliente-side (SPA):

| Ruta | Componente | Descripción |
|------|-----------|-------------|
| `/` | `Landing.jsx` | Página de inicio con 3 accesos principales |
| `/profesional` | `Profesional.jsx` | Herramientas clínicas para profesionales |
| `/paciente` | `Paciente.jsx` | Espacio de apoyo para paciente y cuidador |
| `/estudiante` | `Estudiante.jsx` | Contenido educativo por carrera universitaria |

El `NavBar` (barra de navegación sticky) aparece en las 3 rutas internas, permitiendo navegación rápida entre módulos.

---

## 5. Módulo Profesional (`/profesional`)

### 5.1 Calculadora de Nutrición Parenteral (`CalculadoraNP.jsx`)

**Componente principal del sistema — 1,077 líneas de código.**

#### Funcionalidades:

| Función | Descripción |
|---------|------------|
| **Cálculo energético** | Harris-Benedict (hombres/mujeres) o objetivo directo kcal/kg |
| **6 condiciones clínicas** | Sin estrés, post-op menor, trauma moderado, cirugía mayor, sepsis, quemaduras |
| **Cálculo proteico** | Por ecuación metabólica o por balance nitrogenado (UUN 24h) |
| **Distribución macro** | 65% dextrosa / 35% lípidos (NPC) |
| **4 fuentes lipídicas** | Soja (Intralipid®), Oliva/Soja (ClinOleic®), Mixto SMOF, Omega-3/Microalgas |
| **Semáforo Ca-PO₄** | Evaluación de estabilidad fisicoquímica (verde/amarillo/rojo) |
| **Balance nitrogenado** | Cálculo explícito de N balance con estado anabólico/catabólico/neutro |
| **Vía de administración** | Clasificación por osmolaridad: periférica (≤700), precaución (700-900), central (>900) |
| **Insulina inicial** | Sugerencia para diabéticos (dextrosa ÷ 10) |
| **Oligoelementos pediátricos** | Dosis según protocolo CCSS/HNN |
| **Conversión comercial** | Conversión a volúmenes de soluciones comerciales (Dextrosa 50%, AA 10%, Lípidos 20%) |
| **Validación de viabilidad** | Alerta si los componentes exceden el volumen de la bolsa |
| **Exportación FHIR R4** | Genera NutritionOrder en formato HL7 FHIR R4 para interoperabilidad |
| **Base de conocimiento** | Panel educativo con mecanismos fisiológicos, cambios metabólicos y referencias ASPEN/ESPEN |
| **Checklist de enfermería** | 8 puntos de verificación para control de NP |

#### Algoritmo de Cálculo:

```
GEB = Harris-Benedict(peso, talla, edad, sexo)
GET = GEB × Factor de estrés (1.0–1.5)
Proteína = g/kg/día × peso (o derivada de UUN)
NPC = GET − (Proteína × 4)
Dextrosa = (NPC × 0.65) / 3.4
Lípidos = (NPC × 0.35) / 10
Osmolaridad ≈ (Dextrosa × 5) + (Proteína × 10) + 300
Producto Ca-PO₄ = [Ca] × [PO₄] < 200 mEq·mmol/L²
```

### 5.2 Consulta de Compatibilidades (`Compatibilidad.jsx`)

| Característica | Detalle |
|----------------|---------|
| **Base de datos** | 50 fármacos iniciales (`compatibilidades.json`) |
| **Categorías** | Compatible, Cautela, Incompatible |
| **Contextos** | NP ternaria (3-en-1), Vía Y |
| **Búsqueda** | Texto libre con filtros por categoría |
| **Detalle** | Descripción + recomendación específica por fármaco |

---

## 6. Módulo Paciente/Cuidador (`/paciente`)

### 6.1 Logística Domiciliaria (`LogisticaDomiciliaria.jsx`)

| Función | Descripción |
|---------|------------|
| **Timer de infusión** | Cuenta regresiva en tiempo real hasta la próxima dosis |
| **Timer de temperatura** | Alerta 90 min antes para sacar la bolsa del refrigerador |
| **Timer de vencimiento** | Control de los 5 días máximos de vida útil de la bolsa |
| **Timer de retiro** | Recordatorio de próxima visita al hospital |
| **Checklist pre-conexión** | 4 pasos de verificación (manos, bolsa, catéter, equipo) |
| **Generador .ics** | Descarga de 3 eventos para calendario (Apple, Google) con alarmas |
| **Residuos biopeligrosos** | Instrucciones de manejo de residuos en el hogar |

### 6.2 Guía del Cuidador (`GuiaCuidador.jsx`)

Protocolo completo de **7 pasos** para la administración de NP domiciliaria:

1. Preparar el área y los materiales
2. Verificar la bolsa de NP
3. Revisar el sitio del catéter
4. Preparar y purgar la tubuladura
5. Conectar e iniciar la infusión
6. Vigilar durante la infusión
7. Desconectar y cerrar el catéter

Cada paso incluye: instrucciones detalladas, alertas de seguridad y acceso directo al Asistente IA.

### 6.3 Señales de Alarma / Inspector de Infecciones (`InspectorInfecciones.jsx`)

**Dos modos de operación:**

1. **Guía Visual:** 3 niveles de severidad (normal, señales tempranas, alarma) con descripción visual del sitio del catéter
2. **Inspector Interactivo:** Selección de síntomas observados → clasificación automática (verde/amarillo/rojo) → acción recomendada

Incluye guía específica para 3 tipos de catéter: PICC, CVC tunelizado (Hickman/Broviac) y Port-a-cath.

### 6.4 Asistente IA — NutriAsistente (`AsistenteIA.jsx`)

| Característica | Detalle |
|----------------|---------|
| **Motor** | OpenRouter API → LLaMA 3.3 70B (principal) / GLM-4.5 Air (fallback) |
| **Modo educativo** | Preguntas generales → envío a API de IA |
| **Modo triaje** | Síntomas detectados por regex → árbol de triaje offline (sin llamada a API) |
| **Sugerencias** | 6 preguntas frecuentes predefinidas |
| **Seguridad** | Sanitización de input, límite de 800 caracteres, 3 mensajes de historial |
| **Privacidad** | No almacena datos identificables, detección automática de información sensible |

#### Árbol de Triaje Offline (`TriageNP.jsx`):

Decision tree de **6 preguntas** con 6 resultados posibles:
- **🔴 ROJO:** Emergencia cardiovascular, sepsis, neurológica → Llamar al 911
- **🟡 AMARILLO:** Fiebre no relacionada, catéter alterado, bolsa anormal → Contactar equipo hoy
- **🟢 VERDE:** Sin señales de alarma → Continuar plan habitual

### 6.5 Bienestar Mental (`BienestarMental.jsx`)

| Función | Descripción |
|---------|------------|
| **Check de mood** | 3 estados: Bien, Regular, Difícil |
| **Respiración 4-4-4-4** | Ejercicio guiado con círculo visual animado |
| **Afirmación del día** | 10 afirmaciones rotativas para pacientes con NP |
| **Recursos de apoyo** | ACONEP, Psicología CCSS, Línea Colegio de Psicólogos |

Contenido adaptativo según el estado emocional seleccionado.

### 6.6 Biotecnología NP (`BiotecnologiaNP.jsx`)

Módulo educativo sobre los **5 componentes** de la bolsa de NP:

| Componente | Origen Biotecnológico |
|------------|----------------------|
| **Aminoácidos** | Fermentación microbiana (Corynebacterium glutamicum, E. coli) |
| **Dextrosa** | Hidrólisis enzimática del almidón de maíz/trigo |
| **Emulsión Lipídica SMOF** | Soja + TCM + Oliva + Pescado/Microalgas |
| **Vitaminas** | Síntesis química + extracción biológica |
| **Oligoelementos** | Sales inorgánicas / quelatos orgánicos |

### 6.7 Vida Mejor (`VidaMejor.jsx`)

Guías de calidad de vida para **7 aspectos** de la NP domiciliaria:
1. Dormir con NP
2. Actividad física
3. Higiene y baño personal
4. Vida social y trabajo
5. Viajes con NP domiciliaria
6. Organizar el hogar para NP
7. Alimentación oral y NP

### 6.8 Cuidados NP (`CuidadosNP.jsx`)

**10 prohibiciones críticas** para NP domiciliaria, cada una con explicación del riesgo asociado.

---

## 7. Módulo Estudiante (`/estudiante`)

### 7.1 Contenido por Carrera

| Carrera | Tabs | Contenido Principal |
|---------|------|-------------------|
| **💊 Farmacia** | Cálculos, Estabilidad, Atlas 3D, Flujo CCSS | Calculadora educativa paso a paso, osmolalidad, Ca×P, preparación estéril, compounders |
| **🩺 Medicina** | Indicaciones, Atlas 3D, Flujo CCSS | Indicaciones de NP, contraindicaciones, monitoreo, complicaciones (infecciosas, metabólicas, mecánicas) |
| **🥗 Nutrición** | Evaluación, Requerimientos, Atlas 3D, Flujo CCSS | Tamizaje (NRS-2002, MUST, NUTRIC Score), síndrome de realimentación, transición NP→NE→oral |
| **💉 Enfermería** | Administración, Atlas 3D, Flujo CCSS | Técnica aséptica, cuidados del catéter, monitoreo, educación al paciente |

### 7.2 Atlas Bioinformático 3D

Enlace externo a `https://atlas-proteico.vercel.app/` — visualización 3D de proteínas y enzimas clave:
- Lipoproteína Lipasa (metabolismo de lípidos)
- Glucocinasa (sensor de glucosa)
- Na⁺/K⁺-ATPasa (síndrome de realimentación)
- Albúmina sérica (transporte)
- Insulina (regulación metabólica)

### 7.3 Flujo Clínico Hospitalario

Diagrama de **6 pasos** del proceso de NP en la red hospitalaria, con énfasis variable según la carrera seleccionada:
1. Prescripción médica en el sistema clínico institucional
2. Validación farmacéutica
3. Generación de hoja de preparación
4. Preparación estéril (ISO 5)
5. Liberación y control de calidad
6. Administración y seguimiento

---

## 8. Backend y Seguridad

### 8.1 Función Serverless (`chat.js`)

| Característica | Implementación |
|----------------|---------------|
| **Origen dual** | Netlify Functions + Vercel Serverless Functions |
| **Autenticación de origen** | Lista blanca de dominios (CORS whitelist) |
| **Rate limiting** | 20 solicitudes/minuto por IP (in-memory Map) |
| **Límite de mensajes** | Últimos 3 mensajes del historial |
| **Límite de caracteres** | 800 caracteres por mensaje |
| **Detección de datos sensibles** | Regex para cédula, teléfono, email, expediente, dirección |
| **Headers de seguridad** | CSP, HSTS, X-Frame-Options DENY, nosniff, no-referrer, no-store |
| **Fallback de modelos** | LLaMA 3.3 70B → GLM-4.5 Air (si el primero falla) |
| **Temperature** | 0.4 (respuestas más deterministas y seguras) |
| **Max tokens** | 450 por respuesta |

### 8.2 System Prompt de NutriAsistente

El prompt del sistema define rigurosamente:
- **Alcance:** Solo educación y acompañamiento
- **Prohibiciones:** No diagnosticar, no prescribir, no modificar dosis
- **Señales de alerta:** 6 síntomas que activan respuesta de emergencia
- **Contexto Costa Rica:** Derechos CCSS, ACONEP, Recurso de Amparo Sala IV
- **Tono:** Usted (formal), empático, conciso (3-4 párrafos)

### 8.3 Variables de Entorno Requeridas

| Variable | Plataforma | Descripción |
|----------|-----------|-------------|
| `OPENROUTER_API_KEY` | Ambas | Clave de API de OpenRouter para acceder a LLMs |
| `ALLOWED_ORIGINS` | Ambas | Orígenes CORS adicionales (opcional) |

---

## 9. Funcionalidad FHIR R4 (Interoperabilidad)

La calculadora NP genera exportaciones en formato **HL7 FHIR R4** (`NutritionOrder`) con las siguientes extensiones personalizadas:

| Extensión | Datos incluidos |
|-----------|----------------|
| `np-macronutrientes` | Energía total, GEB, proteína (g y g/kg), fuente proteica, dextrosa, lípidos, nitrógeno, relación NPC:N |
| `np-volumen` | Volumen total, volumen por componente, viabilidad física |
| `np-osmolaridad` | Osmolaridad, zona vascular, vía recomendada |
| `np-balance-nitrogenado` | Balance N, estado, proteína para balance neutro |
| `np-estabilidad-caPO4` | Semáforo, concentraciones, producto Ca×PO₄ |
| `np-insulina-inicial` | Dosis sugerida para diabéticos |
| `np-oligoelementos-pediatricos` | Multi-oligo y selenio |

---

## 10. Generación de Recordatorios ics

El módulo `icsGenerator.js` genera eventos de calendario estándar (.ics) compatibles con:
- Apple Calendar
- Google Calendar
- Microsoft Outlook
- Cualquier cliente CalDAV

**3 recordatorios generados:**
1. Sacar bolsa del refrigerador (90 min antes de la infusión)
2. Iniciar infusión de NP
3. Verificar vencimiento de la bolsa (5 días)

---

## 11. Base de Datos de Compatibilidades

Archivo `compatibilidades.json` contiene información de **50 fármacos** con:
- Nombre del fármaco
- Clasificación terapéutica
- Compatibilidad con NP ternaria (compatible/cautela/incompatible)
- Compatibilidad con vía Y (compatible/cautela/incompatible)
- Descripción y recomendación específica

---

## 12. Diseño y Experiencia de Usuario

### 12.1 Paleta de Colores por Módulo

| Módulo | Color Primario | Color Secundario |
|--------|---------------|-----------------|
| Profesional | Teal (#0D9488) | — |
| Paciente | Emerald (#10B981) | — |
| Estudiante | Violet (#7C3AED) | — |
| Emergencias | Red (#EF4444) | — |
| Bienestar | Pink (#EC4899) | — |
| Biotecnología | Violet (#8B5CF6) | — |

### 12.2 Principios de Diseño

- **Mobile-first:** Layouts responsive con `grid-cols-2` para secciones del paciente
- **Accesibilidad:** Contraste WCAG AA, botones grandes para pacientes mayores
- **Feedback visual:** Semáforos de color (verde/amarillo/rojo) para estados clínicos
- **Animaciones sutiles:** Transiciones hover, bounce en indicadores de carga, pulse en semáforos
- **Impresión:** Soporte para impresión directa desde el navegador

### 12.3 Seguridad Visual

- Avisos permanentes de "Apoyo educativo — no sustituye consulta médica"
- Botones de emergencia (911) siempre accesibles
- Badges de "Nuevo" para módulos recién agregados
- Disclaimer clínico al pie de cada módulo profesional

---

## 13. Lineamientos Clínicos de Referencia

NutriVida Biotech se basa en:

| Organización | Guía | Uso en la plataforma |
|-------------|------|---------------------|
| **ESPEN 2023** | Guías de nutrición clínica europeas | Cálculos, requerimientos, monitoreo |
| **ASPEN 2022** | Guías americanas de soporte nutricional | Factores de estrés, complicaciones |
| **CCSS** | Protocolos costarricenses de NP | Semáforo Ca-PO₄, oligoelementos, flujo clínico hospitalario |
| **SCCM** | Guías de cuidados intensivos | NP en sepsis, trauma, quemaduras |
| **HL7 FHIR R4** | Estándar de interoperabilidad | Exportación de NutritionOrder |

---

## 14. Métricas del Código

| Métrica | Valor |
|---------|-------|
| **Archivos JSX/JS** | 18 archivos fuente |
| **Componentes React** | 13 componentes |
| **Páginas** | 4 páginas |
| **Líneas de código (aprox.)** | ~6,500 líneas |
| **Dependencias de producción** | 6 (React, ReactDOM, React Router, Tailwind, Lucide, Tailwind Vite) |
| **Dependencias de desarrollo** | 8 |
| **Modelos de IA** | 2 (LLaMA 3.3 70B, GLM-4.5 Air) |

---

## 15. Seguridad y Privacidad

### 15.1 Protección de Datos del Paciente

- El asistente IA **no debe recibir** datos identificables (nombre, cédula, expediente, teléfono, dirección)
- Detección automática de información sensible con regex en el backend
- Las consultas se almacenan solo como historial de sesión (3 mensajes máx.)
- **No hay base de datos persistente** — toda la información es ephemeral

### 15.2 Seguridad de la Aplicación

- CORS whitelist estricta (solo dominios autorizados)
- Rate limiting por IP (20 req/min)
- Headers de seguridad completos (CSP, HSTS, X-Frame-Options)
- Input sanitization en frontend y backend
- Límites de longitud en mensajes
- HTTPS forzado (HSTS preload)

---

## 16. Roadmap de Mejoras Sugeridas

| Prioridad | Mejora | Impacto |
|-----------|--------|---------|
| Alta | Integración con Google Calendar API (automática, sin .ics manual) | UX paciente |
| Alta | PWA (Progressive Web App) con notificaciones push | Accesibilidad |
| Media | Modo offline para calculadora y triaje | Disponibilidad |
| Media | Dashboard de analytics educativo | Medición de impacto |
| Media | Internacionalización (i18n) | Escalabilidad |
| Media | Tests unitarios y de integración (Vitest) | Calidad |
| Baja | Integración con sistema clínico institucional (HL7/FHIR) | Interoperabilidad |
| Baja | Modo oscuro | UX |

---

## 17. Conclusión

NutriVida Biotech representa una **herramienta integral y de vanguardia** para el soporte de nutrición parenteral domiciliaria en Costa Rica. Su diferenciador radica en:

1. **Enfoque biotecnológico único** — Explica el origen científico de cada componente
2. **IA con guardias de seguridad** — NutriAsistente con triaje offline y detección de emergencias
3. **Cumplimiento FHIR R4** — Listo para integración con sistemas de salud electrónicos
4. **Segmentación por usuario** — Contenido adaptado a profesionales, pacientes y estudiantes
5. **Base clínica sólida** — Fundamentada en ESPEN, ASPEN y protocolos CCSS
6. **Privacidad por diseño** — Sin almacenamiento de datos identificables

La plataforma es una contribución gratuita al sistema de salud costarricense, desarrollada con apoyo de ACONEP y FELANPE.

---

*Reporte generado automáticamente a partir del análisis del código fuente de NutriVida Biotech v2.0*