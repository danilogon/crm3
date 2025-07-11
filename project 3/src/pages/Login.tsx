import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, Shield, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usuarios } from '../data/mockData';

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCarregando(true);
    setErro('');

    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Buscar usuário por email
    const usuario = usuarios.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!usuario) {
      setErro('Email não encontrado');
      setCarregando(false);
      return;
    }

    // Simular verificação de senha (em produção seria hash)
    const senhaCorreta = '123456'; // Senha padrão para todos os usuários na demo
    
    if (senha !== senhaCorreta) {
      setErro('Senha incorreta');
      setCarregando(false);
      return;
    }

    // Login bem-sucedido
    login({
      id: usuario.id,
      nome: usuario.nome,
      email: usuario.email,
      role: usuario.role,
      acessoRenovacoes: usuario.acessoRenovacoes,
      acessoSegurosNovos: usuario.acessoSegurosNovos,
      acessoClientes: usuario.acessoClientes,
      recebeRemuneracaoRenovacoes: usuario.recebeRemuneracaoRenovacoes,
      recebeRemuneracaoSegurosNovos: usuario.recebeRemuneracaoSegurosNovos
    });

    setCarregando(false);
  };

  const loginRapido = (usuarioEmail: string) => {
    setEmail(usuarioEmail);
    setSenha('123456');
    setErro('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo e Título */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Segura Mais</h1>
          <p className="text-gray-600 mt-2">Sistema de Gestão de Produção</p>
        </div>

        {/* Formulário de Login */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Fazer Login
          </h2>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Digite seu email"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {mostrarSenha ? (
                    <EyeOff className="w-5 h-5 text-gray-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-700 text-sm">{erro}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {carregando ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <LogIn className="w-5 h-5 mr-2" />
              )}
              {carregando ? 'Entrando...' : 'Entrar'}
            </button>
          </form>

          {/* Informações de Demo */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-4 text-center">
              🚀 Contas de Demonstração
            </h3>
            <p className="text-xs text-gray-500 mb-4 text-center">
              Senha padrão para todos: <span className="font-mono bg-gray-100 px-2 py-1 rounded">123456</span>
            </p>
            
            <div className="space-y-3">
              {/* Admin */}
              <button
                onClick={() => loginRapido('ana@empresa.com')}
                className="w-full p-3 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Ana Oliveira</p>
                    <p className="text-xs text-gray-500">ana@empresa.com • Administrador</p>
                    <p className="text-xs text-red-600">Acesso completo ao sistema</p>
                  </div>
                </div>
              </button>

              {/* João Silva - Usuário com todas as permissões */}
              <button
                onClick={() => loginRapido('joao@empresa.com')}
                className="w-full p-3 border border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">João Silva</p>
                    <p className="text-xs text-gray-500">joao@empresa.com • Corretor</p>
                    <p className="text-xs text-green-600">Renovações + Seguros Novos + Clientes + Metas</p>
                  </div>
                </div>
              </button>

              {/* Maria Santos - Apenas renovações */}
              <button
                onClick={() => loginRapido('maria@empresa.com')}
                className="w-full p-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Maria Santos</p>
                    <p className="text-xs text-gray-500">maria@empresa.com • Corretor</p>
                    <p className="text-xs text-blue-600">Renovações + Clientes + Metas Renovação</p>
                  </div>
                </div>
              </button>

              {/* Pedro Costa - Apenas seguros novos */}
              <button
                onClick={() => loginRapido('pedro@empresa.com')}
                className="w-full p-3 border border-orange-200 rounded-lg hover:bg-orange-50 transition-colors text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Pedro Costa</p>
                    <p className="text-xs text-gray-500">pedro@empresa.com • Corretor</p>
                    <p className="text-xs text-orange-600">Seguros Novos + Clientes (sem metas)</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Informações adicionais */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="text-xs font-medium text-blue-800 mb-2">💡 Funcionalidades por Perfil:</h4>
              <div className="text-xs text-blue-700 space-y-1">
                <p><strong>Admin:</strong> Acesso total + configurações + usuários</p>
                <p><strong>Carlos:</strong> Gestor com dashboard de todos os usuários</p>
                <p><strong>João:</strong> Dashboard pessoal + todas as áreas + metas ativas</p>
                <p><strong>Maria:</strong> Renovações + clientes + metas de renovação</p>
                <p><strong>Pedro:</strong> Seguros novos + clientes + comissão padrão</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Sistema de Gestão de Produção • Versão Demo
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;