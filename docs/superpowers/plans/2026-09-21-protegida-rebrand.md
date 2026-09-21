# Protegida Rebrand Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Renomear AMPARE para Protegida, trocar tema para rosa protetivo, corrigir build quebrado por PNGs deletados usando imagens da internet com fallback, e adicionar base IA no Aconselhamento.

**Architecture:** Rebrand incremental: componente `ProtegidaLogo.vue` substitui PNGs, CSS vars trocam lilás por rosa-magenta, migração `ampare-*` para `protegida-*` com leitura legada, serviço IA isolado com `isConfigured()` e fallback na UI.

**Tech Stack:** Vue 3 + TypeScript + Vite 5 + Tailwind 3 + Vue Router 4 + Pinia + InsForge SDK + Lucide

**Spec:** `docs/superpowers/specs/2026-09-21-protegida-rebrand-design.md`

## Global Constraints

- Preservar rotas em `src/router/index.ts` e tabelas InsForge (`contatos_anjo`, `medidas_protetivas`, `panic_records`, `rede_apoio`, `aconselhamentos`).
- Nenhum `hsl(275` restante em `src/assets/main.css` ou gradientes inline após Task 2.
- `rg -i ampare src public index.html package.json` deve retornar 0 exceto migração legada e spec.
- Toda imagem remota deve ter `alt`, `loading="lazy"` (exceto hero), `onerror` fallback e overlay para legibilidade.
- IA nunca expõe chave no frontend; UI mostra disclaimer 180/190.
- Verificação padrão: `npm run build` verde.

---

### Task 1: ProtegidaLogo + BoasVindas com imagem da internet

**Files:**
- Create: `src/components/ProtegidaLogo.vue`
- Modify: `src/views/BoasVindasView.vue:1-39`
- Modify: `src/components/AppLayout.vue:94-100`
- Modify: `src/components/SplashScreen.vue:20-35`
- Modify: `src/components/LoginScreen.vue:45-60`

**Interfaces:**
- Consumes: `lucide-vue-next` `ShieldCheck`
- Produces: `<ProtegidaLogo :size="'md'" variant="light|dark" />` com props `size: 'sm|md|lg'`, `variant: 'light|dark'`

- [ ] **Step 1: Criar componente ProtegidaLogo**

```vue
<script setup lang="ts">
import { ShieldCheck } from 'lucide-vue-next'
withDefaults(defineProps<{ size?: 'sm' | 'md' | 'lg'; variant?: 'light' | 'dark' }>(), {
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
      :class="sizes[size].box"
      style="background: linear-gradient(135deg, hsl(340,75%,55%) 0%, hsl(320,70%,60%) 50%, hsl(280,65%,65%) 100%)"
    >
      <ShieldCheck :class="sizes[size].icon" />
    </div>
    <span
      class="font-heading font-bold tracking-tight"
      :class="[sizes[size].text, variant === 'light' ? 'text-white' : 'text-foreground']"
    >Protegida</span>
  </div>
</template>
```

- [ ] **Step 2: Reescrever BoasVindasView com imagem remota + fallback**

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { LogIn, ShieldCheck } from 'lucide-vue-next'
const router = useRouter()
const imgOk = ref(true)
const goToLogin = () => router.push('/login')
const capaUrl = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1920&q=80&auto=format&fit=crop'
</script>
<template>
  <div class="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-rose-700 via-pink-600 to-purple-900">
    <div class="absolute inset-0">
      <img
        v-if="imgOk"
        :src="capaUrl"
        alt="Mulheres em rede de apoio - Protegida"
        class="w-full h-full object-cover"
        @error="imgOk = false"
      />
      <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-rose-900/40 to-purple-900/30"></div>
    </div>
    <div class="absolute top-6 left-6 z-20 flex items-center gap-3 text-white">
      <div class="w-11 h-11 rounded-xl flex items-center justify-center bg-white/20 backdrop-blur">
        <ShieldCheck class="w-6 h-6" />
      </div>
      <span class="font-heading font-bold text-2xl">Protegida</span>
    </div>
    <div class="absolute top-6 right-6 z-20">
      <button
        @click="goToLogin"
        class="group inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow-2xl transition-all duration-300 hover:scale-105 active:scale-95"
        style="background: linear-gradient(135deg, hsl(340,75%,55%) 0%, hsl(320,70%,60%) 50%, hsl(280,65%,65%) 100%)"
      >
        <LogIn class="w-5 h-5 transition-transform group-hover:translate-x-1" />
        Entrar no Sistema
      </button>
    </div>
    <p class="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 text-xs text-white/80 text-center whitespace-nowrap">
      Sistema seguro para registro e consulta de medidas protetivas de urgência
    </p>
  </div>
