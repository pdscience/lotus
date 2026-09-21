export function isConfigured(): boolean {
  return Boolean(import.meta.env.VITE_IA_FUNCTION_URL)
}

export async function gerarApoio(prompt: string): Promise<string> {
  const url = import.meta.env.VITE_IA_FUNCTION_URL as string | undefined
  if (!url) throw new Error('IA não configurada')
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 20000)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt.slice(0, 2000) }),
      signal: ctrl.signal
    })
    if (!res.ok) throw new Error('Falha na IA')
    const data = await res.json() as { texto?: string }
    return data.texto ?? 'Respire com calma. Você não está sozinha. Procure sua rede de apoio.'
  } finally {
    clearTimeout(t)
  }
}
