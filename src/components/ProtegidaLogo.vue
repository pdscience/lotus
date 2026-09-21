<script setup lang="ts">
import { ShieldCheck } from 'lucide-vue-next'
withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg'; variant?: 'light' | 'dark' | 'mono' }>(), {
  size: 'md',
  variant: 'dark'
})
const sizes = {
  sm: { box: 'w-11 h-11 rounded-xl', icon: 'w-6 h-6', text: 'text-lg' },
  md: { box: 'w-16 h-16 rounded-2xl', icon: 'w-8 h-8', text: 'text-2xl' },
  lg: { box: 'w-24 h-24 rounded-3xl', icon: 'w-12 h-12', text: 'text-3xl' }
}
</script>
<template>
  <div class="flex items-center gap-3">
    <div
      class="flex items-center justify-center text-white shadow-lg"
      :class="[sizes[size].box, variant === 'mono' ? 'bg-white/10 border border-white/20' : '']"
      :style="variant === 'mono' ? '' : 'background: linear-gradient(135deg, hsl(265,70%,55%) 0%, hsl(265,75%,45%) 100%)'"
    >
      <ShieldCheck :class="sizes[size].icon" />
    </div>
    <span
      class="font-heading font-bold tracking-tight"
      :class="[sizes[size].text, variant === 'dark' ? 'text-foreground' : 'text-white']"
    >Protegida</span>
  </div>
</template>
