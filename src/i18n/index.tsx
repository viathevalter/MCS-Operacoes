
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { pt } from '../locales/pt';
import { es } from '../locales/es';

type Language = 'pt' | 'es';

// Helper to access nested keys string 'menu.dashboard'
const getNested = (obj: any, path: string): string => {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || path;
};

interface LanguageContextProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, params?: Record<string, any>) => string;
}

const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from LocalStorage or default to 'pt'
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_lang');
    return (saved === 'pt' || saved === 'es') ? saved : 'pt';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_lang', lang);
  };

  const t = (path: string, params?: Record<string, any>): string => {
    const currentDict = language === 'pt' ? pt : es;
    let text = getNested(currentDict, path);

    if (params) {
      Object.keys(params).forEach(key => {
        text = text.replace(`{{${key}}}`, String(params[key]));
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
