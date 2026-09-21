<template>
  <div class="flex items-start justify-between mb-4">
    <div><h2 class="text-xl font-bold"><slot name="title" /></h2><p class="text-sm text-muted-foreground mt-0.5"><slot name="desc" /></p></div>
    <div class="flex gap-2"><slot name="actions" /></div>
  </div>
</template>
