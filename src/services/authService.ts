import { ref } from 'vue'
import { supabase } from '../lib/supabase'
import type { User, UserType } from '../types'
export type { LoginCredentials } from '../types'

export const currentUserRef = ref<User | null>(null)

function mapUser(u: { id: string; email: string; metadata: Record<string, unknown> | null; profile: { name?: string } | null }): User {
  const tipo = (u.metadata?.tipo || (u.profile as Record<string, unknown>)?.tipo) as UserType | undefined
  return {
    id: u.id,
    email: u.email || '',
    nome: u.profile?.name || u.email?.split('@')[0] || '',
    tipo: tipo || 'vitima'
  }
}

export async function getCurrentUser(): Promise<User | null> {
  if (currentUserRef.value) return currentUserRef.value

  try {
    const { data, error } = await supabase.auth.getCurrentUser()
    if (error || !data?.user) {
      return null
    }

    const userObj = mapUser(data.user)
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

  const userObj = mapUser(data.user)
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
