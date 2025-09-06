import { ReactNode } from 'react';
import { 
  BarChart3, 
  Building2, 
  Users, 
  FileCheck, 
  UserCheck,
  Bot,
  ExternalLink,
  ShoppingBag,
  User,
  Shield,
  Coins,
  LogOut
} from 'lucide-react';

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
    protected: true,
    testId: 'nav-partner-hub'
  },
  { 
    key: 'aiTeam', 
    href: '/ai', 
    protected: true,
    testId: 'nav-ai-team'
  },
  { 
    key: 'myLink', 
    href: '/mylink', 
    protected: true,
    testId: 'nav-mylink'
  },
  { 
    key: 'marketplace', 
    href: '/marketplace', 
    protected: true,
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
    key: 'security',
    href: '/account/security',
    protected: true,
    testId: 'nav-security'
  },
  {
    key: 'tokens',
    href: '/account/tokens',
    protected: true,
    testId: 'nav-tokens'
  },
];

export const FOOTER_LINKS = {
  product: [
    { key: 'dashboard', href: '/dashboard' },
    { key: 'partnerHub', href: '/partner-hub' },
    { key: 'aiTeam', href: '/ai' },
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