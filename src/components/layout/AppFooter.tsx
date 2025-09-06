import { Link } from 'react-router-dom';
import { useTranslations } from '@/contexts/I18nContext';
import { FOOTER_LINKS } from '@/lib/navigation/menuConfig';
import { Coins, Twitter, Send, Linkedin } from 'lucide-react';

export function AppFooter() {
  const navT = useTranslations('nav');
  const footerT = useTranslations('footer');

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8 md:py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Logo & Description */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80">
                <Coins className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">CoinToss</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4 max-w-xs">
              업계 최고 85% 수수료율과 AI 자동화로 암호화폐 파트너 수익을 극대화하세요.
            </p>
            <div className="flex items-center space-x-3">
              <Link
                to="https://twitter.com/cointoss"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                to="https://t.me/cointoss"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Telegram"
              >
                <Send className="h-5 w-5" />
              </Link>
              <Link
                to="https://linkedin.com/company/cointoss"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-semibold text-sm mb-4">제품</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.product.map((link) => (
                <li key={link.key}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {navT(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-sm mb-4">리소스</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.resources.map((link) => (
                <li key={link.key}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {footerT(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company & Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-4">회사</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.company.map((link) => (
                <li key={link.key}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {footerT(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
            
            <h3 className="font-semibold text-sm mb-4 mt-6">법적고지</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.legal.map((link) => (
                <li key={link.key}>
                  <Link
                    to={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {footerT(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Partner Logos Section */}
        <div className="mt-8 pt-8 border-t">
          <p className="text-xs text-muted-foreground text-center mb-6">파트너 거래소</p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            <div className="text-sm font-medium text-muted-foreground">Binance</div>
            <div className="text-sm font-medium text-muted-foreground">OKX</div>
            <div className="text-sm font-medium text-muted-foreground">Bybit</div>
            <div className="text-sm font-medium text-muted-foreground">Gate.io</div>
            <div className="text-sm font-medium text-muted-foreground">MEXC</div>
            <div className="text-sm font-medium text-muted-foreground">KuCoin</div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-8 pt-8 border-t">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div className="text-xs text-muted-foreground text-center md:text-left">
              © 2025 CoinToss. All rights reserved.
            </div>
            <div className="text-xs text-muted-foreground text-center md:text-right">
              AI Partner Hub • 85% Commission • Global Crypto Community
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}