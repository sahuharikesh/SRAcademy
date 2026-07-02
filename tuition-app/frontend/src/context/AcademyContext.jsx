import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getMe } from '../api';

const AcademyContext = createContext(null);

export function AcademyProvider({ children }) {
  const [academy, setAcademy] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await getMe();
      setAcademy(data);
    } catch {
      setAcademy(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    document.documentElement.style.setProperty('--brand-gold', academy?.themeColor || '#C9A84C');
    document.documentElement.style.setProperty('--brand-dark', academy?.primaryColor || '#1a1a1a');
  }, [academy?.themeColor, academy?.primaryColor]);

  return (
    <AcademyContext.Provider value={{ academy, loading, refresh, setAcademy }}>
      {children}
    </AcademyContext.Provider>
  );
}

export function useAcademy() {
  return useContext(AcademyContext);
}
