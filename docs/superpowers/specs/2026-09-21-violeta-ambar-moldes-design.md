# Protegida — Re-paleta Violeta + Âmbar e Moldes por Página

Data: 2026-09-21
Status: Aprovado (caminho A — re-paleta + 4 moldes, 3 lotes)
Motivo: rejeição às combinações rosa (light) e rosada (dark); pedido de layouts distintos por página.

## 1. Paleta (substitui o rosa por completo)

- Primário violeta: light `265 70% 55%`, dark `265 75% 68%`. `--ring` acompanha.
- Âmbar prestígio/CTA: `38 95% 52%` (light e dark), `--accent`. Uso restrito: submit primário, selos de destaque, indicadores live.
- Dark: fundo ametista `265 22% 8%`, card `265 16% 11%`, popover `265 16% 13%`, borda `265 14% 19%`, texto `265 15% 93%`.
- Light: fundo marfim `40 30% 97%`, card branco `0 0% 100%`, texto `265 25% 14%`, borda `40 20% 88%`.
- Semânticas inalteradas (success/warning/destructive/info).
- Critério: `rg -i "340, ?75%|hsl\(275|285, 70%|pink|rose|fuchsia" src/` zerado (exceto `rose` em classe funcional justificada).

## 2. Molde Painel (Dashboard, Relatorios, AgenteInicio)

- Hero compacto: saudação + data + CTA primário âmbar à direita.
- Bento de `StatCard` com faixa superior violeta (variante `accent-top`).
- Atividade recente em timeline vertical com dot violeta (substitui lista `divide-y`).
- Relatorios mantém gráficos clássicos com paleta violeta/âmbar/neutros.

## 3. Molde Tabela (Consulta, Contatos, HistoricoPanico, AgenteMonitoramento, RedeApoio)

- Toolbar: busca + filtros em chips + botão primário.
- `DataTable` densa 44px, coluna status em selo (violeta info, âmbar atenção, semânticas).
- Ações de linha em menu compacto (três pontos) no desktop; botões inline no mobile.
- `EmptyState` ilustrado com CTA por contexto.

## 4. Molde Formulário (Cadastro, Login, Aconselhamento, BoasVindas-CTA)

- Cartão central max-w-2xl, steps verticais à esquerda (wizard) com conector violeta.
- Submit primário âmbar (`bg-accent text-black` aprox. via token).
- Login mantém seletor de tipo (vitima violeta, admin âmbar, agente azul).
- `MedidaDetailView`: leitura em seções + bloco edição segue molde formulário.

## 5. Molde Mapa (Mapa, Cercamento)

- Mapa full-bleed com painel flutuante lateral (`bg-card/95 backdrop-blur`), legenda em chips, StatCards sobrepostos no topo.
- Pins e cores funcionais de alerta mantidos (semântica de segurança).

## 6. Componentes (evolução, sem breaking desnecessário)

- `StatCard`: prop `accentTop?: boolean` (faixa violeta).
- `ProtegidaLogo`: selo em gradiente violeta→violeta-profundo; `mono` mantido.
- `SectionHeader`: slot `aside` para CTA âmbar do molde Painel.
- `ThemeToggle`, `DataTable`, `EmptyState`: inalterados salvo tokens.

## 7. Aplicação em lotes + aceite

- Lote 1: tokens + shell + públicas. Lote 2: vítima. Lote 3: admin/agente.
- Build verde + smoke por lote; toggle sem flash; contraste AA; `prefers-reduced-motion` preservado.
- Rotas, guards, tabelas, nomes e ordem das páginas inalterados.
- Fora de escopo: command palette, libs de chart, wirar filtro Data (feature futura).

## Self-review

- Sem TBD; valores HSL e arquivos explícitos.
- Consistência: rosa some dos dois modos; moldes cobrem as 16 views (Mapa/Cercamento no molde Mapa; demais mapeadas).
- Escopo: 1 spec, 3 lotes.
- Sem ambiguidade: âmbar só em CTA/destaque; violeta como primário.
