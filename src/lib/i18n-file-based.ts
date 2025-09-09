// File-based i18n system for CoinToss
import { SUPPORTED_LOCALES, Locale } from './i18n';

// Static imports for better Vite compatibility
import koCommon from '../../messages/ko/common.json';
import koNav from '../../messages/ko/nav.json';
import koHome from '../../messages/ko/home.json';
import koFooter from '../../messages/ko/footer.json';
import koDashboard from '../../messages/ko/dashboard.json';
import koExchanges from '../../messages/ko/exchanges.json';
import koPartnerHub from '../../messages/ko/partnerHub.json';

import enCommon from '../../messages/en/common.json';
import enNav from '../../messages/en/nav.json';
import enHome from '../../messages/en/home.json';
import enFooter from '../../messages/en/footer.json';
import enDashboard from '../../messages/en/dashboard.json';
import enExchanges from '../../messages/en/exchanges.json';
import enPartnerHub from '../../messages/en/partnerHub.json';

import jaCommon from '../../messages/ja/common.json';
import jaNav from '../../messages/ja/nav.json';
import jaHome from '../../messages/ja/home.json';
import jaFooter from '../../messages/ja/footer.json';

import idCommon from '../../messages/id/common.json';
import idNav from '../../messages/id/nav.json';
import idHome from '../../messages/id/home.json';
import idFooter from '../../messages/id/footer.json';
import idPartnerHub from '../../messages/id/partnerHub.json';

import viCommon from '../../messages/vi/common.json';
import viNav from '../../messages/vi/nav.json';
import viHome from '../../messages/vi/home.json';
import viFooter from '../../messages/vi/footer.json';
import viPartnerHub from '../../messages/vi/partnerHub.json';

interface Messages {
  [key: string]: any; // Allow arrays, objects, and strings
}

// Static translation map
const translations: { [locale: string]: { [namespace: string]: any } } = {
  ko: {
    common: koCommon,
    nav: koNav,
    home: koHome,
    footer: koFooter,
    dashboard: koDashboard,
    exchanges: koExchanges,
    partnerHub: koPartnerHub,
  },
  en: {
    common: enCommon,
    nav: enNav,
    home: enHome,
    footer: enFooter,
    dashboard: enDashboard,
    exchanges: enExchanges,
    partnerHub: enPartnerHub,
  },
  ja: {
    common: jaCommon,
    nav: jaNav,
    home: jaHome,
    footer: jaFooter,
  },
  id: {
    common: idCommon,
    nav: idNav,
    home: idHome,
    footer: idFooter,
    partnerHub: idPartnerHub,
  },
  vi: {
    common: viCommon,
    nav: viNav,
    home: viHome,
    footer: viFooter,
    partnerHub: viPartnerHub,
  },
};

export async function loadMessages(locale: Locale, namespace: string): Promise<Messages> {
  try {
    const messages = translations[locale]?.[namespace];
    if (messages) {
      return messages;
    }
    
    // Fallback to English if available
    if (locale !== 'en') {
      const fallback = translations['en']?.[namespace];
      if (fallback) {
        return fallback;
      }
    }
    
    // Return empty object as last resort
    return {};
  } catch (error) {
    console.warn(`Failed to load ${locale}/${namespace}.json:`, error);
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