'use client';

import { Link } from 'react-router-dom';
import { Coins, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useTranslations } from '@/contexts/I18nContext';
import { LanguageSwitcher } from '@/components/nav/LanguageSwitcher';
import { ThemeToggle } from '@/components/nav/ThemeToggle';
import { FOOTER_LINKS } from '@/lib/navigation/menuConfig';

const SOCIAL_LINKS = [
  { name: 'X (Twitter)', href: 'https://x.com/cointoss', icon: '𝕏' },
  { name: 'YouTube', href: 'https://youtube.com/@cointoss', icon: '▶️' },
  { name: 'Telegram', href: 'https://t.me/cointoss', icon: '✈️' },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/cointoss', icon: '💼' },
];

export function AppFooter() {
  const t = useTranslations('footer');
  const navT = useTranslations('nav');
  const currentYear = new Date().getFullYear();

  const FooterSection = ({ 
    title, 
    links,
    useFooterTranslation = false
  }: { 
    title: string; 
    links: Array<{ key: string; href: string }>;
    useFooterTranslation?: boolean;
  }) => (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.key}>
            {link.href.startsWith('mailto:') ? (
              <a
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                {useFooterTranslation ? t(link.key) : navT(link.key)}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : link.href.startsWith('http') ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
              >
                {useFooterTranslation ? t(link.key) : navT(link.key)}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <Link
                to={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {useFooterTranslation ? t(link.key) : navT(link.key)}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="bg-muted/30 border-t">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Section */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Coins className="w-5 h-5 text-primary-foreground font-bold" />
              </div>
              <span className="text-lg font-bold bg-gradient-primary bg-clip-text text-transparent">
                CoinToss
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('tagline')}
            </p>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
            </div>
          </div>

          {/* Product */}
          <FooterSection
            title={t('product')}
            links={FOOTER_LINKS.product}
          />

          {/* Resources */}
          <FooterSection
            title={t('resources')}
            links={FOOTER_LINKS.resources}
            useFooterTranslation={true}
          />

          {/* Legal */}
          <FooterSection
            title={t('legal')}
            links={FOOTER_LINKS.legal}
            useFooterTranslation={true}
          />

          {/* Company */}
          <FooterSection
            title={t('company')}
            links={FOOTER_LINKS.company}
            useFooterTranslation={true}
          />
        </div>

        <Separator className="my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
            <span>© {currentYear} CoinToss. All rights reserved.</span>
            <span className="hidden sm:inline">•</span>
            <span>Company No. 12345678 • Singapore</span>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-2">
            {SOCIAL_LINKS.map((social) => (
              <Button
                key={social.name}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                asChild
              >
                <a
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  title={social.name}
                >
                  <span className="text-base">{social.icon}</span>
                </a>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}