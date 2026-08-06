import { ref, watch, type Ref } from 'vue'

export function useLocalStorage<T>(
  key: string,
  defaultValue: T,
  options?: {
    serialize?: (value: T) => string
    deserialize?: (value: string) => T
  }
) {
  const { serialize = JSON.stringify, deserialize = JSON.parse } = options || {}

  function getStoredValue(): T {
    try {
      const item = localStorage.getItem(key)
      return item ? deserialize(item) : defaultValue
    } catch {
      return defaultValue
    }
  }

  const data: Ref<T> = ref(getStoredValue()) as Ref<T>

  function setStoredValue(value: T) {
    try {
      localStorage.setItem(key, serialize(value))
      data.value = value
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  function removeStoredValue() {
    localStorage.removeItem(key)
    data.value = defaultValue
  }

  watch(
    data,
    (newValue) => {
      const oldValue = getStoredValue()
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        setStoredValue(newValue)
      }
    },
    { deep: true }
  )

  return {
    data,
    setValue: setStoredValue,
    removeValue: removeStoredValue
  }
}

export function useSessionStorage<T>(
  key: string,
  defaultValue: T,
  options?: {
    serialize?: (value: T) => string
    deserialize?: (value: string) => T
  }
) {
  const { serialize = JSON.stringify, deserialize = JSON.parse } = options || {}

  function getStoredValue(): T {
    try {
      const item = sessionStorage.getItem(key)
      return item ? deserialize(item) : defaultValue
    } catch {
      return defaultValue
    }
  }

  const data: Ref<T> = ref(getStoredValue()) as Ref<T>

  function setStoredValue(value: T) {
    try {
      sessionStorage.setItem(key, serialize(value))
      data.value = value
    } catch (error) {
      console.error('Error saving to sessionStorage:', error)
    }
  }

  function removeStoredValue() {
    sessionStorage.removeItem(key)
    data.value = defaultValue
  }

  watch(
    data,
    (newValue) => {
      const oldValue = getStoredValue()
      if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        setStoredValue(newValue)
      }
    },
    { deep: true }
  )

  return {
    data,
    setValue: setStoredValue,
    removeValue: removeStoredValue
  }
}