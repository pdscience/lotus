<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  UserPlus,
  Phone,
  Trash2,
  Edit3,
  Heart,
  Shield,
  Save,
  X
} from 'lucide-vue-next'
import {
  fetchContatosAnjo,
  saveContatoAnjo,
  deleteContatoAnjo,
  type ContatoAnjo
} from '../services/contatoAnjoService'
import { useRouter } from 'vue-router'
import SectionHeader from '../components/SectionHeader.vue'
import DataTable from '../components/DataTable.vue'
import EmptyState from '../components/EmptyState.vue'

const router = useRouter()

const contatos = ref<ContatoAnjo[]>([])
const isModalOpen = ref(false)
const isEditing = ref(false)
const editingId = ref<string | null>(null)

const formData = ref({
  nome: '',
  telefone: '',
  parentesco: ''
})

const parentescos = ['Cônjuge', 'Filho(a)', 'Pai', 'Mãe', 'Irmão(ã)', 'Amigo(a)', 'Vizinho(a)', 'Outro']

const busca = ref('')
const filtros = computed(() => ['Todos', ...parentescos])
const filtroAtivo = ref('Todos')

const contatosFiltrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return contatos.value.filter(c => {
    const matchesBusca = !termo ||
      c.nome.toLowerCase().includes(termo) ||
      c.telefone.includes(termo) ||
      (c.parentesco || '').toLowerCase().includes(termo)
    const matchesFiltro = filtroAtivo.value === 'Todos' || (c.parentesco || '') === filtroAtivo.value
    return matchesBusca && matchesFiltro
  })
})

const classePorStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case 'ativa': return 'bg-primary/15 text-primary'
    case 'pendente': return 'bg-accent/15'
    case 'cônjuge': return 'bg-primary/15 text-primary'
    case 'filho(a)':
    case 'pai':
    case 'mãe': return 'bg-info/10 text-info border border-info/20'
    case 'amigo(a)':
    case 'vizinho(a)': return 'bg-success/10 text-success border border-success/20'
    default: return 'bg-secondary text-muted-foreground border border-border'
  }
}

const estiloSeloPendente = (status: string) =>
  status.toLowerCase() === 'pendente' ? { color: 'hsl(var(--accent-foreground))' } : undefined

const loadContatos = async () => {
  contatos.value = await fetchContatosAnjo()
}

onMounted(() => {
  loadContatos()
})

const openModal = (contato?: ContatoAnjo) => {
  if (contato) {
    isEditing.value = true
    editingId.value = contato.id
    formData.value = {
      nome: contato.nome,
      telefone: contato.telefone,
      parentesco: contato.parentesco || ''
    }
  } else {
    isEditing.value = false
    editingId.value = null
    formData.value = {
      nome: '',
      telefone: '',
      parentesco: ''
    }
  }
  isModalOpen.value = true
}

const closeModal = () => {
  isModalOpen.value = false
  isEditing.value = false
  editingId.value = null
}

const saveContato = async () => {
  if (!formData.value.nome || !formData.value.telefone) return

  const novoContato: ContatoAnjo = {
    id: isEditing.value && editingId.value ? editingId.value : crypto.randomUUID(),
    nome: formData.value.nome,
    telefone: formData.value.telefone,
    parentesco: formData.value.parentesco
  }

  await saveContatoAnjo(novoContato)

  await loadContatos()
  closeModal()
}

const deleteContato = async (id: string) => {
  if (confirm('Tem certeza que deseja remover este contato de emergência?')) {
    await deleteContatoAnjo(id)
    await loadContatos()
  }
}

const formatTelefone = (telefone: string) => {
  const cleaned = telefone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
  }
  return telefone
}

const goBack = () => {
  router.push('/dashboard')
}
</script>

