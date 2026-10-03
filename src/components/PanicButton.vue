<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import {
  Loader2,
  Phone,
  Heart,
  ShieldAlert,
  AlertOctagon
} from 'lucide-vue-next'
import { getLocation } from '../services/locationService'
import { getContatosParaAlerta } from '../services/contatoAnjoService'
import { sendPanicAlert } from '../services/panicService'

type StatusType = 'seguro' | 'ativando' | 'enviando' | 'sucesso' | 'erro'

const status = ref<StatusType>('seguro')
const statusMessage = ref('Lótus')
const enviados = ref<{ tipo: string; contato: string; sucesso: boolean }[]>([])
const locationInterval = ref<number | null>(null)
const progress = ref(0)

let mediaRecorder: MediaRecorder | null = null
let audioChunks: Blob[] = []
let videoStream: MediaStream | null = null
let capturedImage: string | null = null
let audioUrl: string | null = null

const HOLD_DURATION = 2000
let progressInterval: number | null = null

const formatTelefoneLink = (telefone: string): string => {
  return telefone.replace(/\D/g, '')
}

const gerarMensagemLocalizacao = (lat: number, lng: number): string => {
  const googleMapsUrl = `https://maps.google.com/?q=${lat},${lng}`
  return `🆘 *EMERGÊNCIA - PRECISO DE AJUDA!* 🆘\n\nMinha localização atual:\n${googleMapsUrl}\n\nPor favor, me ajude ou chame ajuda!`
}

const startPress = () => {
  if (status.value === 'enviando' || status.value === 'sucesso') return
  
  status.value = 'ativando'
  statusMessage.value = 'Ativando...'
  progress.value = 0
  
  progressInterval = window.setInterval(() => {
    progress.value += 100 / (HOLD_DURATION / 100)
    if (progress.value >= 100) {
      clearInterval(progressInterval!)
      progressInterval = null
      triggerPanic()
    }
  }, 100)
}

const cancelPress = () => {
  if (status.value !== 'ativando') return
  
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  
  status.value = 'seguro'
  statusMessage.value = 'SOS Protetores'
  progress.value = 0
}

let audioStream: MediaStream | null = null
let audioTimeout: number | null = null

function stopAudioRecording(): void {
  if (audioTimeout) {
    clearTimeout(audioTimeout)
    audioTimeout = null
  }
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop()
  }
  if (audioStream) {
    audioStream.getTracks().forEach(track => track.stop())
    audioStream = null
  }
}

async function captureAudio(): Promise<string | null> {
  try {
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
    mediaRecorder = new MediaRecorder(audioStream)
    audioChunks = []
    
    return new Promise((resolve) => {
      mediaRecorder!.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }
      
      mediaRecorder!.onstop = () => {
        if (audioChunks.length > 0) {
          const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
          audioUrl = URL.createObjectURL(audioBlob)
        }
        if (audioStream) {
          audioStream.getTracks().forEach(track => track.stop())
          audioStream = null
        }
        resolve(audioUrl)
      }
      
      mediaRecorder!.start()
      
      audioTimeout = window.setTimeout(() => {
        stopAudioRecording()
      }, 30000)
    })
  } catch (error) {
    console.error('Erro ao capturar áudio:', error)
    return null
  }
}

async function capturePhoto(): Promise<string | null> {
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({ 
      video: { facingMode: 'environment' } 
    })
    
    const video = document.createElement('video')
    video.srcObject = videoStream
    await video.play()
    
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d')?.drawImage(video, 0, 0)
    
    capturedImage = canvas.toDataURL('image/jpeg', 0.8)
    
    videoStream.getTracks().forEach(track => track.stop())
    return capturedImage
  } catch (error) {
    console.error('Erro ao capturar foto:', error)
    return null
  }
}

