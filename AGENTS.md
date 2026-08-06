# AGENTS.md - Projeto AMPARE Vue

## Commands

```bash
npm run dev      # Start dev server (opens browser)
npm run build   # Typecheck + build (vue-tsc && vite build)
npm run preview # Preview production build
```

## Tech Stack

- **Vue 3** + TypeScript + Vite
- **Tailwind CSS** (custom theme in `tailwind.config.js` - animations, colors, fonts)
- **Vue Router** for navigation
- **InsForge** for backend (Auth, Database, Storage)
- **Leaflet** for maps
- **Lucide Vue** for icons

## Project Structure

```
src/
├── components/     # Reusable UI components
├── views/         # Page components (LoginView, DashboardView, etc.)
├── services/       # API services (authService, panicService, etc.)
├── lib/          # Supabase/InsForge client
├── router/       # Vue Router config
├── assets/        # Static assets & CSS
├── stores/       # Pinia stores
├── composables/  # Vue composables
├── utils/        # Utility functions
├── types/        # TypeScript types
├── App.vue       # Root component
└── main.ts      # Entry point
```

## Important Configs

- **Path alias**: `@` maps to `src/`
- **Build runs typecheck** before bundling (no separate lint/typecheck scripts)
- **No test framework** configured
- **InsForge**: Backend as a Service - see below

## Common Patterns

- Services use InsForge SDK (supabase client)
- Views use `<script setup>` with TypeScript
- Tailwind: use custom colors (`primary`, `secondary`, `success`, etc.) from config

## InsForge Backend

### Configuração

- **Project**: Ampare
- **Project ID**: 79b7572c-4e5f-4969-9a9c-5d55744bb56b
- **App Key**: 4c5r57fe
- **Region**: us-east
- **OSS Host**: https://4c5r57fe.us-east.insforge.app

### Environment Variables

```bash
VITE_INSFORGE_URL=https://4c5r57fe.us-east.insforge.app
VITE_INSFORGE_ANON_KEY=<chave_anonima>
```

### Database Tables

- `contatos_anjo` - Contatos de emergência
- `medidas_protetivas` - Medidas protetivas
- `panic_records` - Registros de pânico
- `rede_apoio` - Rede de apoio (ONGs, abrigos, delegacias)
- `aconselhamentos` - Registros de aconselhamento

### Comandos Úteis

```bash
# Verificar projeto atual
npx @insforge/cli current

# Ver tabelas
npx @insforge/cli db tables

# Query SQL
npx @insforge/cli db query "SELECT * FROM contatos_anjo"

# Verificar migrations
npx @insforge/cli db migrations list

# Deploy frontend
npx @insforge/cli deployments deploy .

# Ver logs
npx @insforge/cli logs function.logs
```

### Autenticação

O sistema usa autenticação do InsForge:
- OAuth (GitHub, Google)
- Email/Password com verificação
- JWT tokens automáticos