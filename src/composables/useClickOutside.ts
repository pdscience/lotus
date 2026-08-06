import { onMounted, onUnmounted } from 'vue'

export function useClickOutside(
  target: any,
  callback: (event: MouseEvent | TouchEvent) => void
) {
  const listener = (event: MouseEvent | TouchEvent) => {
    if (!target.value) return
    
    const el = target.value.$el || target.value
    if (el && !el.contains(event.target)) {
      callback(event)
    }
  }

  onMounted(() => {
    document.addEventListener('click', listener)
    document.addEventListener('touchstart', listener)
  })

  onUnmounted(() => {
    document.removeEventListener('click', listener)
    document.removeEventListener('touchstart', listener)
  })
}

export function useClickOutsideElement(
  elementRef: HTMLElement | null,
  callback: (event: MouseEvent | TouchEvent) => void
) {
  function listener(event: MouseEvent | TouchEvent) {
    if (!elementRef) return
    
    if (!elementRef.contains(event.target as Node)) {
      callback(event)
    }
  }

  onMounted(() => {
    document.addEventListener('click', listener)
    document.addEventListener('touchstart', listener)
  })

  onUnmounted(() => {
    document.removeEventListener('click', listener)
    document.removeEventListener('touchstart', listener)
  })
}

export function useClickOutsideAny(
  refs: (HTMLElement | null)[],
  callback: (event: MouseEvent | TouchEvent, target: HTMLElement) => void
) {
  function listener(event: MouseEvent | TouchEvent) {
    const target = event.target as HTMLElement
    
    for (const ref of refs) {
      if (ref?.contains(target)) {
        return
      }
    }
    
    callback(event, target)
  }

  onMounted(() => {
    document.addEventListener('click', listener)
    document.addEventListener('touchstart', listener)
  })

  onUnmounted(() => {
    document.removeEventListener('click', listener)
    document.removeEventListener('touchstart', listener)
  })
}