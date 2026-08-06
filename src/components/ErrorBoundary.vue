<script setup lang="ts">
import { ref, onErrorCaptured, onMounted, onUnmounted } from 'vue'
import { AlertCircle, RefreshCw } from 'lucide-vue-next'

interface ErrorBoundaryProps {
  fallback?: boolean
  resetOn?: 'route' | 'timeout'
}

const props = withDefaults(defineProps<ErrorBoundaryProps>(), {
  fallback: true,
  resetOn: 'route'
})

const error = ref<Error | null>(null)
const hasError = ref(false)

function reset() {
  error.value = null
  hasError.value = false
}

defineExpose({ reset, error })

onErrorCaptured((err) => {
  error.value = err
  hasError.value = true
  return false
})

const errorMessage = ref('Ocorreu um erro inesperado')
const showDetails = ref(false)

let cleanupListener: (() => void) | null = null

onMounted(() => {
  if (props.resetOn === 'route') {
    const handler = () => reset()
    window.addEventListener('popstate', handler)
    cleanupListener = () => window.removeEventListener('popstate', handler)
  }
})

onUnmounted(() => {
  if (cleanupListener) {
    cleanupListener()
    cleanupListener = null
  }
})
</script>

<template>
  <div v-if="hasError && fallback" class="min-h-[200px] flex items-center justify-center p-8">
    <div class="text-center max-w-md">
      <div class="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
        <AlertCircle class="w-8 h-8" />
      </div>
      
      <h2 class="text-xl font-semibold mb-2">Algo deu errado</h2>
      <p class="text-muted-foreground mb-4">{{ errorMessage }}</p>
      
      <div v-if="showDetails" class="text-left bg-muted rounded-lg p-4 mb-4 overflow-auto">
        <pre class="text-xs whitespace-pre-wrap">{{ error?.stack || error?.message }}</pre>
      </div>
      
      <div class="flex gap-2 justify-center">
        <button
          @click="showDetails = !showDetails"
          class="px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
        >
          {{ showDetails ? 'Ocultar' : 'Ver detalhes' }}
        </button>
        <button
          @click="reset"
          class="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2"
        >
          <RefreshCw class="w-4 h-4" />
          Tentar novamente
        </button>
      </div>
    </div>
  </div>
  
  <slot v-else />
</template>
