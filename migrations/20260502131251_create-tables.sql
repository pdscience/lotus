-- Tabelas para o Aplikasi AMPARE

-- 1. Contatos de Anjo (contatos de emergência)
CREATE TABLE IF NOT EXISTS contatos_anjo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    telefone TEXT NOT NULL,
    parentesco TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Medidas Protetivas
CREATE TABLE IF NOT EXISTS medidas_protetivas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    tipo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE,
    status TEXT NOT NULL DEFAULT 'ativa' CHECK (status IN ('ativa', 'encerrada', 'revogada')),
    numero_processo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Registros de Pânico
CREATE TABLE IF NOT EXISTS panic_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    audio_url TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Rede de Apoio (ONGs, abrigos, delegacias, etc)
CREATE TABLE IF NOT EXISTS rede_apoio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL CHECK (tipo IN ('ong', 'abrigo', 'delegacia', 'hospital', 'outros')),
    telefone TEXT NOT NULL,
    endereco TEXT NOT NULL,
    latitude NUMERIC(10, 8),
    longitude NUMERIC(11, 8),
    ativo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Registros de Aconselhamento
CREATE TABLE IF NOT EXISTS aconselhamentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    profissional_id UUID REFERENCES auth.users(id),
    data_agendamento TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'agendado' CHECK (status IN ('agendado', 'realizado', 'cancelado')),
    notas TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) - Habilitar em todas as tabelas
ALTER TABLE contatos_anjo ENABLE ROW LEVEL SECURITY;
ALTER TABLE medidas_protetivas ENABLE ROW LEVEL SECURITY;
ALTER TABLE panic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE rede_apoio ENABLE ROW LEVEL SECURITY;
ALTER TABLE aconselhamentos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS

-- Contatos Anjo: apenas o dono pode ver
CREATE POLICY "Users can view own contatos" ON contatos_anjo
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own contatos" ON contatos_anjo
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own contatos" ON contatos_anjo
    FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own contatos" ON contatos_anjo
    FOR DELETE USING (auth.uid() = usuario_id);

-- Medidas Protetivas: apenas o dono pode ver
CREATE POLICY "Users can view own medidas" ON medidas_protetivas
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own medidas" ON medidas_protetivas
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own medidas" ON medidas_protetivas
    FOR UPDATE USING (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own medidas" ON medidas_protetivas
    FOR DELETE USING (auth.uid() = usuario_id);

-- Panic Records: apenas o dono pode ver
CREATE POLICY "Users can view own panic" ON panic_records
    FOR SELECT USING (auth.uid() = usuario_id);

CREATE POLICY "Users can insert own panic" ON panic_records
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can delete own panic" ON panic_records
    FOR DELETE USING (auth.uid() = usuario_id);

-- Rede de Apoio: todos podem ver (dados públicos)
CREATE POLICY "Anyone can view rede apoio" ON rede_apoio
    FOR SELECT USING (true);

-- Admin pode fazer tudo usando a coluna 'metadata'
CREATE POLICY "Admin can manage rede apoio" ON rede_apoio
    FOR ALL USING (
        EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND metadata->>'tipo' = 'admin')
    );

-- Aconselhamentos: usuário pode ver seus próprios + profissionais/admin
CREATE POLICY "Users can view own aconse" ON aconselhamentos
    FOR SELECT USING (
        auth.uid() = usuario_id OR 
        auth.uid() = profissional_id OR
        EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND metadata->>'tipo' = 'admin')
    );

CREATE POLICY "Users can insert own aconse" ON aconselhamentos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Users can update own aconselhamentos" ON aconselhamentos
    FOR UPDATE USING (
        auth.uid() = usuario_id OR 
        auth.uid() = profissional_id OR
        EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND metadata->>'tipo' = 'admin')
    );