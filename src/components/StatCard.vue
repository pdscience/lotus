<script setup lang="ts">
const props = withDefaults(defineProps<{ label: string; value: string; delta?: string; trend?: number[]; accentTop?: boolean }>(), { delta: '', trend: () => [], accentTop: false })
const points = props.trend.length
  ? props.trend.map((v, i) => `${(i / Math.max(props.trend.length - 1, 1)) * 100},${28 - (v / Math.max(...props.trend, 1)) * 24}`).join(' ')
  : ''
</script>
<template>
  <div class="rounded-lg border border-border glass-card p-4">
    <div v-if="accentTop" class="h-1 -mx-4 -mt-4 mb-3 rounded-t-lg bg-primary" />
    <p class="text-xs text-muted-foreground dark:text-white">{{ label }}</p>
    <p class="tnum text-2xl font-bold mt-1">{{ value }}</p>
    <div class="flex items-end justify-between mt-2">
      <span v-if="delta" class="text-xs" :class="delta.trim().startsWith('-') ? 'text-destructive' : 'text-success'">{{ delta }}</span>
      <svg v-if="points" viewBox="0 0 100 32" class="h-8 w-24 text-primary" fill="none">
        <polyline :points="points" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </div>
  </div>
</template>
