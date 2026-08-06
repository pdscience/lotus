<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Home } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen bg-background flex items-center justify-center p-4">
    <div class="text-center max-w-md">
      <div class="w-20 h-20 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-6">
        <span class="text-4xl font-bold">404</span>
      </div>
      <h1 class="text-2xl font-bold text-foreground mb-2">Página não encontrada</h1>
      <p class="text-muted-foreground mb-6">
        O endereço que você tentou acessar não existe ou foi movido.
      </p>
      <button
        @click="router.push('/')"
        class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
      >
        <Home class="w-5 h-5" />
        Voltar ao Início
      </button>
    </div>
  </div>
</template>
