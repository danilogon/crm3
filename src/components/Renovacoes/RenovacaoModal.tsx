import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, Calendar, MessageSquare, Paperclip, Upload, Download, Trash2, Plus, Shield } from 'lucide-react';
import { RenovacaoSeguro, StatusRenovacao, Seguradora, Anexo } from '../../types';
import { formatarMoeda, calcularComissaoNova, calcularResultado } from '../../utils/calculations';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { seguradoras as mockSeguradoras, ramos as mockRamos } from '../../data/mockData';
import { clientes as mockClientes } from '../../data/clientesData';
import { Cliente } from '../../types/customer';
import { formatarCpfCnpj, validarCpfCnpj, limparCpfCnpj } from '../../utils/cpfCnpjValidator';
import ClienteSelectorModal from '../Modals/ClienteSelectorModal';
import ClienteModal from '../Modals/ClienteModal';
import ClienteAutocomplete from '../Common/ClienteAutocomplete';
import { usuarios as mockUsuarios, configuracoesMotivos as mockConfiguracoesMotivos } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';

interface RenovacaoModalProps {
  renovacao: RenovacaoSeguro;
  onClose: () => void;
  onSave: (renovacao: RenovacaoSeguro) => void;
}

const RenovacaoModal: React.FC<RenovacaoModalProps> = ({ renovacao, onClose, onSave }) => {
  const { isAdmin } = useAuth();
  const [formData, setFormData] = useState(renovacao);
  const [showMotivoModal, setShowMotivoModal] = useState(false);
  const [motivoPerda, setMotivoPerda] = useState<'vendido' | 'nao_renovado' | 'outros'>('nao_renovado');
  const [motivoOutros, setMotivoOutros] = useState('');
  const [observacao, setObservacao] = useState('');
  const [arquivosSelecionados, setArquivosSelecionados] = useState<FileList | null>(null);
  const [showClienteSelector, setShowClienteSelector] = useState(false);
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [cpfCnpjBusca, setCpfCnpjBusca] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<Cliente | null>(null);
  
  // Usar dados persistidos do localStorage
  const [seguradoras] = useLocalStorage('seguradoras', mockSeguradoras);
  const [ramos] = useLocalStorage('ramos', mockRamos);
  const [clientes, setClientes] = useLocalStorage<Cliente[]>('clientes', mockClientes);
  const [usuarios] = useLocalStorage('usuarios', mockUsuarios);
  const [configuracoesMotivos] = useLocalStorage('configuracoesMotivos', mockConfiguracoesMotivos);

  // Ordenar seguradoras e ramos alfabeticamente
  const seguradorasOrdenadas = useMemo(() => {
    return [...seguradoras].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, []);

  const ramosOrdenados = useMemo(() => {
    return [...ramos].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, []);

  // Ordenar usuários alfabeticamente
  const usuariosOrdenados = useMemo(() => {
    return [...usuarios].sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [usuarios]);
  
  // Buscar cliente vinculado
  useEffect(() => {
    if (formData.clienteId) {
      const cliente = clientes.find(c => c.id === formData.clienteId);
      setClienteSelecionado(cliente || null);
    }
  }, [formData.clienteId, clientes]);

  useEffect(() => {
    // Recalcular valores quando mudarem os campos relacionados
    if (formData.premioLiquidoNovo && formData.percentualComissaoNova) {
      const novaComissao = calcularComissaoNova(formData.premioLiquidoNovo, formData.percentualComissaoNova);
      const novoResultado = calcularResultado(novaComissao, formData.comissaoAnterior);
      
      setFormData(prev => ({
        ...prev,
        comissaoNova: novaComissao,
        resultado: novoResultado
      }));
    }
  }, [formData.premioLiquidoNovo, formData.percentualComissaoNova, formData.comissaoAnterior]);

  const handleInputChange = (field: string, value: any) => {
    if (field === 'status' && value === 'nao_renovada' && formData.status !== 'nao_renovada') {
      // Solicitar motivo quando status mudar para "não renovada"
      setMotivoPerda('nao_renovado'); // Reset para valor padrão
      setShowMotivoModal(true);
      // Não atualizar o status ainda, aguardar confirmação do motivo
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };
  
  const handleConfirmarMotivo = () => {
    // Buscar o motivo selecionado nas configurações
    const motivoSelecionado = configuracoesMotivos.motivosRenovacao.find(m => m.id === motivoPerda);
    
    setFormData(prev => ({ 
      ...prev, 
      status: 'nao_renovada',
      motivoPerda: motivoPerda,
      motivoOutros: motivoPerda === 'outros' ? motivoOutros : undefined
    }));
    setShowMotivoModal(false);
    setMotivoOutros('');
  };
  
  const handleCancelarMotivo = () => {
    setShowMotivoModal(false);
    setMotivoOutros('');
    // Status permanece o mesmo
  };
  
  const handleCpfCnpjChange = (value: string) => {
    const formatted = formatarCpfCnpj(value);
    setCpfCnpjBusca(formatted);
    
    // Limpar cliente selecionado quando CPF/CNPJ mudar
    if (clienteSelecionado) {
      setClienteSelecionado(null);
      setFormData(prev => ({ ...prev, clienteId: undefined }));
    }
  };
  
  const handleBuscarCliente = () => {
    if (!cpfCnpjBusca.trim()) return;
    
    const termoBusca = cpfCnpjBusca.trim();
    const cpfCnpjLimpo = limparCpfCnpj(termoBusca);
    
    // Buscar por CPF/CNPJ primeiro
    let clienteExistente = clientes.find(c => c.cpfCnpj === cpfCnpjLimpo);
    
    // Se não encontrou por CPF/CNPJ, buscar por nome
    if (!clienteExistente) {
      const termoBuscaLower = termoBusca.toLowerCase();
      clienteExistente = clientes.find(c => 
        c.nome.toLowerCase().includes(termoBuscaLower) ||
        c.email.toLowerCase().includes(termoBuscaLower)
      );
    }
    
    if (clienteExistente) {
      // Se encontrou cliente, abrir seletor
      setShowClienteSelector(true);
    } else {
      // Se o termo parece ser um CPF/CNPJ válido, permitir criar novo cliente
      if (validarCpfCnpj(termoBusca)) {
        setShowClienteModal(true);
      } else {
        // Se não é CPF/CNPJ válido, mostrar todos os clientes para seleção
        setShowClienteSelector(true);
      }
    }
  };
  
  const handleSelectCliente = (cliente: Cliente) => {
    setClienteSelecionado(cliente);
    setFormData(prev => ({
      ...prev,
      clienteId: cliente.id
    }));
    setCpfCnpjBusca(formatarCpfCnpj(cliente.cpfCnpj));
    setShowClienteSelector(false);
  };
  
  const handleCreateCliente = (clienteData: Omit<Cliente, 'id' | 'criadoEm' | 'atualizadoEm'>) => {
    const novoCliente: Cliente = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      ...clienteData,
      criadoEm: new Date(),
      atualizadoEm: new Date()
    };
    
    setClientes(prev => [...prev, novoCliente]);
    handleSelectCliente(novoCliente);
    setShowClienteModal(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setArquivosSelecionados(event.target.files);
  };

  const handleAddObservacao = () => {
    if (observacao.trim() || arquivosSelecionados) {
      const anexos: Anexo[] = [];
      
      // Simular upload de arquivos
      if (arquivosSelecionados) {
        Array.from(arquivosSelecionados).forEach((arquivo, index) => {
          anexos.push({
            id: `${Date.now()}-${index}`,
            nome: arquivo.name,
            tipo: arquivo.type,
            tamanho: arquivo.size,
            url: URL.createObjectURL(arquivo), // Em produção, seria a URL real do arquivo
            dataUpload: new Date()
          });
        });
      }

      const novaObservacao = {
        id: Date.now().toString(),
        texto: observacao || 'Anexo(s) adicionado(s)',
        data: new Date(),
        usuario: 'João Silva',
        anexos
      };
      
      setFormData(prev => ({
        ...prev,
        observacoes: [...prev.observacoes, novaObservacao]
      }));
      
      setObservacao('');
      setArquivosSelecionados(null);
      // Reset do input file
      const fileInput = document.getElementById('file-input') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    }
  };

  const handleRemoveAnexo = (observacaoId: string, anexoId: string) => {
    setFormData(prev => ({
      ...prev,
      observacoes: prev.observacoes.map(obs => 
        obs.id === observacaoId 
          ? { ...obs, anexos: obs.anexos.filter(anexo => anexo.id !== anexoId) }
          : obs
      )
    }));
  };

  const handleDownloadAnexo = (anexo: Anexo) => {
    // Em produção, faria o download real do arquivo
    const link = document.createElement('a');
    link.href = anexo.url;
    link.download = anexo.nome;
    link.click();
  };

  const formatarTamanhoArquivo = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSave = () => {
    // Garantir que todos os campos obrigatórios estejam preenchidos
    if (!formData.clienteId) {
      alert('Por favor, vincule um cliente antes de salvar.');
      return;
    }
    
    // Se admin editou dados do cliente, atualizar no localStorage
    if (isAdmin && clienteSelecionado) {
      setClientes(prev => prev.map(c => 
        c.id === clienteSelecionado.id 
          ? { ...clienteSelecionado, atualizadoEm: new Date() }
          : c
      ));
    }
    
    const renovacaoAtualizada = {
      ...formData,
      // Recalcular comissão anterior se admin alterou os valores
      comissaoAnterior: isAdmin ? 
        formData.premioLiquidoAnterior * (formData.percentualComissaoAnterior / 100) :
        formData.comissaoAnterior,
      atualizadoEm: new Date()
    };
    
    onSave({
      ...renovacaoAtualizada
    });
    onClose();
  };

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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Renovação - {formData.nomeCliente}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações Bloqueadas (editáveis apenas para admin) */}
          <div className={`rounded-lg p-4 ${isAdmin ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-gray-800">
                Informações do Cliente {isAdmin ? '(Editável - Admin)' : '(Somente Leitura)'}
              </h3>
              {isAdmin && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <Shield className="w-4 h-4" />
                  <span>Modo Administrador</span>
                </div>
              )}
            </div>
            
            {/* Busca de Cliente */}
            <div className={`mb-4 p-4 rounded-lg ${isAdmin ? 'bg-white border border-blue-300' : 'bg-gray-100'}`}>
              <h4 className="text-sm font-medium text-blue-800 mb-3">
                Vincular Cliente *
                {!clienteSelecionado && (
                  <span className="text-red-600 ml-2">(Obrigatório)</span>
                )}
                {!isAdmin && (
                  <span className="text-gray-500 ml-2">(Apenas Admin pode alterar)</span>
                )}
              </h4>
              
              <ClienteAutocomplete
                clientes={clientes}
                onSelectCliente={handleSelectCliente}
                onCreateNew={() => setShowClienteModal(true)}
                placeholder="Digite o nome ou CPF/CNPJ do cliente"
                value={cpfCnpjBusca}
                onChange={handleCpfCnpjChange}
                disabled={!isAdmin}
              />
              
              {clienteSelecionado && (
                <div className={`mt-3 p-3 rounded-md ${isAdmin ? 'bg-green-50 border border-green-200' : 'bg-gray-100 border border-gray-300'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`font-medium ${isAdmin ? 'text-green-800' : 'text-gray-700'}`}>{clienteSelecionado.nome}</p>
                      <p className={`text-sm ${isAdmin ? 'text-green-600' : 'text-gray-600'}`}>
                        {formatarCpfCnpj(clienteSelecionado.cpfCnpj)} • {clienteSelecionado.email}
                      </p>
                      <p className={`text-sm ${isAdmin ? 'text-green-600' : 'text-gray-600'}`}>
                        {clienteSelecionado.telefone}
                      </p>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          setClienteSelecionado(null);
                          setFormData(prev => ({ ...prev, clienteId: '' }));
                          setCpfCnpjBusca('');
                        }}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Desvincular
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Cliente {isAdmin ? '(Editável)' : '(Vinculado)'}
                </label>
                <input
                  type="text"
                  value={clienteSelecionado?.nome || 'Cliente não vinculado'}
                  onChange={isAdmin ? (e) => {
                    if (clienteSelecionado) {
                      setClienteSelecionado({...clienteSelecionado, nome: e.target.value});
                    }
                  } : undefined}
                  disabled={!isAdmin}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isAdmin 
                      ? 'border-blue-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                      : 'border-gray-300 bg-gray-100 text-gray-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail do Cliente {isAdmin ? '(Editável)' : '(Vinculado)'}
                </label>
                <input
                  type="email"
                  value={clienteSelecionado?.email || ''}
                  onChange={isAdmin ? (e) => {
                    if (clienteSelecionado) {
                      setClienteSelecionado({...clienteSelecionado, email: e.target.value});
                    }
                  } : undefined}
                  disabled={!isAdmin}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isAdmin 
                      ? 'border-blue-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                      : 'border-gray-300 bg-gray-100 text-gray-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone do Cliente {isAdmin ? '(Editável)' : '(Vinculado)'}
                </label>
                <input
                  type="tel"
                  value={clienteSelecionado?.telefone || ''}
                  onChange={isAdmin ? (e) => {
                    if (clienteSelecionado) {
                      setClienteSelecionado({...clienteSelecionado, telefone: e.target.value});
                    }
                  } : undefined}
                  disabled={!isAdmin}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isAdmin 
                      ? 'border-blue-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                      : 'border-gray-300 bg-gray-100 text-gray-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fim de Vigência {isAdmin ? '(Editável)' : ''}
                </label>
                <input
                  type="date"
                  value={formData.fimVigencia.toISOString().split('T')[0]}
                  onChange={isAdmin ? (e) => handleInputChange('fimVigencia', new Date(e.target.value)) : undefined}
                  disabled={!isAdmin}
                  className={`w-full px-3 py-2 border rounded-md ${
                    isAdmin 
                      ? 'border-blue-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                      : 'border-gray-300 bg-gray-100 text-gray-500'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ramo {isAdmin ? '(Editável)' : ''}
                </label>
                {isAdmin ? (
                  <select
                    value={formData.ramo?.id || ''}
                    onChange={(e) => {
                      const ramo = ramosOrdenados.find(r => r.id === e.target.value);
                      if (ramo) handleInputChange('ramo', ramo);
                    }}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione um ramo</option>
                    {ramosOrdenados.filter(r => r.ativo).map(ramo => (
                      <option key={ramo.id} value={ramo.id}>
                        {ramo.nome}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.ramo?.nome || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seguradora Anterior {isAdmin ? '(Editável)' : ''}
                </label>
                {isAdmin ? (
                  <select
                    value={formData.seguradoraAnterior?.id || ''}
                    onChange={(e) => {
                      const seguradora = seguradorasOrdenadas.find(s => s.id === e.target.value);
                      if (seguradora) handleInputChange('seguradoraAnterior', seguradora);
                    }}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecione uma seguradora</option>
                    {seguradorasOrdenadas.filter(s => s.ativa).map(seguradora => (
                      <option key={seguradora.id} value={seguradora.id}>
                        {seguradora.nome}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={formData.seguradoraAnterior?.nome || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prêmio Líquido Anterior {isAdmin ? '(Editável)' : ''}
                </label>
                {isAdmin ? (
                  <input
                    type="number"
                    value={formData.premioLiquidoAnterior || ''}
                    onChange={(e) => handleInputChange('premioLiquidoAnterior', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                ) : (
                  <input
                    type="text"
                    value={formatarMoeda(formData.premioLiquidoAnterior)}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  % Comissão Anterior {isAdmin ? '(Editável)' : ''}
                </label>
                {isAdmin ? (
                  <input
                    type="number"
                    value={formData.percentualComissaoAnterior || ''}
                    onChange={(e) => handleInputChange('percentualComissaoAnterior', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-blue-300 rounded-md bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                ) : (
                  <input
                    type="text"
                    value={`${formData.percentualComissaoAnterior}%`}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                  />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comissão Anterior
                </label>
                <input
                  type="text"
                  value={formatarMoeda(formData.comissaoAnterior)}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Campos Editáveis */}
          <div>
            <h3 className="font-medium text-gray-800 mb-4">Informações Editáveis</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Responsável *
                </label>
                <select
                  value={formData.responsavel}
                  onChange={(e) => handleInputChange('responsavel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um responsável</option>
                  {usuariosOrdenados.map(usuario => (
                    <option key={usuario.id} value={usuario.nome}>
                      {usuario.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seguradora Nova
                </label>
                <select
                  value={formData.seguradoraNova?.id || ''}
                  onChange={(e) => {
                    const seguradora = seguradoras.find(s => s.id === e.target.value);
                    handleInputChange('seguradoraNova', seguradora);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione uma seguradora</option>
                  {seguradorasOrdenadas.filter(s => s.ativa).map(seguradora => (
                    <option key={seguradora.id} value={seguradora.id}>
                      {seguradora.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prêmio Líquido Novo
                </label>
                <input
                  type="number"
                  value={formData.premioLiquidoNovo || ''}
                  onChange={(e) => handleInputChange('premioLiquidoNovo', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  % Comissão Nova
                </label>
                <input
                  type="number"
                  value={formData.percentualComissaoNova || ''}
                  onChange={(e) => handleInputChange('percentualComissaoNova', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Comissão Nova (Calculado)
                </label>
                <input
                  type="text"
                  value={formData.comissaoNova ? formatarMoeda(formData.comissaoNova) : ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Resultado (Calculado)
                </label>
                <input
                  type="text"
                  value={formData.resultado ? formatarMoeda(formData.resultado) : ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                />
              </div>
            </div>
          </div>

          {/* Observações e Anexos */}
          <div>
            <h3 className="font-medium text-gray-800 mb-4">Observações e Anexos</h3>
            
            {/* Lista de Observações */}
            <div className="space-y-4 mb-6">
              {formData.observacoes.map((obs) => (
                <div key={obs.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{obs.usuario}</span>
                    <span className="text-xs text-gray-500">
                      {obs.data.toLocaleDateString('pt-BR')} às {obs.data.toLocaleTimeString('pt-BR')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{obs.texto}</p>
                  
                  {/* Anexos da observação */}
                  {obs.anexos.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-medium text-gray-700 flex items-center">
                        <Paperclip className="w-3 h-3 mr-1" />
                        Anexos ({obs.anexos.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {obs.anexos.map((anexo) => (
                          <div key={anexo.id} className="bg-white border border-gray-200 rounded-md p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 truncate">
                                  {anexo.nome}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatarTamanhoArquivo(anexo.tamanho)}
                                </p>
                              </div>
                              <div className="flex items-center space-x-1 ml-2">
                                <button
                                  onClick={() => handleDownloadAnexo(anexo)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                  title="Baixar arquivo"
                                >
                                  <Download className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRemoveAnexo(obs.id, anexo.id)}
                                  className="text-red-600 hover:text-red-800 transition-colors"
                                  title="Remover arquivo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Adicionar Nova Observação */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-3">Nova Observação</h4>
              
              <div className="space-y-3">
                <textarea
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Digite sua observação..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <input
                      id="file-input"
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="file-input"
                      className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors"
                    >
                      <Paperclip className="w-4 h-4 mr-2" />
                      Anexar Arquivos
                    </label>
                    {arquivosSelecionados && (
                      <span className="ml-3 text-sm text-gray-600">
                        {arquivosSelecionados.length} arquivo(s) selecionado(s)
                      </span>
                    )}
                  </div>
                  
                  <button
                    onClick={handleAddObservacao}
                    disabled={!observacao.trim() && !arquivosSelecionados}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </button>
        </div>
      </div>
      
      {/* Modal de Motivo para Não Renovação */}
      {showMotivoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <div className="bg-white rounded-lg max-w-md w-full shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Motivo da Não Renovação</h3>
              <button
                onClick={handleCancelarMotivo}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-sm text-gray-600">
                Por favor, informe o motivo pelo qual esta renovação não foi efetivada:
              </p>
              
              <div className="space-y-3">
                {configuracoesMotivos.motivosRenovacao
                  .filter(motivo => motivo.ativo)
                  .sort((a, b) => a.ordem - b.ordem)
                  .map((motivo) => (
                    <label key={motivo.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="motivoPerda"
                        value={motivo.id}
                        checked={motivoPerda === motivo.id}
                        onChange={(e) => setMotivoPerda(e.target.value)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-lg mr-2">{motivo.icone}</span>
                      <span className="text-sm text-gray-700">{motivo.nome}</span>
                    </label>
                  ))}
              </div>
              
              {/* Campo de texto livre para "Outros motivos" */}
              {configuracoesMotivos.motivosRenovacao.find(m => m.id === motivoPerda)?.nome.toLowerCase().includes('outros') && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descreva o motivo:
                  </label>
                  <textarea
                    value={motivoOutros}
                    onChange={(e) => setMotivoOutros(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Digite o motivo específico..."
                  />
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={handleCancelarMotivo}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmarMotivo}
                disabled={
                  configuracoesMotivos.motivosRenovacao.find(m => m.id === motivoPerda)?.nome.toLowerCase().includes('outros') && 
                  !motivoOutros.trim()
                }
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Modais de Cliente */}
      <ClienteSelectorModal
        isOpen={showClienteSelector}
        onClose={() => setShowClienteSelector(false)}
        onSelectCliente={handleSelectCliente}
        onCreateNew={() => {
          setShowClienteSelector(false);
          setShowClienteModal(true);
        }}
        clientes={clientes}
        cpfCnpjBusca={cpfCnpjBusca}
        showDuplicateWarning={true}
      />
      
      <ClienteModal
        isOpen={showClienteModal}
        onClose={() => setShowClienteModal(false)}
        onSave={handleCreateCliente}
        dadosIniciais={{
          cpfCnpj: validarCpfCnpj(cpfCnpjBusca) ? cpfCnpjBusca : undefined,
          nome: !validarCpfCnpj(cpfCnpjBusca) && cpfCnpjBusca.length >= 3 ? cpfCnpjBusca : undefined
        }}
      />
    </div>
  );
};

export default RenovacaoModal;