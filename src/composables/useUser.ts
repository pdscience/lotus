import { computed } from 'vue'
import { useUserStore } from '../stores/userStore'

export function useUser() {
  const store = useUserStore()
  
  const user = computed(() => store.user)
  const isAdmin = computed(() => store.isAdmin)
  const isVitima = computed(() => store.isVitima)
  const isAuthenticated = computed(() => store.isAuthenticated)
  const isLoading = computed(() => store.isLoading)

  const login = (email: string, password: string) => {
    return store.login(email, password)
  }

  const logout = () => {
    store.logout()
  }

  const init = () => {
    store.init()
  }

  return {
    user,
    isAdmin,
    isVitima,
    isAuthenticated,
    isLoading,
    login,
    logout,
    init
  }
}