-- Fix RLS policies: replace auth.users references with user_roles lookup table
-- Problem: anon/authenticated roles have no SELECT on auth.users, so policies
-- that check users.metadata ->> 'tipo' via auth.users fail with 403.

-- 0. Add lat/lng columns to medidas_protetivas
ALTER TABLE medidas_protetivas ADD COLUMN IF NOT EXISTS latitude_vitima double precision;
ALTER TABLE medidas_protetivas ADD COLUMN IF NOT EXISTS longitude_vitima double precision;
ALTER TABLE medidas_protetivas ADD COLUMN IF NOT EXISTS latitude_agressor double precision;
ALTER TABLE medidas_protetivas ADD COLUMN IF NOT EXISTS longitude_agressor double precision;

-- 1. Create user_roles table to store tipo per user
CREATE TABLE IF NOT EXISTS public.user_roles (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo text NOT NULL DEFAULT 'vitima',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read their own role
CREATE POLICY user_roles_own_select ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

GRANT SELECT ON public.user_roles TO anon, authenticated;

-- 2. Seed roles for existing users (only where the user exists — safe on fresh projects)
INSERT INTO public.user_roles (user_id, tipo)
SELECT v.user_id::uuid, v.tipo
FROM (VALUES
  ('0fc678a2-fc82-4e84-9951-10a5589798dc', 'admin'),
  ('aa47fb2f-3040-4172-a434-69bf6ecc7fbd', 'agente'),
  ('f0b93dae-4e22-40b7-bb55-6f992eb8efc2', 'vitima')
) AS v(user_id, tipo)
WHERE EXISTS (SELECT 1 FROM auth.users u WHERE u.id = v.user_id::uuid)
ON CONFLICT (user_id) DO UPDATE SET tipo = EXCLUDED.tipo;

-- 2b. agente_monitoramento table (used by src/services/agenteService.ts; created here if missing)
CREATE TABLE IF NOT EXISTS public.agente_monitoramento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agente_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vitima_nome TEXT,
  vitima_cpf TEXT,
  vitima_telefone TEXT,
  vitima_endereco TEXT,
  agressor_nome TEXT,
  agressor_cpf TEXT,
  agressor_telefone TEXT,
  agressor_endereco TEXT,
  medida_id UUID,
  numero_processo TEXT,
  data_monitoramento DATE,
  hora TEXT,
  condicao_vitima TEXT,
  situacao_monitorada TEXT,
  localizacao_verificada TEXT,
  restricao_respeitada TEXT,
  observacoes TEXT,
  risco TEXT,
  encaminhamentos TEXT,
  status_visita TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status_visita IN ('pendente', 'visitada', 'nao_visitada', 'agendada')),
  status_patrulha TEXT NOT NULL DEFAULT 'pendente'
    CHECK (status_patrulha IN ('pendente', 'em_deslocamento', 'no_local', 'concluido', 'nao_foi_possivel')),
  ultima_atualizacao TIMESTAMPTZ DEFAULT NOW(),
  obs_patrulha TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.agente_monitoramento ENABLE ROW LEVEL SECURITY;

-- 3. Recreate all policies that referenced auth.users

-- medidas_protetivas
DROP POLICY IF EXISTS agent_medidas_select ON public.medidas_protetivas;
CREATE POLICY agent_medidas_select ON public.medidas_protetivas
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.tipo IN ('admin', 'agente')));

-- agente_monitoramento
DROP POLICY IF EXISTS agent_monitor_select ON public.agente_monitoramento;
DROP POLICY IF EXISTS agent_monitor_insert ON public.agente_monitoramento;
DROP POLICY IF EXISTS agent_monitor_update ON public.agente_monitoramento;
DROP POLICY IF EXISTS agent_monitor_delete ON public.agente_monitoramento;

CREATE POLICY agent_monitor_select ON public.agente_monitoramento
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.tipo IN ('admin', 'agente')));
CREATE POLICY agent_monitor_insert ON public.agente_monitoramento
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.tipo IN ('admin', 'agente')));
CREATE POLICY agent_monitor_update ON public.agente_monitoramento
  FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.tipo IN ('admin', 'agente')))
  WITH CHECK (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.tipo IN ('admin', 'agente')));
CREATE POLICY agent_monitor_delete ON public.agente_monitoramento
  FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.tipo IN ('admin', 'agente')));

-- rede_apoio
DROP POLICY IF EXISTS "Admin can manage rede apoio" ON public.rede_apoio;
CREATE POLICY "Admin can manage rede apoio" ON public.rede_apoio
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.tipo = 'admin'));

DROP POLICY IF EXISTS agent_rede_apio_manage ON public.rede_apoio;
CREATE POLICY agent_rede_apio_manage ON public.rede_apoio
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.tipo IN ('admin', 'agente')));

-- usuarios
DROP POLICY IF EXISTS "Admin pode fazer tudo com usuários" ON public.usuarios;
CREATE POLICY "Admin pode fazer tudo com usuarios" ON public.usuarios
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.tipo = 'admin'));

DROP POLICY IF EXISTS agent_usuarios_select ON public.usuarios;
CREATE POLICY agent_usuarios_select ON public.usuarios
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.tipo IN ('admin', 'agente')));

-- contatos_anjo
DROP POLICY IF EXISTS agent_contatos_select ON public.contatos_anjo;
CREATE POLICY agent_contatos_select ON public.contatos_anjo
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.tipo IN ('admin', 'agente')));

-- panic_records
DROP POLICY IF EXISTS agent_panic_select ON public.panic_records;
CREATE POLICY agent_panic_select ON public.panic_records
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.tipo IN ('admin', 'agente')));

-- aconselhamentos
DROP POLICY IF EXISTS "Users can update own aconselhamentos" ON public.aconselhamentos;
CREATE POLICY "Users can update own aconselhamentos" ON public.aconselhamentos
  FOR UPDATE TO authenticated
  USING ((auth.uid() = usuario_id) OR (auth.uid() = profissional_id) OR (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.tipo = 'admin')))
  WITH CHECK ((auth.uid() = usuario_id) OR (auth.uid() = profissional_id) OR (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.tipo = 'admin')));

DROP POLICY IF EXISTS "Users can view own aconse" ON public.aconselhamentos;
CREATE POLICY "Users can view own aconselhamentos" ON public.aconselhamentos
  FOR SELECT TO authenticated
  USING ((auth.uid() = usuario_id) OR (auth.uid() = profissional_id) OR (EXISTS (SELECT 1 FROM public.user_roles WHERE user_roles.user_id = auth.uid() AND user_roles.tipo = 'admin')));
