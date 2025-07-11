import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UsuarioLogado } from '../types';

interface AuthContextType {
  usuario: UsuarioLogado | null;
  login: (usuario: UsuarioLogado) => void;
  logout: () => void;
  isAdmin: boolean;
  isGestor: boolean;
  isAdminOrGestor: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Iniciar sem usuário logado para mostrar a tela de login
  const [usuario, setUsuario] = useState<UsuarioLogado | null>(null);

  const login = (novoUsuario: UsuarioLogado) => {
    setUsuario(novoUsuario);
  };

  const logout = () => {
    setUsuario(null);
    // Limpar localStorage se necessário
    localStorage.removeItem('usuario_logado');
  };

  const isAdmin = usuario?.role === 'admin';
  const isGestor = usuario?.role === 'gestor';
  const isAdminOrGestor = isAdmin || isGestor;
  
  // Persistir usuário no localStorage
  React.useEffect(() => {
    if (usuario) {
      localStorage.setItem('usuario_logado', JSON.stringify(usuario));
    }
  }, [usuario]);
  
  // Recuperar usuário do localStorage na inicialização
  React.useEffect(() => {
    const usuarioSalvo = localStorage.getItem('usuario_logado');
    if (usuarioSalvo) {
      try {
        const usuarioData = JSON.parse(usuarioSalvo);
        setUsuario(usuarioData);
      } catch (error) {
        console.error('Erro ao recuperar usuário do localStorage:', error);
        localStorage.removeItem('usuario_logado');
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, login, logout, isAdmin, isGestor, isAdminOrGestor }}>
      {children}
    </AuthContext.Provider>
  );
};