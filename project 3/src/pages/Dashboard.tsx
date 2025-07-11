import React, { useState, useMemo } from 'react';
import { Calendar, TrendingUp, Target, DollarSign, Users, Award, Shield, PieChart } from 'lucide-react';
import { RenovacaoSeguro, MetricasDashboard } from '../types';
import { renovacoes as mockRenovacoes, segurosNovos as mockSegurosNovos, configuracoesMetas as mockConfiguracoesMetas } from '../data/mockData';
import { clientes as mockClientes } from '../data/clientesData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../context/AuthContext';
import { obterDadosClienteParaRenovacao, obterDadosClienteParaSeguroNovo } from '../utils/clienteUtils';
import {
  calcularTaxaConversao,
  calcularTaxaConversaoGeral,
  calcularAumentoComissao,
  calcularComissaoTaxaConversao,
  calcularComissaoAumento,
  formatarMoeda,
  formatarPercentual
} from '../utils/calculations';
import MetricCard from '../components/Dashboard/MetricCard';
import ComissionChart from '../components/Dashboard/ComissionChart';

const Dashboard: React.FC = () => {
  const { isAdmin, isAdminOrGestor, usuario } = useAuth();
  // Usar dados persistidos do localStorage
  const [renovacoes] = useLocalStorage('renovacoes', mockRenovacoes);
  const [segurosNovos] = useLocalStorage('segurosNovos', mockSegurosNovos);
  const [clientes] = useLocalStorage('clientes', mockClientes);
  const [configuracoesMetas] = useLocalStorage('configuracoesMetas', mockConfiguracoesMetas);
  const [mesSelecionado, setMesSelecionado] = useState<number>(new Date().getMonth() + 1);
  const [anoSelecionado, setAnoSelecionado] = useState<number>(new Date().getFullYear());
  const [responsavelSelecionado, setResponsavelSelecionado] = useState<string>('');

  // Redirecionar se não for admin
  if (!isAdminOrGestor && (!usuario?.acessoRenovacoes && !usuario?.acessoSegurosNovos)) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-800 mb-2">Acesso Restrito</h2>
          <p className="text-red-600">
            Você não possui permissão para acessar o dashboard.
          </p>
        </div>
      </div>
    );
  }

  // Verificar permissões do usuário
  const temAcessoRenovacoes = isAdminOrGestor || usuario?.acessoRenovacoes;
  const temAcessoSegurosNovos = isAdminOrGestor || usuario?.acessoSegurosNovos;

  const metricas = useMemo(() => {
    // Para usuários não admin, filtrar apenas seus próprios dados
    const filtroUsuario = !isAdminOrGestor && usuario ? usuario.nome : null;
    
    // Filtrar renovações apenas se o usuário tem acesso
    const renovacoesFiltradas = temAcessoRenovacoes ? renovacoes.filter(renovacao => {
      const dataVigencia = new Date(renovacao.fimVigencia);
      const mesVigencia = dataVigencia.getMonth() + 1;
      const anoVigencia = dataVigencia.getFullYear();
      
      const mesMatch = mesVigencia === mesSelecionado;
      const anoMatch = anoVigencia === anoSelecionado;
      const responsavelMatch = responsavelSelecionado === '' || renovacao.responsavel === responsavelSelecionado;
      const usuarioMatch = filtroUsuario === null || renovacao.responsavel === filtroUsuario;
      
      return mesMatch && anoMatch && responsavelMatch && usuarioMatch;
    }) : [];

    // Filtrar seguros novos apenas se o usuário tem acesso
    const segurosNovosFiltrados = temAcessoSegurosNovos ? segurosNovos.filter(seguro => {
      const dataVigencia = new Date(seguro.inicioVigencia);
      const mesVigencia = dataVigencia.getMonth() + 1;
      const anoVigencia = dataVigencia.getFullYear();
      
      const mesMatch = mesVigencia === mesSelecionado;
      const anoMatch = anoVigencia === anoSelecionado;
      const responsavelMatch = responsavelSelecionado === '' || seguro.responsavel === responsavelSelecionado;
      const usuarioMatch = filtroUsuario === null || seguro.responsavel === filtroUsuario;
      
      return mesMatch && anoMatch && responsavelMatch && usuarioMatch;
    }) : [];

    const segurosNovosFechados = segurosNovosFiltrados.filter(s => s.status === 'fechado');
    const segurosNovosPerdidos = segurosNovosFiltrados.filter(s => s.status === 'perdido');
    const totalSegurosNovos = segurosNovosFechados.length + segurosNovosPerdidos.length;

    // Taxa de conversão específica para seguros novos
    const taxaConversaoSegurosNovos = calcularTaxaConversao(segurosNovosFechados.length, totalSegurosNovos);

    // Seguros novos fechados por ramo
    const segurosPorRamo = segurosNovosFechados.reduce((acc, seguro) => {
      const ramoNome = seguro.ramo.nome;
      if (!acc[ramoNome]) {
        acc[ramoNome] = {
          quantidade: 0,
          comissaoTotal: 0
        };
      }
      acc[ramoNome].quantidade++;
      acc[ramoNome].comissaoTotal += seguro.comissaoNova || 0;
      return acc;
    }, {} as Record<string, { quantidade: number; comissaoTotal: number }>);

    // Calcular bônus dos seguros novos por ramo
    const bonusSegurosNovos = segurosNovosFechados.reduce((total, seguro) => {
      if (seguro.ramo.tipoComissaoSeguroNovo === 'valor_fixo') {
        return total + (seguro.ramo.valorFixoSeguroNovo || 0);
      } else {
        const comissaoGerada = seguro.comissaoNova || 0;
        const percentualBonus = seguro.ramo.percentualComissaoSeguroNovo || 0;
        return total + (comissaoGerada * (percentualBonus / 100));
      }
    }, 0);

    // Calcular total da comissão a receber dos seguros novos (independente das metas)
    const totalComissaoAReceberSegurosNovos = segurosNovosFechados.reduce((total, seguro) => {
      return total + (seguro.comissaoAReceber || 0);
    }, 0);

    // Calcular comissão gerada dos seguros novos
    const totalComissaoSegurosNovos = segurosNovosFechados.reduce((sum, s) => sum + (s.comissaoNova || 0), 0);
    const renovadas = renovacoesFiltradas.filter(r => r.status === 'renovado');
    const naoRenovadas = renovacoesFiltradas.filter(r => r.status === 'nao_renovada');
    const totalRenovacoes = renovadas.length + naoRenovadas.length;

    // Taxa de conversão geral (apenas para quem tem acesso a ambas as áreas)
    // Para a taxa de conversão geral, consideramos seguros novos fechados + renovados / (renovações totais + seguros novos totais)
    // Mas para as metas de renovação, consideramos apenas renovados / (renovados + não renovados)
    const taxaConversaoGeral = calcularTaxaConversaoGeral(renovadas.length, segurosNovosFechados.length, totalRenovacoes, totalSegurosNovos);
    
    // Taxa de conversão específica para renovações
    const taxaConversaoRenovacoes = calcularTaxaConversao(renovadas.length, totalRenovacoes);
    
    const totalComissaoRenovacoes = renovadas.reduce((sum, r) => sum + (r.comissaoNova || 0), 0);
    const totalResultado = renovadas.reduce((sum, r) => sum + (r.resultado || 0), 0);
    const aumentoComissao = calcularAumentoComissao(totalResultado, totalComissaoRenovacoes);
    
    // Calcular totais gerais para a taxa de conversão geral
    const totalFechados = renovadas.length + segurosNovosFechados.length;
    const totalGeral = totalRenovacoes + totalSegurosNovos;
    
    // Para o comissionamento por metas, a taxa de conversão considera:
    // (seguros renovados + seguros novos fechados) / (seguros renovados + seguros não renovados)
    // Nota: seguros novos perdidos NÃO entram no denominador
    const numeradorMetas = renovadas.length + segurosNovosFechados.length;
    const denominadorMetas = renovadas.length + naoRenovadas.length; // apenas renovações, não inclui seguros novos perdidos
    const taxaConversaoParaMetas = denominadorMetas > 0 ? (numeradorMetas / denominadorMetas) * 100 : 0;
    
    const comissaoTaxaConversao = calcularComissaoTaxaConversao(taxaConversaoParaMetas, totalComissaoRenovacoes, configuracoesMetas);
    const comissaoAumento = calcularComissaoAumento(aumentoComissao, totalComissaoRenovacoes, configuracoesMetas);
    const comissaoTotal = comissaoTaxaConversao + comissaoAumento;

    return {
      renovadas: renovadas.length,
      segurosNovosFechados: segurosNovosFechados.length,
      segurosNovosPerdidos: segurosNovosPerdidos.length,
      totalSegurosNovos,
      naoRenovadas: naoRenovadas.length,
      totalRenovacoes,
      totalGeral,
      totalFechados,
      taxaConversaoParaMetas,
      taxaConversaoGeral,
      taxaConversaoRenovacoes,
      taxaConversaoSegurosNovos,
      segurosPorRamo,
      aumentoComissao,
      totalComissaoRenovacoes,
      totalComissaoSegurosNovos,
      totalResultado,
      comissaoTaxaConversao,
      comissaoAumento,
      comissaoTotal,
      bonusSegurosNovos,
      totalComissaoAReceberSegurosNovos,
      responsavel: responsavelSelecionado
    };
  }, [mesSelecionado, anoSelecionado, responsavelSelecionado, renovacoes, segurosNovos, temAcessoRenovacoes, temAcessoSegurosNovos, configuracoesMetas]);

  const responsaveis = useMemo(() => {
    // Para usuários não admin, mostrar apenas o próprio nome
    if (!isAdminOrGestor && usuario) {
      return [usuario.nome];
    }
    
    const responsaveisRenovacoes = temAcessoRenovacoes ? renovacoes.map(r => r.responsavel) : [];
    const responsaveisSegurosNovos = temAcessoSegurosNovos ? segurosNovos.map(s => s.responsavel) : [];
    return [...new Set([...responsaveisRenovacoes, ...responsaveisSegurosNovos])];
  }, [renovacoes, segurosNovos, clientes, temAcessoRenovacoes, temAcessoSegurosNovos, isAdminOrGestor, usuario]);

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">
            Dashboard {isAdmin ? 'Administrativo' : isAdminOrGestor ? 'Gerencial' : 'Pessoal'}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            {responsavelSelecionado 
              ? `Resultados de ${responsavelSelecionado}` 
              : isAdminOrGestor ? 'Resultados consolidados de todos os usuários' : 'Seus resultados pessoais e metas'
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-500" />
            <select
              value={mesSelecionado}
              onChange={(e) => setMesSelecionado(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {meses.map(mes => (
                <option key={mes.value} value={mes.value}>
                  {mes.label}
                </option>
              ))}
            </select>
            
            <select
              value={anoSelecionado}
              onChange={(e) => setAnoSelecionado(parseInt(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={2023}>2023</option>
              <option value={2024}>2024</option>
              <option value={2025}>2025</option>
            </select>
            
            <select
              value={responsavelSelecionado}
              onChange={(e) => setResponsavelSelecionado(e.target.value)}
              className={`px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[200px] ${
                !isAdminOrGestor ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={!isAdminOrGestor}
            >
              {isAdminOrGestor && <option value="">📊 Todos os Usuários</option>}
              {responsaveis.map(responsavel => (
                <option key={responsavel} value={responsavel}>
                  👤 {responsavel} {!isAdminOrGestor && responsavel === usuario?.nome ? '(Você)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Indicador de Filtro Ativo */}
      {responsavelSelecionado && isAdminOrGestor && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">
                Visualizando resultados de: {responsavelSelecionado}
              </span>
            </div>
            <button
              onClick={() => setResponsavelSelecionado('')}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Ver todos os usuários
            </button>
          </div>
        </div>
      )}

      {/* Indicador para usuários não-admin */}
      {!isAdminOrGestor && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-600" />
            <span className="text-green-800 font-medium">
              📊 Visualizando seus resultados pessoais e metas de comissionamento
            </span>
          </div>
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        
        {/* Taxa de Conversão Renovações - apenas para quem tem acesso */}
        {temAcessoRenovacoes && (
          <MetricCard
            title="Taxa Conversão Renovações"
            value={formatarPercentual(metricas.taxaConversaoRenovacoes)}
            description={`${metricas.renovadas} de ${metricas.totalRenovacoes} renovações`}
            icon={Target}
            color="blue"
          />
        )}
        
        {/* Taxa de Conversão Seguros Novos - apenas para quem tem acesso */}
        {temAcessoSegurosNovos && (
          <MetricCard
            title="Taxa Conversão Seg. Novos"
            value={formatarPercentual(metricas.taxaConversaoSegurosNovos)}
            description={`${metricas.segurosNovosFechados} de ${metricas.totalSegurosNovos} seguros novos`}
            icon={Target}
            color="green"
          />
        )}
        
        {/* Aumento de Comissão - apenas para renovações */}
        {temAcessoRenovacoes && (
          <MetricCard
            title="Aumento de Comissão"
            value={formatarPercentual(metricas.aumentoComissao)}
            description={`Resultado: ${formatarMoeda(metricas.totalResultado)}`}
            icon={TrendingUp}
            color="orange"
          />
        )}
        
        {/* Comissão Gerada - apenas para renovações */}
        {temAcessoRenovacoes && (
          <MetricCard
            title="Comissão Gerada Renovações"
            value={formatarMoeda(metricas.totalComissaoRenovacoes)}
            description="Comissão renovações acumulada"
            icon={DollarSign}
            color="blue"
          />
        )}
        
        {/* Comissão Gerada Seguros Novos - apenas para quem tem acesso */}
        {temAcessoSegurosNovos && (
          <MetricCard
            title="Comissão Gerada Seguros Novos"
            value={formatarMoeda(metricas.totalComissaoSegurosNovos)}
            description="Comissão seguros novos acumulada"
            icon={DollarSign}
            color="green"
          />
        )}
      </div>

      {/* Resumo de Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {/* Resumo de Renovações - apenas para quem tem acesso */}
        {temAcessoRenovacoes && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo de Renovações</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Renovadas</span>
                <span className="font-semibold text-green-600">{metricas.renovadas}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Não Renovadas</span>
                <span className="font-semibold text-red-600">{metricas.naoRenovadas}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-gray-800 font-medium">Total Renovações</span>
                <span className="font-semibold text-gray-800">{metricas.totalRenovacoes}</span>
              </div>
            </div>
          </div>
        )}

        {/* Resumo de Seguros Novos - apenas para quem tem acesso */}
        {temAcessoSegurosNovos && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumo de Seguros Novos</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Fechados</span>
                <span className="font-semibold text-green-600">{metricas.segurosNovosFechados}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Perdidos</span>
                <span className="font-semibold text-red-600">{metricas.segurosNovosPerdidos}</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="text-gray-800 font-medium">Total Seguros Novos</span>
                <span className="font-semibold text-gray-800">{metricas.totalSegurosNovos}</span>
              </div>
            </div>
          </div>
        )}

        {/* Seguros Novos por Ramo - apenas para quem tem acesso */}
        {temAcessoSegurosNovos && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <PieChart className="w-5 h-5 mr-2" />
              Comissão Seguros Novos
            </h3>
            <div className="space-y-3">
              {Object.entries(metricas.segurosPorRamo).length > 0 ? (
                Object.entries(metricas.segurosPorRamo).map(([ramo, dados]) => (
                  <div key={ramo} className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="text-gray-600 font-medium">{ramo}</div>
                      <div className="text-xs text-gray-500">
                        {dados.quantidade} seguro{dados.quantidade !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600">{formatarMoeda(dados.comissaoTotal)}</div>
                      <div className="text-xs text-gray-500">{dados.quantidade} un.</div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Nenhum seguro novo fechado no período</p>
              )}
            </div>
          </div>
        )}


      </div>

      {/* Gráfico de Comissionamento */}
      {!isAdminOrGestor && (usuario?.recebeRemuneracaoRenovacoes || usuario?.recebeRemuneracaoSegurosNovos) && (
        <ComissionChart
          taxaConversaoParaMetas={metricas.taxaConversaoParaMetas}
          aumentoComissao={metricas.aumentoComissao}
          comissaoAtual={metricas.totalComissaoRenovacoes}
          comissaoTaxaConversao={metricas.comissaoTaxaConversao}
          comissaoAumento={metricas.comissaoAumento}
          comissaoTotal={metricas.comissaoTotal}
          totalComissaoSegurosNovos={temAcessoSegurosNovos ? metricas.totalComissaoSegurosNovos : 0}
          taxaConversaoSegurosNovos={temAcessoSegurosNovos ? metricas.taxaConversaoSegurosNovos : 0}
          totalComissaoAReceberSegurosNovos={temAcessoSegurosNovos ? metricas.totalComissaoAReceberSegurosNovos : 0}
          temAcessoRenovacoes={temAcessoRenovacoes}
          temAcessoSegurosNovos={temAcessoSegurosNovos}
          recebeRemuneracaoRenovacoes={usuario?.recebeRemuneracaoRenovacoes || false}
          recebeRemuneracaoSegurosNovos={usuario?.recebeRemuneracaoSegurosNovos || false}
        />
      )}
      
      {/* Aviso para usuários sem remuneração por metas */}
      {!isAdminOrGestor && !usuario?.recebeRemuneracaoRenovacoes && !usuario?.recebeRemuneracaoSegurosNovos && !temAcessoSegurosNovos && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-yellow-600 text-lg">💼</span>
            </div>
            <div>
              <h3 className="text-lg font-medium text-yellow-800">Remuneração por Comissão Padrão</h3>
              <p className="text-yellow-700 mt-1">
                Você não possui acesso a nenhuma área de vendas ou não está habilitado para receber remuneração adicional pelas metas de performance.
              </p>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default Dashboard;