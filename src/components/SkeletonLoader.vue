<script setup lang="ts">
import { ref, computed } from 'vue'

interface SkeletonProps {
  width?: string
  height?: string
  rounded?: boolean
  circle?: boolean
  lines?: number
  animation?: 'pulse' | 'wave' | 'none'
}

const props = withDefaults(defineProps<SkeletonProps>(), {
  width: '100%',
  height: '1rem',
  rounded: false,
  circle: false,
  lines: 1,
  animation: 'pulse'
})

const skeletonRef = ref<HTMLElement | null>(null)

const skeletonClass = computed(() => {
  const classes = ['skeleton-base']
  
  if (props.animation === 'pulse') classes.push('animate-pulse')
  if (props.animation === 'wave') classes.push('skeleton-wave')
  if (props.rounded) classes.push('rounded')
  if (props.circle) classes.push('rounded-full')
  
  return classes.join(' ')
})

const containerStyle = computed(() => ({
  width: props.width,
  height: props.circle ? props.width : props.height
}))
</script>

<template>
  <div 
    v-if="lines > 1" 
    class="flex flex-col gap-2"
  >
    <div
      v-for="i in lines"
      :key="i"
      :class="skeletonClass"
      :style="i === lines ? 'width: 60%' : containerStyle"
    />
  </div>
  <div
    v-else
    ref="skeletonRef"
    :class="skeletonClass"
    :style="containerStyle"
  />
</template>

<style scoped>
.skeleton-base {
  @apply bg-muted;
}

.animate-pulse {
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.skeleton-wave {
  background: linear-gradient(
    90deg,
    theme('colors.muted') 0%,
    theme('colors.muted/50') 50%,
    theme('colors.muted') 100%
  );
  background-size: 200% 100%;
  animation: skeleton-wave 1.5s ease-in-out infinite;
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

@keyframes skeleton-wave {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>