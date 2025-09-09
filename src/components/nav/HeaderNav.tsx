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
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-200',
      scrolled && 'shadow-sm h-14',
      !scrolled && 'h-16'
    )}>
      <div className="container flex h-full items-center justify-between">
        {/* Left: Logo + Desktop Nav */}
        <div className="flex items-center gap-8">
          <Link 
            to="/" 
            className="flex items-center space-x-2 transition-opacity hover:opacity-80"
            aria-label="CoinToss Home"
          >
            <img 
              src="/lovable-uploads/abeca2e1-b42d-4922-998b-24bf2f495f7c.png" 
              alt="CoinToss Logo" 
              className="h-8 w-auto"
            />
            <div className="flex flex-col">
              <span className="text-lg font-bold leading-none">CoinToss</span>
              <span className="hidden text-xs text-muted-foreground sm:block leading-none">
                Referral Revolution
              </span>
            </div>
          </Link>
          
          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex">
            <DesktopNav items={NAV_ITEMS} />
          </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle />
            <LanguageSwitcher />
          </div>
          
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