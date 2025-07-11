import { useState, useEffect } from 'react';
import { initializeDatabase } from '../database/sqlite';

// Hook personalizado para gerenciar dados com SQLite
export function useSQLiteStorage<T>(key: string, initialValue: T, repository?: any) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        
        // Inicializar banco de dados
        const dbInitialized = await initializeDatabase();
        if (!dbInitialized) {
          throw new Error('Falha ao inicializar banco de dados');
        }
        
        // Se há um repository, carregar dados do SQLite
        if (repository && repository.findAll) {
          const dbData = await repository.findAll();
          setData(dbData);
        } else {
          // Fallback para localStorage
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored, (key, value) => {
              if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                return new Date(value);
              }
              return value;
            });
            setData(parsed);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error(`Erro ao carregar dados do SQLite para ${key}:`, err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
        
        // Fallback para localStorage em caso de erro
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored, (key, value) => {
              if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
                return new Date(value);
              }
              return value;
            });
            setData(parsed);
          }
        } catch (fallbackError) {
          console.error('Erro no fallback para localStorage:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [key, repository]);

  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(data) : value;
      setData(valueToStore);
      
      // Salvar no localStorage como backup
      localStorage.setItem(key, JSON.stringify(valueToStore));
      
      setError(null);
    } catch (err) {
      console.error(`Erro ao salvar dados para ${key}:`, err);
      setError(err instanceof Error ? err.message : 'Erro ao salvar');
    }
  };

  return [data, setValue, { loading, error }] as const;
}