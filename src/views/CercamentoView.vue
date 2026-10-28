<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import {
  User,
  UserX,
  Radius,
  Play,
  Square,
  AlertTriangle,
  MapPin,
  Navigation,
  Bell
} from 'lucide-vue-next'
import 'leaflet/dist/leaflet.css'
import SectionHeader from '../components/SectionHeader.vue'

let L: typeof import('leaflet') | null = null

// --- Form Data ---
const vitimaNome = ref('')
const vitimaTelefone = ref('')
const vitimaEndereco = ref('')
const agressorNome = ref('')
const agressorTelefone = ref('')
const agressorEndereco = ref('')
const raioMetros = ref(500)
const raioKm = ref(0.5)

// --- State ---
const vitimaPosicao = ref<{ lat: number; lng: number } | null>(null)
const agressorPosicao = ref<{ lat: number; lng: number } | null>(null)
const monitorando = ref(false)
const alertaAtivo = ref(false)
const distanciaAtual = ref<number | null>(null)
const modoSelecao = ref<'vitima' | 'agressor' | null>(null)
const localizacaoPermitida = ref(false)
const localizacaoSolicitando = ref(false)
const localizacaoNegada = ref(false)

// --- Map refs ---
let map: import('leaflet').Map | null = null
let vitimaMarker: import('leaflet').Marker | null = null
let agressorMarker: import('leaflet').Marker | null = null
let raioCircle: import('leaflet').Circle | null = null
let monitorInterval: ReturnType<typeof setInterval> | null = null
let agressorSimInterval: ReturnType<typeof setInterval> | null = null

let vitimaIcon: import('leaflet').DivIcon | null = null
let agressorIcon: import('leaflet').DivIcon | null = null

// --- Helpers ---
function sanitizeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function calcularDistancia(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

function formatarDistancia(metros: number): string {
  if (metros < 1000) return `${Math.round(metros)}m`
  return `${(metros / 1000).toFixed(2)}km`
}

// --- Location Permission ---
function obterLocalizacaoPromise(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    })
  })
}

async function solicitarPermissaoLocalizacao() {
  if (!navigator.geolocation) {
    alert('Geolocalização não suportada pelo navegador.')
    return
  }

  localizacaoSolicitando.value = true
  localizacaoNegada.value = false

  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' })

    if (permission.state === 'granted') {
      localizacaoPermitida.value = true
      localizacaoSolicitando.value = false
      return
    }

    if (permission.state === 'denied') {
      localizacaoNegada.value = true
      localizacaoSolicitando.value = false
      return
    }

    // permission.state === 'prompt' — trigger browser dialog
    await obterLocalizacaoPromise()
    localizacaoPermitida.value = true
    localizacaoSolicitando.value = false
  } catch {
    // navigator.permissions not supported or getCurrentPosition failed
    try {
      await obterLocalizacaoPromise()
      localizacaoPermitida.value = true
    } catch {
      localizacaoPermitida.value = false
    }
    localizacaoSolicitando.value = false
  }
}

