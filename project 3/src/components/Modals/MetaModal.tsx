import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { MetaTaxaConversao, MetaAumentoComissao, MetaSeguroNovo } from '../../types';

interface MetaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (meta: Omit<MetaTaxaConversao | MetaAumentoComissao | MetaSeguroNovo, 'id'>) => void;
  meta?: MetaTaxaConversao | MetaAumentoComissao | MetaSeguroNovo;
  tipo: 'taxa_conversao' | 'aumento_comissao' | 'seguros_novos';
  tipoSeguroNovo?: 'comissao_gerada' | 'taxa_conversao';
}

const MetaModal: React.FC<MetaModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  meta,
  tipo,
  tipoSeguroNovo
}) => {
  const [faixaMinima, setFaixaMinima] = useState(0);
  const [faixaMaxima, setFaixaMaxima] = useState<number | null>(null);
  const [tipoRemuneracao, setTipoRemuneracao] = useState<'percentual' | 'valor_fixo'>('percentual');
  const [percentualComissao, setPercentualComissao] = useState(0);
  const [valorFixo, setValorFixo] = useState(0);
  const [descricao, setDescricao] = useState('');
  const [semLimiteMaximo, setSemLimiteMaximo] = useState(false);

  // Efeito para carregar dados da meta quando o modal abrir
  useEffect(() => {
    if (isOpen && meta) {
      setFaixaMinima(meta.faixaMinima);
      setFaixaMaxima(meta.faixaMaxima);
      setTipoRemuneracao(meta.tipoRemuneracao);
      setPercentualComissao(meta.percentualComissao || 0);
      setValorFixo(meta.valorFixo || 0);
      setDescricao(meta.descricao);
      setSemLimiteMaximo(meta.faixaMaxima === null);
    } else if (isOpen && !meta) {
      // Reset para nova meta
      resetForm();
    }
  }, [isOpen, meta]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (faixaMinima >= 0 && descricao.trim() && 
        ((tipoRemuneracao === 'percentual' && percentualComissao > 0) || 
         (tipoRemuneracao === 'valor_fixo' && valorFixo > 0))) {
      
      const metaData: any = { 
        faixaMinima,
        faixaMaxima: semLimiteMaximo ? null : faixaMaxima,
        tipoRemuneracao,
        descricao: descricao.trim()
      };
      
      if (tipoRemuneracao === 'percentual') {
        metaData.percentualComissao = percentualComissao;
      } else {
        metaData.valorFixo = valorFixo;
      }
      
      if (tipo === 'seguros_novos' && tipoSeguroNovo) {
        metaData.tipo = tipoSeguroNovo;
      }
      
      onSave(metaData);
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setFaixaMinima(0);
    setFaixaMaxima(null);
    setTipoRemuneracao('percentual');
    setPercentualComissao(0);
    setValorFixo(0);
    setDescricao('');
    setSemLimiteMaximo(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getTituloModal = () => {
    if (tipo === 'taxa_conversao') return 'Meta de Taxa de Conversão';
    if (tipo === 'aumento_comissao') return 'Meta de Aumento de Comissão';
    if (tipo === 'seguros_novos') {
      return tipoSeguroNovo === 'comissao_gerada' 
        ? 'Meta de Comissão Gerada - Seguros Novos'
        : 'Meta de Taxa de Conversão - Seguros Novos';
    }
    return 'Meta';
  };
  
  const getUnidadeMedida = () => {
    if (tipo === 'seguros_novos' && tipoSeguroNovo === 'comissao_gerada') return 'R$';
    return '%';
  };
  
  const tituloModal = getTituloModal();
  const unidadeMedida = getUnidadeMedida();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {meta ? `Editar ${tituloModal}` : `Nova ${tituloModal}`}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição da Meta
            </label>
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Ex: Até 90%, 90,01% - 95%, Acima de 95%"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Faixa Mínima ({unidadeMedida})
            </label>
            <input
              type="number"
              value={faixaMinima}
              onChange={(e) => setFaixaMinima(parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                id="semLimiteMaximo"
                checked={semLimiteMaximo}
                onChange={(e) => setSemLimiteMaximo(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="semLimiteMaximo" className="ml-2 block text-sm text-gray-700">
                Sem limite máximo (acima de X{unidadeMedida})
              </label>
            </div>
            
            {!semLimiteMaximo && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Faixa Máxima ({unidadeMedida})
                </label>
                <input
                  type="number"
                  value={faixaMaxima || ''}
                  onChange={(e) => setFaixaMaxima(parseFloat(e.target.value) || null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={faixaMinima}
                  step="0.01"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Remuneração
            </label>
            <select
              value={tipoRemuneracao}
              onChange={(e) => setTipoRemuneracao(e.target.value as 'percentual' | 'valor_fixo')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="percentual">Percentual da Comissão</option>
              <option value="valor_fixo">Valor Fixo</option>
            </select>
          </div>

          {tipoRemuneracao === 'percentual' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                % de Comissão sobre Comissão {tipo === 'seguros_novos' ? 'Gerada' : 'Nova'}
              </label>
              <input
                type="number"
                value={percentualComissao}
                onChange={(e) => setPercentualComissao(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
                step="0.1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Percentual da comissão {tipo === 'seguros_novos' ? 'gerada' : 'nova'} que será pago como bônus
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Fixo da Remuneração (R$)
              </label>
              <input
                type="number"
                value={valorFixo}
                onChange={(e) => setValorFixo(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">
                Valor fixo em reais que será pago ao atingir esta meta
              </p>
            </div>
          )}
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
            disabled={!descricao.trim() || 
              (tipoRemuneracao === 'percentual' && percentualComissao <= 0) ||
              (tipoRemuneracao === 'valor_fixo' && valorFixo <= 0)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MetaModal;