// FaceLove Internationalization (i18n) System
// Multi-language support with country detection

export const locales = {
  'pt-BR': { name: 'Português (BR)', flag: '🇧🇷', default: true },
  'pt-PT': { name: 'Português (PT)', flag: '🇵🇹' },
  'en-US': { name: 'English (US)', flag: '🇺🇸' },
  'en-GB': { name: 'English (UK)', flag: '🇬🇧' },
  'es': { name: 'Español', flag: '🇪🇸' },
  'fr': { name: 'Français', flag: '🇫🇷' },
  'de': { name: 'Deutsch', flag: '🇩🇪' },
  'it': { name: 'Italiano', flag: '🇮🇹' },
  'zh-CN': { name: '中文 (简体)', flag: '🇨🇳' },
  'ja': { name: '日本語', flag: '🇯🇵' },
  'ko': { name: '한국어', flag: '🇰🇷' },
  'ar': { name: 'العربية', flag: '🸸' },
  'ru': { name: 'Русский', flag: '🇷🇺' },
  'hi': { name: 'हिन्दी', flag: '🇮🇳' },
} as const;

export type Locale = keyof typeof locales;

// Country to locale mapping for auto-detection
export const countryToLocale: Record<string, Locale> = {
  // Portuguese
  BR: 'pt-BR',
  PT: 'pt-PT',
  AO: 'pt-BR',
  MZ: 'pt-BR',
  
  // English
  US: 'en-US',
  GB: 'en-GB',
  AU: 'en-US',
  CA: 'en-US',
  IE: 'en-GB',
  NZ: 'en-US',
  ZA: 'en-US',
  
  // Spanish
  ES: 'es',
  MX: 'es',
  AR: 'es',
  CO: 'es',
  PE: 'es',
  VE: 'es',
  CL: 'es',
  
  // French
  FR: 'fr',
  BE: 'fr',
  CH: 'fr',
  CA: 'fr',
  
  // German
  DE: 'de',
  AT: 'de',
  
  // Italian
  IT: 'it',
  
  // Chinese
  CN: 'zh-CN',
  TW: 'zh-CN',
  HK: 'zh-CN',
  SG: 'zh-CN',
  
  // Japanese
  JP: 'ja',
  
  // Korean
  KR: 'ko',
  
  // Arabic
  SA: 'ar',
  AE: 'ar',
  EG: 'ar',
  
  // Russian
  RU: 'ru',
  
  // Hindi (India)
  IN: 'hi',
};

export const defaultLocale: Locale = 'pt-BR';
export const supportedLocales = Object.keys(locales) as Locale[];
