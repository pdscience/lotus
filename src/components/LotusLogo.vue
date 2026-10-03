<script setup lang="ts">
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 256 256"
        fill="none"
        stroke="currentColor"
        stroke-width="16"
        stroke-linecap="round"
        stroke-linejoin="round"
        :class="sizes[size].icon"
      >
        <path d="M128,200s40-22,40-80.82c0-46-24.55-69.54-35.19-77.56a8,8,0,0,0-9.62,0C112.55,49.64,88,73.14,88,119.18,88,178,128,200,128,200Z" />
        <path d="M94.6,80.8C81.28,70,68.56,65.79,61,64.18a8.2,8.2,0,0,0-9.52,5.52c-3.88,12-8.78,39.66,11.11,74.27s53.07,53.4,65.37,56" />
        <path d="M161.4,80.8c13.32-10.82,26-15,33.56-16.62a8.2,8.2,0,0,1,9.52,5.52c3.88,12,8.78,39.66-11.11,74.27S140.3,197.37,128,200" />
        <path d="M128,200c15.37,0,40.77-.18,70-17.64s38.69-39.34,41.72-50.54a7.94,7.94,0,0,0-5.46-9.78,69.59,69.59,0,0,0-30.82-.64" />
        <path d="M52.56,121.4a69.59,69.59,0,0,0-30.82.64,7.94,7.94,0,0,0-5.46,9.78c3,11.2,12.49,33.07,41.72,50.54S112.63,200,128,200" />
      </svg>
    </div>
    <span
      class="font-heading font-bold tracking-tight"
      :class="[sizes[size].text, variant === 'dark' ? 'text-foreground' : 'text-white']"
    >Lótus</span>
  </div>
</template>
