import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getDatabase, initDatabase } from '@/lib/database';
import type { DatabaseAdapter } from '@/lib/database/types';

interface DatabaseContextType {
  db: DatabaseAdapter;
  isConnected: boolean;
  isLoading: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initDatabase();
        setIsConnected(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to connect to database'));
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const db = getDatabase();

  return (
    <DatabaseContext.Provider value={{ db, isConnected, isLoading, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
