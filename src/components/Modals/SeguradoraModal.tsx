import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Seguradora } from '../../types';

interface SeguradoraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (seguradora: Omit<Seguradora, 'id'>) => void;
  seguradora?: Seguradora;
}

const SeguradoraModal: React.FC<SeguradoraModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  seguradora 
}) => {
  const [nome, setNome] = useState('');
  const [ativa, setAtiva] = useState(true);

  // Efeito para carregar dados da seguradora quando o modal abrir
  useEffect(() => {
    if (isOpen && seguradora) {
      setNome(seguradora.nome);
      setAtiva(seguradora.ativa);
    } else if (isOpen && !seguradora) {
      // Reset para nova seguradora
      setNome('');
      setAtiva(true);
    }
  }, [isOpen, seguradora]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (nome.trim()) {
      onSave({ nome: nome.trim(), ativa });
      setNome('');
      setAtiva(true);
      onClose();
    }
  };

  const handleClose = () => {
    setNome('');
    setAtiva(true);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {seguradora ? 'Editar Seguradora' : 'Nova Seguradora'}
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
              Nome da Seguradora
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome da seguradora"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="ativa"
              checked={ativa}
              onChange={(e) => setAtiva(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="ativa" className="ml-2 block text-sm text-gray-700">
              Seguradora ativa
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

export default SeguradoraModal;