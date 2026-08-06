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

-- 2. Seed roles for existing users
INSERT INTO public.user_roles (user_id, tipo) VALUES
  ('0fc678a2-fc82-4e84-9951-10a5589798dc', 'admin'),
  ('aa47fb2f-3040-4172-a434-69bf6ecc7fbd', 'agente'),
  ('f0b93dae-4e22-40b7-bb55-6f992eb8efc2', 'vitima')
ON CONFLICT (user_id) DO UPDATE SET tipo = EXCLUDED.tipo;

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
