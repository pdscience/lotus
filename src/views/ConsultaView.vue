<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { 
  Search, 
  Calendar, 
  MapPin, 
  User, 
  Shield, 
  Eye,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-vue-next'
import { fetchMedidasProtetivas, type MedidaProtetivaAll } from '../services/medidaService'

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
        <p>Sistema AMPARE - Acesso a Medidas Protetivas e Ações de Resposta Emergenciais</p>
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

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'ativa':
      return { variant: 'success', icon: CheckCircle, label: 'Ativa' }
    case 'suspensa':
      return { variant: 'warning', icon: AlertCircle, label: 'Suspensa' }
    case 'revogada':
      return { variant: 'destructive', icon: XCircle, label: 'Revogada' }
    case 'finalizada':
      return { variant: 'secondary', icon: CheckCircle, label: 'Finalizada' }
    default:
      return { variant: 'secondary', icon: AlertCircle, label: status }
  }
}

const getUrgenciaConfig = (urgencia: string) => {
  switch (urgencia) {
    case 'critica':
      return { variant: 'destructive', label: 'Crítica', color: 'bg-red-500' }
    case 'alta':
      return { variant: 'warning', label: 'Alta', color: 'bg-orange-500' }
    case 'media':
      return { variant: 'info', label: 'Média', color: 'bg-blue-500' }
    case 'baixa':
      return { variant: 'success', label: 'Baixa', color: 'bg-green-500' }
    default:
      return { variant: 'secondary', label: urgencia, color: 'bg-gray-500' }
  }
}

