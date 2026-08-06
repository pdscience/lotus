import { supabase } from '../lib/supabase'
import { currentUserRef } from './authService'

export interface Usuario {
  id: string
  user_id: string
  nome: string
  cpf?: string
  telefone?: string
  data_nascimento?: string
  endereco?: string
}

export async function fetchUsuario(): Promise<Usuario | null> {
  const user = currentUserRef.value
  if (!user?.id) return null

  const { data, error } = await supabase
    .database.from('usuarios')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    user_id: data.user_id,
    nome: data.nome,
    cpf: data.cpf,
    telefone: data.telefone,
    data_nascimento: data.data_nascimento,
    endereco: data.endereco
  }
}

export async function saveUsuario(profile: {
  nome: string
  cpf?: string
  telefone?: string
  data_nascimento?: string
  endereco?: string
}): Promise<{ error?: string }> {
  const user = currentUserRef.value
  if (!user?.id) return { error: 'Usuário não autenticado' }

  const existing = await fetchUsuario()

  if (existing) {
    const { error } = await supabase
      .database.from('usuarios')
      .update({
        nome: profile.nome,
        cpf: profile.cpf,
        telefone: profile.telefone,
        data_nascimento: profile.data_nascimento,
        endereco: profile.endereco,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)

    if (error) return { error: 'Erro ao atualizar perfil' }
  } else {
    const { error } = await supabase
      .database.from('usuarios')
      .insert([{
        user_id: user.id,
        nome: profile.nome,
        cpf: profile.cpf,
        telefone: profile.telefone,
        data_nascimento: profile.data_nascimento,
        endereco: profile.endereco
      }])

    if (error) return { error: 'Erro ao salvar perfil' }
  }

  return {}
}
