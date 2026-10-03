<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Trash2,
  Camera,
  MapPin,
  Play,
  Pause,
  X,
  AlertTriangle
} from 'lucide-vue-next'
import { fetchPanicRecords, deletePanicRecord, type PanicRecord } from '../services/panicService'
import SectionHeader from '../components/SectionHeader.vue'
import DataTable from '../components/DataTable.vue'
import EmptyState from '../components/EmptyState.vue'

const router = useRouter()
const records = ref<PanicRecord[]>([])
const selectedImage = ref<string | null>(null)
const playingAudioId = ref<string | null>(null)
const busca = ref('')
const filtros = ['Todos', 'Com áudio', 'Com foto']
const filtroAtivo = ref('Todos')

const recordsFiltrados = computed(() => {
  const termo = busca.value.trim().toLowerCase()
  return records.value.filter(r => {
    const matchesBusca = !termo ||
      formatDate(r.timestamp).toLowerCase().includes(termo) ||
      formatCoordinates(r.latitude, r.longitude).toLowerCase().includes(termo)
    const matchesFiltro = filtroAtivo.value === 'Todos' ||
      (filtroAtivo.value === 'Com áudio' && !!r.audioUrl) ||
      (filtroAtivo.value === 'Com foto' && !!r.imageUrl)
    return matchesBusca && matchesFiltro
  })
})

const statusMidia = (record: PanicRecord) => {
  if (record.audioUrl && record.imageUrl) return 'áudio + foto'
  if (record.audioUrl) return 'com áudio'
  if (record.imageUrl) return 'com foto'
  return 'pendente'
}

const classePorStatus = (status: string) => {
  switch (status.toLowerCase()) {
    case 'ativa': return 'bg-primary/15 text-primary'
    case 'pendente': return 'bg-accent/15'
    case 'áudio + foto':
    case 'com áudio': return 'bg-primary/15 text-primary'
    case 'com foto': return 'bg-info/10 text-info border border-info/20'
    default: return 'bg-secondary text-muted-foreground border border-border'
  }
}

const estiloSeloPendente = (status: string) =>
  status.toLowerCase() === 'pendente' ? { color: 'hsl(var(--accent-foreground))' } : undefined

const novoRegistro = () => {
  router.push('/dashboard')
}
const audioElements = ref<Map<string, HTMLAudioElement>>(new Map())
const audioProgress = ref<Map<string, number>>(new Map())
const audioDurations = ref<Map<string, number>>(new Map())

async function loadRecords() {
  records.value = await fetchPanicRecords()
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function formatCoordinates(lat: number, lng: number): string {
  return `${lat.toFixed(6)}, ${lng.toFixed(6)}`
}

async function removeRecord(id: string) {
  const audio = audioElements.value.get(id)
  if (audio) {
    audio.pause()
    audioElements.value.delete(id)
  }
  await deletePanicRecord(id)
  await loadRecords()
}

function openImage(url: string) {
  selectedImage.value = url
}

function closeImage() {
  selectedImage.value = null
}

function updateProgress(id: string, currentTime: number, duration: number) {
  audioProgress.value.set(id, duration > 0 ? (currentTime / duration) * 100 : 0)
  audioDurations.value.set(id, duration)
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function playAudio(record: PanicRecord) {
  if (!record.audioUrl) return

  if (playingAudioId.value === record.id) {
    const audio = audioElements.value.get(record.id)
    if (audio) {
      audio.pause()
      audioElements.value.delete(record.id)
    }
    playingAudioId.value = null
  } else {
    if (playingAudioId.value) {
      const currentAudio = audioElements.value.get(playingAudioId.value)
      if (currentAudio) {
        currentAudio.pause()
        audioElements.value.delete(playingAudioId.value)
      }
    }

    const audio = new Audio(record.audioUrl)
    audioElements.value.set(record.id, audio)
    playingAudioId.value = record.id

    audio.addEventListener('timeupdate', () => {
      updateProgress(record.id, audio.currentTime, audio.duration)
    })

    audio.addEventListener('loadedmetadata', () => {
      audioDurations.value.set(record.id, audio.duration)
    })

    audio.addEventListener('ended', () => {
      playingAudioId.value = null
      audioElements.value.delete(record.id)
      audioProgress.value.set(record.id, 0)
    })

    audio.play().catch(console.error)
  }
}

function openLocation(lat: number, lng: number) {
  window.open(`https://maps.google.com/?q=${lat},${lng}`, '_blank')
}

function goToDashboard() {
  router.push('/dashboard')
}

onMounted(() => {
  loadRecords()
})

onUnmounted(() => {
  audioElements.value.forEach(audio => audio.pause())
  audioElements.value.clear()
})
</script>

<template>
  <div class="bg-background">
    <div class="p-4 sm:p-6 pb-12 max-w-3xl mx-auto">
      <SectionHeader>
        <template #title>Histórico de acionamentos</template>
        <template #desc>Registros de emergência da vítima</template>
      </SectionHeader>

      <div class="flex flex-wrap items-center gap-2 mb-4">
        <input v-model="busca" placeholder="Buscar..." class="input-enhanced !w-64" />
        <button v-for="f in filtros" :key="f" @click="filtroAtivo = f" :class="['rounded-lg px-3 py-1.5 text-xs border transition-colors', filtroAtivo === f ? 'bg-primary/10 text-primary border-primary/30 font-semibold' : 'border-border text-muted-foreground hover:bg-secondary/50']">{{ f }}</button>
        <button @click="novoRegistro" class="rounded-lg px-3 py-1.5 text-xs font-semibold transition-all hover:opacity-90" :style="{ background: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }">+ Novo</button>
      </div>

      <DataTable v-if="recordsFiltrados.length > 0">
        <template #head>
          <th class="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Data / hora</th>
          <th class="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Localização</th>
          <th class="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3">Status</th>
          <th class="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3 hidden sm:table-cell">Mídia</th>
          <th class="text-xs font-semibold uppercase tracking-wider text-muted-foreground py-3 text-right">Ações</th>
        </template>
        <tr v-for="record in recordsFiltrados" :key="record.id">
          <td class="font-medium text-foreground">{{ formatDate(record.timestamp) }}</td>
          <td>
            <button
              @click="openLocation(record.latitude, record.longitude)"
              class="text-sm text-primary hover:underline flex items-center gap-1"
            >
              <MapPin class="w-3 h-3 flex-shrink-0" />
              <span class="font-mono text-xs">{{ formatCoordinates(record.latitude, record.longitude) }}</span>
            </button>
            <div class="flex gap-2 mt-1 sm:hidden">
              <button
                v-if="record.audioUrl"
                @click="playAudio(record)"
                class="text-xs text-primary hover:underline"
              >
                {{ playingAudioId === record.id ? 'Parar áudio' : 'Ouvir áudio' }}
              </button>
              <button
                v-if="record.imageUrl"
                @click="openImage(record.imageUrl)"
                class="text-xs text-primary hover:underline"
              >
                Ver foto
              </button>
            </div>
            <div v-if="playingAudioId === record.id" class="mt-1 h-1 rounded-full bg-secondary overflow-hidden w-24 sm:hidden">
              <div
                class="h-full bg-primary rounded-full transition-all duration-300"
                :style="{ width: (audioProgress.get(record.id) || 0) + '%' }"
              ></div>
            </div>
          </td>
          <td>
            <span class="rounded-lg px-2.5 py-1 text-xs font-medium" :class="classePorStatus(statusMidia(record))" :style="estiloSeloPendente(statusMidia(record))">{{ statusMidia(record) }}</span>
          </td>
          <td class="hidden sm:table-cell">
            <div class="flex items-center gap-2">
              <button
                v-if="record.audioUrl"
                @click="playAudio(record)"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors"
                :title="playingAudioId === record.id ? 'Parar áudio' : 'Reproduzir áudio'"
              >
                <Pause v-if="playingAudioId === record.id" class="w-3 h-3" />
                <Play v-else class="w-3 h-3" />
                {{ formatTime(audioDurations.get(record.id) || 0) }}
              </button>
              <span v-else class="text-xs text-muted-foreground">—</span>
              <button
                v-if="record.imageUrl"
                @click="openImage(record.imageUrl)"
                class="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors"
                title="Ver foto do local"
              >
                <Camera class="w-3 h-3" />
                Foto
              </button>
            </div>
            <div v-if="playingAudioId === record.id" class="mt-1 h-1 rounded-full bg-secondary overflow-hidden w-24">
              <div
                class="h-full bg-primary rounded-full transition-all duration-300"
                :style="{ width: (audioProgress.get(record.id) || 0) + '%' }"
              ></div>
            </div>
          </td>
          <td class="text-right">
            <details class="relative inline-block">
              <summary class="cursor-pointer list-none px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-secondary/50 transition-colors">•••</summary>
              <div class="absolute right-0 z-10 rounded-xl border border-border bg-popover p-1.5 shadow-xl min-w-36">
                <button
                  v-if="record.audioUrl"
                  @click="playAudio(record)"
                  class="flex w-full items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-secondary/50 transition-colors text-left"
                >
                  {{ playingAudioId === record.id ? 'Parar áudio' : 'Ouvir áudio' }}
                </button>
                <button
                  v-if="record.imageUrl"
                  @click="openImage(record.imageUrl)"
                  class="flex w-full items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-secondary/50 transition-colors text-left"
                >
                  Ver foto
                </button>
                <button
                  @click="openLocation(record.latitude, record.longitude)"
                  class="flex w-full items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-secondary/50 transition-colors text-left"
                >
                  Abrir no Maps
                </button>
                <button
                  @click="removeRecord(record.id)"
                  class="flex w-full items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-secondary/50 transition-colors text-left text-destructive"
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
        :icon="AlertTriangle"
        title="Nenhum acionamento registrado"
        description="Os registros aparecerão aqui quando o botão de pânico for ativado."
        action-label="Ir para o painel"
        @action="goToDashboard"
      />

      <div
        v-if="selectedImage"
        class="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
        @click="closeImage"
      >
        <button
          @click="closeImage"
          class="absolute top-4 right-4 text-white/80 hover:text-white p-2 hover:bg-white/10 rounded-full transition-all"
        >
          <X class="w-8 h-8" />
        </button>

        <div class="relative max-w-4xl w-full animate-scale-in">
          <img
            :src="selectedImage"
            alt="Foto do local"
            class="w-full h-auto rounded-2xl border border-border"
          />
          <div class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-sm font-medium">
            Foto capturada no momento do acionamento
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
