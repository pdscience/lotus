import { ref, watch } from 'vue'

type Theme = 'dark' | 'light'
const theme = ref<Theme>('dark')
const THEME_KEY = 'lotus-theme'
const LEGACY_THEME_KEY = 'protegida-theme'
let started = false

function apply(t: Theme) {
  document.documentElement.classList.toggle('dark', t === 'dark')
  try { localStorage.setItem(THEME_KEY, t) } catch { /* ignore */ }
}

export function useTheme() {
  return { theme, toggle: () => { theme.value = theme.value === 'dark' ? 'light' : 'dark' } }
}

export function initTheme(): void {
  if (started) return
  started = true
  let saved: string | null = null
  try {
    saved = localStorage.getItem(THEME_KEY)
    if (!saved) {
      saved = localStorage.getItem(LEGACY_THEME_KEY)
      if (saved) localStorage.removeItem(LEGACY_THEME_KEY)
    }
  } catch { /* ignore */ }
  if (saved === 'light' || saved === 'dark') theme.value = saved
  else if (window.matchMedia?.('(prefers-color-scheme: light)').matches) theme.value = 'light'
  apply(theme.value)
  watch(theme, apply)
}
