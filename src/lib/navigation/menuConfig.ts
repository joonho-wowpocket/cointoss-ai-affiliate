import { ReactNode } from 'react';

export interface NavItem {
  key: string;              // i18n key e.g. 'nav.dashboard'
  href?: string;
  protected?: boolean;      // needs login
  children?: NavItem[];
  icon?: ReactNode;
  testId?: string;
}

export const NAV_ITEMS: NavItem[] = [
  { 
    key: 'dashboard', 
    href: '/dashboard', 
    protected: true,
    testId: 'nav-dashboard'
  },
  { 
    key: 'partnerHub', 
    href: '/partner-hub',
    protected: false, // 페이지는 볼 수 있지만 실제 기능은 로그인 필요
    testId: 'nav-partner-hub'
  },
  { 
    key: 'aiTeam', 
    href: '/ai-assistants',
    protected: false, // 페이지는 볼 수 있지만 실제 기능은 로그인 필요
    testId: 'nav-ai-team'
  },
  { 
    key: 'myLink', 
    href: '/mylink',
    protected: false, // 페이지는 볼 수 있지만 실제 기능은 로그인 필요
    testId: 'nav-mylink'
  },
  { 
    key: 'marketplace', 
    href: '/marketplace',
    protected: false, // 페이지는 볼 수 있지만 실제 기능은 로그인 필요
    testId: 'nav-marketplace'
  },
];

export const ACCOUNT_MENU_ITEMS: NavItem[] = [
  {
    key: 'profile',
    href: '/account/profile',
    protected: true,
    testId: 'nav-profile'
  },
  {
    key: 'tokens',
    href: '/account/tokens',
    protected: true,
    testId: 'nav-tokens'
  },
  {
    key: 'settings',
    href: '/account/settings',
    protected: true,
    testId: 'nav-settings'
  },
];

export const FOOTER_LINKS = {
  product: [
    { key: 'dashboard', href: '/dashboard' },
    { key: 'partnerHub', href: '/partner-hub' },
    { key: 'aiTeam', href: '/ai-assistants' },
    { key: 'myLink', href: '/mylink' },
    { key: 'marketplace', href: '/marketplace' },
  ],
  resources: [
    { key: 'docs', href: '/docs' },
    { key: 'apiStatus', href: '/status' },
    { key: 'helpCenter', href: '/help' },
    { key: 'community', href: '/community' },
  ],
  legal: [
    { key: 'terms', href: '/terms' },
    { key: 'privacy', href: '/privacy' },
    { key: 'risk', href: '/risk-disclosure' },
    { key: 'cookies', href: '/cookies' },
  ],
  company: [
    { key: 'about', href: '/about' },
    { key: 'careers', href: 'mailto:careers@cointoss.app' },
    { key: 'partnerships', href: 'mailto:partners@cointoss.app' },
    { key: 'contact', href: 'mailto:support@cointoss.app' },
  ],
};