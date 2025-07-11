import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, Plus, Edit, Trash2, User, Phone, Mail, Calendar, Building, UserCheck, CreditCard, Clock, Upload } from 'lucide-react';
import { Cliente, ClienteDetalhado, Card, InteracaoCliente } from '../types';
import { clientes as mockClientes } from '../data/clientesData';
import { renovacoes as mockRenovacoes, segurosNovos as mockSegurosNovos } from '../data/mockData';
import { gerarTodosOsCards, gerarTodasAsInteracoes } from '../data/cardsData';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { useAuth } from '../context/AuthContext';
import { formatarCpfCnpj, limparCpfCnpj } from '../utils/cpfCnpjValidator';
import { formatarMoeda } from '../utils/calculations';
import ClienteModal from '../components/Modals/ClienteModal';
import ClienteSearchBar from '../components/Clientes/ClienteSearchBar';
import ClienteDetalhes from '../components/Clientes/ClienteDetalhes';
import CardModal from '../components/Modals/CardModal';
import ImportClientesModal from '../components/Modals/ImportClientesModal';

const Clientes: React.FC = () => {
  const { isAdmin } = useAuth();
  const [clientes, setClientes] = useLocalStorage<Cliente[]>('clientes', mockClientes);
  const [renovacoes] = useLocalStorage('renovacoes', mockRenovacoes);
  const [segurosNovos] = useLocalStorage('segurosNovos', mockSegurosNovos);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroCpfCnpj, setFiltroCpfCnpj] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [clienteSelecionado, setClienteSelecionado] = useState<ClienteDetalhado | null>(null);
  const [cardSelecionado, setCardSelecionado] = useState<Card | null>(null);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | undefined>();
  const [searchMode, setSearchMode] = useState(false);
  
  // Cache para performance
  const [clientesDetalhados, setClientesDetalhados] = useState<ClienteDetalhado[]>([]);

  // Criar clientes detalhados com cache
  useEffect(() => {
    // Gerar cards e interações dinamicamente dos dados reais
    const cards = gerarTodosOsCards(renovacoes, segurosNovos);
    const interacoes = gerarTodasAsInteracoes(renovacoes, segurosNovos);
    
    const clientesComDetalhes = clientes.map(cliente => {
      const clienteCards = cards.filter(card => card.clienteId === cliente.id);
      const clienteInteracoes = interacoes.filter(interacao => interacao.clienteId === cliente.id);
      
      // Calcular comissão total baseada nos cards reais
      const totalComissaoGerada = clienteCards
        .reduce((total, card) => {
          if (card.status === 'aprovado') {
            // Para renovações, usar o resultado se disponível
            if (card.id.startsWith('renovacao-')) {
              const renovacaoId = card.id.replace('renovacao-', '');
              const renovacao = renovacoes.find(r => r.id === renovacaoId);
              return total + (renovacao?.comissaoNova || 0);
            }
            // Para seguros novos, usar a comissão calculada
            if (card.id.startsWith('seguro-novo-')) {
              const seguroNovoId = card.id.replace('seguro-novo-', '');
              const seguroNovo = segurosNovos.find(s => s.id === seguroNovoId);
              return total + (seguroNovo?.comissaoNova || 0);
            }
          }
          return total;
        }, 0);
      
      const ultimaInteracao = clienteInteracoes.length > 0 
        ? new Date(Math.max(...clienteInteracoes.map(i => new Date(i.data).getTime())))
        : undefined;

      return {
        ...cliente,
        cards: clienteCards,
        interacoes: clienteInteracoes,
        totalComissaoGerada,
        ultimaInteracao,
        statusAtivo: true // Por enquanto todos ativos
      } as ClienteDetalhado;
    });
    
    setClientesDetalhados(clientesComDetalhes);
  }, [clientes, renovacoes, segurosNovos]);

  const clientesFiltrados = useMemo(() => {
    return clientesDetalhados.filter(cliente => {
      const nomeMatch = !filtroNome || cliente.nome.toLowerCase().includes(filtroNome.toLowerCase());
      const cpfCnpjMatch = !filtroCpfCnpj || 
        cliente.cpfCnpj.includes(limparCpfCnpj(filtroCpfCnpj)) ||
        formatarCpfCnpj(cliente.cpfCnpj).includes(filtroCpfCnpj);
      const tipoMatch = !filtroTipo || cliente.tipo === filtroTipo;
      
      return nomeMatch && cpfCnpjMatch && tipoMatch;
    }).sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [clientesDetalhados, filtroNome, filtroCpfCnpj, filtroTipo]);

  const formatarData = (data: Date): string => {
    return new Intl.DateTimeFormat('pt-BR').format(new Date(data));
  };

  const handleAddCliente = () => {
    setEditingCliente(undefined);
    setShowClienteModal(true);
  };

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente);
    setShowClienteModal(true);
  };

  const handleSaveCliente = (clienteData: Omit<Cliente, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    if (editingCliente) {
      // Editar
      setClientes(prev => prev.map(c => 
        c.id === editingCliente.id 
          ? { ...editingCliente, ...clienteData, atualizadoEm: new Date() }
          : c
      ));
    } else {
      // Adicionar
      const novoCliente: Cliente = {
        id: Date.now().toString(),
        ...clienteData,
        criadoEm: new Date(),
        atualizadoEm: new Date()
      };
      setClientes(prev => [...prev, novoCliente]);
    }
  };

  const handleDeleteCliente = (id: string) => {
    if (!isAdmin) {
      alert('Apenas administradores podem excluir clientes.');
      return;
    }
    
    if (confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      setClientes(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleImportClientes = (novosClientes: Omit<Cliente, 'id' | 'criadoEm' | 'atualizadoEm'>[]) => {
    const clientesComId = novosClientes.map(clienteData => ({
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...clienteData,
      criadoEm: new Date(),
      atualizadoEm: new Date()
    }));
    
    setClientes(prev => [...prev, ...clientesComId]);
  };

  const handleSelectCliente = (cliente: Cliente) => {
    const clienteDetalhado = clientesDetalhados.find(c => c.id === cliente.id);
    if (clienteDetalhado) {
      setClienteSelecionado(clienteDetalhado);
      setSearchMode(false);
    }
  };

  const handleSelectCard = (card: Card) => {
    setCardSelecionado(card);
    setSearchMode(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setSearchMode(true);
      } else if (e.key === 'Escape') {
        setSearchMode(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="p-6">
      {/* Search Mode Overlay */}
      {searchMode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-4xl shadow-2xl">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Busca Avançada</h2>
              <p className="text-sm text-gray-600">
                Digite pelo menos 2 caracteres para buscar clientes ou números de cards
              </p>
            </div>
            <ClienteSearchBar
              clientes={clientes}
              cards={gerarTodosOsCards(renovacoes, segurosNovos)}
              onSelectCliente={handleSelectCliente}
              onSelectCard={handleSelectCard}
              autoFocus={true}
            />
            <div className="mt-4 text-xs text-gray-500 text-center">
              Pressione [ESC] para fechar • [Ctrl+K] para abrir busca
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <UserCheck className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Clientes</h1>
            <p className="text-sm text-gray-600">Gerencie o cadastro de clientes</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setSearchMode(true)}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <Search className="w-4 h-4 mr-2" />
            Busca Avançada
            <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">Ctrl+K</span>
          </button>
          {isAdmin && (
            <button 
              onClick={() => setShowImportModal(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Importar Clientes
            </button>
          )}
          <button 
            onClick={handleAddCliente}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </button>
        </div>
      </div>

      {/* Quick Search Bar */}
      <div className="mb-6">
        <ClienteSearchBar
          clientes={clientes}
          cards={gerarTodosOsCards(renovacoes, segurosNovos)}
          onSelectCliente={handleSelectCliente}
          onSelectCard={handleSelectCard}
          placeholder="Busca rápida por cliente ou card..."
        />
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nome..."
              value={filtroNome}
              onChange={(e) => setFiltroNome(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <input
              type="text"
              placeholder="CPF/CNPJ..."
              value={filtroCpfCnpj}
              onChange={(e) => setFiltroCpfCnpj(e.target.value)}
              className="px-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="px-3 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos os tipos</option>
              <option value="pessoa_fisica">Pessoa Física</option>
              <option value="pessoa_juridica">Pessoa Jurídica</option>
            </select>
          </div>
        </div>
      </div>

      {/* Informações dos resultados */}
      <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-700">
          👥 Total de clientes encontrados: {clientesFiltrados.length} de {clientesDetalhados.length} cadastrados
        </p>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data Nascimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CPF/CNPJ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cards / Comissão
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Última Interação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clientesFiltrados.map((cliente) => (
                <tr 
                  key={cliente.id} 
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => setClienteSelecionado(cliente)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        cliente.tipo === 'pessoa_juridica' ? 'bg-blue-600' : 'bg-green-600'
                      }`}>
                        {cliente.tipo === 'pessoa_juridica' ? (
                          <Building className="w-5 h-5 text-white" />
                        ) : (
                          <User className="w-5 h-5 text-white" />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{cliente.nome}</div>
                        {cliente.endereco && (
                          <div className="text-sm text-gray-500">
                            {cliente.endereco.cidade}, {cliente.endereco.estado}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <Mail className="w-4 h-4 text-gray-400 mr-2" />
                        <span className="truncate max-w-[200px]" title={cliente.email}>
                          {cliente.email}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 text-gray-400 mr-2" />
                        {cliente.telefone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                      {cliente.dataNascimento ? (
                        <div>
                          <div>{formatarData(cliente.dataNascimento)}</div>
                          <div className="text-xs text-gray-500">
                            {(() => {
                              const hoje = new Date();
                              const nascimento = new Date(cliente.dataNascimento);
                              let idade = hoje.getFullYear() - nascimento.getFullYear();
                              const mesAtual = hoje.getMonth();
                              const mesNascimento = nascimento.getMonth();
                              
                              if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
                                idade--;
                              }
                              
                              return cliente.tipo === 'pessoa_fisica' 
                                ? `${idade} anos` 
                                : `${idade} anos de fundação`;
                            })()}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Não informado</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatarCpfCnpj(cliente.cpfCnpj)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      cliente.tipo === 'pessoa_fisica' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {cliente.tipo === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 text-purple-400 mr-2" />
                        <span>{cliente.cards.length} cards</span>
                      </div>
                      <div className="text-xs text-gray-600">
                        {formatarMoeda(cliente.totalComissaoGerada)} gerados
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-gray-400 mr-2" />
                      {cliente.ultimaInteracao ? formatarData(cliente.ultimaInteracao) : 'Nunca'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEditCliente(cliente)}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditCliente(cliente);
                        }}
                        className="text-blue-600 hover:text-blue-900 transition-colors"
                        title="Editar cliente"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button 
                          onClick={() => handleDeleteCliente(cliente.id)}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCliente(cliente.id);
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Excluir cliente (apenas admin)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {clientesFiltrados.length === 0 && (
          <div className="text-center text-gray-500 py-12">
            <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm">
              {clientesDetalhados.length === 0 
                ? 'Nenhum cliente cadastrado ainda' 
                : 'Nenhum cliente encontrado com os filtros aplicados'
              }
            </p>
            {clientesDetalhados.length === 0 && (
              <button 
                onClick={handleAddCliente}
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Cadastrar primeiro cliente
              </button>
            )}
          </div>
        )}
      </div>

      {/* Modal de Cliente */}
      <ClienteModal
        isOpen={showClienteModal}
        onClose={() => setShowClienteModal(false)}
        onSave={handleSaveCliente}
        cliente={editingCliente}
      />

      {/* Modal de Importação de Clientes */}
      <ImportClientesModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportClientes}
        clientesExistentes={clientes}
      />

      {/* Cliente Details Modal */}
      {clienteSelecionado && (
        <ClienteDetalhes
          cliente={clienteSelecionado}
          onClose={() => setClienteSelecionado(null)}
          onSelectCard={setCardSelecionado}
        />
      )}

      {/* Card Modal */}
      {cardSelecionado && (
        <CardModal
          card={cardSelecionado}
          cliente={clientes.find(c => c.id === cardSelecionado.clienteId)!}
          onClose={() => setCardSelecionado(null)}
        />
      )}
    </div>
  );
};

export default Clientes;