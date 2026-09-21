# Violeta + Âmbar e Moldes — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Trocar a paleta rosa por violeta + âmbar nos dois modos e aplicar 4 moldes de layout nas 16 views.

**Architecture:** Tokens primeiro (1 commit, reverte fácil), evolução mínima dos componentes (props aditivas), depois moldes por lote de views. Nomes, rotas, guards e dados intactos.

**Tech Stack:** Vue 3 + TypeScript + Vite 5 + Tailwind 3 + Lucide (sem libs novas)

**Spec:** `docs/superpowers/specs/2026-09-21-violeta-ambar-moldes-design.md`

## Global Constraints

- Rosa some por completo: `rg -i "340, ?75%|hsl\(275|285, 70%|pink|rose|fuchsia" src/` zerado (exceto `rose` funcional justificado).
- Violeta primário `265 70% 55%` (light) / `265 75% 68%` (dark); âmbar `38 95% 52%` só em CTA/destaque.
- Rotas, guards, tabelas, nomes e ordem das páginas inalterados.
- Build verde por task: `npm run build`.
- Sem libs novas.

---

### Task 1: Tokens violeta + âmbar

**Files:**
- Modify: `src/assets/main.css:8-64`
- Modify: `src/components/ProtegidaLogo.vue:18`
- Modify: `index.html:7`

**Interfaces:**
- Consumes: nada
- Produces: `--primary` violeta, `--accent` âmbar nos dois modos

- [ ] **Step 1: Bloco :root (light marfim)**

Substituir linhas 10-35 por:
```css
--background: 40 30% 97%;
--foreground: 265 25% 14%;
--card: 0 0% 100%;
--card-foreground: 265 25% 14%;
--popover: 0 0% 100%;
--popover-foreground: 265 25% 14%;
--primary: 265 70% 55%;
--primary-foreground: 0 0% 100%;
--secondary: 40 20% 93%;
--secondary-foreground: 265 25% 14%;
--muted: 40 20% 94%;
--muted-foreground: 265 12% 42%;
--accent: 38 95% 52%;
--accent-foreground: 265 25% 14%;
--destructive: 0 84% 60%;
--destructive-foreground: 0 0% 100%;
--warning: 38 92% 50%;
--warning-foreground: 0 0% 100%;
--success: 142 76% 36%;
--success-foreground: 0 0% 100%;
--info: 217 91% 60%;
--info-foreground: 0 0% 100%;
--border: 40 20% 88%;
--input: 40 20% 93%;
--ring: 265 70% 55%;
```

- [ ] **Step 2: Bloco .dark (ametista)**

Substituir por:
```css
.dark {
  --background: 265 22% 8%;
  --foreground: 265 15% 93%;
  --card: 265 16% 11%;
  --card-foreground: 265 15% 93%;
  --popover: 265 16% 13%;
  --popover-foreground: 265 15% 93%;
  --primary: 265 75% 68%;
  --primary-foreground: 0 0% 100%;
  --secondary: 265 12% 16%;
  --secondary-foreground: 265 15% 93%;
  --muted: 265 12% 16%;
  --muted-foreground: 265 12% 68%;
  --accent: 38 95% 55%;
  --accent-foreground: 265 25% 10%;
  --destructive: 0 72% 55%;
  --destructive-foreground: 0 0% 100%;
  --warning: 38 92% 55%;
  --warning-foreground: 0 0% 10%;
  --success: 142 60% 45%;
  --success-foreground: 0 0% 100%;
  --info: 217 85% 65%;
  --info-foreground: 0 0% 100%;
  --border: 265 14% 19%;
  --input: 265 12% 15%;
  --ring: 265 75% 68%;
}
```

- [ ] **Step 3: Logo + theme-color**

`ProtegidaLogo.vue:18`: `style="background: linear-gradient(135deg, hsl(265,70%,55%) 0%, hsl(265,75%,45%) 100%)"`.
`index.html:7`: `<meta name="theme-color" content="#7C3AED" />`.
Trocar todo `hsl(340` e `hsl(320` restantes em `main.css` e gradientes inline das views já migradas pelos equivalentes violeta (`265 70% 55%` / `265 75% 68%` no dark via tokens onde possível).

- [ ] **Step 4: Verificar Task 1**

Run: `npm run build 2>&1 | tail -n 3`
Expected: verde.

- [ ] **Step 5: Commit**

```bash
git add src/assets/main.css src/components/ProtegidaLogo.vue index.html src/views src/components
git commit -m "style: paleta violeta-ambar nos dois modos"
```

