<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Shield, ClipboardList, AlertTriangle, CheckCircle, Clock, FileText, MapPin } from 'lucide-vue-next'
import { fetchMedidasProtetivas, type MedidaProtetivaAll } from '../services/medidaService'
import { useUserStore } from '../stores/userStore'

const userStore = useUserStore()
const medidas = ref<MedidaProtetivaAll[]>([])
const isLoading = ref(true)

const stats = ref({
  total: 0,
  ativas: 0,
  suspensas: 0,
  revogadas: 0,
  finalizadas: 0,
  alta: 0,
  critica: 0
})

onMounted(async () => {
  try {
    const data = await fetchMedidasProtetivas()
    medidas.value = data
    stats.value.total = data.length
    stats.value.ativas = data.filter(m => m.status === 'ativa').length
    stats.value.suspensas = data.filter(m => m.status === 'suspensa').length
    stats.value.revogadas = data.filter(m => m.status === 'revogada').length
    stats.value.finalizadas = data.filter(m => m.status === 'finalizada').length
    stats.value.alta = data.filter(m => m.urgencia === 'alta').length
    stats.value.critica = data.filter(m => m.urgencia === 'critica').length
  } finally {
    isLoading.value = false
  }
})

const getUrgenciaColor = (urgencia: string) => {
  switch (urgencia) {
    case 'critica': return 'bg-red-500'
    case 'alta': return 'bg-orange-500'
    case 'media': return 'bg-blue-500'
    case 'baixa': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'ativa': return 'bg-green-100 text-green-700'
    case 'suspensa': return 'bg-yellow-100 text-yellow-700'
    case 'revogada': return 'bg-red-100 text-red-700'
    case 'finalizada': return 'bg-gray-100 text-gray-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}
</script>

<template>
  <div class="p-4 sm:p-6 lg:p-8 space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-foreground">Painel do Agente</h1>
        <p class="text-muted-foreground">Bem-vindo, {{ userStore.user?.nome || 'Agente' }}</p>
      </div>
      <div class="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white">
        <Shield class="w-6 h-6" />
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white/30 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-lg">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
            <FileText class="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-foreground">{{ stats.total }}</p>
            <p class="text-xs text-muted-foreground">Total de Medidas</p>
          </div>
        </div>
      </div>

      <div class="bg-white/30 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-lg">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <CheckCircle class="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-green-600">{{ stats.ativas }}</p>
            <p class="text-xs text-muted-foreground">Medidas Ativas</p>
          </div>
        </div>
      </div>

      <div class="bg-white/30 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-lg">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <AlertTriangle class="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-red-600">{{ stats.critica + stats.alta }}</p>
            <p class="text-xs text-muted-foreground">Urgência Alta/Crítica</p>
          </div>
        </div>
      </div>

      <div class="bg-white/30 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-lg">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
            <Clock class="w-5 h-5 text-yellow-600" />
          </div>
          <div>
            <p class="text-2xl font-bold text-yellow-600">{{ stats.suspensas }}</p>
            <p class="text-xs text-muted-foreground">Suspensas</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Últimas Medidas Registradas -->
    <div class="bg-white/30 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg">
      <h2 class="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
        <FileText class="w-5 h-5" />
        Últimas Medidas Registradas
      </h2>

      <div v-if="isLoading" class="text-center py-8 text-muted-foreground">
        Carregando...
      </div>

      <div v-else-if="medidas.length === 0" class="text-center py-8 text-muted-foreground">
        Nenhuma medida protetiva registrada
      </div>

      <div v-else class="space-y-3">
        <div
          v-for="m in medidas.slice(0, 5)"
          :key="m.id"
          class="flex items-center justify-between p-3 rounded-xl bg-white/20 border border-white/10"
        >
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white text-xs font-bold">
              {{ m.nome_ofendida?.charAt(0) || '?' }}
            </div>
            <div>
              <p class="font-medium text-foreground text-sm">{{ m.nome_ofendida }}</p>
              <p class="text-xs text-muted-foreground">{{ m.nome_ofensor }}</p>
            </div>
          </div>
          <div class="text-right">
            <div class="flex items-center gap-2">
              <span
                class="inline-block px-2 py-1 rounded-full text-xs font-medium"
                :class="getStatusClass(m.status)"
              >
                {{ m.status }}
              </span>
              <span
                class="inline-block w-3 h-3 rounded-full"
                :class="getUrgenciaColor(m.urgencia)"
                :title="m.urgencia"
              />
            </div>
            <p class="text-xs text-muted-foreground mt-1">{{ m.cidade }}/{{ m.uf }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Acesso Rápido -->
    <div class="grid grid-cols-3 gap-4">
      <router-link
        to="/dashboard/monitoramento"
        class="bg-white/30 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-lg hover:scale-105 transition-transform text-center"
      >
        <ClipboardList class="w-8 h-8 mx-auto mb-2 text-blue-600" />
        <p class="font-medium text-foreground text-sm">Monitoramento</p>
      </router-link>

      <router-link
        to="/dashboard/consulta"
        class="bg-white/30 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-lg hover:scale-105 transition-transform text-center"
      >
        <Shield class="w-8 h-8 mx-auto mb-2 text-green-600" />
        <p class="font-medium text-foreground text-sm">Consultar</p>
      </router-link>

      <router-link
        to="/dashboard/cercamento"
        class="bg-white/30 backdrop-blur-lg rounded-2xl p-4 border border-white/20 shadow-lg hover:scale-105 transition-transform text-center"
      >
        <MapPin class="w-8 h-8 mx-auto mb-2 text-purple-600" />
        <p class="font-medium text-foreground text-sm">Cercamento</p>
      </router-link>
    </div>
  </div>
</template>
