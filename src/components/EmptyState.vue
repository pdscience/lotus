<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{ icon: Component; title: string; description: string; actionLabel?: string }>()
defineEmits<{ (e: 'action'): void }>()
</script>
<template>
  <div class="rounded-2xl border border-dashed border-border bg-card/40 p-8 text-center">
    <div class="w-14 h-14 mx-auto rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
      <component :is="icon" class="w-7 h-7" />
    </div>
    <p class="font-heading font-semibold mt-4">{{ title }}</p>
    <p class="text-sm text-muted-foreground mt-1">{{ description }}</p>
    <button
      v-if="actionLabel"
      @click="$emit('action')"
      class="mt-5 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:opacity-95 active:scale-[0.99] transition-all"
    >
      {{ actionLabel }}
    </button>
  </div>
</template>
