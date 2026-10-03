import axios from 'axios'

export interface ApiError {
  message: string
  code?: string
  status?: number
}

const CSRF_KEY = 'lotus-csrf-token'
const LEGACY_CSRF_KEYS = ['protegida-csrf-token', 'ampare-csrf-token']
const TOKEN_KEY = 'lotus-token'
const LEGACY_TOKEN_KEYS = ['protegida-token', 'ampare-token']
const USER_KEY = 'lotus-user'
const LEGACY_USER_KEYS = ['protegida-user', 'ampare-user']
const USER_TYPE_KEY = 'lotus-user-type'
const LEGACY_USER_TYPE_KEYS = ['protegida-user-type', 'ampare-user-type']

function migrate(key: string, legacy: string): void {
  const v = localStorage.getItem(legacy)
  if (v && !localStorage.getItem(key)) localStorage.setItem(key, v)
  if (v) localStorage.removeItem(legacy)
}
for (const legacy of LEGACY_TOKEN_KEYS) migrate(TOKEN_KEY, legacy)
for (const legacy of LEGACY_CSRF_KEYS) migrate(CSRF_KEY, legacy)

function generateCSRFToken(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

export function getCSRFToken(): string {
  let token = localStorage.getItem(CSRF_KEY)
  if (!token) {
    token = generateCSRFToken()
    localStorage.setItem(CSRF_KEY, token)
  }
  return token
}

export function setCSRFToken(token: string): void {
  localStorage.setItem(CSRF_KEY, token)
}

export function removeCSRFToken(): void {
  localStorage.removeItem(CSRF_KEY)
}

export function refreshCSRFToken(): void {
  const newToken = generateCSRFToken()
  localStorage.setItem(CSRF_KEY, newToken)
}

const api = axios.create({
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }
  
  const csrfToken = getCSRFToken()
  if (csrfToken && config.headers) {
    config.headers['X-CSRF-Token'] = csrfToken
  }
  
  return config
})

api.interceptors.response.use(
  (response) => {
    const csrfToken = response.headers['x-csrf-token']
    if (csrfToken) {
      setCSRFToken(csrfToken)
    }
    return response
  },
  (error: any) => {
    const apiError: ApiError = {
      message: error.message || 'Erro desconhecido',
      status: error.response?.status
    }

    if (error.response?.status === 401) {
      localStorage.removeItem(USER_KEY)
      localStorage.removeItem(USER_TYPE_KEY)
      for (const legacy of LEGACY_USER_KEYS) localStorage.removeItem(legacy)
      for (const legacy of LEGACY_USER_TYPE_KEYS) localStorage.removeItem(legacy)
      removeCSRFToken()
      window.location.href = '/login'
    }

    if (error.response?.status === 403) {
      apiError.message = 'Acesso não autorizado'
    }

    if (error.response?.status === 419) {
      refreshCSRFToken()
      apiError.message = 'Sessão expirada, tente novamente'
    }

    if (error.code === 'ECONNABORTED') {
      apiError.message = 'Tempo de espera esgotado'
    }

    if (!error.response) {
      apiError.message = 'Sem conexão com o servidor'
    }

    return Promise.reject(apiError)
  }
)

export { api }
export default api