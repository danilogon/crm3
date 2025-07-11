import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { MotivoPerda } from '../../types';

interface MotivoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (motivo: Omit<MotivoPerda, 'id'>) => void;
  motivo?: MotivoPerda;
  tipo: 'renovacao' | 'seguro_novo';
}

const MotivoModal: React.FC<MotivoModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  motivo,
  tipo
}) => {
  const [nome, setNome] = useState('');
  const [icone, setIcone] = useState('📝');
  const [ativo, setAtivo] = useState(true);
  const [ordem, setOrdem] = useState(1);

  // Efeito para carregar dados do motivo quando o modal abrir
  useEffect(() => {
    if (isOpen && motivo) {
      setNome(motivo.nome);
      setIcone(motivo.icone);
      setAtivo(motivo.ativo);
      setOrdem(motivo.ordem);
    } else if (isOpen && !motivo) {
      // Reset para novo motivo
      setNome('');
      setIcone('📝');
      setAtivo(true);
      setOrdem(1);
    }
  }, [isOpen, motivo]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (nome.trim()) {
      onSave({ 
        nome: nome.trim(), 
        icone,
        ativo,
        tipo,
        ordem
      });
      setNome('');
      setIcone('📝');
      setAtivo(true);
      setOrdem(1);
      onClose();
    }
  };

  const handleClose = () => {
    setNome('');
    setIcone('📝');
    setAtivo(true);
    setOrdem(1);
    onClose();
  };

  const iconesDisponiveis = [
    '🏢', '❌', '💰', '⚠️', '📋', '📝', '🔄', '⏰', '📞', '💼', 
    '🎯', '🚫', '✋', '💡', '🔍', '📊', '⭐', '🎪', '🎨', '🎭'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {motivo ? 'Editar Motivo' : 'Novo Motivo'} - {tipo === 'renovacao' ? 'Renovações' : 'Seguros Novos'}
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
              Nome do Motivo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome do motivo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ícone
            </label>
            <div className="grid grid-cols-10 gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-md p-2">
              {iconesDisponiveis.map((iconeOption) => (
                <button
                  key={iconeOption}
                  type="button"
                  onClick={() => setIcone(iconeOption)}
                  className={`w-8 h-8 flex items-center justify-center rounded-md text-lg hover:bg-gray-100 transition-colors ${
                    icone === iconeOption ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                  }`}
                >
                  {iconeOption}
                </button>
              ))}
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Selecionado:</span>
              <span className="text-lg">{icone}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Ordem de Exibição
            </label>
            <input
              type="number"
              value={ordem}
              onChange={(e) => setOrdem(parseInt(e.target.value) || 1)}
              min="1"
              max="999"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Ordem em que o motivo aparecerá na lista (1 = primeiro)
            </p>
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
              Motivo ativo
            </label>
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

export default MotivoModal;