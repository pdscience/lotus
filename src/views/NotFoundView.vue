<script setup lang="ts">
import { useRouter } from 'vue-router'
import { SearchX, Home } from 'lucide-vue-next'

const router = useRouter()
</script>

<template>
  <div class="relative min-h-screen bg-background flex items-center justify-center p-4 overflow-hidden">
    <div class="absolute inset-x-0 -top-24 h-96 bg-primary/20 blur-3xl" aria-hidden="true"></div>

    <div class="relative z-10 w-full max-w-md text-center animate-fade-in-up">
      <p class="font-heading text-8xl font-bold leading-none text-gradient select-none" aria-hidden="true">404</p>

      <div class="glass-card rounded-3xl shadow-lg border border-border p-6 sm:p-8 mt-6">
        <div class="w-12 h-12 mx-auto rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
          <SearchX class="w-6 h-6" />
        </div>
        <h1 class="font-heading font-semibold text-xl mt-4">Página não encontrada</h1>
        <p class="text-sm text-muted-foreground mt-1">O endereço que você tentou acessar não existe ou foi movido.</p>
        <button
          type="button"
          @click="router.push('/')"
          class="mt-6 w-full h-12 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.99] transition-all duration-300 flex items-center justify-center gap-2"
        >
          <Home class="w-5 h-5" />
          Voltar ao início
        </button>
      </div>
    </div>
  </div>
</template>
