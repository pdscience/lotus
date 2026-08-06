<script setup lang="ts">
import { ref } from 'vue'
import { AlertTriangle } from 'lucide-vue-next'
import Modal from './Modal.vue'

interface ConfirmDialogProps {
  title?: string
  message?: string
  confirmText?: string
  cancelText?: string
  type?: 'danger' | 'warning' | 'info'
}

const props = withDefaults(defineProps<ConfirmDialogProps>(), {
  title: 'Confirmar',
  message: 'Tem certeza que deseja continuar?',
  confirmText: 'Confirmar',
  cancelText: 'Cancelar',
  type: 'danger'
})

const emit = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const isOpen = ref(false)

function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

function confirm() {
  emit('confirm')
  isOpen.value = false
}

function cancel() {
  emit('cancel')
  isOpen.value = false
}

defineExpose({ open, close, isOpen })

const iconClass: Record<string, string> = {
  danger: 'bg-destructive/10 text-destructive',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info'
}

const buttonClass: Record<string, string> = {
  danger: 'bg-destructive hover:bg-destructive/90',
  warning: 'bg-warning hover:bg-warning/90',
  info: 'bg-primary hover:bg-primary/90'
}
</script>

<template>
  <Modal v-model="isOpen" :title="props.title" size="sm" :closable="false">
    <div class="flex flex-col items-center text-center py-2">
      <div :class="['w-12 h-12 rounded-full flex items-center justify-center mb-4', iconClass[props.type]]">
        <AlertTriangle class="w-6 h-6" />
      </div>
      
      <p class="text-muted-foreground">{{ props.message }}</p>
    </div>
    
    <template #footer>
      <div class="flex gap-3">
        <button
          @click="cancel"
          class="flex-1 px-4 py-2 rounded-lg border hover:bg-muted transition-colors"
        >
          {{ props.cancelText }}
        </button>
        <button
          @click="confirm"
          :class="['flex-1 px-4 py-2 rounded-lg text-white transition-colors', buttonClass[props.type]]"
        >
          {{ props.confirmText }}
        </button>
      </div>
    </template>
  </Modal>
</template>