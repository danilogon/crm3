import React, { useState } from 'react';
import { X, Upload, Download, FileText, AlertCircle, CheckCircle, Users } from 'lucide-react';
import { Cliente } from '../../types/customer';
import { formatarCpfCnpj, validarCpfCnpj, limparCpfCnpj, obterTipoDocumento } from '../../utils/cpfCnpjValidator';

interface ImportClientesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (clientes: Omit<Cliente, 'id' | 'criadoEm' | 'atualizadoEm'>[]) => void;
  clientesExistentes: Cliente[];
}

const ImportClientesModal: React.FC<ImportClientesModalProps> = ({ 
  isOpen, 
  onClose, 
  onImport,
  clientesExistentes 
}) => {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<{
    sucesso: number;
    erros: string[];
    duplicados: string[];
  } | null>(null);

  if (!isOpen) return null;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setArquivo(file);
      setResultado(null);
    }
  };

  const gerarTemplate = () => {
    const csvContent = [
      'Nome,CPF/CNPJ,Email,Telefone,Data Nascimento,CEP,Logradouro,Numero,Complemento,Bairro,Cidade,Estado,Observacoes',
      'João Silva,12345678901,joao@email.com,(11) 99999-1111,15/03/1985,01234-567,Rua das Flores,123,,Centro,São Paulo,SP,Cliente preferencial',
      'Empresa ABC Ltda,12345678000195,contato@empresa.com,(11) 3333-4444,10/05/2010,04567-890,Av. Paulista,1000,Sala 101,Bela Vista,São Paulo,SP,Cliente corporativo'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_importacao_clientes.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const processarArquivo = async () => {
    if (!arquivo) return;

    setProcessando(true);
    setResultado(null);

    try {
      const content = await arquivo.text();
      const lines = content.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error('Arquivo deve conter pelo menos o cabeçalho e uma linha de dados');
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      console.log('Cabeçalhos encontrados:', headers);
      
      // Verificar se os campos obrigatórios estão presentes com mais flexibilidade
      const hasNome = headers.some(h => h.includes('nome'));
      const hasCpfCnpj = headers.some(h => h.includes('cpf') || h.includes('cnpj'));
      const hasEmail = headers.some(h => h.includes('email') || h.includes('e-mail'));
      const hasTelefone = headers.some(h => h.includes('telefone') || h.includes('fone'));
      
      const missingHeaders = [];
      if (!hasNome) missingHeaders.push('nome');
      if (!hasCpfCnpj) missingHeaders.push('cpf/cnpj');
      if (!hasEmail) missingHeaders.push('email');
      if (!hasTelefone) missingHeaders.push('telefone');
      
      if (missingHeaders.length > 0) {
        console.error('Cabeçalhos ausentes:', missingHeaders);
        console.error('Cabeçalhos do arquivo:', headers);
        throw new Error(`Campos obrigatórios ausentes: ${missingHeaders.join(', ')}. Cabeçalhos encontrados: ${headers.join(', ')}`);
      }

      const novosClientes: Omit<Cliente, 'id' | 'criadoEm' | 'atualizadoEm'>[] = [];
      const erros: string[] = [];
      const duplicados: string[] = [];

      // Processar cada linha
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
          const values = line.split(',').map(v => v.trim());
          
          if (values.length < 4) {
            erros.push(`Linha ${i + 1}: Dados insuficientes`);
            continue;
          }

          const nome = values[0];
          const cpfCnpjOriginal = values[1]?.trim() || '';
          const cpfCnpj = limparCpfCnpj(cpfCnpjOriginal);
          const email = values[2];
          const telefone = values[3];
          const dataNascimentoStr = values[4] || '';
          const cep = values[5] || '';
          const logradouro = values[6] || '';
          const numero = values[7] || '';
          const complemento = values[8] || '';
          const bairro = values[9] || '';
          const cidade = values[10] || '';
          const estado = values[11] || '';
          const observacoes = values[12] || '';

          // Processar data de nascimento
          let dataNascimento: Date | undefined;
          if (dataNascimentoStr.trim()) {
            try {
              if (dataNascimentoStr.includes('/')) {
                const [dia, mes, ano] = dataNascimentoStr.split('/');
                dataNascimento = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
              } else if (dataNascimentoStr.includes('-')) {
                dataNascimento = new Date(dataNascimentoStr);
              }
              
              if (dataNascimento && isNaN(dataNascimento.getTime())) {
                dataNascimento = undefined;
              }
            } catch (error) {
              // Data inválida será ignorada
              dataNascimento = undefined;
            }
          }

          // Validações
          if (!nome) {
            erros.push(`Linha ${i + 1}: Nome é obrigatório`);
            continue;
          }

          if (!cpfCnpjOriginal) {
            erros.push(`Linha ${i + 1}: CPF/CNPJ é obrigatório`);
            continue;
          }

          if (!validarCpfCnpj(cpfCnpjOriginal)) {
            erros.push(`Linha ${i + 1}: CPF/CNPJ inválido (${cpfCnpjOriginal}) - Valor limpo: ${cpfCnpj} - Comprimento: ${cpfCnpj.length}`);
            continue;
          }

          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            erros.push(`Linha ${i + 1}: Email inválido (${email})`);
            continue;
          }

          if (!telefone) {
            erros.push(`Linha ${i + 1}: Telefone é obrigatório`);
            continue;
          }

          // Verificar duplicatas
          const clienteExistente = clientesExistentes.find(c => c.cpfCnpj === cpfCnpj);
          if (clienteExistente) {
            duplicados.push(`Linha ${i + 1}: CPF/CNPJ ${formatarCpfCnpj(cpfCnpj)} já existe (${clienteExistente.nome})`);
            continue;
          }

          // Verificar duplicata na própria importação
          const duplicataNaImportacao = novosClientes.find(c => c.cpfCnpj === cpfCnpj);
          if (duplicataNaImportacao) {
            erros.push(`Linha ${i + 1}: CPF/CNPJ ${formatarCpfCnpj(cpfCnpj)} duplicado na importação`);
            continue;
          }

          const tipo = obterTipoDocumento(cpfCnpj);
          if (!tipo) {
            erros.push(`Linha ${i + 1}: Não foi possível determinar o tipo do documento`);
            continue;
          }

          // Criar cliente
          const novoCliente: Omit<Cliente, 'id' | 'criadoEm' | 'atualizadoEm'> = {
            nome,
            cpfCnpj,
            email,
            telefone,
            dataNascimento,
            tipo,
            endereco: cep || logradouro || numero || bairro || cidade || estado ? {
              cep: cep || undefined,
              logradouro: logradouro || undefined,
              numero: numero || undefined,
              complemento: complemento || undefined,
              bairro: bairro || undefined,
              cidade: cidade || undefined,
              estado: estado || undefined,
            } : undefined,
            observacoes: observacoes || undefined
          };

          novosClientes.push(novoCliente);

        } catch (error) {
          erros.push(`Linha ${i + 1}: Erro ao processar - ${error}`);
        }
      }

      setResultado({
        sucesso: novosClientes.length,
        erros,
        duplicados
      });

      // Se há clientes válidos, importar
      if (novosClientes.length > 0) {
        onImport(novosClientes);
      }

    } catch (error) {
      setResultado({
        sucesso: 0,
        erros: [`Erro ao processar arquivo: ${error}`],
        duplicados: []
      });
    } finally {
      setProcessando(false);
    }
  };

  const handleClose = () => {
    setArquivo(null);
    setResultado(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Users className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Importar Clientes</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Instruções */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">📋 Instruções de Importação</h3>
            <div className="text-sm text-blue-700 space-y-1">
              <p>• O arquivo deve estar no formato CSV (separado por vírgulas)</p>
              <p>• Campos obrigatórios: Nome, CPF/CNPJ, Email, Telefone</p>
              <p>• Data de Nascimento: opcional, formato DD/MM/AAAA (ex: 15/03/1985)</p>
              <p>• CPF/CNPJ deve ser válido e único</p>
              <p>• Email deve ter formato válido</p>
              <p>• Use o template para garantir o formato correto</p>
            </div>
          </div>

          {/* Template */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-gray-600" />
              <div>
                <p className="text-sm font-medium text-gray-800">Template de Importação</p>
                <p className="text-xs text-gray-600">Baixe o modelo com exemplos de preenchimento</p>
              </div>
            </div>
            <button
              onClick={gerarTemplate}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center text-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              Baixar Template
            </button>
          </div>

          {/* Upload de Arquivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecionar Arquivo CSV
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center space-y-2"
              >
                <Upload className="w-8 h-8 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Clique para selecionar ou arraste o arquivo CSV aqui
                </span>
                <span className="text-xs text-gray-500">
                  Apenas arquivos .csv são aceitos
                </span>
              </label>
            </div>
            
            {arquivo && (
              <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-green-600" />
                    <span className="text-sm text-green-800">{arquivo.name}</span>
                    <span className="text-xs text-green-600">
                      ({(arquivo.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    onClick={() => setArquivo(null)}
                    className="text-red-600 hover:text-red-800 text-sm"
                  >
                    Remover
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Resultado do Processamento */}
          {resultado && (
            <div className="space-y-4">
              {/* Resumo */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Importados</p>
                      <p className="text-lg font-bold text-green-900">{resultado.sucesso}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Duplicados</p>
                      <p className="text-lg font-bold text-yellow-900">{resultado.duplicados.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Erros</p>
                      <p className="text-lg font-bold text-red-900">{resultado.erros.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detalhes dos Erros */}
              {(resultado.erros.length > 0 || resultado.duplicados.length > 0) && (
                <div className="space-y-3">
                  {resultado.duplicados.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-yellow-800 mb-2">
                        ⚠️ Clientes Duplicados (Ignorados)
                      </h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {resultado.duplicados.map((duplicado, index) => (
                          <p key={index} className="text-xs text-yellow-700">{duplicado}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {resultado.erros.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="text-sm font-medium text-red-800 mb-2">
                        ❌ Erros de Validação
                      </h4>
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {resultado.erros.map((erro, index) => (
                          <p key={index} className="text-xs text-red-700">{erro}</p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Mensagem de Sucesso */}
              {resultado.sucesso > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-800">
                      <strong>{resultado.sucesso} cliente{resultado.sucesso !== 1 ? 's' : ''}</strong> 
                      {resultado.sucesso === 1 ? ' foi importado' : ' foram importados'} com sucesso!
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            {resultado ? 'Fechar' : 'Cancelar'}
          </button>
          
          {arquivo && !resultado && (
            <button
              onClick={processarArquivo}
              disabled={processando}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center"
            >
              {processando ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Importar Clientes
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportClientesModal;