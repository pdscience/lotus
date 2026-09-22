<script setup lang="ts">
import { ref, onUnmounted, nextTick, watch } from 'vue'
import {
  User,
  UserX,
  Users,
  Shield,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Save,
  FileText,
  MapPin,
  XCircle,
  Navigation
} from 'lucide-vue-next'
import { useUserStore } from '../stores/userStore'
import { supabase } from '../lib/supabase'
import SectionHeader from '../components/SectionHeader.vue'
import { geocodificarEndereco, reverseGeocode } from '../services/geocodingService'
import 'leaflet/dist/leaflet.css'

let L: typeof import('leaflet') | null = null

const userStore = useUserStore()

type FormStep = 'ofendida' | 'ofensor' | 'dependentes' | 'medidas'

const currentStep = ref<FormStep>('ofendida')
const isSaving = ref(false)

// Form data states
const ofendidaData = ref<Record<string, any>>({})
const ofensorData = ref<Record<string, any>>({})
const dependentesData = ref<Record<string, any>[]>([])
const medidasData = ref<Record<string, any>>({})

// Location state
const latVitima = ref<number | null>(null)
const lngVitima = ref<number | null>(null)
const latAgressor = ref<number | null>(null)
const lngAgressor = ref<number | null>(null)
const enderecoVitima = ref('')
const enderecoAgressor = ref('')
const bairroVitima = ref('')
const bairroAgressor = ref('')
const geocodingVitima = ref(false)
const geocodingAgressor = ref(false)

// Map refs
let vitimaMap: import('leaflet').Map | null = null
let agressorMap: import('leaflet').Map | null = null
let vitimaMarker: import('leaflet').Marker | null = null
let agressorMarker: import('leaflet').Marker | null = null
const vitimaMapReady = ref(false)
const agressorMapReady = ref(false)

const MS_CENTER: [number, number] = [-20.4697, -54.6201]

const steps = [
  {
    id: 'ofendida' as FormStep,
    title: 'Dados da Vítima',
    description: 'Informações pessoais da ofendida',
    icon: User,
    color: 'bg-blue-500'
  },
  {
    id: 'ofensor' as FormStep,
    title: 'Dados do Agressor',
    description: 'Informações do ofensor',
    icon: UserX,
    color: 'bg-red-500'
  },
  {
    id: 'dependentes' as FormStep,
    title: 'Dependentes',
    description: 'Filhos e dependentes',
    icon: Users,
    color: 'bg-green-500'
  },
  {
    id: 'medidas' as FormStep,
    title: 'Medidas Protetivas',
    description: 'Configuração das proteções',
    icon: Shield,
    color: 'bg-purple-500'
  }
]

const getCurrentStepIndex = () => {
  return steps.findIndex(step => step.id === currentStep.value)
}

const canProceed = () => {
  switch (currentStep.value) {
    case 'ofendida':
      return ofendidaData.value.nomeCompleto && ofendidaData.value.cpf && ofendidaData.value.telefone
    case 'ofensor':
      return ofensorData.value.nomeCompleto && ofensorData.value.cpf
    case 'dependentes':
      return true // Optional step
    case 'medidas':
      return Object.keys(medidasData.value).length > 0
    default:
      return false
  }
}

const handleNext = () => {
  const currentIndex = getCurrentStepIndex()
  if (currentIndex < steps.length - 1) {
    currentStep.value = steps[currentIndex + 1].id
  }
}

const handlePrevious = () => {
  const currentIndex = getCurrentStepIndex()
  if (currentIndex > 0) {
    currentStep.value = steps[currentIndex - 1].id
  }
}

const addDependente = () => {
  dependentesData.value.push({
    id: Date.now().toString(),
    nomeCompleto: '',
    dataNascimento: '',
    parentesco: '',
    cpf: ''
  })
}

const removeDependente = (id: string) => {
  const index = dependentesData.value.findIndex(d => d.id === id)
  if (index !== -1) {
    dependentesData.value.splice(index, 1)
  }
}

async function initLeaflet() {
  if (!L) {
    L = await import('leaflet')
  }
}

