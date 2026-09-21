<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import {
  Shield,
  Plus,
  Search,
  Trash2,
  Save,
  X,
  User,
  UserX,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
  Edit3,
  Eye,
  AlertTriangle,
  ClipboardCheck,
  Car
} from 'lucide-vue-next'
import {
  fetchMonitoramentos,
  saveMonitoramento,
  updateMonitoramento,
  deleteMonitoramento,
  type AgenteMonitoramento
} from '../services/agenteService'
import { fetchMedidasProtetivas, type MedidaProtetivaAll } from '../services/medidaService'
import DataTable from '../components/DataTable.vue'
import SectionHeader from '../components/SectionHeader.vue'
import StatCard from '../components/StatCard.vue'

const monitoramentos = ref<AgenteMonitoramento[]>([])
const medidas = ref<MedidaProtetivaAll[]>([])
const isLoading = ref(false)
const isModalOpen = ref(false)
const isDetailOpen = ref(false)
const isEditOpen = ref(false)
const selectedMonitoramento = ref<AgenteMonitoramento | null>(null)
const editingMonitoramento = ref<AgenteMonitoramento | null>(null)
const searchTerm = ref('')
const filterRisco = ref<string>('todos')
const filterStatusVisita = ref<string>('todos')
const filterStatusPatrulha = ref<string>('todos')

const hoje = new Date().toISOString().split('T')[0]
const horaAtual = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

const formData = ref({
  vitima_nome: '',
  vitima_cpf: '',
  vitima_telefone: '',
  vitima_endereco: '',
  agressor_nome: '',
  agressor_cpf: '',
  agressor_telefone: '',
  agressor_endereco: '',
  medida_id: '',
  numero_processo: '',
  data_monitoramento: hoje,
  hora: horaAtual,
  condicao_vitima: '',
  situacao_monitorada: '',
  localizacao_verificada: false,
  restricao_respeitada: false,
  observacoes: '',
  risco: 'baixo' as 'baixo' | 'medio' | 'alto' | 'critico',
  encaminhamentos: '',
  status_visita: 'pendente' as 'pendente' | 'visitada' | 'nao_visitada' | 'agendada',
  status_patrulha: 'pendente' as 'pendente' | 'em_deslocamento' | 'no_local' | 'concluido' | 'nao_foi_possivel',
  obs_patrulha: ''
})

const editForm = ref({
  status_visita: 'pendente' as 'pendente' | 'visitada' | 'nao_visitada' | 'agendada',
  status_patrulha: 'pendente' as 'pendente' | 'em_deslocamento' | 'no_local' | 'concluido' | 'nao_foi_possivel',
  condicao_vitima: '',
  situacao_monitorada: '',
  risco: 'baixo' as 'baixo' | 'medio' | 'alto' | 'critico',
  localizacao_verificada: false,
  restricao_respeitada: false,
  observacoes: '',
  encaminhamentos: '',
  obs_patrulha: ''
})

const condicoesVitima = [
  'Estável',
  'Abalada',
  'Em pânico',
  'Segura',
  'Em risco',
  'Internada',
  'Em acompanhamento psicológico'
]

const situacoesMonitoramento = [
  'Medida cumprida',
  'Medida parcialmente cumprida',
  'Medida descumprida',
  'Agressor em localização conhecida',
  'Agressor em fuga',
  'Contato com vítima realizado',
  'Visita domiciliar',
  'Abordagem em via pública',
  'Verificação de endereço'
]

