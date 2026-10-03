<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Scale,
  Shield,
  Sparkles,
  Loader2,
  AlertTriangle,
  Home,
  FileText,
  CheckCircle,
  Phone,
  MapPin,
  Clock,
  Trash2,
  Edit3,
  Plus,
  Save,
  X,
  ExternalLink
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { 
  getLocaisApoio, 
  adicionarLocalApoio, 
  atualizarLocalApoio, 
  removerLocalApoio,
  type LocalApoio,
  type RedeApoio
} from '../services/redeApoioService'
import LotusLogo from '../components/LotusLogo.vue'
import SectionHeader from '../components/SectionHeader.vue'
import { isConfigured, gerarApoio } from '../services/iaAconselhamentoService'

const promptIa = ref('')
const respostaIa = ref('')
const loadingIa = ref(false)
const erroIa = ref('')
const iaAtiva = isConfigured()
const enviarIa = async () => {
  erroIa.value = ''
  respostaIa.value = ''
  if (!promptIa.value.trim()) { erroIa.value = 'Escreva como você está se sentindo.'; return }
  loadingIa.value = true
  try { respostaIa.value = await gerarApoio(promptIa.value) }
  catch (e: unknown) { erroIa.value = e instanceof Error ? e.message : 'Não foi possível gerar apoio agora.' }
  finally { loadingIa.value = false }
}

const router = useRouter()

const activeSection = ref('lei')

// Rede de Apoio
const locaisApoio = ref<LocalApoio[]>([])
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

const formData = ref({
  nome: '',
  tipo: 'delegacia' as LocalApoio['tipo'],
  endereco: '',
  cidade: '',
  uf: '',
  telefone: '',
  horario: ''
})

const tipoOptions = [
  { value: 'delegacia', label: 'Delegacia' },
  { value: 'abrigo', label: 'Abrigo' },
  { value: 'saude', label: 'Saúde' },
  { value: 'defensoria', label: 'Defensoria' },
  { value: 'outro', label: 'Outro' }
]

const loadLocais = async () => {
  locaisApoio.value = await getLocaisApoio()
}

onMounted(() => {
  loadLocais()
})

