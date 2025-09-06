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
    key: 'nav.dashboard', 
    href: '/dashboard', 
    protected: true,
    testId: 'nav-dashboard'
  },
  { 
    key: 'nav.partnerHub', 
    protected: true,
    testId: 'nav-partner-hub',
    children: [
      { 
        key: 'nav.exchangesBasic', 
        href: '/partner-hub/exchanges?tab=basic', 
        protected: true,
        testId: 'nav-exchanges-basic'
      },
      { 
        key: 'nav.exchangesApproved', 
        href: '/partner-hub/exchanges?tab=approved', 
        protected: true,
        testId: 'nav-exchanges-approved'
      },
      { 
        key: 'nav.uidRegistry', 
        href: '/partner-hub/uid', 
        protected: true,
        testId: 'nav-uid-registry'
      },
      { 
        key: 'nav.approvals', 
        href: '/partner-hub/approvals', 
        protected: true,
        testId: 'nav-approvals'
      },
      { 
        key: 'nav.customers', 
        href: '/partner-hub/customers', 
        protected: true,
        testId: 'nav-customers'
      },
    ]
  },
  { 
    key: 'nav.aiTeam', 
    href: '/ai', 
    protected: true,
    testId: 'nav-ai-team'
  },
  { 
    key: 'nav.myLink', 
    href: '/mylink', 
    protected: true,
    testId: 'nav-mylink'
  },
  { 
    key: 'nav.marketplace', 
    href: '/marketplace', 
    protected: true,
    testId: 'nav-marketplace'
  },
];

export const ACCOUNT_MENU_ITEMS: NavItem[] = [
  {
    key: 'nav.profile',
    href: '/account/profile',
    protected: true,
    testId: 'nav-profile'
  },
  {
    key: 'nav.security',
    href: '/account/security',
    protected: true,
    testId: 'nav-security'
  },
  {
    key: 'nav.tokens',
    href: '/account/tokens',
    protected: true,
    testId: 'nav-tokens'
  },
];

export const FOOTER_LINKS = {
  product: [
    { key: 'nav.dashboard', href: '/dashboard' },
    { key: 'nav.partnerHub', href: '/partner-hub' },
    { key: 'nav.aiTeam', href: '/ai' },
    { key: 'nav.myLink', href: '/mylink' },
    { key: 'nav.marketplace', href: '/marketplace' },
  ],
  resources: [
    { key: 'footer.docs', href: '/docs' },
    { key: 'footer.apiStatus', href: '/status' },
    { key: 'footer.helpCenter', href: '/help' },
    { key: 'footer.community', href: '/community' },
  ],
  legal: [
    { key: 'footer.terms', href: '/terms' },
    { key: 'footer.privacy', href: '/privacy' },
    { key: 'footer.risk', href: '/risk-disclosure' },
    { key: 'footer.cookies', href: '/cookies' },
  ],
  company: [
    { key: 'footer.about', href: '/about' },
    { key: 'footer.careers', href: 'mailto:careers@cointoss.app' },
    { key: 'footer.partnerships', href: 'mailto:partners@cointoss.app' },
    { key: 'footer.contact', href: 'mailto:support@cointoss.app' },
  ],
};