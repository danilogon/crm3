import React, { useState, useMemo } from 'react';
import { Filter, Plus, Upload, Download, CheckCircle, Calendar, Search } from 'lucide-react';
import { RenovacaoSeguro, StatusRenovacao } from '../types';
import { renovacoes as mockRenovacoes, seguradoras, ramos } from '../data/mockData';
import { clientes as mockClientes } from '../data/clientesData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { formatarCpfCnpj, limparCpfCnpj } from '../utils/cpfCnpjValidator';
import { obterDadosClienteParaRenovacao } from '../utils/clienteUtils';
import { useAuth } from '../context/AuthContext';
import RenovacoesList from '../components/Renovacoes/RenovacoesList';
import RenovacaoModal from '../components/Renovacoes/RenovacaoModal';
import ImportRenovacoesModal from '../components/Modals/ImportRenovacoesModal';

const Renovacoes: React.FC = () => {
  const { isAdmin } = useAuth();
  // Usar localStorage para persistir as renovações
  const [renovacoes, setRenovacoes] = useLocalStorage<RenovacaoSeguro[]>('renovacoes', mockRenovacoes);
  const [clientes, setClientes] = useLocalStorage('clientes', mockClientes);
  const [selectedRenovacao, setSelectedRenovacao] = useState<RenovacaoSeguro | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>('');
  const [filtroBusca, setFiltroBusca] = useState<string>('');
  const [filtroMes, setFiltroMes] = useState<number>(0); // 0 = todos os meses
  const [filtroAno, setFiltroAno] = useState<number>(0); // 0 = todos os anos
  const [showImportModal, setShowImportModal] = useState(false);

  const statusOptions: { value: StatusRenovacao; label: string }[] = [
    { value: 'a_trabalhar', label: 'A Trabalhar' },
    { value: 'em_orcamento', label: 'Em Orçamento' },
    { value: 'em_negociacao', label: 'Em Negociação' },
    { value: 'vencidas', label: 'Vencidas' },
    { value: 'a_transmitir', label: 'A Transmitir' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'renovado', label: 'Renovado' },
    { value: 'nao_renovada', label: 'Não Renovada' }
  ];

  const meses = [
    { value: 0, label: 'Todos os meses' },
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

  // Obter anos únicos das renovações para o filtro
  const anosDisponiveis = useMemo(() => {
    const anos = [...new Set(renovacoes.map(r => new Date(r.fimVigencia).getFullYear()))];
    return [0, ...anos.sort((a, b) => b - a)]; // 0 primeiro, depois anos em ordem decrescente
  }, [renovacoes]);
  // Filtrar e ordenar renovações por fim de vigência
  const filteredRenovacoes = useMemo(() => {
    return renovacoes
      .filter(renovacao => {
        // Filtro de busca por nome do cliente ou CPF/CNPJ
        const dadosCliente = obterDadosClienteParaRenovacao(renovacao, clientes);
        const termoBusca = filtroBusca.toLowerCase();
        const matchBusca = filtroBusca.trim() === '' ||
          dadosCliente.nomeCliente.toLowerCase().includes(termoBusca) ||
          (dadosCliente.cpfCnpjCliente && dadosCliente.cpfCnpjCliente.includes(limparCpfCnpj(filtroBusca))) ||
          (dadosCliente.cpfCnpjCliente && formatarCpfCnpj(dadosCliente.cpfCnpjCliente).toLowerCase().includes(termoBusca)) ||
          dadosCliente.emailCliente.toLowerCase().includes(termoBusca);
        
        const dataVigencia = new Date(renovacao.fimVigencia);
        const mesVigencia = dataVigencia.getMonth() + 1;
        const anoVigencia = dataVigencia.getFullYear();
        
        const statusMatch = filtroStatus === '' || renovacao.status === filtroStatus;
        const responsavelMatch = filtroResponsavel === '' || renovacao.responsavel === filtroResponsavel;
        const mesMatch = filtroMes === 0 || mesVigencia === filtroMes;
        const anoMatch = filtroAno === 0 || anoVigencia === filtroAno;
        
        // Filtrar apenas apólices em processo de renovação (excluir finalizadas definitivamente)
        const isEmRenovacao = renovacao.status !== 'nao_renovada' || 
                             new Date(renovacao.fimVigencia) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Últimos 30 dias
        
        return matchBusca && statusMatch && responsavelMatch && mesMatch && anoMatch && isEmRenovacao;
      })
      // Ordenar por data de vencimento (mais próximas primeiro)
      .sort((a, b) => new Date(a.fimVigencia).getTime() - new Date(b.fimVigencia).getTime());
  }, [renovacoes, filtroStatus, filtroResponsavel, filtroMes, filtroAno, filtroBusca]);

  const handleSaveRenovacao = (renovacao: RenovacaoSeguro) => {
    setRenovacoes(prev => prev.map(r => r.id === renovacao.id ? renovacao : r));
  };

  const handleEditRenovacao = (renovacao: RenovacaoSeguro) => {
    setSelectedRenovacao(renovacao);
  };
  
  const handleCreateCliente = (clienteData: Omit<Cliente, 'id' | 'criadoEm' | 'atualizadoEm'>): Cliente => {
    const novoCliente: Cliente = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...clienteData,
      criadoEm: new Date(),
      atualizadoEm: new Date()
    };
    
    setClientes(prev => [...prev, novoCliente]);
    return novoCliente;
  };

  const handleImportRenovacoes = (novasRenovacoes: Omit<RenovacaoSeguro, 'id' | 'criadoEm' | 'atualizadoEm'>[]) => {
    const renovacoesComId = novasRenovacoes.map(renovacaoData => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...renovacaoData,
      criadoEm: new Date(),
      atualizadoEm: new Date()
    }));
    
    setRenovacoes(prev => [...prev, ...renovacoesComId]);
  };

  const handleExport = () => {
    // Simular exportação
    const csvContent = [
      'Cliente,Vigência,Ramo,Seguradora Anterior,Prêmio Anterior,% Comissão Anterior,Comissão Anterior,Seguradora Nova,Prêmio Novo,% Comissão Nova,Comissão Nova,Resultado,Status',
      ...filteredRenovacoes.map(r => [
        r.nomeCliente,
        r.fimVigencia.toLocaleDateString('pt-BR'),
        r.ramo.nome,
        r.seguradoraAnterior.nome,
        r.premioLiquidoAnterior,
        r.percentualComissaoAnterior,
        r.comissaoAnterior,
        r.seguradoraNova?.nome || '',
        r.premioLiquidoNovo || '',
        r.percentualComissaoNova || '',
        r.comissaoNova || '',
        r.resultado || '',
        r.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `renovacoes_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getResponsaveis = () => {
    const responsaveis = [...new Set(renovacoes.map(r => r.responsavel))];
    return responsaveis;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Renovações</h1>
        
        <div className="flex items-center space-x-4">
          {/* Filtros */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-500" />
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={filtroBusca}
                onChange={(e) => setFiltroBusca(e.target.value)}
                placeholder="Buscar por nome ou CPF/CNPJ..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
              />
            </div>
            
            {/* Filtro de Ano */}
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={filtroAno}
                onChange={(e) => setFiltroAno(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {anosDisponiveis.map(ano => (
                  <option key={ano} value={ano}>
                    {ano === 0 ? 'Todos os anos' : ano}
                  </option>
                ))}
              </select>
              
              {/* Filtro de Mês */}
              <select
                value={filtroMes}
                onChange={(e) => setFiltroMes(parseInt(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {meses.map(mes => (
                  <option key={mes.value} value={mes.value}>
                    {mes.label}
                  </option>
                ))}
              </select>
            </div>
            
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os Status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            
            <select
              value={filtroResponsavel}
              onChange={(e) => setFiltroResponsavel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os Responsáveis</option>
              {getResponsaveis().map(responsavel => (
                <option key={responsavel} value={responsavel}>
                  {responsavel}
                </option>
              ))}
            </select>
          </div>

          {/* Ações */}
          <div className="flex items-center space-x-2">
            {isAdmin && (
              <>
                <button 
                  onClick={() => setShowImportModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Importar Renovações
                </button>
                <button 
                  onClick={handleExport}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Exportar
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Informações de ordenação */}
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          📅 Lista ordenada por data de vencimento (mais próximas primeiro) • 
          Exibindo apólices em processo de renovação • 
          {filtroMes > 0 || filtroAno > 0 ? 
            `Filtrado por ${filtroMes > 0 ? meses.find(m => m.value === filtroMes)?.label : 'todos os meses'} ${filtroAno > 0 ? `de ${filtroAno}` : 'de todos os anos'} • ` : ''
          }
          Total: {filteredRenovacoes.length} renovações
        </p>
      </div>

      <RenovacoesList
        renovacoes={filteredRenovacoes}
        clientes={clientes}
        onEdit={handleEditRenovacao}
      />

      {selectedRenovacao && (
        <RenovacaoModal
          renovacao={selectedRenovacao}
          onClose={() => setSelectedRenovacao(null)}
          onSave={handleSaveRenovacao}
        />
      )}

      <ImportRenovacoesModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportRenovacoes}
        clientes={clientes}
        onCreateCliente={handleCreateCliente}
      />
    </div>
  );
};

export default Renovacoes;