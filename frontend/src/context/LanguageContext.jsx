import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, supportedLanguages } from '../i18n/translations';

const LanguageContext = createContext();

const STORAGE_KEY = 'medrentia_lang';

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === 'en' || saved === 'te' || saved === 'hi')) {
        return saved;
      }
    } catch (e) {
      console.warn('Could not read language from localStorage:', e);
    }
    return 'en';
  });

  const setLanguage = (newLang) => {
    if (newLang === 'en' || newLang === 'te' || newLang === 'hi') {
      setLanguageState(newLang);
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
      } catch (e) {
        console.warn('Could not save language to localStorage:', e);
      }
    }
  };

  /**
   * Translate key with safe fallback to English, then to defaultString / key
   * e.g., t('navbar.home') or t('common.loading')
   */
  const t = (keyPath, defaultString = '') => {
    if (!keyPath || typeof keyPath !== 'string') return defaultString || '';

    const keys = keyPath.split('.');
    
    // 1. Try selected language
    let current = translations[language];
    for (const k of keys) {
      if (current && current[k] !== undefined) {
        current = current[k];
      } else {
        current = null;
        break;
      }
    }
    if (current !== null && current !== undefined && typeof current === 'string') {
      return current;
    }

    // 2. Fallback to English
    if (language !== 'en') {
      let enCurrent = translations['en'];
      for (const k of keys) {
        if (enCurrent && enCurrent[k] !== undefined) {
          enCurrent = enCurrent[k];
        } else {
          enCurrent = null;
          break;
        }
      }
      if (enCurrent !== null && enCurrent !== undefined && typeof enCurrent === 'string') {
        return enCurrent;
      }
    }

    // 3. Fallback to provided defaultString or keyPath itself
    return defaultString || keyPath;
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        supportedLanguages,
      }}
    >
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

export default LanguageContext;
