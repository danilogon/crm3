-- Schema do banco de dados SQLite para o sistema de seguros

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('admin', 'usuario', 'gestor')),
    acesso_renovacoes BOOLEAN DEFAULT 1,
    acesso_seguros_novos BOOLEAN DEFAULT 1,
    acesso_clientes BOOLEAN DEFAULT 1,
    recebe_remuneracao_renovacoes BOOLEAN DEFAULT 0,
    recebe_remuneracao_seguros_novos BOOLEAN DEFAULT 0,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    cpf_cnpj TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    telefone TEXT NOT NULL,
    data_nascimento DATE,
    tipo TEXT NOT NULL CHECK (tipo IN ('pessoa_fisica', 'pessoa_juridica')),
    endereco_cep TEXT,
    endereco_logradouro TEXT,
    endereco_numero TEXT,
    endereco_complemento TEXT,
    endereco_bairro TEXT,
    endereco_cidade TEXT,
    endereco_estado TEXT,
    observacoes TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de seguradoras
CREATE TABLE IF NOT EXISTS seguradoras (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    ativa BOOLEAN DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de ramos
CREATE TABLE IF NOT EXISTS ramos (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    ativo BOOLEAN DEFAULT 1,
    percentual_comissao_seguro_novo REAL DEFAULT 10.0,
    valor_fixo_seguro_novo REAL DEFAULT 100.0,
    tipo_comissao_seguro_novo TEXT DEFAULT 'percentual' CHECK (tipo_comissao_seguro_novo IN ('percentual', 'valor_fixo')),
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de renovações
CREATE TABLE IF NOT EXISTS renovacoes (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL,
    responsavel TEXT NOT NULL,
    fim_vigencia DATE NOT NULL,
    ramo_id TEXT NOT NULL,
    seguradora_anterior_id TEXT NOT NULL,
    premio_liquido_anterior REAL NOT NULL,
    percentual_comissao_anterior REAL NOT NULL,
    comissao_anterior REAL NOT NULL,
    seguradora_nova_id TEXT,
    premio_liquido_novo REAL,
    percentual_comissao_nova REAL,
    comissao_nova REAL,
    resultado REAL,
    status TEXT NOT NULL DEFAULT 'a_trabalhar',
    motivo_perda TEXT,
    motivo_outros TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (ramo_id) REFERENCES ramos(id),
    FOREIGN KEY (seguradora_anterior_id) REFERENCES seguradoras(id),
    FOREIGN KEY (seguradora_nova_id) REFERENCES seguradoras(id)
);

-- Tabela de seguros novos
CREATE TABLE IF NOT EXISTS seguros_novos (
    id TEXT PRIMARY KEY,
    cliente_id TEXT NOT NULL,
    responsavel TEXT NOT NULL,
    inicio_vigencia DATE NOT NULL,
    ramo_id TEXT NOT NULL,
    seguradora_nova_id TEXT NOT NULL,
    premio_liquido_novo REAL NOT NULL,
    percentual_comissao_nova REAL NOT NULL,
    comissao_nova REAL NOT NULL,
    comissao_a_receber REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'a_trabalhar',
    motivo_perda TEXT,
    motivo_outros TEXT,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    atualizado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id),
    FOREIGN KEY (ramo_id) REFERENCES ramos(id),
    FOREIGN KEY (seguradora_nova_id) REFERENCES seguradoras(id)
);

-- Tabela de observações (para renovações e seguros novos)
CREATE TABLE IF NOT EXISTS observacoes (
    id TEXT PRIMARY KEY,
    entidade_tipo TEXT NOT NULL CHECK (entidade_tipo IN ('renovacao', 'seguro_novo')),
    entidade_id TEXT NOT NULL,
    texto TEXT NOT NULL,
    usuario TEXT NOT NULL,
    data DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de anexos
CREATE TABLE IF NOT EXISTS anexos (
    id TEXT PRIMARY KEY,
    observacao_id TEXT NOT NULL,
    nome TEXT NOT NULL,
    tipo TEXT NOT NULL,
    tamanho INTEGER NOT NULL,
    url TEXT NOT NULL,
    data_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (observacao_id) REFERENCES observacoes(id)
);

-- Tabela de tarefas
CREATE TABLE IF NOT EXISTS tarefas (
    id TEXT PRIMARY KEY,
    entidade_tipo TEXT NOT NULL CHECK (entidade_tipo IN ('renovacao', 'seguro_novo')),
    entidade_id TEXT NOT NULL,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_agendamento DATETIME NOT NULL,
    concluida BOOLEAN DEFAULT 0,
    usuario TEXT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de metas de taxa de conversão
CREATE TABLE IF NOT EXISTS metas_taxa_conversao (
    id TEXT PRIMARY KEY,
    faixa_minima REAL NOT NULL,
    faixa_maxima REAL,
    tipo_remuneracao TEXT NOT NULL CHECK (tipo_remuneracao IN ('percentual', 'valor_fixo')),
    percentual_comissao REAL,
    valor_fixo REAL,
    descricao TEXT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de metas de aumento de comissão
CREATE TABLE IF NOT EXISTS metas_aumento_comissao (
    id TEXT PRIMARY KEY,
    faixa_minima REAL NOT NULL,
    faixa_maxima REAL,
    tipo_remuneracao TEXT NOT NULL CHECK (tipo_remuneracao IN ('percentual', 'valor_fixo')),
    percentual_comissao REAL,
    valor_fixo REAL,
    descricao TEXT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de metas de seguros novos
CREATE TABLE IF NOT EXISTS metas_seguros_novos (
    id TEXT PRIMARY KEY,
    tipo TEXT NOT NULL CHECK (tipo IN ('comissao_gerada', 'taxa_conversao')),
    faixa_minima REAL NOT NULL,
    faixa_maxima REAL,
    tipo_remuneracao TEXT NOT NULL CHECK (tipo_remuneracao IN ('percentual', 'valor_fixo')),
    percentual_comissao REAL,
    valor_fixo REAL,
    descricao TEXT NOT NULL,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de motivos de perda
CREATE TABLE IF NOT EXISTS motivos_perda (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    icone TEXT NOT NULL,
    ativo BOOLEAN DEFAULT 1,
    tipo TEXT NOT NULL CHECK (tipo IN ('renovacao', 'seguro_novo', 'ambos')),
    ordem INTEGER DEFAULT 1,
    criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para otimização de consultas
CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email);
CREATE INDEX IF NOT EXISTS idx_renovacoes_cliente_id ON renovacoes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_renovacoes_fim_vigencia ON renovacoes(fim_vigencia);
CREATE INDEX IF NOT EXISTS idx_renovacoes_responsavel ON renovacoes(responsavel);
CREATE INDEX IF NOT EXISTS idx_seguros_novos_cliente_id ON seguros_novos(cliente_id);
CREATE INDEX IF NOT EXISTS idx_seguros_novos_inicio_vigencia ON seguros_novos(inicio_vigencia);
CREATE INDEX IF NOT EXISTS idx_seguros_novos_responsavel ON seguros_novos(responsavel);
CREATE INDEX IF NOT EXISTS idx_observacoes_entidade ON observacoes(entidade_tipo, entidade_id);
CREATE INDEX IF NOT EXISTS idx_tarefas_entidade ON tarefas(entidade_tipo, entidade_id);