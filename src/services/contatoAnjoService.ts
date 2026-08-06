import { supabase } from '../lib/supabase'
import type { ContatoAnjo } from '../types'
import { currentUserRef } from './authService'

export type { ContatoAnjo }

export function getContatosAnjo(): ContatoAnjo[] {
  const stored = localStorage.getItem('contatos_anjo')
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export async function fetchContatosAnjo(): Promise<ContatoAnjo[]> {
  const user = currentUserRef.value
  if (!user?.id) return getContatosAnjo()

  const { data, error } = await supabase
    .database.from('contatos_anjo')
    .select('*')
    .eq('usuario_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return getContatosAnjo()
  }

  return (data || []).map((r: any) => ({
    id: r.id,
    nome: r.nome,
    telefone: r.telefone,
    parentesco: r.parentesco
  }))
}

export async function saveContatoAnjo(contato: ContatoAnjo): Promise<{ error?: string }> {
  const user = currentUserRef.value
  if (!user?.id) {
    const contatos = getContatosAnjo()
    contatos.unshift(contato)
    localStorage.setItem('contatos_anjo', JSON.stringify(contatos))
    return {}
  }

  const { error } = await supabase
    .database.from('contatos_anjo')
    .insert([{
      id: contato.id,
      usuario_id: user.id,
      nome: contato.nome,
      telefone: contato.telefone,
      parentesco: contato.parentesco
    }])

  if (error) {
    return { error: 'Erro ao salvar contato' }
  }
  return {}
}

export async function removeContatoAnjo(id: string): Promise<{ error?: string }> {
  const user = currentUserRef.value
  if (!user?.id) {
    const contatos = getContatosAnjo().filter(c => c.id !== id)
    localStorage.setItem('contatos_anjo', JSON.stringify(contatos))
    return {}
  }

  const { error } = await supabase
    .database.from('contatos_anjo')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: 'Erro ao remover contato' }
  }
  return {}
}

export const getContatosParaAlerta = getContatosAnjo
export const deleteContatoAnjo = removeContatoAnjo
