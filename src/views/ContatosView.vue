<script setup lang="ts">
import { ref, onMounted } from 'vue'
import {
  UserPlus,
  Phone,
  Trash2,
  Edit3,
  Heart,
  Shield,
  Save,
  X,
  ArrowLeft
} from 'lucide-vue-next'
import {
  fetchContatosAnjo,
  saveContatoAnjo,
  deleteContatoAnjo,
  type ContatoAnjo
} from '../services/contatoAnjoService'
import { useRouter } from 'vue-router'

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
  <div class="bg-gradient-to-br from-background via-secondary/5 to-primary/5">
    <main class="px-3 sm:px-4 md:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-6 animate-fade-in-up">
        <button 
          @click="goBack" 
          class="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft class="w-5 h-5" />
          <span>Voltar</span>
        </button>
        <div class="flex items-center gap-3 mb-2">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white shadow-lg">
            <Heart class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gradient">
              Contatos de Emergência
            </h1>
            <p class="text-muted-foreground text-sm sm:text-base">
              Gerencie seus "Anjos" - pessoas de confiança para emergências
            </p>
          </div>
        </div>
      </div>

      <!-- Info Card -->
      <div class="mb-6 animate-fade-in-up" style="animation-delay: 0.1s">
        <div class="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 sm:p-6">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
              <Shield class="w-5 h-5" />
            </div>
            <div>
              <h3 class="font-bold text-blue-900 dark:text-blue-100 text-sm sm:text-base mb-1">
                Como funciona o SOS Anjo da Guarda?
              </h3>
              <p class="text-blue-700 dark:text-blue-200 text-xs sm:text-sm">
                Ao acionar o botão de SOS Anjo da Guarda, seus contatos cadastrados aqui receberão automaticamente sua localização atual via SMS e/ou WhatsApp para que possam ajudá-lo rapidamente.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Add Button -->
      

      <!-- Contatos List -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up" style="animation-delay: 0.3s">
        <div
          v-for="contato in contatos"
          :key="contato.id"
          class="bg-card rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
        >
          <div class="flex items-start justify-between mb-4">
            <div class="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white">
              <Heart class="w-6 h-6" />
            </div>
            <div class="flex gap-2">
              <button
                @click="openModal(contato)"
                class="p-2 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-primary"
              >
                <Edit3 class="w-4 h-4" />
              </button>
              <button
                @click="deleteContato(contato.id)"
                class="p-2 rounded-lg hover:bg-secondary/50 transition-colors text-muted-foreground hover:text-destructive"
              >
                <Trash2 class="w-4 h-4" />
              </button>
            </div>
          </div>

          <h3 class="font-bold text-foreground text-lg mb-1">{{ contato.nome }}</h3>
          <p v-if="contato.parentesco" class="text-muted-foreground text-sm mb-3">{{ contato.parentesco }}</p>

          <div class="space-y-2">
            <div class="flex items-center gap-2 text-sm">
              <Phone class="w-4 h-4 text-muted-foreground" />
              <span>{{ formatTelefone(contato.telefone) }}</span>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div
          v-if="contatos.length === 0"
          class="col-span-full text-center py-12"
        >
          <div class="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Heart class="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 class="font-semibold text-foreground mb-2">Nenhum contato cadastrado</h3>
          <p class="text-muted-foreground text-sm mb-4">
            Adicione pessoas de confiança que serão acionadas em emergências
          </p>
          <button
            @click="openModal()"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            <UserPlus class="w-4 h-4" />
            Adicionar primeiro contato
          </button>
        </div>
      </div>
    </main>

    <!-- Modal -->
    <div
      v-if="isModalOpen"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      @click.self="closeModal"
    >
      <div class="bg-card rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
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
