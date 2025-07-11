import React from 'react';
import { BarChart3, Kanban, Settings, Users, FileText, UserCheck, FileSearch } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const { isAdmin, isAdminOrGestor, usuario } = useAuth();

  const menuItems = [
    { id: 'renovacoes', label: 'Renovações', icon: Kanban, adminOnly: false, requiresAccess: 'renovacoes' },
    { id: 'seguros-novos', label: 'Seguros Novos', icon: FileText, adminOnly: false, requiresAccess: 'segurosNovos' },
    { id: 'clientes', label: 'Clientes', icon: UserCheck, adminOnly: false },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, adminOnly: false },
    { id: 'auditoria', label: 'Auditoria', icon: FileSearch, adminOnly: true },
    { id: 'usuarios', label: 'Usuários', icon: Users, adminOnly: true },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, adminOnly: true }
  ];

  const filteredMenuItems = menuItems.filter(item => {
    // Verificar se é admin only
    if (item.adminOnly && !isAdmin) return false;
    
    // Para o dashboard, verificar se o usuário tem pelo menos um acesso
    if (item.id === 'dashboard' && !isAdminOrGestor) {
      return usuario?.acessoRenovacoes || usuario?.acessoSegurosNovos;
    }
    
    // Verificar acesso específico para usuários não admin
    if (!isAdminOrGestor && item.requiresAccess) {
      if (item.requiresAccess === 'renovacoes' && !usuario?.acessoRenovacoes) return false;
      if (item.requiresAccess === 'segurosNovos' && !usuario?.acessoSegurosNovos) return false;
    }
    
    return true;
  });

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-gray-800">Segura Mais</h1>
        <p className="text-sm text-gray-600">Gestão de Produção</p>
      </div>
      
      <nav className="mt-6">
        {filteredMenuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center px-6 py-3 text-left hover:bg-blue-50 transition-colors ${
                currentPage === item.id
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-700 hover:text-blue-700'
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.label}
              {item.adminOnly && (
                <span className="ml-auto text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                  Admin
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;