import React, { useState, useEffect } from 'react';
import { X, Save, Eye, EyeOff } from 'lucide-react';
import { Usuario } from '../../types';

interface UsuarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (usuario: Omit<Usuario, 'id'>) => void;
  usuario?: Usuario;
}

const UsuarioModal: React.FC<UsuarioModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  usuario 
}) => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'admin' | 'usuario' | 'gestor'>('usuario');
  const [acessoRenovacoes, setAcessoRenovacoes] = useState(true);
  const [acessoSegurosNovos, setAcessoSegurosNovos] = useState(true);
  const [acessoClientes, setAcessoClientes] = useState(true);
  const [recebeRemuneracaoRenovacoes, setRecebeRemuneracaoRenovacoes] = useState(false);
  const [recebeRemuneracaoSegurosNovos, setRecebeRemuneracaoSegurosNovos] = useState(false);
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  // Efeito para carregar dados do usuário quando o modal abrir
  useEffect(() => {
    if (isOpen && usuario) {
      setNome(usuario.nome);
      setEmail(usuario.email);
      setRole(usuario.role);
      setAcessoRenovacoes(usuario.acessoRenovacoes);
      setAcessoSegurosNovos(usuario.acessoSegurosNovos);
      setAcessoClientes(usuario.acessoClientes);
      setRecebeRemuneracaoRenovacoes(usuario.recebeRemuneracaoRenovacoes);
      setRecebeRemuneracaoSegurosNovos(usuario.recebeRemuneracaoSegurosNovos);
    } else if (isOpen && !usuario) {
      // Reset para novo usuário
      resetForm();
    }
  }, [isOpen, usuario]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (nome.trim() && email.trim()) {
      // Validar senhas apenas para novos usuários
      if (!usuario && senha !== confirmarSenha) {
        alert('As senhas não coincidem');
        return;
      }
      
      if (!usuario && senha.length < 6) {
        alert('A senha deve ter pelo menos 6 caracteres');
        return;
      }

      onSave({ 
        nome: nome.trim(), 
        email: email.trim(), 
        role,
        acessoRenovacoes,
        acessoSegurosNovos,
        acessoClientes,
        recebeRemuneracaoRenovacoes,
        recebeRemuneracaoSegurosNovos
      });
      resetForm();
      onClose();
    }
  };

  const resetForm = () => {
    setNome('');
    setEmail('');
    setRole('usuario');
    setAcessoRenovacoes(true);
    setAcessoSegurosNovos(true);
    setAcessoClientes(true);
    setRecebeRemuneracaoRenovacoes(false);
    setRecebeRemuneracaoSegurosNovos(false);
    setSenha('');
    setConfirmarSenha('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {usuario ? 'Editar Usuário' : 'Novo Usuário'}
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
              Nome Completo
            </label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite o nome completo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Digite o email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Perfil
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'usuario' | 'gestor')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="usuario">Usuário</option>
              <option value="gestor">Gestor</option>
              <option value="admin">Administrador</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Permissões de Acesso
            </label>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="acessoRenovacoes"
                checked={acessoRenovacoes}
                onChange={(e) => setAcessoRenovacoes(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="acessoRenovacoes" className="ml-2 block text-sm text-gray-700">
                Acesso à área de Renovações
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="acessoClientes"
                checked={acessoClientes}
                onChange={(e) => setAcessoClientes(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="acessoClientes" className="ml-2 block text-sm text-gray-700">
                Acesso à área de Clientes
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="acessoSegurosNovos"
                checked={acessoSegurosNovos}
                onChange={(e) => setAcessoSegurosNovos(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="acessoSegurosNovos" className="ml-2 block text-sm text-gray-700">
                Acesso à área de Seguros Novos
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Remuneração por Metas
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Defina se o usuário receberá remuneração adicional pelas metas atingidas
            </p>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="recebeRemuneracaoRenovacoes"
                checked={recebeRemuneracaoRenovacoes}
                onChange={(e) => setRecebeRemuneracaoRenovacoes(e.target.checked)}
                disabled={!acessoRenovacoes}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded disabled:opacity-50"
              />
              <label htmlFor="recebeRemuneracaoRenovacoes" className="ml-2 block text-sm text-gray-700">
                Recebe remuneração pelas metas de renovação
              </label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="recebeRemuneracaoSegurosNovos"
                checked={recebeRemuneracaoSegurosNovos}
                onChange={(e) => setRecebeRemuneracaoSegurosNovos(e.target.checked)}
                disabled={!acessoSegurosNovos}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded disabled:opacity-50"
              />
              <label htmlFor="recebeRemuneracaoSegurosNovos" className="ml-2 block text-sm text-gray-700">
                Recebe remuneração pelas metas de seguros novos
              </label>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3">
              <p className="text-xs text-yellow-700">
                <strong>Importante:</strong> Usuários que não recebem remuneração por metas ainda recebem a comissão padrão determinada pelo ramo na venda de seguros novos.
              </p>
            </div>
          </div>
          {!usuario && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <div className="relative">
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite a senha (mín. 6 caracteres)"
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {mostrarSenha ? (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    ) : (
                      <Eye className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmar Senha
                </label>
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  placeholder="Confirme a senha"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
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
            disabled={!nome.trim() || !email.trim() || (!usuario && senha.length < 6)}
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

export default UsuarioModal;