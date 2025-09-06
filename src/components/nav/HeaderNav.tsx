'use client';

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/contexts/I18nContext';
import { DesktopNav } from './DesktopNav';
import { MobileMenu } from './MobileMenu';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';
import { AuthMenu } from './AuthMenu';
import { NAV_ITEMS } from '@/lib/navigation/menuConfig';

export function HeaderNav() {
  const [scrolled, setScrolled] = useState(false);
  const t = useTranslations('nav');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      'sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b transition-shadow duration-200',
      scrolled && 'shadow-sm'
    )}>
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex items-center gap-6">
          <Link 
            to="/" 
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
            aria-label="CoinToss Home"
          >
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <Coins className="w-5 h-5 text-primary-foreground font-bold" />
            </div>
            <span className="hidden sm:block text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              CoinToss
            </span>
          </Link>
          
          {/* Desktop Navigation - Hidden on mobile */}
          <div className="hidden lg:block">
            <DesktopNav items={NAV_ITEMS} />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          <AuthMenu />
          
          {/* Mobile Menu - Only visible on mobile */}
          <div className="lg:hidden">
            <MobileMenu items={NAV_ITEMS} />
          </div>
        </div>
      </div>
    </header>
  );
}