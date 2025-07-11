import React, { useState, useEffect } from 'react';
import { Database, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { initializeDatabase } from '../../database/sqlite';
import { ClienteRepository } from '../../database/repositories/ClienteRepository';
import { RenovacaoRepository } from '../../database/repositories/RenovacaoRepository';
import { SeguroNovoRepository } from '../../database/repositories/SeguroNovoRepository';

const DatabaseStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error' | 'seeding'>('checking');
  const [message, setMessage] = useState('Verificando conexão...');
  const [stats, setStats] = useState<Record<string, number>>({
    usuarios: 5,
    clientes: 0,
    seguradoras: 6,
    ramos: 6,
    renovacoes: 0,
    segurosNovos: 0
  });

  const checkDatabaseStatus = async () => {
    try {
      setStatus('checking');
      setMessage('Inicializando banco de dados SQLite...');
      
      // Inicializar banco de dados
      const initialized = await initializeDatabase();
      
      if (!initialized) {
        throw new Error('Falha ao inicializar banco de dados SQLite');
      }
      
      setMessage('Carregando estatísticas...');
      
      // Carregar estatísticas
      try {
        const clientes = await ClienteRepository.findAll();
        const renovacoes = await RenovacaoRepository.findAll();
        const segurosNovos = await SeguroNovoRepository.findAll();
        
        setStats(prev => ({
          ...prev,
          clientes: clientes.length,
          renovacoes: renovacoes.length,
          segurosNovos: segurosNovos.length
        }));
      } catch (error) {
        console.warn('Erro ao carregar estatísticas:', error);
        // Continuar mesmo com erro nas estatísticas
      }
      
      setStatus('connected');
      setMessage('Conectado ao banco SQLite com sucesso!');
      
    } catch (error) {
      console.error('Erro na conexão com SQLite:', error);
      setStatus('error');
      setMessage(`Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  useEffect(() => {
    checkDatabaseStatus();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      case 'checking':
      case 'seeding':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      default:
        return <Database className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'checking':
      case 'seeding':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor()}`}>
      <div className="flex items-center space-x-3">
        {getStatusIcon()}
        <div className="flex-1">
          <h3 className="font-medium">Status do Banco SQLite</h3>
          <p className="text-sm mt-1">{message}</p>
          
          {status === 'connected' && Object.keys(stats).length > 0 && (
            <div className="mt-3 grid grid-cols-2 md:grid-cols-6 gap-3 text-xs">
              <div className="bg-white bg-opacity-50 rounded px-2 py-1">
                <div className="font-medium">Usuários</div>
                <div className="text-lg font-bold">{stats.usuarios || 0}</div>
              </div>
              <div className="bg-white bg-opacity-50 rounded px-2 py-1">
                <div className="font-medium">Clientes</div>
                <div className="text-lg font-bold">{stats.clientes || 0}</div>
              </div>
              <div className="bg-white bg-opacity-50 rounded px-2 py-1">
                <div className="font-medium">Seguradoras</div>
                <div className="text-lg font-bold">{stats.seguradoras || 0}</div>
              </div>
              <div className="bg-white bg-opacity-50 rounded px-2 py-1">
                <div className="font-medium">Ramos</div>
                <div className="text-lg font-bold">{stats.ramos || 0}</div>
              </div>
              <div className="bg-white bg-opacity-50 rounded px-2 py-1">
                <div className="font-medium">Renovações</div>
                <div className="text-lg font-bold">{stats.renovacoes || 0}</div>
              </div>
              <div className="bg-white bg-opacity-50 rounded px-2 py-1">
                <div className="font-medium">Seg. Novos</div>
                <div className="text-lg font-bold">{stats.segurosNovos || 0}</div>
              </div>
            </div>
          )}
        </div>
        
        {status === 'error' && (
          <button
            onClick={checkDatabaseStatus}
            className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
          >
            Tentar Novamente
          </button>
        )}
      </div>
    </div>
  );
};

export default DatabaseStatus;