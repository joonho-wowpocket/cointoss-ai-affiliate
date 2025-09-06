'use client';

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { NavItem } from '@/lib/navigation/menuConfig';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';

interface MobileMenuProps {
  items: NavItem[];
}

export function MobileMenu({ items }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const t = useTranslations('nav');
  const { isAuthenticated, signOut, user } = useAuth();

  const isActive = (item: NavItem): boolean => {
    if (item.href) {
      return location.pathname === item.href || location.pathname.startsWith(item.href + '/');
    }
    return false;
  };

  const handleLinkClick = (event: React.MouseEvent, item: NavItem) => {
    if (item.href && item.protected && !isAuthenticated) {
      event.preventDefault();
      setOpen(false);
      window.location.href = `/auth/signup?next=${encodeURIComponent(item.href)}`;
      return;
    }
    setOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="p-2"
          aria-label={t('openMenu')}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-[300px] p-0 flex flex-col"
        aria-describedby="mobile-menu-description"
      >
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">
              {t('menu')}
            </SheetTitle>
          </div>
        </SheetHeader>
        
        <div id="mobile-menu-description" className="sr-only">
          Navigation menu for mobile devices
        </div>
        
        <ScrollArea className="flex-1">
          <div className="px-6 py-4 space-y-4">
            {/* User Info */}
            {isAuthenticated && user && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground">환영합니다!</p>
              </div>
            )}

            {/* Navigation Items */}
            <nav className="space-y-2" role="navigation">
              {items.map((item) => {
                const active = isActive(item);
                
                return (
                  <Link
                    key={item.key}
                    to={item.href!}
                    onClick={(e) => handleLinkClick(e, item)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded-lg',
                      'hover:bg-accent hover:text-accent-foreground',
                      active && 'bg-accent text-accent-foreground font-medium'
                    )}
                    data-testid={item.testId}
                  >
                    <span>{t(item.key)}</span>
                    {active && (
                      <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
                    )}
                  </Link>
                );
              })}
            </nav>
            
            <Separator />
            
            {/* Account Section */}
            {isAuthenticated ? (
              <div className="space-y-2">
                <h3 className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {t('account')}
                </h3>
                <Link
                  to="/account/profile"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded-lg hover:bg-accent hover:text-accent-foreground"
                >
                  <span>{t('profile')}</span>
                </Link>
                <Link
                  to="/account/tokens"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded-lg hover:bg-accent hover:text-accent-foreground"
                >
                  <span>{t('tokens')}</span>
                </Link>
                <Link
                  to="/account/settings"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 text-sm transition-colors rounded-lg hover:bg-accent hover:text-accent-foreground"
                >
                  <span>{t('settings')}</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-3 px-3 py-2 w-full text-left text-sm transition-colors rounded-lg hover:bg-accent hover:text-accent-foreground text-destructive"
                >
                  <span>{t('signOut')}</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/auth/login"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors rounded-lg border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                >
                  {t('signIn')}
                </Link>
                <Link
                  to="/auth/signup"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center px-4 py-2 text-sm font-medium transition-colors rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {t('getStarted')}
                </Link>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Bottom Actions */}
        <div className="px-6 py-4 border-t bg-muted/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">설정</span>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}