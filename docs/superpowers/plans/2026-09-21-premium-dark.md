# Protegida Dark Premium Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar o redesign dark-first premium nas 16 views para diferenciar do concorrente.

**Architecture:** Fundação (tokens dark + useTheme anti-flash) → componentes base reutilizáveis → shell colapsável → migração das views em 3 lotes → IA nativa. Rotas, guards, tabelas e sequência de páginas inalterados.

**Tech Stack:** Vue 3 + TypeScript + Vite 5 + Tailwind 3 + Lucide (sem libs novas)

**Spec:** `docs/superpowers/specs/2026-09-21-premium-dark-design.md`

## Global Constraints

- Rotas, guards (`src/router/index.ts`) e tabelas InsForge inalterados; nomes e ordem das páginas mantidos.
- Rosa `340 75% 55%` só como acento; cor reservada para estado (success/warning/destructive/info).
- Density: tabelas 44px, padding de seção 16px; raio `--radius: 0.5rem`.
- Build verde por task: `npm run build`.
- Nenhuma lib nova; sparklines em SVG inline.

---

### Task 1: Fundação dark-first

**Files:**
- Create: `src/composables/useTheme.ts`
- Modify: `index.html:2-12`
- Modify: `src/assets/main.css:8-64`
- Modify: `src/main.ts`

**Interfaces:**
- Consumes: nada
- Produces: `useTheme(): { theme: Ref<'dark'|'light'>, toggle(): void }`, classe `dark` no `<html>`, chave `protegida-theme`

- [ ] **Step 1: Criar useTheme**

```ts
import { ref, watch } from 'vue'

type Theme = 'dark' | 'light'
const theme = ref<Theme>('dark')

function apply(t: Theme) {
  document.documentElement.classList.toggle('dark', t === 'dark')
  try { localStorage.setItem('protegida-theme', t) } catch { /* ignore */ }
}

export function useTheme() {
  return { theme, toggle: () => { theme.value = theme.value === 'dark' ? 'light' : 'dark' } }
}

export function initTheme(): void {
  let saved: string | null = null
  try { saved = localStorage.getItem('protegida-theme') } catch { /* ignore */ }
  if (saved === 'light' || saved === 'dark') theme.value = saved
  else if (window.matchMedia?.('(prefers-color-scheme: light)').matches) theme.value = 'light'
  apply(theme.value)
  watch(theme, apply)
}
```

- [ ] **Step 2: Anti-flash no index.html**

Inserir antes de `<div id="app">` (dentro de `<head>`, após `<title>`):
```html
<script>
try {
  var t = localStorage.getItem('protegida-theme')
  if (t !== 'light' && t !== 'dark') t = matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
  if (t === 'dark') document.documentElement.classList.add('dark')
} catch (e) {}
</script>
```

- [ ] **Step 3: Tokens dark-first em main.css**

Substituir bloco `.dark` (linhas 38-64) por:
```css
.dark {
  --background: 340 12% 7%;
  --foreground: 340 15% 93%;
  --card: 340 10% 10%;
  --card-foreground: 340 15% 93%;
  --popover: 340 10% 12%;
  --popover-foreground: 340 15% 93%;
  --primary: 340 75% 62%;
  --primary-foreground: 0 0% 100%;
  --secondary: 340 8% 15%;
  --secondary-foreground: 340 15% 93%;
  --muted: 340 8% 15%;
  --muted-foreground: 340 12% 65%;
  --accent: 320 70% 65%;
  --accent-foreground: 0 0% 100%;
  --destructive: 0 72% 55%;
  --destructive-foreground: 0 0% 100%;
  --warning: 38 92% 55%;
  --warning-foreground: 0 0% 10%;
  --success: 142 60% 45%;
  --success-foreground: 0 0% 100%;
  --info: 217 85% 65%;
  --info-foreground: 0 0% 100%;
  --border: 340 10% 18%;
  --input: 340 8% 14%;
  --ring: 340 75% 62%;
}
```
Trocar `--radius: 0.75rem` → `0.5rem` e adicionar em `@layer base`: `.tnum { font-variant-numeric: tabular-nums; }`.