</template>
```

- [ ] **Step 3: Trocar logo no AppLayout sidebar**

Substituir em `src/components/AppLayout.vue:94-100`:
```vue
<div class="p-4 border-b border-border/30">
  <router-link to="/dashboard" class="flex items-center justify-center hover:scale-105 transition-transform">
    <ProtegidaLogo size="sm" />
  </router-link>
</div>
```
Adicionar no `<script setup>`: `import ProtegidaLogo from './ProtegidaLogo.vue'`

- [ ] **Step 4: Verificar Task 1**

Run: `npm run build 2>&1 | head -n 60`
Expected: ainda falha por outros PNGs (LoginView etc.), mas sem erro em `BoasVindasView.vue` ou `AppLayout.vue` sidebar.

- [ ] **Step 5: Commit**

```bash
git add src/components/ProtegidaLogo.vue src/views/BoasVindasView.vue src/components/AppLayout.vue
git commit -m "feat: adiciona ProtegidaLogo e capa remota na BoasVindas"
```

### Task 2: Tema rosa protetivo

**Files:**
- Modify: `src/assets/main.css:8-36`
- Modify: `src/assets/main.css:145-162`
- Modify: `index.html:7`

**Interfaces:**
- Consumes: CSS vars Tailwind existentes
- Produces: `--primary: 340 75% 55%`, `--accent: 320 70% 60%` visíveis em botões e gradientes

- [ ] **Step 1: Trocar vars light em main.css**

Substituir bloco `:root` linhas 10-34 por:
```css
--background: 340 20% 98%;
--foreground: 240 20% 12%;
--card: 0 0% 100%;
--card-foreground: 240 20% 12%;
--popover: 0 0% 100%;
--popover-foreground: 240 20% 12%;
--primary: 340 75% 55%;
--primary-foreground: 0 0% 100%;
--secondary: 340 20% 95%;
--secondary-foreground: 240 20% 12%;
--muted: 340 20% 96%;
--muted-foreground: 240 15% 45%;
--accent: 320 70% 60%;
--accent-foreground: 0 0% 100%;
--destructive: 0 84% 60%;
--destructive-foreground: 0 0% 100%;
--warning: 38 92% 50%;
--warning-foreground: 0 0% 100%;
--success: 142 76% 36%;
--success-foreground: 0 0% 100%;
--info: 217 91% 60%;
--info-foreground: 0 0% 100%;
--border: 340 20% 88%;
--input: 340 20% 94%;
--ring: 340 75% 55%;
--radius: 0.75rem;
```

- [ ] **Step 2: Trocar dark + gradientes**

Dark: `--primary: 340 70% 65%; --accent: 320 75% 70%; --ring: 340 70% 65%;`
Trocar todo `hsl(275, 65%, 65%)` por `hsl(340, 75%, 55%)`, `hsl(285, 70%, 70%)` por `hsl(320, 70%, 60%)`, `hsl(295, 75%, 75%)` por `hsl(280, 65%, 65%)` em `.step-active`, `.btn-primary`, `.animate-shimmer`.

- [ ] **Step 3: Trocar theme-color**

Em `index.html:7`: `<meta name="theme-color" content="#E5486B" />`

- [ ] **Step 4: Verificar Task 2**

Run: `rg -n "275, 65%|285, 70%" src/assets/main.css src/views/BoasVindasView.vue || echo "sem-lilas"`
Expected: `sem-lilas`

- [ ] **Step 5: Commit**

```bash
git add src/assets/main.css index.html
git commit -m "style: aplica tema rosa protetivo"
```

### Task 3: Renome completo AMPARE → Protegida

**Files:**
- Modify: `package.json:2`
- Modify: `src/utils/api.ts:9,47,75-76`
- Modify: `src/services/geocodingService.ts:19,63`
- Modify: `src/components/AppLayout.vue:165`
- Modify: `src/views/LoginView.vue:78,209`
- Modify: `src/views/DashboardView.vue:224`
- Modify: `src/views/MedidaDetailView.vue:173`
- Modify: `src/views/ConsultaView.vue:126`
- Modify: `src/components/SplashScreen.vue:27-28`
- Modify: `src/components/LoginScreen.vue:53-54`
- Modify: `src/views/AconselhamentoView.vue:543`

**Interfaces:**
- Consumes: `localStorage` chaves antigas
- Produces: chaves `protegida-*` com migração automática

- [ ] **Step 1: package.json + User-Agent**

`package.json`: `"name": "protegida",`
`geocodingService.ts` ambas ocorrências: `'User-Agent': 'ProtegidaApp/1.0 (projeto_protegida)'`

- [ ] **Step 2: Migração localStorage em api.ts**

```ts
const CSRF_KEY = 'protegida-csrf-token'
const LEGACY_CSRF_KEY = 'ampare-csrf-token'
const TOKEN_KEY = 'protegida-token'
const LEGACY_TOKEN_KEY = 'ampare-token'

