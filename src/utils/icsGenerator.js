function formatICSDate(date) {
  return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function sanitize(str) {
  return str.replace(/[,;\\]/g, '\\$&').replace(/\n/g, '\\n')
}

export function generateICS({ title, description, startDate, durationMinutes = 30 }) {
  const end = new Date(startDate.getTime() + durationMinutes * 60 * 1000)
  const uid = `${Date.now()}-nutrivida@nutrivida-biotech`

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NutriVida Biotech//ES',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART:${formatICSDate(startDate)}`,
    `DTEND:${formatICSDate(end)}`,
    `SUMMARY:${sanitize(title)}`,
    `DESCRIPTION:${sanitize(description)}`,
    `UID:${uid}`,
    'BEGIN:VALARM',
    'TRIGGER:PT0S',
    'ACTION:DISPLAY',
    `DESCRIPTION:${sanitize(title)}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadICS(icsContent, filename) {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function generateNPReminders(infusionHour, infusionMinute) {
  const now = new Date()
  const infusionTime = new Date(now)
  infusionTime.setHours(infusionHour, infusionMinute, 0, 0)
  if (infusionTime <= now) infusionTime.setDate(infusionTime.getDate() + 1)

  const tempTime = new Date(infusionTime.getTime() - 90 * 60 * 1000)
  const expiryTime = new Date(infusionTime.getTime() + 5 * 24 * 60 * 60 * 1000)

  return {
    temperatura: generateICS({
      title: '🌡 Sacar bolsa NP del refrigerador',
      description: 'Es momento de sacar su bolsa de nutrición parenteral del refrigerador. Déjela a temperatura ambiente 1.5 horas antes de iniciar la infusión. No exponga al calor ni a la luz solar directa.',
      startDate: tempTime,
      durationMinutes: 15,
    }),
    infusion: generateICS({
      title: '💉 Iniciar infusión de NP',
      description: 'Hora de iniciar su infusión de nutrición parenteral. Recuerde lavarse las manos y seguir el procedimiento aséptico indicado por su equipo médico.',
      startDate: infusionTime,
      durationMinutes: 30,
    }),
    vencimiento: generateICS({
      title: '⚠️ Verificar vencimiento bolsa NP',
      description: 'Su bolsa de nutrición parenteral está próxima a vencer (5 días desde preparación). Verifique la fecha en la etiqueta. Si tiene duda, contacte a su farmacia.',
      startDate: expiryTime,
      durationMinutes: 30,
    }),
  }
}
