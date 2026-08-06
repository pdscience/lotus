-- Adicionar colunas de status de patrulha e visita na tabela agente_monitoramento
-- Para que a patrulha possa registrar visitas e atualizar status

-- Status de visita: pendente, visitada, nao_visitada, agendada
ALTER TABLE agente_monitoramento
  ADD COLUMN IF NOT EXISTS status_visita TEXT NOT NULL DEFAULT 'pendente'
  CHECK (status_visita IN ('pendente', 'visitada', 'nao_visitada', 'agendada'));

-- Status da patrulha: pendente, em_deslocamento, no_local, concluido, nao_foi_possivel
ALTER TABLE agente_monitoramento
  ADD COLUMN IF NOT EXISTS status_patrulha TEXT NOT NULL DEFAULT 'pendente'
  CHECK (status_patrulha IN ('pendente', 'em_deslocamento', 'no_local', 'concluido', 'nao_foi_possivel'));

-- Data/hora da última atualização de patrulha
ALTER TABLE agente_monitoramento
  ADD COLUMN IF NOT EXISTS ultima_atualizacao TIMESTAMPTZ DEFAULT NOW();

-- Observações da patrulha (separadas das observações gerais)
ALTER TABLE agente_monitoramento
  ADD COLUMN IF NOT EXISTS obs_patrulha TEXT;