async function triggerPanic() {
  status.value = 'enviando'
  statusMessage.value = 'Enviando Alerta...'
  enviados.value = []

  const [audioResult, photoResult] = await Promise.all([
    captureAudio(),
    capturePhoto()
  ])

  let location: { latitude: number; longitude: number }
  
  try {
    location = await getLocation()
  } catch {
    status.value = 'erro'
    statusMessage.value = 'Erro Localização'
    return
  }

  await sendPanicAlert({
    latitude: location.latitude,
    longitude: location.longitude,
    audioUrl: audioResult,
    imageUrl: photoResult
  })

  const contatos = getContatosParaAlerta()

  if (contatos.length === 0) {
    status.value = 'erro'
    statusMessage.value = 'Sem Contatos!'
    return
  }

  for (const contato of contatos) {
    const mensagem = gerarMensagemLocalizacao(location.latitude, location.longitude)
    const telefone = formatTelefoneLink(contato.telefone)

    const whatsappUrl = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`
    window.open(whatsappUrl, '_blank')
    
    enviados.value.push({
      tipo: 'WhatsApp',
      contato: contato.nome,
      sucesso: true
    })

    const smsUrl = `sms:${telefone}?body=${encodeURIComponent(mensagem)}`
    window.location.href = smsUrl
    
    enviados.value.push({
      tipo: 'SMS',
      contato: contato.nome,
      sucesso: true
    })
  }

  status.value = 'sucesso'
  statusMessage.value = 'Ajuda a Caminho!'

  startTracking(location.latitude, location.longitude)
}

function startTracking(_lat: number, _lng: number) {
  if (locationInterval.value) return

  locationInterval.value = window.setInterval(async () => {
    try {
      const location = await getLocation()
      const mensagem = gerarMensagemLocalizacao(location.latitude, location.longitude)
      
      const contatos = getContatosParaAlerta()
      
      for (const contato of contatos) {
        const telefone = formatTelefoneLink(contato.telefone)
        const whatsappUrl = `https://wa.me/${telefone}?text=${encodeURIComponent(mensagem)}`
        window.open(whatsappUrl, '_blank')
      }
    } catch {
      console.error('Erro ao atualizar localização')
    }
  }, 30000)
}

function stopTracking() {
  if (locationInterval.value) {
    clearInterval(locationInterval.value)
    locationInterval.value = null
  }
}

function reset() {
  stopAudioRecording()
  stopTracking()
  status.value = 'seguro'
  statusMessage.value = 'SOS Protetores'
  enviados.value = []
  progress.value = 0
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl)
    audioUrl = null
  }
  capturedImage = null
}

onUnmounted(() => {
  if (progressInterval) clearInterval(progressInterval)
  stopAudioRecording()
  stopTracking()
  if (audioUrl) {
    URL.revokeObjectURL(audioUrl)
    audioUrl = null
  }
})
</script>

