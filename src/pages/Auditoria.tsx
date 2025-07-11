import React, { useState } from 'react';
import { FileText, Download, Share2, Printer, Copy, Check, AlertCircle } from 'lucide-react';
import AuditoriaReportViewer from '../components/Auditoria/AuditoriaReportViewer';

const Auditoria: React.FC = () => {
  const [copied, setCopied] = useState(false);
  
  // Fetch the report content from the file
  const reportContent = `# Relatório de Auditoria - Cartões de Clientes
## Sistema de Gerenciamento de Produção - Corretora de Seguros

### Data da Auditoria: 2024-12-19

---

## 1. INCONSISTÊNCIAS IDENTIFICADAS

### 1.1 Estrutura de Dados dos Clientes

#### **PROBLEMA CRÍTICO: Duplicação de Dados do Cliente**
- **Renovações**: Armazenam dados do cliente diretamente no objeto (\`nomeCliente\`, \`emailCliente\`, \`telefoneCliente\`, \`cpfCnpjCliente\`)
- **Seguros Novos**: Também armazenam dados do cliente diretamente no objeto
- **Cliente Master**: Existe uma entidade separada de \`Cliente\` com dados completos

**Impacto**: Dados podem ficar desatualizados e inconsistentes entre diferentes cartões do mesmo cliente.

### 1.2 Campos de Identificação do Cliente

#### **Inconsistência em CPF/CNPJ**
- **Renovações**: Campo \`cpfCnpjCliente\` é opcional (\`cpfCnpjCliente?: string\`)
- **Seguros Novos**: Campo \`cpfCnpjCliente\` também é opcional
- **Cliente Master**: Campo \`cpfCnpj\` é obrigatório

**Problema**: Alguns cartões podem não ter CPF/CNPJ enquanto outros têm, mesmo sendo do mesmo cliente.

### 1.3 Vinculação com Cliente Master

#### **Inconsistência na Referência**
- **Ambos os tipos**: Possuem \`clienteId?: string\` (opcional)
- **Problema**: Cartões podem existir sem vinculação ao cliente master
- **Consequência**: Dados duplicados e possível perda de histórico

### 1.4 Campos de Data

#### **Diferenças Conceituais**
- **Renovações**: Usam \`fimVigencia: Date\` (data de vencimento)
- **Seguros Novos**: Usam \`inicioVigencia: Date\` (data de início)
- **Inconsistência**: Não há padronização de período de vigência

### 1.5 Status dos Cartões

#### **Enums Diferentes**
- **Renovações**: \`StatusRenovacao\` com valores específicos (\`renovado\`, \`nao_renovada\`)
- **Seguros Novos**: \`StatusSeguroNovo\` com valores específicos (\`fechado\`, \`perdido\`)
- **Problema**: Impossível comparar status entre tipos de cartão

### 1.6 Campos de Valor

#### **Estruturas Diferentes**
**Renovações**:
- \`premioLiquidoAnterior\`, \`percentualComissaoAnterior\`, \`comissaoAnterior\`
- \`premioLiquidoNovo\`, \`percentualComissaoNova\`, \`comissaoNova\`
- \`resultado\` (diferença entre comissões)

**Seguros Novos**:
- \`premioLiquidoNovo\`, \`percentualComissaoNova\`, \`comissaoNova\`
- \`comissaoAReceber\` (baseada nas regras do ramo)

**Problema**: Não há padronização para cálculo de comissões.

---

## 2. ANÁLISE POR TIPO DE CARTÃO

### 2.1 Cartões de Renovação
**Problemas Identificados**:
- ✗ Dados do cliente duplicados
- ✗ CPF/CNPJ opcional pode causar inconsistências
- ✗ Vinculação opcional com cliente master
- ✗ Campos específicos de renovação não aplicáveis a outros tipos

### 2.2 Cartões de Seguros Novos
**Problemas Identificados**:
- ✗ Mesma duplicação de dados do cliente
- ✗ Estrutura de comissão diferente das renovações
- ✗ Status incompatível com renovações
- ✗ Falta de histórico anterior (normal para seguros novos)

### 2.3 Entidade Cliente Master
**Problemas Identificados**:
- ✗ Não é utilizada consistentemente
- ✗ Dados podem ficar desatualizados
- ✗ Endereço completo só existe aqui

---

## 3. IMPACTOS IDENTIFICADOS

### 3.1 Inconsistência de Dados
- Cliente pode ter nome diferente em cartões diferentes
- Email e telefone podem estar desatualizados em alguns cartões
- CPF/CNPJ pode estar ausente em alguns cartões

### 3.2 Dificuldade de Relatórios
- Impossível consolidar dados do cliente facilmente
- Relatórios podem mostrar informações conflitantes
- Histórico fragmentado entre diferentes tipos de cartão

### 3.3 Experiência do Usuário
- Busca por cliente pode retornar resultados inconsistentes
- Dados do cliente podem aparecer diferentes em telas diferentes
- Dificuldade para manter informações atualizadas

---

## 4. SUGESTÕES DE CORREÇÃO

### 4.1 PRIORIDADE ALTA - Normalização de Dados

#### **Solução 1: Referência Obrigatória ao Cliente**
\`\`\`typescript
// Remover campos duplicados dos cartões
interface RenovacaoSeguro {
  id: string;
  clienteId: string; // OBRIGATÓRIO
  responsavel: string;
  // Remover: nomeCliente, emailCliente, telefoneCliente, cpfCnpjCliente
  fimVigencia: Date;
  // ... outros campos específicos de renovação
}

interface SeguroNovo {
  id: string;
  clienteId: string; // OBRIGATÓRIO
  responsavel: string;
  // Remover: nomeCliente, emailCliente, telefoneCliente, cpfCnpjCliente
  inicioVigencia: Date;
  // ... outros campos específicos de seguro novo
}
\`\`\`

#### **Solução 2: Padronização de Status**
\`\`\`typescript
// Status base comum
type StatusBase = 'ativo' | 'concluido' | 'cancelado' | 'pendente';

// Status específicos como extensão
type StatusRenovacao = StatusBase | 'renovado' | 'nao_renovada';
type StatusSeguroNovo = StatusBase | 'fechado' | 'perdido';
\`\`\`

### 4.2 PRIORIDADE MÉDIA - Padronização de Campos

#### **Solução 3: Interface Base para Cartões**
\`\`\`typescript
interface CartaoBase {
  id: string;
  clienteId: string;
  responsavel: string;
  tipo: 'renovacao' | 'seguro_novo';
  dataVigencia: Date; // Padronizado
  ramo: Ramo;
  seguradora: Seguradora;
  premioLiquido: number;
  percentualComissao: number;
  comissao: number;
  status: string;
  observacoes: Observacao[];
  tarefas: Tarefa[];
  criadoEm: Date;
  atualizadoEm: Date;
}
\`\`\`

### 4.3 PRIORIDADE BAIXA - Melhorias de UX

#### **Solução 4: Validação de Integridade**
- Implementar validação para garantir que \`clienteId\` sempre existe
- Criar rotina de sincronização de dados do cliente
- Implementar cache de dados do cliente para performance

#### **Solução 5: Histórico Unificado**
- Criar view unificada do histórico do cliente
- Implementar timeline com todos os cartões do cliente
- Padronizar exibição de informações

---

## 5. PLANO DE IMPLEMENTAÇÃO

### Fase 1 - Correção Crítica (1-2 semanas)
1. Tornar \`clienteId\` obrigatório em todos os cartões
2. Criar rotina de migração de dados existentes
3. Remover campos duplicados dos cartões
4. Implementar validação de integridade

### Fase 2 - Padronização (2-3 semanas)
1. Padronizar status entre tipos de cartão
2. Criar interface base comum
3. Implementar campos padronizados
4. Atualizar todas as telas para usar dados do cliente master

### Fase 3 - Melhorias (1-2 semanas)
1. Implementar cache de dados do cliente
2. Criar views unificadas
3. Melhorar experiência de busca
4. Implementar relatórios consolidados

---

## 6. RISCOS E CONSIDERAÇÕES

### Riscos Técnicos
- **Migração de Dados**: Risco de perda de dados durante a migração
- **Performance**: Consultas podem ficar mais lentas inicialmente
- **Compatibilidade**: Código existente pode quebrar

### Riscos de Negócio
- **Downtime**: Sistema pode ficar indisponível durante migração
- **Treinamento**: Usuários precisarão se adaptar às mudanças
- **Dados Históricos**: Alguns dados podem ser perdidos se não migrados corretamente

### Mitigações Sugeridas
- Backup completo antes da migração
- Implementação gradual por módulos
- Testes extensivos em ambiente de desenvolvimento
- Treinamento prévio dos usuários

---

## 7. CONCLUSÃO

O sistema apresenta inconsistências significativas na estrutura de dados dos cartões de clientes, principalmente devido à duplicação de informações e falta de padronização entre renovações e seguros novos. 

**Recomendação**: Implementar as correções em fases, priorizando a normalização de dados para garantir integridade e consistência das informações.

**Benefícios Esperados**:
- Dados consistentes em todo o sistema
- Facilidade de manutenção e desenvolvimento
- Melhor experiência do usuário
- Relatórios mais precisos e confiáveis
- Redução de bugs relacionados a inconsistências de dados
`;

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const blob = new Blob([reportContent], { type: 'text/markdown;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'relatorio-auditoria-cartoes.md';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FileText className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-semibold text-gray-800">Relatório de Auditoria</h1>
            <p className="text-sm text-gray-600">Análise de inconsistências nos cartões de clientes</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={handleCopyReport}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copiado!' : 'Copiar'}</span>
          </button>
          
          <button 
            onClick={handlePrintReport}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir</span>
          </button>
          
          <button 
            onClick={handleDownloadReport}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download</span>
          </button>
        </div>
      </div>

      <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <h3 className="font-medium text-yellow-800">Relatório de Auditoria Técnica</h3>
            <p className="text-sm text-yellow-700 mt-1">
              Este relatório identifica inconsistências na estrutura de dados dos cartões de clientes e propõe soluções para melhorar a integridade e consistência dos dados.
            </p>
          </div>
        </div>
      </div>

      <AuditoriaReportViewer reportContent={reportContent} />
    </div>
  );
};

export default Auditoria;