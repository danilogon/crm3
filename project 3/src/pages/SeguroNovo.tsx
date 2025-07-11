import React, { useState, useMemo } from 'react';
import { Filter, Plus, Upload, Download, Search } from 'lucide-react';
import { SeguroNovo, StatusSeguroNovo } from '../types';
import { segurosNovos as mockSegurosNovos } from '../data/mockData';
import { clientes as mockClientes } from '../data/clientesData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { formatarCpfCnpj, limparCpfCnpj } from '../utils/cpfCnpjValidator';
import { obterDadosClienteParaSeguroNovo } from '../utils/clienteUtils';
import { useAuth } from '../context/AuthContext';
import SeguroNovoList from '../components/SeguroNovo/SeguroNovoList';
import SeguroNovoModal from '../components/SeguroNovo/SeguroNovoModal';

const SeguroNovoPage: React.FC = () => {
  const { isAdmin } = useAuth();
  // Usar localStorage para persistir os seguros novos
  const [segurosNovos, setSegurosNovos] = useLocalStorage<SeguroNovo[]>('segurosNovos', mockSegurosNovos);
  const [clientes] = useLocalStorage('clientes', mockClientes);
  const [selectedSeguroNovo, setSelectedSeguroNovo] = useState<SeguroNovo | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [filtroResponsavel, setFiltroResponsavel] = useState<string>('');
  const [filtroBusca, setFiltroBusca] = useState<string>('');

  const statusOptions: { value: StatusSeguroNovo; label: string }[] = [
    { value: 'a_trabalhar', label: 'A Trabalhar' },
    { value: 'em_orcamento', label: 'Em Orçamento' },
    { value: 'em_negociacao', label: 'Em Negociação' },
    { value: 'vencidas', label: 'Vencidas' },
    { value: 'a_transmitir', label: 'A Transmitir' },
    { value: 'pendente', label: 'Pendente' },
    { value: 'fechado', label: 'Fechado' },
    { value: 'perdido', label: 'Perdido' }
  ];

  // Filtrar e ordenar seguros novos por início de vigência
  const filteredSegurosNovos = useMemo(() => {
    return segurosNovos
      .filter(seguroNovo => {
        // Filtro de busca por nome do segurado ou CPF/CNPJ
        const dadosCliente = obterDadosClienteParaSeguroNovo(seguroNovo, clientes);
        const termoBusca = filtroBusca.toLowerCase();
        const matchBusca = filtroBusca.trim() === '' ||
          dadosCliente.nomeCliente.toLowerCase().includes(termoBusca) ||
          (dadosCliente.cpfCnpjCliente && dadosCliente.cpfCnpjCliente.includes(limparCpfCnpj(filtroBusca))) ||
          (dadosCliente.cpfCnpjCliente && formatarCpfCnpj(dadosCliente.cpfCnpjCliente).toLowerCase().includes(termoBusca)) ||
          dadosCliente.emailCliente.toLowerCase().includes(termoBusca);
        
        const statusMatch = filtroStatus === '' || seguroNovo.status === filtroStatus;
        const responsavelMatch = filtroResponsavel === '' || seguroNovo.responsavel === filtroResponsavel;
        
        // Filtrar apenas seguros novos (status diferente de perdido indica novo seguro)
        const isNovoSeguro = seguroNovo.status !== 'perdido';
        
        return matchBusca && statusMatch && responsavelMatch && isNovoSeguro;
      })
      // Ordenar por data de contratação (início de vigência)
      .sort((a, b) => new Date(b.inicioVigencia).getTime() - new Date(a.inicioVigencia).getTime());
  }, [segurosNovos, filtroStatus, filtroResponsavel, filtroBusca]);

  const handleSaveSeguroNovo = (seguroNovo: SeguroNovo) => {
    if (seguroNovo.id && segurosNovos.find(s => s.id === seguroNovo.id)) {
      // Editar existente
      setSegurosNovos(prev => prev.map(s => s.id === seguroNovo.id ? seguroNovo : s));
    } else {
      // Adicionar novo
      setSegurosNovos(prev => [...prev, seguroNovo]);
    }
  };

  const handleEditSeguroNovo = (seguroNovo: SeguroNovo) => {
    setSelectedSeguroNovo(seguroNovo);
    setShowModal(true);
  };

  const handleAddSeguroNovo = () => {
    setSelectedSeguroNovo(null);
    setShowModal(true);
  };

  const handleExport = () => {
    // Simular exportação
    const csvContent = [
      'Cliente,E-mail,Telefone,Responsável,Início Vigência,Ramo,Seguradora,Prêmio Líquido,% Comissão,Comissão,Status',
      ...filteredSegurosNovos.map(s => [
        s.nomeCliente,
        s.emailCliente,
        s.telefoneCliente,
        s.responsavel,
        s.inicioVigencia.toLocaleDateString('pt-BR'),
        s.ramo.nome,
        s.seguradoraNova.nome,
        s.premioLiquidoNovo,
        s.percentualComissaoNova,
        s.comissaoNova,
        s.status
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seguros_novos_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getResponsaveis = () => {
    const responsaveis = [...new Set(segurosNovos.map(s => s.responsavel))];
    return responsaveis;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Seguros Novos</h1>
        
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
            <button 
              onClick={handleAddSeguroNovo}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Seguro
            </button>
            {isAdmin && (
              <button 
                onClick={handleExport}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Informações de ordenação */}
      <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="text-sm text-green-700">
          📅 Lista ordenada por data de contratação (mais recentes primeiro) • 
          Exibindo apenas seguros novos • 
          Total: {filteredSegurosNovos.length} seguros novos
        </p>
      </div>

      <SeguroNovoList
        segurosNovos={filteredSegurosNovos}
        clientes={clientes}
        onEdit={handleEditSeguroNovo}
      />

      {showModal && (
        <SeguroNovoModal
          seguroNovo={selectedSeguroNovo || undefined}
          onClose={() => {
            setShowModal(false);
            setSelectedSeguroNovo(null);
          }}
          onSave={handleSaveSeguroNovo}
        />
      )}
    </div>
  );
};

export default SeguroNovoPage;