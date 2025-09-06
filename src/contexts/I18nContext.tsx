import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { Locale, getCurrentLocale, setCurrentLocale } from '@/lib/i18n';
import { loadMessages, getNestedValue } from '@/lib/i18n-file-based';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (namespace: string, key: string) => string;
  tAsync: (namespace: string, key: string) => Promise<string>;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

// Cache for synchronous access to loaded translations
const syncCache: { [locale: string]: { [namespace: string]: any } } = {};

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(getCurrentLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setCurrentLocale(newLocale);
    setLocaleState(newLocale);
  }, []);

  // Synchronous translation function (uses cache)
  const t = useCallback((namespace: string, key: string) => {
    const cached = syncCache[locale]?.[namespace];
    if (cached) {
      return getNestedValue(cached, key) || key;
    }
    return key; // Return key if not cached yet
  }, [locale]);

  // Asynchronous translation function (loads if needed)
  const tAsync = useCallback(async (namespace: string, key: string) => {
    const messages = await loadMessages(locale, namespace);
    
    // Update sync cache
    if (!syncCache[locale]) {
      syncCache[locale] = {};
    }
    syncCache[locale][namespace] = messages;
    
    return getNestedValue(messages, key) || key;
  }, [locale]);

  // Preload common namespaces
  useEffect(() => {
    const preloadNamespaces = ['nav', 'common'];
    preloadNamespaces.forEach(async (namespace) => {
      const messages = await loadMessages(locale, namespace);
      if (!syncCache[locale]) {
        syncCache[locale] = {};
      }
      syncCache[locale][namespace] = messages;
    });
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t, tAsync }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslations(namespace: string) {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useTranslations must be used within an I18nProvider');
  }

  return useCallback((key: string) => context.t(namespace, key), [context, namespace]);
}

export function useLocale() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useLocale must be used within an I18nProvider');
  }
  return context.locale;
}

export function useSetLocale() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useSetLocale must be used within an I18nProvider');
  }
  return context.setLocale;
}