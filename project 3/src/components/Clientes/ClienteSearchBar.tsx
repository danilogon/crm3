import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, User, Building, CreditCard, Clock, X } from 'lucide-react';
import { Cliente, Card } from '../../types';
import { formatarCpfCnpj, limparCpfCnpj } from '../../utils/cpfCnpjValidator';

interface SearchSuggestion {
  type: 'cliente' | 'card';
  data: Cliente | Card;
  relevance: number;
}

interface ClienteSearchBarProps {
  clientes: Cliente[];
  cards: Card[];
  onSelectCliente: (cliente: Cliente) => void;
  onSelectCard: (card: Card) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const ClienteSearchBar: React.FC<ClienteSearchBarProps> = ({
  clientes,
  cards,
  onSelectCliente,
  onSelectCard,
  placeholder = "Buscar cliente por nome, CPF/CNPJ ou número do card...",
  autoFocus = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Debounced search function
  const debouncedSearch = useCallback((term: string) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (term.trim().length >= 2) {
        setIsLoading(true);
        performSearch(term);
        setIsLoading(false);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 300);
  }, [clientes, cards]);

  const performSearch = (term: string) => {
    const searchResults: SearchSuggestion[] = [];
    const termLower = term.toLowerCase();
    const termNumbers = limparCpfCnpj(term);

    // Search clients
    clientes.forEach(cliente => {
      let relevance = 0;
      
      // Name match (highest priority)
      if (cliente.nome.toLowerCase().includes(termLower)) {
        relevance += cliente.nome.toLowerCase().startsWith(termLower) ? 100 : 80;
      }
      
      // Email match
      if (cliente.email.toLowerCase().includes(termLower)) {
        relevance += 60;
      }
      
      // CPF/CNPJ match
      if (termNumbers.length >= 3 && cliente.cpfCnpj.includes(termNumbers)) {
        relevance += cliente.cpfCnpj.startsWith(termNumbers) ? 90 : 70;
      }
      
      // Phone match
      if (cliente.telefone.includes(term)) {
        relevance += 50;
      }

      if (relevance > 0) {
        searchResults.push({
          type: 'cliente',
          data: cliente,
          relevance
        });
      }
    });

    // Search cards (only if term looks like a card number or is numeric)
    if (/^\d+$/.test(term) || term.toLowerCase().includes('card')) {
      cards.forEach(card => {
        let relevance = 0;
        
        // Card number exact match
        if (card.numero.toLowerCase().includes(termLower)) {
          relevance += card.numero.toLowerCase() === termLower ? 100 : 85;
        }
        
        // Card ID match
        if (card.id === term) {
          relevance += 95;
        }

        if (relevance > 0) {
          searchResults.push({
            type: 'card',
            data: card,
            relevance
          });
        }
      });
    }

    // Sort by relevance and limit results
    const sortedResults = searchResults
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10);

    setSuggestions(sortedResults);
    setIsOpen(sortedResults.length > 0);
    setSelectedIndex(-1);
  };

  useEffect(() => {
    debouncedSearch(searchTerm);
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [searchTerm, debouncedSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current && 
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : suggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleSelectSuggestion(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSelectSuggestion = (suggestion: SearchSuggestion) => {
    if (suggestion.type === 'cliente') {
      onSelectCliente(suggestion.data as Cliente);
    } else {
      onSelectCard(suggestion.data as Card);
    }
    
    setSearchTerm('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const getClienteByCardId = (cardId: string): Cliente | undefined => {
    const card = cards.find(c => c.id === cardId);
    if (!card) return undefined;
    return clientes.find(c => c.id === card.clienteId);
  };

  const formatCardStatus = (status: string): { label: string; color: string } => {
    const statusMap = {
      'pendente': { label: 'Pendente', color: 'text-yellow-600 bg-yellow-100' },
      'em_analise': { label: 'Em Análise', color: 'text-blue-600 bg-blue-100' },
      'aprovado': { label: 'Aprovado', color: 'text-green-600 bg-green-100' },
      'recusado': { label: 'Recusado', color: 'text-red-600 bg-red-100' }
    };
    return statusMap[status as keyof typeof statusMap] || { label: status, color: 'text-gray-600 bg-gray-100' };
  };

  return (
    <div className="relative w-full max-w-2xl">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="w-full pl-12 pr-12 py-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-200 shadow-sm"
          autoComplete="off"
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
          </div>
        )}
      </div>

      {isOpen && (
        <div 
          ref={dropdownRef}
          className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-96 overflow-y-auto"
        >
          {suggestions.map((suggestion, index) => (
            <div
              key={`${suggestion.type}-${suggestion.data.id}`}
              onClick={() => handleSelectSuggestion(suggestion)}
              className={`p-4 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors ${
                index === selectedIndex ? 'bg-blue-50' : 'hover:bg-gray-50'
              }`}
            >
              {suggestion.type === 'cliente' ? (
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    (suggestion.data as Cliente).tipo === 'pessoa_juridica' ? 'bg-blue-100' : 'bg-green-100'
                  }`}>
                    {(suggestion.data as Cliente).tipo === 'pessoa_juridica' ? (
                      <Building className="w-6 h-6 text-blue-600" />
                    ) : (
                      <User className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {(suggestion.data as Cliente).nome}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatarCpfCnpj((suggestion.data as Cliente).cpfCnpj)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(suggestion.data as Cliente).email}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      (suggestion.data as Cliente).tipo === 'pessoa_fisica' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {(suggestion.data as Cliente).tipo === 'pessoa_fisica' ? 'PF' : 'PJ'}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {(suggestion.data as Card).numero}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {(suggestion.data as Card).descricao}
                    </p>
                    <p className="text-sm text-gray-500">
                      Cliente: {getClienteByCardId((suggestion.data as Card).clienteId)?.nome}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      formatCardStatus((suggestion.data as Card).status).color
                    }`}>
                      {formatCardStatus((suggestion.data as Card).status).label}
                    </span>
                    <p className="text-sm text-gray-500 mt-1">
                      R$ {(suggestion.data as Card).valorTotal.toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {suggestions.length === 0 && searchTerm.length >= 2 && !isLoading && (
            <div className="p-6 text-center text-gray-500">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p>Nenhum resultado encontrado para "{searchTerm}"</p>
              <p className="text-sm mt-1">Tente buscar por nome, CPF/CNPJ ou número do card</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClienteSearchBar;