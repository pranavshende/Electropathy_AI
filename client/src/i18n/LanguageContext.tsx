import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TranslationSchema, translations } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationSchema;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: translations.en,
});

export const LanguageProvider: React.FC<{ 
  children: React.ReactNode;
  initialLang?: Language;
  onLanguageChanged?: (lang: Language) => void;
}> = ({ children, initialLang, onLanguageChanged }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (initialLang && (initialLang === 'en' || initialLang === 'hi' || initialLang === 'mr')) {
      return initialLang;
    }
    const saved = localStorage.getItem('electropathy_lang') as Language;
    if (saved && (saved === 'en' || saved === 'hi' || saved === 'mr')) {
      return saved;
    }
    return 'en';
  });

  useEffect(() => {
    if (initialLang && initialLang !== language && (initialLang === 'en' || initialLang === 'hi' || initialLang === 'mr')) {
      setLanguageState(initialLang);
    }
  }, [initialLang]);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem('electropathy_lang', language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('electropathy_lang', lang);
    if (onLanguageChanged) {
      onLanguageChanged(lang);
    }
  };

  const t = translations[language] || translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => useContext(LanguageContext);
