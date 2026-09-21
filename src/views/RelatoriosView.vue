<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Users,
  Shield,
  TrendingUp,
  AlertTriangle,
  Heart,
  Eye,
  Scale,
  CheckCircle,
  MapPin
} from 'lucide-vue-next'
import { fetchMedidasProtetivas, type MedidaProtetivaAll } from '../services/medidaService'
import { fetchAllMonitoramentos, type AgenteMonitoramento } from '../services/agenteService'
import SectionHeader from '../components/SectionHeader.vue'
import StatCard from '../components/StatCard.vue'

const medidas = ref<MedidaProtetivaAll[]>([])
const monitoramentos = ref<AgenteMonitoramento[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const [medidasData, monData] = await Promise.all([
      fetchMedidasProtetivas(),
      fetchAllMonitoramentos()
    ])
    medidas.value = medidasData
    monitoramentos.value = monData
  } finally {
    isLoading.value = false
  }
})

const statsGeral = computed(() => {
  const ativas = medidas.value.filter(m => m.status === 'ativa').length
  const concluidas = medidas.value.filter(m => m.status === 'finalizada').length
  const urgentes = medidas.value.filter(m => m.urgencia === 'alta' || m.urgencia === 'critica').length
  const vitimasUnicas = new Set(medidas.value.map(m => m.nome_ofendida).filter(Boolean)).size

  return [
    { label: 'Total de vítimas', value: String(vitimasUnicas || 0), delta: 'cadastradas' },
    { label: 'Medidas ativas', value: String(ativas), delta: 'em vigor' },
    { label: 'Medidas concluídas', value: String(concluidas), delta: 'casos encerrados' },
    { label: 'Casos urgentes', value: String(urgentes), delta: 'requer atenção' }
  ]
})

const statsVitimas = computed(() => {
  const vitimasAtivas = new Set(
    medidas.value.filter(m => m.status === 'ativa').map(m => m.nome_ofendida).filter(Boolean)
  ).size

  const agressoresUnicos = new Set(
    medidas.value.map(m => m.nome_ofensor).filter(Boolean)
  ).size

  const vitimasInativas = new Set(
    medidas.value
      .filter(m => m.status === 'finalizada' || m.status === 'revogada')
      .map(m => m.nome_ofendida)
      .filter(Boolean)
  ).size

  return [
    { label: 'Vítimas ativas', value: String(vitimasAtivas), delta: 'em acompanhamento' },
    { label: 'Monitoramentos', value: String(monitoramentos.value.length), delta: 'realizados' },
    { label: 'Vítimas inativas', value: String(vitimasInativas), delta: 'casos encerrados' },
    { label: 'Agressores cadastrados', value: String(agressoresUnicos), delta: 'no sistema' }
  ]
})

const tipoMedidas = computed(() => {
  const map = new Map<string, number>()
  medidas.value.forEach(m => {
    const tipo = Array.isArray(m.tipo) ? m.tipo[0] : m.tipo
    if (tipo) map.set(tipo, (map.get(tipo) || 0) + 1)
  })

  const total = medidas.value.length || 1

  return Array.from(map.entries())
    .map(([tipo, qtd]) => ({
      tipo,
      quantidade: qtd,
      percentual: Math.round((qtd / total) * 100)
    }))
    .sort((a, b) => b.quantidade - a.quantidade)
})

const urgenciaDonut = computed(() => {
  const groups = [
    { label: 'Baixa', count: 0, color: '#22c55e' },
    { label: 'Média', count: 0, color: '#3b82f6' },
    { label: 'Alta + Crítica', count: 0, color: '#ef4444' }
  ]
  medidas.value.forEach(m => {
    const urg = m.urgencia || 'media'
    if (urg === 'baixa') groups[0].count++
    else if (urg === 'media') groups[1].count++
    else groups[2].count++
  })

  const total = medidas.value.length || 1
  let acc = 0
  return groups.map(g => {
    const frac = g.count / total
    const seg = { ...g, frac, offset: acc, percentual: Math.round(frac * 100) }
    acc += frac
    return seg
  })
})

const mesStats = computed(() => {
  const map = new Map<string, number>()
  const mesNomes = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

  medidas.value.forEach(m => {
    const raw = m as any
    const d = m.data_registro || raw.data_inicio
    if (d) {
      const date = new Date(d)
      if (!isNaN(date.getTime())) {
        const mesIdx = date.getMonth()
        const key = mesNomes[mesIdx]
        map.set(key, (map.get(key) || 0) + 1)
      }
    }
  })

  return mesNomes
    .filter(m => map.has(m))
    .map(m => ({ mes: m, medidas: map.get(m) || 0 }))
})

