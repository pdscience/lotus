<script setup lang="ts">
import ProtegidaLogo from './ProtegidaLogo.vue'
const emit = defineEmits<{
  (e: 'complete'): void
}>()
</script>

<template>
  <div class="fixed inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/20 flex items-center justify-center z-50 overflow-hidden">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute top-20 left-20 w-32 h-32 bg-primary rounded-full blur-3xl animate-pulse-slow" />
      <div class="absolute top-40 right-32 w-24 h-24 bg-accent rounded-full blur-2xl animate-bounce-slow" />
      <div class="absolute bottom-20 left-1/3 w-40 h-40 bg-primary/50 rounded-full blur-3xl animate-pulse-slow" />
    </div>

    <div class="text-center relative z-10 px-4 max-w-lg mx-auto animate-fade-in-up">
      <!-- Logo Container -->
      <div class="flex justify-center mb-6">
        <ProtegidaLogo size="lg" />
      </div>

      <!-- Subtitle with Enhanced Typography -->
      <div class="mb-8 sm:mb-12">
        <p class="text-base sm:text-lg md:text-xl font-medium max-w-sm sm:max-w-md mx-auto px-2 sm:px-4 leading-relaxed mb-2 sm:mb-4">
          <span class="bg-gradient-to-r from-purple-600 via-primary to-purple-800 bg-clip-text text-transparent font-semibold">
            Acesso a Medidas Protetivas
          </span>
        </p>
        <p class="text-sm sm:text-base md:text-lg max-w-sm sm:max-w-lg mx-auto px-2 sm:px-4 leading-relaxed text-gradient-secondary font-medium">
          e Ações de Resposta Emergenciais
        </p>
      </div>

      <!-- Enhanced Login Button -->
      <div class="flex flex-col items-center space-y-4 sm:space-y-6">
        <button
          @click="emit('complete')"
          class="relative group w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-2xl shadow-2xl transition-all duration-500 flex items-center justify-center overflow-hidden hover:scale-110 active:scale-95"
          style="background: linear-gradient(135deg, hsl(265, 70%, 55%) 0%, hsl(265, 75%, 45%) 100%)"
        >
          <!-- Animated Ring -->
          <div class="absolute inset-0 rounded-2xl border-3 border-primary/40 animate-pulse-slow" />
          
          <!-- Secondary Ring -->
          <div class="absolute inset-0 rounded-2xl border-2 border-accent/30 animate-bounce-slow" />
          
          <!-- Inner Gradient -->
          <div class="absolute inset-1 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
          
          <!-- Fingerprint Icon -->
          <img
            src="/fingerprint-icon.svg"
            alt="Login"
            class="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 object-contain drop-shadow-xl relative z-10"
          />
          
          <!-- Shimmer Effect -->
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 animate-shimmer" />
        </button>

        <!-- Login Text -->
        <div class="text-center space-y-1 sm:space-y-2 px-2">
          <p class="text-xs sm:text-sm text-muted-foreground/80">
            Toque para acessar o sistema
          </p>
        </div>

        <!-- Progress Indicator -->
        <div class="h-1 bg-gradient-to-r from-primary via-accent to-primary rounded-full max-w-xs w-full animate-shimmer" />
      </div>

      <!-- Footer Text -->
      <p class="text-xs sm:text-sm text-muted-foreground/60 mt-6 sm:mt-8 max-w-xs sm:max-w-sm mx-auto leading-relaxed px-2">
        Sistema seguro para registro e consulta de medidas protetivas de urgência
      </p>
    </div>
  </div>
</template>
