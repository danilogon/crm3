import React from 'react';
import { Calendar, User, MessageSquare, Paperclip } from 'lucide-react';
import { RenovacaoSeguro } from '../../types';
import { Cliente } from '../../types/customer';
import { formatarMoeda, formatarData, obterStatusLabel, obterCorStatus } from '../../utils/calculations';
import { formatarCpfCnpj } from '../../utils/cpfCnpjValidator';
import { obterDadosClienteParaRenovacao } from '../../utils/clienteUtils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { configuracoesMotivos as mockConfiguracoesMotivos } from '../../data/mockData';

interface RenovacoesListProps {
  renovacoes: RenovacaoSeguro[];
  clientes: Cliente[];
  onEdit: (renovacao: RenovacaoSeguro) => void;
}

const RenovacoesList: React.FC<RenovacoesListProps> = ({ renovacoes, clientes, onEdit }) => {
  const [configuracoesMotivos] = useLocalStorage('configuracoesMotivos', mockConfiguracoesMotivos);
  
  const handleRowClick = (renovacao: RenovacaoSeguro) => {
    onEdit(renovacao);
  };

  const isVencida = (fimVigencia: Date) => {
    return new Date(fimVigencia) < new Date();
  };
  
  const obterMotivoPerda = (motivoId: string) => {
    return configuracoesMotivos.motivosRenovacao.find(m => m.id === motivoId);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente / Responsável
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Vigência
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ramo
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seg. Anterior
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prêmio Ant.
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                % / Com. Ant.
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seg. Nova
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prêmio Novo
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                % / Com. Nova
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resultado
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Obs/Anexos
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {renovacoes.map((renovacao) => {
              const dadosCliente = obterDadosClienteParaRenovacao(renovacao, clientes);
              
              return (
                <tr 
                  key={renovacao.id} 
                  onClick={() => handleRowClick(renovacao)}
                  className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                    isVencida(renovacao.fimVigencia) && renovacao.status !== 'renovado' && renovacao.status !== 'nao_renovada'
                      ? 'bg-red-50 hover:bg-red-100' 
                      : ''
                  }`}
                >
                  <td className="px-3 py-3 text-xs">
                    <div>
                      <div className="font-medium text-gray-900">{dadosCliente.nomeCliente}</div>
                      <div className="text-gray-500 flex items-center mt-1">
                        <User className="w-3 h-3 mr-1" />
                        {renovacao.responsavel}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <div className={`flex items-center ${
                      isVencida(renovacao.fimVigencia) && renovacao.status !== 'renovado' && renovacao.status !== 'nao_renovada'
                        ? 'text-red-600 font-medium' 
                        : 'text-gray-900'
                    }`}>
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatarData(renovacao.fimVigencia)}
                    </div>
                    {isVencida(renovacao.fimVigencia) && renovacao.status !== 'renovado' && renovacao.status !== 'nao_renovada' && (
                      <div className="text-red-500 text-xs font-bold mt-1 bg-red-100 px-1 rounded">VENCIDA</div>
                    )}
                    {renovacao.cpfCnpjCliente && (
                      <div className="text-gray-500 text-xs mt-1">{formatarCpfCnpj(dadosCliente.cpfCnpjCliente)}</div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-900">
                    {renovacao.ramo.nome}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-900">
                    {renovacao.seguradoraAnterior.nome}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-900">
                    {formatarMoeda(renovacao.premioLiquidoAnterior)}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-900">
                    <div>{renovacao.percentualComissaoAnterior}%</div>
                    <div className="text-gray-600">{formatarMoeda(renovacao.comissaoAnterior)}</div>
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-900">
                    {renovacao.seguradoraNova?.nome || '-'}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-900">
                    {renovacao.premioLiquidoNovo ? formatarMoeda(renovacao.premioLiquidoNovo) : '-'}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-900">
                    {renovacao.percentualComissaoNova ? (
                      <div>
                        <div>{renovacao.percentualComissaoNova}%</div>
                        <div className="text-gray-600">{formatarMoeda(renovacao.comissaoNova || 0)}</div>
                      </div>
                    ) : '-'}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {renovacao.resultado ? (
                      <span className={`font-medium ${renovacao.resultado >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatarMoeda(renovacao.resultado)}
                      </span>
                    ) : '-'}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obterCorStatus(renovacao.status)}`}>
                      {obterStatusLabel(renovacao.status)}
                    </span>
                    {renovacao.status === 'nao_renovada' && renovacao.motivoPerda && (
                      <div className="mt-1">
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                          {(() => {
                            const motivo = obterMotivoPerda(renovacao.motivoPerda);
                            return motivo ? `${motivo.icone} ${motivo.nome}` : '❓ Motivo não encontrado';
                          })()}
                        </span>
                        {renovacao.motivoOutros && (
                          <div className="text-xs text-gray-500 mt-1 max-w-[150px] truncate" title={renovacao.motivoOutros}>
                            {renovacao.motivoOutros}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <div className="flex items-center space-x-2">
                      {renovacao.observacoes.length > 0 && (
                        <div className="flex items-center text-blue-600">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          <span>{renovacao.observacoes.length}</span>
                        </div>
                      )}
                      {renovacao.observacoes.some(obs => obs.anexos.length > 0) && (
                        <div className="flex items-center text-green-600">
                          <Paperclip className="w-3 h-3 mr-1" />
                          <span>{renovacao.observacoes.reduce((total, obs) => total + obs.anexos.length, 0)}</span>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {renovacoes.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <p className="text-sm">Nenhuma renovação encontrada com os filtros aplicados</p>
        </div>
      )}
    </div>
  );
};

export default RenovacoesList;