function migrate(key: string, legacy: string): void {
  const v = localStorage.getItem(legacy)
  if (v && !localStorage.getItem(key)) localStorage.setItem(key, v)
  if (v) localStorage.removeItem(legacy)
}
migrate(TOKEN_KEY, LEGACY_TOKEN_KEY)
migrate(CSRF_KEY, LEGACY_CSRF_KEY)

export function getCSRFToken(): string {
  let token = localStorage.getItem(CSRF_KEY)
  if (!token) {
    token = generateCSRFToken()
    localStorage.setItem(CSRF_KEY, token)
  }
  return token
}
```
Interceptor request usa `localStorage.getItem('protegida-token')`; bloco 401 remove `protegida-user`, `protegida-user-type`.

- [ ] **Step 3: Trocar textos visíveis**

- `AppLayout.vue:165`: `Sistema Protegida — Medidas Protetivas e Ações Emergenciais`
- `LoginView.vue:78`: `<ProtegidaLogo size="md" />` no lugar do `<img>`; `:209`: `&copy; 2026 Protegida. Todos os direitos reservados.`
- `DashboardView.vue:224`: `<ProtegidaLogo size="sm" />`
- `MedidaDetailView.vue:173`: `title: 'Medida Protetiva - Protegida',`
- `ConsultaView.vue:126`: `<p>Sistema Protegida - Acesso a Medidas Protetivas e Ações de Resposta Emergenciais</p>`
- `AconselhamentoView.vue:543`: `<ProtegidaLogo size="sm" />`
- `SplashScreen.vue`, `LoginScreen.vue`: trocar `src="/ampare-logo.svg" alt="AMPARE"` por `<ProtegidaLogo size="lg" variant="light" />`
- `LoginView.vue:68-72`: trocar `<img src="@/assets/Tela limpa.png">` por imagem remota `https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=1200&q=80&auto=format&fit=crop` com `@error` escondendo.

- [ ] **Step 4: Verificar Task 3**

Run: `rg -i ampare src public index.html package.json || echo "sem-ampare"`
Expected: `sem-ampare` ou apenas linhas de migração `LEGACY_*` / `ampare-` dentro de `api.ts` como compat.

- [ ] **Step 5: Commit**

```bash
git add package.json src/utils/api.ts src/services/geocodingService.ts src/components/AppLayout.vue src/views/LoginView.vue src/views/DashboardView.vue src/views/MedidaDetailView.vue src/views/ConsultaView.vue src/components/SplashScreen.vue src/components/LoginScreen.vue src/views/AconselhamentoView.vue
git commit -m "refactor: renomeia AMPARE para Protegida com migracao de chaves"
```

### Task 4: Build verde + fluxos críticos

**Files:**
- Modify: `src/views/LoginView.vue`, `src/components/AppLayout.vue`, `src/services/authService.ts`, `src/services/panicService.ts`, `src/services/medidaService.ts` (apenas se typecheck apontar)
- Test: build + smoke manual

**Interfaces:**
- Consumes: Tasks 1-3 prontas
- Produces: `npm run build` verde

- [ ] **Step 1: Rodar typecheck e anotar erros**

Run: `npm run build 2>&1 | head -n 120`
Expected: lista de `ENOENT` ou erros `vue-tsc`. Corrigir cada import de `@/assets/Logo AMPARE.png`, `@/assets/AMPAREcapa.png`, `@/assets/Tela limpa.png` removendo `<img>` e usando `ProtegidaLogo` ou URL remota.

- [ ] **Step 2: Revisar guards de rota**

Ler `src/router/index.ts:107-143` e garantir: sem usuário → `/login`; `/login` com usuário redireciona por `tipo`; `meta.roles` bloqueia sem permissão. Sem mudança de lógica, apenas confirmar que `userStore.init()` ainda usa chaves novas.

- [ ] **Step 3: Smoke fluxos**

Run: `npm run build`
Expected: `✓ built in` sem erro.
Manual: `npm run dev`, abrir `/`, `/login`, `/dashboard` (vitima/admin/agente), criar pânico, abrir `medida/:id`. Checar console sem 404.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "fix: build verde e revisao fluxos auth panico medidas"
```

