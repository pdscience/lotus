export type DateFormat = 'full' | 'short' | 'time' | 'date' | 'datetime' | 'relative'

const LOCALE = 'pt-BR'

export function formatDate(
  date: string | number | Date,
  format: DateFormat = 'datetime',
  options?: Intl.DateTimeFormatOptions
): string {
  const d = new Date(date)
  
  if (isNaN(d.getTime())) {
    return '-'
  }

  switch (format) {
    case 'full':
      return d.toLocaleDateString(LOCALE, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        ...options
      })

    case 'short':
      return d.toLocaleDateString(LOCALE, {
        year: '2-digit',
        month: 'short',
        day: 'numeric',
        ...options
      })

    case 'time':
      return d.toLocaleTimeString(LOCALE, {
        hour: '2-digit',
        minute: '2-digit',
        ...options
      })

    case 'date':
      return d.toLocaleDateString(LOCALE, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        ...options
      })

    case 'datetime':
      return d.toLocaleDateString(LOCALE, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        ...options
      })

    case 'relative':
      return formatRelativeTime(d)

    default:
      return d.toLocaleDateString(LOCALE, options)
  }
}

export function formatRelativeTime(date: string | number | Date): string {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) {
    return 'agora mesmo'
  }

  if (diffMin < 60) {
    return `${diffMin} min${diffMin > 1 ? 's' : ''} atrás`
  }

  if (diffHour < 24) {
    return `${diffHour} hora${diffHour > 1 ? 's' : ''} atrás`
  }

  if (diffDay < 7) {
    return `${diffDay} dia${diffDay > 1 ? 's' : ''} atrás`
  }

  if (diffWeek < 4) {
    return `${diffWeek} semana${diffWeek > 1 ? 's' : ''} atrás`
  }

  if (diffMonth < 12) {
    return `${diffMonth} mê${diffMonth > 1 ? 'zes' : 's'} atrás`
  }

  return `${diffYear} ano${diffYear > 1 ? 's' : ''} atrás`
}

export function parseDate(dateString: string): Date | null {
  const patterns = [
    /^(\d{4})-(\d{2})-(\d{2})$/,
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})/,
    /^(\d{2})\/(\d{2})\/(\d{4})$/,
  ]

  for (const pattern of patterns) {
    const match = dateString.match(pattern)
    if (match) {
      const [_, year, month, day, hour, minute, second] = match
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        parseInt(hour || '0'),
        parseInt(minute || '0'),
        parseInt(second || '0')
      )
      if (!isNaN(date.getTime())) {
        return date
      }
    }
  }

  const parsed = new Date(dateString)
  return isNaN(parsed.getTime()) ? null : parsed
}

export function getDateRange(start: string | Date, end: string | Date): string {
  const startDate = new Date(start)
  const endDate = new Date(end)

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return '-'
  }

  const startStr = formatDate(startDate, 'date')
  const endStr = formatDate(endDate, 'date')

  return `${startStr} - ${endStr}`
}

export function isValidDate(date: any): boolean {
  if (!date) return false
  const d = new Date(date)
  return !isNaN(d.getTime())
}

export function getAge(birthDate: string | Date): number {
  const birth = new Date(birthDate)
  const today = new Date()
  
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

export function isExpired(date: string | Date, ttlDays: number = 0): boolean {
  const d = new Date(date)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffDays = diffMs / (1000 * 60 * 60 * 24)
  return diffDays > ttlDays
}