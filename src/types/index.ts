export type UserType = 'admin' | 'vitima' | 'agente'

export type AgenteOrgao = 'PM' | 'PC' | 'GCM' | 'MP' | 'OUTRO'

export interface User {
  id: string
  email: string
  nome: string
  username?: string
  tipo: UserType
  telefone?: string
  orgao?: AgenteOrgao
  matricula?: string
}

export interface LoginCredentials {
  email: string
  password: string
  tipo: UserType
}

export interface PanicAlertData {
  usuario?: string
  latitude: number
  longitude: number
  audioUrl?: string | null
  imageUrl?: string | null
}

export interface LocationUpdateData {
  latitude: number
  longitude: number
}

export interface PanicRecord {
  id: string
  timestamp: number
  latitude: number
  longitude: number
  audioUrl: string | null
  imageUrl: string | null
}

export interface ContatoAnjo {
  id: string
  nome: string
  telefone: string
  parentesco?: string
}

export interface MedidaProtetiva {
  id: string
  tipo: string
  descricao: string
  dataInicio: string
  dataFim?: string
  status: 'ativa' | 'encerrada' | 'revogada'
  numeroProcesso?: string
}

export interface RedeApoio {
  id: string
  nome: string
  tipo: 'ong' | 'abrigo' | 'delegacia' | 'hospital' | 'outros'
  telefone: string
  endereco: string
  latitude: number
  longitude: number
  cidade?: string
  uf?: string
  horario?: string
}

export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface ApiError {
  message: string
  code?: string
  status?: number
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface AgenteMonitoramento {
  id: string
  agente_id: string
  vitima_nome: string
  vitima_cpf?: string
  vitima_telefone?: string
  vitima_endereco?: string
  agressor_nome: string
  agressor_cpf?: string
  agressor_telefone?: string
  agressor_endereco?: string
  medida_id?: string
  numero_processo?: string
  data_monitoramento: string
  hora: string
  condicao_vitima: string
  situacao_monitorada: string
  localizacao_verificada: boolean
  restricao_respeitada: boolean
  observacoes?: string
  risco: 'baixo' | 'medio' | 'alto' | 'critico'
  encaminhamentos?: string
  status_visita: 'pendente' | 'visitada' | 'nao_visitada' | 'agendada'
  status_patrulha: 'pendente' | 'em_deslocamento' | 'no_local' | 'concluido' | 'nao_foi_possivel'
  ultima_atualizacao?: string
  obs_patrulha?: string
  created_at?: string
}