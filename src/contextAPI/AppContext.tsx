import { createContext, useContext, useState, ReactNode, useMemo } from 'react';

interface AppContextProps {
  sessionId: string;
  setSessionId: (id: string) => void;
  activeStep: number;
  setActiveStep: (step: number) => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [sessionId, setSessionId] = useState<string>('');
  const [activeStep, setActiveStep] = useState<number>(0);

  const contextValue = useMemo(
    () => ({
      sessionId,
      setSessionId,
      activeStep,
      setActiveStep,
    }),
    [sessionId, setSessionId, activeStep, setActiveStep]
  );

  return (
    <AppContext.Provider value={contextValue}>
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
