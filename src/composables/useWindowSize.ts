import { ref, onMounted, onUnmounted } from 'vue'

interface WindowSize {
  width: number
  height: number
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isLargeDesktop: boolean
}

const MOBILE_BREAKPOINT = 640
const TABLET_BREAKPOINT = 1024
const DESKTOP_BREAKPOINT = 1280

export function useWindowSize() {
  const size = ref<WindowSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    isLargeDesktop: false
  })

  function updateSize() {
    if (typeof window === 'undefined') return
    
    const width = window.innerWidth
    const height = window.innerHeight
    
    size.value = {
      width,
      height,
      isMobile: width < MOBILE_BREAKPOINT,
      isTablet: width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT,
      isDesktop: width >= TABLET_BREAKPOINT && width < DESKTOP_BREAKPOINT,
      isLargeDesktop: width >= DESKTOP_BREAKPOINT
    }
  }

  function handleResize() {
    updateSize()
  }

  onMounted(() => {
    updateSize()
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return size
}

export function useBreakpoint(breakpoint: number) {
  const width = ref(typeof window !== 'undefined' ? window.innerWidth : 0)
  
  const isAbove = ref(width.value >= breakpoint)

  function handleResize() {
    width.value = window.innerWidth
    isAbove.value = width.value >= breakpoint
  }

  onMounted(() => {
    window.addEventListener('resize', handleResize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  return isAbove
}

export function useMediaQuery(query: string) {
  const isMatching = ref(false)
  let mediaQuery: MediaQueryList | null = null

  if (typeof window !== 'undefined') {
    mediaQuery = window.matchMedia(query)
    isMatching.value = mediaQuery.matches
  }

  function handleChange(event: MediaQueryListEvent) {
    isMatching.value = event.matches
  }

  onMounted(() => {
    if (mediaQuery) {
      mediaQuery.addEventListener('change', handleChange)
    }
  })

  onUnmounted(() => {
    if (mediaQuery) {
      mediaQuery.removeEventListener('change', handleChange)
    }
  })

  return isMatching
}