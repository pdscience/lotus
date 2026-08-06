import { supabase } from '../lib/supabase'
import type { MedidaProtetiva } from '../types'
import { currentUserRef } from './authService'

export function getMedidaVitima(): MedidaProtetiva[] {
  const stored = localStorage.getItem('medidas_vitima')
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export async function fetchMedidasVitima(): Promise<MedidaProtetiva[]> {
  const user = currentUserRef.value
  if (!user?.id) return getMedidaVitima()

  const { data, error } = await supabase
    .database.from('medidas_protetivas')
    .select('*')
    .eq('usuario_id', user.id)
    .order('data_inicio', { ascending: false })

  if (error) {
    return getMedidaVitima()
  }

  return (data || []).map((m: any) => ({
    id: m.id,
    tipo: m.tipo,
    descricao: m.descricao,
    dataInicio: m.data_inicio,
    dataFim: m.data_fim,
    status: m.status,
    numeroProcesso: m.numero_processo
  }))
}

export async function saveMedidaVitima(medida: MedidaProtetiva): Promise<{ error?: string }> {
  const user = currentUserRef.value
  if (!user?.id) {
    const medidas = getMedidaVitima()
    medidas.unshift(medida)
    localStorage.setItem('medidas_vitima', JSON.stringify(medidas))
    return {}
  }

  const { error } = await supabase
    .database.from('medidas_protetivas')
    .insert([{
      id: medida.id,
      usuario_id: user.id,
      tipo: medida.tipo,
      descricao: medida.descricao,
      data_inicio: medida.dataInicio,
      data_fim: medida.dataFim,
      status: medida.status,
      numero_processo: medida.numeroProcesso
    }])

  if (error) {
    return { error: 'Erro ao salvar medida protetiva' }
  }
  return {}
}

export async function deleteMedidaVitima(id: string): Promise<{ error?: string }> {
  const user = currentUserRef.value
  if (!user?.id) {
    const medidas = getMedidaVitima().filter(m => m.id !== id)
    localStorage.setItem('medidas_vitima', JSON.stringify(medidas))
    return {}
  }

  const { error } = await supabase
    .database.from('medidas_protetivas')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: 'Erro ao deletar medida protetiva' }
  }
  return {}
}
