import React, { useState } from 'react';
import { Users, Plus, Edit, Trash2, Shield } from 'lucide-react';
import { usuarios as mockUsuarios } from '../data/mockData';
import { Usuario } from '../types';
import { useLocalStorage } from '../hooks/useLocalStorage';
import UsuarioModal from '../components/Modals/UsuarioModal';

const Usuarios: React.FC = () => {
  const [usuarios, setUsuarios] = useLocalStorage<Usuario[]>('usuarios', mockUsuarios);
  const [showUsuarioModal, setShowUsuarioModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | undefined>();

  const handleAddUsuario = () => {
    setEditingUsuario(undefined);
    setShowUsuarioModal(true);
  };

  const handleEditUsuario = (usuario: Usuario) => {
    setEditingUsuario(usuario);
    setShowUsuarioModal(true);
  };

  const handleSaveUsuario = (usuarioData: Omit<Usuario, 'id'>) => {
    if (editingUsuario) {
      // Editar
      setUsuarios(prev => prev.map(u => 
        u.id === editingUsuario.id 
          ? { ...editingUsuario, ...usuarioData }
          : u
      ));
    } else {
      // Adicionar
      const newUsuario: Usuario = {
        id: Date.now().toString(),
        ...usuarioData
      };
      setUsuarios(prev => [...prev, newUsuario]);
    }
  };

  const handleDeleteUsuario = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      setUsuarios(prev => prev.filter(u => u.id !== id));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Usuários</h1>
        <button 
          onClick={handleAddUsuario}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Usuário
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nome
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Perfil
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuarios.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      usuario.role === 'admin' ? 'bg-red-600' : 'bg-blue-600'
                    }`}>
                      {usuario.role === 'admin' ? (
                        <Shield className="w-5 h-5 text-white" />
                      ) : (
                        <Users className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{usuario.nome}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {usuario.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    usuario.role === 'admin' 
                      ? 'bg-red-100 text-red-800' 
                      : usuario.role === 'gestor'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {usuario.role === 'admin' ? 'Administrador' : usuario.role === 'gestor' ? 'Gestor' : 'Usuário'}
                  </span>
                  <div className="mt-1 flex space-x-1">
                    {usuario.acessoRenovacoes && (
                      <span className="inline-flex px-1 py-0.5 text-xs font-medium rounded bg-green-100 text-green-800">
                        Renovações
                      </span>
                    )}
                    {usuario.acessoSegurosNovos && (
                      <span className="inline-flex px-1 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                        Seguros Novos
                      </span>
                    )}
                    {usuario.recebeRemuneracaoRenovacoes && (
                      <span className="inline-flex px-1 py-0.5 text-xs font-medium rounded bg-yellow-100 text-yellow-800">
                        💰 Metas Renov.
                      </span>
                    )}
                    {usuario.recebeRemuneracaoSegurosNovos && (
                      <span className="inline-flex px-1 py-0.5 text-xs font-medium rounded bg-purple-100 text-purple-800">
                        💰 Metas Seg. Novos
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleEditUsuario(usuario)}
                      className="text-blue-600 hover:text-blue-900 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteUsuario(usuario.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <UsuarioModal
        isOpen={showUsuarioModal}
        onClose={() => setShowUsuarioModal(false)}
        onSave={handleSaveUsuario}
        usuario={editingUsuario}
      />
    </div>
  );
};

export default Usuarios;