<template>
  <div class="bg-background">
    <main class="px-3 sm:px-4 md:px-6 lg:px-8 py-8">
      <SectionHeader>
        <template #title>Contatos de emergência</template>
        <template #desc>Seus "Anjos" — pessoas de confiança para emergências</template>
        <template #actions>
          <button
            @click="goBack"
            class="px-4 py-2 rounded-lg border border-border hover:bg-secondary/50 transition-colors text-sm font-medium"
          >
            Voltar
          </button>
          <button
            @click="openModal()"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
          >
            <UserPlus class="w-4 h-4" />
            Novo Anjo
          </button>
        </template>
      </SectionHeader>

      <!-- Info Card -->
      <div class="mb-6">
        <div class="rounded-lg border border-border bg-card p-4 sm:p-6">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center text-foreground flex-shrink-0">
              <Shield class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-foreground text-sm sm:text-base mb-1">
                Como funciona o SOS Anjo da Guarda?
              </h3>
              <p class="text-muted-foreground text-xs sm:text-sm">
                Ao acionar o botão de SOS Anjo da Guarda, seus contatos cadastrados aqui receberão automaticamente sua localização atual via SMS e/ou WhatsApp para que possam ajudá-lo rapidamente.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contatos Table -->
      <div class="flex flex-wrap items-center gap-2 mb-4">
        <input v-model="busca" placeholder="Buscar..." class="input-enhanced !w-64" />
        <button v-for="f in filtros" :key="f" @click="filtroAtivo = f" :class="['rounded-full px-3 py-1 text-xs border', filtroAtivo === f ? 'bg-primary text-primary-foreground border-transparent' : 'border-border text-muted-foreground']">{{ f }}</button>
        <button @click="openModal()" class="rounded-lg px-3 py-1.5 text-xs font-semibold" :style="{ background: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }">+ Novo</button>
      </div>

      <DataTable v-if="contatosFiltrados.length > 0">
        <template #head>
          <th class="font-medium py-3">Nome</th>
          <th class="font-medium py-3">Telefone</th>
          <th class="font-medium py-3 hidden sm:table-cell">Parentesco</th>
          <th class="font-medium py-3 text-right">Ações</th>
        </template>
        <tr v-for="contato in contatosFiltrados" :key="contato.id">
          <td>
            <div class="flex items-center gap-2 py-1">
              <Heart class="w-4 h-4 text-muted-foreground flex-shrink-0" />
              <span class="font-medium text-foreground">{{ contato.nome }}</span>
            </div>
          </td>
          <td>
            <span class="inline-flex items-center gap-1 text-sm">
              <Phone class="w-3 h-3 text-muted-foreground" />
              {{ formatTelefone(contato.telefone) }}
            </span>
          </td>
          <td class="hidden sm:table-cell">
            <span class="rounded-full px-2 py-0.5 text-xs" :class="classePorStatus(contato.parentesco || '—')" :style="estiloSeloPendente(contato.parentesco || '')">{{ contato.parentesco || '—' }}</span>
          </td>
          <td class="text-right">
            <details class="relative inline-block">
              <summary class="cursor-pointer list-none px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary/50 transition-colors">•••</summary>
              <div class="absolute right-0 z-10 rounded-lg border border-border bg-popover p-1 shadow-lg min-w-32">
                <button
                  @click="openModal(contato)"
                  class="flex w-full items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-secondary/50 transition-colors text-left"
                >
                  <Edit3 class="w-4 h-4" />
                  Editar
                </button>
                <button
                  @click="deleteContato(contato.id)"
                  class="flex w-full items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-secondary/50 transition-colors text-left text-destructive"
                >
                  <Trash2 class="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </details>
          </td>
        </tr>
      </DataTable>
      <EmptyState
        v-else
        :icon="Heart"
        title="Nenhum contato cadastrado"
        description="Adicione pessoas de confiança que serão acionadas em emergências"
        action-label="Adicionar primeiro contato"
        @action="openModal()"
      />
    </main>

    <!-- Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div class="bg-card rounded-2xl border border-border w-full max-w-md animate-scale-in">
        <div class="flex items-center justify-between p-6 border-b border-border">
          <h2 class="text-xl font-bold text-foreground">
            {{ isEditing ? 'Editar Contato' : 'Novo Anjo' }}
          </h2>
          <button
            @click="closeModal"
            class="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <form @submit.prevent="saveContato" class="p-6 space-y-4">
          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">
              Nome *
            </label>
            <input
              v-model="formData.nome"
              type="text"
              required
              placeholder="Nome completo"
              class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">
              Telefone *
            </label>
            <input
              v-model="formData.telefone"
              type="tel"
              required
              placeholder="(00) 00000-0000"
              class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label class="text-sm font-medium text-foreground mb-2 block">
              Parentesco/Relação
            </label>
            <select
              v-model="formData.parentesco"
              class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
              <option value="">Selecione...</option>
              <option v-for="p in parentescos" :key="p" :value="p">{{ p }}</option>
            </select>
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
              class="flex-1 px-4 py-3 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium flex items-center justify-center gap-2"
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
