import axios from 'axios'

export interface ApiError {
  message: string
  code?: string
  status?: number
}

const CSRF_KEY = 'protegida-csrf-token'
const LEGACY_CSRF_KEY = 'ampare-csrf-token'
const TOKEN_KEY = 'protegida-token'
const LEGACY_TOKEN_KEY = 'ampare-token'

function migrate(key: string, legacy: string): void {
  const v = localStorage.getItem(legacy)
  if (v && !localStorage.getItem(key)) localStorage.setItem(key, v)
  if (v) localStorage.removeItem(legacy)
}
migrate(TOKEN_KEY, LEGACY_TOKEN_KEY)
migrate(CSRF_KEY, LEGACY_CSRF_KEY)

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
  const token = localStorage.getItem('protegida-token')
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
      localStorage.removeItem('protegida-user')
      localStorage.removeItem('protegida-user-type')
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