const maxMedidas = computed(() => {
  if (mesStats.value.length === 0) return 1
  return Math.max(...mesStats.value.map(m => m.medidas), 1)
})

const linhaPoints = computed(() => {
  if (mesStats.value.length === 0) return ''
  const n = mesStats.value.length
  return mesStats.value.map((m, i) => {
    const x = n === 1 ? 50 : (i / (n - 1)) * 100
    const y = 36 - (m.medidas / maxMedidas.value) * 32
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
})

const linhaDots = computed(() => {
  if (mesStats.value.length === 0) return []
  const n = mesStats.value.length
  return mesStats.value.map((m, i) => ({
    mes: m.mes,
    medidas: m.medidas,
    x: n === 1 ? 50 : (i / (n - 1)) * 100,
    y: 36 - (m.medidas / maxMedidas.value) * 32
  }))
})

const municipioStats = computed(() => {
  const map = new Map<string, number>()
  medidas.value.forEach(m => {
    if (m.cidade) map.set(m.cidade, (map.get(m.cidade) || 0) + 1)
  })

  const total = medidas.value.length || 1
  const sorted = Array.from(map.entries())
    .map(([cidade, qtd]) => ({
      municipio: cidade,
      quantidade: qtd,
      percentual: Math.round((qtd / total) * 100)
    }))
    .sort((a, b) => b.quantidade - a.quantidade)

  if (sorted.length > 5) {
    const top5 = sorted.slice(0, 4)
    const outros = sorted.slice(4)
    const outrosQtd = outros.reduce((acc, o) => acc + o.quantidade, 0)
    top5.push({ municipio: 'Outros', quantidade: outrosQtd, percentual: Math.round((outrosQtd / total) * 100) })
    return top5
  }

  return sorted
})
</script>

<template>
  <div class="bg-background">
    <main class="px-3 sm:px-4 md:px-6 lg:px-8 py-8">
      <SectionHeader>
        <template #title>Relatórios</template>
        <template #desc>Visão geral do sistema de proteção</template>
      </SectionHeader>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-12 text-muted-foreground">
        Carregando dados...
      </div>

      <template v-else>
        <!-- Stats Gerais -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-4">Visão geral do sistema</h2>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              v-for="stat in statsGeral"
              :key="stat.label"
              :label="stat.label"
              :value="stat.value"
              :delta="stat.delta"
            />
          </div>
        </div>

        <!-- Stats Vítimas e Agressores -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users class="w-5 h-5 text-primary" />
            Vítimas e agressores
          </h2>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              v-for="stat in statsVitimas"
              :key="stat.label"
              :label="stat.label"
              :value="stat.value"
              :delta="stat.delta"
            />
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="medidas.length === 0" class="text-center py-12 text-muted-foreground">
          Nenhuma medida protetiva registrada no sistema.
        </div>

        <template v-else>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <!-- Tipos de Medidas Protetivas -->
            <div class="rounded-lg border border-border bg-card p-6">
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <Shield class="w-5 h-5 text-primary" />
                Tipos de medidas protetivas
              </h3>
              <div v-if="tipoMedidas.length === 0" class="text-center py-6 text-muted-foreground text-sm">
                Sem dados disponíveis
              </div>
              <div v-else class="space-y-4">
                <div v-for="medida in tipoMedidas" :key="medida.tipo">
                  <div class="flex justify-between text-sm mb-1">
                    <span>{{ medida.tipo }}</span>
                    <span class="text-muted-foreground">{{ medida.quantidade }} ({{ medida.percentual }}%)</span>
                  </div>
                  <div class="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      class="h-full bg-primary rounded-full transition-all duration-500"
                      :style="{ width: `${medida.percentual}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Urgência dos Casos (donut, 3 fatias) -->
            <div class="rounded-lg border border-border bg-card p-6">
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle class="w-5 h-5 text-destructive" />
                Urgência dos casos
              </h3>
              <div v-if="medidas.length === 0" class="text-center py-6 text-muted-foreground text-sm">
                Sem dados disponíveis
              </div>
              <div v-else class="flex items-center gap-6">
                <svg viewBox="0 0 42 42" class="h-36 w-36 shrink-0" role="img" aria-label="Distribuição por urgência">
                  <circle cx="21" cy="21" r="15.9155" fill="none" stroke="hsl(var(--secondary))" stroke-width="6" />
                  <circle
                    v-for="seg in urgenciaDonut"
                    :key="seg.label"
                    cx="21" cy="21" r="15.9155" fill="none"
                    :stroke="seg.color" stroke-width="6"
                    :stroke-dasharray="`${(seg.frac * 100).toFixed(1)} ${(100 - seg.frac * 100).toFixed(1)}`"
                    :stroke-dashoffset="`${(-seg.offset * 100 + 25).toFixed(1)}`"
                    stroke-linecap="butt"
                  />
                </svg>
                <ul class="space-y-2 text-sm flex-1">
                  <li v-for="seg in urgenciaDonut" :key="seg.label" class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full shrink-0" :style="{ background: seg.color }"></span>
                    <span class="flex-1">{{ seg.label }}</span>
                    <span class="text-muted-foreground">{{ seg.count }} ({{ seg.percentual }}%)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
            <!-- Medidas por Mês (linha SVG) -->
            <div class="rounded-lg border border-border bg-card p-6">
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <TrendingUp class="w-5 h-5 text-success" />
                Medidas por mês
              </h3>
              <div v-if="mesStats.length === 0" class="text-center py-6 text-muted-foreground text-sm">
                Sem dados disponíveis
              </div>
              <div v-else>
                <svg viewBox="0 0 100 40" class="w-full h-40 text-primary" fill="none" role="img" aria-label="Evolução mensal">
                  <polyline :points="linhaPoints" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                  <circle v-for="d in linhaDots" :key="d.mes" :cx="d.x" :cy="d.y" r="1.8" class="fill-primary" />
                </svg>
                <div class="flex justify-between mt-1">
                  <span v-for="d in linhaDots" :key="d.mes" class="text-xs text-muted-foreground text-center flex-1">
                    {{ d.mes }} · <span class="font-medium text-foreground">{{ d.medidas }}</span>
                  </span>
                </div>
              </div>
            </div>

            <!-- Distribuição por Município -->
            <div class="rounded-lg border border-border bg-card p-6">
              <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin class="w-5 h-5 text-info" />
                Distribuição por município
              </h3>
              <div v-if="municipioStats.length === 0" class="text-center py-6 text-muted-foreground text-sm">
                Sem dados disponíveis
              </div>
              <div v-else class="space-y-3">
                <div v-for="municipio in municipioStats" :key="municipio.municipio" class="flex items-center gap-3">
                  <div class="w-32 text-sm truncate">{{ municipio.municipio }}</div>
                  <div class="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      class="h-full bg-primary rounded-full transition-all duration-500"
                      :style="{ width: `${municipio.percentual}%` }"
                    ></div>
                  </div>
                  <div class="w-16 text-right text-sm text-muted-foreground">
                    {{ municipio.quantidade }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Informações por Tipo de Usuário -->
        <div class="rounded-lg border border-border bg-card p-6">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <Eye class="w-5 h-5 text-primary" />
            Informações por tipo de acesso
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <!-- Admin -->
            <div class="p-4 rounded-lg border border-border bg-secondary/20">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Scale class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-semibold">Acesso Administrador</h4>
                  <p class="text-xs text-muted-foreground">Gestão completa do sistema</p>
                </div>
              </div>
              <ul class="space-y-2 text-sm text-muted-foreground">
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-success" />
                  Visualizar todos os registros
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-success" />
                  Cadastrar medidas protetivas
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-success" />
                  Acessar relatórios completos
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-success" />
                  Gerenciar usuários
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-success" />
                  Mapa de georreferenciamento
                </li>
              </ul>
            </div>

            <!-- Vítima -->
            <div class="p-4 rounded-lg border border-border bg-secondary/20">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Heart class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-semibold">Acesso Vítima</h4>
                  <p class="text-xs text-muted-foreground">Área restrita e protegida</p>
                </div>
              </div>
              <ul class="space-y-2 text-sm text-muted-foreground">
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-success" />
                  Visualizar própria medida protetiva
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-success" />
                  Botão de pânico
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-success" />
                  Contatos de emergência (Anjos)
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-success" />
                  Rede de apoio e telefones úteis
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-success" />
                  Informações sobre direitos
                </li>
              </ul>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>
