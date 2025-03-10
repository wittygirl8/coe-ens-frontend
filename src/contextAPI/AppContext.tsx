import { createContext, useContext, useState, ReactNode } from 'react';

interface AppContextProps {
  sessionId: string;
  setSessionId: (id: string) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [sessionId, setSessionId] = useState<string>('');

  return (
    <AppContext.Provider value={{ sessionId, setSessionId }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextProps => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
