import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Ramo } from '../../types';

interface RamoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ramo: Omit<Ramo, 'id'>) => void;
  ramo?: Ramo;
}

const RamoModal: React.FC<RamoModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  ramo 
}) => {
  const [nome, setNome] = useState('');
  const [ativo, setAtivo] = useState(true);
  const [percentualComissaoSeguroNovo, setPercentualComissaoSeguroNovo] = useState(10);
  const [valorFixoSeguroNovo, setValorFixoSeguroNovo] = useState(100);
  const [tipoComissaoSeguroNovo, setTipoComissaoSeguroNovo] = useState<'percentual' | 'valor_fixo'>('percentual');

  // Efeito para carregar dados do ramo quando o modal abrir
  useEffect(() => {
    if (isOpen && ramo) {
      setNome(ramo.nome);
      setAtivo(ramo.ativo);
      setPercentualComissaoSeguroNovo(ramo.percentualComissaoSeguroNovo);
      setValorFixoSeguroNovo(ramo.valorFixoSeguroNovo);
      setTipoComissaoSeguroNovo(ramo.tipoComissaoSeguroNovo);
    } else if (isOpen && !ramo) {
      // Reset para novo ramo
      setNome('');
      setAtivo(true);
      setPercentualComissaoSeguroNovo(10);
      setValorFixoSeguroNovo(100);
      setTipoComissaoSeguroNovo('percentual');
    }
  }, [isOpen, ramo]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (nome.trim()) {
      onSave({ 
        nome: nome.trim(), 
        ativo,
        percentualComissaoSeguroNovo,
        valorFixoSeguroNovo,
        tipoComissaoSeguroNovo
      });
      setNome('');
      setAtivo(true);
      setPercentualComissaoSeguroNovo(10);
      setValorFixoSeguroNovo(100);
      setTipoComissaoSeguroNovo('percentual');
      onClose();
    }
  };

  const handleClose = () => {
    setNome('');
    setAtivo(true);
    setPercentualComissaoSeguroNovo(10);
    setValorFixoSeguroNovo(100);
    setTipoComissaoSeguroNovo('percentual');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {ramo ? 'Editar Ramo' : 'Novo Ramo'}
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
              Nome do Ramo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome do ramo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="ativo"
              checked={ativo}
              onChange={(e) => setAtivo(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="ativo" className="ml-2 block text-sm text-gray-700">
              Ramo ativo
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de Bônus para Seguros Novos
            </label>
            <select
              value={tipoComissaoSeguroNovo}
              onChange={(e) => setTipoComissaoSeguroNovo(e.target.value as 'percentual' | 'valor_fixo')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="percentual">Percentual da Comissão</option>
              <option value="valor_fixo">Valor Fixo por Seguro</option>
            </select>
          </div>

          {tipoComissaoSeguroNovo === 'percentual' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                % Bônus sobre a Comissão
              </label>
              <input
                type="number"
                value={percentualComissaoSeguroNovo}
                onChange={(e) => setPercentualComissaoSeguroNovo(parseFloat(e.target.value) || 0)}
                placeholder="Percentual da comissão gerada para o vendedor"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
                step="0.1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Percentual da comissão gerada que será repassado como bônus ao vendedor
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Valor Fixo por Seguro Fechado
              </label>
              <input
                type="number"
                value={valorFixoSeguroNovo}
                onChange={(e) => setValorFixoSeguroNovo(parseFloat(e.target.value) || 0)}
                placeholder="Valor fixo em reais"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
              />
              <p className="text-xs text-gray-500 mt-1">
                Valor fixo em reais que será pago por cada seguro novo fechado neste ramo
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
            disabled={!nome.trim()}
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

export default RamoModal;