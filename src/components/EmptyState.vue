<script setup lang="ts">
import { Search, FolderOpen } from 'lucide-vue-next'

interface EmptyStateProps {
  title?: string
  description?: string
  icon?: 'search' | 'folder'
  action?: {
    label: string
    onClick: () => void
  }
}

withDefaults(defineProps<EmptyStateProps>(), {
  title: 'Nenhum resultado encontrado',
  description: 'Tente ajustar sua busca ou filtro',
  icon: 'search'
})
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
      <Search v-if="icon === 'search'" class="w-8 h-8 text-muted-foreground" />
      <FolderOpen v-else-if="icon === 'folder'" class="w-8 h-8 text-muted-foreground" />
    </div>
    
    <h3 class="text-lg font-semibold mb-2">{{ title }}</h3>
    <p class="text-muted-foreground mb-6 max-w-sm">{{ description }}</p>
    
    <button
      v-if="action"
      @click="action.onClick"
      class="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
    >
      {{ action.label }}
    </button>
  </div>
</template>