- [ ] **Step 4: Chamar initTheme no main.ts**

No topo de `src/main.ts`, antes do `createApp`: `import { initTheme } from './composables/useTheme'` + `initTheme()`.

- [ ] **Step 5: Verificar Task 1**

Run: `npm run build 2>&1 | tail -n 3`
Expected: `✓ built in` verde.

- [ ] **Step 6: Commit**

```bash
git add src/composables/useTheme.ts index.html src/assets/main.css src/main.ts
git commit -m "feat: fundacao dark-first com useTheme anti-flash"
```

### Task 2: Componentes base

**Files:**
- Create: `src/components/StatCard.vue`
- Create: `src/components/DataTable.vue`
- Create: `src/components/EmptyState.vue`
- Create: `src/components/SectionHeader.vue`
- Create: `src/components/ThemeToggle.vue`
- Modify: `src/components/ProtegidaLogo.vue:3-6,22-25`

**Interfaces:**
- Consumes: `useTheme` da Task 1
- Produces: componentes com props exatas abaixo; `variant: 'mono'` no logo (texto branco)

- [ ] **Step 1: StatCard + sparkline**

```vue
<script setup lang="ts">
const props = withDefaults(defineProps<{ label: string; value: string; delta?: string; trend?: number[] }>(), { delta: '', trend: () => [] })
const points = props.trend.length
  ? props.trend.map((v, i) => `${(i / Math.max(props.trend.length - 1, 1)) * 100},${28 - (v / Math.max(...props.trend, 1)) * 24}`).join(' ')
  : ''
</script>
<template>
  <div class="rounded-lg border border-border bg-card p-4">
    <p class="text-xs text-muted-foreground">{{ label }}</p>
    <p class="tnum text-2xl font-bold mt-1">{{ value }}</p>
    <div class="flex items-end justify-between mt-2">
      <span v-if="delta" class="text-xs text-success">{{ delta }}</span>
      <svg v-if="points" viewBox="0 0 100 32" class="h-8 w-24 text-primary" fill="none">
        <polyline :points="points" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
      </svg>
    </div>
  </div>
</template>
```

- [ ] **Step 2: DataTable, EmptyState, SectionHeader, ThemeToggle**

```vue
<!-- DataTable.vue -->
<template>
  <div class="rounded-lg border border-border bg-card overflow-hidden">
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
th, td { padding: 0 16px; }
</style>
```

```vue
<!-- EmptyState.vue -->
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
```

```vue
<!-- SectionHeader.vue -->
<template>
  <div class="flex items-start justify-between mb-4">
    <div><h2 class="text-xl font-bold"><slot name="title" /></h2><p class="text-sm text-muted-foreground mt-0.5"><slot name="desc" /></p></div>
    <div class="flex gap-2"><slot name="actions" /></div>
  </div>
</template>
```

```vue
<!-- ThemeToggle.vue -->
<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { useTheme } from '../composables/useTheme'
const { theme, toggle } = useTheme()
</script>
<template>
  <button @click="toggle" class="p-2 rounded-lg hover:bg-secondary/50 transition-colors" :title="theme === 'dark' ? 'Modo claro' : 'Modo escuro'">
    <Sun v-if="theme === 'dark'" class="w-5 h-5" /><Moon v-else class="w-5 h-5" />
  </button>
</template>
```

- [ ] **Step 3: Variante mono no ProtegidaLogo**

Props: adicionar `'mono'` ao union e default segue `'dark'`. Texto: `variant === 'dark' ? 'text-foreground' : 'text-white'`.

- [ ] **Step 4: Verificar Task 2**

Run: `npm run build 2>&1 | tail -n 3`
Expected: verde.

- [ ] **Step 5: Commit**

