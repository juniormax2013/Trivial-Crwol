'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Language, Translations } from './types';
import { ht } from './translations/ht';
import { es } from './translations/es';
import { fr } from './translations/fr';

const TRANSLATIONS: Record<Language, Translations> = { ht, es, fr };

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  isLoaded: boolean;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: 'ht',
  setLanguage: () => {},
  t: ht,
  isLoaded: false,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('ht');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('app-language') as Language;
    if (saved && TRANSLATIONS[saved]) {
      setLanguageState(saved);
    } else {
      // Fallback to Spanish or HT
      setLanguageState('ht');
    }
    setIsLoaded(true);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app-language', lang);
  };

  const value: LanguageContextValue = {
    language,
    setLanguage,
    t: TRANSLATIONS[language],
    isLoaded,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useT(): Translations {
  const context = useContext(LanguageContext);
  return context.t;
}

export function useLanguage() {
  const { language, setLanguage, isLoaded } = useContext(LanguageContext);
  return { language, setLanguage, isLoaded };
}

export function useSyncUserLanguage(userLanguage?: string) {
  const { setLanguage, isLoaded } = useLanguage();
  const hasSynced = useRef(false);
  
  useEffect(() => {
    if (isLoaded && userLanguage && !hasSynced.current && !localStorage.getItem('app-language')) {
       if (userLanguage === 'es' || userLanguage === 'ht' || userLanguage === 'fr') {
         setLanguage(userLanguage as Language);
         hasSynced.current = true;
       }
    }
  }, [userLanguage, isLoaded, setLanguage]);
}
