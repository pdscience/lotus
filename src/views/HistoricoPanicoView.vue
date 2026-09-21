<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
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
    <div class="p-4 max-w-3xl mx-auto">
      <SectionHeader>
        <template #title>Histórico de acionamentos</template>
        <template #desc>Registros de emergência da vítima</template>
      </SectionHeader>

      <DataTable v-if="records.length > 0">
        <template #head>
          <th class="font-medium py-3">Data / hora</th>
          <th class="font-medium py-3">Localização</th>
          <th class="font-medium py-3 hidden sm:table-cell">Mídia</th>
          <th class="font-medium py-3 text-right">Ações</th>
        </template>
        <tr v-for="record in records" :key="record.id">
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
          <td class="hidden sm:table-cell">
            <div class="flex items-center gap-2">
              <button
                v-if="record.audioUrl"
                @click="playAudio(record)"
                class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors"
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
                class="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary/50 hover:bg-secondary text-xs font-medium transition-colors"
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
            <button
              @click="removeRecord(record.id)"
              class="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-secondary/50 transition-colors"
              title="Excluir"
            >
              <Trash2 class="w-4 h-4" />
            </button>
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

        <div class="relative max-w-4xl w-full">
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
