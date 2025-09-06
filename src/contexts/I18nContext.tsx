import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Locale, getCurrentLocale, setCurrentLocale, getTranslation } from '@/lib/i18n';

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (namespace: string, key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  const [locale, setLocaleState] = useState<Locale>(getCurrentLocale);

  const setLocale = useCallback((newLocale: Locale) => {
    setCurrentLocale(newLocale);
    setLocaleState(newLocale);
  }, []);

  const t = useCallback((namespace: string, key: string) => {
    return getTranslation(locale, namespace, key);
  }, [locale]);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
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