```bash
git add src/components/StatCard.vue src/components/DataTable.vue src/components/EmptyState.vue src/components/SectionHeader.vue src/components/ThemeToggle.vue src/components/ProtegidaLogo.vue
git commit -m "feat: componentes base do design system dark"
```

### Task 3: Shell AppLayout

**Files:**
- Modify: `src/components/AppLayout.vue`

**Interfaces:**
- Consumes: `ThemeToggle`, `ProtegidaLogo variant mono`, chave `protegida-sidebar`
- Produces: sidebar colapsável + topbar mínima; mesma navegação e guards

- [ ] **Step 1: Sidebar colapsável + topbar**

Adicionar no `<script setup>`: `import { ref } from 'vue'` (se ausente), `import ThemeToggle from './ThemeToggle.vue'`, `import ProtegidaLogo from './ProtegidaLogo.vue'`:
```ts
const collapsed = ref(localStorage.getItem('protegida-sidebar') === 'collapsed')
const toggleSidebar = () => {
  collapsed.value = !collapsed.value
  localStorage.setItem('protegida-sidebar', collapsed.value ? 'collapsed' : 'open')
}
```
Sidebar: `:class="collapsed ? 'lg:w-20' : 'lg:w-64'"`, esconder labels com `v-show="!collapsed"`, botão chevron no topo. Topbar: adicionar `<ThemeToggle />` ao lado do avatar. Conteúdo: `px-4 py-4` (16px). Logo: `<ProtegidaLogo size="sm" variant="mono" />`.

- [ ] **Step 2: Verificar Task 3**

Run: `npm run build 2>&1 | tail -n 3` + smoke `npm run dev`, abrir `/dashboard`, colapsar sidebar, recarregar (persiste).
Expected: verde, persiste.

- [ ] **Step 3: Commit**

```bash
git add src/components/AppLayout.vue
git commit -m "feat: shell dark com sidebar colapsavel"
```

### Task 4: Lote públicas

**Files:**
- Modify: `src/views/BoasVindasView.vue`
- Modify: `src/views/LoginView.vue`
- Modify: `src/views/NotFoundView.vue`

**Interfaces:**
- Consumes: Tasks 1-2
- Produces: públicas em dark, mesma estrutura e rotas

- [ ] **Step 1: BoasVindas + Login + NotFound dark**

`BoasVindasView`: fundo `bg-background`, overlay `from-black/80 via-[#1a0d14]/60`, logo mono, botão primário sólido `bg-primary` (sem gradiente arco-íris). `LoginView`: card `bg-card border-border`, remover `bg-white/30 backdrop-blur`, manter seletor de tipo (vitima rosa sólido, admin `bg-primary`, agente azul). `NotFoundView`: `EmptyState` com ação voltar ao início.

- [ ] **Step 2: Verificar Task 4**

Run: `npm run build 2>&1 | tail -n 3` + smoke `/`, `/login`, `/rota-inexistente`.
Expected: verde, dark sem flash.

- [ ] **Step 3: Commit**

```bash
git add src/views/BoasVindasView.vue src/views/LoginView.vue src/views/NotFoundView.vue
git commit -m "style: lote publicas em dark premium"
```

### Task 5: Lote vítima

**Files:**
- Modify: `src/views/DashboardView.vue`
- Modify: `src/views/CercamentoView.vue`
- Modify: `src/views/ContatosView.vue`
- Modify: `src/views/RedeApoioView.vue`
- Modify: `src/views/AconselhamentoView.vue`
- Modify: `src/views/HistoricoPanicoView.vue`

**Interfaces:**
- Consumes: `StatCard`, `DataTable`, `EmptyState`, `SectionHeader`
- Produces: views densas dark; mesmos dados e ações

- [ ] **Step 1: Aplicar componentes**

`DashboardView`: `SectionHeader` + bento de `StatCard` (medidas ativas, pânicos 30d, contatos) + lista atividade recente (sem cards coloridos). `ContatosView`, `HistoricoPanicoView`: listas → `DataTable` (44px) + `EmptyState` com CTA quando vazio. `RedeApoioView`, `CercamentoView`, `AconselhamentoView`: `SectionHeader` + superfícies `bg-card border-border`, remover `bg-white/*` e sombras decorativas. Preservar chamadas aos services.

