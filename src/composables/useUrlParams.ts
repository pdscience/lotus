import { ref, watch, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export interface UseUrlParamsOptions {
  watchOptions?: boolean
  debounce?: number
}

export function useUrlParams<T extends Record<string, any>>(
  initialValues: T,
  options: UseUrlParamsOptions = {}
) {
  const route = useRoute()
  const router = useRouter()
  const { watchOptions = true, debounce = 300 } = options

  function getParamValues(): T {
    const params: any = {}
    for (const key in initialValues) {
      const value = route.query[key] ?? route.params[key]
      if (value !== undefined) {
        try {
          params[key] = JSON.parse(value as string)
        } catch {
          params[key] = value
        }
      } else {
        params[key] = initialValues[key]
      }
    }
    return params as T
  }

  const params = ref<T>(getParamValues())

  function setParam(key: string, value: any) {
    params.value[key] = value
  }

  function updateUrl() {
    const query: Record<string, string> = {}
    const pathParams: Record<string, string> = {}

    for (const key in params.value) {
      const value = params.value[key]
      if (value !== undefined && value !== null && value !== '') {
        const stringValue = String(value)
        if (key in route.query) {
          query[key] = stringValue
        } else {
          pathParams[key] = stringValue
        }
      }
    }

    router.replace({
      path: route.path,
      query: { ...route.query, ...query },
      ...(Object.keys(pathParams).length > 0 ? { params: pathParams } : {})
    })
  }

  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  function debouncedUpdate() {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(updateUrl, debounce)
  }

  function updateParams(newParams: Partial<T>) {
    params.value = { ...params.value, ...newParams }
    if (watchOptions) {
      debouncedUpdate()
    }
  }

  function resetParams() {
    params.value = { ...initialValues }
    if (watchOptions) {
      updateUrl()
    }
  }

  if (watchOptions) {
    watch(
      () => route.query,
      () => {
        params.value = getParamValues()
      },
      { deep: true }
    )
  }

  const hasParams = computed(() => {
    return Object.keys(route.query).length > 0 || Object.keys(route.params).length > 0
  })

  return {
    params,
    setParam,
    updateParams,
    resetParams,
    hasParams,
    getParamValues
  }
}

export interface PaginationParams {
  page: number
  limit: number
  sort?: string
  order?: 'asc' | 'desc'
  total?: number
  totalPages?: number
}

export function useUrlPagination(defaults: Partial<PaginationParams> = {}) {
  const route = useRoute()
  const router = useRouter()

  const defaultValues: PaginationParams = {
    page: defaults.page || 1,
    limit: defaults.limit || 10,
    sort: defaults.sort,
    order: defaults.order || 'asc'
  }

  const pagination = ref<PaginationParams>({
    page: parseInt(route.query.page as string) || defaultValues.page,
    limit: parseInt(route.query.limit as string) || defaultValues.limit,
    sort: (route.query.sort as string) || defaultValues.sort,
    order: (route.query.order as 'asc' | 'desc') || defaultValues.order
  })

  function setPage(page: number) {
    pagination.value.page = page
    updateUrl()
  }

  function setLimit(limit: number) {
    pagination.value.page = 1
    pagination.value.limit = limit
    updateUrl()
  }

  function setSort(sort: string, order: 'asc' | 'desc') {
    pagination.value.sort = sort
    pagination.value.order = order
    updateUrl()
  }

  function nextPage() {
    if (pagination.value.totalPages && pagination.value.page < pagination.value.totalPages) {
      setPage(pagination.value.page + 1)
    }
  }

  function prevPage() {
    if (pagination.value.page > 1) {
      setPage(pagination.value.page - 1)
    }
  }

  function updateUrl() {
    router.replace({
      path: route.path,
      query: {
        ...route.query,
        page: String(pagination.value.page),
        limit: String(pagination.value.limit),
        ...(pagination.value.sort ? { sort: pagination.value.sort } : {}),
        ...(pagination.value.order ? { order: pagination.value.order } : {})
      }
    })
  }

  function setTotal(total: number, totalPages?: number) {
    pagination.value.total = total
    pagination.value.totalPages = totalPages || Math.ceil(total / pagination.value.limit)
  }

  return {
    pagination,
    setPage,
    setLimit,
    setSort,
    nextPage,
    prevPage,
    setTotal
  }
}