<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { 
  Phone,
  MapPin,
  Clock,
  Trash2,
  Edit3,
  Plus,
  Save,
  X,
  ExternalLink,
  ArrowLeft
} from 'lucide-vue-next'
import { useRouter } from 'vue-router'
import { 
  getLocaisApoio as getRedeApoio, 
  adicionarLocalApoio, 
  atualizarLocalApoio, 
  removerLocalApoio,
  type LocalApoio,
  type RedeApoio
} from '../services/redeApoioService'

const router = useRouter()
const locaisApoio = ref<(LocalApoio | RedeApoio)[]>([])
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
  { value: 'hospital', label: 'Hospital' },
  { value: 'ong', label: 'ONG' }
]

const loadLocais = async () => {
  locaisApoio.value = await getRedeApoio()
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
          class="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft class="w-5 h-5" />
          Voltar
        </button>
        
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white">
            <Phone class="w-6 h-6" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold text-gradient">
              Rede de Apoio
            </h1>
            <p class="text-muted-foreground text-sm sm:text-base">
              Telefones úteis e locais de atendimento
            </p>
          </div>
        </div>
      </div>

      <!-- Telefones Úteis -->
      <div class="mb-8 animate-fade-in-up">
        <h2 class="font-semibold text-lg text-foreground mb-3">Telefones de Emergência</h2>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <button
            @click="callPhone('180')"
            class="bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <span class="text-2xl font-bold">180</span>
            <p class="text-xs mt-1 opacity-90">Central Mulher</p>
          </button>
          
          <button
            @click="callPhone('190')"
            class="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <span class="text-2xl font-bold">190</span>
            <p class="text-xs mt-1 opacity-90">Polícia Militar</p>
          </button>
          
          <button
            @click="callPhone('192')"
            class="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <span class="text-2xl font-bold">192</span>
            <p class="text-xs mt-1 opacity-90">SAMU</p>
          </button>
          
          <button
            @click="callPhone('129')"
            class="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:scale-105"
          >
            <span class="text-2xl font-bold">129</span>
            <p class="text-xs mt-1 opacity-90">Defensoria</p>
          </button>
        </div>
      </div>

      <!-- Locais de Atendimento -->
      <div class="animate-fade-in-up">
        <div class="bg-card rounded-xl shadow-lg">
          <div class="p-6 pb-4">
            <div class="flex items-center justify-between">
              <h2 class="font-semibold text-lg text-foreground">Locais de Atendimento</h2>
              <button
                @click="openModal()"
                class="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
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
              class="flex items-start gap-4 p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
            >
              <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
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
                      class="p-2 rounded-lg hover:bg-white/50 text-primary transition-colors"
                      title="Abrir no Maps"
                    >
                      <ExternalLink class="w-4 h-4" />
                    </button>
                    <button
                      @click="openModal(local)"
                      class="p-2 rounded-lg hover:bg-white/50 text-muted-foreground hover:text-primary transition-colors"
                      title="Editar"
                    >
                      <Edit3 class="w-4 h-4" />
                    </button>
                    <button
                      @click="deleteLocal(local.id)"
                      class="p-2 rounded-lg hover:bg-white/50 text-muted-foreground hover:text-destructive transition-colors"
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