- [ ] **Step 2: Verificar Task 5**

Run: `npm run build 2>&1 | tail -n 3` + smoke login vítima → dashboard, contatos, histórico.
Expected: verde.

- [ ] **Step 3: Commit**

```bash
git add src/views/DashboardView.vue src/views/CercamentoView.vue src/views/ContatosView.vue src/views/RedeApoioView.vue src/views/AconselhamentoView.vue src/views/HistoricoPanicoView.vue
git commit -m "style: lote vitima em dark premium"
```

### Task 6: Lote admin/agente

**Files:**
- Modify: `src/views/RelatoriosView.vue`
- Modify: `src/views/CadastroView.vue`
- Modify: `src/views/ConsultaView.vue`
- Modify: `src/views/MapaView.vue`
- Modify: `src/views/MedidaDetailView.vue`
- Modify: `src/views/AgenteInicioView.vue`
- Modify: `src/views/AgenteMonitoramentoView.vue`

**Interfaces:**
- Consumes: componentes Task 2
- Produces: views densas dark; gráficos clássicos (linha/barra/donut SVG próprio)

- [ ] **Step 1: Aplicar componentes + gráficos contidos**

`ConsultaView`, `AgenteMonitoramentoView`: `DataTable` densa. `RelatoriosView`: `StatCard` + barras/linha em SVG (divs proporcionais ou polyline como no StatCard), donut só com ≤3 fatias. Demais: `SectionHeader` + `bg-card`. Preservar services e guards `meta.roles`.

- [ ] **Step 2: Verificar Task 6**

Run: `npm run build 2>&1 | tail -n 3` + smoke admin → relatorios/consulta/mapa; agente → inicio/monitoramento.
Expected: verde.

- [ ] **Step 3: Commit**

```bash
git add src/views/RelatoriosView.vue src/views/CadastroView.vue src/views/ConsultaView.vue src/views/MapaView.vue src/views/MedidaDetailView.vue src/views/AgenteInicioView.vue src/views/AgenteMonitoramentoView.vue
git commit -m "style: lote admin-agente em dark premium"
```

### Task 7: IA nativa

**Files:**
- Modify: `src/views/DashboardView.vue`
- Modify: `src/views/MedidaDetailView.vue`

**Interfaces:**
- Consumes: `isConfigured`, `gerarApoio` de `src/services/iaAconselhamentoService.ts`
- Produces: resumo no dashboard + sugestões na medida, fallback silencioso

- [ ] **Step 1: Resumo no Dashboard + sugestões na Medida**

`DashboardView` topo (após SectionHeader):
```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { isConfigured, gerarApoio } from '../services/iaAconselhamentoService'
const resumoIa = ref('')
onMounted(async () => {
  if (!isConfigured()) return
  try { resumoIa.value = await gerarApoio('Resuma em 2 frases a situação de proteção da usuária.') }
  catch { resumoIa.value = '' }
})
</script>
<div v-if="resumoIa" class="rounded-lg border border-primary/30 bg-primary/5 p-4 mb-4">
  <p class="text-xs font-semibold text-primary mb-1">Resumo da situação</p>
  <p class="text-sm">{{ resumoIa }}</p>
</div>
```
`MedidaDetailView`: bloco opt-in "Sugestões de ação" (textarea desabilitada com contexto + botão que chama `gerarApoio`, erro amigável, disclaimer 180/190).

- [ ] **Step 2: Verificar Task 7**

Run: `npm run build 2>&1 | tail -n 3`
Expected: verde; sem env, dashboard sem bloco IA e sem erro.

- [ ] **Step 3: Commit**

```bash
git add src/views/DashboardView.vue src/views/MedidaDetailView.vue
git commit -m "feat: IA nativa no dashboard e medida"
```
