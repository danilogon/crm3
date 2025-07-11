import React, { useState, useEffect, useRef } from 'react';
import { Search, User, Building, Plus } from 'lucide-react';
import { Cliente } from '../../types/customer';
import { formatarCpfCnpj, limparCpfCnpj, validarCpfCnpj } from '../../utils/cpfCnpjValidator';

interface ClienteAutocompleteProps {
  clientes: Cliente[];
  onSelectCliente: (cliente: Cliente) => void;
  onCreateNew: () => void;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const ClienteAutocomplete: React.FC<ClienteAutocompleteProps> = ({
  clientes,
  onSelectCliente,
  onCreateNew,
  placeholder = "Digite o nome ou CPF/CNPJ do cliente",
  value = "",
  onChange,
  disabled = false
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [filteredClientes, setFilteredClientes] = useState<Cliente[]>([]);
  const [showCreateOption, setShowCreateOption] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (inputValue.trim().length >= 1) {
      const termoBusca = inputValue.toLowerCase();
      const cpfCnpjLimpo = limparCpfCnpj(inputValue);
      
      const filtered = clientes.filter(cliente => 
        // Busca por nome (dados parciais)
        cliente.nome.toLowerCase().includes(termoBusca) ||
        // Busca por email (dados parciais)
        cliente.email.toLowerCase().includes(termoBusca) ||
        // Busca por CPF/CNPJ (tanto formatado quanto limpo)
        (cpfCnpjLimpo.length >= 3 && cliente.cpfCnpj.includes(cpfCnpjLimpo)) ||
        (inputValue.length >= 3 && formatarCpfCnpj(cliente.cpfCnpj).toLowerCase().includes(inputValue.toLowerCase()))
      )
      // Ordenar por relevância: nome primeiro, depois CPF/CNPJ
      .sort((a, b) => {
        const aMatchNome = a.nome.toLowerCase().includes(termoBusca);
        const bMatchNome = b.nome.toLowerCase().includes(termoBusca);
        
        if (aMatchNome && !bMatchNome) return -1;
        if (!aMatchNome && bMatchNome) return 1;
        
        return a.nome.localeCompare(b.nome, 'pt-BR');
      })
      .slice(0, 8); // Limitar a 8 resultados para melhor UX
      
      setFilteredClientes(filtered);
      
      // Mostrar opção de criar se:
      // 1. Não há resultados E
      // 2. O input tem pelo menos 3 caracteres E
      // 3. (É um CPF/CNPJ válido OU é um nome com pelo menos 3 caracteres)
      const shouldShowCreate = filtered.length === 0 && 
                              inputValue.trim().length >= 3 && 
                              (validarCpfCnpj(inputValue) || inputValue.trim().length >= 3);
      
      setShowCreateOption(shouldShowCreate);
      setIsOpen(filtered.length > 0 || shouldShowCreate);
    } else {
      setFilteredClientes([]);
      setShowCreateOption(false);
      setIsOpen(false);
    }
  }, [inputValue, clientes]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          inputRef.current && !inputRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handleSelectCliente = (cliente: Cliente) => {
    setInputValue(cliente.nome);
    setIsOpen(false);
    onSelectCliente(cliente);
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    onCreateNew();
  };


  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          autoComplete="off"
        />
      </div>

      {isOpen && !disabled && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredClientes.map((cliente) => (
            <div
              key={cliente.id}
              onClick={() => handleSelectCliente(cliente)}
              className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  cliente.tipo === 'pessoa_juridica' ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {cliente.tipo === 'pessoa_juridica' ? (
                    <Building className="w-4 h-4 text-blue-600" />
                  ) : (
                    <User className="w-4 h-4 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{cliente.nome}</p>
                  <p className="text-xs text-gray-600">{formatarCpfCnpj(cliente.cpfCnpj)}</p>
                  <p className="text-xs text-gray-500">{cliente.email}</p>
                </div>
              </div>
            </div>
          ))}

          {showCreateOption && (
            <div
              onClick={handleCreateNew}
              className="p-3 hover:bg-green-50 cursor-pointer border-t border-gray-200 bg-green-50"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Plus className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-green-700 text-sm">✨ Criar novo cliente</p>
                  <p className="text-xs text-green-600">
                    {validarCpfCnpj(inputValue) 
                      ? `CPF/CNPJ: ${formatarCpfCnpj(inputValue)}`
                      : `Nome: ${inputValue}`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {filteredClientes.length === 0 && !showCreateOption && inputValue.trim().length >= 2 && (
            <div className="p-3 text-center text-gray-500 text-sm">
              <div className="space-y-2">
                <p>Nenhum cliente encontrado</p>
                <button
                  onClick={handleCreateNew}
                  className="text-green-600 hover:text-green-800 text-sm font-medium flex items-center justify-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Criar novo cliente</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClienteAutocomplete;