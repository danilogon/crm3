import { Cliente } from '../../types/customer';
import { executeQuery } from '../sqlite';

export class ClienteRepository {
  static async create(cliente: Omit<Cliente, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<Cliente> {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    await executeQuery(
      `INSERT INTO clientes (
        id, nome, cpf_cnpj, email, telefone, data_nascimento, tipo,
        endereco_cep, endereco_logradouro, endereco_numero, endereco_complemento,
        endereco_bairro, endereco_cidade, endereco_estado, observacoes,
        criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, cliente.nome, cliente.cpfCnpj, cliente.email, cliente.telefone,
        cliente.dataNascimento?.toISOString() || null, cliente.tipo,
        cliente.endereco?.cep || null, cliente.endereco?.logradouro || null,
        cliente.endereco?.numero || null, cliente.endereco?.complemento || null,
        cliente.endereco?.bairro || null, cliente.endereco?.cidade || null,
        cliente.endereco?.estado || null, cliente.observacoes || null,
        now, now
      ]
    );
    
    return {
      id,
      ...cliente,
      criadoEm: new Date(now),
      atualizadoEm: new Date(now)
    };
  }
  
  static async findAll(): Promise<Cliente[]> {
    const result = await executeQuery('SELECT * FROM clientes ORDER BY nome');
    
    return result.rows.map((row: any) => ({
      id: row.id,
      nome: row.nome,
      cpfCnpj: row.cpf_cnpj,
      email: row.email,
      telefone: row.telefone,
      dataNascimento: row.data_nascimento ? new Date(row.data_nascimento) : undefined,
      tipo: row.tipo,
      endereco: {
        cep: row.endereco_cep,
        logradouro: row.endereco_logradouro,
        numero: row.endereco_numero,
        complemento: row.endereco_complemento,
        bairro: row.endereco_bairro,
        cidade: row.endereco_cidade,
        estado: row.endereco_estado
      },
      observacoes: row.observacoes,
      criadoEm: new Date(row.criado_em),
      atualizadoEm: new Date(row.atualizado_em)
    }));
  }
  
  static async findById(id: string): Promise<Cliente | null> {
    const result = await executeQuery('SELECT * FROM clientes WHERE id = ?', [id]);
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      nome: row.nome,
      cpfCnpj: row.cpf_cnpj,
      email: row.email,
      telefone: row.telefone,
      dataNascimento: row.data_nascimento ? new Date(row.data_nascimento) : undefined,
      tipo: row.tipo,
      endereco: {
        cep: row.endereco_cep,
        logradouro: row.endereco_logradouro,
        numero: row.endereco_numero,
        complemento: row.endereco_complemento,
        bairro: row.endereco_bairro,
        cidade: row.endereco_cidade,
        estado: row.endereco_estado
      },
      observacoes: row.observacoes,
      criadoEm: new Date(row.criado_em),
      atualizadoEm: new Date(row.atualizado_em)
    };
  }
  
  static async findByCpfCnpj(cpfCnpj: string): Promise<Cliente | null> {
    const result = await executeQuery('SELECT * FROM clientes WHERE cpf_cnpj = ?', [cpfCnpj]);
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      nome: row.nome,
      cpfCnpj: row.cpf_cnpj,
      email: row.email,
      telefone: row.telefone,
      dataNascimento: row.data_nascimento ? new Date(row.data_nascimento) : undefined,
      tipo: row.tipo,
      endereco: {
        cep: row.endereco_cep,
        logradouro: row.endereco_logradouro,
        numero: row.endereco_numero,
        complemento: row.endereco_complemento,
        bairro: row.endereco_bairro,
        cidade: row.endereco_cidade,
        estado: row.endereco_estado
      },
      observacoes: row.observacoes,
      criadoEm: new Date(row.criado_em),
      atualizadoEm: new Date(row.atualizado_em)
    };
  }
  
  static async update(id: string, cliente: Partial<Cliente>): Promise<Cliente | null> {
    const now = new Date().toISOString();
    
    await executeQuery(
      `UPDATE clientes SET 
        nome = ?, cpf_cnpj = ?, email = ?, telefone = ?, data_nascimento = ?, tipo = ?,
        endereco_cep = ?, endereco_logradouro = ?, endereco_numero = ?, endereco_complemento = ?,
        endereco_bairro = ?, endereco_cidade = ?, endereco_estado = ?, observacoes = ?,
        atualizado_em = ?
      WHERE id = ?`,
      [
        cliente.nome, cliente.cpfCnpj, cliente.email, cliente.telefone,
        cliente.dataNascimento?.toISOString() || null, cliente.tipo,
        cliente.endereco?.cep || null, cliente.endereco?.logradouro || null,
        cliente.endereco?.numero || null, cliente.endereco?.complemento || null,
        cliente.endereco?.bairro || null, cliente.endereco?.cidade || null,
        cliente.endereco?.estado || null, cliente.observacoes || null,
        now, id
      ]
    );
    
    return this.findById(id);
  }
  
  static async delete(id: string): Promise<boolean> {
    await executeQuery('DELETE FROM clientes WHERE id = ?', [id]);
    return true;
  }
  
  static async findWithFilters(filters: any): Promise<Cliente[]> {
    let query = 'SELECT * FROM clientes WHERE 1=1';
    const params: any[] = [];
    
    if (filters.nome) {
      query += ' AND nome LIKE ?';
      params.push(`%${filters.nome}%`);
    }
    
    if (filters.cpfCnpj) {
      query += ' AND cpf_cnpj LIKE ?';
      params.push(`%${filters.cpfCnpj}%`);
    }
    
    if (filters.tipo) {
      query += ' AND tipo = ?';
      params.push(filters.tipo);
    }
    
    query += ' ORDER BY nome';
    
    const result = await executeQuery(query, params);
    
    return result.rows.map((row: any) => ({
      id: row.id,
      nome: row.nome,
      cpfCnpj: row.cpf_cnpj,
      email: row.email,
      telefone: row.telefone,
      dataNascimento: row.data_nascimento ? new Date(row.data_nascimento) : undefined,
      tipo: row.tipo,
      endereco: {
        cep: row.endereco_cep,
        logradouro: row.endereco_logradouro,
        numero: row.endereco_numero,
        complemento: row.endereco_complemento,
        bairro: row.endereco_bairro,
        cidade: row.endereco_cidade,
        estado: row.endereco_estado
      },
      observacoes: row.observacoes,
      criadoEm: new Date(row.criado_em),
      atualizadoEm: new Date(row.atualizado_em)
    }));
  }
}