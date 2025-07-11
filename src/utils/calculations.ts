import { RenovacaoSeguro } from '../types';

import { ConfiguracoesMetas } from '../types';

export const calcularComissaoAnterior = (premioLiquido: number, percentual: number): number => {
  return premioLiquido * (percentual / 100);
};

export const calcularComissaoNova = (premioLiquido: number, percentual: number): number => {
  return premioLiquido * (percentual / 100);
};

export const calcularResultado = (comissaoNova: number, comissaoAnterior: number): number => {
  return comissaoNova - comissaoAnterior;
};

export const calcularTaxaConversao = (renovados: number, total: number): number => {
  if (total === 0) return 0;
  return (renovados / total) * 100;
};

export const calcularComissaoAReceber = (comissaoNova: number, ramo: any): number => {
  if (!ramo) return 0;
  
  // Verificar se comissaoNova é um número válido
  if (isNaN(comissaoNova) || comissaoNova === null || comissaoNova === undefined) {
    return 0;
  }
  
  if (ramo.tipoComissaoSeguroNovo === 'valor_fixo') {
    return ramo.valorFixoSeguroNovo || 0;
  } else {
    const percentual = ramo.percentualComissaoSeguroNovo || 0;
    return comissaoNova * (percentual / 100);
  }
};

export const calcularTaxaConversaoGeral = (renovados: number, segurosNovosFechados: number, totalRenovacoes: number, totalSegurosNovos: number): number => {
  const totalFechados = renovados + segurosNovosFechados;
  const totalGeral = totalRenovacoes + totalSegurosNovos;
  
  if (totalGeral === 0) return 0;
  return (totalFechados / totalGeral) * 100;
};

export const calcularAumentoComissao = (totalResultado: number, totalComissaoNova: number): number => {
  if (totalComissaoNova === 0) return 0;
  return (totalResultado / totalComissaoNova) * 100;
};

export const calcularComissaoTaxaConversao = (taxaConversao: number, totalComissaoNova: number, configuracoesMetas?: ConfiguracoesMetas): number => {
  if (!configuracoesMetas) {
    // Fallback para valores padrão se não houver configurações
    let percentual = 0;
    if (taxaConversao <= 90) {
      percentual = 3;
    } else if (taxaConversao <= 95) {
      percentual = 4;
    } else {
      percentual = 5;
    }
    return totalComissaoNova * (percentual / 100);
  }

  // Encontrar a meta correspondente à taxa de conversão
  const metaAtingida = configuracoesMetas.metasTaxaConversao.find(meta => {
    if (meta.faixaMaxima === null) {
      // Sem limite máximo (acima de X%)
      return taxaConversao >= meta.faixaMinima;
    } else {
      // Com limite máximo
      return taxaConversao >= meta.faixaMinima && taxaConversao <= meta.faixaMaxima;
    }
  });

  if (!metaAtingida) return 0;
  
  if (metaAtingida.tipoRemuneracao === 'valor_fixo') {
    return metaAtingida.valorFixo || 0;
  } else {
    return totalComissaoNova * ((metaAtingida.percentualComissao || 0) / 100);
  }
};

export const calcularComissaoAumento = (aumentoComissao: number, totalComissaoNova: number, configuracoesMetas?: ConfiguracoesMetas): number => {
  if (!configuracoesMetas) {
    // Fallback para valores padrão se não houver configurações
    let percentual = 0;
    if (aumentoComissao >= 10 && aumentoComissao < 15) {
      percentual = 1;
    } else if (aumentoComissao >= 15 && aumentoComissao < 20) {
      percentual = 1.5;
    } else if (aumentoComissao >= 20) {
      percentual = 2.5;
    }
    return totalComissaoNova * (percentual / 100);
  }

  // Encontrar a meta correspondente ao aumento de comissão
  const metaAtingida = configuracoesMetas.metasAumentoComissao.find(meta => {
    if (meta.faixaMaxima === null) {
      // Sem limite máximo (acima de X%)
      return aumentoComissao >= meta.faixaMinima;
    } else {
      // Com limite máximo
      return aumentoComissao >= meta.faixaMinima && aumentoComissao <= meta.faixaMaxima;
    }
  });

  if (!metaAtingida) return 0;
  
  if (metaAtingida.tipoRemuneracao === 'valor_fixo') {
    return metaAtingida.valorFixo || 0;
  } else {
    return totalComissaoNova * ((metaAtingida.percentualComissao || 0) / 100);
  }
};

