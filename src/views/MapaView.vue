<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import {
  MapPin,
  Users,
  AlertTriangle,
  Filter,
  RefreshCw
} from 'lucide-vue-next'
import 'leaflet/dist/leaflet.css'
import { fetchMedidasProtetivas, type MedidaProtetivaAll } from '../services/medidaService'
import DataTable from '../components/DataTable.vue'
import SectionHeader from '../components/SectionHeader.vue'
import StatCard from '../components/StatCard.vue'

let L: typeof import('leaflet') | null = null

interface LocationData {
  id: string
  nome: string
  tipo: 'vitima' | 'agressor'
  latitude: number
  longitude: number
  cidade: string
  uf: string
  endereco?: string
  bairro?: string
}

interface IBGEEstado {
  id: number
  sigla: string
  nome: string
}

interface IBGEMunicipio {
  id: number
  nome: string
}

const isMapLoaded = ref(false)
const medidas = ref<MedidaProtetivaAll[]>([])
const isLoading = ref(true)

const cidadeCoordenadas: Record<string, { lat: number; lng: number }> = {
  'Campo Grande': { lat: -20.4697, lng: -54.6201 },
  'Dourados': { lat: -22.2681, lng: -54.8084 },
  'Três Lagoas': { lat: -20.7849, lng: -51.6785 },
  'Corumbá': { lat: -19.0159, lng: -57.6532 },
  'Ponta Porã': { lat: -22.5350, lng: -55.7256 },
  'Aquidauana': { lat: -20.4687, lng: -55.6833 },
  'Naviraí': { lat: -23.0618, lng: -54.1984 },
  'Niquelândia': { lat: -14.4733, lng: -48.4594 },
}

const dbLocations = computed<LocationData[]>(() => {
  const locs: LocationData[] = []

  for (const m of medidas.value) {
    const cidade = m.cidade || 'Campo Grande'
    const baseCoord = cidadeCoordenadas[cidade] || cidadeCoordenadas['Campo Grande']

    if (m.nome_ofendida) {
      locs.push({
        id: m.id + '-v',
        nome: m.nome_ofendida,
        tipo: 'vitima',
        latitude: m.latitude_vitima ?? baseCoord.lat,
        longitude: m.longitude_vitima ?? baseCoord.lng,
        cidade,
        uf: 'MS',
        endereco: m.endereco_vitima,
        bairro: m.bairro_vitima
      })
    }

    if (m.nome_ofensor) {
      locs.push({
        id: m.id + '-a',
        nome: m.nome_ofensor,
        tipo: 'agressor',
        latitude: m.latitude_agressor ?? baseCoord.lat,
        longitude: m.longitude_agressor ?? baseCoord.lng,
        cidade,
        uf: 'MS',
        endereco: m.endereco_agressor,
        bairro: m.bairro_agressor
      })
    }
  }

  return locs
})

const selectedUF = ref('MS')
const selectedCidade = ref('Todas')
const selectedBairro = ref('Todos')
const showVitimas = ref(true)
const showAgressores = ref(true)

const estados = ref<IBGEEstado[]>([])
const cidades = ref<IBGEMunicipio[]>([])

const loadingEstados = ref(false)
const loadingCidades = ref(false)

const bairrosDisponiveis = computed(() => {
  const set = new Set<string>()
  for (const loc of dbLocations.value) {
    if (selectedCidade.value !== 'Todas' && loc.cidade !== selectedCidade.value) continue
    if (loc.bairro) set.add(loc.bairro)
  }
  return Array.from(set).sort()
})

const fetchEstados = async () => {
  loadingEstados.value = true
  try {
    const response = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
    const data: IBGEEstado[] = await response.json()
    estados.value = data
  } catch (error) {
    console.error('Erro ao buscar estados:', error)
    estados.value = [
      { id: 50, sigla: 'MS', nome: 'Mato Grosso do Sul' },
    ]
  } finally {
    loadingEstados.value = false
  }
}

const fetchCidades = async (uf: string) => {
  if (!uf) {
    cidades.value = []
    return
  }
  loadingCidades.value = true
  try {
    const response = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
    const data: IBGEMunicipio[] = await response.json()
    cidades.value = data
  } catch (error) {
    console.error('Erro ao buscar municípios:', error)
    cidades.value = []
  } finally {
    loadingCidades.value = false
  }
}

const filteredLocations = computed(() => {
  return dbLocations.value.filter(loc => {
    const matchesCidade = selectedCidade.value === 'Todas' || loc.cidade === selectedCidade.value
    const matchesBairro = selectedBairro.value === 'Todos' || loc.bairro === selectedBairro.value
    const matchesTipo = (loc.tipo === 'vitima' && showVitimas.value) || (loc.tipo === 'agressor' && showAgressores.value)
    return matchesCidade && matchesBairro && matchesTipo
  })
})

