import initSqlJs, { Database } from 'sql.js';

let db: Database | null = null;
let SQL: any = null;

export const initializeDatabase = async (): Promise<boolean> => {
  try {
    // Inicializar sql.js
    SQL = await initSqlJs({
      locateFile: (file: string) => `https://sql.js.org/dist/${file}`
    });

    // Verificar se já existe um banco no localStorage
    const savedDb = localStorage.getItem('sqlite_database');
    
    if (savedDb) {
      // Carregar banco existente
      const uint8Array = new Uint8Array(JSON.parse(savedDb));
      db = new SQL.Database(uint8Array);
    } else {
      // Criar novo banco
      db = new SQL.Database();
      await createTables();
      await seedInitialData();
    }

    console.log('✅ SQLite database initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing SQLite database:', error);
    return false;
  }
};

const createTables = async (): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  // Criar tabelas baseadas no schema existente
  const createTableQueries = [
    // Tabela de usuários
    `CREATE TABLE IF NOT EXISTS usuarios (
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
    )`,

    // Tabela de clientes
    `CREATE TABLE IF NOT EXISTS clientes (
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
    )`,

    // Tabela de seguradoras
    `CREATE TABLE IF NOT EXISTS seguradoras (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      ativa BOOLEAN DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tabela de ramos
    `CREATE TABLE IF NOT EXISTS ramos (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      ativo BOOLEAN DEFAULT 1,
      percentual_comissao_seguro_novo REAL DEFAULT 10.0,
      valor_fixo_seguro_novo REAL DEFAULT 100.0,
      tipo_comissao_seguro_novo TEXT DEFAULT 'percentual' CHECK (tipo_comissao_seguro_novo IN ('percentual', 'valor_fixo')),
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tabela de renovações
    `CREATE TABLE IF NOT EXISTS renovacoes (
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
    )`,

    // Tabela de seguros novos
    `CREATE TABLE IF NOT EXISTS seguros_novos (
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
    )`,

    // Tabela de observações
    `CREATE TABLE IF NOT EXISTS observacoes (
      id TEXT PRIMARY KEY,
      entidade_tipo TEXT NOT NULL CHECK (entidade_tipo IN ('renovacao', 'seguro_novo')),
      entidade_id TEXT NOT NULL,
      texto TEXT NOT NULL,
      usuario TEXT NOT NULL,
      data DATETIME DEFAULT CURRENT_TIMESTAMP
    )`,

    // Tabela de anexos
    `CREATE TABLE IF NOT EXISTS anexos (
      id TEXT PRIMARY KEY,
      observacao_id TEXT NOT NULL,
      nome TEXT NOT NULL,
      tipo TEXT NOT NULL,
      tamanho INTEGER NOT NULL,
      url TEXT NOT NULL,
      data_upload DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (observacao_id) REFERENCES observacoes(id)
    )`,

    // Índices
    `CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj ON clientes(cpf_cnpj)`,
    `CREATE INDEX IF NOT EXISTS idx_clientes_email ON clientes(email)`,
    `CREATE INDEX IF NOT EXISTS idx_renovacoes_cliente_id ON renovacoes(cliente_id)`,
    `CREATE INDEX IF NOT EXISTS idx_renovacoes_fim_vigencia ON renovacoes(fim_vigencia)`,
    `CREATE INDEX IF NOT EXISTS idx_seguros_novos_cliente_id ON seguros_novos(cliente_id)`,
    `CREATE INDEX IF NOT EXISTS idx_seguros_novos_inicio_vigencia ON seguros_novos(inicio_vigencia)`
  ];

  for (const query of createTableQueries) {
    db.run(query);
  }
};

