import { createClient } from '@insforge/sdk'

const INSFORGE_URL = import.meta.env.VITE_INSFORGE_URL || 'https://tna9zi8t.us-east.insforge.app'
const ANON_KEY = import.meta.env.VITE_INSFORGE_ANON_KEY || ''

export const supabase = createClient({
  baseUrl: INSFORGE_URL,
  anonKey: ANON_KEY
})

export default supabase