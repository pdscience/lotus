# Protegida — Redesign Dark Premium (diferenciação do concorrente)

Data: 2026-09-21
Status: Aprovado (caminho A — design system + lotes)
Referências: Linear (dark-first quieto), Stripe (tabelas), Mercury (polimento), Supabase (wayfinding), tendências 2026 (dark-first, quiet chrome, tabelas primárias, IA nativa).

## 1. Problema

Concorrente com mesmo layout, mesma sequência e mesmos nomes de páginas. Tema claro atual (cards + gradientes rosa) é genérico e copiável. Diferenciar com linguagem visual própria premium sem mudar nomes/fluxos que as usuárias conhecem.

## 2. Decisões

- Direção: dark-first premium (não glass total).
- Escopo: 16 views + shell, em 3 lotes entregáveis.
- Estrutura: sidebar colapsável, tabelas densas, bento, sparklines, empty states com CTA, IA como superfície nativa.

## 3. Fundação dark-first

- `useTheme` (`src/composables/useTheme.ts`): `theme: 'dark' | 'light'`, default dark, persiste `protegida-theme`, respeita `prefers-color-scheme` na 1ª visita, script inline no `index.html` anti-flash.
- Tokens em `src/assets/main.css`: canvas dark `#0e0e13` rosado (`--background: 340 12% 7%`), painéis `--card: 340 10% 10%` quase opacos, bordas 1px `--border: 340 10% 18%`, raio `--radius: 0.5rem`.
- Rosa `340 75% 55%` só como acento (ações primárias, indicadores live). Semânticas: success/warning/destructive/info para estado. Números com `font-variant-numeric: tabular-nums`.
- Claro mantido como secundário (toggle), herdando estrutura de tokens.
- `prefers-reduced-motion: reduce` zera animações (já existe, preservar).

## 4. Shell (`AppLayout.vue`)

- Sidebar colapsável (ícones, `localStorage protegida-sidebar`), topbar mínima (toggle tema, avatar, contexto da seção).
- Conteúdo: padding 16px, tabelas com linhas 44px, header de seção via `SectionHeader`.
- `ProtegidaLogo`: variante `mono` (branco sobre dark) além de `light|dark`.
- Rotas, guards e sequência de páginas inalterados.

## 5. Componentes novos (`src/components/`)

- `StatCard.vue`: 1 métrica primária + delta + sparkline (SVG inline, sem lib nova). Props: `label, value, delta, trend: number[]`.
- `DataTable.vue`: tabela densa genérica (colunas via slots, hover, linha 44px, empty slot).
- `EmptyState.vue`: ícone Lucide + título + descrição + CTA. Props: `icon, title, description, actionLabel`. Nunca tela vazia.
- `SectionHeader.vue`: título + descrição + slot de ações.
- `ThemeToggle.vue`: sol/lua, usa `useTheme`.
- Substituem `card-enhanced` decorativo e KPI multicoloridos (1 acento só).

## 6. Views por lote (nomes e ordem mantidos)

- Lote 1 (públicas): `BoasVindasView` (dark + overlay profundo + mesma estrutura), `LoginView` (painel opaco, logo mono), `NotFoundView`.
- Lote 2 (vítima): `DashboardView` (bento: resumo IA + StatCards + atividade recente), `CercamentoView`, `ContatosView` (DataTable), `RedeApoioView` (DataTable + mapa), `AconselhamentoView` (IA preservada), `HistoricoPanicoView` (tabela + tendência).
- Lote 3 (admin/agente): `RelatoriosView` (KPIs + gráficos clássicos: linha/barra/donut ≤3 fatias), `CadastroView`, `ConsultaView` (tabela primária), `MapaView`, `MedidaDetailView` (+ sugestões IA), `AgenteInicioView`, `AgenteMonitoramentoView` (DataTable densa).
- Gráficos: SVG/sparkline próprios; sem nova lib (YAGNI). Tabelas são a interface primária.

## 7. IA nativa

- `DashboardView`: faixa "Resumo da situação" via `iaAconselhamentoService` (fallback silencioso sem `VITE_IA_FUNCTION_URL`).
- `MedidaDetailView`: "Sugestões de ação" (mesmo serviço, opt-in).
- Sem chat flutuante. Disclaimer 180/190 mantido.

## 8. Aceite

- `npm run build` verde por lote + smoke das rotas do lote.
- Toggle sem flash (teste: recarregar em dark e light).
- Contraste AA em dados; `rg -i "hsl\(275|285, 70%" src` zerado; nenhum card multicolorido restante.
- Fora de escopo: command palette, drag-and-drop de widgets, nova lib de charts, mudar nomes/ordem das páginas.

## Self-review

- Sem TBD: arquivos, props e valores explícitos.
- Consistência: rotas/guards/tabelas preservados; dark default com claro secundário (sem contradição).
- Escopo: 1 spec, implementação em 3 lotes (cada lote vira task-grupo no plano).
- Sem ambiguidade: acento único rosa, density 44px/16px, IA só com fallback.
