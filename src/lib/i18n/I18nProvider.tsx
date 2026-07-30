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
  setLocale: (locale:Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  translations: TranslationKeys;
  availableLocales: typeof locales;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Start with default values immediately - don't block rendering!
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasAttemptedDetection, setHasAttemptedDetection] = useState(false);

  // Detect locale on mount - non-blocking
  useEffect(() => {
    const detectAndSetLocale = async () => {
      try {
        let countryCode = '';
        
        // Use a free geolocation API with timeout
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
          const response = await fetch('https://ipapi.co/json/', { 
            signal: controller.signal 
          });
          if (response.ok) {
            const data = await response.json();
            countryCode = data.country_code;
          }
        } catch {
          // Silently continue - use browser language
          console.log('[I18n] Geolocation API failed, using browser language');
        }
        
        const acceptLanguage = navigator?.language || undefined;
        const detectedLocale = detectLocale(acceptLanguage, countryCode);
        setLocaleState(detectedLocale);
      } catch (e) {
        console.error('[I18n] Error detecting locale:', e);
      } finally {
        setIsInitialized(true);
        setHasAttemptedDetection(true);
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

  // Load saved preference immediately (synchronous for instant availability)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('facelove-locale');
      if (saved && saved in locales) {
        setLocaleState(saved as Locale);
      }
      // Mark as initialized immediately since we have a value
      setIsInitialized(true);
    }
  }, []);

  // Get translations - always provide valid defaults
  const translations = getTranslations(locale);
  
  const t = useCallback((key: string, params?: Record<string, string | number>) => {
    return translateFn(translations, key, params);
  }, [translations]);

  // Always render children - never block rendering!
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
