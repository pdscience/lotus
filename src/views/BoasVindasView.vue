<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { LogIn } from 'lucide-vue-next'
import ProtegidaLogo from '../components/ProtegidaLogo.vue'
const router = useRouter()
const imgOk = ref(true)
const goToLogin = () => router.push('/login')
const capaUrl = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1920&q=80&auto=format&fit=crop'
</script>
<template>
  <div class="relative min-h-screen w-full overflow-hidden bg-background">
    <div class="absolute inset-0">
      <img
        v-if="imgOk"
        :src="capaUrl"
        alt="Mulheres em rede de apoio - Protegida"
        class="w-full h-full object-cover"
        @error="imgOk = false"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-[#1a0d14]/60 to-background/20"></div>
    </div>
    <div class="absolute top-6 left-6 z-20">
      <ProtegidaLogo size="sm" variant="mono" />
    </div>
    <div class="absolute top-6 right-6 z-20">
      <button
        @click="goToLogin"
        class="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm shadow-2xl transition-all duration-300 hover:bg-primary/90 hover:scale-105 active:scale-95"
      >
        <LogIn class="w-5 h-5 transition-transform group-hover:translate-x-1" />
        Entrar no Sistema
      </button>
    </div>
    <p class="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 text-xs text-white/80 text-center whitespace-nowrap">
      Sistema seguro para registro e consulta de medidas protetivas de urgência
    </p>
  </div>
</template>
