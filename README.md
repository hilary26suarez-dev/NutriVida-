# NutriVida Biotech

NutriVida Biotech es una aplicación web de apoyo para pacientes, cuidadores y profesionales relacionados con nutrición parenteral domiciliaria en Costa Rica.

El objetivo del proyecto es reducir errores evitables, mejorar la educación del paciente y facilitar conversaciones más claras con el equipo de salud. No sustituye la prescripción médica, la validación farmacéutica ni el entrenamiento clínico recibido por cada paciente.

## Módulos

- **Paciente y cuidador:** recordatorios de infusión, vencimiento de bolsa, retiro de bolsas, checklist diaria, señales de alarma y asistente educativo.
- **Profesional:** calculadora inicial de nutrición parenteral, semáforo de estabilidad Ca-PO4 y consulta de compatibilidades.
- **NutriAsistente:** asistente IA con instrucciones de seguridad para explicar conceptos, orientar sobre logística y reforzar cuándo contactar al equipo médico.

## Seguridad del paciente

La aplicación refuerza que el paciente debe contactar a su equipo médico o al 911 si presenta fiebre mayor de 38 °C, escalofríos, dificultad respiratoria, dolor en el pecho, enrojecimiento o secreción en el catéter, hinchazón del brazo/cuello o una bolsa con partículas, capas separadas o color anormal.

Las funciones clínicas son de apoyo educativo y operativo. Cualquier cálculo o compatibilidad debe validarse con profesionales de soporte nutricional, farmacia clínica y lineamientos institucionales vigentes.

## Privacidad

El asistente no debe recibir datos identificables como nombre completo, cédula, expediente, teléfono, dirección o ubicación exacta. Las consultas al asistente se envían a una función serverless de Netlify y luego a OpenRouter mediante `OPENROUTER_API_KEY`.

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Despliegue en Netlify

Configurar estas variables de entorno en Netlify:

```text
OPENROUTER_API_KEY=...
ALLOWED_ORIGINS=https://nutrividabio.netlify.app
```

Si usa un entorno de desarrollo local, puede incluir también:

```text
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173,https://nutrividabio.netlify.app
```

La función del asistente vive en:

```text
netlify/functions/chat.js
```

## Nota clínica

NutriVida Biotech es una herramienta de acompañamiento y educación. No diagnostica, no prescribe, no cambia dosis ni reemplaza la atención del equipo médico.
