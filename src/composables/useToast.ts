import { useToastStore, type ToastType } from '../stores/toastStore'

export function useToast() {
  const store = useToastStore()

  const success = (message: string, duration?: number) => {
    return store.success(message, duration)
  }

  const error = (message: string, duration?: number) => {
    return store.error(message, duration)
  }

  const warning = (message: string, duration?: number) => {
    return store.warning(message, duration)
  }

  const info = (message: string, duration?: number) => {
    return store.info(message, duration)
  }

  const show = (message: string, type: ToastType = 'info', duration?: number) => {
    return store.show(message, type, duration)
  }

  const remove = (id: string) => {
    store.remove(id)
  }

  const clear = () => {
    store.clear()
  }

  return {
    toasts: store.toasts,
    success,
    error,
    warning,
    info,
    show,
    remove,
    clear
  }
}