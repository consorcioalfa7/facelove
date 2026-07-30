// FaceLove i18n System
// Internationalization with country detection

import { ptBR } from './locales/pt-BR';
import { enUS } from './locales/en-US';
import { es } from './locales/es';
import { Locale, locales, defaultLocale, countryToLocale } from './locales';

export type TranslationKeys = typeof ptBR;

// All translations
const translations: Record<Locale, TranslationKeys> = {
  'pt-BR': ptBR,
  'pt-PT': ptBR,
  'en-US': enUS,
  'en-GB': enUS,
  es,
  fr: enUS, // Fallback to English
  de: enUS,
  it: enUS,
  'zh-CN': enUS,
  ja: enUS,
  ko: enUS,
  ar: enUS,
  ru: enUS,
  hi: enUS,
};

export function getTranslations(locale: Locale): TranslationKeys {
  return translations[locale] || translations[defaultLocale];
}

export function getLocaleFromCountry(countryCode: string): Locale {
  const upperCountry = countryCode.toUpperCase();
  return countryToLocale[upperCountry] || defaultLocale;
}

// Detect user's locale from browser/headers
export function detectLocale(acceptLanguage?: string, countryCode?: string): Locale {
  // First check if we have a country code
  if (countryCode) {
    const localeFromCountry = getLocaleFromCountry(countryCode);
    if (localeFromCountry) return localeFromCountry;
  }
  
  // Then try to parse Accept-Language header
  if (acceptLanguage) {
    const languages = acceptLanguage.split(',').map(lang => {
      const [code] = lang.trim().split(';');
      return code.trim().toLowerCase();
    });
    
    for (const lang of languages) {
      // Direct match
      if (lang in translations) return lang as Locale;
      
      // Partial match (e.g., "en" -> "en-US")
      for (const locale of Object.keys(translations)) {
        if (locale.startsWith(lang)) return locale as Locale;
      }
    }
  }
  
  return defaultLocale;
}

// Simple interpolation for translation strings
export function t(
  translations: TranslationKeys, 
  key: string, 
  params?: Record<string, string | number>
): string {
  const keys = key.split('.');
  let value: unknown = translations;
  
  for (const k of keys) {
    value = (value as Record<string, unknown>)?.[k];
    if (value === undefined) return key;
  }
  
  let result = String(value);
  
  // Replace parameters like {count}, {name}, etc.
  if (params) {
    for (const [paramKey, paramValue] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramValue));
    }
  }
  
  return result;
}

export type { Locale };
export { defaultLocale, locales, countryToLocale };
