<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  Calendar,
  Eye,
  Download,
  RefreshCw,
  FileText
} from 'lucide-vue-next'
import { fetchMedidasProtetivas, type MedidaProtetivaAll } from '../services/medidaService'
import DataTable from '../components/DataTable.vue'
import SectionHeader from '../components/SectionHeader.vue'

interface MedidaProtetiva {
  id: string
  numeroProcesso: string
  nomeOfendida: string
  nomeOfensor: string
  dataRegistro: string
  status: 'ativa' | 'suspensa' | 'revogada' | 'finalizada'
  urgencia: 'baixa' | 'media' | 'alta' | 'critica'
  cidade: string
  uf: string
  tipo: string[]
  localTrabalhoVitima?: string
  escolaVitima?: string
  escolaDependente?: string
}

const router = useRouter()

const searchTerm = ref('')
const isLoading = ref(false)
const selectedStatus = ref<string>('todos')
const selectedUrgencia = ref<string>('todos')

const medidasDB = ref<MedidaProtetivaAll[]>([])

onMounted(async () => {
  isLoading.value = true
  medidasDB.value = await fetchMedidasProtetivas()
  isLoading.value = false
})

const mockData = computed<MedidaProtetiva[]>(() => {
  return medidasDB.value.map(m => ({
    id: m.id,
    numeroProcesso: m.numero_processo,
    nomeOfendida: m.nome_ofendida,
    nomeOfensor: m.nome_ofensor,
    dataRegistro: m.data_registro,
    status: m.status,
    urgencia: m.urgencia,
    cidade: m.cidade,
    uf: m.uf,
    tipo: m.tipo,
    localTrabalhoVitima: m.local_trabalho_vitima,
    escolaVitima: m.escola_vitima,
    escolaDependente: m.escola_dependente
  }))
})

const exportToPDF = () => {
  const data = filteredData.value

  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Medidas Protetivas</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        h1 { color: #9D5BD2; text-align: center; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #9D5BD2; color: white; }
        .status-ativa { color: green; }
        .status-suspensa { color: orange; }
        .status-revogada { color: red; }
        .status-finalizada { color: gray; }
        .urgencia-alta, .urgencia-critica { font-weight: bold; color: red; }
        .footer { margin-top: 20px; text-align: center; font-size: 10px; color: gray; }
      </style>
    </head>
    <body>
      <h1>Relatório de Medidas Protetivas</h1>
      <p style="text-align: center;">Data de geração: ${new Date().toLocaleDateString('pt-BR')}</p>
      <p style="text-align: center;">Total de registros: ${data.length}</p>

      <table>
        <thead>
          <tr>
            <th>Nº Processo</th>
            <th>Vítima</th>
            <th>Agressor</th>
            <th>Data Registro</th>
            <th>Status</th>
            <th>Urgência</th>
            <th>Cidade/UF</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          ${data.map(item => `
            <tr>
              <td>${item.numeroProcesso}</td>
              <td>${item.nomeOfendida}</td>
              <td>${item.nomeOfensor}</td>
              <td>${new Date(item.dataRegistro).toLocaleDateString('pt-BR')}</td>
              <td class="status-${item.status}">${item.status}</td>
              <td class="urgencia-${item.urgencia}">${item.urgencia}</td>
              <td>${item.cidade}/${item.uf}</td>
              <td>${item.tipo.join(', ')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Sistema Lótus - Acesso a Medidas Protetivas e Ações de Resposta Emergenciais</p>
      </div>
    </body>
    </html>
  `

  const printWindow = window.open('', '_blank')
  if (printWindow) {
    printWindow.document.write(content)
    printWindow.document.close()
    printWindow.print()
  }
}

const filteredData = computed(() => {
  return mockData.value.filter(item => {
    const matchesSearch =
      item.numeroProcesso.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      item.nomeOfendida.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      item.nomeOfensor.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      item.cidade.toLowerCase().includes(searchTerm.value.toLowerCase())

    const matchesStatus = selectedStatus.value === 'todos' || item.status === selectedStatus.value
    const matchesUrgencia = selectedUrgencia.value === 'todos' || item.urgencia === selectedUrgencia.value

    return matchesSearch && matchesStatus && matchesUrgencia
  })
})

const getStatusLabel = (status: string) => {
  switch (status) {
    case 'ativa': return 'Ativa'
    case 'suspensa': return 'Suspensa'
    case 'revogada': return 'Revogada'
    case 'finalizada': return 'Finalizada'
    default: return status
  }
}

const getUrgenciaConfig = (urgencia: string) => {
  switch (urgencia) {
    case 'critica':
      return { label: 'Crítica', color: 'bg-destructive/10 text-destructive border border-destructive/20' }
    case 'alta':
      return { label: 'Alta', color: 'bg-warning/10 text-warning border border-warning/20' }
    case 'media':
      return { label: 'Média', color: 'bg-info/10 text-info border border-info/20' }
    case 'baixa':
      return { label: 'Baixa', color: 'bg-success/10 text-success border border-success/20' }
    default:
      return { label: urgencia, color: 'bg-secondary text-muted-foreground border border-border' }
  }
}

const handleSearch = () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
  }, 800)
}

