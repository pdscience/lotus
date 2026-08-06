<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Users,
  Shield,
  TrendingUp,
  AlertTriangle,
  Heart,
  Home,
  Eye,
  Scale,
  UserCheck,
  UserX,
  AlertCircle,
  CheckCircle,
  MapPin,
  BarChart3,
  Activity
} from 'lucide-vue-next'
import { fetchMedidasProtetivas, type MedidaProtetivaAll } from '../services/medidaService'
import { fetchAllMonitoramentos, type AgenteMonitoramento } from '../services/agenteService'

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
    {
      title: "Total de Vítimas",
      value: String(vitimasUnicas || 0),
      subtitle: "cadastradas",
      icon: Users,
      color: "from-blue-500 to-blue-600"
    },
    {
      title: "Medidas Ativas",
      value: String(ativas),
      subtitle: "em vigor",
      icon: Shield,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Medidas Concluídas",
      value: String(concluidas),
      subtitle: "casos encerrados",
      icon: CheckCircle,
      color: "from-purple-500 to-purple-600"
    },
    {
      title: "Casos Urgentes",
      value: String(urgentes),
      subtitle: "requer atenção",
      icon: AlertTriangle,
      color: "from-red-500 to-red-600"
    }
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
    {
      title: "Vítimas Ativas",
      value: String(vitimasAtivas),
      subtitle: "em acompanhamento",
      icon: UserCheck,
      color: "from-green-500 to-green-600"
    },
    {
      title: "Monitoramentos",
      value: String(monitoramentos.value.length),
      subtitle: "realizados",
      icon: Home,
      color: "from-amber-500 to-amber-600"
    },
    {
      title: "Vítimas Inativas",
      value: String(vitimasInativas),
      subtitle: "casos encerrados",
      icon: UserX,
      color: "from-gray-500 to-gray-600"
    },
    {
      title: "Agressores Cadastrados",
      value: String(agressoresUnicos),
      subtitle: "no sistema",
      icon: AlertCircle,
      color: "from-red-500 to-red-600"
    }
  ]
})

const tipoMedidas = computed(() => {
  const map = new Map<string, number>()
  medidas.value.forEach(m => {
    const tipo = Array.isArray(m.tipo) ? m.tipo[0] : m.tipo
    if (tipo) map.set(tipo, (map.get(tipo) || 0) + 1)
  })

  const total = medidas.value.length || 1
  const cores = ['bg-blue-500', 'bg-red-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500', 'bg-pink-500', 'bg-yellow-500', 'bg-cyan-500', 'bg-indigo-500', 'bg-teal-500']

  return Array.from(map.entries())
    .map(([tipo, qtd], i) => ({
      tipo,
      quantidade: qtd,
      percentual: Math.round((qtd / total) * 100),
      cor: cores[i % cores.length]
    }))
    .sort((a, b) => b.quantidade - a.quantidade)
})

