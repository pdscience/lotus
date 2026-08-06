import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User } from '../types'
import { login as authLogin, logout as authLogout, getCurrentUser } from '../services/authService'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const isLoading = ref(false)

  const isAdmin = computed(() => user.value?.tipo === 'admin')
  const isVitima = computed(() => user.value?.tipo === 'vitima')
  const isAuthenticated = computed(() => !!user.value)

  async function init() {
    isLoading.value = true
    try {
      user.value = await getCurrentUser()
    } finally {
      isLoading.value = false
    }
  }

  async function login(email: string, password: string): Promise<boolean> {
    isLoading.value = true
    try {
      const loggedUser = await authLogin(email, password)
      if (loggedUser) {
        user.value = loggedUser
        return true
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    try {
      await authLogout()
    } finally {
      user.value = null
    }
  }

  return {
    user,
    isLoading,
    isAdmin,
    isVitima,
    isAuthenticated,
    init,
    login,
    logout
  }
})