<script setup lang="ts">
import { computed } from 'vue'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-vue-next'

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems?: number
  limit?: number
  showInfo?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const props = withDefaults(defineProps<PaginationProps>(), {
  showInfo: true,
  size: 'md'
})

const emit = defineEmits<{
  (e: 'update:currentPage', page: number): void
  (e: 'pageChange', page: number): void
}>()

const sizeClasses = {
  sm: 'text-xs px-2 py-1',
  md: 'text-sm px-3 py-2',
  lg: 'text-base px-4 py-2'
}

const pages = computed(() => {
  const pages: (number | string)[] = []
  const { currentPage, totalPages } = props
  
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i)
      pages.push('...')
      pages.push(totalPages)
    } else if (currentPage >= totalPages - 2) {
      pages.push(1)
      pages.push('...')
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      pages.push(currentPage - 1)
      pages.push(currentPage)
      pages.push(currentPage + 1)
      pages.push('...')
      pages.push(totalPages)
    }
  }
  
  return pages
})

const infoText = computed(() => {
  if (!props.totalItems) return ''
  const start = (props.currentPage - 1) * (props.limit || 10) + 1
  const end = Math.min(props.currentPage * (props.limit || 10), props.totalItems)
  return `${start}-${end} de ${props.totalItems}`
})

function goToPage(page: number | string) {
  if (typeof page === 'string') return
  if (page < 1 || page > props.totalPages) return
  if (page === props.currentPage) return
  
  emit('update:currentPage', page)
  emit('pageChange', page)
}
</script>

<template>
  <div class="flex items-center justify-between gap-4">
    <div v-if="showInfo && totalItems" class="text-sm text-muted-foreground">
      {{ infoText }}
    </div>
    
    <div class="flex items-center gap-1">
      <button
        @click="goToPage(1)"
        :disabled="currentPage === 1"
        :class="[
          'rounded-lg flex items-center justify-center transition-colors',
          sizeClasses[size],
          currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'
        ]"
      >
        <ChevronsLeft class="w-4 h-4" />
      </button>
      
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        :class="[
          'rounded-lg flex items-center justify-center transition-colors',
          sizeClasses[size],
          currentPage === 1 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'
        ]"
      >
        <ChevronLeft class="w-4 h-4" />
      </button>
      
      <template v-for="page in pages" :key="page">
        <span v-if="page === '...'" class="px-2">...</span>
        <button
          v-else
          @click="goToPage(page)"
          :class="[
            'rounded-lg flex items-center justify-center transition-colors',
            sizeClasses[size],
            page === currentPage
              ? 'bg-primary text-primary-foreground'
              : 'hover:bg-muted'
          ]"
        >
          {{ page }}
        </button>
      </template>
      
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        :class="[
          'rounded-lg flex items-center justify-center transition-colors',
          sizeClasses[size],
          currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'
        ]"
      >
        <ChevronRight class="w-4 h-4" />
      </button>
      
      <button
        @click="goToPage(totalPages)"
        :disabled="currentPage === totalPages"
        :class="[
          'rounded-lg flex items-center justify-center transition-colors',
          sizeClasses[size],
          currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : 'hover:bg-muted'
        ]"
      >
        <ChevronsRight class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>