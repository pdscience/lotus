# Final Fix Report — wave final (UMA wave)

Base: `dfe821d` · Worktree: `.worktrees/protegida-rebrand`
Data: 2026-09-21

## Escopo (4 itens, todos feitos)

1. **BLOQUEANTE — Remover PNGs legados**
   - `git rm "src/assets/Logo AMPARE.png" "src/assets/AMPAREcapa.png" "src/assets/AMPAREcapa.jpeg" "src/assets/Tela limpa.png"`
   - Verificação prévia: `grep` por `AMPAREcapa|Logo AMPARE|Tela limpa` em `src/` → sem imports.
   - `ls src/assets` pós-remoção: só `main.css`.
   - `ls src/assets | grep -i ampare || echo "sem-legado"` → `sem-legado`.

2. **AbortError → mensagem amigável**
   - `src/services/iaAconselhamentoService.ts` (`gerarApoio`): `catch` mapeia
     `e instanceof DOMException && e.name === 'AbortError'` → `throw new Error('Tempo esgotado. Tente novamente em instantes.')`.
   - `AconselhamentoView.vue` (`enviarIa`) já propaga `e.message`, então exibe a mensagem sem alteração extra.

3. **Login lazy**
   - `src/views/LoginView.vue:69-73`: `loading="lazy"` adicionado na `img` remota (Unsplash) do background.
   - Hero `BoasVindas` mantido sem lazy (intocado).

4. **Logo na caixa rosa**
   - `src/views/AconselhamentoView.vue:568`: `<ProtegidaLogo size="sm" />` → `<ProtegidaLogo size="sm" variant="light" />` (texto branco sobre gradiente rosa).

## Fora de escopo (não mexido)
- `username → nome`: follow-up separado, intocado.

## Teste
- `npm run build 2>&1 | tail -n 5` → verde (`✓ built in 5.55s`).
- `ls src/assets | grep -i ampare || echo "sem-legado"` → `sem-legado`.

## Commit
- `fix: remove PNGs legados e polimentos finais`
