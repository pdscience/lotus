import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  message: string
  type: ToastType
  duration: number
}

export const useToastStore = defineStore('toast', () => {
  const toasts = ref<Toast[]>([])

  const toastsByType = computed(() => {
    return {
      success: toasts.value.filter(t => t.type === 'success'),
      error: toasts.value.filter(t => t.type === 'error'),
      warning: toasts.value.filter(t => t.type === 'warning'),
      info: toasts.value.filter(t => t.type === 'info')
    }
  })

  function show(message: string, type: ToastType = 'info', duration: number = 4000): string {
    const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    const toast: Toast = { id, message, type, duration }
    toasts.value.push(toast)

    if (duration > 0) {
      setTimeout(() => {
        remove(id)
      }, duration)
    }

    return id
  }

  function success(message: string, duration?: number): string {
    return show(message, 'success', duration)
  }

  function error(message: string, duration?: number): string {
    return show(message, 'error', duration)
  }

  function warning(message: string, duration?: number): string {
    return show(message, 'warning', duration)
  }

  function info(message: string, duration?: number): string {
    return show(message, 'info', duration)
  }

  function remove(id: string): void {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index > -1) {
      toasts.value.splice(index, 1)
    }
  }

  function clear(): void {
    toasts.value = []
  }

  return {
    toasts,
    toastsByType,
    show,
    success,
    error,
    warning,
    info,
    remove,
    clear
  }
})