const urgenciaStats = computed(() => {
  const map = new Map<string, number>()
  const labels: Record<string, string> = {
    baixa: 'Baixa',
    media: 'Média',
    alta: 'Alta',
    critica: 'Crítica'
  }
  const cores: Record<string, string> = {
    baixa: 'bg-green-500',
    media: 'bg-blue-500',
    alta: 'bg-orange-500',
    critica: 'bg-red-500'
  }

  medidas.value.forEach(m => {
    const urg = m.urgencia || 'media'
    map.set(urg, (map.get(urg) || 0) + 1)
  })

  const total = medidas.value.length || 1

  return Array.from(map.entries())
    .map(([urg, qtd]) => ({
      tipo: labels[urg] || urg,
      quantidade: qtd,
      percentual: Math.round((qtd / total) * 100),
      cor: cores[urg] || 'bg-gray-500'
    }))
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
  <div class="bg-gradient-to-br from-background via-secondary/5 to-primary/5 overflow-hidden">
    <main class="px-3 sm:px-4 md:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-6 animate-fade-in-up">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white shadow-lg">
            <BarChart3 class="w-6 h-6" />
          </div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gradient">
            Relatórios
          </h1>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-12 text-muted-foreground">
        Carregando dados...
      </div>

      <template v-else>
        <!-- Stats Gerais -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Activity class="w-5 h-5 text-primary" />
            Visão Geral do Sistema
          </h2>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              v-for="(stat, index) in statsGeral"
              :key="stat.title"
              class="bg-card rounded-xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div :class="`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`">
                <component :is="stat.icon" class="w-6 h-6" />
              </div>
              <p class="text-2xl font-bold text-foreground">{{ stat.value }}</p>
              <p class="text-sm text-muted-foreground">{{ stat.title }}</p>
              <p class="text-xs text-muted-foreground/70">{{ stat.subtitle }}</p>
            </div>
          </div>
        </div>

        <!-- Stats Vítimas e Agressores -->
        <div class="mb-6">
          <h2 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Users class="w-5 h-5 text-pink-500" />
            Vítimas e Agressores
          </h2>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              v-for="(stat, index) in statsVitimas"
              :key="stat.title"
              class="bg-card rounded-xl shadow-lg p-5 hover:shadow-xl transition-all duration-300 animate-fade-in-up"
              :style="{ animationDelay: `${index * 0.1}s` }"
            >
              <div :class="`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white mb-3`">
                <component :is="stat.icon" class="w-6 h-6" />
              </div>
              <p class="text-2xl font-bold text-foreground">{{ stat.value }}</p>
              <p class="text-sm text-muted-foreground">{{ stat.title }}</p>
              <p class="text-xs text-muted-foreground/70">{{ stat.subtitle }}</p>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-if="medidas.length === 0" class="text-center py-12 text-muted-foreground">
          Nenhuma medida protetiva registrada no sistema.
        </div>

        <template v-else>
          <!-- Grids de Informações -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Tipos de Medidas Protetivas -->
            <div class="bg-card rounded-xl shadow-lg p-6 animate-fade-in-up">
              <h3 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield class="w-5 h-5 text-blue-500" />
                Tipos de Medidas Protetivas
              </h3>
              <div v-if="tipoMedidas.length === 0" class="text-center py-6 text-muted-foreground text-sm">
                Sem dados disponíveis
              </div>
              <div v-else class="space-y-4">
                <div v-for="medida in tipoMedidas" :key="medida.tipo">
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-foreground">{{ medida.tipo }}</span>
                    <span class="text-muted-foreground">{{ medida.quantidade }} ({{ medida.percentual }}%)</span>
                  </div>
                  <div class="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      :class="`h-full ${medida.cor} rounded-full transition-all duration-500`"
                      :style="{ width: `${medida.percentual}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Urgência dos Casos -->
            <div class="bg-card rounded-xl shadow-lg p-6 animate-fade-in-up">
              <h3 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle class="w-5 h-5 text-red-500" />
                Urgência dos Casos
              </h3>
              <div v-if="urgenciaStats.length === 0" class="text-center py-6 text-muted-foreground text-sm">
                Sem dados disponíveis
              </div>
              <div v-else class="space-y-4">
                <div v-for="u in urgenciaStats" :key="u.tipo">
                  <div class="flex justify-between text-sm mb-1">
                    <span class="text-foreground">{{ u.tipo }}</span>
                    <span class="text-muted-foreground">{{ u.quantidade }} ({{ u.percentual }}%)</span>
                  </div>
                  <div class="h-3 bg-secondary rounded-full overflow-hidden">
                    <div
                      :class="`h-full ${u.cor} rounded-full transition-all duration-500`"
                      :style="{ width: `${u.percentual}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Grids de Informações 2 -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <!-- Medidas por Mês -->
            <div class="bg-card rounded-xl shadow-lg p-6 animate-fade-in-up">
              <h3 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <TrendingUp class="w-5 h-5 text-green-500" />
                Medidas por Mês
              </h3>
              <div v-if="mesStats.length === 0" class="text-center py-6 text-muted-foreground text-sm">
                Sem dados disponíveis
              </div>
              <div v-else class="flex items-end justify-between gap-2 h-40">
                <div
                  v-for="mes in mesStats"
                  :key="mes.mes"
                  class="flex-1 flex flex-col items-center gap-2"
                >
                  <div class="w-full bg-secondary rounded-t-lg relative" :style="{ height: '120px' }">
                    <div
                      class="absolute bottom-0 w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t-lg transition-all duration-500"
                      :style="{ height: `${(mes.medidas / maxMedidas) * 100}%` }"
                    ></div>
                  </div>
                  <span class="text-xs text-muted-foreground">{{ mes.mes }}</span>
                  <span class="text-xs font-medium text-foreground">{{ mes.medidas }}</span>
                </div>
              </div>
            </div>

            <!-- Distribuição por Município -->
            <div class="bg-card rounded-xl shadow-lg p-6 animate-fade-in-up">
              <h3 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <MapPin class="w-5 h-5 text-purple-500" />
                Distribuição por Município
              </h3>
              <div v-if="municipioStats.length === 0" class="text-center py-6 text-muted-foreground text-sm">
                Sem dados disponíveis
              </div>
              <div v-else class="space-y-3">
                <div v-for="municipio in municipioStats" :key="municipio.municipio" class="flex items-center gap-3">
                  <div class="w-32 text-sm text-foreground truncate">{{ municipio.municipio }}</div>
                  <div class="flex-1 h-4 bg-secondary rounded-full overflow-hidden">
                    <div
                      class="h-full bg-gradient-to-r from-purple-500 to-purple-400 rounded-full transition-all duration-500"
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
        <div class="bg-card rounded-xl shadow-lg p-6 animate-fade-in-up">
          <h3 class="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Eye class="w-5 h-5 text-primary" />
            Informações por Tipo de Acesso
          </h3>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Admin -->
            <div class="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
                  <Scale class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-semibold text-foreground">Acesso Administrador</h4>
                  <p class="text-xs text-muted-foreground">Gestão completa do sistema</p>
                </div>
              </div>
              <ul class="space-y-2 text-sm text-muted-foreground">
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-green-500" />
                  Visualizar todos os registros
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-green-500" />
                  Cadastrar medidas protetivas
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-green-500" />
                  Acessar relatórios completos
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-green-500" />
                  Gerenciar usuários
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-green-500" />
                  Mapa de georreferenciamento
                </li>
              </ul>
            </div>

            <!-- Vítima -->
            <div class="p-4 rounded-xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 border border-pink-500/20">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-pink-500 flex items-center justify-center text-white">
                  <Heart class="w-5 h-5" />
                </div>
                <div>
                  <h4 class="font-semibold text-foreground">Acesso Vítima</h4>
                  <p class="text-xs text-muted-foreground">Área restrita e protegida</p>
                </div>
              </div>
              <ul class="space-y-2 text-sm text-muted-foreground">
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-green-500" />
                  Visualizar própria medida protetiva
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-green-500" />
                  Botão de pânico
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-green-500" />
                  Contatos de emergência (Anjos)
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-green-500" />
                  Rede de apoio e telefones úteis
                </li>
                <li class="flex items-center gap-2">
                  <CheckCircle class="w-4 h-4 text-green-500" />
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