### Task 5: IA Aconselhamento base + UI fallback

**Files:**
- Create: `src/services/iaAconselhamentoService.ts`
- Modify: `src/views/AconselhamentoView.vue`

**Interfaces:**
- Consumes: `VITE_IA_FUNCTION_URL` opcional, `fetch`
- Produces: `isConfigured(): boolean`, `gerarApoio(prompt: string): Promise<string>`

- [ ] **Step 1: Criar serviço IA**

```ts
export function isConfigured(): boolean {
  return Boolean(import.meta.env.VITE_IA_FUNCTION_URL)
}

export async function gerarApoio(prompt: string): Promise<string> {
  const url = import.meta.env.VITE_IA_FUNCTION_URL as string | undefined
  if (!url) throw new Error('IA não configurada')
  const ctrl = new AbortController()
  const t = setTimeout(() => ctrl.abort(), 20000)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: prompt.slice(0, 2000) }),
      signal: ctrl.signal
    })
    if (!res.ok) throw new Error('Falha na IA')
    const data = await res.json() as { texto?: string }
    return data.texto ?? 'Respire com calma. Você não está sozinha. Procure sua rede de apoio.'
  } finally {
    clearTimeout(t)
  }
}
```

- [ ] **Step 2: UI opt-in na AconselhamentoView**

Adicionar no topo da view (antes do conteúdo atual):
```vue
<script setup lang="ts">
import { ref } from 'vue'
import { isConfigured, gerarApoio } from '../services/iaAconselhamentoService'
const promptIa = ref('')
const respostaIa = ref('')
const loadingIa = ref(false)
const erroIa = ref('')
const iaAtiva = isConfigured()
const enviarIa = async () => {
  erroIa.value = ''
  respostaIa.value = ''
  if (!promptIa.value.trim()) { erroIa.value = 'Escreva como você está se sentindo.'; return }
  loadingIa.value = true
  try { respostaIa.value = await gerarApoio(promptIa.value) }
  catch (e: any) { erroIa.value = e.message || 'Não foi possível gerar apoio agora.' }
  finally { loadingIa.value = false }
}
</script>
<template>
  <div v-if="iaAtiva" class="mb-6 p-4 rounded-xl border border-border bg-card">
    <p class="font-semibold mb-1">Apoio com IA (opcional)</p>
    <p class="text-xs text-muted-foreground mb-3">Não substitui ajuda profissional. Em risco imediato ligue 180 ou 190.</p>
    <textarea v-model="promptIa" rows="3" placeholder="Como você está se sentindo?" class="w-full input-enhanced"></textarea>
    <button @click="enviarIa" :disabled="loadingIa" class="btn-primary mt-3">{{ loadingIa ? 'Gerando...' : 'Receber apoio' }}</button>
    <p v-if="erroIa" class="text-sm text-destructive mt-2">{{ erroIa }}</p>
    <p v-if="respostaIa" class="text-sm mt-2 whitespace-pre-wrap">{{ respostaIa }}</p>
  </div>
</template>
```
Manter todo conteúdo atual abaixo como fallback quando `!iaAtiva`.

- [ ] **Step 3: Verificar Task 5**

Run: `npm run build 2>&1 | tail -n 20`
Expected: build verde; sem `VITE_IA_FUNCTION_URL` a view renderiza conteúdo antigo sem erro.

- [ ] **Step 4: Commit**

```bash
git add src/services/iaAconselhamentoService.ts src/views/AconselhamentoView.vue
git commit -m "feat: base IA aconselhamento com fallback"
```
