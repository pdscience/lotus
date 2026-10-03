<template>
  <div class="rounded-2xl border border-border glass-card overflow-hidden">
    <table class="w-full text-sm">
      <thead><tr class="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><slot name="head" /></tr></thead>
      <tbody class="tnum"><slot /></tbody>
    </table>
    <slot name="empty" />
  </div>
</template>
<style scoped>
tbody :slotted(tr) { height: 48px; }
tbody :slotted(tr:not(:last-child)) { border-bottom: 1px solid hsl(var(--border) / 0.7); }
tbody :slotted(tr:hover) { background: hsl(var(--muted) / 0.4); }
thead :slotted(th), tbody :slotted(td) { padding: 0 16px; }
</style>
