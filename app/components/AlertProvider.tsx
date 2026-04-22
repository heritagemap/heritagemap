'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface Alert {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AlertContextType {
  show: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const AlertContext = createContext<AlertContextType>({
  show: () => {},
  error: () => {},
  info: () => {},
});

export function useAlert() {
  return useContext(AlertContext);
}

export default function AlertProvider({ children }: { children: ReactNode }) {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const removeAlert = useCallback((id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addAlert = useCallback((message: string, type: Alert['type']) => {
    const id = Date.now() + Math.random();
    setAlerts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeAlert(id), 3000);
  }, [removeAlert]);

  const show = useCallback((message: string) => addAlert(message, 'info'), [addAlert]);
  const error = useCallback((message: string) => addAlert(message, 'error'), [addAlert]);
  const info = useCallback((message: string) => addAlert(message, 'info'), [addAlert]);

  return (
    <AlertContext.Provider value={{ show, error, info }}>
      {children}
      <div className="fixed top-4 right-4 z-[10001] space-y-2">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`px-4 py-2 rounded shadow text-white text-sm ${
              alert.type === 'error' ? 'bg-red-600' : 'bg-[#6c2c04]'
            }`}
          >
            {alert.message}
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
}
