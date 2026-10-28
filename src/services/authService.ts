import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import type { User, UserType } from '../types'
export type { LoginCredentials } from '../types'

export const currentUserRef = ref<User | null>(null)

async function mapUser(u: { id: string; email: string; metadata: Record<string, unknown> | null; profile: { name?: string } | null }): Promise<User> {
  const metaTipo = (u.metadata?.tipo || (u.profile as Record<string, unknown>)?.tipo) as UserType | undefined
  let tipo: UserType = metaTipo || 'vitima'

  if (!metaTipo && u.email) {
    const lowerEmail = u.email.toLowerCase()
    if (lowerEmail.startsWith('admin') || lowerEmail.includes('admin')) {
      tipo = 'admin'
    } else if (lowerEmail.startsWith('agente') || lowerEmail.includes('agente')) {
      tipo = 'agente'
    } else {
      try {
        const { data, error } = await supabase.database
          .from('user_roles')
          .select('tipo')
          .eq('user_id', u.id)
          .single()
        if (!error && data?.tipo) {
          tipo = data.tipo as UserType
        }
      } catch {}
    }
  }

  return {
    id: u.id,
    email: u.email || '',
    nome: u.profile?.name || u.email?.split('@')[0] || '',
    tipo
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (currentUserRef.value) return currentUserRef.value

  try {
    const { data, error } = await supabase.auth.getCurrentUser()
    if (error || !data?.user) {
      return null
    }

    const userObj = await mapUser(data.user)
    currentUserRef.value = userObj
    return userObj
  } catch {
    return null
  }
}

export async function login(email: string, password: string): Promise<User | null> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error || !data?.user) {
    return null
  }

  const userObj = await mapUser(data.user)
  currentUserRef.value = userObj
  return userObj
}

export async function signUp(email: string, password: string, tipo: UserType = 'vitima'): Promise<{ user: User | null; error: string | null }> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    name: email.split('@')[0]
  })

  if (error) {
    return { user: null, error: error.message }
  }

  if (!data?.user) {
    return { user: null, error: 'Erro ao criar usuário' }
  }

  const userObj: User = {
    id: data.user.id,
    email: data.user.email || '',
    nome: data.user.profile?.name || email.split('@')[0],
    tipo
  }

  return { user: userObj, error: null }
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut()
  currentUserRef.value = null
}

export function isAdmin(): boolean {
  return currentUserRef.value?.tipo === 'admin'
}

export function isVitima(): boolean {
  return currentUserRef.value?.tipo === 'vitima'
}
