import { supabase } from '../lib/supabase'

export interface MedidaProtetivaAll {
  id: string
  numero_processo: string
  nome_ofendida: string
  nome_ofensor: string
  data_registro: string
  status: 'ativa' | 'suspensa' | 'revogada' | 'finalizada'
  urgencia: 'baixa' | 'media' | 'alta' | 'critica'
  cidade: string
  uf: string
  tipo: string[]
  local_trabalho_vitima?: string
  escola_vitima?: string
  escola_dependente?: string
  usuario_id?: string
  latitude_vitima?: number
  longitude_vitima?: number
  latitude_agressor?: number
  longitude_agressor?: number
  endereco_vitima?: string
  endereco_agressor?: string
  bairro_vitima?: string
  bairro_agressor?: string
}

export async function fetchMedidasProtetivas(): Promise<MedidaProtetivaAll[]> {
  const { data, error } = await supabase
    .database.from('medidas_protetivas')
    .select('*')
    .order('data_registro', { ascending: false })

  if (error) {
    console.error('Erro ao buscar medidas protetivas:', error)
    return []
  }

  return (data || []).map((m: any) => ({
    id: m.id,
    numero_processo: m.numero_processo || '',
    nome_ofendida: m.nome_ofendida || m.nome || '',
    nome_ofensor: m.nome_ofensor || '',
    data_registro: m.data_registro || m.data_inicio || '',
    status: m.status || 'ativa',
    urgencia: m.urgencia || 'media',
    cidade: m.cidade || '',
    uf: m.uf || 'MS',
    tipo: Array.isArray(m.tipo) ? m.tipo : (m.tipo ? [m.tipo] : []),
    local_trabalho_vitima: m.local_trabalho_vitima,
    escola_vitima: m.escola_vitima,
    escola_dependente: m.escola_dependente,
    usuario_id: m.usuario_id,
    latitude_vitima: m.latitude_vitima ?? undefined,
    longitude_vitima: m.longitude_vitima ?? undefined,
    latitude_agressor: m.latitude_agressor ?? undefined,
    longitude_agressor: m.longitude_agressor ?? undefined,
    endereco_vitima: m.endereco_vitima || undefined,
    endereco_agressor: m.endereco_agressor || undefined,
    bairro_vitima: m.bairro_vitima || undefined,
    bairro_agressor: m.bairro_agressor || undefined
  }))
}