const seedInitialData = async (): Promise<void> => {
  if (!db) throw new Error('Database not initialized');

  // Inserir dados iniciais das seguradoras
  const seguradoras = [
    { id: '1', nome: 'Bradesco Seguros', ativa: 1 },
    { id: '2', nome: 'SulAmérica', ativa: 1 },
    { id: '3', nome: 'Porto Seguro', ativa: 1 },
    { id: '4', nome: 'Allianz', ativa: 1 },
    { id: '5', nome: 'Mapfre', ativa: 1 },
    { id: '6', nome: 'Itaú Seguros', ativa: 1 }
  ];

  for (const seguradora of seguradoras) {
    db.run(
      'INSERT OR IGNORE INTO seguradoras (id, nome, ativa) VALUES (?, ?, ?)',
      [seguradora.id, seguradora.nome, seguradora.ativa]
    );
  }

  // Inserir dados iniciais dos ramos
  const ramos = [
    { id: '1', nome: 'Auto', ativo: 1, percentual: 15, valor_fixo: 100, tipo: 'percentual' },
    { id: '2', nome: 'Residencial', ativo: 1, percentual: 20, valor_fixo: 80, tipo: 'percentual' },
    { id: '3', nome: 'Empresarial', ativo: 1, percentual: 10, valor_fixo: 200, tipo: 'percentual' },
    { id: '4', nome: 'Vida', ativo: 1, percentual: 18, valor_fixo: 120, tipo: 'percentual' },
    { id: '5', nome: 'Saúde', ativo: 1, percentual: 12, valor_fixo: 150, tipo: 'valor_fixo' },
    { id: '6', nome: 'Viagem', ativo: 1, percentual: 25, valor_fixo: 50, tipo: 'valor_fixo' }
  ];

  for (const ramo of ramos) {
    db.run(
      'INSERT OR IGNORE INTO ramos (id, nome, ativo, percentual_comissao_seguro_novo, valor_fixo_seguro_novo, tipo_comissao_seguro_novo) VALUES (?, ?, ?, ?, ?, ?)',
      [ramo.id, ramo.nome, ramo.ativo, ramo.percentual, ramo.valor_fixo, ramo.tipo]
    );
  }

  // Inserir usuários iniciais
  const usuarios = [
    { id: '1', nome: 'João Silva', email: 'joao@empresa.com', role: 'usuario', renovacoes: 1, seguros: 1, clientes: 1, rem_ren: 1, rem_seg: 1 },
    { id: '2', nome: 'Maria Santos', email: 'maria@empresa.com', role: 'usuario', renovacoes: 1, seguros: 0, clientes: 1, rem_ren: 1, rem_seg: 0 },
    { id: '3', nome: 'Pedro Costa', email: 'pedro@empresa.com', role: 'usuario', renovacoes: 0, seguros: 1, clientes: 1, rem_ren: 0, rem_seg: 0 },
    { id: '4', nome: 'Ana Oliveira', email: 'ana@empresa.com', role: 'admin', renovacoes: 1, seguros: 1, clientes: 1, rem_ren: 1, rem_seg: 1 },
    { id: '5', nome: 'Carlos Gestor', email: 'carlos@empresa.com', role: 'gestor', renovacoes: 1, seguros: 1, clientes: 1, rem_ren: 1, rem_seg: 1 }
  ];

  for (const usuario of usuarios) {
    db.run(
      'INSERT OR IGNORE INTO usuarios (id, nome, email, role, acesso_renovacoes, acesso_seguros_novos, acesso_clientes, recebe_remuneracao_renovacoes, recebe_remuneracao_seguros_novos) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [usuario.id, usuario.nome, usuario.email, usuario.role, usuario.renovacoes, usuario.seguros, usuario.clientes, usuario.rem_ren, usuario.rem_seg]
    );
  }

  // Salvar no localStorage
  saveDatabase();
};

export const saveDatabase = (): void => {
  if (!db) return;
  
  const data = db.export();
  const buffer = Array.from(data);
  localStorage.setItem('sqlite_database', JSON.stringify(buffer));
};

export const executeQuery = async (sql: string, params: any[] = []): Promise<any> => {
  if (!db) throw new Error('Database not initialized');

  try {
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const stmt = db.prepare(sql);
      const results = [];
      
      if (params.length > 0) {
        stmt.bind(params);
      }
      
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      
      stmt.free();
      return { rows: results };
    } else {
      // INSERT, UPDATE, DELETE
      db.run(sql, params);
      saveDatabase(); // Salvar após modificações
      return { rows: [] };
    }
  } catch (error) {
    console.error('SQL Error:', error, 'Query:', sql, 'Params:', params);
    throw error;
  }
};

export const executeTransaction = async (queries: Array<{ sql: string; args?: any[] }>): Promise<boolean> => {
  if (!db) throw new Error('Database not initialized');

  try {
    db.run('BEGIN TRANSACTION');
    
    for (const query of queries) {
      db.run(query.sql, query.args || []);
    }
    
    db.run('COMMIT');
    saveDatabase();
    return true;
  } catch (error) {
    db.run('ROLLBACK');
    console.error('Transaction Error:', error);
    throw error;
  }
};

export const closeConnection = async (): Promise<void> => {
  if (db) {
    saveDatabase();
    db.close();
    db = null;
  }
};

export const getDatabase = (): Database | null => {
  return db;
};