export const calcularBonusSegurosNovos = (
  totalComissaoSegurosNovos: number, 
  taxaConversaoSegurosNovos: number, 
  configuracoesMetas?: ConfiguracoesMetas
): number => {
  if (!configuracoesMetas) return 0;
  
  let bonusTotal = 0;
  
  // Verificar metas por comissão gerada
  const metaComissaoAtingida = configuracoesMetas.metasSegurosNovos
    .filter(meta => meta.tipo === 'comissao_gerada')
    .find(meta => {
      if (meta.faixaMaxima === null) {
        return totalComissaoSegurosNovos >= meta.faixaMinima;
      } else {
        return totalComissaoSegurosNovos >= meta.faixaMinima && totalComissaoSegurosNovos <= meta.faixaMaxima;
      }
    });
  
  if (metaComissaoAtingida) {
    if (metaComissaoAtingida.tipoRemuneracao === 'valor_fixo') {
      bonusTotal += metaComissaoAtingida.valorFixo || 0;
    } else {
      bonusTotal += totalComissaoSegurosNovos * ((metaComissaoAtingida.percentualComissao || 0) / 100);
    }
  }
  
  // Verificar metas por taxa de conversão
  const metaTaxaAtingida = configuracoesMetas.metasSegurosNovos
    .filter(meta => meta.tipo === 'taxa_conversao')
    .find(meta => {
      if (meta.faixaMaxima === null) {
        return taxaConversaoSegurosNovos >= meta.faixaMinima;
      } else {
        return taxaConversaoSegurosNovos >= meta.faixaMinima && taxaConversaoSegurosNovos <= meta.faixaMaxima;
      }
    });
  
  if (metaTaxaAtingida) {
    if (metaTaxaAtingida.tipoRemuneracao === 'valor_fixo') {
      bonusTotal += metaTaxaAtingida.valorFixo || 0;
    } else {
      bonusTotal += totalComissaoSegurosNovos * ((metaTaxaAtingida.percentualComissao || 0) / 100);
    }
  }
  
  return bonusTotal;
};

export const obterMetaAtingidaTaxaConversao = (taxaConversao: number, configuracoesMetas?: ConfiguracoesMetas) => {
  if (!configuracoesMetas) return null;
  
  return configuracoesMetas.metasTaxaConversao.find(meta => {
    if (meta.faixaMaxima === null) {
      return taxaConversao >= meta.faixaMinima;
    } else {
      return taxaConversao >= meta.faixaMinima && taxaConversao <= meta.faixaMaxima;
    }
  });
};

export const obterMetaAtingidaAumentoComissao = (aumentoComissao: number, configuracoesMetas?: ConfiguracoesMetas) => {
  if (!configuracoesMetas) return null;
  
  return configuracoesMetas.metasAumentoComissao.find(meta => {
    if (meta.faixaMaxima === null) {
      return aumentoComissao >= meta.faixaMinima;
    } else {
      return aumentoComissao >= meta.faixaMinima && aumentoComissao <= meta.faixaMaxima;
    }
  });
};

export const formatarMoeda = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
};

export const formatarPercentual = (valor: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(valor / 100);
};

export const formatarData = (data: Date): string => {
  return new Intl.DateTimeFormat('pt-BR').format(data);
};

export const obterStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    a_trabalhar: 'A Trabalhar',
    em_orcamento: 'Em Orçamento',
    em_negociacao: 'Em Negociação',
    vencidas: 'Vencidas',
    a_transmitir: 'A Transmitir',
    pendente: 'Pendente',
    renovado: 'Renovado',
    fechado: 'Fechado',
    nao_renovada: 'Não Renovada',
    perdido: 'Perdido'
  };
  return labels[status] || status;
};

export const obterCorStatus = (status: string): string => {
  const cores: Record<string, string> = {
    a_trabalhar: 'bg-blue-100 text-blue-800',
    em_orcamento: 'bg-yellow-100 text-yellow-800',
    em_negociacao: 'bg-orange-100 text-orange-800',
    vencidas: 'bg-red-100 text-red-800',
    a_transmitir: 'bg-purple-100 text-purple-800',
    pendente: 'bg-gray-100 text-gray-800',
    renovado: 'bg-green-100 text-green-800',
    fechado: 'bg-green-100 text-green-800',
    nao_renovada: 'bg-red-100 text-red-800',
    perdido: 'bg-red-100 text-red-800'
  };
  return cores[status] || 'bg-gray-100 text-gray-800';
};