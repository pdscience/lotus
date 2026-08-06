<script setup lang="ts">
import { useRouter } from 'vue-router'
import { LogIn } from 'lucide-vue-next'

const router = useRouter()

const goToLogin = () => {
  router.push('/login')
}
</script>

<template>
  <div class="relative min-h-screen w-full overflow-hidden">
    <!-- Background Image -->
    <div class="absolute inset-0">
      <img
        src="@/assets/AMPAREcapa.png"
        alt="AMPARE Capa"
        class="w-full h-full object-cover"/>
    </div>

    <!-- Login Button - Top Right -->
    <div class="absolute top-20 right-20 z-20 animate-fade-in-up">
      <button
        @click="goToLogin"
        class="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
        style="background: linear-gradient(135deg, hsl(275, 65%, 65%) 0%, hsl(285, 70%, 70%) 50%, hsl(295, 75%, 75%) 100%)"
      >
        <LogIn class="w-8 h-8 transition-transform group-hover:translate-x-1" />
        Entrar no Sistema
      </button>
    </div>

    <!-- Footer -->
    <p class="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 text-xs text-white/40 text-center whitespace-nowrap">
      Sistema seguro para registro e consulta de medidas protetivas de urgência
    </p>
  </div>
</template>
