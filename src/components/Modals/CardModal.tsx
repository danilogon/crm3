import React from 'react';
import { X, CreditCard, Calendar, User, DollarSign, FileText } from 'lucide-react';
import { Card, Cliente } from '../../types';
import { RenovacaoSeguro, SeguroNovo } from '../../types';
import { formatarMoeda, formatarData } from '../../utils/calculations';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { renovacoes as mockRenovacoes, segurosNovos as mockSegurosNovos } from '../../data/mockData';
import { configuracoesMotivos as mockConfiguracoesMotivos } from '../../data/mockData';

interface CardModalProps {
  card: Card;
  cliente: Cliente;
  onClose: () => void;
}

const CardModal: React.FC<CardModalProps> = ({ card, cliente, onClose }) => {
  const [renovacoes] = useLocalStorage('renovacoes', mockRenovacoes);
  const [segurosNovos] = useLocalStorage('segurosNovos', mockSegurosNovos);
  const [configuracoesMotivos] = useLocalStorage('configuracoesMotivos', mockConfiguracoesMotivos);
  
  // Buscar dados detalhados do card
  const obterDadosDetalhados = () => {
    if (card.id.startsWith('renovacao-')) {
      const renovacaoId = card.id.replace('renovacao-', '');
      const renovacao = renovacoes.find(r => r.id === renovacaoId);
      return {
        tipo: 'Renovação',
        dados: renovacao,
        detalhes: renovacao ? {
          seguradoraAnterior: renovacao.seguradoraAnterior?.nome,
          seguradoraNova: renovacao.seguradoraNova?.nome,
          premioAnterior: renovacao.premioLiquidoAnterior,
          premioNovo: renovacao.premioLiquidoNovo,
          comissaoAnterior: renovacao.comissaoAnterior,
          comissaoNova: renovacao.comissaoNova,
          resultado: renovacao.resultado,
          fimVigencia: renovacao.fimVigencia
        } : null
      };
    } else if (card.id.startsWith('seguro-novo-')) {
      const seguroNovoId = card.id.replace('seguro-novo-', '');
      const seguroNovo = segurosNovos.find(s => s.id === seguroNovoId);
      return {
        tipo: 'Seguro Novo',
        dados: seguroNovo,
        detalhes: seguroNovo ? {
          seguradora: seguroNovo.seguradoraNova?.nome,
          premioLiquido: seguroNovo.premioLiquidoNovo,
          comissao: seguroNovo.comissaoNova,
          comissaoAReceber: seguroNovo.comissaoAReceber,
          inicioVigencia: seguroNovo.inicioVigencia
        } : null
      };
    }
    return { tipo: 'Desconhecido', dados: null, detalhes: null };
  };
  
  const { tipo, dados, detalhes } = obterDadosDetalhados();
  
  const obterMotivoPerda = (motivoId: string, tipoMotivo: 'renovacao' | 'seguro_novo') => {
    const motivos = tipoMotivo === 'renovacao' 
      ? configuracoesMotivos.motivosRenovacao 
      : configuracoesMotivos.motivosSeguroNovo;
    return motivos.find(m => m.id === motivoId);
  };
  
  const formatarStatusCard = (status: string): { label: string; color: string } => {
    const statusMap = {
      'pendente': { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'em_analise': { label: 'Em Análise', color: 'bg-blue-100 text-blue-800 border-blue-200' },
      'aprovado': { label: 'Aprovado', color: 'bg-green-100 text-green-800 border-green-200' },
      'recusado': { label: 'Recusado', color: 'bg-red-100 text-red-800 border-red-200' }
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  const statusInfo = formatarStatusCard(card.status);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">{card.numero}</h1>
                <p className="text-purple-100">{tipo} - {card.descricao}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-purple-200 transition-colors p-2 rounded-full hover:bg-purple-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status */}
          <div className="flex items-center justify-center">
            <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full border ${statusInfo.color}`}>
              {statusInfo.label}
            </span>
          </div>

          {/* Card Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              {/* Data de Criação */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <h3 className="font-medium text-gray-900">Data de Cadastro</h3>
                </div>
                <p className="text-gray-700">{formatarData(card.dataCriacao)}</p>
              </div>

              {/* Data de Vigência */}
              {detalhes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <h3 className="font-medium text-gray-900">
                      {tipo === 'Renovação' ? 'Fim de Vigência' : 'Início de Vigência'}
                    </h3>
                  </div>
                  <p className="text-gray-700">
                    {tipo === 'Renovação' && detalhes.fimVigencia 
                      ? formatarData(detalhes.fimVigencia)
                      : tipo === 'Seguro Novo' && detalhes.inicioVigencia
                      ? formatarData(detalhes.inicioVigencia)
                      : 'Não informado'
                    }
                  </p>
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <User className="w-5 h-5 text-green-600" />
                  <h3 className="font-medium text-gray-900">Responsável</h3>
                </div>
                <p className="text-gray-700">{card.responsavel}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Valor Principal */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <h3 className="font-medium text-gray-900">
                    {tipo === 'Renovação' ? 'Prêmio Novo' : 'Prêmio Líquido'}
                  </h3>
                </div>
                <p className="text-2xl font-bold text-purple-600">{formatarMoeda(card.valorTotal)}</p>
                {tipo === 'Renovação' && detalhes?.premioAnterior && (
                  <p className="text-sm text-gray-500 mt-1">
                    Anterior: {formatarMoeda(detalhes.premioAnterior)}
                  </p>
                )}
              </div>

              {/* Comissão */}
              {detalhes && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-3 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <h3 className="font-medium text-gray-900">Comissão</h3>
                  </div>
                  {tipo === 'Renovação' ? (
                    <div>
                      <p className="text-lg font-bold text-green-600">
                        {formatarMoeda(detalhes.comissaoNova || 0)}
                      </p>
                      {detalhes.comissaoAnterior && (
                        <p className="text-sm text-gray-500">
                          Anterior: {formatarMoeda(detalhes.comissaoAnterior)}
                        </p>
                      )}
                      {detalhes.resultado && (
                        <p className={`text-sm font-medium ${
                          detalhes.resultado >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          Resultado: {formatarMoeda(detalhes.resultado)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-lg font-bold text-green-600">
                        {formatarMoeda(detalhes.comissao || 0)}
                      </p>
                      {detalhes.comissaoAReceber && (
                        <p className="text-sm text-blue-600 font-medium">
                          A receber: {formatarMoeda(detalhes.comissaoAReceber)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <h3 className="font-medium text-gray-900">Última Atualização</h3>
                </div>
                <p className="text-gray-700">{formatarData(card.atualizadoEm)}</p>
              </div>
            </div>
          </div>

          {/* Informações Específicas do Tipo */}
          {detalhes && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-900 mb-3">Detalhes do {tipo}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {tipo === 'Renovação' ? (
                  <>
                    {detalhes.seguradoraAnterior && (
                      <div>
                        <span className="text-purple-700 font-medium">Seguradora Anterior:</span>
                        <span className="ml-2 text-purple-800">{detalhes.seguradoraAnterior}</span>
                      </div>
                    )}
                    {detalhes.seguradoraNova && (
                      <div>
                        <span className="text-purple-700 font-medium">Seguradora Nova:</span>
                        <span className="ml-2 text-purple-800">{detalhes.seguradoraNova}</span>
                      </div>
                    )}
                    {dados?.status === 'nao_renovada' && dados?.motivoPerda && (
                      <div className="md:col-span-2">
                        <span className="text-purple-700 font-medium">Motivo da Não Renovação:</span>
                        <div className="ml-2 text-purple-800">
                          {(() => {
                            const motivo = obterMotivoPerda(dados.motivoPerda, 'renovacao');
                            return motivo ? `${motivo.icone} ${motivo.nome}` : '❓ Motivo não encontrado';
                          })()}
                          {dados.motivoOutros && (
                            <div className="text-sm text-purple-600 mt-1 italic">
                              "{dados.motivoOutros}"
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {detalhes.seguradora && (
                      <div>
                        <span className="text-purple-700 font-medium">Seguradora:</span>
                        <span className="ml-2 text-purple-800">{detalhes.seguradora}</span>
                      </div>
                    )}
                    {dados?.status === 'perdido' && dados?.motivoPerda && (
                      <div className="md:col-span-2">
                        <span className="text-purple-700 font-medium">Motivo da Perda:</span>
                        <div className="ml-2 text-purple-800">
                          {(() => {
                            const motivo = obterMotivoPerda(dados.motivoPerda, 'seguro_novo');
                            return motivo ? `${motivo.icone} ${motivo.nome}` : '❓ Motivo não encontrado';
                          })()}
                          {dados.motivoOutros && (
                            <div className="text-sm text-purple-600 mt-1 italic">
                              "{dados.motivoOutros}"
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
          
          {/* Client Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-3">Informações do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700 font-medium">Nome:</span>
                <span className="ml-2 text-blue-800">{cliente.nome}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">E-mail:</span>
                <span className="ml-2 text-blue-800">{cliente.email}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Telefone:</span>
                <span className="ml-2 text-blue-800">{cliente.telefone}</span>
              </div>
              <div>
                <span className="text-blue-700 font-medium">Tipo:</span>
                <span className="ml-2 text-blue-800">
                  {cliente.tipo === 'pessoa_fisica' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                </span>
              </div>
            </div>
          </div>

          {/* Observações do Card Original */}
          {dados?.observacoes && dados.observacoes.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-3 mb-2">
                <FileText className="w-5 h-5 text-gray-600" />
                <h3 className="font-medium text-gray-900">Observações do {tipo}</h3>
              </div>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {dados.observacoes.map((obs: any, index: number) => (
                  <div key={index} className="text-sm">
                    <p className="text-gray-700">{obs.texto}</p>
                    <p className="text-xs text-gray-500">
                      {obs.usuario} - {formatarData(obs.data)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Pressione [ESC] para fechar</span>
            <span>Card ID: {card.id}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;