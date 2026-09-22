<template>
  <div class="rounded-lg border border-border glass-card overflow-hidden">
    <table class="w-full text-sm">
      <thead><tr class="border-b border-border text-left text-muted-foreground"><slot name="head" /></tr></thead>
      <tbody><slot /></tbody>
    </table>
    <slot name="empty" />
  </div>
</template>
<style scoped>
tbody :slotted(tr) { height: 44px; }
tbody :slotted(tr:not(:last-child)) { border-bottom: 1px solid hsl(var(--border)); }
tbody :slotted(tr:hover) { background: hsl(var(--muted) / 0.5); }
thead :slotted(th), tbody :slotted(td) { padding: 0 16px; }
</style>
