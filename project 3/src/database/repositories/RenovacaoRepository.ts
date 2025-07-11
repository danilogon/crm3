import { RenovacaoSeguro, Observacao, Tarefa } from '../../types';
import { executeQuery } from '../sqlite';

export class RenovacaoRepository {
  static async create(renovacao: Omit<RenovacaoSeguro, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<RenovacaoSeguro> {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    await executeQuery(
      `INSERT INTO renovacoes (
        id, cliente_id, responsavel, fim_vigencia, ramo_id, seguradora_anterior_id,
        premio_liquido_anterior, percentual_comissao_anterior, comissao_anterior,
        seguradora_nova_id, premio_liquido_novo, percentual_comissao_nova,
        comissao_nova, resultado, status, motivo_perda, motivo_outros,
        criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, renovacao.clienteId, renovacao.responsavel, renovacao.fimVigencia.toISOString(),
        renovacao.ramo.id, renovacao.seguradoraAnterior.id,
        renovacao.premioLiquidoAnterior, renovacao.percentualComissaoAnterior, renovacao.comissaoAnterior,
        renovacao.seguradoraNova?.id || null, renovacao.premioLiquidoNovo || null,
        renovacao.percentualComissaoNova || null, renovacao.comissaoNova || null,
        renovacao.resultado || null, renovacao.status, renovacao.motivoPerda || null,
        renovacao.motivoOutros || null, now, now
      ]
    );
    
    // Inserir observações
    for (const obs of renovacao.observacoes) {
      await executeQuery(
        'INSERT INTO observacoes (id, entidade_tipo, entidade_id, texto, usuario, data) VALUES (?, ?, ?, ?, ?, ?)',
        [obs.id, 'renovacao', id, obs.texto, obs.usuario, obs.data.toISOString()]
      );
    }
    
    return {
      id,
      ...renovacao,
      criadoEm: new Date(now),
      atualizadoEm: new Date(now)
    };
  }
  
  static async findAll(): Promise<RenovacaoSeguro[]> {
    const result = await executeQuery(`
      SELECT r.*, 
        ra.nome as ramo_nome, ra.ativo as ramo_ativo,
        sa.nome as seguradora_anterior_nome, sa.ativa as seguradora_anterior_ativa,
        sn.nome as seguradora_nova_nome, sn.ativa as seguradora_nova_ativa
      FROM renovacoes r
      LEFT JOIN ramos ra ON r.ramo_id = ra.id
      LEFT JOIN seguradoras sa ON r.seguradora_anterior_id = sa.id
      LEFT JOIN seguradoras sn ON r.seguradora_nova_id = sn.id
      ORDER BY r.fim_vigencia
    `);
    
    const renovacoes: RenovacaoSeguro[] = [];
    
    for (const row of result.rows) {
      const observacoes = await this.findObservacoes(row.id);
      const tarefas = await this.findTarefas(row.id);
      
      renovacoes.push({
        id: row.id,
        clienteId: row.cliente_id,
        responsavel: row.responsavel,
        fimVigencia: new Date(row.fim_vigencia),
        ramo: {
          id: row.ramo_id,
          nome: row.ramo_nome,
          ativo: Boolean(row.ramo_ativo),
          percentualComissaoSeguroNovo: 0,
          valorFixoSeguroNovo: 0,
          tipoComissaoSeguroNovo: 'percentual'
        },
        seguradoraAnterior: {
          id: row.seguradora_anterior_id,
          nome: row.seguradora_anterior_nome,
          ativa: Boolean(row.seguradora_anterior_ativa)
        },
        premioLiquidoAnterior: row.premio_liquido_anterior,
        percentualComissaoAnterior: row.percentual_comissao_anterior,
        comissaoAnterior: row.comissao_anterior,
        seguradoraNova: row.seguradora_nova_id ? {
          id: row.seguradora_nova_id,
          nome: row.seguradora_nova_nome,
          ativa: Boolean(row.seguradora_nova_ativa)
        } : undefined,
        premioLiquidoNovo: row.premio_liquido_novo,
        percentualComissaoNova: row.percentual_comissao_nova,
        comissaoNova: row.comissao_nova,
        resultado: row.resultado,
        status: row.status,
        motivoPerda: row.motivo_perda,
        motivoOutros: row.motivo_outros,
        observacoes,
        tarefas,
        criadoEm: new Date(row.criado_em),
        atualizadoEm: new Date(row.atualizado_em)
      });
    }
    
    return renovacoes;
  }
  
  static async findById(id: string): Promise<RenovacaoSeguro | null> {
    const result = await executeQuery(`
      SELECT r.*, 
        ra.nome as ramo_nome, ra.ativo as ramo_ativo,
        sa.nome as seguradora_anterior_nome, sa.ativa as seguradora_anterior_ativa,
        sn.nome as seguradora_nova_nome, sn.ativa as seguradora_nova_ativa
      FROM renovacoes r
      LEFT JOIN ramos ra ON r.ramo_id = ra.id
      LEFT JOIN seguradoras sa ON r.seguradora_anterior_id = sa.id
      LEFT JOIN seguradoras sn ON r.seguradora_nova_id = sn.id
      WHERE r.id = ?
    `, [id]);
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    const observacoes = await this.findObservacoes(id);
    const tarefas = await this.findTarefas(id);
    
    return {
      id: row.id,
      clienteId: row.cliente_id,
      responsavel: row.responsavel,
      fimVigencia: new Date(row.fim_vigencia),
      ramo: {
        id: row.ramo_id,
        nome: row.ramo_nome,
        ativo: Boolean(row.ramo_ativo),
        percentualComissaoSeguroNovo: 0,
        valorFixoSeguroNovo: 0,
        tipoComissaoSeguroNovo: 'percentual'
      },
      seguradoraAnterior: {
        id: row.seguradora_anterior_id,
        nome: row.seguradora_anterior_nome,
        ativa: Boolean(row.seguradora_anterior_ativa)
      },
      premioLiquidoAnterior: row.premio_liquido_anterior,
      percentualComissaoAnterior: row.percentual_comissao_anterior,
      comissaoAnterior: row.comissao_anterior,
      seguradoraNova: row.seguradora_nova_id ? {
        id: row.seguradora_nova_id,
        nome: row.seguradora_nova_nome,
        ativa: Boolean(row.seguradora_nova_ativa)
      } : undefined,
      premioLiquidoNovo: row.premio_liquido_novo,
      percentualComissaoNova: row.percentual_comissao_nova,
      comissaoNova: row.comissao_nova,
      resultado: row.resultado,
      status: row.status,
      motivoPerda: row.motivo_perda,
      motivoOutros: row.motivo_outros,
      observacoes,
      tarefas,
      criadoEm: new Date(row.criado_em),
      atualizadoEm: new Date(row.atualizado_em)
    };
  }
  
  static async update(id: string, renovacao: Partial<RenovacaoSeguro>): Promise<RenovacaoSeguro | null> {
    const now = new Date().toISOString();
    
    await executeQuery(
      `UPDATE renovacoes SET 
        responsavel = ?, fim_vigencia = ?, seguradora_nova_id = ?,
        premio_liquido_novo = ?, percentual_comissao_nova = ?, comissao_nova = ?,
        resultado = ?, status = ?, motivo_perda = ?, motivo_outros = ?,
        atualizado_em = ?
      WHERE id = ?`,
      [
        renovacao.responsavel, renovacao.fimVigencia?.toISOString(),
        renovacao.seguradoraNova?.id || null, renovacao.premioLiquidoNovo || null,
        renovacao.percentualComissaoNova || null, renovacao.comissaoNova || null,
        renovacao.resultado || null, renovacao.status, renovacao.motivoPerda || null,
        renovacao.motivoOutros || null, now, id
      ]
    );
    
    return this.findById(id);
  }
  
  static async delete(id: string): Promise<boolean> {
    await executeQuery('DELETE FROM observacoes WHERE entidade_tipo = ? AND entidade_id = ?', ['renovacao', id]);
    await executeQuery('DELETE FROM renovacoes WHERE id = ?', [id]);
    return true;
  }
  
  static async findObservacoes(renovacaoId: string): Promise<Observacao[]> {
    const result = await executeQuery(
      'SELECT * FROM observacoes WHERE entidade_tipo = ? AND entidade_id = ? ORDER BY data',
      ['renovacao', renovacaoId]
    );
    
    return result.rows.map((row: any) => ({
      id: row.id,
      texto: row.texto,
      data: new Date(row.data),
      usuario: row.usuario,
      anexos: [] // TODO: Implementar anexos
    }));
  }
  
  static async findTarefas(renovacaoId: string): Promise<Tarefa[]> {
    const result = await executeQuery(
      'SELECT * FROM tarefas WHERE entidade_tipo = ? AND entidade_id = ? ORDER BY data_agendamento',
      ['renovacao', renovacaoId]
    );
    
    return result.rows.map((row: any) => ({
      id: row.id,
      titulo: row.titulo,
      descricao: row.descricao,
      dataAgendamento: new Date(row.data_agendamento),
      concluida: Boolean(row.concluida),
      usuario: row.usuario
    }));
  }
}