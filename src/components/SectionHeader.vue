<template>
  <div class="flex items-start justify-between gap-4 mb-5 animate-fade-in-up">
    <div class="min-w-0">
      <h2 class="text-xl md:text-2xl font-bold font-heading tracking-tight"><slot name="title" /></h2>
      <p class="text-sm text-muted-foreground mt-1"><slot name="desc" /></p>
    </div>
    <div class="flex items-center gap-2 flex-shrink-0"><slot name="aside" /><slot name="actions" /></div>
  </div>
</template>
