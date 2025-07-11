// Este arquivo agora será usado apenas para tipos e funções utilitárias
// Os cards reais serão gerados dinamicamente a partir dos dados de renovações e seguros novos

import { Card, InteracaoCliente } from '../types';
import { RenovacaoSeguro, SeguroNovo } from '../types';
import { Cliente } from '../types/customer';

/**
 * Gera cards dinamicamente a partir das renovações e seguros novos
 */
export const gerarCardsDeRenovacoes = (renovacoes: RenovacaoSeguro[]): Card[] => {
  return renovacoes.map(renovacao => ({
    id: `renovacao-${renovacao.id}`,
    numero: `REN-${renovacao.id.toUpperCase()}`,
    clienteId: renovacao.clienteId,
    dataCriacao: renovacao.criadoEm,
    status: mapearStatusRenovacaoParaCard(renovacao.status),
    valorTotal: renovacao.premioLiquidoNovo || renovacao.premioLiquidoAnterior,
    descricao: `Renovação ${renovacao.ramo.nome} - ${renovacao.seguradoraAnterior.nome}`,
    responsavel: renovacao.responsavel,
    criadoEm: renovacao.criadoEm,
    atualizadoEm: renovacao.atualizadoEm
  }));
};

export const gerarCardsDeSeguroNovo = (segurosNovos: SeguroNovo[]): Card[] => {
  return segurosNovos.map(seguroNovo => ({
    id: `seguro-novo-${seguroNovo.id}`,
    numero: `SN-${seguroNovo.id.toUpperCase()}`,
    clienteId: seguroNovo.clienteId,
    dataCriacao: seguroNovo.criadoEm,
    status: mapearStatusSeguroNovoParaCard(seguroNovo.status),
    valorTotal: seguroNovo.premioLiquidoNovo,
    descricao: `Seguro Novo ${seguroNovo.ramo.nome} - ${seguroNovo.seguradoraNova.nome}`,
    responsavel: seguroNovo.responsavel,
    criadoEm: seguroNovo.criadoEm,
    atualizadoEm: seguroNovo.atualizadoEm
  }));
};

export const gerarTodosOsCards = (renovacoes: RenovacaoSeguro[], segurosNovos: SeguroNovo[]): Card[] => {
  const cardsRenovacoes = gerarCardsDeRenovacoes(renovacoes);
  const cardsSegurosNovos = gerarCardsDeSeguroNovo(segurosNovos);
  
  return [...cardsRenovacoes, ...cardsSegurosNovos]
    .sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime());
};

// Mapear status específicos para status de card genérico
const mapearStatusRenovacaoParaCard = (status: string): 'pendente' | 'em_analise' | 'aprovado' | 'recusado' => {
  switch (status) {
    case 'renovado':
      return 'aprovado';
    case 'nao_renovada':
      return 'recusado';
    case 'em_negociacao':
    case 'em_orcamento':
    case 'a_transmitir':
      return 'em_analise';
    default:
      return 'pendente';
  }
};

const mapearStatusSeguroNovoParaCard = (status: string): 'pendente' | 'em_analise' | 'aprovado' | 'recusado' => {
  switch (status) {
    case 'fechado':
      return 'aprovado';
    case 'perdido':
      return 'recusado';
    case 'em_negociacao':
    case 'em_orcamento':
    case 'a_transmitir':
      return 'em_analise';
    default:
      return 'pendente';
  }
};

// Gerar interações baseadas nas observações dos cartões
export const gerarInteracoesDeRenovacoes = (renovacoes: RenovacaoSeguro[]): InteracaoCliente[] => {
  const interacoes: InteracaoCliente[] = [];
  
  renovacoes.forEach(renovacao => {
    renovacao.observacoes.forEach(obs => {
      interacoes.push({
        id: `renovacao-obs-${obs.id}`,
        clienteId: renovacao.clienteId,
        tipo: 'outros',
        descricao: obs.texto,
        data: obs.data,
        responsavel: obs.usuario,
        observacoes: obs.anexos.length > 0 ? `${obs.anexos.length} anexo(s)` : undefined
      });
    });
  });
  
  return interacoes;
};

export const gerarInteracoesDeSeguroNovo = (segurosNovos: SeguroNovo[]): InteracaoCliente[] => {
  const interacoes: InteracaoCliente[] = [];
  
  segurosNovos.forEach(seguroNovo => {
    seguroNovo.observacoes.forEach(obs => {
      interacoes.push({
        id: `seguro-novo-obs-${obs.id}`,
        clienteId: seguroNovo.clienteId,
        tipo: 'outros',
        descricao: obs.texto,
        data: obs.data,
        responsavel: obs.usuario,
        observacoes: obs.anexos.length > 0 ? `${obs.anexos.length} anexo(s)` : undefined
      });
    });
  });
  
  return interacoes;
};

export const gerarTodasAsInteracoes = (renovacoes: RenovacaoSeguro[], segurosNovos: SeguroNovo[]): InteracaoCliente[] => {
  const interacoesRenovacoes = gerarInteracoesDeRenovacoes(renovacoes);
  const interacoesSegurosNovos = gerarInteracoesDeSeguroNovo(segurosNovos);
  
  return [...interacoesRenovacoes, ...interacoesSegurosNovos]
    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
};