<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { useTheme } from '../composables/useTheme'
const { theme, toggle } = useTheme()
</script>
<template>
  <button type="button" @click="toggle" class="p-2 rounded-lg hover:bg-secondary/50 transition-colors" :title="theme === 'dark' ? 'Modo claro' : 'Modo escuro'" :aria-label="theme === 'dark' ? 'Mudar para modo claro' : 'Mudar para modo escuro'">
    <Sun v-if="theme === 'dark'" class="w-5 h-5" /><Moon v-else class="w-5 h-5" />
  </button>
</template>
