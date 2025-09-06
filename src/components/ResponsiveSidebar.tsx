'use client';

import { useEffect, useState, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, ChevronLeft, Coins } from 'lucide-react';
import { useTranslations } from '@/contexts/I18nContext';
import clsx from 'clsx';
import { Button } from '@/components/ui/button';
import { navigationConfig, NavItem } from '@/lib/navConfig';
import { storage } from '@/lib/storage';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface ResponsiveSidebarProps {
  className?: string;
}

export function ResponsiveSidebar({ className }: ResponsiveSidebarProps) {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setCollapsed] = useState(() => storage.getSidebarCollapsed());
  const location = useLocation();
  const t = useTranslations('nav');

  // Persist collapsed state
  useEffect(() => {
    storage.setSidebarCollapsed(isCollapsed);
  }, [isCollapsed]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setMobileOpen(false);
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileOpen]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => !prev);
  }, []);

  const isActive = (path: string) => location.pathname === path;
  
  const NavItemComponent = ({ item, depth = 0 }: { item: NavItem; depth?: number }) => {
    const active = isActive(item.href);
    const Icon = item.icon;
    
    const linkContent = (
      <NavLink
        to={item.href}
        className={clsx(
          'flex items-center px-3 py-2 rounded-lg transition-all duration-200',
          'hover:bg-primary/10 focus:bg-primary/10 focus:outline-none',
          depth > 0 && 'ml-4',
          active 
            ? 'bg-primary/20 text-primary font-medium border-r-2 border-primary' 
            : 'text-primary/70 hover:text-primary'
        )}
        aria-current={active ? 'page' : undefined}
      >
        <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
        {(!isCollapsed || isMobileOpen) && (
          <span className="ml-3 truncate">{t(item.labelKey)}</span>
        )}
      </NavLink>
    );

    if (isCollapsed && !isMobileOpen && depth === 0) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {linkContent}
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {t(item.labelKey)}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return linkContent;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between h-14 px-3 border-b border-primary/20">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
            <Coins className="w-5 h-5 text-primary-foreground font-bold" />
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div>
              <h2 className="text-lg font-bold text-primary">CoinToss</h2>
              <p className="text-xs text-primary/60">{t('subtitle')}</p>
            </div>
          )}
        </div>
        
        {/* Desktop collapse button */}
        <Button
          variant="ghost"
          size="sm"
          className="hidden md:flex h-8 w-8 p-0 text-primary/70 hover:text-primary"
          onClick={toggleCollapsed}
          aria-label={isCollapsed ? t('expandSidebar') : t('collapseSidebar')}
        >
          <ChevronLeft 
            className={clsx('h-4 w-4 transition-transform', isCollapsed && 'rotate-180')} 
          />
        </Button>
        
        {/* Mobile close button */}
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden h-8 w-8 p-0 text-primary/70 hover:text-primary"
          onClick={() => setMobileOpen(false)}
          aria-label={t('closeSidebar')}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto" role="navigation">
        {navigationConfig.map((item) => (
          <div key={item.labelKey}>
            <NavItemComponent item={item} />
            {item.children && (!isCollapsed || isMobileOpen) && (
              <div className="mt-1 space-y-1">
                {item.children.map((child) => (
                  <NavItemComponent key={child.labelKey} item={child} depth={1} />
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger trigger */}
      <Button
        variant="ghost"
        size="sm"
        className="md:hidden p-2 text-primary hover:text-primary/80"
        onClick={() => setMobileOpen(true)}
        aria-label={t('openMenu')}
        aria-controls="sidebar"
        aria-expanded={isMobileOpen}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      <div
        className={clsx(
          'fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-200',
          isMobileOpen 
            ? 'opacity-100 pointer-events-auto' 
            : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        id="sidebar"
        className={clsx(
          'fixed md:static z-50 top-0 left-0 h-screen bg-background border-r border-primary/20',
          'transition-all duration-300 ease-in-out',
          // Desktop sizing
          isCollapsed ? 'md:w-16' : 'md:w-64',
          // Mobile positioning
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0',
          className
        )}
        aria-hidden={!isMobileOpen && typeof window !== 'undefined' && window.innerWidth < 768}
      >
        {sidebarContent}
      </aside>
    </>
  );
}