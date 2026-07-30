"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  Locale, 
  defaultLocale, 
  locales,
  getTranslations, 
  detectLocale,
  t as translateFn,
  TranslationKeys,
} from './index';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translations: TranslationKeys;
  availableLocales: typeof locales;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isInitialized, setIsInitialized] = useState(false);

  // Detect locale on mount
  useEffect(() => {
    const detectAndSetLocale = async () => {
      try {
        // Try to get country from geolocation API
        let countryCode = '';
        
        // Use a free geolocation API
        try {
          const response = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(2000) });
          if (response.ok) {
            const data = await response.json();
            countryCode = data.country_code;
          }
        } catch {
          // Fallback to browser language
        }
        
        // Get browser language
        const acceptLanguage = navigator?.language || undefined;
        
        const detectedLocale = detectLocale(acceptLanguage, countryCode);
        setLocaleState(detectedLocale);
      } catch {
        // Keep default locale on error
      } finally {
        setIsInitialized(true);
      }
    };
    
    detectAndSetLocale();
  }, []);

  // Persist locale preference
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof window !== 'undefined') {
      localStorage.setItem('facelove-locale', newLocale);
    }
  }, []);

  // Load saved preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('facelove-locale');
      if (saved && saved in locales) {
        setLocaleState(saved as Locale);
        setIsInitialized(true);
      }
    }
  }, [setLocale]);

  const translations = getTranslations(locale);
  
  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    return translateFn(translations, key, params);
  }, [translations]);

  // Prevent flash of wrong content
  if (!isInitialized) {
    return null;
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, translations, availableLocales: locales }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

export default I18nContext;
