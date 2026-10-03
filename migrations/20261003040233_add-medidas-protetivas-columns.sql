-- Adiciona colunas faltantes em medidas_protetivas
-- Alinha a tabela com os campos usados pelo app (medidaService / CadastroView)

alter table public.medidas_protetivas
  add column if not exists nome_ofendida text,
  add column if not exists nome_ofensor text,
  add column if not exists data_registro date,
  add column if not exists urgencia text default 'media',
  add column if not exists cidade text,
  add column if not exists uf text,
  add column if not exists endereco_vitima text,
  add column if not exists endereco_agressor text,
  add column if not exists bairro_vitima text,
  add column if not exists bairro_agressor text,
  add column if not exists local_trabalho_vitima text,
  add column if not exists escola_vitima text,
  add column if not exists escola_dependente text;
