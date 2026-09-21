<script setup lang="ts">
import { useRouter } from 'vue-router'
import { SearchX } from 'lucide-vue-next'
import EmptyState from '../components/EmptyState.vue'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="w-full max-w-md">
      <EmptyState
        :icon="SearchX"
        title="Página não encontrada"
        description="O endereço que você tentou acessar não existe ou foi movido."
        action-label="Voltar ao Início"
        @action="router.push('/')"
      />
    </div>
  </div>
</template>
