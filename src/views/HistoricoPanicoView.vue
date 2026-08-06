<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { 
  Trash2, 
  Camera, 
  MapPin, 
  Clock,
  Play,
  Pause,
  X,
  AlertTriangle
} from 'lucide-vue-next'
import { fetchPanicRecords, deletePanicRecord, type PanicRecord } from '../services/panicService'

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

onMounted(() => {
  loadRecords()
})

onUnmounted(() => {
  audioElements.value.forEach(audio => audio.pause())
  audioElements.value.clear()
})
</script>

<template>
  <div class="p-4 max-w-3xl mx-auto">
    <div class="flex items-center gap-3 mb-6">
      <div class="p-2 bg-red-100 rounded-xl">
        <AlertTriangle class="w-6 h-6 text-red-600" />
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Histórico de Acionamentos</h1>
        <p class="text-sm text-gray-500">Registros de emergência da vítima</p>
      </div>
    </div>
    
    <div v-if="records.length === 0" class="text-center py-16 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertTriangle class="w-8 h-8 text-gray-400" />
      </div>
      <p class="text-gray-500 font-medium">Nenhum acionamento registrado ainda.</p>
      <p class="text-sm text-gray-400 mt-1">Os registros aparecerão aqui quando o botão de pânico for ativado.</p>
    </div>
    
    <div v-else class="space-y-4">
      <div 
        v-for="record in records" 
        :key="record.id"
        class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
      >
        <div class="bg-gradient-to-r from-red-500 to-red-600 px-5 py-3 flex items-center justify-between">
          <div class="flex items-center gap-2 text-white">
            <Clock class="w-4 h-4 opacity-80" />
            <span class="font-medium">{{ formatDate(record.timestamp) }}</span>
          </div>
          <button
            @click="removeRecord(record.id)"
            class="p-1.5 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
            title="Excluir"
          >
            <Trash2 class="w-4 h-4" />
          </button>
        </div>
        
        <div class="p-5 space-y-4">
          <div class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
            <div class="p-2 bg-red-100 rounded-lg">
              <MapPin class="w-5 h-5 text-red-600" />
            </div>
            <div class="flex-1 min-w-0">
              <button 
                @click="openLocation(record.latitude, record.longitude)"
                class="text-sm font-semibold text-red-600 hover:text-red-700 hover:underline flex items-center gap-1"
              >
                Ver localização no mapa
                <Play class="w-3 h-3" />
              </button>
              <p class="text-xs text-gray-500 mt-1 font-mono">
                {{ formatCoordinates(record.latitude, record.longitude) }}
              </p>
            </div>
          </div>
          
          <div class="flex gap-3">
            <button
              v-if="record.audioUrl"
              @click="playAudio(record)"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg shadow-blue-500/20"
            >
              <div class="p-1 bg-white/20 rounded-full">
                <Pause v-if="playingAudioId === record.id" class="w-4 h-4" />
                <Play v-else class="w-4 h-4" />
              </div>
              <span class="font-medium">
                {{ playingAudioId === record.id ? 'Parar Áudio' : 'Reproduzir Áudio' }}
              </span>
              <span v-if="audioDurations.get(record.id)" class="text-xs text-blue-100">
                {{ formatTime(audioDurations.get(record.id) || 0) }}
              </span>
            </button>
            
            <div v-if="playingAudioId === record.id" class="w-full mt-2">
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-300"
                  :style="{ width: (audioProgress.get(record.id) || 0) + '%' }"
                ></div>
              </div>
            </div>
            
            <button
              v-if="record.imageUrl"
              @click="openImage(record.imageUrl)"
              class="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/20"
            >
              <div class="p-1 bg-white/20 rounded-full">
                <Camera class="w-4 h-4" />
              </div>
              <span class="font-medium">Ver Foto do Local</span>
            </button>
          </div>
        </div>
      </div>
    </div>

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
          class="w-full h-auto rounded-2xl shadow-2xl border-4 border-white/10"
        />
        <div class="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-sm font-medium">
          Foto capturada no momento do acionamento
        </div>
      </div>
    </div>
  </div>
</template>
