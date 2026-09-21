<script setup lang="ts">
defineProps<{ icon: object; title: string; description: string; actionLabel?: string }>()
defineEmits<{ (e: 'action'): void }>()
</script>
<template>
  <div class="rounded-lg border border-dashed border-border p-8 text-center">
    <component :is="icon" class="w-8 h-8 mx-auto text-muted-foreground" />
    <p class="font-semibold mt-3">{{ title }}</p>
    <p class="text-sm text-muted-foreground mt-1">{{ description }}</p>
    <button v-if="actionLabel" @click="$emit('action')" class="btn-primary mt-4 !px-4 !py-2 text-sm">{{ actionLabel }}</button>
  </div>
</template>