function createMarkerIcon(color: string) {
  return L!.divIcon({
    className: 'custom-div-icon',
    html: `<div class="w-4 h-4 ${color} rounded-full border-2 border-white shadow-lg"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8]
  })
}

async function geocodificarEAtualizar_mapa(endereco: string, target: 'vitima' | 'agressor') {
  if (!endereco || endereco.length < 8) return

  if (target === 'vitima') geocodingVitima.value = true
  else geocodingAgressor.value = true

  try {
    const resultado = await geocodificarEndereco(endereco)
    if (!resultado) return

    if (target === 'vitima') {
      latVitima.value = resultado.lat
      lngVitima.value = resultado.lng
      if (resultado.bairro) bairroVitima.value = resultado.bairro
      if (vitimaMap) {
        vitimaMap.setView([resultado.lat, resultado.lng], 15)
        if (vitimaMarker) vitimaMap.removeLayer(vitimaMarker)
        vitimaMarker = L!.marker([resultado.lat, resultado.lng], { icon: createMarkerIcon('bg-blue-500') })
          .addTo(vitimaMap)
          .bindPopup(endereco)
      }
    } else {
      latAgressor.value = resultado.lat
      lngAgressor.value = resultado.lng
      if (resultado.bairro) bairroAgressor.value = resultado.bairro
      if (agressorMap) {
        agressorMap.setView([resultado.lat, resultado.lng], 15)
        if (agressorMarker) agressorMap.removeLayer(agressorMarker)
        agressorMarker = L!.marker([resultado.lat, resultado.lng], { icon: createMarkerIcon('bg-red-500') })
          .addTo(agressorMap)
          .bindPopup(endereco)
      }
    }
  } finally {
    geocodingVitima.value = false
    geocodingAgressor.value = false
  }
}

let geocodeTimerVitima: ReturnType<typeof setTimeout> | null = null
let geocodeTimerAgressor: ReturnType<typeof setTimeout> | null = null

function onEnderecoVitimaInput() {
  if (geocodeTimerVitima) clearTimeout(geocodeTimerVitima)
  geocodeTimerVitima = setTimeout(() => {
    geocodificarEAtualizar_mapa(enderecoVitima.value, 'vitima')
  }, 1000)
}

function onEnderecoAgressorInput() {
  if (geocodeTimerAgressor) clearTimeout(geocodeTimerAgressor)
  geocodeTimerAgressor = setTimeout(() => {
    geocodificarEAtualizar_mapa(enderecoAgressor.value, 'agressor')
  }, 1000)
}

async function initVitimaMap() {
  await initLeaflet()
  await nextTick()
  const el = document.getElementById('vitima-map')
  if (!el || vitimaMap) return

  vitimaMap = L!.map(el).setView(MS_CENTER, 6)
  L!.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(vitimaMap)

  vitimaMap.on('click', async (e: any) => {
    const { lat, lng } = e.latlng
    latVitima.value = lat
    lngVitima.value = lng
    if (vitimaMarker) vitimaMap?.removeLayer(vitimaMarker)
    vitimaMarker = L!.marker([lat, lng], { icon: createMarkerIcon('bg-blue-500') })
      .addTo(vitimaMap!)
      .bindPopup('Localização da vítima')

    const rev = await reverseGeocode(lat, lng)
    if (rev) {
      if (rev.enderecoCompleto) enderecoVitima.value = rev.enderecoCompleto.split(',').slice(0, 3).join(',')
      if (rev.bairro) bairroVitima.value = rev.bairro
    }
  })

  vitimaMapReady.value = true
}

async function initAgressorMap() {
  await initLeaflet()
  await nextTick()
  const el = document.getElementById('agressor-map')
  if (!el || agressorMap) return

  agressorMap = L!.map(el).setView(MS_CENTER, 6)
  L!.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
  }).addTo(agressorMap)

  agressorMap.on('click', async (e: any) => {
    const { lat, lng } = e.latlng
    latAgressor.value = lat
    lngAgressor.value = lng
    if (agressorMarker) agressorMap?.removeLayer(agressorMarker)
    agressorMarker = L!.marker([lat, lng], { icon: createMarkerIcon('bg-red-500') })
      .addTo(agressorMap!)
      .bindPopup('Localização do agressor')

    const rev = await reverseGeocode(lat, lng)
    if (rev) {
      if (rev.enderecoCompleto) enderecoAgressor.value = rev.enderecoCompleto.split(',').slice(0, 3).join(',')
      if (rev.bairro) bairroAgressor.value = rev.bairro
    }
  })

  agressorMapReady.value = true
}

function useMyLocation(target: 'vitima' | 'agressor') {
  if (!navigator.geolocation) return
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      const { latitude, longitude } = pos.coords
      if (target === 'vitima') {
        latVitima.value = latitude
        lngVitima.value = longitude
        if (vitimaMap) {
          vitimaMap.setView([latitude, longitude], 15)
          if (vitimaMarker) vitimaMap.removeLayer(vitimaMarker)
          vitimaMarker = L!.marker([latitude, longitude], { icon: createMarkerIcon('bg-blue-500') })
            .addTo(vitimaMap)
            .bindPopup('Localização da vítima')
        }
        const rev = await reverseGeocode(latitude, longitude)
        if (rev) {
          if (rev.enderecoCompleto) enderecoVitima.value = rev.enderecoCompleto.split(',').slice(0, 3).join(',')
          if (rev.bairro) bairroVitima.value = rev.bairro
        }
      } else {
        latAgressor.value = latitude
        lngAgressor.value = longitude
        if (agressorMap) {
          agressorMap.setView([latitude, longitude], 15)
          if (agressorMarker) agressorMap.removeLayer(agressorMarker)
          agressorMarker = L!.marker([latitude, longitude], { icon: createMarkerIcon('bg-red-500') })
            .addTo(agressorMap)
            .bindPopup('Localização do agressor')
        }
        const rev = await reverseGeocode(latitude, longitude)
        if (rev) {
          if (rev.enderecoCompleto) enderecoAgressor.value = rev.enderecoCompleto.split(',').slice(0, 3).join(',')
          if (rev.bairro) bairroAgressor.value = rev.bairro
        }
      }
    },
    () => alert('Não foi possível obter sua localização')
  )
}

watch(currentStep, async (step) => {
  if (step === 'ofendida') {
    await nextTick()
    setTimeout(() => {
      initVitimaMap()
      if (vitimaMap) vitimaMap.invalidateSize()
    }, 100)
  } else if (step === 'ofensor') {
    await nextTick()
    setTimeout(() => {
      initAgressorMap()
      if (agressorMap) agressorMap.invalidateSize()
    }, 100)
  }
}, { immediate: true })

watch([latVitima, lngVitima], ([lat, lng]) => {
  if (lat && lng && vitimaMap && L) {
    vitimaMap.setView([lat, lng], 15)
    if (vitimaMarker) vitimaMap.removeLayer(vitimaMarker)
    vitimaMarker = L.marker([lat, lng], { icon: createMarkerIcon('bg-blue-500') })
      .addTo(vitimaMap)
      .bindPopup('Localização da vítima')
  }
})

watch([latAgressor, lngAgressor], ([lat, lng]) => {
  if (lat && lng && agressorMap && L) {
    agressorMap.setView([lat, lng], 15)
    if (agressorMarker) agressorMap.removeLayer(agressorMarker)
    agressorMarker = L.marker([lat, lng], { icon: createMarkerIcon('bg-red-500') })
      .addTo(agressorMap)
      .bindPopup('Localização do agressor')
  }
})

onUnmounted(() => {
  if (vitimaMap) { vitimaMap.remove(); vitimaMap = null }
  if (agressorMap) { agressorMap.remove(); agressorMap = null }
})

const handleSave = async () => {
  isSaving.value = true

  try {
    const user = userStore.user
    const numeroProcesso = medidasData.value.numero || `${Date.now()}`
    const tipoMedida = medidasData.value.tipoMedida || 'urgencia'
    const descricaoParts: string[] = []

    if (medidasData.value.localTrabalhoVitima) {
      descricaoParts.push(`Local de trabalho: ${medidasData.value.localTrabalhoVitima}`)
    }
    if (medidasData.value.escolaVitima) {
      descricaoParts.push(`Escola vítima: ${medidasData.value.escolaVitima}`)
    }
    if (medidasData.value.escolaDependente) {
      descricaoParts.push(`Escola dependente: ${medidasData.value.escolaDependente}`)
    }

    const { error } = await supabase
      .database.from('medidas_protetivas')
      .insert([{
        usuario_id: user?.id || null,
        nome_ofendida: ofendidaData.value.nomeCompleto || '',
        nome_ofensor: ofensorData.value.nomeCompleto || '',
        numero_processo: numeroProcesso,
        data_registro: new Date().toISOString().split('T')[0],
        status: 'ativa',
        urgencia: 'media',
        cidade: ofendidaData.value.cidade || '',
        uf: 'MS',
        tipo: tipoMedida,
        descricao: descricaoParts.join('. ') || `Medida ${tipoMedida} - Processo ${numeroProcesso}`,
        data_inicio: new Date().toISOString().split('T')[0],
        latitude_vitima: latVitima.value,
        longitude_vitima: lngVitima.value,
        latitude_agressor: latAgressor.value,
        longitude_agressor: lngAgressor.value,
        endereco_vitima: enderecoVitima.value || null,
        endereco_agressor: enderecoAgressor.value || null,
        bairro_vitima: bairroVitima.value || null,
        bairro_agressor: bairroAgressor.value || null
      }])

    if (error) {
      console.error('Erro ao salvar medida:', error)
      alert('Erro ao salvar cadastro. Tente novamente.')
      return
    }

    alert('Cadastro realizado com sucesso!')

    ofendidaData.value = {}
    ofensorData.value = {}
    dependentesData.value = []
    medidasData.value = {}
    currentStep.value = 'ofendida'
  } catch (e) {
    console.error('Erro inesperado:', e)
    alert('Erro ao salvar cadastro. Tente novamente.')
  } finally {
    isSaving.value = false
  }
}
</script>

<template>
  <div class="bg-background">
    <main class="px-3 sm:px-4 md:px-6 lg:px-8 py-8">
      <SectionHeader>
        <template #title>Cadastrar nova medida protetiva</template>
        <template #desc>Registro completo de medida protetiva de urgência</template>
      </SectionHeader>

      <!-- Wizard vertical: passos laterais + conteúdo -->
      <div class="flex flex-col lg:flex-row gap-6 mb-8">
        <!-- Progress Steps (lateral vertical) -->
        <aside class="lg:w-64 shrink-0">
          <div class="rounded-lg border border-border glass-card p-6">
            <div class="flex flex-row lg:flex-col items-start justify-between lg:justify-start gap-2">
              <div
                v-for="(step, index) in steps"
                :key="step.id"
                class="flex flex-1 lg:flex-none flex-col items-center lg:items-stretch"
              >
                <div class="flex flex-col lg:flex-row items-center lg:items-center gap-0 lg:gap-3">
                  <button
                    @click="currentStep = step.id"
                    :class="`w-12 h-12 rounded-xl flex items-center justify-center font-semibold transition-colors mb-2 lg:mb-0 shrink-0 ${
                      currentStep === step.id
                        ? 'bg-primary text-primary-foreground'
                        : index < getCurrentStepIndex()
                        ? 'bg-success/15 text-success border border-success/20'
                        : 'bg-secondary text-muted-foreground'
                    }`"
                  >
                    <Check v-if="index < getCurrentStepIndex()" class="w-5 h-5" />
                    <component v-else :is="step.icon" class="w-5 h-5" />
                  </button>

                  <div class="text-center lg:text-left">
                    <p :class="`text-sm font-semibold ${
                      currentStep === step.id ? 'text-primary' : 'text-muted-foreground'
                    }`">
                      {{ step.title }}
                    </p>
                    <p class="text-xs text-muted-foreground hidden md:block">
                      {{ step.description }}
                    </p>
                  </div>
                </div>

                <div
                  v-if="index < steps.length - 1"
                  :class="`w-1 h-8 lg:w-1 lg:h-8 lg:ml-6 lg:my-2 mx-auto my-2 rounded-full transition-colors duration-300 ${
                    index < getCurrentStepIndex() ? 'bg-primary' : 'bg-border'
                  }`"
                />
              </div>
            </div>
          </div>
        </aside>

        <!-- Form Content -->
        <div class="flex-1 min-w-0" :key="currentStep">
        <!-- Ofendida Form -->
        <div v-if="currentStep === 'ofendida'" class="rounded-lg border border-border glass-card p-6">
          <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
            <User class="w-5 h-5 text-blue-500" />
            Dados da Vítima (Ofendida)
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-semibold text-foreground/80 mb-2 block">Nome Completo *</label>
              <input
                v-model="ofendidaData.nomeCompleto"
                type="text"
                class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Digite o nome completo"
              />
            </div>
            <div>
              <label class="text-sm font-semibold text-foreground/80 mb-2 block">CPF *</label>
              <input
                v-model="ofendidaData.cpf"
                type="text"
                class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label class="text-sm font-semibold text-foreground/80 mb-2 block">RG</label>
              <input
                v-model="ofendidaData.rg"
                type="text"
                class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Digite o RG"
              />
            </div>
            <div>
              <label class="text-sm font-semibold text-foreground/80 mb-2 block">Data de Nascimento</label>
              <input
                v-model="ofendidaData.dataNascimento"
                type="date"
                class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label class="text-sm font-semibold text-foreground/80 mb-2 block">Telefone *</label>
              <input
                v-model="ofendidaData.telefone"
                type="tel"
                class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label class="text-sm font-semibold text-foreground/80 mb-2 block">E-mail</label>
              <input
                v-model="ofendidaData.email"
                type="email"
                class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="email@exemplo.com"
              />
            </div>
            <div>
              <label class="text-sm font-semibold text-foreground/80 mb-2 block">Profissão</label>
              <input
                v-model="ofendidaData.profissao"
                type="text"
                class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Digite a profissão"
              />
            </div>
          </div>

          <!-- Mapa Localização da Vítima -->
          <div class="mt-6 pt-6 border-t border-border/30">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <MapPin class="w-5 h-5 text-blue-500" />
                <h3 class="text-lg font-semibold">Localização da Vítima</h3>
              </div>
              <button
                type="button"
                @click="useMyLocation('vitima')"
                class="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/50 text-sm transition-colors"
              >
                <Navigation class="w-3.5 h-3.5" />
                Usar minha localização
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div class="md:col-span-2">
                <label class="text-sm font-semibold text-foreground/80 mb-2 block">Endereço da Vítima</label>
                <input
                  v-model="enderecoVitima"
                  type="text"
                  @input="onEnderecoVitimaInput"
                  class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Rua, número - Bairro, Cidade - UF"
                />
                <p v-if="geocodingVitima" class="text-xs text-blue-500 mt-1">Buscando localização...</p>
              </div>
              <div>
                <label class="text-sm font-semibold text-foreground/80 mb-2 block">Bairro</label>
                <input
                  v-model="bairroVitima"
                  type="text"
                  class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Bairro"
                />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-sm font-semibold text-foreground/80 mb-2 block">Latitude</label>
                  <input
                    v-model.number="latVitima"
                    type="number"
                    step="any"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="-20.4697"
                  />
                </div>
                <div>
                  <label class="text-sm font-semibold text-foreground/80 mb-2 block">Longitude</label>
                  <input
                    v-model.number="lngVitima"
                    type="number"
                    step="any"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="-54.6201"
                  />
                </div>
              </div>
            </div>

            <p class="text-sm text-muted-foreground mb-3">Ou clique no mapa para marcar a localização</p>
            <div id="vitima-map" class="h-[300px] rounded-lg z-0 border border-border/50"></div>
            <p v-if="latVitima && lngVitima" class="mt-2 text-xs text-muted-foreground">
              Coordenadas: {{ latVitima.toFixed(6) }}, {{ lngVitima.toFixed(6) }}
            </p>
          </div>
        </div>

        <!-- Ofensor Form -->
        <div v-else-if="currentStep === 'ofensor'" class="rounded-lg border border-border glass-card p-6">
          <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
            <UserX class="w-5 h-5 text-red-500" />
            Dados do Agressor (Ofensor)
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-sm font-semibold text-foreground/80 mb-2 block">Nome Completo *</label>
              <input
                v-model="ofensorData.nomeCompleto"
                type="text"
                class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Digite o nome completo"
              />
            </div>
            <div>
              <label class="text-sm font-semibold text-foreground/80 mb-2 block">CPF *</label>
              <input
                v-model="ofensorData.cpf"
                type="text"
                class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="000.000.000-00"
              />
            </div>
            <div>
              <label class="text-sm font-semibold text-foreground/80 mb-2 block">RG</label>
              <input
                v-model="ofensorData.rg"
                type="text"
                class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Digite o RG"
              />
            </div>
            <div>
              <label class="text-sm font-semibold text-foreground/80 mb-2 block">Data de Nascimento</label>
              <input
                v-model="ofensorData.dataNascimento"
                type="date"
                class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div>
              <label class="text-sm font-semibold text-foreground/80 mb-2 block">Telefone</label>
              <input
                v-model="ofensorData.telefone"
                type="tel"
                class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="(00) 00000-0000"
              />
            </div>
            <div>
              <label class="text-sm font-semibold text-foreground/80 mb-2 block">Profissão</label>
              <input
                v-model="ofensorData.profissao"
                type="text"
                class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Digite a profissão"
              />
            </div>
          </div>

          <!-- Mapa Localização do Agressor -->
          <div class="mt-6 pt-6 border-t border-border/30">
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <MapPin class="w-5 h-5 text-red-500" />
                <h3 class="text-lg font-semibold">Localização do Agressor</h3>
              </div>
              <button
                type="button"
                @click="useMyLocation('agressor')"
                class="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/50 text-sm transition-colors"
              >
                <Navigation class="w-3.5 h-3.5" />
                Usar minha localização
              </button>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <div class="md:col-span-2">
                <label class="text-sm font-semibold text-foreground/80 mb-2 block">Endereço do Agressor</label>
                <input
                  v-model="enderecoAgressor"
                  type="text"
                  @input="onEnderecoAgressorInput"
                  class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Rua, número - Bairro, Cidade - UF"
                />
                <p v-if="geocodingAgressor" class="text-xs text-red-500 mt-1">Buscando localização...</p>
              </div>
              <div>
                <label class="text-sm font-semibold text-foreground/80 mb-2 block">Bairro</label>
                <input
                  v-model="bairroAgressor"
                  type="text"
                  class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Bairro"
                />
              </div>
              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="text-sm font-semibold text-foreground/80 mb-2 block">Latitude</label>
                  <input
                    v-model.number="latAgressor"
                    type="number"
                    step="any"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="-22.2681"
                  />
                </div>
                <div>
                  <label class="text-sm font-semibold text-foreground/80 mb-2 block">Longitude</label>
                  <input
                    v-model.number="lngAgressor"
                    type="number"
                    step="any"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="-54.8084"
                  />
                </div>
              </div>
            </div>

            <p class="text-sm text-muted-foreground mb-3">Ou clique no mapa para marcar a localização</p>
            <div id="agressor-map" class="h-[300px] rounded-lg z-0 border border-border/50"></div>
            <p v-if="latAgressor && lngAgressor" class="mt-2 text-xs text-muted-foreground">
              Coordenadas: {{ latAgressor.toFixed(6) }}, {{ lngAgressor.toFixed(6) }}
            </p>
          </div>
        </div>

        <!-- Dependentes Form -->
        <div v-else-if="currentStep === 'dependentes'" class="rounded-lg border border-border glass-card p-6">
          <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
            <Users class="w-5 h-5 text-green-500" />
            Dependentes
          </h2>
          
          <!-- Lista de Dependentes -->
          <div v-if="dependentesData.length > 0" class="space-y-4 mb-6">
            <div
              v-for="(dependente, index) in dependentesData"
              :key="dependente.id"
              class="p-4 rounded-xl border border-border/50 bg-secondary/20"
            >
              <div class="flex items-center justify-between mb-4">
                <h3 class="font-semibold text-foreground">Dependente {{ index + 1 }}</h3>
                <button
                  type="button"
                  @click="removeDependente(dependente.id)"
                  class="text-destructive hover:text-destructive/80 transition-colors"
                >
                  <XCircle class="w-5 h-5" />
                </button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-sm font-semibold text-foreground/80 mb-2 block">Nome Completo *</label>
                  <input
                    v-model="dependente.nomeCompleto"
                    type="text"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="Digite o nome completo"
                  />
                </div>
                <div>
                  <label class="text-sm font-semibold text-foreground/80 mb-2 block">CPF</label>
                  <input
                    v-model="dependente.cpf"
                    type="text"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                    placeholder="000.000.000-00"
                  />
                </div>
                <div>
                  <label class="text-sm font-semibold text-foreground/80 mb-2 block">Data de Nascimento *</label>
                  <input
                    v-model="dependente.dataNascimento"
                    type="date"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label class="text-sm font-semibold text-foreground/80 mb-2 block">Parentesco *</label>
                  <select
                    v-model="dependente.parentesco"
                    class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Selecione o parentesco</option>
                    <option value="filho">Filho(a)</option>
                    <option value="enteado">Enteado(a)</option>
                    <option value="neto">Neto(a)</option>
                    <option value="sobrinho">Sobrinho(a)</option>
                    <option value="outro">Outro</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Botão Adicionar Dependente -->
          <div class="text-center py-8">
            <Users class="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p class="text-muted-foreground mb-4">Adicione dependentes se houver</p>
            <button
              type="button"
              @click="addDependente"
              class="px-4 py-2 rounded-lg border border-dashed border-border hover:bg-secondary/50 transition-colors"
            >
              + Adicionar Dependente
            </button>
          </div>
        </div>

        <!-- Medidas Protetivas Form -->
        <div v-else-if="currentStep === 'medidas'" class="rounded-lg border border-border glass-card p-6">
          <h2 class="text-xl font-semibold mb-6 flex items-center gap-2">
            <Shield class="w-5 h-5 text-purple-500" />
            Medidas Protetivas
          </h2>
          <div class="space-y-4">
            <div>
              <label class="text-sm font-semibold text-foreground/80 mb-2 block">Tipo de Medida</label>
              <select
                v-model="medidasData.tipoMedida"
                class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Selecione o tipo</option>
                <option value="criminal">Medida Cível</option>
                <option value="urgencia">Urgência</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-semibold text-foreground/80 mb-2 block">Número do Processo</label>
              <input
                v-model="medidasData.numero"
                type="text"
                class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="0000000-00.0000.0"
              />
            </div>
            <div>
              <label class="text-sm font-semibold text-foreground/80 mb-2 block">Local de Expedição</label>
              <input
                v-model="medidasData.localExpedicao"
                type="text"
                class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Digite o local"
              />
            </div>
            <div>
              <label class="text-sm font-semibold text-foreground/80 mb-2 block">Data de Expedição</label>
              <input
                v-model="medidasData.dataExpedicao"
                type="date"
                class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>
          
          <!-- Locais Proibidos para o Agressor -->
          <div class="mt-6 pt-6 border-t border-border/30">
            <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin class="w-5 h-5 text-red-500" />
              Locais Proibidos para o Agressor
            </h3>
            <p class="text-sm text-muted-foreground mb-4">
              Informe os locais onde o agressor não pode se aproximar
            </p>
            <div class="space-y-4">
              <div>
                <label class="text-sm font-semibold text-foreground/80 mb-2 block">Local de Trabalho da Vítima</label>
                <input
                  v-model="medidasData.localTrabalhoVitima"
                  type="text"
                  class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Nome e endereço do local de trabalho"
                />
              </div>
              <div>
                <label class="text-sm font-semibold text-foreground/80 mb-2 block">Escola da Vítima</label>
                <input
                  v-model="medidasData.escolaVitima"
                  type="text"
                  class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Nome e endereço da escola"
                />
              </div>
              <div>
                <label class="text-sm font-semibold text-foreground/80 mb-2 block">Escola do Dependente</label>
                <input
                  v-model="medidasData.escolaDependente"
                  type="text"
                  class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                  placeholder="Nome e endereço da escola do dependente"
                />
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      <!-- Navigation -->
      <div>
        <div class="rounded-lg border border-border glass-card p-6">
          <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div class="flex items-center gap-3">
              <div class="flex items-center gap-1 px-3 py-1 rounded-lg border border-border text-sm">
                <FileText class="w-3 h-3" />
                Etapa {{ getCurrentStepIndex() + 1 }} de {{ steps.length }}
              </div>
              
              <div v-if="!canProceed() && currentStep !== 'dependentes'" class="flex items-center gap-1 text-warning text-sm">
                <AlertCircle class="w-4 h-4" />
                <span>Preencha os campos obrigatórios</span>
              </div>
            </div>

            <div class="flex gap-3 w-full sm:w-auto">
              <button
                v-if="getCurrentStepIndex() > 0"
                @click="handlePrevious"
                class="flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors text-sm font-semibold flex-1 sm:flex-initial"
              >
                <ChevronLeft class="w-4 h-4" />
                Anterior
              </button>
              
              <button
                v-if="getCurrentStepIndex() < steps.length - 1"
                @click="handleNext"
                :disabled="!canProceed()"
                class="flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex-1 sm:flex-initial"
              >
                Próximo
                <ChevronRight class="w-4 h-4" />
              </button>
              <button
                v-else
                @click="handleSave"
                :disabled="!canProceed() || isSaving"
                class="flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-accent text-accent-foreground text-sm font-semibold hover:bg-accent/90 transition-opacity disabled:opacity-50 flex-1 sm:flex-initial"
              >
                <div v-if="isSaving" class="flex items-center gap-2">
                  <div class="w-4 h-4 border-2 border-accent-foreground/30 border-t-accent-foreground rounded-full animate-spin" />
                  Salvando...
                </div>
                <template v-else>
                  <Save class="w-4 h-4" />
                  Finalizar Cadastro
                </template>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