const stats = computed(() => {
  const vitimas = filteredLocations.value.filter(loc => loc.tipo === 'vitima').length
  const agressores = filteredLocations.value.filter(loc => loc.tipo === 'agressor').length
  return { vitimas, agressores, total: filteredLocations.value.length }
})

const bairroStats = computed(() => {
  const map: Record<string, { vitimas: number; agressores: number }> = {}

  for (const loc of filteredLocations.value) {
    const bairro = loc.bairro || loc.cidade || 'Desconhecido'
    if (!map[bairro]) map[bairro] = { vitimas: 0, agressores: 0 }
    if (loc.tipo === 'vitima') map[bairro].vitimas++
    else map[bairro].agressores++
  }

  return Object.entries(map)
    .map(([bairro, counts]) => ({ bairro, ...counts, total: counts.vitimas + counts.agressores }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 10)
})

const handleReset = async () => {
  selectedUF.value = 'MS'
  await fetchCidades('MS')
  selectedCidade.value = 'Todas'
  selectedBairro.value = 'Todos'
  showVitimas.value = true
  showAgressores.value = true
}

let map: import('leaflet').Map | null = null

onMounted(async () => {
  try {
    const data = await fetchMedidasProtetivas()
    medidas.value = data
  } finally {
    isLoading.value = false
  }

  await fetchEstados()
  await fetchCidades(selectedUF.value)

  L = await import('leaflet')

  map = L.map('map').setView([-20.4697, -54.6201], 6)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map)

  isMapLoaded.value = true
  updateMapMarkers()
})

onUnmounted(() => {
  if (map) {
    map.remove()
    map = null
  }
})

watch(selectedUF, async (novaUF) => {
  selectedCidade.value = 'Todas'
  selectedBairro.value = 'Todos'
  await fetchCidades(novaUF)
})

watch(selectedCidade, async (novaCidade) => {
  selectedBairro.value = 'Todos'
  if (novaCidade === 'Todas') {
    if (map) map.setView([-20.4697, -54.6201], 6)
    return
  }
  const coord = cidadeCoordenadas[novaCidade]
  if (coord && map) {
    map.setView([coord.lat, coord.lng], 13)
  }
})

