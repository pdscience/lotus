import { defineStore } from 'pinia'
import { ref } from 'vue'

interface CacheItem<T> {
  value: T
  expiresAt: number
}

export const useCacheStore = defineStore('cache', () => {
  const cacheData = ref<Record<string, CacheItem<any>>>({})

  function set<T>(key: string, value: T, ttlSeconds: number = 300): void {
    const expiresAt = Date.now() + (ttlSeconds * 1000)
    cacheData.value[key] = { value, expiresAt }
  }

  function get<T>(key: string): T | null {
    const item = cacheData.value[key]
    if (!item) return null

    if (Date.now() > item.expiresAt) {
      delete cacheData.value[key]
      return null
    }

    return item.value as T
  }

  function has(key: string): boolean {
    const item = cacheData.value[key]
    if (!item) return false

    if (Date.now() > item.expiresAt) {
      delete cacheData.value[key]
      return false
    }

    return true
  }

  function remove(key: string): void {
    delete cacheData.value[key]
  }

  function clear(): void {
    cacheData.value = {}
  }

  function cleanup(): void {
    const now = Date.now()
    const keys = Object.keys(cacheData.value)
    for (const key of keys) {
      if (now > cacheData.value[key].expiresAt) {
        delete cacheData.value[key]
      }
    }
  }

  async function withCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlSeconds: number = 300
  ): Promise<T> {
    const cached = get<T>(key)
    if (cached !== null) {
      return cached
    }

    try {
      const data = await fetcher()
      set(key, data, ttlSeconds)
      return data
    } catch (error) {
      throw error
    }
  }

  return {
    set,
    get,
    has,
    remove,
    clear,
    cleanup,
    withCache
  }
})