const openModal = (local?: LocalApoio) => {
  if (local) {
    isEditing.value = true
    editingId.value = local.id
    formData.value = {
      nome: local.nome,
      tipo: local.tipo,
      endereco: local.endereco,
      cidade: local.cidade || '',
      uf: local.uf || '',
      telefone: local.telefone,
      horario: local.horario || ''
    }
  } else {
    isEditing.value = false
    editingId.value = null
    formData.value = {
      nome: '',
      tipo: 'delegacia',
      endereco: '',
      cidade: '',
      uf: '',
      telefone: '',
      horario: ''
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  isEditing.value = false
  editingId.value = null
}

const saveLocal = async () => {
  if (!formData.value.nome || !formData.value.endereco || !formData.value.telefone) return

  if (isEditing.value && editingId.value) {
    await atualizarLocalApoio(editingId.value, formData.value)
  } else {
    const novoLocal: RedeApoio = {
      id: crypto.randomUUID(),
      nome: formData.value.nome,
      tipo: formData.value.tipo as any,
      telefone: formData.value.telefone,
      endereco: formData.value.endereco,
      latitude: -20.4697,
      longitude: -54.6201,
      cidade: formData.value.cidade,
      uf: formData.value.uf,
      horario: formData.value.horario
    }
    await adicionarLocalApoio(novoLocal)
  }

  await loadLocais()
  closeModal()
}

const deleteLocal = (id: string) => {
  if (confirm('Tem certeza que deseja remover este local?')) {
    removerLocalApoio(id)
    loadLocais()
  }
}

const openInMaps = (local: LocalApoio) => {
  const address = `${local.endereco}, ${local.cidade} - ${local.uf}`
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
  window.open(url, '_blank')
}

const callPhone = (telefone: string) => {
  const cleanPhone = telefone.replace(/\D/g, '')
  window.location.href = `tel:${cleanPhone}`
}

const sections = [
  { id: 'lei', label: 'Lei Maria da Penha', icon: Scale },
  { id: 'direitos', label: 'Seus Direitos', icon: Shield },
  { id: 'violencia', label: 'Tipos de Violência', icon: AlertTriangle },
  { id: 'medidas', label: 'Medidas Protetivas', icon: Home },
  { id: 'passos', label: 'O que Fazer', icon: CheckCircle },
  { id: 'rede-apoio', label: 'Rede de Apoio', icon: Phone }
]

const tiposViolencia = [
  {
    tipo: 'Violência Física',
    descricao: 'Qualquer conduta que ofenda a integridade ou saúde corporal da mulher.',
    exemplos: ['Empurrões, tapas, socos', 'Chutes, mordidas, puxões de cabelo', 'Queimaduras, cortes', 'Estrangulamento, Uso de armas ou objetos']
  },
  {
    tipo: 'Violência Psicológica',
    descricao: 'Constrangimento, humilhação, manipulação, ameaças e isolamento.',
    exemplos: ['Insultos e depreciacao', 'Controle de onde vai', 'Isolamento de familiares', 'Ameaças e intimidacoes']
  },
  {
    tipo: 'Violência Sexual',
    descricao: 'Forçar relacionamentos sexuais, pornografia forçada, tráfico de mulheres.',
    exemplos: ['Estupro', 'Coercao sexual', 'Impedir uso de contraceptives', 'Forcar gravidez']
  },
  {
    tipo: 'Violência Patrimonial',
    descricao: 'Retenção, subtração, destruição de bens, valores ou documentos.',
    exemplos: ['Tirar dinheiro', 'Destruir pertences', 'Nao pagar pensao', 'Invadir conta bancaria']
  },
  {
    tipo: 'Violência Moral',
    descricao: 'Calúnia, difamação, injúria e ridicularização.',
    exemplos: ['Mentiras sobre voce', 'Divulgar fotos intimas', 'Xingamentos publicos', 'Ridicularizar']
  }
]

const medidas = [
  { titulo: 'Afastamento do agressor', descricao: 'Obrigação do agressor de sair de casa.' },
  { titulo: 'Proibição de aproximação', descricao: 'Impedir contato e aproximação da vítima.' },
  { titulo: 'Restrição de visitas', descricao: 'Suspensão ou limitação de visitas aos dependentes.' },
  { titulo: 'Prestação de alimentos', descricao: 'Pagamento de pensão alimentícia provisória.' },
  { titulo: 'Suspensão de porte de armas', descricao: 'Retirada de armas de fogo do agressor.' }
]

const passos = [
  { num: 1, titulo: 'Procure uma delegacia', desc: 'Preferencialmente uma Delegacia da Mulher (DDM).' },
  { num: 2, titulo: 'Registre o Boletim de Ocorrência', desc: 'Relate todos os fatos em detalhes.' },
  { num: 3, titulo: 'Solicite Medida Protetiva', desc: 'Pode ser feito no mesmo momento do B.O.' },
  { num: 4, titulo: 'Guarde cópia dos documentos', desc: 'Mantenha cópias de todos os registros.' },
  { num: 5, titulo: 'Busque acompanhamento', desc: 'Procure apoio psicológico e jurídico.' }
]

const direitos = [
  'Ter sua integridade física, mental e moral respeitada',
  'Ser atendida com respeito em todos os serviços',
  'Registrar Boletim de Ocorrência sem necessidade de advogado',
  'Solicitar Medidas Protetivas de Urgência',
  'Ter assistência jurídica gratuita (Defensoria Pública)',
  'Ter acompanhamento psicológico e social',
  'Ser encaminhada a abrigo ou programa de proteção',
  'Manter o vínculo trabalhista quando precisar se afastar',
  'Ter prioridade na remoção quando for servidora pública',
  'Incluir dependentes no regime de assistência'
]

const goBack = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="bg-background">
    <main class="px-3 sm:px-4 md:px-6 lg:px-8 py-8">
      <div v-if="iaAtiva" class="mb-6 p-6 rounded-2xl border border-border glass-card shadow-lg">
        <div class="flex items-center gap-3 mb-3">
          <span class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
            <Sparkles class="w-4 h-4" />
          </span>
          <div>
            <p class="font-heading font-semibold text-foreground">Apoio com IA <span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground ml-1">opcional</span></p>
            <p class="text-xs text-muted-foreground">Não substitui ajuda profissional. Em risco imediato ligue 180 ou 190.</p>
          </div>
        </div>
        <textarea v-model="promptIa" rows="3" placeholder="Como você está se sentindo?" class="w-full input-enhanced"></textarea>
        <button @click="enviarIa" :disabled="loadingIa" class="mt-4 w-full h-11 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed">
          <Loader2 v-if="loadingIa" class="w-4 h-4 animate-spin" />
          {{ loadingIa ? 'Gerando...' : 'Receber apoio' }}
        </button>
        <div v-if="erroIa" class="mt-3 flex items-center gap-2 p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertTriangle class="w-4 h-4 flex-shrink-0" />
          {{ erroIa }}
        </div>
        <div v-if="respostaIa" class="mt-3 p-4 rounded-2xl bg-secondary/30 border border-border text-sm text-foreground whitespace-pre-wrap shadow-sm">{{ respostaIa }}</div>
      </div>
      <!-- Header -->
      <SectionHeader>
        <template #title>Informação para você</template>
        <template #desc>Seus direitos e como buscar ajuda</template>
        <template #actions>
          <button
            @click="goBack"
            class="px-4 py-2 rounded-xl border border-border hover:bg-secondary/50 transition-colors text-sm font-medium"
          >
            Voltar
          </button>
        </template>
      </SectionHeader>

      <!-- Navigation Tabs -->
      <div class="mb-6 overflow-x-auto">
        <div class="flex gap-2 pb-2">
          <button
            v-for="section in sections"
            :key="section.id"
            @click="activeSection = section.id"
            :class="[
              'flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-all',
              activeSection === section.id 
                ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' 
                : 'bg-card text-muted-foreground hover:bg-secondary'
            ]"
          >
            <component :is="section.icon" class="w-4 h-4" />
            {{ section.label }}
          </button>
        </div>
      </div>

      <!-- Content Sections -->
      <div class="space-y-6">
        <!-- Lei Maria da Penha -->
        <div v-if="activeSection === 'lei'" class="animate-fade-in-up">
          <div class="rounded-2xl border border-border glass-card shadow-lg p-6">
            <div class="flex items-start gap-4 mb-4">
              <div class="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Scale class="w-6 h-6" />
              </div>
              <div>
                <h2 class="text-xl font-bold font-heading text-foreground">Lei nº 11.340/2006</h2>
                <p class="text-primary font-medium">Lei Maria da Penha</p>
              </div>
            </div>
            <p class="text-muted-foreground leading-relaxed">
              Cria mecanismos para coibir a violência doméstica e familiar contra a mulher. 
              A lei foi criada em 2006 em homenagem à Maria da Penha, que sofreu violência 
              doméstica por anos e cujo caso teve repercussão internacional.
            </p>
            <div class="mt-4 p-4 bg-secondary/30 border border-border rounded-xl">
              <p class="text-sm text-muted-foreground">
                <strong>Importante:</strong> A lei considera violência doméstica qualquer ação ou omissão baseada no gênero que cause morte, lesão, sofrimento físico, sexual ou psicológico.
              </p>
            </div>
          </div>
        </div>

        <!-- Seus Direitos -->
        <div v-if="activeSection === 'direitos'" class="animate-fade-in-up">
          <div class="rounded-2xl border border-border glass-card shadow-lg p-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 rounded-xl bg-success/10 text-success flex items-center justify-center">
                <Shield class="w-6 h-6" />
              </div>
              <h2 class="text-xl font-bold font-heading text-foreground">Seus Direitos</h2>
            </div>
            <div class="space-y-3">
              <div 
                v-for="(direito, index) in direitos" 
                :key="index"
                class="flex items-start gap-3 p-3 rounded-xl bg-secondary/30"
              >
                <CheckCircle class="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                <span class="text-foreground">{{ direito }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Tipos de Violência -->
        <div v-if="activeSection === 'violencia'" class="animate-fade-in-up space-y-4">
          <h2 class="text-xl font-bold font-heading text-foreground">Tipos de Violência</h2>
          <div 
            v-for="(violencia, index) in tiposViolencia" 
            :key="index"
            class="rounded-2xl border border-border glass-card shadow-lg p-6"
          >
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-xl bg-warning/10 text-warning flex items-center justify-center">
                <AlertTriangle class="w-5 h-5" />
              </div>
              <h3 class="font-heading font-bold text-foreground">{{ violencia.tipo }}</h3>
            </div>
            <p class="text-muted-foreground mb-3">{{ violencia.descricao }}</p>
            <div class="flex flex-wrap gap-2">
              <span 
                v-for="(exemplo, i) in violencia.exemplos" 
                :key="i"
                class="px-3 py-1 rounded-full bg-secondary/50 text-foreground text-sm"
              >
                {{ exemplo }}
              </span>
            </div>
          </div>
        </div>

        <!-- Medidas Protetivas -->
        <div v-if="activeSection === 'medidas'" class="animate-fade-in-up space-y-4">
          <div class="rounded-2xl border border-border glass-card shadow-lg p-6">
            <div class="flex items-center gap-3 mb-4">
              <div class="w-12 h-12 rounded-xl bg-info/10 text-info flex items-center justify-center">
                <Home class="w-6 h-6" />
              </div>
              <div>
                <h2 class="text-xl font-bold font-heading text-foreground">Medidas Protetivas</h2>
                <p class="text-muted-foreground text-sm">Garantidas pela Lei Maria da Penha</p>
              </div>
            </div>
            <div class="p-4 bg-secondary/30 border border-border rounded-xl mb-4">
              <p class="text-sm text-muted-foreground">
                <strong>Importante:</strong> As medidas protetivas devem ser concedidas em até 48 horas após a solicitação.
              </p>
            </div>
          </div>
          
          <div class="grid gap-4">
            <div 
              v-for="(medida, index) in medidas" 
              :key="index"
              class="rounded-2xl border border-border glass-card shadow-sm p-5 flex items-start gap-4"
            >
              <div class="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold shadow-md shadow-primary/25 flex-shrink-0">
                {{ index + 1 }}
              </div>
              <div>
                <h3 class="font-heading font-bold text-foreground">{{ medida.titulo }}</h3>
                <p class="text-muted-foreground text-sm">{{ medida.descricao }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- O que Fazer -->
        <div v-if="activeSection === 'passos'" class="animate-fade-in-up space-y-4">
          <div class="rounded-2xl border border-border glass-card shadow-lg p-6">
            <div class="flex items-center gap-3 mb-6">
              <div class="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                <FileText class="w-6 h-6" />
              </div>
              <h2 class="text-xl font-bold font-heading text-foreground">O que Fazer?</h2>
            </div>
          </div>
          
          <div class="grid gap-4">
            <div 
              v-for="passo in passos" 
              :key="passo.num"
              class="rounded-2xl border border-border glass-card shadow-sm p-5 flex items-start gap-4"
            >
              <div class="w-12 h-12 rounded-full bg-primary shadow-lg shadow-primary/25 flex items-center justify-center text-primary-foreground font-bold text-lg flex-shrink-0">
                {{ passo.num }}
              </div>
              <div>
                <h3 class="font-heading font-bold text-foreground mb-1">{{ passo.titulo }}</h3>
                <p class="text-muted-foreground text-sm">{{ passo.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Rede de Apoio -->
        <div v-if="activeSection === 'rede-apoio'" class="animate-fade-in-up space-y-6">
          <!-- Telefones Úteis -->
          <div class="mb-6">
            <div class="flex items-center gap-3 mb-4">
              <span class="w-9 h-9 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center">
                <Phone class="w-5 h-5" />
              </span>
              <h2 class="font-heading font-semibold text-lg text-foreground">Telefones de Emergência</h2>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                @click="callPhone('180')"
                class="rounded-2xl border border-border glass-card shadow-sm hover:shadow-md hover:-translate-y-0.5 p-4 text-center transition-all"
              >
                <span class="text-2xl font-bold tnum text-primary">180</span>
                <p class="text-xs mt-1 text-muted-foreground">Central Mulher</p>
              </button>

              <button
                @click="callPhone('190')"
                class="rounded-2xl border border-border glass-card shadow-sm hover:shadow-md hover:-translate-y-0.5 p-4 text-center transition-all"
              >
                <span class="text-2xl font-bold tnum text-destructive">190</span>
                <p class="text-xs mt-1 text-muted-foreground">Polícia Militar</p>
              </button>

              <button
                @click="callPhone('192')"
                class="rounded-2xl border border-border glass-card shadow-sm hover:shadow-md hover:-translate-y-0.5 p-4 text-center transition-all"
              >
                <span class="text-2xl font-bold tnum text-warning">192</span>
                <p class="text-xs mt-1 text-muted-foreground">SAMU</p>
              </button>

              <button
                @click="callPhone('129')"
                class="rounded-2xl border border-border glass-card shadow-sm hover:shadow-md hover:-translate-y-0.5 p-4 text-center transition-all"
              >
                <span class="text-2xl font-bold tnum text-info">129</span>
                <p class="text-xs mt-1 text-muted-foreground">Defensoria</p>
              </button>
            </div>
          </div>

          <!-- Locais de Atendimento -->
          <div>
            <div class="rounded-2xl border border-border glass-card shadow-lg">
              <div class="p-6 pb-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-3">
                    <span class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <MapPin class="w-5 h-5" />
                    </span>
                    <h2 class="font-heading font-semibold text-lg text-foreground">Locais de Atendimento</h2>
                  </div>
                  <button
                    @click="openModal()"
                    class="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-medium shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.99] transition-all text-sm"
                  >
                    <Plus class="w-4 h-4" />
                    Adicionar
                  </button>
                </div>
              </div>
              
              <div class="px-6 pb-6 space-y-4">
                <div
                  v-for="local in locaisApoio"
                  :key="local.id"
                    class="flex items-start gap-4 p-4 rounded-2xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 hover:shadow-sm transition-all"
                >
                    <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                    <MapPin class="w-5 h-5" />
                  </div>
                  
                  <div class="flex-1 min-w-0">
                    <div class="flex items-start justify-between gap-2">
                      <div>
                        <h3 class="font-semibold text-foreground">{{ local.nome }}</h3>
                        <p class="text-xs text-primary">{{ local.tipo }}</p>
                      </div>
                      <div class="flex gap-1">
                        <button
                          @click="openInMaps(local)"
                          class="p-2 rounded-lg hover:bg-secondary text-primary transition-colors"
                          title="Abrir no Maps"
                        >
                          <ExternalLink class="w-4 h-4" />
                        </button>
                        <button
                          @click="openModal(local)"
                          class="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                          title="Editar"
                        >
                          <Edit3 class="w-4 h-4" />
                        </button>
                        <button
                          @click="deleteLocal(local.id)"
                          class="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-destructive transition-colors"
                          title="Excluir"
                        >
                          <Trash2 class="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div class="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                      <MapPin class="w-3 h-3" />
                      <span>{{ local.endereco }}, {{ local.cidade }}-{{ local.uf }}</span>
                    </div>
                    
                    <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-2">
                      <button
                        @click="callPhone(local.telefone)"
                        class="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        <Phone class="w-3 h-3" />
                        {{ local.telefone }}
                      </button>
                      <div class="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock class="w-3 h-3" />
                        {{ local.horario }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div v-if="locaisApoio.length === 0" class="text-center py-8">
                  <MapPin class="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p class="text-muted-foreground">Nenhum local cadastrado</p>
                  <button
                    @click="openModal()"
                    class="mt-3 text-primary hover:underline text-sm"
                  >
                    Adicionar primeiro local
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Frase Final -->
        <div class="animate-fade-in-up">
          <div class="rounded-2xl border border-border glass-card shadow-lg py-4 px-6 text-center">
            <div class="flex items-center justify-center gap-4">
              <div class="w-14 h-14 rounded-full bg-secondary/50 border border-border flex items-center justify-center flex-shrink-0">
                <LotusLogo size="sm" />
              </div>
              <div class="text-left">
                <h2 class="text-lg font-bold font-heading text-foreground">Você não está sozinha!</h2>
                <p class="text-muted-foreground text-sm">
                  Há uma rede de apoio pronta para ajudá-la. Não tenha medo de buscar seus direitos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div class="bg-card rounded-2xl border border-border shadow-2xl w-full max-w-2xl mx-auto animate-scale-in">
        <div class="flex items-center justify-between p-6 border-b border-border">
          <h2 class="text-xl font-bold font-heading text-foreground">
            {{ isEditing ? 'Editar Local' : 'Novo Local de Apoio' }}
          </h2>
          <button
            @click="closeModal"
            class="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveLocal" class="p-6 space-y-4">
          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">Nome *</label>
            <input
              v-model="formData.nome"
              type="text"
              required
              placeholder="Nome do local"
              class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">Tipo</label>
            <select
              v-model="formData.tipo"
              class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option v-for="opt in tipoOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">Endereço *</label>
            <input
              v-model="formData.endereco"
              type="text"
              required
              placeholder="Rua, número, bairro"
              class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-medium text-foreground mb-2 block">Cidade</label>
              <input
                v-model="formData.cidade"
                type="text"
                placeholder="Cidade"
                class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label class="text-sm font-medium text-foreground mb-2 block">UF</label>
              <input
                v-model="formData.uf"
                type="text"
                maxlength="2"
                placeholder="SP"
                class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">Telefone *</label>
            <input
              v-model="formData.telefone"
              type="tel"
              required
              placeholder="(00) 00000-0000"
              class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">Horário</label>
            <input
              v-model="formData.horario"
              type="text"
              placeholder="24 horas ou Seg a Sex, 08h às 18h"
              class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div class="flex gap-3 pt-4">
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-3 rounded-xl border border-border hover:bg-secondary/50 transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              class="flex-1 px-4 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-500 to-purple-600 shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              <Save class="w-4 h-4" />
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
