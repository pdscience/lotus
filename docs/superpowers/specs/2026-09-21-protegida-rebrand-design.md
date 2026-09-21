# Protegida — Rebrand AMPARE → Protegida + Fix + IA Aconselhamento

Data: 2026-09-21
Status: Aprovado (caminho A — incremental)
Origem: Projeto antigo `ampare-vue` renomeado para Protegida.

## 1. Contexto

- Stack: Vue 3 + TS + Vite + Tailwind 3 + Vue Router + Pinia + InsForge SDK + Leaflet + Lucide.
- 16 views em `src/views/`, layout em `src/components/AppLayout.vue`, serviços em `src/services/`.
- `index.html` já com `<title>Protegida</title>`, mas `src/` ainda com 20 ocorrências de AMPARE.
- Build quebrado: `vite build` falha com `ENOENT src/assets/Logo AMPARE.png` (importado por `AppLayout.vue`). Arquivos deletados no git status mas ainda referenciados:
  - `src/assets/Logo AMPARE.png`, `src/assets/AMPAREcapa.png`, `src/assets/AMPAREcapa.jpeg`
  - `public/ampare-logo.png`, `public/AMPAREcapa.png`, `public/CAPAAMPARE.jpeg`, `public/fingerprint-icon.svg`
  - Referências em `BoasVindasView.vue`, `LoginView.vue`, `DashboardView.vue`, `AconselhamentoView.vue`, `SplashScreen.vue` (`/ampare-logo.svg`), `LoginScreen.vue`.
- Tema atual: lilás/roxo `hsl(275,65%,65%)` em `src/assets/main.css` + `tailwind.config.js` (via CSS vars).
- Chaves antigas: `ampare-token`, `ampare-user`, `ampare-user-type`, `ampare-csrf-token` em `src/utils/api.ts`; `User-Agent: AmpareApp/1.0 (projeto_ampare)` em `geocodingService.ts`.

## 2. Decisões do usuário

- Cor: Rosa protetivo (rosa-magenta + roxo profundo).
- Apresentação: Manter estrutura da `BoasVindasView`, substituindo PNGs deletados por imagens da internet (Unsplash, hotlink com fallback para gradiente) + logo texto.
- Imagens: buscar na internet onde havia assets antigos (capa BoasVindas, logo, ilustrações login/dashboard).
- Renome: Completo (textos + `package.json` + `localStorage` + `User-Agent` + comentários).
- IA: Aconselhamento IA via InsForge Functions + OpenRouter, com fallback.
- Fixes: Build verde + revisão fluxos críticos (auth, pânico, medidas).

## 3. Abordagens consideradas

### A — Incremental + fix cirúrgico (escolhida)
Prós: reaproveita 90%+, baixo risco, build volta rápido, IA com fallback não trava.
Contras: não é redesign total.
### B — Redesign profundo + IA full
Prós: maior impacto. Contras: precisa logo/manual, secrets, mais testes, mais tempo/risco.
### C — Fix mínimo
Prós: mais rápido. Contras: não atende cores/apresentação/IA.

## 4. Design

### 4.1 Renome completo
- Trocar visível: `AMPARE` → `Protegida`, `Sistema AMPARE Medidas Protetivas e Ações Emergenciais` → `Sistema Protegida — Medidas Protetivas e Ações Emergenciais`, `Medida Protetiva - AMPARE` → `Medida Protetiva - Protegida`, footers, alts.
- Código: `package.json` `ampare-vue` → `protegida`; `CSRF_KEY ampare-csrf-token` → `protegida-csrf-token`; `localStorage ampare-token/user/user-type` → `protegida-*` com migração read-old/write-new + limpeza; `User-Agent AmpareApp/1.0 (projeto_ampare)` → `ProtegidaApp/1.0 (projeto_protegida)`.
- Arquivos alvo: `AppLayout.vue`, `LoginView.vue`, `DashboardView.vue`, `AconselhamentoView.vue`, `ConsultaView.vue`, `MedidaDetailView.vue`, `SplashScreen.vue`, `LoginScreen.vue`, `BoasVindasView.vue`, `utils/api.ts`, `services/geocodingService.ts`, `package.json`, `index.html` (theme-color `#9D5BD2` → rosa).
- Preservar rotas e nomes de tabelas InsForge (`contatos_anjo`, `medidas_protetivas`, `panic_records`, etc.).