const statusVisitaOptions = [
  { value: 'pendente', label: 'Pendente', color: 'bg-secondary text-muted-foreground border-border', icon: Clock },
  { value: 'agendada', label: 'Agendada', color: 'bg-info/10 text-info border-info/20', icon: FileText },
  { value: 'visitada', label: 'Visitada', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
  { value: 'nao_visitada', label: 'Não Visitada', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle }
]

const statusPatrulhaOptions = [
  { value: 'pendente', label: 'Pendente', color: 'bg-secondary text-muted-foreground border-border', icon: Clock },
  { value: 'em_deslocamento', label: 'Em Deslocamento', color: 'bg-warning/10 text-warning border-warning/20', icon: Car },
  { value: 'no_local', label: 'No Local', color: 'bg-info/10 text-info border-info/20', icon: Eye },
  { value: 'concluido', label: 'Concluído', color: 'bg-success/10 text-success border-success/20', icon: CheckCircle },
  { value: 'nao_foi_possivel', label: 'Não Foi Possível', color: 'bg-destructive/10 text-destructive border-destructive/20', icon: XCircle }
]

const riscos = [
  { value: 'baixo', label: 'Baixo', color: 'bg-success/10 text-success border-success/20' },
  { value: 'medio', label: 'Médio', color: 'bg-info/10 text-info border-info/20' },
  { value: 'alto', label: 'Alto', color: 'bg-warning/10 text-warning border-warning/20' },
  { value: 'critico', label: 'Crítico', color: 'bg-destructive/10 text-destructive border-destructive/20' }
]

const filteredData = computed(() => {
  return monitoramentos.value.filter(item => {
    const matchesSearch =
      item.vitima_nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      item.agressor_nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      item.numero_processo?.toLowerCase().includes(searchTerm.value.toLowerCase())

    const matchesRisco = filterRisco.value === 'todos' || item.risco === filterRisco.value
    const matchesVisita = filterStatusVisita.value === 'todos' || item.status_visita === filterStatusVisita.value
    const matchesPatrulha = filterStatusPatrulha.value === 'todos' || item.status_patrulha === filterStatusPatrulha.value

    return matchesSearch && matchesRisco && matchesVisita && matchesPatrulha
  })
})

const stats = computed(() => {
  const total = monitoramentos.value.length
  const hojeCount = monitoramentos.value.filter(m => m.data_monitoramento === new Date().toISOString().split('T')[0]).length
  const alto = monitoramentos.value.filter(m => m.risco === 'alto' || m.risco === 'critico').length
  const pendentes = monitoramentos.value.filter(m => m.status_visita === 'pendente').length
  return { total, hojeCount, alto, pendentes }
})

async function loadMonitoramentos() {
  isLoading.value = true
  monitoramentos.value = await fetchMonitoramentos()
  isLoading.value = false
}

async function loadMedidas() {
  medidas.value = await fetchMedidasProtetivas()
}

function openModal() {
  formData.value = {
    vitima_nome: '',
    vitima_cpf: '',
    vitima_telefone: '',
    vitima_endereco: '',
    agressor_nome: '',
    agressor_cpf: '',
    agressor_telefone: '',
    agressor_endereco: '',
    medida_id: '',
    numero_processo: '',
    data_monitoramento: hoje,
    hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    condicao_vitima: '',
    situacao_monitorada: '',
    localizacao_verificada: false,
    restricao_respeitada: false,
    observacoes: '',
    risco: 'baixo',
    encaminhamentos: '',
    status_visita: 'pendente',
    status_patrulha: 'pendente',
    obs_patrulha: ''
  }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

function openDetail(m: AgenteMonitoramento) {
  selectedMonitoramento.value = m
  isDetailOpen.value = true
}

function closeDetail() {
  isDetailOpen.value = false
  selectedMonitoramento.value = null
}

function openEdit(m: AgenteMonitoramento) {
  editingMonitoramento.value = m
  editForm.value = {
    status_visita: m.status_visita,
    status_patrulha: m.status_patrulha,
    condicao_vitima: m.condicao_vitima,
    situacao_monitorada: m.situacao_monitorada,
    risco: m.risco,
    localizacao_verificada: m.localizacao_verificada,
    restricao_respeitada: m.restricao_respeitada,
    observacoes: m.observacoes || '',
    encaminhamentos: m.encaminhamentos || '',
    obs_patrulha: m.obs_patrulha || ''
  }
  isEditOpen.value = true
}

function closeEdit() {
  isEditOpen.value = false
  editingMonitoramento.value = null
}

async function handleSave() {
  if (!formData.value.vitima_nome || !formData.value.agressor_nome || !formData.value.condicao_vitima || !formData.value.situacao_monitorada) return

  const result = await saveMonitoramento(formData.value)

  if (result.error) {
    alert(result.error)
    return
  }

  await loadMonitoramentos()
  closeModal()
}

async function handleEditSave() {
  if (!editingMonitoramento.value) return

  const result = await updateMonitoramento(editingMonitoramento.value.id, editForm.value)

  if (result.error) {
    alert(result.error)
    return
  }

  await loadMonitoramentos()
  closeEdit()
}

async function handleDelete(id: string) {
  if (confirm('Tem certeza que deseja remover este registro de monitoramento?')) {
    await deleteMonitoramento(id)
    await loadMonitoramentos()
  }
}

function getRiscoBadge(risco: string) {
  const r = riscos.find(r => r.value === risco)
  return {
    color: r?.color || 'bg-secondary text-muted-foreground border-border',
    label: risco === 'medio' ? 'Médio' : risco === 'critico' ? 'Crítico' : risco.charAt(0).toUpperCase() + risco.slice(1)
  }
}

function getStatusVisitaInfo(status: string) {
  return statusVisitaOptions.find(s => s.value === status) || statusVisitaOptions[0]
}

function getStatusPatrulhaInfo(status: string) {
  return statusPatrulhaOptions.find(s => s.value === status) || statusPatrulhaOptions[0]
}

function formatDate(date: string) {
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')
}

function formatDateTime(dateStr?: string) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleString('pt-BR')
}

watch(() => formData.value.medida_id, (medidaId) => {
  if (!medidaId) return
  const medida = medidas.value.find(m => m.id === medidaId)
  if (medida) {
    formData.value.vitima_nome = medida.nome_ofendida || ''
    formData.value.agressor_nome = medida.nome_ofensor || ''
    formData.value.numero_processo = medida.numero_processo || ''
  }
})

onMounted(() => {
  loadMonitoramentos()
  loadMedidas()
})
</script>

<template>
  <div class="bg-background">
    <main class="px-3 sm:px-4 md:px-6 lg:px-8 py-8">
      <SectionHeader>
        <template #title>Painel do agente</template>
        <template #desc>Monitoramento de medidas protetivas e acompanhamento de vítimas</template>
        <template #actions>
          <button
            @click="openModal"
            class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus class="w-4 h-4" />
            Novo registro
          </button>
        </template>
      </SectionHeader>

      <!-- Stats -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <StatCard label="Total de registros" :value="String(stats.total)" />
        <StatCard label="Registros de hoje" :value="String(stats.hojeCount)" />
        <StatCard label="Risco alto/crítico" :value="String(stats.alto)" />
        <StatCard label="Visitas pendentes" :value="String(stats.pendentes)" />
      </div>

      <!-- Filtros -->
      <div class="rounded-lg border border-border bg-card p-6 mb-6">
        <div class="flex flex-col sm:flex-row gap-3">
          <div class="flex-1 relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              v-model="searchTerm"
              type="text"
              placeholder="Buscar por vítima, agressor ou processo..."
              class="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
            />
          </div>
          <select
            v-model="filterRisco"
            class="h-11 px-4 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
          >
            <option value="todos">Todos os Riscos</option>
            <option value="baixo">Baixo</option>
            <option value="medio">Médio</option>
            <option value="alto">Alto</option>
            <option value="critico">Crítico</option>
          </select>
          <select
            v-model="filterStatusVisita"
            class="h-11 px-4 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
          >
            <option value="todos">Todas as Visitas</option>
            <option v-for="s in statusVisitaOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
          <select
            v-model="filterStatusPatrulha"
            class="h-11 px-4 rounded-lg border border-border bg-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
          >
            <option value="todos">Todas as Patrulhas</option>
            <option v-for="s in statusPatrulhaOptions" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </div>
      </div>

      <!-- Tabela -->
      <div class="rounded-lg border border-border bg-card p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="font-semibold text-lg flex items-center gap-2">
            <Shield class="w-5 h-5 text-primary" />
            Monitoramentos
          </h2>
          <span class="text-sm text-muted-foreground">{{ filteredData.length }} registros</span>
        </div>

        <div v-if="isLoading" class="text-center py-12 text-muted-foreground">
          Carregando registros...
        </div>

        <DataTable v-else>
          <template #head>
            <th class="text-left font-medium">Vítima</th>
            <th class="text-left font-medium">Data</th>
            <th class="text-left font-medium">Risco</th>
            <th class="text-left font-medium">Visita</th>
            <th class="text-left font-medium">Patrulha</th>
            <th class="text-right font-medium">Ações</th>
          </template>
          <tr v-for="m in filteredData" :key="m.id">
            <td>
              <p class="font-medium flex items-center gap-1.5">
                <User class="w-3.5 h-3.5 text-muted-foreground" />
                {{ m.vitima_nome }}
              </p>
              <p class="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <UserX class="w-3 h-3" />
                {{ m.agressor_nome }}
              </p>
              <p v-if="!m.restricao_respeitada" class="text-xs text-destructive mt-0.5">Restrição descumprida</p>
            </td>
            <td class="text-muted-foreground whitespace-nowrap">
              <span class="flex items-center gap-1">
                <Clock class="w-3.5 h-3.5" />
                {{ formatDate(m.data_monitoramento) }} às {{ m.hora }}
              </span>
              <span v-if="m.numero_processo" class="text-xs flex items-center gap-1 mt-0.5">
                <FileText class="w-3 h-3" />
                {{ m.numero_processo }}
              </span>
            </td>
            <td>
              <span :class="['inline-flex px-2 py-0.5 rounded-full text-xs font-medium border', getRiscoBadge(m.risco).color]">
                {{ getRiscoBadge(m.risco).label }}
              </span>
            </td>
            <td>
              <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', getStatusVisitaInfo(m.status_visita).color]">
                <component :is="getStatusVisitaInfo(m.status_visita).icon" class="w-3 h-3" />
                {{ getStatusVisitaInfo(m.status_visita).label }}
              </span>
            </td>
            <td>
              <span :class="['inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', getStatusPatrulhaInfo(m.status_patrulha).color]">
                <component :is="getStatusPatrulhaInfo(m.status_patrulha).icon" class="w-3 h-3" />
                {{ getStatusPatrulhaInfo(m.status_patrulha).label }}
              </span>
            </td>
            <td class="text-right whitespace-nowrap">
              <button @click="openEdit(m)" class="p-2 rounded-lg text-primary hover:bg-secondary transition-colors" title="Editar status">
                <Edit3 class="w-4 h-4" />
              </button>
              <button @click="openDetail(m)" class="p-2 rounded-lg text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors" title="Ver detalhes">
                <Eye class="w-4 h-4" />
              </button>
              <button @click="handleDelete(m.id)" class="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors" title="Excluir">
                <Trash2 class="w-4 h-4" />
              </button>
            </td>
          </tr>
          <template #empty>
            <div v-if="filteredData.length === 0" class="text-center py-12">
              <div class="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                <Shield class="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 class="font-semibold mb-2">Nenhum registro encontrado</h3>
              <p class="text-muted-foreground text-sm mb-4">
                {{ searchTerm ? 'Tente buscar com outros termos' : 'Registre o primeiro monitoramento' }}
              </p>
              <button
                @click="openModal"
                class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Plus class="w-4 h-4" />
                Novo Registro
              </button>
            </div>
          </template>
        </DataTable>
      </div>
    </main>

    <!-- Modal - Novo Registro -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div class="rounded-lg border border-border bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10">
          <h2 class="text-xl font-bold">Novo Registro de Monitoramento</h2>
          <button @click="closeModal" class="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleSave" class="p-6 space-y-6">
          <!-- Dados da Vítima -->
          <div class="space-y-4">
            <h3 class="font-semibold flex items-center gap-2">
              <User class="w-4 h-4 text-info" />
              Dados da Vítima
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-1 block">Nome da Vítima *</label>
                <input v-model="formData.vitima_nome" type="text" required placeholder="Nome completo" class="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
              </div>
              <div>
                <label class="text-sm font-medium mb-1 block">CPF</label>
                <input v-model="formData.vitima_cpf" type="text" placeholder="000.000.000-00" class="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
              </div>
              <div>
                <label class="text-sm font-medium mb-1 block">Telefone</label>
                <input v-model="formData.vitima_telefone" type="tel" placeholder="(00) 00000-0000" class="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
              </div>
              <div>
                <label class="text-sm font-medium mb-1 block">Endereço</label>
                <input v-model="formData.vitima_endereco" type="text" placeholder="Rua, número - Bairro" class="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
              </div>
            </div>
          </div>

          <!-- Dados do Agressor -->
          <div class="space-y-4">
            <h3 class="font-semibold flex items-center gap-2">
              <UserX class="w-4 h-4 text-destructive" />
              Dados do Agressor
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-1 block">Nome do Agressor *</label>
                <input v-model="formData.agressor_nome" type="text" required placeholder="Nome completo" class="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
              </div>
              <div>
                <label class="text-sm font-medium mb-1 block">CPF</label>
                <input v-model="formData.agressor_cpf" type="text" placeholder="000.000.000-00" class="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
              </div>
              <div>
                <label class="text-sm font-medium mb-1 block">Telefone</label>
                <input v-model="formData.agressor_telefone" type="tel" placeholder="(00) 00000-0000" class="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
              </div>
              <div>
                <label class="text-sm font-medium mb-1 block">Endereço</label>
                <input v-model="formData.agressor_endereco" type="text" placeholder="Rua, número - Bairro" class="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
              </div>
            </div>
          </div>

          <!-- Dados do Monitoramento -->
          <div class="space-y-4">
            <h3 class="font-semibold flex items-center gap-2">
              <FileText class="w-4 h-4 text-primary" />
              Dados do Monitoramento
            </h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="md:col-span-2">
                <label class="text-sm font-medium mb-1 block">Medida Protetiva Vinculada</label>
                <select v-model="formData.medida_id" class="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50">
                  <option value="">Nenhuma medida vinculada</option>
                  <option v-for="med in medidas" :key="med.id" :value="med.id">
                    {{ med.numero_processo }} - {{ med.nome_ofendida }} ({{ med.status }})
                  </option>
                </select>
              </div>
              <div>
                <label class="text-sm font-medium mb-1 block">Nº Processo</label>
                <input v-model="formData.numero_processo" type="text" placeholder="2024-0001" class="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
              </div>
              <div>
                <label class="text-sm font-medium mb-1 block">Data *</label>
                <input v-model="formData.data_monitoramento" type="date" required class="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
              </div>
              <div>
                <label class="text-sm font-medium mb-1 block">Hora *</label>
                <input v-model="formData.hora" type="time" required class="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="text-sm font-medium mb-1 block">Condição da Vítima *</label>
                <select v-model="formData.condicao_vitima" required class="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50">
                  <option value="">Selecione...</option>
                  <option v-for="c in condicoesVitima" :key="c" :value="c">{{ c }}</option>
                </select>
              </div>
              <div>
                <label class="text-sm font-medium mb-1 block">Situação Monitorada *</label>
                <select v-model="formData.situacao_monitorada" required class="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50">
                  <option value="">Selecione...</option>
                  <option v-for="s in situacoesMonitoramento" :key="s" :value="s">{{ s }}</option>
                </select>
              </div>
            </div>

            <div>
              <label class="text-sm font-medium mb-1 block">Nível de Risco *</label>
              <div class="flex gap-2">
                <button
                  v-for="r in riscos"
                  :key="r.value"
                  type="button"
                  @click="formData.risco = r.value as any"
                  class="flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all"
                  :class="formData.risco === r.value ? r.color + ' border-current' : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50'"
                >
                  {{ r.label }}
                </button>
              </div>
            </div>

            <div class="flex gap-6">
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="formData.localizacao_verificada" type="checkbox" class="w-4 h-4 rounded border-border" />
                <span class="text-sm">Localização verificada</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input v-model="formData.restricao_respeitada" type="checkbox" class="w-4 h-4 rounded border-border" />
                <span class="text-sm">Restrição respeitada</span>
              </label>
            </div>

            <div>
              <label class="text-sm font-medium mb-1 block">Observações</label>
              <textarea v-model="formData.observacoes" rows="3" placeholder="Descreva detalhes do monitoramento..." class="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none"></textarea>
            </div>

            <div>
              <label class="text-sm font-medium mb-1 block">Encaminhamentos</label>
              <textarea v-model="formData.encaminhamentos" rows="2" placeholder="Descreva encaminhamentos realizados..." class="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none"></textarea>
            </div>
          </div>

          <div class="flex gap-3 pt-4">
            <button type="button" @click="closeModal" class="flex-1 px-4 py-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors font-medium">
              Cancelar
            </button>
            <button type="submit" class="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2">
              <Save class="w-4 h-4" />
              Salvar Registro
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal - Editar Status -->
    <div
      v-if="isEditOpen && editingMonitoramento"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="closeEdit"
    >
      <div class="rounded-lg border border-border bg-card w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10">
          <div>
            <h2 class="text-xl font-bold">Atualizar Monitoramento</h2>
            <p class="text-sm text-muted-foreground">{{ editingMonitoramento.vitima_nome }} → {{ editingMonitoramento.agressor_nome }}</p>
          </div>
          <button @click="closeEdit" class="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="handleEditSave" class="p-6 space-y-5">
          <!-- Status da Visita -->
          <div>
            <p class="text-sm font-semibold mb-2 flex items-center gap-2">
              <ClipboardCheck class="w-4 h-4 text-success" />
              Status da Visita
            </p>
            <div class="grid grid-cols-2 gap-2">
              <button
                v-for="s in statusVisitaOptions"
                :key="s.value"
                type="button"
                @click="editForm.status_visita = s.value as any"
                :class="[
                  'flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium border-2 transition-all',
                  editForm.status_visita === s.value ? s.color + ' border-current' : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                ]"
              >
                <component :is="s.icon" class="w-4 h-4" />
                {{ s.label }}
              </button>
            </div>
          </div>

          <!-- Status da Patrulha -->
          <div>
            <p class="text-sm font-semibold mb-2 flex items-center gap-2">
              <Car class="w-4 h-4 text-info" />
              Status da Patrulha
            </p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                v-for="s in statusPatrulhaOptions"
                :key="s.value"
                type="button"
                @click="editForm.status_patrulha = s.value as any"
                :class="[
                  'flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-lg text-sm font-medium border-2 transition-all',
                  editForm.status_patrulha === s.value ? s.color + ' border-current' : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                ]"
              >
                <component :is="s.icon" class="w-4 h-4" />
                {{ s.label }}
              </button>
            </div>
          </div>

          <!-- Condição e Situação -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium mb-1 block">Condição da Vítima</label>
              <select v-model="editForm.condicao_vitima" class="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50">
                <option value="">Selecione...</option>
                <option v-for="c in condicoesVitima" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-medium mb-1 block">Situação Monitorada</label>
              <select v-model="editForm.situacao_monitorada" class="w-full h-10 rounded-lg border border-border bg-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50">
                <option value="">Selecione...</option>
                <option v-for="s in situacoesMonitoramento" :key="s" :value="s">{{ s }}</option>
              </select>
            </div>
          </div>

          <!-- Risco -->
          <div>
            <label class="text-sm font-medium mb-1 block">Nível de Risco</label>
            <div class="flex gap-2">
              <button
                v-for="r in riscos"
                :key="r.value"
                type="button"
                @click="editForm.risco = r.value as any"
                :class="[
                  'flex-1 py-2 rounded-lg text-sm font-medium border-2 transition-all',
                  editForm.risco === r.value ? r.color + ' border-current' : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/50'
                ]"
              >
                {{ r.label }}
              </button>
            </div>
          </div>

          <!-- Checkboxes -->
          <div class="flex gap-6">
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="editForm.localizacao_verificada" type="checkbox" class="w-4 h-4 rounded border-border" />
              <span class="text-sm">Localização verificada</span>
            </label>
            <label class="flex items-center gap-2 cursor-pointer">
              <input v-model="editForm.restricao_respeitada" type="checkbox" class="w-4 h-4 rounded border-border" />
              <span class="text-sm">Restrição respeitada</span>
            </label>
          </div>

          <!-- Observações -->
          <div>
            <label class="text-sm font-medium mb-1 block">Observações</label>
            <textarea v-model="editForm.observacoes" rows="2" class="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none"></textarea>
          </div>

          <!-- Obs Patrulha -->
          <div>
            <label class="text-sm font-medium mb-1 block flex items-center gap-2">
              <Car class="w-3 h-3 text-info" />
              Observações da Patrulha
            </label>
            <textarea v-model="editForm.obs_patrulha" rows="2" placeholder="Registro da patrulha no local..." class="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none"></textarea>
          </div>

          <!-- Encaminhamentos -->
          <div>
            <label class="text-sm font-medium mb-1 block">Encaminhamentos</label>
            <textarea v-model="editForm.encaminhamentos" rows="2" class="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 resize-none"></textarea>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="button" @click="closeEdit" class="flex-1 px-4 py-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors font-medium">
              Cancelar
            </button>
            <button type="submit" class="flex-1 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium flex items-center justify-center gap-2">
              <Save class="w-4 h-4" />
              Atualizar
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal - Detalhes -->
    <div
      v-if="isDetailOpen && selectedMonitoramento"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="closeDetail"
    >
      <div class="rounded-lg border border-border bg-card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10">
          <h2 class="text-xl font-bold">Detalhes do Monitoramento</h2>
          <button @click="closeDetail" class="p-2 rounded-lg hover:bg-secondary transition-colors">
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 space-y-6">
          <!-- Status Badges -->
          <div class="flex items-center gap-3 flex-wrap">
            <span :class="['px-3 py-1 rounded-full text-sm font-medium border', getRiscoBadge(selectedMonitoramento.risco).color]">
              Risco {{ getRiscoBadge(selectedMonitoramento.risco).label }}
            </span>
            <span :class="['px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1', getStatusVisitaInfo(selectedMonitoramento.status_visita).color]">
              <component :is="getStatusVisitaInfo(selectedMonitoramento.status_visita).icon" class="w-3 h-3" />
              Visita: {{ getStatusVisitaInfo(selectedMonitoramento.status_visita).label }}
            </span>
            <span :class="['px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-1', getStatusPatrulhaInfo(selectedMonitoramento.status_patrulha).color]">
              <component :is="getStatusPatrulhaInfo(selectedMonitoramento.status_patrulha).icon" class="w-3 h-3" />
              Patrulha: {{ getStatusPatrulhaInfo(selectedMonitoramento.status_patrulha).label }}
            </span>
          </div>

          <div class="text-sm text-muted-foreground flex gap-4">
            <span class="flex items-center gap-1">
              <Clock class="w-3 h-3" />
              {{ formatDate(selectedMonitoramento.data_monitoramento) }} às {{ selectedMonitoramento.hora }}
            </span>
            <span v-if="selectedMonitoramento.numero_processo" class="flex items-center gap-1">
              <FileText class="w-3 h-3" />
              {{ selectedMonitoramento.numero_processo }}
            </span>
          </div>

          <!-- Vítima -->
          <div class="bg-secondary/30 border border-border rounded-lg p-4">
            <h4 class="font-semibold flex items-center gap-2 mb-2">
              <User class="w-4 h-4" />
              Vítima
            </h4>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <p><strong>Nome:</strong> {{ selectedMonitoramento.vitima_nome }}</p>
              <p v-if="selectedMonitoramento.vitima_cpf"><strong>CPF:</strong> {{ selectedMonitoramento.vitima_cpf }}</p>
              <p v-if="selectedMonitoramento.vitima_telefone"><strong>Telefone:</strong> {{ selectedMonitoramento.vitima_telefone }}</p>
              <p v-if="selectedMonitoramento.vitima_endereco"><strong>Endereço:</strong> {{ selectedMonitoramento.vitima_endereco }}</p>
            </div>
          </div>

          <!-- Agressor -->
          <div class="bg-secondary/30 border border-border rounded-lg p-4">
            <h4 class="font-semibold flex items-center gap-2 mb-2">
              <UserX class="w-4 h-4" />
              Agressor
            </h4>
            <div class="grid grid-cols-2 gap-2 text-sm">
              <p><strong>Nome:</strong> {{ selectedMonitoramento.agressor_nome }}</p>
              <p v-if="selectedMonitoramento.agressor_cpf"><strong>CPF:</strong> {{ selectedMonitoramento.agressor_cpf }}</p>
              <p v-if="selectedMonitoramento.agressor_telefone"><strong>Telefone:</strong> {{ selectedMonitoramento.agressor_telefone }}</p>
              <p v-if="selectedMonitoramento.agressor_endereco"><strong>Endereço:</strong> {{ selectedMonitoramento.agressor_endereco }}</p>
            </div>
          </div>

          <!-- Monitoramento -->
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <p class="text-xs text-muted-foreground">Condição da Vítima</p>
                <p class="font-medium">{{ selectedMonitoramento.condicao_vitima }}</p>
              </div>
              <div>
                <p class="text-xs text-muted-foreground">Situação Monitorada</p>
                <p class="font-medium">{{ selectedMonitoramento.situacao_monitorada }}</p>
              </div>
            </div>

            <div class="flex gap-6">
              <div class="flex items-center gap-2">
                <CheckCircle v-if="selectedMonitoramento.localizacao_verificada" class="w-5 h-5 text-success" />
                <XCircle v-else class="w-5 h-5 text-destructive" />
                <span class="text-sm">Localização verificada</span>
              </div>
              <div class="flex items-center gap-2">
                <CheckCircle v-if="selectedMonitoramento.restricao_respeitada" class="w-5 h-5 text-success" />
                <XCircle v-else class="w-5 h-5 text-destructive" />
                <span class="text-sm">Restrição respeitada</span>
              </div>
            </div>

            <div v-if="selectedMonitoramento.observacoes">
              <p class="text-xs text-muted-foreground mb-1">Observações</p>
              <p class="text-sm bg-secondary/30 border border-border rounded-lg p-3">{{ selectedMonitoramento.observacoes }}</p>
            </div>

            <div v-if="selectedMonitoramento.obs_patrulha">
              <p class="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Car class="w-3 h-3" />
                Observações da Patrulha
              </p>
              <p class="text-sm bg-secondary/30 border border-border rounded-lg p-3">{{ selectedMonitoramento.obs_patrulha }}</p>
            </div>

            <div v-if="selectedMonitoramento.encaminhamentos">
              <p class="text-xs text-muted-foreground mb-1">Encaminhamentos</p>
              <p class="text-sm bg-secondary/30 border border-border rounded-lg p-3">{{ selectedMonitoramento.encaminhamentos }}</p>
            </div>

            <div v-if="selectedMonitoramento.ultima_atualizacao" class="text-xs text-muted-foreground flex items-center gap-1">
              <AlertTriangle class="w-3 h-3" />
              Última atualização: {{ formatDateTime(selectedMonitoramento.ultima_atualizacao) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
