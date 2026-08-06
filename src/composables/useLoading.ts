import { ref, computed } from 'vue'

interface LoadingState {
  [key: string]: boolean
}

const loadingStates = ref<LoadingState>({})

export function useLoading() {
  const isLoading = computed(() => (key: string) => !!loadingStates.value[key])
  
  const startLoading = (key: string = 'default') => {
    loadingStates.value[key] = true
  }

  const stopLoading = (key: string = 'default') => {
    loadingStates.value[key] = false
  }

  const setLoading = (key: string, value: boolean) => {
    loadingStates.value[key] = value
  }

  const withLoading = async <T>(key: string, fn: () => Promise<T>): Promise<T | undefined> => {
    try {
      loadingStates.value[key] = true
      return await fn()
    } finally {
      loadingStates.value[key] = false
    }
  }

  return {
    isLoading,
    startLoading,
    stopLoading,
    setLoading,
    withLoading
  }
}