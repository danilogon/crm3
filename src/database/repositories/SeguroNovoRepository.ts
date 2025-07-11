import { SeguroNovo, Observacao, Tarefa } from '../../types';
import { executeQuery } from '../sqlite';

export class SeguroNovoRepository {
  static async create(seguroNovo: Omit<SeguroNovo, 'id' | 'criadoEm' | 'atualizadoEm'>): Promise<SeguroNovo> {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    const now = new Date().toISOString();
    
    await executeQuery(
      `INSERT INTO seguros_novos (
        id, cliente_id, responsavel, inicio_vigencia, ramo_id, seguradora_nova_id,
        premio_liquido_novo, percentual_comissao_nova, comissao_nova, comissao_a_receber,
        status, motivo_perda, motivo_outros, criado_em, atualizado_em
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, seguroNovo.clienteId, seguroNovo.responsavel, seguroNovo.inicioVigencia.toISOString(),
        seguroNovo.ramo.id, seguroNovo.seguradoraNova.id,
        seguroNovo.premioLiquidoNovo, seguroNovo.percentualComissaoNova,
        seguroNovo.comissaoNova, seguroNovo.comissaoAReceber,
        seguroNovo.status, seguroNovo.motivoPerda || null,
        seguroNovo.motivoOutros || null, now, now
      ]
    );
    
    // Inserir observações
    for (const obs of seguroNovo.observacoes) {
      await executeQuery(
        'INSERT INTO observacoes (id, entidade_tipo, entidade_id, texto, usuario, data) VALUES (?, ?, ?, ?, ?, ?)',
        [obs.id, 'seguro_novo', id, obs.texto, obs.usuario, obs.data.toISOString()]
      );
    }
    
    return {
      id,
      ...seguroNovo,
      criadoEm: new Date(now),
      atualizadoEm: new Date(now)
    };
  }
  
  static async findAll(): Promise<SeguroNovo[]> {
    const result = await executeQuery(`
      SELECT s.*, 
        r.nome as ramo_nome, r.ativo as ramo_ativo,
        r.percentual_comissao_seguro_novo, r.valor_fixo_seguro_novo, r.tipo_comissao_seguro_novo,
        sg.nome as seguradora_nome, sg.ativa as seguradora_ativa
      FROM seguros_novos s
      LEFT JOIN ramos r ON s.ramo_id = r.id
      LEFT JOIN seguradoras sg ON s.seguradora_nova_id = sg.id
      ORDER BY s.inicio_vigencia DESC
    `);
    
    const segurosNovos: SeguroNovo[] = [];
    
    for (const row of result.rows) {
      const observacoes = await this.findObservacoes(row.id);
      const tarefas = await this.findTarefas(row.id);
      
      segurosNovos.push({
        id: row.id,
        clienteId: row.cliente_id,
        responsavel: row.responsavel,
        inicioVigencia: new Date(row.inicio_vigencia),
        ramo: {
          id: row.ramo_id,
          nome: row.ramo_nome,
          ativo: Boolean(row.ramo_ativo),
          percentualComissaoSeguroNovo: row.percentual_comissao_seguro_novo,
          valorFixoSeguroNovo: row.valor_fixo_seguro_novo,
          tipoComissaoSeguroNovo: row.tipo_comissao_seguro_novo
        },
        seguradoraNova: {
          id: row.seguradora_nova_id,
          nome: row.seguradora_nome,
          ativa: Boolean(row.seguradora_ativa)
        },
        premioLiquidoNovo: row.premio_liquido_novo,
        percentualComissaoNova: row.percentual_comissao_nova,
        comissaoNova: row.comissao_nova,
        comissaoAReceber: row.comissao_a_receber,
        status: row.status,
        motivoPerda: row.motivo_perda,
        motivoOutros: row.motivo_outros,
        observacoes,
        tarefas,
        criadoEm: new Date(row.criado_em),
        atualizadoEm: new Date(row.atualizado_em)
      });
    }
    
    return segurosNovos;
  }
  
  static async findById(id: string): Promise<SeguroNovo | null> {
    const result = await executeQuery(`
      SELECT s.*, 
        r.nome as ramo_nome, r.ativo as ramo_ativo,
        r.percentual_comissao_seguro_novo, r.valor_fixo_seguro_novo, r.tipo_comissao_seguro_novo,
        sg.nome as seguradora_nome, sg.ativa as seguradora_ativa
      FROM seguros_novos s
      LEFT JOIN ramos r ON s.ramo_id = r.id
      LEFT JOIN seguradoras sg ON s.seguradora_nova_id = sg.id
      WHERE s.id = ?
    `, [id]);
    
    if (result.rows.length === 0) return null;
    
    const row = result.rows[0];
    const observacoes = await this.findObservacoes(id);
    const tarefas = await this.findTarefas(id);
    
    return {
      id: row.id,
      clienteId: row.cliente_id,
      responsavel: row.responsavel,
      inicioVigencia: new Date(row.inicio_vigencia),
      ramo: {
        id: row.ramo_id,
        nome: row.ramo_nome,
        ativo: Boolean(row.ramo_ativo),
        percentualComissaoSeguroNovo: row.percentual_comissao_seguro_novo,
        valorFixoSeguroNovo: row.valor_fixo_seguro_novo,
        tipoComissaoSeguroNovo: row.tipo_comissao_seguro_novo
      },
      seguradoraNova: {
        id: row.seguradora_nova_id,
        nome: row.seguradora_nome,
        ativa: Boolean(row.seguradora_ativa)
      },
      premioLiquidoNovo: row.premio_liquido_novo,
      percentualComissaoNova: row.percentual_comissao_nova,
      comissaoNova: row.comissao_nova,
      comissaoAReceber: row.comissao_a_receber,
      status: row.status,
      motivoPerda: row.motivo_perda,
      motivoOutros: row.motivo_outros,
      observacoes,
      tarefas,
      criadoEm: new Date(row.criado_em),
      atualizadoEm: new Date(row.atualizado_em)
    };
  }
  
  static async update(id: string, seguroNovo: Partial<SeguroNovo>): Promise<SeguroNovo | null> {
    const now = new Date().toISOString();
    
    await executeQuery(
      `UPDATE seguros_novos SET 
        responsavel = ?, inicio_vigencia = ?, premio_liquido_novo = ?,
        percentual_comissao_nova = ?, comissao_nova = ?, comissao_a_receber = ?,
        status = ?, motivo_perda = ?, motivo_outros = ?, atualizado_em = ?
      WHERE id = ?`,
      [
        seguroNovo.responsavel, seguroNovo.inicioVigencia?.toISOString(),
        seguroNovo.premioLiquidoNovo, seguroNovo.percentualComissaoNova,
        seguroNovo.comissaoNova, seguroNovo.comissaoAReceber,
        seguroNovo.status, seguroNovo.motivoPerda || null,
        seguroNovo.motivoOutros || null, now, id
      ]
    );
    
    return this.findById(id);
  }
  
  static async delete(id: string): Promise<boolean> {
    await executeQuery('DELETE FROM observacoes WHERE entidade_tipo = ? AND entidade_id = ?', ['seguro_novo', id]);
    await executeQuery('DELETE FROM seguros_novos WHERE id = ?', [id]);
    return true;
  }
  
  static async findObservacoes(seguroNovoId: string): Promise<Observacao[]> {
    const result = await executeQuery(
      'SELECT * FROM observacoes WHERE entidade_tipo = ? AND entidade_id = ? ORDER BY data',
      ['seguro_novo', seguroNovoId]
    );
    
    return result.rows.map((row: any) => ({
      id: row.id,
      texto: row.texto,
      data: new Date(row.data),
      usuario: row.usuario,
      anexos: [] // TODO: Implementar anexos
    }));
  }
  
  static async findTarefas(seguroNovoId: string): Promise<Tarefa[]> {
    const result = await executeQuery(
      'SELECT * FROM tarefas WHERE entidade_tipo = ? AND entidade_id = ? ORDER BY data_agendamento',
      ['seguro_novo', seguroNovoId]
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