<template>
  <div class="flex flex-col items-center gap-6 sm:gap-8 py-4">
    <div class="relative group">
      <!-- Outer Ripples -->
      <div 
        v-if="status === 'ativando' || status === 'enviando'" 
        class="absolute inset-0 rounded-full animate-ping-slow opacity-20 scale-150 bg-red-500"
      ></div>
      
      <!-- Middle Glow Ring -->
      <div 
        class="absolute -inset-4 rounded-full blur-2xl transition-all duration-700 opacity-60"
        :class="[
          status === 'sucesso' ? 'bg-green-500/30' : 
          status === 'erro' ? 'bg-orange-500/30' : 
          'bg-red-600/40 group-hover:opacity-80'
        ]"
      ></div>

      <!-- Circular Progress Ring (SVG) -->
      <svg 
        v-if="status === 'ativando'"
        class="absolute -inset-2 rotate-[-90deg] drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]"
        width="216" height="216"
        viewBox="0 0 100 100"
      >
        <circle
          cx="50" cy="50" r="46"
          fill="none"
          stroke="rgba(239, 68, 68, 0.2)"
          stroke-width="4"
        />
        <circle
          cx="50" cy="50" r="46"
          fill="none"
          stroke="currentColor"
          stroke-width="4"
          stroke-linecap="round"
          class="text-red-500 transition-all duration-100"
          :stroke-dasharray="289"
          :stroke-dashoffset="289 - (289 * progress / 100)"
        />
      </svg>
      
      <!-- Main Panic Button -->
      <button
        @mousedown="startPress"
        @mouseup="cancelPress"
        @mouseleave="cancelPress"
        @touchstart.prevent="startPress"
        @touchend.prevent="cancelPress"
        :disabled="status === 'enviando' || status === 'sucesso'"
        class="relative z-10 w-48 h-48 sm:w-52 sm:h-52 rounded-full flex flex-col items-center justify-center transition-all duration-300 active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
        :class="[
          status === 'seguro' ? 'bg-gradient-to-br from-red-500 via-red-600 to-red-800 hover:shadow-red-500/40' :
          status === 'ativando' ? 'bg-gradient-to-br from-red-400 via-red-500 to-red-700 animate-pulse' :
          status === 'enviando' ? 'bg-gradient-to-br from-red-600 via-red-800 to-black' :
          status === 'sucesso' ? 'bg-gradient-to-br from-green-500 to-green-700 shadow-green-500/40' :
          'bg-gradient-to-br from-zinc-700 to-black'
        ]"
      >
        <!-- Glassmorphism Reflection -->
        <div class="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none"></div>
        <div class="absolute top-2 left-6 right-6 h-1/3 bg-gradient-to-b from-white/20 to-transparent rounded-[50%] pointer-events-none"></div>

        <!-- Center Content -->
        <div class="flex flex-col items-center gap-2 transform transition-transform duration-300 group-active:scale-90">
          <!-- Icon State Manager -->
          <div class="relative h-16 sm:h-20 flex items-center justify-center">
            <template v-if="status === 'seguro'">
              <AlertOctagon class="w-16 h-16 sm:w-20 sm:h-20 text-white drop-shadow-md" />
            </template>
            <template v-else-if="status === 'ativando'">
              <ShieldAlert class="w-20 h-20 sm:w-24 sm:h-24 text-white animate-bounce-rapid" />
            </template>
            <template v-else-if="status === 'enviando'">
              <Loader2 class="w-16 h-16 sm:w-20 sm:h-20 text-white animate-spin" />
            </template>
            <template v-else-if="status === 'sucesso'">
              <Heart class="w-20 h-20 sm:w-24 sm:h-24 text-white animate-pulse" />
            </template>
            <template v-else>
              <Phone class="w-16 h-16 sm:w-20 sm:h-20 text-red-200" />
            </template>
          </div>
          
          <!-- Text Label -->
          <span class="text-white font-black text-lg sm:text-xl uppercase tracking-wider drop-shadow-lg">
            {{ status === 'ativando' ? Math.floor(progress) + '%' : statusMessage }}
          </span>
        </div>

        <!-- Inner Glow -->
        <div class="absolute inset-4 rounded-full border border-white/10 pointer-events-none"></div>
      </button>

      <!-- Decorative Particles (Ativando) -->
      <div v-if="status === 'ativando'" class="absolute inset-0 pointer-events-none">
        <div class="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-4 bg-red-400 rounded-full animate-ping"></div>
        <div class="absolute top-1/2 -left-4 -translate-y-1/2 w-3 h-3 bg-red-500 rounded-full animate-ping delay-100"></div>
        <div class="absolute top-1/2 -right-4 -translate-y-1/2 w-3 h-3 bg-red-300 rounded-full animate-ping delay-200"></div>
      </div>
    </div>

    <!-- Success Feedback Panel -->
    <div v-if="status === 'sucesso'" class="max-w-xs w-full animate-fade-in-up">
      <div class="bg-card/90 backdrop-blur-md border border-green-500/30 rounded-2xl p-4 shadow-xl text-center">
        <p class="text-green-600 font-bold mb-3 text-sm">Alertas enviados com sucesso!</p>
        <div class="flex flex-wrap justify-center gap-2 mb-4">
          <span
            v-for="(item, index) in enviados"
            :key="index"
            class="flex items-center gap-1.5 text-[10px] uppercase font-bold px-3 py-1.5 rounded-full bg-green-500/10 text-green-700 border border-green-500/20"
          >
            <span class="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            {{ item.contato }}
          </span>
        </div>
        <button
          @click="reset"
          class="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-600/20"
        >
          Estou em Segurança
        </button>
      </div>
    </div>

    <!-- Error Panel -->
    <div v-if="status === 'erro'" class="animate-fade-in-up">
      <button
        @click="reset"
        class="flex items-center gap-2 px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold transition-all border border-white/10"
      >
        <Phone class="w-4 h-4" />
        Tentar Novamente
      </button>
    </div>
  </div>
</template>

<style scoped>
@keyframes ping-slow {
  75%, 100% {
    transform: scale(2);
    opacity: 0;
  }
}

.animate-ping-slow {
  animation: ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes bounce-rapid {
  0%, 100% {
    transform: translateY(-10%) scale(1.1);
  }
  50% {
    transform: translateY(0) scale(1.05);
  }
}

.animate-bounce-rapid {
  animation: bounce-rapid 0.4s infinite;
}

.animate-fade-in-up {
  animation: fadeInUp 0.5s ease-out backwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
