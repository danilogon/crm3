import React from 'react';
import { Bell, Search, User, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
  const { usuario, isAdmin, isGestor, logout } = useAuth();
  
  const handleLogout = () => {
    if (confirm('Tem certeza que deseja sair?')) {
      logout();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar renovações..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          
          <button 
            onClick={handleLogout}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Sair do sistema"
          >
            <LogOut className="w-5 h-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isAdmin ? 'bg-red-600' : isGestor ? 'bg-purple-600' : 'bg-blue-600'
            }`}>
              {isAdmin ? (
                <Shield className="w-4 h-4 text-white" />
              ) : isGestor ? (
                <Shield className="w-4 h-4 text-white" />
              ) : (
                <User className="w-4 h-4 text-white" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800">{usuario?.nome}</p>
              <p className="text-xs text-gray-600">
                {isAdmin ? 'Administrador' : isGestor ? 'Gestor' : 'Corretor'} • 
                <button 
                  onClick={handleLogout}
                  className="text-red-600 hover:text-red-800 ml-1"
                >
                  Sair
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;