onMounted(async () => {
  solicitarPermissaoLocalizacao()

  // Listen for permission changes
  try {
    const permission = await navigator.permissions.query({ name: 'geolocation' })
    permission.addEventListener('change', () => {
      if (permission.state === 'granted') {
        localizacaoPermitida.value = true
        localizacaoNegada.value = false
      } else if (permission.state === 'denied') {
        localizacaoPermitida.value = false
        localizacaoNegada.value = true
      } else {
        localizacaoPermitida.value = false
        localizacaoNegada.value = false
      }
    })
  } catch {
    // navigator.permissions not supported
  }

  L = await import('leaflet')

  vitimaIcon = L.divIcon({
    className: 'custom-div-icon',
    html: '<div style="width:20px;height:20px;background:#3b82f6;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><svg width="12" height="12" viewBox="0 0 24 24" fill="white" stroke="white" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/></svg></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })

  agressorIcon = L.divIcon({
    className: 'custom-div-icon',
    html: '<div style="width:20px;height:20px;background:#ef4444;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><circle cx="12" cy="7" r="4"/><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/></svg></div>',
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  })

  map = L.map('cercamento-map', {
    center: [-20.4697, -54.6201],
    zoom: 14,
    zoomControl: true
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  setTimeout(() => { if (map) map.invalidateSize() }, 100)

  map.on('click', (e: import('leaflet').LeafletMouseEvent) => {
    if (!modoSelecao.value) return

    const { lat, lng } = e.latlng

    if (modoSelecao.value === 'vitima') {
      setVitimaPosicao(lat, lng)
    } else if (modoSelecao.value === 'agressor') {
      setAgressorPosicao(lat, lng)
    }

    modoSelecao.value = null
  })
})

onUnmounted(() => {
  pararMonitoramento()
  if (map) {
    map.remove()
    map = null
  }
})

// --- Position Setters ---
function setVitimaPosicao(lat: number, lng: number) {
  vitimaPosicao.value = { lat, lng }

  if (!map || !L || !vitimaIcon) return

  const safeName = sanitizeHtml(vitimaNome.value || 'Vítima')
  if (vitimaMarker) {
    vitimaMarker.setLatLng([lat, lng])
  } else {
    vitimaMarker = L.marker([lat, lng], { icon: vitimaIcon })
      .addTo(map)
      .bindPopup('<b>Vítima</b><br>Localização da vítima')
  }

  vitimaMarker.setPopupContent('<b>' + safeName + '</b><br>Localização da vítima')
  atualizarRaio()
  map.setView([lat, lng], map.getZoom())
}

function setAgressorPosicao(lat: number, lng: number) {
  agressorPosicao.value = { lat, lng }

  if (!map || !L || !agressorIcon) return

  const safeName = sanitizeHtml(agressorNome.value || 'Agressor')
  if (agressorMarker) {
    agressorMarker.setLatLng([lat, lng])
  } else {
    agressorMarker = L.marker([lat, lng], { icon: agressorIcon })
      .addTo(map)
      .bindPopup('<b>Agressor</b><br>Localização do agressor')
  }

  agressorMarker.setPopupContent('<b>' + safeName + '</b><br>Localização do agressor')
  verificarProximidade()
}

function atualizarRaio() {
  if (!map || !L || !vitimaPosicao.value) return

  if (raioCircle) {
    raioCircle.setLatLng([vitimaPosicao.value.lat, vitimaPosicao.value.lng])
    raioCircle.setRadius(raioMetros.value)
  } else {
    raioCircle = L.circle([vitimaPosicao.value.lat, vitimaPosicao.value.lng], {
      radius: raioMetros.value,
      color: '#ef4444',
      fillColor: '#ef4444',
      fillOpacity: 0.1,
      weight: 2,
      dashArray: '8 4'
    }).addTo(map)
  }
}

watch(raioMetros, () => {
  raioKm.value = raioMetros.value / 1000
  atualizarRaio()
  verificarProximidade()
})

watch(raioKm, () => {
  raioMetros.value = Math.round(raioKm.value * 1000)
})

watch(modoSelecao, () => {
  setTimeout(() => { if (map) map.invalidateSize() }, 50)
})

// --- Monitoring ---
function iniciarMonitoramento() {
  if (!vitimaPosicao.value || !agressorPosicao.value) return

  monitorando.value = true
  alertaAtivo.value = false

  monitorInterval = setInterval(() => {
    verificarProximidade()
  }, 2000)

  // Simulate aggressor movement toward victim
  let simLat = agressorPosicao.value.lat
  let simLng = agressorPosicao.value.lng
  const targetLat = vitimaPosicao.value.lat
  const targetLng = vitimaPosicao.value.lng
  const passoLat = (targetLat - simLat) / 50
  const passoLng = (targetLng - simLng) / 50

  agressorSimInterval = setInterval(() => {
    if (!monitorando.value) return

    simLat += passoLat + (Math.random() - 0.5) * 0.0003
    simLng += passoLng + (Math.random() - 0.5) * 0.0003

    agressorPosicao.value = { lat: simLat, lng: simLng }

    if (agressorMarker) {
      agressorMarker.setLatLng([simLat, simLng])
    }

    verificarProximidade()
  }, 3000)
}

function pararMonitoramento() {
  monitorando.value = false
  alertaAtivo.value = false
  distanciaAtual.value = null

  if (monitorInterval) {
    clearInterval(monitorInterval)
    monitorInterval = null
  }
  if (agressorSimInterval) {
    clearInterval(agressorSimInterval)
    agressorSimInterval = null
  }
}

function verificarProximidade() {
  if (!vitimaPosicao.value || !agressorPosicao.value) return

  const dist = calcularDistancia(
    vitimaPosicao.value.lat,
    vitimaPosicao.value.lng,
    agressorPosicao.value.lat,
    agressorPosicao.value.lng
  )

  distanciaAtual.value = dist

  if (dist <= raioMetros.value) {
    alertaAtivo.value = true
  } else {
    alertaAtivo.value = false
  }
}

async function usarLocalizacaoAtual(tipo: 'vitima' | 'agressor') {
  if (!navigator.geolocation) {
    alert('Geolocalização não suportada pelo navegador.')
    return
  }

  try {
    const pos = await obterLocalizacaoPromise()
    const { latitude, longitude } = pos.coords
    if (tipo === 'vitima') {
      setVitimaPosicao(latitude, longitude)
    } else {
      setAgressorPosicao(latitude, longitude)
    }
  } catch {
    alert('Não foi possível obter a localização. Verifique se a permissão foi concedida.')
  }
}

function resetar() {
  pararMonitoramento()

  if (vitimaMarker && map) { map.removeLayer(vitimaMarker); vitimaMarker = null }
  if (agressorMarker && map) { map.removeLayer(agressorMarker); agressorMarker = null }
  if (raioCircle && map) { map.removeLayer(raioCircle); raioCircle = null }

  vitimaPosicao.value = null
  agressorPosicao.value = null
  vitimaNome.value = ''
  vitimaTelefone.value = ''
  vitimaEndereco.value = ''
  agressorNome.value = ''
  agressorTelefone.value = ''
  agressorEndereco.value = ''
  raioMetros.value = 500
  raioKm.value = 0.5
  modoSelecao.value = null
  distanciaAtual.value = null
  alertaAtivo.value = false
  localizacaoNegada.value = false
}
</script>

<template>
  <div class="bg-background">
    <main class="px-3 sm:px-4 md:px-6 lg:px-8 py-8">
      <SectionHeader>
        <template #title>Cercamento eletrônico</template>
        <template #desc>Monitore a proximidade do agressor em relação à vítima</template>
      </SectionHeader>

      <!-- Permissão de Localização - Negada -->
      <div v-if="localizacaoNegada" class="mb-6 animate-fade-in-up">
        <div class="bg-red-500/10 border-2 border-red-500 rounded-2xl p-4 flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center text-white flex-shrink-0">
            <Navigation class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <p class="font-semibold text-red-700">Localização Bloqueada</p>
            <p class="text-sm text-red-600/80">
              O acesso à localização foi negado. Para ativar, clique no ícone de cadeado/bloqueio na barra de endereços do navegador e altere a permissão de localização para "Permitir".
            </p>
          </div>
          <button
            @click="solicitarPermissaoLocalizacao"
            :disabled="localizacaoSolicitando"
            class="px-4 py-2 rounded-lg bg-red-500 text-white font-medium text-sm hover:bg-red-600 transition-colors flex-shrink-0"
          >
            {{ localizacaoSolicitando ? 'Solicitando...' : 'Tentar Novamente' }}
          </button>
        </div>
      </div>

      <!-- Permissão de Localização - Solicitando -->
      <div v-else-if="!localizacaoPermitida" class="mb-6 animate-fade-in-up">
        <div class="bg-yellow-500/10 border-2 border-yellow-500 rounded-2xl p-4 flex items-center gap-4">
          <div class="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white flex-shrink-0">
            <Navigation class="w-5 h-5" />
          </div>
          <div class="flex-1">
            <p class="font-semibold text-yellow-700">Permissão de Localização Necessária</p>
            <p class="text-sm text-yellow-600/80">
              Para usar o cercamento eletrônico, você precisa permitir o acesso à sua localização. Clique no botão e aceite no navegador.
            </p>
          </div>
          <button
            @click="solicitarPermissaoLocalizacao"
            :disabled="localizacaoSolicitando"
            class="px-4 py-2 rounded-lg bg-yellow-500 text-white font-medium text-sm hover:bg-yellow-600 transition-colors flex-shrink-0"
          >
            {{ localizacaoSolicitando ? 'Solicitando...' : 'Permitir' }}
          </button>
        </div>
      </div>

      <!-- Localização Ativada -->
      <div v-else class="mb-6 animate-fade-in-up">
          <div class="bg-green-500/10 border-2 border-green-500 rounded-2xl p-4 flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
              <MapPin class="w-4 h-4" />
            </div>
          <p class="text-sm font-medium text-green-700">Localização ativada ✓</p>
        </div>
      </div>

      <!-- Alerta de Proximidade -->
      <div
        v-if="alertaAtivo && monitorando"
        class="mb-6 animate-fade-in-up"
      >
        <div class="bg-red-500/10 border-2 border-red-500 rounded-2xl p-4 sm:p-6">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center text-white animate-pulse">
              <AlertTriangle class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-lg font-bold text-red-600">⚠ ALERTA DE PROXIMIDADE</h3>
              <p class="text-sm text-red-600/80">
                O agressor <strong>{{ agressorNome || 'Agressor' }}</strong> está a apenas
                <strong>{{ distanciaAtual !== null ? formatarDistancia(distanciaAtual) : '...' }}</strong> de distância!
              </p>
              <p class="text-sm text-red-600 font-semibold mt-1">
                🛡️ Procure um local seguro imediatamente e acione as autoridades!
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Status de Monitoramento -->
      <div
        v-if="monitorando && !alertaAtivo"
        class="mb-6 animate-fade-in-up"
      >
          <div class="bg-green-500/10 border-2 border-green-500 rounded-2xl p-4 flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white">
              <Bell class="w-5 h-5" />
            </div>
          <div>
            <p class="font-semibold text-green-700">Monitoramento Ativo</p>
            <p class="text-sm text-green-600">
              Distância atual: {{ distanciaAtual !== null ? formatarDistancia(distanciaAtual) : 'calculando...' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Molde Mapa: painel de monitoramento ao lado + mapa -->
      <div class="flex flex-col lg:flex-row items-start gap-4 animate-fade-in-up">
        <!-- Painel: monitoramento -->
        <aside class="w-full lg:w-80 shrink-0 rounded-2xl border border-border glass-card/95 shadow-lg p-4 lg:h-[calc(100vh-16rem)] lg:overflow-y-auto">
          <div class="flex items-center gap-3 mb-2">
            <span class="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <MapPin class="w-5 h-5" />
            </span>
            <span class="font-heading font-semibold">Mapa de Monitoramento</span>
          </div>
          <div
            v-if="modoSelecao"
            class="mb-3 flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium animate-pulse"
            :class="modoSelecao === 'vitima'
              ? 'bg-blue-500/10 text-blue-600'
              : 'bg-red-500/10 text-red-600'"
          >
            <MapPin class="w-3 h-3" />
            Clique no mapa para definir a {{ modoSelecao === 'vitima' ? 'vítima' : 'agressor' }}
          </div>

          <!-- Dados da Vítima -->
          <div class="rounded-2xl border border-border glass-card shadow-sm p-4 mb-3">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                <User class="w-4 h-4" />
              </div>
              <h3 class="font-heading font-semibold text-base">Vítima</h3>
            </div>
            <div class="space-y-3">
              <div>
                <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Nome da Vítima</label>
                <input
                  v-model="vitimaNome"
                  type="text"
                  placeholder="Ex: Maria Santos"
                  class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Telefone da Vítima</label>
                <input
                  v-model="vitimaTelefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Endereço de Referência</label>
                <input
                  v-model="vitimaEndereco"
                  type="text"
                  placeholder="Ex: Rua ABC, 123 - Centro"
                  class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div class="flex gap-2">
                <button
                  @click="usarLocalizacaoAtual('vitima')"
                  class="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-colors text-sm font-medium"
                >
                  <Navigation class="w-4 h-4" />
                  Minha Localização
                </button>
                <button
                  @click="modoSelecao = modoSelecao === 'vitima' ? null : 'vitima'"
                  class="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-colors"
                  :class="[
                    modoSelecao === 'vitima'
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20'
                  ]"
                >
                  <MapPin class="w-4 h-4" />
                  {{ modoSelecao === 'vitima' ? 'Clique no mapa...' : 'Selecionar no Mapa' }}
                </button>
              </div>
              <div v-if="vitimaPosicao" class="text-xs text-muted-foreground bg-secondary/30 rounded-lg p-2">
                <MapPin class="w-3 h-3 inline mr-1" />
                {{ vitimaPosicao.lat.toFixed(6) }}, {{ vitimaPosicao.lng.toFixed(6) }}
              </div>
            </div>
          </div>

          <!-- Dados do Agressor -->
          <div class="rounded-2xl border border-border glass-card shadow-sm p-4 mb-3">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
                <UserX class="w-4 h-4" />
              </div>
              <h3 class="font-heading font-semibold text-base">Agressor</h3>
            </div>
            <div class="space-y-3">
              <div>
                <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Nome do Agressor</label>
                <input
                  v-model="agressorNome"
                  type="text"
                  placeholder="Ex: João da Penha"
                  class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Telefone do Agressor</label>
                <input
                  v-model="agressorTelefone"
                  type="tel"
                  placeholder="(00) 00000-0000"
                  class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1 block">Endereço do Agressor</label>
                <input
                  v-model="agressorEndereco"
                  type="text"
                  placeholder="Ex: Rua XYZ, 456 - Bairro"
                  class="w-full h-11 rounded-xl border border-border/50 bg-input/50 px-4 py-3 text-sm focus:border-primary/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div class="flex gap-2">
                <button
                  @click="usarLocalizacaoAtual('agressor')"
                  class="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-red-500/10 text-red-600 hover:bg-red-500/20 transition-colors text-sm font-medium"
                >
                  <Navigation class="w-4 h-4" />
                  Localização GPS
                </button>
                <button
                  @click="modoSelecao = modoSelecao === 'agressor' ? null : 'agressor'"
                  class="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-medium transition-colors"
                  :class="[
                    modoSelecao === 'agressor'
                      ? 'bg-red-500 text-white'
                      : 'bg-red-500/10 text-red-600 hover:bg-red-500/20'
                  ]"
                >
                  <MapPin class="w-4 h-4" />
                  {{ modoSelecao === 'agressor' ? 'Clique no mapa...' : 'Selecionar no Mapa' }}
                </button>
              </div>
              <div v-if="agressorPosicao" class="text-xs text-muted-foreground bg-secondary/30 rounded-lg p-2">
                <MapPin class="w-3 h-3 inline mr-1" />
                {{ agressorPosicao.lat.toFixed(6) }}, {{ agressorPosicao.lng.toFixed(6) }}
              </div>
            </div>
          </div>

          <!-- Raio de Proteção -->
          <div class="rounded-2xl border border-border glass-card shadow-sm p-4 mb-3">
            <div class="flex items-center gap-2 mb-3">
              <div class="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
                <Radius class="w-4 h-4" />
              </div>
              <h3 class="font-heading font-semibold">Raio de Proteção</h3>
            </div>
            <div class="space-y-4">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <label class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Distância do raio</label>
                  <span class="text-sm font-bold text-primary">{{ raioMetros }}m ({{ raioKm.toFixed(1) }}km)</span>
                </div>
                <input
                  v-model.number="raioMetros"
                  type="range"
                  min="100"
                  max="5000"
                  step="100"
                  class="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                />
                <div class="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>100m</span>
                  <span>2.5km</span>
                  <span>5km</span>
                </div>
              </div>
              <div class="grid grid-cols-4 gap-2">
                <button
                  v-for="preset in [200, 500, 1000, 2000]"
                  :key="preset"
                  @click="raioMetros = preset"
                  class="h-9 rounded-xl text-xs font-medium transition-colors"
                  :class="raioMetros === preset
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary/50 hover:bg-secondary text-foreground'"
                >
                  {{ preset >= 1000 ? `${preset / 1000}km` : `${preset}m` }}
                </button>
              </div>
            </div>
          </div>

          <!-- Controles -->
          <div class="rounded-2xl border border-border glass-card shadow-sm p-4 mb-3">
            <div class="space-y-3">
              <button
                v-if="!monitorando"
                @click="iniciarMonitoramento"
                :disabled="!vitimaPosicao || !agressorPosicao"
                class="w-full flex items-center justify-center gap-2 h-12 rounded-xl font-semibold text-white transition-all"
                :class="vitimaPosicao && agressorPosicao
                  ? 'bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/25 active:scale-[0.99]'
                  : 'bg-secondary text-muted-foreground cursor-not-allowed'"
              >
                <Play class="w-5 h-5" />
                Iniciar Monitoramento
              </button>
              <button
                v-if="monitorando"
                @click="pararMonitoramento"
                class="w-full flex items-center justify-center gap-2 h-12 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow-lg shadow-red-500/25 active:scale-[0.99] transition-all"
              >
                <Square class="w-5 h-5" />
                Parar Monitoramento
              </button>
              <button
                @click="resetar"
                class="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-border hover:bg-secondary/50 text-sm font-medium transition-colors"
              >
                Limpar Tudo
              </button>
              <p
                v-if="!vitimaPosicao || !agressorPosicao"
                class="text-xs text-muted-foreground text-center"
              >
                {{ !vitimaPosicao ? 'Selecione a localização da vítima' : '' }}
                {{ !vitimaPosicao && !agressorPosicao ? ' e ' : '' }}
                {{ !agressorPosicao ? 'a localização do agressor' : '' }}
                {{ !vitimaPosicao || !agressorPosicao ? ' para iniciar.' : '' }}
              </p>
            </div>
          </div>

          <!-- Distância em tempo real -->
          <div
            v-if="distanciaAtual !== null"
            class="p-4 rounded-2xl mb-3"
            :class="alertaAtivo ? 'bg-red-500/10 border border-red-500' : 'bg-green-500/10 border border-green-500'"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <Navigation class="w-4 h-4" :class="alertaAtivo ? 'text-red-500' : 'text-green-500'" />
                <span class="text-sm font-medium" :class="alertaAtivo ? 'text-red-700' : 'text-green-700'">
                  Distância entre vítima e agressor:
                </span>
              </div>
              <span
                class="text-lg font-bold"
                :class="alertaAtivo ? 'text-red-600' : 'text-green-600'"
              >
                {{ formatarDistancia(distanciaAtual) }}
              </span>
            </div>
            <div class="mt-2 w-full bg-secondary/30 rounded-full h-2">
              <div
                class="h-2 rounded-full transition-all duration-500"
                :class="alertaAtivo ? 'bg-red-500' : 'bg-green-500'"
                :style="{ width: Math.min(100, (distanciaAtual / raioMetros) * 100) + '%' }"
              ></div>
            </div>
            <p class="text-xs mt-1" :class="alertaAtivo ? 'text-red-600' : 'text-muted-foreground'">
              Raio configurado: {{ raioMetros }}m |
              {{ alertaAtivo ? 'DENTRO DO RAIO DE RISCO!' : 'Fora do raio de risco' }}
            </p>
          </div>

          <!-- Legenda -->
          <div class="rounded-2xl border border-border glass-card shadow-sm p-4">
            <h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Legenda</h4>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded-full bg-blue-500 border-2 border-border"></div>
                <span class="text-sm text-muted-foreground">Vítima</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded-full bg-red-500 border-2 border-border"></div>
                <span class="text-sm text-muted-foreground">Agressor</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-4 h-4 rounded-full border-2 border-red-500 bg-red-500/20"></div>
                <span class="text-sm text-muted-foreground">Raio de Proteção</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- Coluna do mapa: stats acima + mapa -->
        <div class="w-full flex-1 flex flex-col gap-3 min-w-0">
          <!-- Stats acima do mapa -->
          <div class="hidden sm:flex gap-2 justify-end">
            <div class="rounded-xl border border-border glass-card/95 backdrop-blur px-4 py-2 shadow-lg">
              <p class="text-xs text-muted-foreground">Distância</p>
              <p class="text-lg font-bold" :class="alertaAtivo ? 'text-red-600' : 'text-green-600'">
                {{ distanciaAtual !== null ? formatarDistancia(distanciaAtual) : '—' }}
              </p>
            </div>
            <div class="rounded-xl border border-border glass-card/95 backdrop-blur px-4 py-2 shadow-lg">
              <p class="text-xs text-muted-foreground">Raio</p>
              <p class="text-lg font-bold">{{ raioMetros }}m</p>
            </div>
            <div
              v-if="monitorando"
              class="rounded-xl border px-4 py-2 shadow-lg backdrop-blur"
              :class="alertaAtivo ? 'border-red-500 bg-red-500/10' : 'border-green-500 bg-green-500/10'"
            >
              <p class="text-xs" :class="alertaAtivo ? 'text-red-600' : 'text-green-600'">
                {{ alertaAtivo ? 'EM RISCO' : 'MONITORANDO' }}
              </p>
              <p class="text-lg font-bold" :class="alertaAtivo ? 'text-red-600' : 'text-green-600'">●</p>
            </div>
          </div>

          <!-- Mapa -->
          <div class="relative w-full h-[380px] sm:h-[450px] lg:h-[calc(100vh-19rem)] rounded-2xl overflow-hidden border border-border">
            <div class="absolute inset-0">
              <div
                id="cercamento-map"
                class="h-full w-full z-0"
                :class="modoSelecao ? 'cursor-crosshair' : ''"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
