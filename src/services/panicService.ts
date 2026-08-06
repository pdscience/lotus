import { supabase } from '../lib/supabase'
import type { PanicRecord, PanicAlertData } from '../types'
import { currentUserRef } from './authService'

export type { PanicRecord }

const STORAGE_KEY = 'panic_records'

export async function sendPanicAlert(data: PanicAlertData): Promise<{ error?: string }> {
  const user = currentUserRef.value
  
  const record: PanicRecord = {
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    latitude: data.latitude,
    longitude: data.longitude,
    audioUrl: null,
    imageUrl: null
  }

  if (user?.id) {
    const { error } = await supabase
      .database.from('panic_records')
      .insert([{
        id: record.id,
        usuario_id: user.id,
        latitude: record.latitude,
        longitude: record.longitude,
        audio_url: record.audioUrl,
        image_url: record.imageUrl
      }])

    if (error) {
      return { error: 'Erro ao salvar registro de pânico' }
    }
  }

  const records = getPanicRecords()
  records.unshift(record)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
  return {}
}

export async function updateLocation(_data: { latitude: number; longitude: number }): Promise<void> {
  // Future implementation - store location history
}

export function savePanicRecord(record: PanicRecord): void {
  const records = getPanicRecords()
  records.unshift(record)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records))
}

export function getPanicRecords(): PanicRecord[] {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (!stored) return []
  try {
    return JSON.parse(stored)
  } catch {
    return []
  }
}

export async function fetchPanicRecords(): Promise<PanicRecord[]> {
  const user = currentUserRef.value
  if (!user?.id) return getPanicRecords()

  const { data, error } = await supabase
    .database.from('panic_records')
    .select('*')
    .eq('usuario_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return getPanicRecords()
  }

  return (data || []).map((r: any) => ({
    id: r.id,
    timestamp: new Date(r.created_at).getTime(),
    latitude: r.latitude,
    longitude: r.longitude,
    audioUrl: r.audio_url,
    imageUrl: r.image_url
  }))
}

export async function deletePanicRecord(id: string): Promise<{ error?: string }> {
  const user = currentUserRef.value

  if (user?.id) {
    const { error } = await supabase
      .database.from('panic_records')
      .delete()
      .eq('id', id)

    if (error) {
      return { error: 'Erro ao remover registro de pânico' }
    }
  }

  const records = getPanicRecords()
  const filtered = records.filter(r => r.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  return {}
}

export function generatePanicId(): string {
  return `panic_${Date.now()}_${crypto.randomUUID()}`
}