const updateMapMarkers = () => {
  if (!map || !L || !isMapLoaded.value) return

  map.eachLayer((layer: any) => {
    if (layer instanceof L!.Marker) {
      map?.removeLayer(layer)
    }
  })

  filteredLocations.value.forEach((loc) => {
    const icon = loc.tipo === 'vitima'
      ? L!.divIcon({
          className: 'custom-div-icon',
          html: '<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })
      : L!.divIcon({
          className: 'custom-div-icon',
          html: '<div class="w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg"></div>',
          iconSize: [16, 16],
          iconAnchor: [8, 8]
        })

    const popup = L!.popup()
      .setContent(`<b>${loc.nome.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</b><br>${loc.tipo === 'vitima' ? 'Vítima' : 'Agressor'}<br>${loc.endereco ? loc.endereco.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '<br>' : ''}${loc.bairro ? loc.bairro.replace(/</g, '&lt;').replace(/>/g, '&gt;') + ' - ' : ''}${loc.cidade.replace(/</g, '&lt;').replace(/>/g, '&gt;')}-${loc.uf.replace(/</g, '&lt;').replace(/>/g, '&gt;')}`)

    L!.marker([loc.latitude, loc.longitude], { icon })
      .addTo(map!)
      .bindPopup(popup)
  })
}

watch(filteredLocations, () => {
  updateMapMarkers()
}, { deep: true })
</script>

<template>
  <div class="bg-background">
    <main class="px-3 sm:px-4 md:px-6 lg:px-8 py-8">
      <SectionHeader>
        <template #title>Mapa de georreferenciamento</template>
        <template #desc>Visualização espacial de vítimas e agressores</template>
        <template #actions>
          <button
            @click="handleReset"
            class="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary/50 transition-colors"
          >
            <RefreshCw class="w-4 h-4" />
            Limpar filtros
          </button>
        </template>
      </SectionHeader>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-12 text-muted-foreground">
        Carregando dados...
      </div>

      <template v-else>
        <!-- Molde Mapa: full-bleed + painel flutuante + stats sobrepostos -->
        <div class="relative h-[calc(100vh-8rem)] rounded-lg overflow-hidden border border-border">
          <div class="absolute inset-0">
            <div id="map" class="h-full w-full z-0"></div>
          </div>

          <!-- Painel flutuante: filtros + lista -->
          <div class="absolute left-4 top-4 bottom-4 z-10 w-80 max-w-[calc(100%-2rem)] rounded-lg border border-border bg-card/95 backdrop-blur p-4 overflow-y-auto">
            <h2 class="font-semibold text-lg flex items-center gap-2 mb-2">
              <Filter class="w-5 h-5 text-primary" />
              Filtros de localização
            </h2>
            <p class="text-sm text-muted-foreground mb-4">
              Selecione UF e cidade para filtrar os dados no mapa
            </p>

            <div class="grid grid-cols-1 gap-4">
              <div>
                <label class="text-sm font-medium mb-2 block">Estado (UF)</label>
                <select
                  v-model="selectedUF"
                  :disabled="loadingEstados"
                  class="w-full h-11 rounded-lg border border-border bg-input px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 disabled:opacity-50"
                >
                  <option v-if="loadingEstados" value="">Carregando...</option>
                  <option v-for="estado in estados" :key="estado.sigla" :value="estado.sigla">
                    {{ estado.nome }} ({{ estado.sigla }})
                  </option>
                </select>
              </div>

              <div>
                <label class="text-sm font-medium mb-2 block">Cidade</label>
                <select
                  v-model="selectedCidade"
                  :disabled="loadingCidades || cidades.length === 0"
                  class="w-full h-11 rounded-lg border border-border bg-input px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 disabled:opacity-50"
                >
                  <option v-if="loadingCidades" value="">Carregando...</option>
                  <option v-else-if="cidades.length === 0" value="">Nenhum município</option>
                  <option value="Todas">Todas</option>
                  <option v-for="cidade in cidades" :key="cidade.id" :value="cidade.nome">
                    {{ cidade.nome }}
                  </option>
                </select>
              </div>

              <div>
                <label class="text-sm font-medium mb-2 block">Bairro</label>
                <select
                  v-model="selectedBairro"
                  class="w-full h-11 rounded-lg border border-border bg-input px-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                >
                  <option value="Todos">Todos</option>
                  <option v-for="bairro in bairrosDisponiveis" :key="bairro" :value="bairro">
                    {{ bairro }}
                  </option>
                </select>
              </div>
            </div>

            <!-- Filtros de Tipo -->
            <div class="mt-4 flex flex-wrap gap-3">
              <label
                class="flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors select-none"
                :class="showVitimas ? 'border-info/40 bg-info/10 text-info' : 'border-border text-muted-foreground'"
              >
                <input type="checkbox" v-model="showVitimas" class="sr-only" />
                <Users class="w-4 h-4" />
                <span class="text-sm font-medium">Vítimas ({{ stats.vitimas }})</span>
              </label>

              <label
                class="flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer transition-colors select-none"
                :class="showAgressores ? 'border-destructive/40 bg-destructive/10 text-destructive' : 'border-border text-muted-foreground'"
              >
                <input type="checkbox" v-model="showAgressores" class="sr-only" />
                <AlertTriangle class="w-4 h-4" />
                <span class="text-sm font-medium">Agressores ({{ stats.agressores }})</span>
              </label>
            </div>

            <div class="mt-4 flex flex-wrap gap-2 text-sm">
              <span class="flex items-center gap-1 px-3 py-1 rounded-lg border border-border text-muted-foreground">
                <MapPin class="w-3 h-3" />
                {{ selectedUF }}
              </span>
              <span class="flex items-center gap-1 px-3 py-1 rounded-lg border border-border text-muted-foreground">
                <MapPin class="w-3 h-3" />
                {{ selectedCidade }}
              </span>
              <span v-if="selectedBairro !== 'Todos'" class="flex items-center gap-1 px-3 py-1 rounded-lg border border-border text-muted-foreground">
                <MapPin class="w-3 h-3" />
                {{ selectedBairro }}
              </span>
            </div>
          </div>

          <!-- StatCards sobrepostos -->
          <div class="absolute top-4 right-4 z-10 hidden sm:flex gap-2">
            <StatCard label="Total de pontos" :value="String(stats.total)" accent-top class="w-32 shadow-lg" />
            <StatCard label="Vítimas" :value="String(stats.vitimas)" accent-top class="w-28 shadow-lg" />
            <StatCard label="Agressores" :value="String(stats.agressores)" accent-top class="w-28 shadow-lg" />
          </div>
        </div>

        <!-- Estatísticas por Bairro -->
        <div v-if="bairroStats.length > 0" class="mt-6 rounded-lg border border-border bg-card p-6">
          <h3 class="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin class="w-5 h-5 text-primary" />
            Top bairros
          </h3>
          <DataTable>
            <template #head>
              <th class="text-left font-medium">Bairro</th>
              <th class="text-center font-medium">Vítimas</th>
              <th class="text-center font-medium">Agressores</th>
              <th class="text-center font-medium">Total</th>
            </template>
            <tr v-for="b in bairroStats" :key="b.bairro">
              <td class="font-medium">{{ b.bairro }}</td>
              <td class="text-center text-info">{{ b.vitimas }}</td>
              <td class="text-center text-destructive">{{ b.agressores }}</td>
              <td class="text-center font-semibold">{{ b.total }}</td>
            </tr>
          </DataTable>
        </div>
      </template>
    </main>
  </div>
</template>
