import React, { useState } from 'react';
import { FileText, AlertCircle, CheckCircle, ChevronDown, ChevronRight, Code, ExternalLink } from 'lucide-react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface AuditoriaReportViewerProps {
  reportContent: string;
}

const AuditoriaReportViewer: React.FC<AuditoriaReportViewerProps> = ({ reportContent }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'inconsistencias': true,
    'analise': false,
    'impactos': false,
    'sugestoes': true,
    'plano': false,
    'riscos': false,
    'conclusao': false
  });

  // Parse markdown content
  const sections = parseMarkdownContent(reportContent);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
        <div className="flex items-center space-x-4">
          <FileText className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold">{sections.title}</h1>
            <p className="text-blue-100">{sections.subtitle}</p>
            <p className="text-blue-200 text-sm mt-2">{sections.date}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Inconsistências */}
        <Section 
          id="inconsistencias"
          title="1. INCONSISTÊNCIAS IDENTIFICADAS"
          icon={<AlertCircle className="w-5 h-5 text-red-500" />}
          isExpanded={expandedSections['inconsistencias']}
          onToggle={() => toggleSection('inconsistencias')}
          severity="critical"
        >
          <div className="space-y-4">
            {sections.inconsistencias.map((item, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-medium text-red-800 mb-2">{item.title}</h4>
                <div className="space-y-2">
                  {item.content.map((content, i) => (
                    <div key={i}>
                      {content.type === 'paragraph' && (
                        <p className="text-sm text-red-700">{content.text}</p>
                      )}
                      {content.type === 'list' && (
                        <ul className="list-disc pl-5 text-sm text-red-700 space-y-1">
                          {content.items.map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </ul>
                      )}
                      {content.type === 'code' && (
                        <div className="bg-gray-800 text-gray-100 rounded-md p-3 text-sm font-mono overflow-x-auto mt-2">
                          <pre>{content.code}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Análise por Tipo de Cartão */}
        <Section 
          id="analise"
          title="2. ANÁLISE POR TIPO DE CARTÃO"
          icon={<FileText className="w-5 h-5 text-blue-500" />}
          isExpanded={expandedSections['analise']}
          onToggle={() => toggleSection('analise')}
          severity="info"
        >
          <div className="space-y-4">
            {sections.analise.map((item, index) => (
              <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">{item.title}</h4>
                <div className="space-y-2">
                  {item.content.map((content, i) => (
                    <div key={i}>
                      {content.type === 'paragraph' && (
                        <p className="text-sm text-blue-700">{content.text}</p>
                      )}
                      {content.type === 'list' && (
                        <ul className="list-disc pl-5 text-sm text-blue-700 space-y-1">
                          {content.items.map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Impactos Identificados */}
        <Section 
          id="impactos"
          title="3. IMPACTOS IDENTIFICADOS"
          icon={<AlertCircle className="w-5 h-5 text-orange-500" />}
          isExpanded={expandedSections['impactos']}
          onToggle={() => toggleSection('impactos')}
          severity="warning"
        >
          <div className="space-y-4">
            {sections.impactos.map((item, index) => (
              <div key={index} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h4 className="font-medium text-orange-800 mb-2">{item.title}</h4>
                <div className="space-y-2">
                  {item.content.map((content, i) => (
                    <div key={i}>
                      {content.type === 'paragraph' && (
                        <p className="text-sm text-orange-700">{content.text}</p>
                      )}
                      {content.type === 'list' && (
                        <ul className="list-disc pl-5 text-sm text-orange-700 space-y-1">
                          {content.items.map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Sugestões de Correção */}
        <Section 
          id="sugestoes"
          title="4. SUGESTÕES DE CORREÇÃO"
          icon={<CheckCircle className="w-5 h-5 text-green-500" />}
          isExpanded={expandedSections['sugestoes']}
          onToggle={() => toggleSection('sugestoes')}
          severity="success"
        >
          <div className="space-y-4">
            {sections.sugestoes.map((item, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-800 mb-2">{item.title}</h4>
                <div className="space-y-2">
                  {item.content.map((content, i) => (
                    <div key={i}>
                      {content.type === 'paragraph' && (
                        <p className="text-sm text-green-700">{content.text}</p>
                      )}
                      {content.type === 'list' && (
                        <ul className="list-disc pl-5 text-sm text-green-700 space-y-1">
                          {content.items.map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </ul>
                      )}
                      {content.type === 'code' && (
                        <div className="bg-gray-800 text-gray-100 rounded-md p-3 text-sm font-mono overflow-x-auto mt-2">
                          <pre>{content.code}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Plano de Implementação */}
        <Section 
          id="plano"
          title="5. PLANO DE IMPLEMENTAÇÃO"
          icon={<FileText className="w-5 h-5 text-purple-500" />}
          isExpanded={expandedSections['plano']}
          onToggle={() => toggleSection('plano')}
          severity="info"
        >
          <div className="space-y-4">
            {sections.plano.map((item, index) => (
              <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h4 className="font-medium text-purple-800 mb-2">{item.title}</h4>
                <div className="space-y-2">
                  {item.content.map((content, i) => (
                    <div key={i}>
                      {content.type === 'paragraph' && (
                        <p className="text-sm text-purple-700">{content.text}</p>
                      )}
                      {content.type === 'list' && (
                        <ul className="list-decimal pl-5 text-sm text-purple-700 space-y-1">
                          {content.items.map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Riscos e Considerações */}
        <Section 
          id="riscos"
          title="6. RISCOS E CONSIDERAÇÕES"
          icon={<AlertCircle className="w-5 h-5 text-yellow-500" />}
          isExpanded={expandedSections['riscos']}
          onToggle={() => toggleSection('riscos')}
          severity="warning"
        >
          <div className="space-y-4">
            {sections.riscos.map((item, index) => (
              <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-800 mb-2">{item.title}</h4>
                <div className="space-y-2">
                  {item.content.map((content, i) => (
                    <div key={i}>
                      {content.type === 'paragraph' && (
                        <p className="text-sm text-yellow-700">{content.text}</p>
                      )}
                      {content.type === 'list' && (
                        <ul className="list-disc pl-5 text-sm text-yellow-700 space-y-1">
                          {content.items.map((item, j) => (
                            <li key={j}>{item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Conclusão */}
        <Section 
          id="conclusao"
          title="7. CONCLUSÃO"
          icon={<CheckCircle className="w-5 h-5 text-blue-500" />}
          isExpanded={expandedSections['conclusao']}
          onToggle={() => toggleSection('conclusao')}
          severity="info"
        >
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="space-y-3">
              {sections.conclusao.map((paragraph, index) => (
                <p key={index} className="text-sm text-blue-700">{paragraph}</p>
              ))}
            </div>
          </div>
        </Section>
      </div>

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 italic">
          <p>Relatório gerado automaticamente pelo sistema de auditoria</p>
          <p>Para dúvidas ou esclarecimentos, contate a equipe de desenvolvimento</p>
        </div>
      </div>
    </div>
  );
};

interface SectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isExpanded: boolean;
  onToggle: () => void;
  severity: 'critical' | 'warning' | 'success' | 'info';
}

const Section: React.FC<SectionProps> = ({ 
  id, 
  title, 
  icon, 
  children, 
  isExpanded, 
  onToggle,
  severity
}) => {
  const getBgColor = () => {
    switch (severity) {
      case 'critical': return 'bg-red-100';
      case 'warning': return 'bg-yellow-100';
      case 'success': return 'bg-green-100';
      case 'info': return 'bg-blue-100';
      default: return 'bg-gray-100';
    }
  };

  const getTextColor = () => {
    switch (severity) {
      case 'critical': return 'text-red-800';
      case 'warning': return 'text-yellow-800';
      case 'success': return 'text-green-800';
      case 'info': return 'text-blue-800';
      default: return 'text-gray-800';
    }
  };

  const getBorderColor = () => {
    switch (severity) {
      case 'critical': return 'border-red-200';
      case 'warning': return 'border-yellow-200';
      case 'success': return 'border-green-200';
      case 'info': return 'border-blue-200';
      default: return 'border-gray-200';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className={`w-full flex items-center justify-between p-4 text-left ${getBgColor()} ${getTextColor()} transition-colors`}
      >
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="font-semibold">{title}</h3>
        </div>
        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>
      
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

// Helper function to parse markdown content
function parseMarkdownContent(content: string) {
  const lines = content.split('\n');
  let currentSection = '';
  let currentSubsection = '';
  
  const result: any = {
    title: '',
    subtitle: '',
    date: '',
    inconsistencias: [],
    analise: [],
    impactos: [],
    sugestoes: [],
    plano: [],
    riscos: [],
    conclusao: []
  };

  let codeBlock = false;
  let codeContent = '';
  let listItems: string[] = [];
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Extract title and date
    if (line.startsWith('# ')) {
      result.title = line.replace('# ', '');
    } else if (line.startsWith('## ')) {
      result.subtitle = line.replace('## ', '');
    } else if (line.includes('Data da Auditoria:')) {
      result.date = line.replace('### Data da Auditoria: ', '');
    }
    // Main sections
    else if (line.startsWith('## 1. INCONSISTÊNCIAS')) {
      currentSection = 'inconsistencias';
    } else if (line.startsWith('## 2. ANÁLISE')) {
      currentSection = 'analise';
    } else if (line.startsWith('## 3. IMPACTOS')) {
      currentSection = 'impactos';
    } else if (line.startsWith('## 4. SUGESTÕES')) {
      currentSection = 'sugestoes';
    } else if (line.startsWith('## 5. PLANO')) {
      currentSection = 'plano';
    } else if (line.startsWith('## 6. RISCOS')) {
      currentSection = 'riscos';
    } else if (line.startsWith('## 7. CONCLUSÃO')) {
      currentSection = 'conclusao';
    }
    // Subsections
    else if (line.startsWith('### ') && currentSection) {
      currentSubsection = line.replace('### ', '');
      if (currentSection !== 'conclusao') {
        result[currentSection].push({
          title: currentSubsection,
          content: []
        });
      }
    }
    // Subsubsections
    else if (line.startsWith('#### ') && currentSection && currentSubsection) {
      const subsubsectionTitle = line.replace('#### ', '');
      if (currentSection !== 'conclusao' && result[currentSection] && Array.isArray(result[currentSection]) && result[currentSection].length > 0) {
        const lastItem = result[currentSection][result[currentSection].length - 1];
        lastItem.content.push({
          type: 'paragraph',
          text: `**${subsubsectionTitle}**`
        });
      }
    }
    // Code blocks
    else if (line.startsWith('```')) {
      if (codeBlock) {
        // End of code block
        if (currentSection !== 'conclusao' && result[currentSection] && Array.isArray(result[currentSection]) && result[currentSection].length > 0) {
          const lastItem = result[currentSection][result[currentSection].length - 1];
          lastItem.content.push({
            type: 'code',
            code: codeContent
          });
        }
        codeBlock = false;
        codeContent = '';
      } else {
        // Start of code block
        codeBlock = true;
      }
    }
    // Inside code block
    else if (codeBlock) {
      codeContent += line + '\n';
    }
    // List items
    else if ((line.trim().startsWith('- ') || line.trim().startsWith('* ')) && currentSection) {
      if (!inList) {
        inList = true;
        listItems = [];
      }
      listItems.push(line.trim().substring(2));
      
      // Check if next line is not a list item
      if (i === lines.length - 1 || 
          !(lines[i+1].trim().startsWith('- ') || lines[i+1].trim().startsWith('* '))) {
        if (currentSection !== 'conclusao' && result[currentSection] && Array.isArray(result[currentSection]) && result[currentSection].length > 0) {
          const lastItem = result[currentSection][result[currentSection].length - 1];
          lastItem.content.push({
            type: 'list',
            items: listItems
          });
        }
        inList = false;
      }
    }
    // Regular paragraphs
    else if (line.trim() && currentSection) {
      if (currentSection === 'conclusao') {
        if (line.trim() && !line.startsWith('---') && !line.startsWith('*')) {
          result.conclusao.push(line.trim());
        }
      } else if (result[currentSection] && Array.isArray(result[currentSection]) && result[currentSection].length > 0) {
        const lastItem = result[currentSection][result[currentSection].length - 1];
        lastItem.content.push({
          type: 'paragraph',
          text: line.trim()
        });
      }
    }
  }

  return result;
}

export default AuditoriaReportViewer;