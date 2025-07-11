import React from 'react';
import { TrendingUp, TrendingDown, Target, Award, Info } from 'lucide-react';
import { formatarMoeda, formatarPercentual, obterMetaAtingidaTaxaConversao, obterMetaAtingidaAumentoComissao, calcularBonusSegurosNovos } from '../../utils/calculations';
import { ConfiguracoesMetas } from '../../types';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { useAuth } from '../../context/AuthContext';
import { configuracoesMetas as mockConfiguracoesMetas } from '../../data/mockData';

interface ComissionChartProps {
  taxaConversaoParaMetas: number;
  aumentoComissao: number;
  comissaoAtual: number;
  comissaoTaxaConversao: number;
  comissaoAumento: number;
  comissaoTotal: number;
  totalComissaoSegurosNovos: number;
  taxaConversaoSegurosNovos: number;
  totalComissaoAReceberSegurosNovos: number;
  temAcessoRenovacoes: boolean;
  temAcessoSegurosNovos: boolean;
  recebeRemuneracaoRenovacoes: boolean;
  recebeRemuneracaoSegurosNovos: boolean;
}

const ComissionChart: React.FC<ComissionChartProps> = ({
  taxaConversaoParaMetas,
  aumentoComissao,
  comissaoAtual,
  comissaoTaxaConversao,
  comissaoAumento,
  comissaoTotal,
  totalComissaoSegurosNovos,
  taxaConversaoSegurosNovos,
  totalComissaoAReceberSegurosNovos,
  temAcessoRenovacoes,
  temAcessoSegurosNovos,
  recebeRemuneracaoRenovacoes,
  recebeRemuneracaoSegurosNovos
}) => {
  const { usuario } = useAuth();
  const [configuracoesMetas] = useLocalStorage<ConfiguracoesMetas>('configuracoesMetas', mockConfiguracoesMetas);
  
  // Calcular bônus dos seguros novos usando as metas configuradas
  const bonusSegurosNovos = temAcessoSegurosNovos && recebeRemuneracaoSegurosNovos ? calcularBonusSegurosNovos(
    totalComissaoSegurosNovos,
    taxaConversaoSegurosNovos,
    configuracoesMetas
  ) : 0;
  
  // Mapear TODAS as metas de taxa de conversão com status de atingimento
  const metasTaxaConversao = temAcessoRenovacoes && recebeRemuneracaoRenovacoes ? configuracoesMetas.metasTaxaConversao.map(meta => {
    const atingida = meta.faixaMaxima === null 
      ? taxaConversaoParaMetas >= meta.faixaMinima
      : taxaConversaoParaMetas >= meta.faixaMinima && taxaConversaoParaMetas <= meta.faixaMaxima;
    
    const valorPotencial = meta.tipoRemuneracao === 'valor_fixo' 
      ? (meta.valorFixo || 0)
      : comissaoAtual * ((meta.percentualComissao || 0) / 100);
    
    return {
      faixa: meta.descricao,
      remuneracao: meta.tipoRemuneracao === 'valor_fixo' 
        ? formatarMoeda(meta.valorFixo || 0)
        : `${meta.percentualComissao}% sobre comissão`,
      valor: valorPotencial,
      atingida,
      recebeRemuneracao: recebeRemuneracaoRenovacoes,
      faixaMinima: meta.faixaMinima,
      faixaMaxima: meta.faixaMaxima
    };
  }) : [];
  
  // Mapear TODAS as metas de aumento de comissão com status de atingimento
  const metasAumento = temAcessoRenovacoes && recebeRemuneracaoRenovacoes ? configuracoesMetas.metasAumentoComissao.map(meta => {
    const atingida = meta.faixaMaxima === null 
      ? aumentoComissao >= meta.faixaMinima
      : aumentoComissao >= meta.faixaMinima && aumentoComissao <= meta.faixaMaxima;
    
    const valorPotencial = meta.tipoRemuneracao === 'valor_fixo' 
      ? (meta.valorFixo || 0)
      : comissaoAtual * ((meta.percentualComissao || 0) / 100);
    
    return {
      faixa: meta.descricao,
      remuneracao: meta.tipoRemuneracao === 'valor_fixo' 
        ? formatarMoeda(meta.valorFixo || 0)
        : `${meta.percentualComissao}% sobre comissão`,
      valor: valorPotencial,
      atingida,
      recebeRemuneracao: recebeRemuneracaoRenovacoes,
      faixaMinima: meta.faixaMinima,
      faixaMaxima: meta.faixaMaxima
    };
  }) : [];

  // Mapear TODAS as metas de seguros novos por comissão gerada
  const metasSegurosNovosComissao = temAcessoSegurosNovos && recebeRemuneracaoSegurosNovos ? configuracoesMetas.metasSegurosNovos
    .filter(meta => meta.tipo === 'comissao_gerada')
    .map(meta => {
      const atingida = meta.faixaMaxima === null 
        ? totalComissaoSegurosNovos >= meta.faixaMinima
        : totalComissaoSegurosNovos >= meta.faixaMinima && totalComissaoSegurosNovos <= meta.faixaMaxima;
      
      const valorPotencial = meta.tipoRemuneracao === 'valor_fixo' 
        ? (meta.valorFixo || 0)
        : totalComissaoSegurosNovos * ((meta.percentualComissao || 0) / 100);
      
      return {
        faixa: meta.descricao,
        remuneracao: meta.tipoRemuneracao === 'valor_fixo' 
          ? formatarMoeda(meta.valorFixo || 0)
          : `${meta.percentualComissao}% sobre comissão`,
        valor: valorPotencial,
        atingida,
        recebeRemuneracao: recebeRemuneracaoSegurosNovos,
        faixaMinima: meta.faixaMinima,
        faixaMaxima: meta.faixaMaxima
      };
    }) : [];

  // Mapear TODAS as metas de seguros novos por taxa de conversão
  const metasSegurosNovosTaxa = temAcessoSegurosNovos && recebeRemuneracaoSegurosNovos ? configuracoesMetas.metasSegurosNovos
    .filter(meta => meta.tipo === 'taxa_conversao')
    .map(meta => {
      const atingida = meta.faixaMaxima === null 
        ? taxaConversaoSegurosNovos >= meta.faixaMinima
        : taxaConversaoSegurosNovos >= meta.faixaMinima && taxaConversaoSegurosNovos <= meta.faixaMaxima;
      
      const valorPotencial = meta.tipoRemuneracao === 'valor_fixo' 
        ? (meta.valorFixo || 0)
        : totalComissaoSegurosNovos * ((meta.percentualComissao || 0) / 100);
      
      return {
        faixa: meta.descricao,
        remuneracao: meta.tipoRemuneracao === 'valor_fixo' 
          ? formatarMoeda(meta.valorFixo || 0)
          : `${meta.percentualComissao}% sobre comissão`,
        valor: valorPotencial,
        atingida,
        recebeRemuneracao: recebeRemuneracaoSegurosNovos,
        faixaMinima: meta.faixaMinima,
        faixaMaxima: meta.faixaMaxima
      };
    }) : [];

  // Calcular total potencial se todas as metas fossem atingidas
  const totalPotencialRenovacoes = recebeRemuneracaoRenovacoes ? 
    Math.max(...metasTaxaConversao.map(meta => meta.valor), 0) +
    Math.max(...metasAumento.map(meta => meta.valor), 0) : 0;
  
  const totalPotencialSegurosNovos = recebeRemuneracaoSegurosNovos ?
    Math.max(...metasSegurosNovosComissao.map(meta => meta.valor), 0) +
    Math.max(...metasSegurosNovosTaxa.map(meta => meta.valor), 0) : 0;

  const totalAtualRecebido = 
    (recebeRemuneracaoRenovacoes ? comissaoTaxaConversao + comissaoAumento : 0) + 
    (recebeRemuneracaoSegurosNovos ? bonusSegurosNovos : 0) +
    (temAcessoSegurosNovos ? totalComissaoAReceberSegurosNovos : 0);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-6">
        Suas Metas e Remunerações
        {!recebeRemuneracaoRenovacoes && !recebeRemuneracaoSegurosNovos ? ' (Não Habilitadas)' :
         recebeRemuneracaoRenovacoes && recebeRemuneracaoSegurosNovos ? ' - Todas as Metas' :
         recebeRemuneracaoRenovacoes ? ' - Renovações Habilitadas' : ' - Seguros Novos Habilitados'}
      </h3>
      
      {/* Resumo de Performance Atual */}
      {(temAcessoRenovacoes && recebeRemuneracaoRenovacoes) && (
      <div className={`grid grid-cols-1 md:grid-cols-${temAcessoSegurosNovos ? '3' : '3'} gap-4 mb-8`}>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Comissão Gerada Renovações</p>
              <p className="text-xl font-semibold text-blue-900">{formatarMoeda(comissaoAtual)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Taxa de Conversão</p>
              <p className="text-xl font-semibold text-green-900">{formatarPercentual(taxaConversaoParaMetas)}</p>
            </div>
            <Target className="w-8 h-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Aumento Comissão</p>
              <p className="text-xl font-semibold text-orange-900">{formatarPercentual(aumentoComissao)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>
      )}

      {/* Resumo de Potencial vs Atual */}
      {(recebeRemuneracaoRenovacoes || recebeRemuneracaoSegurosNovos) && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">💰 Bônus Atual Recebido</p>
              <p className="text-2xl font-bold text-green-800">{formatarMoeda(totalAtualRecebido)}</p>
              <p className="text-xs text-green-600 mt-1">Baseado nas metas atingidas</p>
            </div>
            <Award className="w-10 h-10 text-green-600" />
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">🎯 Potencial Máximo</p>
              <p className="text-2xl font-bold text-blue-800">
                {formatarMoeda(totalPotencialRenovacoes + totalPotencialSegurosNovos)}
              </p>
              <p className="text-xs text-blue-600 mt-1">Se todas as metas fossem atingidas</p>
            </div>
            <Target className="w-10 h-10 text-blue-600" />
          </div>
        </div>
      </div>
      )}

      {/* Metas Taxa de Conversão */}
      {recebeRemuneracaoRenovacoes && metasTaxaConversao.length > 0 && (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-700">Metas de Taxa de Conversão</h4>
          <div className="text-xs text-gray-500">
            Sua taxa atual: <span className="font-semibold">{formatarPercentual(taxaConversaoParaMetas)}</span>
          </div>
        </div>
        <div className="space-y-3">
          {metasTaxaConversao.map((meta, index) => (
            <div key={index} className={`flex items-center justify-between p-4 rounded-lg border-l-4 transition-all ${
              meta.atingida && meta.recebeRemuneracao ? 'bg-green-50 border-green-500 shadow-sm' : 
              meta.atingida && !meta.recebeRemuneracao ? 'bg-blue-50 border-blue-500' :
              'bg-gray-50 border-gray-300 hover:bg-gray-100'
            }`}>
              <div className="flex items-center space-x-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  meta.atingida && meta.recebeRemuneracao ? 'bg-green-500' : 
                  meta.atingida && !meta.recebeRemuneracao ? 'bg-blue-500' :
                  'bg-gray-400'
                }`}>
                  {meta.atingida ? '✓' : index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{meta.faixa}</p>
                  <p className="text-xs text-gray-600">{meta.remuneracao}</p>
                  <p className="text-xs text-gray-500">
                    Faixa: {meta.faixaMinima}% {meta.faixaMaxima ? `- ${meta.faixaMaxima}%` : 'ou mais'}
                  </p>
                  {!meta.recebeRemuneracao && (
                    <p className="text-xs text-orange-600 font-medium">⚠️ Remuneração não habilitada</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${
                  meta.atingida && meta.recebeRemuneracao ? 'text-green-700' :
                  meta.atingida && !meta.recebeRemuneracao ? 'text-blue-700' :
                  'text-gray-600'
                }`}>
                  {meta.recebeRemuneracao ? formatarMoeda(meta.valor) : 'N/A'}
                </p>
                {meta.atingida && meta.recebeRemuneracao && (
                  <p className="text-xs text-green-600 font-bold">✅ RECEBENDO</p>
                )}
                {meta.atingida && !meta.recebeRemuneracao && (
                  <p className="text-xs text-blue-600 font-medium">✓ Atingida - Sem remuneração</p>
                )}
                {!meta.atingida && meta.recebeRemuneracao && (
                  <p className="text-xs text-orange-600 font-medium">🎯 Potencial disponível</p>
                )}
                {!meta.atingida && !meta.recebeRemuneracao && (
                  <p className="text-xs text-gray-500">Meta não atingida</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Metas Aumento de Comissão */}
      {recebeRemuneracaoRenovacoes && metasAumento.length > 0 && (
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-md font-medium text-gray-700">Metas de Aumento de Comissão</h4>
          <div className="text-xs text-gray-500">
            Seu aumento atual: <span className="font-semibold">{formatarPercentual(aumentoComissao)}</span>
          </div>
        </div>
        <div className="space-y-3">
          {metasAumento.map((meta, index) => (
            <div key={index} className={`flex items-center justify-between p-4 rounded-lg border-l-4 transition-all ${
              meta.atingida && meta.recebeRemuneracao ? 'bg-green-50 border-green-500 shadow-sm' : 
              meta.atingida && !meta.recebeRemuneracao ? 'bg-blue-50 border-blue-500' :
              'bg-gray-50 border-gray-300 hover:bg-gray-100'
            }`}>
              <div className="flex items-center space-x-3">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  meta.atingida && meta.recebeRemuneracao ? 'bg-green-500' : 
                  meta.atingida && !meta.recebeRemuneracao ? 'bg-blue-500' :
                  'bg-gray-400'
                }`}>
                  {meta.atingida ? '✓' : index + 1}
                </span>
                <div>
                  <p className="text-sm font-medium text-gray-800">{meta.faixa}</p>
                  <p className="text-xs text-gray-600">{meta.remuneracao}</p>
                  <p className="text-xs text-gray-500">
                    Faixa: {meta.faixaMinima}% {meta.faixaMaxima ? `- ${meta.faixaMaxima}%` : 'ou mais'}
                  </p>
                  {!meta.recebeRemuneracao && (
                    <p className="text-xs text-orange-600 font-medium">⚠️ Remuneração não habilitada</p>
                  )}
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${
                  meta.atingida && meta.recebeRemuneracao ? 'text-green-700' :
                  meta.atingida && !meta.recebeRemuneracao ? 'text-blue-700' :
                  'text-gray-600'
                }`}>
                  {meta.recebeRemuneracao ? formatarMoeda(meta.valor) : 'N/A'}
                </p>
                {meta.atingida && meta.recebeRemuneracao && (
                  <p className="text-xs text-green-600 font-bold">✅ RECEBENDO</p>
                )}
                {meta.atingida && !meta.recebeRemuneracao && (
                  <p className="text-xs text-blue-600 font-medium">✓ Atingida - Sem remuneração</p>
                )}
                {!meta.atingida && meta.recebeRemuneracao && (
                  <p className="text-xs text-orange-600 font-medium">🎯 Potencial disponível</p>
                )}
                {!meta.atingida && !meta.recebeRemuneracao && (
                  <p className="text-xs text-gray-500">Meta não atingida</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Metas de Seguros Novos */}
      {recebeRemuneracaoSegurosNovos && (metasSegurosNovosComissao.length > 0 || metasSegurosNovosTaxa.length > 0) && (
      <div className="mb-8">
        <h4 className="text-md font-medium text-gray-700 mb-4">Metas de Seguros Novos</h4>
        
        {/* Metas por Comissão Gerada */}
        {metasSegurosNovosComissao.length > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-medium text-gray-600">Por Comissão Gerada</h5>
              <div className="text-xs text-gray-500">
                Sua comissão atual: <span className="font-semibold">{formatarMoeda(totalComissaoSegurosNovos)}</span>
              </div>
            </div>
            <div className="space-y-3">
              {metasSegurosNovosComissao.map((meta, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-lg border-l-4 transition-all ${
                  meta.atingida && meta.recebeRemuneracao ? 'bg-green-50 border-green-500 shadow-sm' : 
                  meta.atingida && !meta.recebeRemuneracao ? 'bg-blue-50 border-blue-500' :
                  'bg-gray-50 border-gray-300 hover:bg-gray-100'
                }`}>
                  <div className="flex items-center space-x-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      meta.atingida && meta.recebeRemuneracao ? 'bg-green-500' : 
                      meta.atingida && !meta.recebeRemuneracao ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`}>
                      {meta.atingida ? '✓' : index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{meta.faixa}</p>
                      <p className="text-xs text-gray-600">{meta.remuneracao}</p>
                      <p className="text-xs text-gray-500">
                        Faixa: {formatarMoeda(meta.faixaMinima)} {meta.faixaMaxima ? `- ${formatarMoeda(meta.faixaMaxima)}` : 'ou mais'}
                      </p>
                      {!meta.recebeRemuneracao && (
                        <p className="text-xs text-orange-600 font-medium">⚠️ Remuneração não habilitada</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      meta.atingida && meta.recebeRemuneracao ? 'text-green-700' :
                      meta.atingida && !meta.recebeRemuneracao ? 'text-blue-700' :
                      'text-gray-600'
                    }`}>
                      {meta.recebeRemuneracao ? formatarMoeda(meta.valor) : 'N/A'}
                    </p>
                    {meta.atingida && meta.recebeRemuneracao && (
                      <p className="text-xs text-green-600 font-bold">✅ RECEBENDO</p>
                    )}
                    {meta.atingida && !meta.recebeRemuneracao && (
                      <p className="text-xs text-blue-600 font-medium">✓ Atingida - Sem remuneração</p>
                    )}
                    {!meta.atingida && meta.recebeRemuneracao && (
                      <p className="text-xs text-orange-600 font-medium">🎯 Potencial disponível</p>
                    )}
                    {!meta.atingida && !meta.recebeRemuneracao && (
                      <p className="text-xs text-gray-500">Meta não atingida</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metas por Taxa de Conversão */}
        {metasSegurosNovosTaxa.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h5 className="text-sm font-medium text-gray-600">Por Taxa de Conversão</h5>
              <div className="text-xs text-gray-500">
                Sua taxa atual: <span className="font-semibold">{formatarPercentual(taxaConversaoSegurosNovos)}</span>
              </div>
            </div>
            <div className="space-y-3">
              {metasSegurosNovosTaxa.map((meta, index) => (
                <div key={index} className={`flex items-center justify-between p-4 rounded-lg border-l-4 transition-all ${
                  meta.atingida && meta.recebeRemuneracao ? 'bg-green-50 border-green-500 shadow-sm' : 
                  meta.atingida && !meta.recebeRemuneracao ? 'bg-blue-50 border-blue-500' :
                  'bg-gray-50 border-gray-300 hover:bg-gray-100'
                }`}>
                  <div className="flex items-center space-x-3">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                      meta.atingida && meta.recebeRemuneracao ? 'bg-green-500' : 
                      meta.atingida && !meta.recebeRemuneracao ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`}>
                      {meta.atingida ? '✓' : index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-gray-800">{meta.faixa}</p>
                      <p className="text-xs text-gray-600">{meta.remuneracao}</p>
                      <p className="text-xs text-gray-500">
                        Faixa: {meta.faixaMinima}% {meta.faixaMaxima ? `- ${meta.faixaMaxima}%` : 'ou mais'}
                      </p>
                      {!meta.recebeRemuneracao && (
                        <p className="text-xs text-orange-600 font-medium">⚠️ Remuneração não habilitada</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${
                      meta.atingida && meta.recebeRemuneracao ? 'text-green-700' :
                      meta.atingida && !meta.recebeRemuneracao ? 'text-blue-700' :
                      'text-gray-600'
                    }`}>
                      {meta.recebeRemuneracao ? formatarMoeda(meta.valor) : 'N/A'}
                    </p>
                    {meta.atingida && meta.recebeRemuneracao && (
                      <p className="text-xs text-green-600 font-bold">✅ RECEBENDO</p>
                    )}
                    {meta.atingida && !meta.recebeRemuneracao && (
                      <p className="text-xs text-blue-600 font-medium">✓ Atingida - Sem remuneração</p>
                    )}
                    {!meta.atingida && meta.recebeRemuneracao && (
                      <p className="text-xs text-orange-600 font-medium">🎯 Potencial disponível</p>
                    )}
                    {!meta.atingida && !meta.recebeRemuneracao && (
                      <p className="text-xs text-gray-500">Meta não atingida</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      )}

      {/* Total Final */}
      {(recebeRemuneracaoRenovacoes || recebeRemuneracaoSegurosNovos) && (
      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border-2 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-bold text-gray-800">💰 Resumo Final dos Seus Bônus</p>
              <div className="mt-3 space-y-2">
                {recebeRemuneracaoRenovacoes && (comissaoTaxaConversao + comissaoAumento) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bônus Renovações (recebendo):</span>
                    <span className="font-semibold text-green-700">{formatarMoeda(comissaoTaxaConversao + comissaoAumento)}</span>
                  </div>
                )}
                {recebeRemuneracaoSegurosNovos && bonusSegurosNovos > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bônus Seguros Novos (recebendo):</span>
                    <span className="font-semibold text-green-700">{formatarMoeda(bonusSegurosNovos)}</span>
                  </div>
                )}
                {temAcessoSegurosNovos && totalComissaoAReceberSegurosNovos > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Comissão Seguros Novos (recebendo):</span>
                    <span className="font-semibold text-blue-700">{formatarMoeda(totalComissaoAReceberSegurosNovos)}</span>
                  </div>
                )}
                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-gray-800">Total Atual:</span>
                    <span className="text-xl font-bold text-green-800">{formatarMoeda(totalAtualRecebido)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-blue-600">Potencial Máximo:</span>
                    <span className="text-lg font-bold text-blue-700">{formatarMoeda(totalPotencialRenovacoes + totalPotencialSegurosNovos + (temAcessoSegurosNovos ? totalComissaoAReceberSegurosNovos : 0))}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center">
              <Award className="w-16 h-16 text-blue-600 mx-auto mb-2" />
              <p className="text-xs text-blue-600 font-medium">Seus Bônus</p>
            </div>
          </div>
        </div>
      </div>
      )}
      
      {/* Guia informativo */}
      {!recebeRemuneracaoRenovacoes && !recebeRemuneracaoSegurosNovos && !temAcessoSegurosNovos && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-yellow-600 text-2xl">💼</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-yellow-800">Remuneração por Comissão Padrão</h3>
              <p className="text-yellow-700 mt-1">
                Você não possui acesso a nenhuma área de vendas ou não está habilitado para receber remuneração adicional pelas metas de performance.
              </p>
              <p className="text-yellow-600 text-sm mt-2">
                Entre em contato com a administração para mais informações sobre habilitação de metas.
              </p>
            </div>
          </div>
        </div>
      )}
      
      {(recebeRemuneracaoRenovacoes || recebeRemuneracaoSegurosNovos || temAcessoSegurosNovos) && (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <div className="flex items-start space-x-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Como interpretar suas metas:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-blue-700">
              <div>
                <p><span className="w-3 h-3 inline-block bg-green-500 rounded-full mr-2"></span><strong>✅ RECEBENDO:</strong> Meta atingida e você está recebendo</p>
                <p><span className="w-3 h-3 inline-block bg-blue-500 rounded-full mr-2"></span><strong>Atingida:</strong> Meta atingida mas sem remuneração habilitada</p>
              </div>
              <div>
                <p><span className="w-3 h-3 inline-block bg-orange-500 rounded-full mr-2"></span><strong>🎯 Potencial:</strong> Meta disponível para você atingir</p>
                <p><span className="w-3 h-3 inline-block bg-gray-400 rounded-full mr-2"></span><strong>Não atingida:</strong> Meta ainda não alcançada</p>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-3 font-medium">
              <strong>💰 Dica:</strong> Além das metas, você recebe comissão padrão por cada seguro novo vendido conforme o ramo!
            </p>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default ComissionChart;