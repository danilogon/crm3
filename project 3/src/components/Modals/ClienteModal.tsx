import React, { useState, useEffect } from 'react';
import { X, Save, User, Building, MapPin, AlertCircle } from 'lucide-react';
import { Cliente } from '../../types/customer';
import { formatarCpfCnpj, validarCpfCnpj, obterTipoDocumento, limparCpfCnpj } from '../../utils/cpfCnpjValidator';

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cliente: Omit<Cliente, 'id' | 'criadoEm' | 'atualizadoEm'>) => void;
  cliente?: Cliente;
  dadosIniciais?: {
    cpfCnpj?: string;
    nome?: string;
  };
}

const ClienteModal: React.FC<ClienteModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  cliente,
  dadosIniciais
}) => {
  const [nome, setNome] = useState('');
  const [cpfCnpj, setCpfCnpj] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState<Date | undefined>();
  const [observacoes, setObservacoes] = useState('');
  
  // Endereço
  const [cep, setCep] = useState('');
  const [logradouro, setLogradouro] = useState('');
  const [numero, setNumero] = useState('');
  const [complemento, setComplemento] = useState('');
  const [bairro, setBairro] = useState('');
  const [cidade, setCidade] = useState('');
  const [estado, setEstado] = useState('');
  
  const [erros, setErros] = useState<Record<string, string>>({});

  // Efeito para carregar dados do cliente quando o modal abrir
  useEffect(() => {
    if (isOpen && cliente) {
      setNome(cliente.nome);
      setCpfCnpj(cliente.cpfCnpj);
      setEmail(cliente.email);
      setTelefone(cliente.telefone);
      setDataNascimento(cliente.dataNascimento);
      setObservacoes(cliente.observacoes || '');
      setCep(cliente.endereco?.cep || '');
      setLogradouro(cliente.endereco?.logradouro || '');
      setNumero(cliente.endereco?.numero || '');
      setComplemento(cliente.endereco?.complemento || '');
      setBairro(cliente.endereco?.bairro || '');
      setCidade(cliente.endereco?.cidade || '');
      setEstado(cliente.endereco?.estado || '');
    } else if (isOpen && !cliente && dadosIniciais) {
      // Reset para novo cliente
      setNome(dadosIniciais.nome || '');
      setCpfCnpj(dadosIniciais.cpfCnpj || '');
      setEmail('');
      setTelefone('');
      setDataNascimento(undefined);
      setObservacoes('');
      setCep('');
      setLogradouro('');
      setNumero('');
      setComplemento('');
      setBairro('');
      setCidade('');
      setEstado('');
    } else if (isOpen && !cliente && !dadosIniciais) {
      // Reset completo para novo cliente
      setNome('');
      setCpfCnpj('');
      setEmail('');
      setTelefone('');
      setDataNascimento(undefined);
      setObservacoes('');
      setCep('');
      setLogradouro('');
      setNumero('');
      setComplemento('');
      setBairro('');
      setCidade('');
      setEstado('');
    }
    setErros({});
  }, [isOpen, cliente, dadosIniciais]);

  if (!isOpen) return null;

  const tipoDocumento = obterTipoDocumento(cpfCnpj);
  const isPessoaJuridica = tipoDocumento === 'pessoa_juridica';

  const handleCpfCnpjChange = (value: string) => {
    const formatted = formatarCpfCnpj(value);
    setCpfCnpj(formatted);
    
    // Limpar erro quando o usuário começar a digitar
    if (erros.cpfCnpj) {
      setErros(prev => ({ ...prev, cpfCnpj: '' }));
    }
  };

  const handleTelefoneChange = (value: string) => {
    // Formatar telefone: (11) 99999-9999
    const numeros = value.replace(/\D/g, '');
    let formatted = numeros;
    
    if (numeros.length >= 2) {
      formatted = `(${numeros.slice(0, 2)}) ${numeros.slice(2)}`;
    }
    if (numeros.length >= 7) {
      formatted = `(${numeros.slice(0, 2)}) ${numeros.slice(2, 7)}-${numeros.slice(7, 11)}`;
    }
    
    setTelefone(formatted);
  };

  const handleCepChange = (value: string) => {
    // Formatar CEP: 12345-678
    const numeros = value.replace(/\D/g, '');
    let formatted = numeros;
    
    if (numeros.length >= 5) {
      formatted = `${numeros.slice(0, 5)}-${numeros.slice(5, 8)}`;
    }
    
    setCep(formatted);
  };

  const validarFormulario = (): boolean => {
    const novosErros: Record<string, string> = {};
    
    if (!nome.trim()) {
      novosErros.nome = 'Nome é obrigatório';
    }
    
    if (!cpfCnpj.trim()) {
      novosErros.cpfCnpj = 'CPF/CNPJ é obrigatório';
    } else if (!validarCpfCnpj(cpfCnpj)) {
      novosErros.cpfCnpj = 'CPF/CNPJ inválido';
    }
    
    if (!email.trim()) {
      novosErros.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      novosErros.email = 'Email inválido';
    }
    
    if (!telefone.trim()) {
      novosErros.telefone = 'Telefone é obrigatório';
    }
    
    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleSave = () => {
    if (!validarFormulario()) return;
    
    const clienteData: Omit<Cliente, 'id' | 'criadoEm' | 'atualizadoEm'> = {
      nome: nome.trim(),
      cpfCnpj: limparCpfCnpj(cpfCnpj),
      email: email.trim(),
      telefone: telefone.trim(),
      dataNascimento,
      tipo: tipoDocumento!,
      endereco: {
        cep: cep.trim() || undefined,
        logradouro: logradouro.trim() || undefined,
        numero: numero.trim() || undefined,
        complemento: complemento.trim() || undefined,
        bairro: bairro.trim() || undefined,
        cidade: cidade.trim() || undefined,
        estado: estado.trim() || undefined,
      },
      observacoes: observacoes.trim() || undefined
    };
    
    onSave(clienteData);
    handleClose();
  };

  const handleClose = () => {
    // Reset form
    setNome('');
    setCpfCnpj('');
    setEmail('');
    setTelefone('');
    setDataNascimento(undefined);
    setObservacoes('');
    setCep('');
    setLogradouro('');
    setNumero('');
    setComplemento('');
    setBairro('');
    setCidade('');
    setEstado('');
    setErros({});
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            {isPessoaJuridica ? (
              <Building className="w-6 h-6 text-blue-600" />
            ) : (
              <User className="w-6 h-6 text-green-600" />
            )}
            <h2 className="text-xl font-semibold text-gray-800">
              {cliente ? 'Editar Cliente' : 'Novo Cliente'}
              {(tipoDocumento || dadosIniciais?.nome) && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  {tipoDocumento ? 
                    `(${isPessoaJuridica ? 'Pessoa Jurídica' : 'Pessoa Física'})` :
                    '(Novo Cliente)'
                  }
                </span>
              )}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isPessoaJuridica ? 'Razão Social' : 'Nome Completo'} *
                </label>
                <input
                  type="text"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    erros.nome ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={isPessoaJuridica ? 'Digite a razão social' : 'Digite o nome completo'}
                />
                {erros.nome && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {erros.nome}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {isPessoaJuridica ? 'CNPJ' : 'CPF'} *
                </label>
                <input
                  type="text"
                  value={cpfCnpj}
                  onChange={(e) => handleCpfCnpjChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    erros.cpfCnpj ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder={isPessoaJuridica ? '00.000.000/0000-00' : '000.000.000-00'}
                  maxLength={isPessoaJuridica ? 18 : 14}
                />
                {erros.cpfCnpj && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {erros.cpfCnpj}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    erros.email ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="email@exemplo.com"
                />
                {erros.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {erros.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Nascimento {isPessoaJuridica ? '(Fundação)' : ''}
                </label>
                <input
                  type="date"
                  value={dataNascimento ? dataNascimento.toISOString().split('T')[0] : ''}
                  onChange={(e) => setDataNascimento(e.target.value ? new Date(e.target.value) : undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="text"
                  value={telefone}
                  onChange={(e) => handleTelefoneChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    erros.telefone ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
                {erros.telefone && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {erros.telefone}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h3 className="text-lg font-medium text-gray-800 mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Endereço
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={cep}
                  onChange={(e) => handleCepChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="12345-678"
                  maxLength={9}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Logradouro
                </label>
                <input
                  type="text"
                  value={logradouro}
                  onChange={(e) => setLogradouro(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Rua, Avenida, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Número
                </label>
                <input
                  type="text"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="123"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Complemento
                </label>
                <input
                  type="text"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Apto, Sala, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro
                </label>
                <input
                  type="text"
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome do bairro"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade
                </label>
                <input
                  type="text"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Nome da cidade"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <select
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione</option>
                  <option value="SP">São Paulo</option>
                  <option value="RJ">Rio de Janeiro</option>
                  <option value="MG">Minas Gerais</option>
                  <option value="RS">Rio Grande do Sul</option>
                  <option value="PR">Paraná</option>
                  <option value="SC">Santa Catarina</option>
                  <option value="BA">Bahia</option>
                  <option value="GO">Goiás</option>
                  <option value="PE">Pernambuco</option>
                  <option value="CE">Ceará</option>
                </select>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observações
            </label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Informações adicionais sobre o cliente..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Cliente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClienteModal;