const LOCALE = 'pt-BR'
const CURRENCY = 'BRL'

export function formatCurrency(
  value: number | string,
  options?: {
    currency?: string
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    compact?: boolean
  }
): string {
  const {
    currency = CURRENCY,
    locale = LOCALE,
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
    compact = false
  } = options || {}

  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) {
    return '-'
  }

  if (compact && Math.abs(numValue) >= 1000) {
    const compactOptions: Intl.NumberFormatOptions = {
      style: 'currency',
      currency,
      notation: 'compact',
      minimumFractionDigits: 0,
      maximumFractionDigits: 1
    }
    return new Intl.NumberFormat(locale, compactOptions).format(numValue)
  }

  const formatOptions: Intl.NumberFormatOptions = {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits
  }

  return new Intl.NumberFormat(locale, formatOptions).format(numValue)
}

export function formatNumber(
  value: number | string,
  options?: {
    locale?: string
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    useGrouping?: boolean
  }
): string {
  const {
    locale = LOCALE,
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    useGrouping = true
  } = options || {}

  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) {
    return '-'
  }

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
    useGrouping
  }).format(numValue)
}

export function formatPercent(
  value: number | string,
  options?: {
    locale?: string
    style?: 'percent' | 'decimal'
    minimumFractionDigits?: number
    maximumFractionDigits?: number
    multiplyBy100?: boolean
  }
): string {
  const {
    locale = LOCALE,
    style = 'percent',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    multiplyBy100 = true
  } = options || {}

  let numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) {
    return '-'
  }

  if (multiplyBy100) {
    numValue = numValue / 100
  }

  return new Intl.NumberFormat(locale, {
    style,
    minimumFractionDigits,
    maximumFractionDigits
  }).format(numValue)
}

export function formatFileSize(
  bytes: number,
  options?: {
    locale?: string
    precision?: number
  }
): string {
  const { locale = LOCALE, precision = 1 } = options || {}

  if (bytes === 0) return '0 B'

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const k = 1024
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${formatNumber(bytes / Math.pow(k, i), {
    locale,
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  })} ${units[i]}`
}

export function parseCurrency(value: string): number {
  const cleaned = value
    .replace(/[^0-9.,]/g, '')
    .replace(',', '.')
  
  return parseFloat(cleaned) || 0
}

export function formatDistance(
  value: number,
  options?: {
    locale?: string
    unit?: 'meter' | 'kilometer'
    precision?: number
  }
): string {
  const { locale = LOCALE, unit = 'kilometer', precision = 1 } = options || {}

  if (unit === 'meter') {
    return formatNumber(value, { locale, maximumFractionDigits: precision }) + ' m'
  }

  const km = value / 1000
  if (km < 1) {
    return formatNumber(value, { locale, maximumFractionDigits: 0 }) + ' m'
  }

  return formatNumber(km, { locale, maximumFractionDigits: precision }) + ' km'
}