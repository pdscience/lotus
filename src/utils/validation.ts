export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  email?: boolean
  cpf?: boolean
  cnpj?: boolean
  phone?: boolean
  custom?: (value: any) => boolean | string
}

export interface ValidationRules {
  [field: string]: ValidationRule | ValidationRule[]
}

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

const PHONE_REGEX = /^\(?\d{2}\)?\s?\d{4,5}-?\d{4}$/
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validateCPF(cpf: string): boolean {
  const nums = cpf.replace(/\D/g, '')
  if (nums.length !== 11) return false
  if (/^(\d)\1{10}$/.test(nums)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(nums[i]) * (10 - i)
  }
  let digit1 = sum * 10 % 11
  if (digit1 === 10) digit1 = 0
  if (digit1 !== parseInt(nums[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(nums[i]) * (11 - i)
  }
  let digit2 = sum * 10 % 11
  if (digit2 === 10) digit2 = 0
  if (digit2 !== parseInt(nums[10])) return false

  return true
}

function validateCNPJ(cnpj: string): boolean {
  const nums = cnpj.replace(/\D/g, '')
  if (nums.length !== 14) return false
  if (/^(\d)\1{13}$/.test(nums)) return false

  let sum = 0
  let weight = 2
  for (let i = 11; i >= 0; i--) {
    sum += parseInt(nums[i]) * weight
    weight = weight === 9 ? 2 : weight + 1
  }
  const digit1 = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (digit1 !== parseInt(nums[12])) return false

  sum = 0
  weight = 2
  for (let i = 12; i >= 0; i--) {
    sum += parseInt(nums[i]) * weight
    weight = weight === 9 ? 2 : weight + 1
  }
  const digit2 = sum % 11 < 2 ? 0 : 11 - (sum % 11)
  if (digit2 !== parseInt(nums[13])) return false

  return true
}

export function validateField(value: any, rule: ValidationRule): string | null {
  if (rule.required && (value === undefined || value === null || value === '')) {
    return 'Campo obrigatório'
  }

  if (value === undefined || value === null || value === '') {
    return null
  }

  const strValue = String(value)

  if (rule.minLength && strValue.length < rule.minLength) {
    return `Mínimo de ${rule.minLength} caracteres`
  }

  if (rule.maxLength && strValue.length > rule.maxLength) {
    return `Máximo de ${rule.maxLength} caracteres`
  }

  if (rule.min && Number(value) < rule.min) {
    return `Valor mínimo: ${rule.min}`
  }

  if (rule.max && Number(value) > rule.max) {
    return `Valor máximo: ${rule.max}`
  }

  if (rule.email && !EMAIL_REGEX.test(strValue)) {
    return 'Email inválido'
  }

  if (rule.cpf && !validateCPF(strValue)) {
    return 'CPF inválido'
  }

  if (rule.cnpj && !validateCNPJ(strValue)) {
    return 'CNPJ inválido'
  }

  if (rule.phone && !PHONE_REGEX.test(strValue)) {
    return 'Telefone inválido'
  }

  if (rule.pattern && !rule.pattern.test(strValue)) {
    return 'Formato inválido'
  }

  if (rule.custom) {
    const result = rule.custom(value)
    if (result !== true && typeof result === 'string') {
      return result
    }
    if (result === false) {
      return 'Valor inválido'
    }
  }

  return null
}

export function validate(data: Record<string, any>, rules: ValidationRules): ValidationResult {
  const errors: ValidationError[] = []

  for (const field in rules) {
    const fieldRules = Array.isArray(rules[field]) 
      ? rules[field] 
      : [rules[field]]
    
    for (const rule of fieldRules) {
      const error = validateField(data[field], rule)
      if (error) {
        errors.push({ field, message: error })
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function formatCPF(cpf: string): string {
  const nums = cpf.replace(/\D/g, '')
  if (nums.length !== 11) return cpf
  return `${nums.slice(0,3)}.${nums.slice(3,6)}.${nums.slice(6,9)}-${nums.slice(9)}`
}

export function formatCNPJ(cnpj: string): string {
  const nums = cnpj.replace(/\D/g, '')
  if (nums.length !== 14) return cnpj
  return `${nums.slice(0,2)}.${nums.slice(2,5)}.${nums.slice(5,8)}/${nums.slice(8,12)}-${nums.slice(12)}`
}

export function formatPhone(phone: string): string {
  const nums = phone.replace(/\D/g, '')
  if (nums.length === 10) {
    return `(${nums.slice(0,2)}) ${nums.slice(2,6)}-${nums.slice(6)}`
  }
  if (nums.length === 11) {
    return `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7)}`
  }
  return phone
}