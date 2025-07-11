import React, { useState } from 'react';
import { User, Building, Mail, Phone, MapPin, Calendar, CreditCard, MessageSquare, X, ChevronLeft, ChevronRight, Filter, SortAsc, SortDesc } from 'lucide-react';
import { ClienteDetalhado, Card, InteracaoCliente } from '../../types';
import { formatarCpfCnpj } from '../../utils/cpfCnpjValidator';
import { formatarMoeda, formatarData } from '../../utils/calculations';
import CardModal from '../Modals/CardModal';

interface ClienteDetalhesProps {
  cliente: ClienteDetalhado;
  onClose: () => void;
  onSelectCard: (card: Card) => void;
}

const ClienteDetalhes: React.FC<ClienteDetalhesProps> = ({ cliente, onClose, onSelectCard }) => {
  const [activeTab, setActiveTab] = useState<'cards' | 'historico'>('cards');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [ordenacao, setOrdenacao] = useState<'data' | 'valor' | 'status'>('data');
  const [direcaoOrdenacao, setDirecaoOrdenacao] = useState<'asc' | 'desc'>('desc');
  
  const cardsPerPage = 20;

  // Filtrar e ordenar cards
  const cardsFiltrados = cliente.cards
    .filter(card => !filtroStatus || card.status === filtroStatus)
    .sort((a, b) => {
      let comparison = 0;
      
      switch (ordenacao) {
        case 'data':
          comparison = new Date(a.dataCriacao).getTime() - new Date(b.dataCriacao).getTime();
          break;
        case 'valor':
          comparison = a.valorTotal - b.valorTotal;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      
      return direcaoOrdenacao === 'asc' ? comparison : -comparison;
    });

  // Paginação
  const totalPages = Math.ceil(cardsFiltrados.length / cardsPerPage);
  const startIndex = (currentPage - 1) * cardsPerPage;
  const cardsExibidos = cardsFiltrados.slice(startIndex, startIndex + cardsPerPage);

  const handleOrdenacao = (campo: 'data' | 'valor' | 'status') => {
    if (ordenacao === campo) {
      setDirecaoOrdenacao(direcaoOrdenacao === 'asc' ? 'desc' : 'asc');
    } else {
      setOrdenacao(campo);
      setDirecaoOrdenacao('desc');
    }
    setCurrentPage(1);
  };

  const formatarStatusCard = (status: string): { label: string; color: string } => {
    const statusMap = {
      'pendente': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
      'em_analise': { label: 'Em Análise', color: 'bg-blue-100 text-blue-800' },
      'aprovado': { label: 'Aprovado', color: 'bg-green-100 text-green-800' },
      'recusado': { label: 'Recusado', color: 'bg-red-100 text-red-800' }
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, color: 'bg-gray-100 text-gray-800' };
  };

  const formatarTipoInteracao = (tipo: string): { label: string; icon: string; color: string } => {
    const tipoMap = {
      'ligacao': { label: 'Ligação', icon: '📞', color: 'text-blue-600' },
      'email': { label: 'E-mail', icon: '📧', color: 'text-green-600' },
      'reuniao': { label: 'Reunião', icon: '🤝', color: 'text-purple-600' },
      'proposta': { label: 'Proposta', icon: '📋', color: 'text-orange-600' },
      'contrato': { label: 'Contrato', icon: '📄', color: 'text-indigo-600' },
      'outros': { label: 'Outros', icon: '📝', color: 'text-gray-600' }
    };
    return tipoMap[tipo as keyof typeof tipoMap] || { label: tipo, icon: '📝', color: 'text-gray-600' };
  };

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === '1') {
        setActiveTab('cards');
      } else if (e.key === '2') {
        setActiveTab('historico');
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
      <div className="bg-white rounded-xl max-w-7xl w-full max-h-[95vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                cliente.tipo === 'pessoa_juridica' ? 'bg-blue-500' : 'bg-green-500'
              }`}>
                {cliente.tipo === 'pessoa_juridica' ? (
                  <Building className="w-8 h-8 text-white" />
                ) : (
                  <User className="w-8 h-8 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{cliente.nome}</h1>
                <p className="text-blue-100">{formatarCpfCnpj(cliente.cpfCnpj)}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    cliente.statusAtivo ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {cliente.statusAtivo ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className="text-blue-100">
                    {cliente.tipo === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-blue-200 transition-colors p-2 rounded-full hover:bg-blue-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Client Info Cards */}
        <div className="p-6 bg-gray-50 border-b">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-gray-600">E-mail</p>
                  <p className="font-medium text-gray-900 truncate">{cliente.email}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Telefone</p>
                  <p className="font-medium text-gray-900">{cliente.telefone}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">Total Comissão</p>
                  <p className="font-medium text-gray-900">{formatarMoeda(cliente.totalComissaoGerada)}</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">Última Interação</p>
                  <p className="font-medium text-gray-900">
                    {cliente.ultimaInteracao ? formatarData(cliente.ultimaInteracao) : 'Nunca'}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-purple-600">
                  {cliente.tipo === 'pessoa_fisica' ? 'Nascimento' : 'Fundação'}
                </p>
                {cliente.dataNascimento ? (
                  <div>
                    <p className="text-lg font-semibold text-purple-900">
                      {formatarData(cliente.dataNascimento)}
                    </p>
                    <p className="text-xs text-purple-600">
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
                          : `${idade} anos`;
                      })()}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Não informado</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Address */}
        {cliente.endereco && (
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex items-center space-x-2 text-gray-700">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {cliente.endereco.logradouro}, {cliente.endereco.numero}
                {cliente.endereco.complemento && `, ${cliente.endereco.complemento}`}
                {cliente.endereco.bairro && ` - ${cliente.endereco.bairro}`}
                {cliente.endereco.cidade && `, ${cliente.endereco.cidade}`}
                {cliente.endereco.estado && `/${cliente.endereco.estado}`}
                {cliente.endereco.cep && ` - ${cliente.endereco.cep}`}
              </span>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('cards')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'cards'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Cards ({cliente.cards.length})
              <span className="ml-1 text-xs text-gray-400">[1]</span>
            </button>
            <button
              onClick={() => setActiveTab('historico')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'historico'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Histórico ({cliente.interacoes.length})
              <span className="ml-1 text-xs text-gray-400">[2]</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 400px)' }}>
          {activeTab === 'cards' && (
            <div className="p-6">
              {/* Filters and Controls */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <select
                      value={filtroStatus}
                      onChange={(e) => {
                        setFiltroStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Todos os Status</option>
                      <option value="pendente">Pendente</option>
                      <option value="em_analise">Em Análise</option>
                      <option value="aprovado">Aprovado</option>
                      <option value="recusado">Recusado</option>
                    </select>
                  </div>
                </div>
                
                <div className="text-sm text-gray-600">
                  Mostrando {startIndex + 1}-{Math.min(startIndex + cardsPerPage, cardsFiltrados.length)} de {cardsFiltrados.length} cards
                </div>
              </div>

              {/* Cards Table */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleOrdenacao('data')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Número / Data</span>
                          {ordenacao === 'data' && (
                            direcaoOrdenacao === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Descrição
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleOrdenacao('status')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Status</span>
                          {ordenacao === 'status' && (
                            direcaoOrdenacao === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th 
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleOrdenacao('valor')}
                      >
                        <div className="flex items-center space-x-1">
                          <span>Valor</span>
                          {ordenacao === 'valor' && (
                            direcaoOrdenacao === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                          )}
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Responsável
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {cardsExibidos.map((card) => (
                      <tr 
                        key={card.id} 
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => setSelectedCard(card)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{card.numero}</div>
                            <div className="text-sm text-gray-500">{formatarData(card.dataCriacao)}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{card.descricao}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            formatarStatusCard(card.status).color
                          }`}>
                            {formatarStatusCard(card.status).label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatarMoeda(card.valorTotal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {card.responsavel}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {cardsExibidos.length === 0 && (
                  <div className="text-center py-12">
                    <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {filtroStatus ? 'Nenhum card encontrado com este status' : 'Nenhum card cadastrado'}
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-700">
                    Página {currentPage} de {totalPages}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-2 border rounded-md text-sm font-medium ${
                            currentPage === page
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    })}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'historico' && (
            <div className="p-6">
              <div className="space-y-4">
                {cliente.interacoes.length > 0 ? (
                  cliente.interacoes
                    .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())
                    .map((interacao) => {
                      const tipoInfo = formatarTipoInteracao(interacao.tipo);
                      return (
                        <div key={interacao.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                          <div className="flex items-start space-x-4">
                            <div className="text-2xl">{tipoInfo.icon}</div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h3 className={`font-medium ${tipoInfo.color}`}>
                                  {tipoInfo.label}
                                </h3>
                                <span className="text-sm text-gray-500">
                                  {formatarData(interacao.data)}
                                </span>
                              </div>
                              <p className="text-gray-900 mt-1">{interacao.descricao}</p>
                              {interacao.observacoes && (
                                <p className="text-gray-600 text-sm mt-2">{interacao.observacoes}</p>
                              )}
                              <p className="text-gray-500 text-sm mt-2">
                                Responsável: {interacao.responsavel}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma interação registrada</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

              <Calendar className="w-5 h-5 text-orange-600" />
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>Atalhos: [ESC] Fechar • [1] Cards • [2] Histórico</span>
            </div>
            <div>
              Cadastrado em {formatarData(cliente.criadoEm)}
            </div>
          </div>
        </div>
      </div>

      {/* Card Modal */}
      {selectedCard && (
        <CardModal
          card={selectedCard}
          cliente={cliente}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
};

export default ClienteDetalhes;