### Task 2: Evolução dos componentes

**Files:**
- Modify: `src/components/StatCard.vue`
- Modify: `src/components/SectionHeader.vue`

**Interfaces:**
- Consumes: tokens Task 1
- Produces: `StatCard[accentTop?: boolean]`, `SectionHeader` com slot `aside`

- [ ] **Step 1: StatCard accentTop**

No template, após `<div class="rounded-lg border border-border bg-card p-4">`, adicionar:
```vue
<div v-if="accentTop" class="h-1 -mx-4 -mt-4 mb-3 rounded-t-lg bg-primary" />
```
Props: `withDefaults(defineProps<{ label: string; value: string; delta?: string; trend?: number[]; accentTop?: boolean }>(), { delta: '', trend: () => [], accentTop: false })`.

- [ ] **Step 2: SectionHeader slot aside**

Ao lado do `<div class="flex gap-2"><slot name="actions" /></div>`, adicionar antes dele: `<div><slot name="aside" /></div>` (usado para CTA âmbar do molde Painel).

- [ ] **Step 3: Verificar Task 2**

Run: `npm run build 2>&1 | tail -n 3`
Expected: verde.

- [ ] **Step 4: Commit**

```bash
git add src/components/StatCard.vue src/components/SectionHeader.vue
git commit -m "feat: variantes accentTop e aside nos componentes"
```

### Task 3: Molde Painel (Dashboard, Relatorios, AgenteInicio)

**Files:**
- Modify: `src/views/DashboardView.vue`
- Modify: `src/views/RelatoriosView.vue`
- Modify: `src/views/AgenteInicioView.vue`

**Interfaces:**
- Consumes: `StatCard[accentTop]`, `SectionHeader[aside]`
- Produces: hero compacto + timeline de atividade; gráficos Relatorios em violeta/âmbar

- [ ] **Step 1: Hero + timeline**

Em cada view, após `SectionHeader`, hero compacto:
```vue
<div class="rounded-lg border border-border bg-card p-4 mb-4 flex items-center justify-between">
  <div><p class="font-bold text-lg">{{ saudacao }}</p><p class="text-sm text-muted-foreground">{{ hoje }}</p></div>
  <button class="rounded-lg bg-accent px-4 py-2 text-sm font-semibold" :style="{ color: 'hsl(var(--accent-foreground))' }">{{ ctaLabel }}</button>
</div>
```
`StatCard` com `accent-top`. Atividade recente em timeline:
```vue
<ul class="rounded-lg border border-border bg-card divide-y divide-border">
  <li v-for="e in eventos" :key="e.id" class="flex gap-3 p-4">
    <span class="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
    <div><p class="text-sm font-medium">{{ e.titulo }}</p><p class="text-xs text-muted-foreground">{{ e.quando }}</p></div>
  </li>
</ul>
```
Bloco IA do Dashboard preservado (estilos herdam tokens). Relatorios: cores de gráficos para `#8B5CF6` (violeta), `#F59E0B` (âmbar), neutros `hsl(var(--muted-foreground))`.

- [ ] **Step 2: Verificar Task 3**

Run: `npm run build 2>&1 | tail -n 3` + smoke dashboard/relatorios/inicio.
Expected: verde.

- [ ] **Step 3: Commit**

```bash
git add src/views/DashboardView.vue src/views/RelatoriosView.vue src/views/AgenteInicioView.vue
git commit -m "style: molde Painel em violeta-ambar"
```

### Task 4: Molde Tabela (Consulta, Contatos, HistoricoPanico, AgenteMonitoramento, RedeApoio)

**Files:**
- Modify: `src/views/ConsultaView.vue`
- Modify: `src/views/ContatosView.vue`
- Modify: `src/views/HistoricoPanicoView.vue`
- Modify: `src/views/AgenteMonitoramentoView.vue`
- Modify: `src/views/RedeApoioView.vue`

**Interfaces:**
- Consumes: `DataTable`, `EmptyState`
- Produces: toolbar com chips + selos de status + menu de ações

- [ ] **Step 1: Toolbar + selos + menu**

