import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import DatabaseStatus from './components/Database/DatabaseStatus';
import Login from './pages/Login';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import Renovacoes from './pages/Renovacoes';
import Dashboard from './pages/Dashboard';
import SeguroNovo from './pages/SeguroNovo';
import Clientes from './pages/Clientes';
import Usuarios from './pages/Usuarios';
import Configuracoes from './pages/Configuracoes';
import Auditoria from './pages/Auditoria';

function AppContent() {
  const { usuario } = useAuth();
  const [currentPage, setCurrentPage] = useState('seguros-novos');
  
  // Redirecionar para uma página que o usuário tem acesso
  React.useEffect(() => {
    if (usuario && usuario.role !== 'admin') {
      if (currentPage === 'seguros-novos' && !usuario.acessoSegurosNovos) {
        if (usuario.acessoRenovacoes) {
          setCurrentPage('renovacoes');
        }
      } else if (currentPage === 'renovacoes' && !usuario.acessoRenovacoes) {
        if (usuario.acessoSegurosNovos) {
          setCurrentPage('seguros-novos');
        }
      }
    }
  }, [usuario, currentPage]);

  // Se não há usuário logado, mostrar tela de login
  if (!usuario) {
    return <Login />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'renovacoes':
        return <Renovacoes />;
      case 'seguros-novos':
        return <SeguroNovo />;
      case 'clientes':
        return <Clientes />;
      case 'dashboard':
        return <Dashboard />;
      case 'auditoria':
        return <Auditoria />;
      case 'usuarios':
        return <Usuarios />;
      case 'configuracoes':
        return <Configuracoes />;
      default:
        return <Renovacoes />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="flex-1 flex flex-col">
        <Header />
        <div className="p-4">
          <DatabaseStatus />
        </div>
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;