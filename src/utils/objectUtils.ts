export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any
  }

  if (obj instanceof Array) {
    const arrCopy: any[] = []
    for (let i = 0; i < obj.length; i++) {
      arrCopy[i] = deepClone(obj[i])
    }
    return arrCopy as any
  }

  if (obj instanceof Object) {
    const objCopy: any = {}
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        objCopy[key] = deepClone((obj as any)[key])
      }
    }
    return objCopy
  }

  return obj
}

export function deepMerge<T extends Record<string, any>>(
  target: T,
  source: Partial<T>,
  options?: {
    arrayMergeStrategy?: 'replace' | 'concat' | 'unique'
  }
): T {
  const { arrayMergeStrategy = 'replace' } = options || {}
  
  const result: any = { ...target }

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      const sourceValue = source[key]
      const targetValue = target[key]

      if (sourceValue === null || sourceValue === undefined) {
        result[key] = sourceValue
      } else if (Array.isArray(sourceValue)) {
        if (Array.isArray(targetValue)) {
          switch (arrayMergeStrategy) {
            case 'concat':
              result[key] = [...targetValue, ...sourceValue]
              break
            case 'unique':
              result[key] = [...new Set([...targetValue, ...sourceValue])]
              break
            case 'replace':
            default:
              result[key] = sourceValue
          }
        } else {
          result[key] = sourceValue
        }
      } else if (
        typeof sourceValue === 'object' &&
        typeof targetValue === 'object' &&
        sourceValue !== null &&
        targetValue !== null
      ) {
        result[key] = deepMerge(targetValue, sourceValue, options)
      } else {
        result[key] = sourceValue
      }
    }
  }

  return result
}

export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true
  
  if (obj1 === null || obj2 === null) return obj1 === obj2
  
  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2
  
  if (obj1 instanceof Date && obj2 instanceof Date) {
    return obj1.getTime() === obj2.getTime()
  }
  
  if (Array.isArray(obj1) !== Array.isArray(obj2)) return false
  
  if (Array.isArray(obj1)) {
    if (obj1.length !== obj2.length) return false
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false
    }
    return true
  }

  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)
  
  if (keys1.length !== keys2.length) return false
  
  for (const key of keys1) {
    if (!keys2.includes(key)) return false
    if (!deepEqual(obj1[key], obj2[key])) return false
  }
  
  return true
}

export function deepPick<T extends Record<string, any>>(
  obj: T,
  keys: (keyof T)[]
): Pick<T, keyof T> {
  const result: any = {}
  
  for (const key of keys) {
    if (key in obj) {
      result[key] = deepClone(obj[key])
    }
  }
  
  return result
}

export function deepOmit<T extends Record<string, any>>(
  obj: T,
  keys: (keyof T)[]
): Omit<T, keyof T> {
  const result: any = { ...obj }
  
  for (const key of keys) {
    delete result[key]
  }
  
  return result
}