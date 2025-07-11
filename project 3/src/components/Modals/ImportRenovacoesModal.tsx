import React, { useState } from 'react';
import { X, Upload, Download, FileText, AlertCircle, CheckCircle, Calendar } from 'lucide-react';
import { RenovacaoSeguro } from '../../types';
import { Cliente } from '../../types/customer';
import { formatarCpfCnpj, validarCpfCnpj, limparCpfCnpj, obterTipoDocumento } from '../../utils/cpfCnpjValidator';
import { seguradoras, ramos } from '../../data/mockData';

interface ImportRenovacoesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (renovacoes: Omit<RenovacaoSeguro, 'id' | 'criadoEm' | 'atualizadoEm'>[]) => void;
  clientes: Cliente[];
  onCreateCliente?: (cliente: Omit<Cliente, 'id' | 'criadoEm' | 'atualizadoEm'>) => Cliente;
}

const ImportRenovacoesModal: React.FC<ImportRenovacoesModalProps> = ({ 
  isOpen, 
  onClose, 
  onImport,
  clientes,
  onCreateCliente
}) => {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [processando, setProcessando] = useState(false);
  const [resultado, setResultado] = useState<{
    sucesso: number;
    erros: string[];
    clientesCriados: string[];
    avisos: string[];
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
      'Cliente,CPF/CNPJ,Email,Telefone,Fim Vigencia,Ramo,Seguradora Anterior,Premio Liquido Anterior,Percentual Comissao Anterior,Responsavel',
      'João Silva,12345678901,joao@email.com,(11) 99999-1111,31/12/2024,Auto,Bradesco Seguros,2500.00,15,Maria Santos',
      'Empresa ABC Ltda,12345678000195,contato@empresa.com,(11) 3333-4444,15/01/2025,Empresarial,SulAmérica,15000.00,12,João Silva',
      'Carlos Mendes,98765432100,carlos@email.com,(11) 98888-7777,28/02/2025,Residencial,Porto Seguro,800.00,20,Pedro Costa'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_importacao_renovacoes.csv';
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
      
      // Verificar se os campos obrigatórios estão presentes
      const hasCliente = headers.some(h => h.includes('cliente'));
      const hasCpfCnpj = headers.some(h => h.includes('cpf') || h.includes('cnpj'));
      const hasEmail = headers.some(h => h.includes('email') || h.includes('e-mail'));
      const hasTelefone = headers.some(h => h.includes('telefone') || h.includes('fone'));
      const hasFimVigencia = headers.some(h => h.includes('vigencia') || h.includes('vencimento'));
      const hasRamo = headers.some(h => h.includes('ramo'));
      const hasSeguradora = headers.some(h => h.includes('seguradora'));
      const hasPremio = headers.some(h => h.includes('premio') || h.includes('prêmio'));
      const hasPercentual = headers.some(h => h.includes('percentual') || h.includes('comissao') || h.includes('comissão'));
      const hasResponsavel = headers.some(h => h.includes('responsavel') || h.includes('responsável'));
      
      const missingHeaders = [];
      if (!hasCliente) missingHeaders.push('cliente');
      if (!hasCpfCnpj) missingHeaders.push('cpf/cnpj');
      if (!hasEmail) missingHeaders.push('email');
      if (!hasTelefone) missingHeaders.push('telefone');
      if (!hasFimVigencia) missingHeaders.push('fim vigencia');
      if (!hasRamo) missingHeaders.push('ramo');
      if (!hasSeguradora) missingHeaders.push('seguradora anterior');
      if (!hasPremio) missingHeaders.push('premio liquido anterior');
      if (!hasPercentual) missingHeaders.push('percentual comissao anterior');
      if (!hasResponsavel) missingHeaders.push('responsavel');
      
      if (missingHeaders.length > 0) {
        console.error('Cabeçalhos ausentes:', missingHeaders);
        console.error('Cabeçalhos do arquivo:', headers);
        throw new Error(`Campos obrigatórios ausentes: ${missingHeaders.join(', ')}. Cabeçalhos encontrados: ${headers.join(', ')}`);
      }

      const novasRenovacoes: Omit<RenovacaoSeguro, 'id' | 'criadoEm' | 'atualizadoEm'>[] = [];
      const erros: string[] = [];
      const clientesCriados: string[] = [];
      const avisos: string[] = [];
      let clientesAtualizados = [...clientes];

      // Processar cada linha
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
          const values = line.split(',').map(v => v.trim());
          
          if (values.length < 10) {
            erros.push(`Linha ${i + 1}: Dados insuficientes (esperado 10 campos, encontrado ${values.length})`);
            continue;
          }

          const nomeCliente = values[0];
          const cpfCnpjOriginal = values[1];
          const email = values[2];
          const telefone = values[3];
          const fimVigenciaStr = values[4];
          const ramoNome = values[5];
          const seguradoraAnteriorNome = values[6];
          const premioLiquidoAnteriorStr = values[7];
          const percentualComissaoAnteriorStr = values[8];
          const responsavel = values[9];

          // Validações básicas
          if (!nomeCliente) {
            erros.push(`Linha ${i + 1}: Nome do cliente é obrigatório`);
            continue;
          }

          if (!cpfCnpjOriginal) {
            erros.push(`Linha ${i + 1}: CPF/CNPJ é obrigatório`);
            continue;
          }

          const cpfCnpj = limparCpfCnpj(cpfCnpjOriginal);
          if (!validarCpfCnpj(cpfCnpjOriginal)) {
            erros.push(`Linha ${i + 1}: CPF/CNPJ inválido (${cpfCnpjOriginal})`);
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

          if (!responsavel) {
            erros.push(`Linha ${i + 1}: Responsável é obrigatório`);
            continue;
          }

          // Processar data de fim de vigência
          let fimVigencia: Date;
          try {
            if (fimVigenciaStr.includes('/')) {
              const [dia, mes, ano] = fimVigenciaStr.split('/');
              fimVigencia = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
            } else if (fimVigenciaStr.includes('-')) {
              fimVigencia = new Date(fimVigenciaStr);
            } else {
              throw new Error('Formato de data inválido');
            }
            
            if (isNaN(fimVigencia.getTime())) {
              throw new Error('Data inválida');
            }
          } catch (error) {
            erros.push(`Linha ${i + 1}: Data de fim de vigência inválida (${fimVigenciaStr}). Use DD/MM/AAAA`);
            continue;
          }

          // Buscar ramo
          const ramo = ramos.find(r => r.nome.toLowerCase() === ramoNome.toLowerCase());
          if (!ramo) {
            erros.push(`Linha ${i + 1}: Ramo não encontrado (${ramoNome}). Ramos disponíveis: ${ramos.map(r => r.nome).join(', ')}`);
            continue;
          }

          // Buscar seguradora anterior
          const seguradoraAnterior = seguradoras.find(s => 
            s.nome.toLowerCase().includes(seguradoraAnteriorNome.toLowerCase()) ||
            seguradoraAnteriorNome.toLowerCase().includes(s.nome.toLowerCase())
          );
          if (!seguradoraAnterior) {
            erros.push(`Linha ${i + 1}: Seguradora anterior não encontrada (${seguradoraAnteriorNome}). Seguradoras disponíveis: ${seguradoras.map(s => s.nome).join(', ')}`);
            continue;
          }

          // Processar valores numéricos
          const premioLiquidoAnterior = parseFloat(premioLiquidoAnteriorStr.replace(/[^\d.,]/g, '').replace(',', '.'));
          if (isNaN(premioLiquidoAnterior) || premioLiquidoAnterior <= 0) {
            erros.push(`Linha ${i + 1}: Prêmio líquido anterior inválido (${premioLiquidoAnteriorStr})`);
            continue;
          }

          const percentualComissaoAnterior = parseFloat(percentualComissaoAnteriorStr.replace('%', ''));
          if (isNaN(percentualComissaoAnterior) || percentualComissaoAnterior <= 0) {
            erros.push(`Linha ${i + 1}: Percentual de comissão anterior inválido (${percentualComissaoAnteriorStr})`);
            continue;
          }

          // Buscar ou criar cliente
          let cliente = clientesAtualizados.find(c => c.cpfCnpj === cpfCnpj);
          
          if (!cliente) {
            // Criar novo cliente
            const tipoDocumento = obterTipoDocumento(cpfCnpjOriginal);
            if (!tipoDocumento) {
              erros.push(`Linha ${i + 1}: Não foi possível determinar o tipo do documento`);
              continue;
            }

            const novoClienteData: Omit<Cliente, 'id' | 'criadoEm' | 'atualizadoEm'> = {
              nome: nomeCliente,
              cpfCnpj,
              email,
              telefone,
              tipo: tipoDocumento
            };

            if (onCreateCliente) {
              cliente = onCreateCliente(novoClienteData);
              clientesAtualizados.push(cliente);
              clientesCriados.push(`${nomeCliente} (${formatarCpfCnpj(cpfCnpj)})`);
            } else {
              erros.push(`Linha ${i + 1}: Cliente não encontrado e criação automática não disponível (${nomeCliente})`);
              continue;
            }
          } else {
            // Verificar se os dados do cliente batem
            if (cliente.nome !== nomeCliente) {
              avisos.push(`Linha ${i + 1}: Nome do cliente difere do cadastrado. Arquivo: "${nomeCliente}", Cadastrado: "${cliente.nome}"`);
            }
            if (cliente.email !== email) {
              avisos.push(`Linha ${i + 1}: Email do cliente difere do cadastrado. Arquivo: "${email}", Cadastrado: "${cliente.email}"`);
            }
          }

          // Calcular comissão anterior
          const comissaoAnterior = premioLiquidoAnterior * (percentualComissaoAnterior / 100);

          // Criar renovação
          const novaRenovacao: Omit<RenovacaoSeguro, 'id' | 'criadoEm' | 'atualizadoEm'> = {
            clienteId: cliente.id,
            responsavel,
            fimVigencia,
            ramo,
            seguradoraAnterior,
            premioLiquidoAnterior,
            percentualComissaoAnterior,
            comissaoAnterior,
            status: 'a_trabalhar',
            observacoes: [{
              id: `obs-import-${Date.now()}-${i}`,
              texto: 'Renovação importada automaticamente via planilha CSV',
              data: new Date(),
              usuario: 'Sistema',
              anexos: []
            }],
            tarefas: []
          };

          novasRenovacoes.push(novaRenovacao);

        } catch (error) {
          console.error(`Erro ao processar linha ${i + 1}:`, error);
          erros.push(`Linha ${i + 1}: Erro ao processar - ${error}`);
        }
      }

      setResultado({
        sucesso: novasRenovacoes.length,
        erros,
        clientesCriados,
        avisos
      });

      // Se há renovações válidas, importar
      if (novasRenovacoes.length > 0) {
        onImport(novasRenovacoes);
      }

    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      setResultado({
        sucesso: 0,
        erros: [`Erro ao processar arquivo: ${error}`],
        clientesCriados: [],
        avisos: []
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
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Calendar className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-800">Importar Renovações</h2>
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
              <p>• <strong>Campos obrigatórios:</strong> Cliente, CPF/CNPJ, Email, Telefone, Fim Vigência, Ramo, Seguradora Anterior, Prêmio Líquido Anterior, Percentual Comissão Anterior, Responsável</p>
              <p>• <strong>Formato de data:</strong> DD/MM/AAAA (ex: 31/12/2024)</p>
              <p>• <strong>CPF/CNPJ:</strong> deve ser válido e único</p>
              <p>• <strong>Valores:</strong> use ponto ou vírgula como separador decimal</p>
              <p>• <strong>Clientes:</strong> serão criados automaticamente se não existirem</p>
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

          {/* Informações sobre Ramos e Seguradoras */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-green-800 mb-2">🎯 Ramos Disponíveis</h4>
              <div className="text-xs text-green-700 space-y-1">
                {ramos.filter(r => r.ativo).map(ramo => (
                  <div key={ramo.id}>• {ramo.nome}</div>
                ))}
              </div>
            </div>
            
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-800 mb-2">🏢 Seguradoras Disponíveis</h4>
              <div className="text-xs text-purple-700 space-y-1">
                {seguradoras.filter(s => s.ativa).map(seguradora => (
                  <div key={seguradora.id}>• {seguradora.nome}</div>
                ))}
              </div>
            </div>
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
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Importadas</p>
                      <p className="text-lg font-bold text-green-900">{resultado.sucesso}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-800">Clientes Criados</p>
                      <p className="text-lg font-bold text-blue-900">{resultado.clientesCriados.length}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Avisos</p>
                      <p className="text-lg font-bold text-yellow-900">{resultado.avisos.length}</p>
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

              {/* Detalhes dos Clientes Criados */}
              {resultado.clientesCriados.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">
                    ✅ Clientes Criados Automaticamente
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {resultado.clientesCriados.map((cliente, index) => (
                      <p key={index} className="text-xs text-blue-700">• {cliente}</p>
                    ))}
                  </div>
                </div>
              )}

              {/* Detalhes dos Avisos */}
              {resultado.avisos.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-yellow-800 mb-2">
                    ⚠️ Avisos (Processado com Divergências)
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {resultado.avisos.map((aviso, index) => (
                      <p key={index} className="text-xs text-yellow-700">{aviso}</p>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Detalhes dos Erros */}
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

              {/* Mensagem de Sucesso */}
              {resultado.sucesso > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-800">
                      <strong>{resultado.sucesso} renovaç{resultado.sucesso === 1 ? 'ão foi importada' : 'ões foram importadas'}</strong> com sucesso!
                      {resultado.clientesCriados.length > 0 && (
                        <span> {resultado.clientesCriados.length} cliente{resultado.clientesCriados.length === 1 ? ' foi criado' : 's foram criados'} automaticamente.</span>
                      )}
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
                  Importar Renovações
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImportRenovacoesModal;