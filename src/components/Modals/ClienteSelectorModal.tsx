import React, { useState, useMemo } from 'react';
import { X, Search, User, Building, Plus, AlertTriangle } from 'lucide-react';
import { Cliente } from '../../types/customer';
import { formatarCpfCnpj, limparCpfCnpj } from '../../utils/cpfCnpjValidator';

interface ClienteSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCliente: (cliente: Cliente) => void;
  onCreateNew: () => void;
  clientes: Cliente[];
  cpfCnpjBusca?: string;
  showDuplicateWarning?: boolean;
}

const ClienteSelectorModal: React.FC<ClienteSelectorModalProps> = ({
  isOpen,
  onClose,
  onSelectCliente,
  onCreateNew,
  clientes,
  cpfCnpjBusca,
  showDuplicateWarning = false
}) => {
  const [busca, setBusca] = useState('');

  if (!isOpen) return null;

  const clientesFiltrados = useMemo(() => {
    if (busca.trim() === '' && !cpfCnpjBusca) return clientes.slice(0, 20); // Limitar resultados iniciais
    
    const termoBusca = busca.toLowerCase() || '';
    const cpfCnpjBuscaLimpo = cpfCnpjBusca ? limparCpfCnpj(cpfCnpjBusca) : '';
    
    return clientes.filter(cliente => 
      // Busca por nome (dados parciais)
      (termoBusca && cliente.nome.toLowerCase().includes(termoBusca)) ||
      // Busca por email (dados parciais)
      (termoBusca && cliente.email.toLowerCase().includes(termoBusca)) ||
      // Busca por CPF/CNPJ (tanto formatado quanto limpo)
      (busca.length >= 3 && cliente.cpfCnpj.includes(limparCpfCnpj(busca))) ||
      (busca.length >= 3 && formatarCpfCnpj(cliente.cpfCnpj).toLowerCase().includes(busca.toLowerCase())) ||
      // Busca pelo CPF/CNPJ passado como parâmetro
      (cpfCnpjBuscaLimpo && cliente.cpfCnpj.includes(cpfCnpjBuscaLimpo))
    )
    // Ordenar por relevância
    .sort((a, b) => {
      const aMatchNome = a.nome.toLowerCase().includes(termoBusca);
      const bMatchNome = b.nome.toLowerCase().includes(termoBusca);
      
      if (aMatchNome && !bMatchNome) return -1;
      if (!aMatchNome && bMatchNome) return 1;
      
      return a.nome.localeCompare(b.nome, 'pt-BR');
    })
    .slice(0, 15); // Limitar resultados
  }, [clientes, busca, cpfCnpjBusca]);

  const clienteExistente = cpfCnpjBusca ? 
    clientes.find(c => c.cpfCnpj === limparCpfCnpj(cpfCnpjBusca)) : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {showDuplicateWarning ? 'Cliente já existe!' : 'Selecionar Cliente'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {showDuplicateWarning && clienteExistente && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 m-6 mb-0">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-yellow-400 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">
                  CPF/CNPJ já cadastrado
                </h3>
                <p className="text-sm text-yellow-700 mt-1">
                  O CPF/CNPJ <strong>{formatarCpfCnpj(cpfCnpjBusca!)}</strong> já está cadastrado para o cliente <strong>{clienteExistente.nome}</strong>.
                  Selecione o cliente existente ou cancele a operação.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="p-6">
          {/* Busca */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, email ou CPF/CNPJ..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Lista de Clientes */}
          <div className="max-h-96 overflow-y-auto space-y-2">
            {clientesFiltrados.length > 0 ? (
              clientesFiltrados.map((cliente) => (
                <div
                  key={cliente.id}
                  onClick={() => onSelectCliente(cliente)}
                  className={`p-4 border rounded-lg cursor-pointer transition-all hover:bg-blue-50 hover:border-blue-300 ${
                    clienteExistente?.id === cliente.id ? 'bg-yellow-50 border-yellow-300' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      cliente.tipo === 'pessoa_juridica' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {cliente.tipo === 'pessoa_juridica' ? (
                        <Building className="w-5 h-5 text-blue-600" />
                      ) : (
                        <User className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{cliente.nome}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          cliente.tipo === 'pessoa_juridica' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {cliente.tipo === 'pessoa_juridica' ? 'PJ' : 'PF'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{formatarCpfCnpj(cliente.cpfCnpj)}</p>
                      <p className="text-sm text-gray-500">{cliente.email}</p>
                      <p className="text-sm text-gray-500">{cliente.telefone}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {busca.trim() ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          
          {!showDuplicateWarning && (
            <button
              onClick={onCreateNew}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Novo Cliente
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ClienteSelectorModal;