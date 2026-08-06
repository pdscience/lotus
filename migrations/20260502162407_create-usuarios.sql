CREATE TABLE public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome TEXT NOT NULL,
    cpf TEXT UNIQUE,
    telefone TEXT,
    data_nascimento DATE,
    endereco TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver próprios dados"
    ON public.usuarios FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar próprios dados"
    ON public.usuarios FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Admin pode fazer tudo com usuários"
    ON public.usuarios FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE id = auth.uid()
            AND metadata->>'tipo' = 'admin'
        )
    );