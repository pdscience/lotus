<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Shield, ClipboardList, FileText, MapPin } from 'lucide-vue-next'
import { fetchMedidasProtetivas, type MedidaProtetivaAll } from '../services/medidaService'
import { useUserStore } from '../stores/userStore'
import SectionHeader from '../components/SectionHeader.vue'
import StatCard from '../components/StatCard.vue'

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

const getUrgenciaDot = (urgencia: string) => {
  switch (urgencia) {
    case 'critica': return 'bg-destructive'
    case 'alta': return 'bg-warning'
    case 'media': return 'bg-info'
    case 'baixa': return 'bg-success'
    default: return 'bg-secondary'
  }
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'ativa': return 'bg-success/10 text-success border border-success/20'
    case 'suspensa': return 'bg-warning/10 text-warning border border-warning/20'
    case 'revogada': return 'bg-destructive/10 text-destructive border border-destructive/20'
    case 'finalizada': return 'bg-secondary text-muted-foreground border border-border'
    default: return 'bg-secondary text-muted-foreground border border-border'
  }
}
</script>

<template>
  <div class="bg-background">
    <div class="p-4 sm:p-6 lg:p-8 space-y-6">
      <SectionHeader>
        <template #title>Painel do agente</template>
        <template #desc>Bem-vindo, {{ userStore.user?.nome || 'Agente' }}</template>
        <template #actions>
          <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm text-muted-foreground">
            <Shield class="w-4 h-4 text-primary" />
            Agente
          </span>
        </template>
      </SectionHeader>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Total de medidas" :value="String(stats.total)" />
        <StatCard label="Medidas ativas" :value="String(stats.ativas)" delta="em vigor" />
        <StatCard label="Urgência alta/crítica" :value="String(stats.critica + stats.alta)" delta="requer atenção" />
        <StatCard label="Suspensas" :value="String(stats.suspensas)" />
      </div>

      <!-- Últimas Medidas Registradas -->
      <div class="rounded-lg border border-border bg-card p-6">
        <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
          <FileText class="w-5 h-5 text-primary" />
          Últimas medidas registradas
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
            class="flex items-center justify-between p-3 rounded-lg border border-border bg-secondary/20"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-xs font-bold">
                {{ m.nome_ofendida?.charAt(0) || '?' }}
              </div>
              <div>
                <p class="font-medium text-sm">{{ m.nome_ofendida }}</p>
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
                  :class="getUrgenciaDot(m.urgencia)"
                  :title="m.urgencia"
                />
              </div>
              <p class="text-xs text-muted-foreground mt-1">{{ m.cidade }}/{{ m.uf }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Acesso Rápido -->
      <div class="grid grid-cols-3 gap-3 sm:gap-4">
        <router-link
          to="/dashboard/monitoramento"
          class="rounded-lg border border-border bg-card p-4 hover:bg-secondary/30 transition-colors text-center"
        >
          <ClipboardList class="w-8 h-8 mx-auto mb-2 text-primary" />
          <p class="font-medium text-sm">Monitoramento</p>
        </router-link>

        <router-link
          to="/dashboard/consulta"
          class="rounded-lg border border-border bg-card p-4 hover:bg-secondary/30 transition-colors text-center"
        >
          <Shield class="w-8 h-8 mx-auto mb-2 text-success" />
          <p class="font-medium text-sm">Consultar</p>
        </router-link>

        <router-link
          to="/dashboard/cercamento"
          class="rounded-lg border border-border bg-card p-4 hover:bg-secondary/30 transition-colors text-center"
        >
          <MapPin class="w-8 h-8 mx-auto mb-2 text-info" />
          <p class="font-medium text-sm">Cercamento</p>
        </router-link>
      </div>
    </div>
  </div>
</template>
