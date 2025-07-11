import React from 'react';
import { Calendar, User, MessageSquare, Paperclip, Mail, Phone } from 'lucide-react';
import { SeguroNovo } from '../../types';
import { Cliente } from '../../types/customer';
import { formatarMoeda, formatarData, obterStatusLabel, obterCorStatus } from '../../utils/calculations';
import { formatarCpfCnpj } from '../../utils/cpfCnpjValidator';
import { obterDadosClienteParaSeguroNovo } from '../../utils/clienteUtils';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { configuracoesMotivos as mockConfiguracoesMotivos } from '../../data/mockData';

interface SeguroNovoListProps {
  segurosNovos: SeguroNovo[];
  clientes: Cliente[];
  onEdit: (seguroNovo: SeguroNovo) => void;
}

const SeguroNovoList: React.FC<SeguroNovoListProps> = ({ segurosNovos, clientes, onEdit }) => {
  const [configuracoesMotivos] = useLocalStorage('configuracoesMotivos', mockConfiguracoesMotivos);
  
  const handleRowClick = (seguroNovo: SeguroNovo) => {
    onEdit(seguroNovo);
  };
  
  const obterMotivoPerda = (motivoId: string) => {
    return configuracoesMotivos.motivosSeguroNovo.find(m => m.id === motivoId);
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
                Início Vigência
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ramo
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seguradora
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prêmio Líquido
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                % / Comissão
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Comissão a Receber
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
            {segurosNovos.map((seguroNovo) => {
              const dadosCliente = obterDadosClienteParaSeguroNovo(seguroNovo, clientes);
              
              return (
                <tr 
                  key={seguroNovo.id} 
                  onClick={() => handleRowClick(seguroNovo)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <td className="px-3 py-3 text-xs">
                    <div>
                      <div className="font-medium text-gray-900">{dadosCliente.nomeCliente}</div>
                      <div className="text-gray-500 flex items-center mt-1">
                        <Mail className="w-3 h-3 mr-1" />
                        <span className="truncate max-w-[120px]" title={dadosCliente.emailCliente}>
                          {dadosCliente.emailCliente}
                        </span>
                      </div>
                      <div className="text-gray-500 flex items-center mt-1">
                        <Phone className="w-3 h-3 mr-1" />
                        {dadosCliente.telefoneCliente}
                      </div>
                      <div className="text-gray-500 flex items-center mt-1">
                        <User className="w-3 h-3 mr-1" />
                        {seguroNovo.responsavel}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <div className="flex items-center text-gray-900">
                      <Calendar className="w-3 h-3 mr-1" />
                      {formatarData(seguroNovo.inicioVigencia)}
                    </div>
                    {dadosCliente.cpfCnpjCliente && (
                      <div className="text-gray-500 text-xs mt-1">{formatarCpfCnpj(dadosCliente.cpfCnpjCliente)}</div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-900">
                    {seguroNovo.ramo.nome}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-900">
                    {seguroNovo.seguradoraNova.nome}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-900">
                    {formatarMoeda(seguroNovo.premioLiquidoNovo)}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-900">
                    <div>{seguroNovo.percentualComissaoNova}%</div>
                    <div className="text-gray-600">{formatarMoeda(seguroNovo.comissaoNova)}</div>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <div className="font-medium text-green-600">{formatarMoeda(seguroNovo.comissaoAReceber)}</div>
                    <div className="text-xs text-gray-500">
                      {seguroNovo.ramo.tipoComissaoSeguroNovo === 'valor_fixo' ? 'Valor fixo' : `${seguroNovo.ramo.percentualComissaoSeguroNovo}%`}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${obterCorStatus(seguroNovo.status)}`}>
                      {obterStatusLabel(seguroNovo.status)}
                    </span>
                    {seguroNovo.status === 'perdido' && seguroNovo.motivoPerda && (
                      <div className="mt-1">
                        <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded-full">
                          {(() => {
                            const motivo = obterMotivoPerda(seguroNovo.motivoPerda);
                            return motivo ? `${motivo.icone} ${motivo.nome}` : '❓ Motivo não encontrado';
                          })()}
                        </span>
                        {seguroNovo.motivoOutros && (
                          <div className="text-xs text-gray-500 mt-1 max-w-[150px] truncate" title={seguroNovo.motivoOutros}>
                            {seguroNovo.motivoOutros}
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    <div className="flex items-center space-x-2">
                      {seguroNovo.observacoes.length > 0 && (
                        <div className="flex items-center text-blue-600">
                          <MessageSquare className="w-3 h-3 mr-1" />
                          <span>{seguroNovo.observacoes.length}</span>
                        </div>
                      )}
                      {seguroNovo.observacoes.some(obs => obs.anexos.length > 0) && (
                        <div className="flex items-center text-green-600">
                          <Paperclip className="w-3 h-3 mr-1" />
                          <span>{seguroNovo.observacoes.reduce((total, obs) => total + obs.anexos.length, 0)}</span>
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
      
      {segurosNovos.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <p className="text-sm">Nenhum seguro novo encontrado com os filtros aplicados</p>
        </div>
      )}
    </div>
  );
};

export default SeguroNovoList;