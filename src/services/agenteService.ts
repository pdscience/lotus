import { supabase } from '../lib/supabase'
import type { AgenteMonitoramento } from '../types'
import { currentUserRef } from './authService'

export type { AgenteMonitoramento }

function mapRow(r: any): AgenteMonitoramento {
  return {
    id: r.id,
    agente_id: r.agente_id,
    vitima_nome: r.vitima_nome,
    vitima_cpf: r.vitima_cpf,
    vitima_telefone: r.vitima_telefone,
    vitima_endereco: r.vitima_endereco,
    agressor_nome: r.agressor_nome,
    agressor_cpf: r.agressor_cpf,
    agressor_telefone: r.agressor_telefone,
    agressor_endereco: r.agressor_endereco,
    medida_id: r.medida_id,
    numero_processo: r.numero_processo,
    data_monitoramento: r.data_monitoramento,
    hora: r.hora,
    condicao_vitima: r.condicao_vitima,
    situacao_monitorada: r.situacao_monitorada,
    localizacao_verificada: r.localizacao_verificada,
    restricao_respeitada: r.restricao_respeitada,
    observacoes: r.observacoes,
    risco: r.risco,
    encaminhamentos: r.encaminhamentos,
    status_visita: r.status_visita || 'pendente',
    status_patrulha: r.status_patrulha || 'pendente',
    ultima_atualizacao: r.ultima_atualizacao,
    obs_patrulha: r.obs_patrulha,
    created_at: r.created_at
  }
}

export async function fetchMonitoramentos(): Promise<AgenteMonitoramento[]> {
  const user = currentUserRef.value
  if (!user?.id) return []

  const { data, error } = await supabase
    .database.from('agente_monitoramento')
    .select('*')
    .eq('agente_id', user.id)
    .order('data_monitoramento', { ascending: false })
    .order('hora', { ascending: false })

  if (error) return []

  return (data || []).map(mapRow)
}

export async function fetchAllMonitoramentos(): Promise<AgenteMonitoramento[]> {
  const { data, error } = await supabase
    .database.from('agente_monitoramento')
    .select('*')
    .order('data_monitoramento', { ascending: false })
    .order('hora', { ascending: false })

  if (error) return []

  return (data || []).map(mapRow)
}

export async function saveMonitoramento(m: Omit<AgenteMonitoramento, 'id' | 'created_at' | 'agente_id'>): Promise<{ error?: string; data?: AgenteMonitoramento }> {
  const user = currentUserRef.value
  if (!user?.id) return { error: 'Agente não autenticado' }

  const { data, error } = await supabase
    .database.from('agente_monitoramento')
    .insert([{
      agente_id: user.id,
      vitima_nome: m.vitima_nome,
      vitima_cpf: m.vitima_cpf,
      vitima_telefone: m.vitima_telefone,
      vitima_endereco: m.vitima_endereco,
      agressor_nome: m.agressor_nome,
      agressor_cpf: m.agressor_cpf,
      agressor_telefone: m.agressor_telefone,
      agressor_endereco: m.agressor_endereco,
      medida_id: m.medida_id,
      numero_processo: m.numero_processo,
      data_monitoramento: m.data_monitoramento,
      hora: m.hora,
      condicao_vitima: m.condicao_vitima,
      situacao_monitorada: m.situacao_monitorada,
      localizacao_verificada: m.localizacao_verificada,
      restricao_respeitada: m.restricao_respeitada,
      observacoes: m.observacoes,
      risco: m.risco,
      encaminhamentos: m.encaminhamentos,
      status_visita: m.status_visita || 'pendente',
      status_patrulha: m.status_patrulha || 'pendente',
      obs_patrulha: m.obs_patrulha
    }])
    .select()
    .single()

  if (error) return { error: 'Erro ao salvar monitoramento' }

  return { data: mapRow(data) }
}

export async function updateMonitoramento(id: string, updates: Partial<Pick<AgenteMonitoramento, 'status_visita' | 'status_patrulha' | 'obs_patrulha' | 'condicao_vitima' | 'situacao_monitorada' | 'risco' | 'localizacao_verificada' | 'restricao_respeitada' | 'observacoes' | 'encaminhamentos'>>): Promise<{ error?: string }> {
  const { error } = await supabase
    .database.from('agente_monitoramento')
    .update({
      ...updates,
      ultima_atualizacao: new Date().toISOString()
    })
    .eq('id', id)

  if (error) return { error: 'Erro ao atualizar monitoramento' }
  return {}
}

export async function deleteMonitoramento(id: string): Promise<{ error?: string }> {
  const { error } = await supabase
    .database.from('agente_monitoramento')
    .delete()
    .eq('id', id)

  if (error) return { error: 'Erro ao remover monitoramento' }
  return {}
}