### 4.2 Tema rosa protetivo
- `src/assets/main.css` `:root` + `.dark`:
  - `--primary: 340 75% 55%`, `--accent: 320 70% 60%`, `--ring: 340 75% 55%`
  - `background 340 20% 98%`, `secondary 340 20% 95%`, `muted 340 20% 96%`, `border 340 20% 88%`, `input 340 20% 94%`
  - Dark: `primary 340 70% 65%`, `accent 320 75% 70%`.
- Gradientes: `linear-gradient(135deg, hsl(340,75%,55%) 0%, hsl(320,70%,60%) 50%, hsl(280,65%,65%) 100%)` em `.btn-primary`, `.step-active`, botão BoasVindas.
- `tailwind.config.js` mantido (usa vars). `index.html` `theme-color` → `#E5486B` aprox.
- Critério: nenhum `hsl(275` restante em `main.css` / views inline.

### 4.3 Apresentação com imagens da internet + fallback
- Novo `src/components/ProtegidaLogo.vue` (ShieldCheck Lucide + texto `Protegida`, props `size`, `variant light|dark`) para header/sidebar/login — sem depender de PNG local.
- `BoasVindasView.vue`: trocar `<img AMPAREcapa>` por imagem remota (ex. Unsplash acolhimento/proteção, ex. `https://images.unsplash.com/photo-...?w=1920&q=80&auto=format&fit=crop`) com `onerror` escondendo img e mantendo fundo gradiente rosa→roxo-profundo. Botão Entrar com novo gradiente, footer mantido.
- `LoginView.vue` / `LoginScreen.vue` / `SplashScreen.vue`: trocar `/ampare-logo.svg` e `Logo AMPARE.png` por `<ProtegidaLogo>` + ilustração remota opcional no painel lateral (Unsplash) com `loading="lazy"` e fallback gradiente.
- `DashboardView.vue` / `AconselhamentoView.vue` / `AppLayout.vue`: trocar `<img Logo AMPARE>` por `<ProtegidaLogo>`; onde havia capa, usar imagem remota leve ou remover.
- Não recriar PNGs deletados; remover imports quebrados que causam `ENOENT`. `vite build` deve passar sem `ENOENT`.
- Critério: nenhuma `<img>` com 404; toda imagem remota tem `alt`, `onerror` fallback e overlay para legibilidade.

### 4.4 Correções build + fluxos
- Build: `npm run build` (`vue-tsc && vite build`) verde. Corrigir imports de assets, tipos TS que surgirem.
- Fluxos: `authService` + `userStore.init()` + `router.beforeEach` (admin→relatorios, agente→inicio, vítima→dashboard, `meta.roles`); `panicService` criar/listar; `medidaService`/`medidaVitimaService` consulta/detalhe. Sem mudar API InsForge.
- Verificação: `npm run build`, smoke `npm run dev`, navegação BoasVindas→Login→Dashboard, checar console sem 404 de assets.

### 4.5 IA Aconselhamento (base + UI com fallback)
- Novo `src/services/iaAconselhamentoService.ts`: `isConfigured()`, `gerarApoio(prompt)` via InsForge Function (OpenRouter), timeout + erro amigável, nunca expõe chave no frontend.
- `AconselhamentoView.vue`: seção opt-in "Apoio com IA", textarea + botão, disclaimer "não substitui ajuda profissional; em risco ligue 180/190", fallback exibe conteúdo atual se `!isConfigured()`.
- Fora do escopo agora: criar Function, secrets, RLS, analytics. Apenas preparar chamada + UI.
- Privacidade: não enviar PII desnecessária; log mínimo.

## 5. Testes / Aceite
- `npm run build` passa sem ENOENT.
- `rg -i ampare src public index.html package.json` retorna 0 (exceto migração legada e este spec).
- Smoke manual: BoasVindas renderiza sem imagem quebrada; Login; Dashboard por perfil; pânico cria registro; medida abre detalhe.
- IA sem config: UI mostra fallback, sem exceção.

## 6. Riscos
- `localStorage` antiga: mitigado com migração read-old uma vez.
- Usuários esperam logo antiga: mitigado com logo texto + Shield, sem PNG.
- IA sem backend: mitigado com `isConfigured()` + fallback.

## Self-review
- Sem TBD/TODO: escopo fechado em arquivos-alvo e valores HSL.
- Consistência: rotas e tabelas preservadas; rename não quebra API.
- Escopo: cabe em um plano (rebrand + fix + base IA); Function IA full fica para próximo ciclo.
- Sem ambiguidade: valores de cor, componente logo e critérios de aceite explícitos.
