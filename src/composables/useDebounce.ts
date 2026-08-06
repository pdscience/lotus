import { ref, watch, isRef } from 'vue'

export function useDebounce<T>(value: any, delay: number = 300) {
  const debouncedValue = ref(value)
  let timer: ReturnType<typeof setTimeout> | null = null

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const debounceFn = (newValue: T) => {
    cancel()
    timer = setTimeout(() => {
      (debouncedValue as any).value = newValue
    }, delay)
  }

  if (isRef(value)) {
    watch(value, (newVal: any) => {
      debounceFn(newVal)
    })
  } else {
    debounceFn(value)
  }

  return {
    value: debouncedValue,
    debounce: debounceFn,
    cancel
  }
}

export function useThrottle<T>(value: any, delay: number = 300) {
  const throttledValue = ref(value)
  let lastExecuted = 0
  let timer: ReturnType<typeof setTimeout> | null = null

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const throttleFn = (newValue: T) => {
    const now = Date.now()
    if (now - lastExecuted >= delay) {
      lastExecuted = now
      ;(throttledValue as any).value = newValue
    } else {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        lastExecuted = Date.now()
        ;(throttledValue as any).value = newValue
      }, delay - (now - lastExecuted))
    }
  }

  if (isRef(value)) {
    watch(value, (newVal: any) => {
      throttleFn(newVal)
    })
  } else {
    throttleFn(value)
  }

  return {
    value: throttledValue,
    throttle: throttleFn,
    cancel
  }
}

export function useDebouncedFn<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
) {
  let timer: ReturnType<typeof setTimeout> | null = null

  const cancel = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const debouncedFn = (...args: Parameters<T>) => {
    cancel()
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }

  const immediateFn = (...args: Parameters<T>) => {
    cancel()
    fn(...args)
  }

  return {
    debouncedFn,
    immediateFn,
    cancel
  }
}