Toolbar padrão no topo de cada lista:
```vue
<div class="flex flex-wrap items-center gap-2 mb-4">
  <input v-model="busca" placeholder="Buscar..." class="input-enhanced !w-64" />
  <button v-for="f in filtros" :key="f" @click="filtroAtivo = f" :class="['rounded-full px-3 py-1 text-xs border', filtroAtivo === f ? 'bg-primary text-primary-foreground border-transparent' : 'border-border text-muted-foreground']">{{ f }}</button>
  <button @click="novo" class="rounded-lg px-3 py-1.5 text-xs font-semibold" :style="{ background: 'hsl(var(--accent))', color: 'hsl(var(--accent-foreground))' }">+ Novo</button>
</div>
```
Status em selo: `<span class="rounded-full px-2 py-0.5 text-xs" :class="classePorStatus(s.status)">{{ s.status }}</span>` com mapa `ativa→bg-primary/15 text-primary`, `pendente→bg-accent/15` + `style color accent-foreground`, demais semânticas. Ações de linha em `<details class="relative"><summary>•••</summary><div class="absolute right-0 rounded-lg border border-border bg-popover p-1 shadow-lg">…</div></details>`. Adaptar nomes (`busca`, `filtros`, `novo`) ao estado real de cada view; onde a view não tem filtro real, chips filtram client-side a lista carregada.

- [ ] **Step 2: Verificar Task 4**

Run: `npm run build 2>&1 | tail -n 3` + smoke das 5 listas.
Expected: verde.

- [ ] **Step 3: Commit**

```bash
git add src/views/ConsultaView.vue src/views/ContatosView.vue src/views/HistoricoPanicoView.vue src/views/AgenteMonitoramentoView.vue src/views/RedeApoioView.vue
git commit -m "style: molde Tabela em violeta-ambar"
```

### Task 5: Molde Formulário + públicas (Cadastro, Login, Aconselhamento, MedidaDetail, BoasVindas, NotFound)

**Files:**
- Modify: `src/views/CadastroView.vue`
- Modify: `src/views/LoginView.vue`
- Modify: `src/views/AconselhamentoView.vue`
- Modify: `src/views/MedidaDetailView.vue`
- Modify: `src/views/BoasVindasView.vue`
- Modify: `src/views/NotFoundView.vue`

**Interfaces:**
- Consumes: tokens Task 1
- Produces: wizard vertical, submit âmbar, hero violeta

- [ ] **Step 1: Wizard vertical + submit âmbar**

`CadastroView`: steps laterais verticais com conector `bg-primary`,submit `bg-accent` com `accent-foreground`. `LoginView`: seletor (vitima `bg-primary`, admin `bg-accent`, agente azul mantido), submit âmbar. `AconselhamentoView` + `MedidaDetailView` (bloco edição): cartão `max-w-2xl mx-auto`, submit âmbar. `BoasVindasView`: hero com overlay violeta profundo (`from-[#150a24]/85 via-[#1a0d2e]/60`), botão âmbar. `NotFoundView`: herda (só tokens).

- [ ] **Step 2: Verificar Task 5**

Run: `npm run build 2>&1 | tail -n 3` + smoke rotas.
Expected: verde.

- [ ] **Step 3: Commit**

```bash
git add src/views/CadastroView.vue src/views/LoginView.vue src/views/AconselhamentoView.vue src/views/MedidaDetailView.vue src/views/BoasVindasView.vue src/views/NotFoundView.vue
git commit -m "style: molde Formulario em violeta-ambar"
```

### Task 6: Molde Mapa (Mapa, Cercamento) + varredura final

**Files:**
- Modify: `src/views/MapaView.vue`
- Modify: `src/views/CercamentoView.vue`

**Interfaces:**
- Consumes: tudo anterior
- Produces: mapa full-bleed + painel flutuante; zero rosa no repo

- [ ] **Step 1: Painel flutuante**

```vue
<div class="relative h-[calc(100vh-8rem)] rounded-lg overflow-hidden border border-border">
  <div class="absolute inset-0"><!-- mapa leaflet existente --></div>
  <div class="absolute left-4 top-4 bottom-4 w-80 rounded-lg border border-border bg-card/95 backdrop-blur p-4 overflow-y-auto"><!-- filtros + lista --></div>
  <div class="absolute top-4 right-4 flex gap-2"><!-- StatCards compactos --></div>
</div>
```
Pins e semântica de alerta mantidos. Depois, varredura: `rg -i "340, ?75%|hsl\(275|285, 70%|pink|rose|fuchsia" src/` deve zerar (justificar exceção se houver).

- [ ] **Step 2: Verificar Task 6**

Run: `npm run build 2>&1 | tail -n 3` + `rg` zerado + smoke mapa/cercamento.
Expected: verde.

- [ ] **Step 3: Commit**

```bash
git add src/views/MapaView.vue src/views/CercamentoView.vue
git commit -m "style: molde Mapa em violeta-ambar"
```