const viewMedida = (id: string) => {
  router.push(`/dashboard/medida/${id}`)
}

const novaMedida = () => {
  router.push('/dashboard/cadastro')
}

const filtros = ['Todos', 'Ativa', 'Suspensa', 'Revogada', 'Finalizada']

const filtroParaValor: Record<string, string> = {
  Todos: 'todos',
  Ativa: 'ativa',
  Suspensa: 'suspensa',
  Revogada: 'revogada',
  Finalizada: 'finalizada'
}

const valorParaFiltro: Record<string, string> = {
  todos: 'Todos',
  ativa: 'Ativa',
  suspensa: 'Suspensa',
  revogada: 'Revogada',
  finalizada: 'Finalizada'
}

const classePorStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case 'ativa': return 'bg-primary/15 text-primary'
    case 'pendente': return 'bg-accent/15'
    case 'suspensa': return 'bg-warning/10 text-warning border border-warning/20'
    case 'revogada': return 'bg-destructive/10 text-destructive border border-destructive/20'
    case 'finalizada': return 'bg-secondary text-muted-foreground border border-border'
    case 'crítica':
    case 'critica': return 'bg-destructive/10 text-destructive border border-destructive/20'
    case 'alta': return 'bg-warning/10 text-warning border border-warning/20'
    case 'média':
    case 'media': return 'bg-info/10 text-info border border-info/20'
    case 'baixa': return 'bg-success/10 text-success border border-success/20'
    default: return 'bg-secondary text-muted-foreground border border-border'
  }
}

const estiloSeloPendente = (status: string) =>
  status.toLowerCase() === 'pendente' ? { color: 'hsl(var(--accent-foreground))' } : undefined
</script>

