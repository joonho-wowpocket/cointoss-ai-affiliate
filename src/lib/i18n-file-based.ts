// File-based i18n system for CoinToss
import { SUPPORTED_LOCALES, Locale } from './i18n';

interface Messages {
  [key: string]: string | Messages;
}

interface TranslationCache {
  [locale: string]: {
    [namespace: string]: Messages;
  };
}

const translationCache: TranslationCache = {};

export async function loadMessages(locale: Locale, namespace: string): Promise<Messages> {
  // Check cache first
  if (translationCache[locale]?.[namespace]) {
    return translationCache[locale][namespace];
  }

  try {
    // Dynamically import the JSON file
    const messages = await import(`../../messages/${locale}/${namespace}.json`);
    
    // Initialize cache structure if needed
    if (!translationCache[locale]) {
      translationCache[locale] = {};
    }
    
    // Cache the loaded messages
    translationCache[locale][namespace] = messages.default || messages;
    
    return translationCache[locale][namespace];
  } catch (error) {
    console.warn(`Failed to load ${locale}/${namespace}.json:`, error);
    
    // Fallback to English if available
    if (locale !== 'en') {
      try {
        const fallback = await import(`../../messages/en/${namespace}.json`);
        return fallback.default || fallback;
      } catch (fallbackError) {
        console.warn(`Failed to load fallback en/${namespace}.json:`, fallbackError);
      }
    }
    
    // Return empty object as last resort
    return {};
  }
}

export function getNestedValue(obj: Messages, path: string): string {
  return path.split('.').reduce((current, key) => {
    return typeof current === 'object' && current !== null ? current[key] : current;
  }, obj) as string || path; // Return the key itself if translation not found
}

export async function getTranslationAsync(locale: Locale, namespace: string, key: string): Promise<string> {
  const messages = await loadMessages(locale, namespace);
  return getNestedValue(messages, key) || key;
}

export function getCurrentLocale(): Locale {
  const stored = localStorage.getItem('app-locale');
  if (stored && SUPPORTED_LOCALES.some(l => l.code === stored)) {
    return stored as Locale;
  }
  return 'ko'; // Default locale
}

export function setCurrentLocale(locale: Locale): void {
  localStorage.setItem('app-locale', locale);
}