const getStatusBadgeClass = (variant: string) => {
  switch (variant) {
    case 'success': return 'bg-success/10 text-success'
    case 'warning': return 'bg-warning/10 text-warning'
    case 'destructive': return 'bg-destructive/10 text-destructive'
    case 'info': return 'bg-info/10 text-info'
    default: return 'bg-muted text-muted-foreground'
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
</script>

<template>
  <div class="bg-gradient-to-br from-background via-secondary/5 to-primary/5">
    <main class="px-3 sm:px-4 md:px-6 lg:px-8 py-8">
      <!-- Header Section -->
      <div class="mb-8 animate-fade-in-up">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 class="text-3xl md:text-4xl font-bold text-gradient mb-2">
              Consulta de Medidas Protetivas
            </h1>
            <p class="text-muted-foreground text-lg">
              Busque e gerencie registros de medidas protetivas
            </p>
          </div>
          
          <div class="flex flex-col sm:flex-row gap-3">
            <button @click="exportToPDF" class="flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold text-white transition-all duration-300"
              style="background: linear-gradient(135deg, hsl(275, 65%, 65%) 0%, hsl(285, 70%, 70%) 50%, hsl(295, 75%, 75%) 100%)">
              <Download class="w-4 h-4" />
              Exportar Relatório
            </button>
            <button @click="handleSearch" class="flex items-center justify-center gap-2 px-4 py-2 rounded-xl font-semibold border border-border bg-background hover:bg-secondary/50 transition-colors">
              <RefreshCw class="w-4 h-4" :class="{ 'animate-spin': isLoading }" />
              Atualizar
            </button>
          </div>
        </div>
      </div>

      <!-- Search and Filters -->
      <div class="mb-8 animate-fade-in-up" style="animation-delay: 0.1s">
        <div class="bg-card rounded-xl shadow-lg p-6">
          <div class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Search class="w-4 h-4 text-primary" />
              </div>
              <span class="font-semibold text-lg">Buscar Registros</span>
            </div>
            <p class="text-sm text-muted-foreground">
              Use os filtros abaixo para encontrar medidas protetivas específicas
            </p>
          </div>
          
          <div class="space-y-6">
            <!-- Search Bar -->
            <div class="flex gap-3">
              <div class="flex-1">
                <div class="relative">
                  <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    v-model="searchTerm"
                    type="text"
                    placeholder="Buscar por processo, nome da vítima, agressor ou cidade..."
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 pl-10 pr-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
              <button 
                @click="handleSearch" 
                class="flex items-center justify-center gap-2 px-6 py-2 rounded-xl font-semibold text-white transition-all duration-300"
                style="background: linear-gradient(135deg, hsl(275, 65%, 65%) 0%, hsl(285, 70%, 70%) 50%, hsl(295, 75%, 75%) 100%)"
                :disabled="isLoading"
              >
                <div v-if="isLoading" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <Search v-else class="w-4 h-4" />
                Buscar
              </button>
            </div>

            <!-- Filters -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label class="text-sm font-semibold text-foreground/80 mb-2 block">
                  Status
                </label>
                <select
                  v-model="selectedStatus"
                  class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="todos">Todos os Status</option>
                  <option value="ativa">Ativa</option>
                  <option value="suspensa">Suspensa</option>
                  <option value="revogada">Revogada</option>
                  <option value="finalizada">Finalizada</option>
                </select>
              </div>
              
              <div>
                <label class="text-sm font-semibold text-foreground/80 mb-2 block">
                  Urgência
                </label>
                <select
                  v-model="selectedUrgencia"
                  class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="todos">Todas as Urgências</option>
                  <option value="critica">Crítica</option>
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </div>
              
              <div>
                <label class="text-sm font-semibold text-foreground/80 mb-2 block">
                  Data
                </label>
                <div class="relative">
                  <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="date"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 pl-10 pr-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Results -->
      <div class="animate-fade-in-up" style="animation-delay: 0.2s">
        <div class="bg-card rounded-xl shadow-lg">
          <div class="p-6 pb-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Shield class="w-4 h-4 text-accent" />
                </div>
                <span class="font-semibold text-lg">Resultados da Busca</span>
              </div>
              <div class="flex items-center gap-1 px-3 py-1 rounded-lg border border-border text-sm">
                <span class="w-2 h-2 bg-primary rounded-full" />
                {{ filteredData.length }} registros encontrados
              </div>
            </div>
          </div>
          
          <div class="px-6 pb-6">
            <div v-if="filteredData.length === 0" class="text-center py-12">
              <div class="w-16 h-16 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search class="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 class="text-lg font-semibold text-foreground mb-2">
                Nenhum registro encontrado
              </h3>
              <p class="text-muted-foreground">
                Tente ajustar os filtros ou termos de busca
              </p>
            </div>
            <div v-else class="space-y-4">
              <div
                v-for="item in filteredData"
                :key="item.id"
                class="p-6 rounded-xl border border-border/50 bg-secondary/20 hover:bg-secondary/30 transition-all duration-300 hover:shadow-lg"
              >
                <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div class="flex-1 space-y-4">
                    <!-- Header Row -->
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div class="flex items-center gap-3">
                        <span class="px-3 py-1 rounded-lg border border-border font-mono text-sm">
                          {{ item.numeroProcesso }}
                        </span>
                        <div class="flex items-center gap-2">
                          <span :class="`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(getStatusConfig(item.status).variant)}`">
                            <component :is="getStatusConfig(item.status).icon" class="w-3 h-3" />
                            {{ getStatusConfig(item.status).label }}
                          </span>
                          <span :class="`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white ${getUrgenciaConfig(item.urgencia).color}`">
                            {{ getUrgenciaConfig(item.urgencia).label }}
                          </span>
                        </div>
                      </div>
                      
                      <div class="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar class="w-4 h-4" />
                        {{ new Date(item.dataRegistro).toLocaleDateString('pt-BR') }}
                      </div>
                    </div>

                    <!-- Content Row -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div class="flex items-center gap-2 mb-2">
                          <User class="w-4 h-4 text-primary" />
                          <span class="text-sm font-semibold text-foreground">Vítima</span>
                        </div>
                        <p class="text-foreground font-medium">{{ item.nomeOfendida }}</p>
                        <p class="text-sm text-muted-foreground">Agressor: {{ item.nomeOfensor }}</p>
                      </div>
                      
                      <div>
                        <div class="flex items-center gap-2 mb-2">
                          <MapPin class="w-4 h-4 text-accent" />
                          <span class="text-sm font-semibold text-foreground">Localização</span>
                        </div>
                        <p class="text-foreground font-medium">{{ item.cidade }}, {{ item.uf }}</p>
                        <div class="flex flex-wrap gap-1 mt-1">
                          <span
                            v-for="(tipo, i) in item.tipo.slice(0, 2)"
                            :key="i"
                            class="px-2 py-0.5 rounded text-xs border border-border"
                          >
                            {{ tipo }}
                          </span>
                          <span v-if="item.tipo.length > 2" class="px-2 py-0.5 rounded text-xs border border-border">
                            +{{ item.tipo.length - 2 }} mais
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- Locais Proibidos -->
                    <div v-if="item.localTrabalhoVitima || item.escolaVitima || item.escolaDependente" class="mt-4 pt-4 border-t border-border/30">
                      <div class="flex items-center gap-2 mb-2">
                        <MapPin class="w-4 h-4 text-red-500" />
                        <span class="text-sm font-semibold text-foreground">Locais Proibidos para o Agressor</span>
                      </div>
                      <div class="space-y-1">
                        <p v-if="item.localTrabalhoVitima" class="text-sm text-muted-foreground">
                          <span class="font-medium">Trabalho:</span> {{ item.localTrabalhoVitima }}
                        </p>
                        <p v-if="item.escolaVitima" class="text-sm text-muted-foreground">
                          <span class="font-medium">Escola da Vítima:</span> {{ item.escolaVitima }}
                        </p>
                        <p v-if="item.escolaDependente" class="text-sm text-muted-foreground">
                          <span class="font-medium">Escola do Dependente:</span> {{ item.escolaDependente }}
                        </p>
                      </div>
                    </div>
                  </div>

                  <!-- Actions -->
                  <div class="flex flex-row lg:flex-col gap-2">
                    <button 
                      @click="viewMedida(item.id)"
                      class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-sm w-full"
                    >
                      <Eye class="w-4 h-4" />
                      Visualizar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