<template>
  <div class="bg-background">
    <main class="px-3 sm:px-4 md:px-6 lg:px-8 py-8">
      <SectionHeader>
        <template #title>Consulta de medidas protetivas</template>
        <template #desc>Busque e gerencie registros de medidas protetivas</template>
        <template #actions>
          <button @click="exportToPDF" class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.99] transition-all text-sm font-semibold">
            <Download class="w-4 h-4" />
            Exportar relatório
          </button>
          <button @click="handleSearch" class="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-secondary/50 transition-colors">
            <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
            Atualizar
          </button>
        </template>
      </SectionHeader>

      <!-- Filtros -->
      <div class="rounded-2xl border border-border glass-card shadow-lg p-6 mb-6 animate-fade-in-up">
        <div class="flex flex-col sm:flex-row gap-3 mb-5">
          <div class="flex-1 relative">
            <Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar por processo, nome da vítima, agressor ou cidade..."
              class="w-full h-12 rounded-xl border border-border/50 bg-input/50 pl-11 pr-4 text-base focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-background"
            />
          </div>
          <button
            @click="handleSearch"
            class="flex items-center justify-center gap-2 px-6 h-12 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.99] transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="isLoading"
          >
            <div v-if="isLoading" class="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
            <Search v-else class="w-4 h-4" />
            Buscar
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Status</label>
            <select
              v-model="selectedStatus"
              class="w-full h-12 rounded-xl border border-border/50 bg-input/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-background"
            >
              <option value="todos">Todos os Status</option>
              <option value="ativa">Ativa</option>
              <option value="suspensa">Suspensa</option>
              <option value="revogada">Revogada</option>
              <option value="finalizada">Finalizada</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Urgência</label>
            <select
              v-model="selectedUrgencia"
              class="w-full h-12 rounded-xl border border-border/50 bg-input/50 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-background"
            >
              <option value="todos">Todas as Urgências</option>
              <option value="critica">Crítica</option>
              <option value="alta">Alta</option>
              <option value="media">Média</option>
              <option value="baixa">Baixa</option>
            </select>
          </div>

          <div>
            <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">Data</label>
            <div class="relative">
              <Calendar class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                type="date"
                class="w-full h-12 rounded-xl border border-border/50 bg-input/50 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:bg-background"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Resultados -->
      <div class="rounded-2xl border border-border glass-card shadow-lg p-6 animate-fade-in-up">
        <div class="flex items-center justify-between mb-5">
          <div class="flex items-center gap-2.5">
            <span class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <FileText class="w-5 h-5" />
            </span>
            <h2 class="font-heading font-semibold text-lg">Resultados da busca</h2>
          </div>
          <span class="rounded-lg px-3 py-1 text-xs font-medium bg-secondary/50 text-muted-foreground">{{ filteredData.length }} registros encontrados</span>
        </div>

        <div class="flex flex-wrap items-center gap-2 mb-5">
          <input v-model="searchTerm" placeholder="Buscar..." class="input-enhanced !w-64" />
          <button v-for="f in filtros" :key="f" @click="selectedStatus = filtroParaValor[f]" :class="['rounded-lg px-3 py-1 text-xs font-medium border transition-colors', valorParaFiltro[selectedStatus] === f ? 'bg-primary text-primary-foreground border-transparent shadow-sm' : 'border-border text-muted-foreground hover:bg-secondary/50']">{{ f }}</button>
          <button @click="novaMedida" class="rounded-lg px-3 py-1 text-xs font-semibold shadow-sm" :style="{ background: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }">+ Novo</button>
        </div>

        <DataTable>
          <template #head>
            <th class="text-left font-medium">Processo</th>
            <th class="text-left font-medium">Vítima</th>
            <th class="text-left font-medium">Local</th>
            <th class="text-left font-medium">Status</th>
            <th class="text-left font-medium">Urgência</th>
            <th class="text-left font-medium">Registro</th>
            <th class="text-right font-medium">Ações</th>
          </template>
          <tr v-for="item in filteredData" :key="item.id">
            <td class="font-mono text-xs">{{ item.numeroProcesso }}</td>
            <td>
              <p class="font-medium">{{ item.nomeOfendida }}</p>
              <p class="text-xs text-muted-foreground">Agressor: {{ item.nomeOfensor }}</p>
            </td>
            <td>
              <p>{{ item.cidade }}/{{ item.uf }}</p>
              <p class="text-xs text-muted-foreground truncate max-w-40">{{ item.tipo.join(', ') }}</p>
            </td>
            <td>
              <span class="rounded-lg px-3 py-1 text-xs font-medium" :class="classePorStatus(item.status)" :style="estiloSeloPendente(item.status)">
                {{ getStatusLabel(item.status) }}
              </span>
            </td>
            <td>
              <span class="rounded-lg px-3 py-1 text-xs font-medium" :class="classePorStatus(item.urgencia)">
                {{ getUrgenciaConfig(item.urgencia).label }}
              </span>
            </td>
            <td class="text-muted-foreground">{{ new Date(item.dataRegistro).toLocaleDateString('pt-BR') }}</td>
            <td class="text-right">
              <details class="relative inline-block">
                <summary class="cursor-pointer list-none px-3 py-1.5 rounded-xl border border-border/60 text-xs font-medium hover:bg-secondary/50 transition-colors">•••</summary>
                <div class="absolute right-0 z-10 rounded-lg border border-border bg-popover p-1 shadow-lg min-w-32">
                  <button @click="viewMedida(item.id)" class="flex w-full items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-secondary/50 transition-colors text-left">
                    <Eye class="w-3.5 h-3.5" />
                    Ver
                  </button>
                </div>
              </details>
            </td>
          </tr>
          <template #empty>
            <div v-if="filteredData.length === 0" class="text-center py-12">
              <div class="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                <Search class="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 class="text-lg font-semibold mb-2">Nenhum registro encontrado</h3>
              <p class="text-muted-foreground text-sm">Tente ajustar os filtros ou termos de busca</p>
            </div>
          </template>
        </DataTable>
      </div>
    </main>
  </div>
</template>
