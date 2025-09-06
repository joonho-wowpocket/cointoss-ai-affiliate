'use client';

import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, BarChart3, Building2, Bot, ExternalLink, ShoppingBag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/contexts/I18nContext';
import { useAuth } from '@/contexts/AuthContext';
import { NavItem } from '@/lib/navigation/menuConfig';

interface DesktopNavProps {
  items: NavItem[];
  className?: string;
}

const getIconForNavItem = (key: string) => {
  switch (key) {
    case 'dashboard':
      return <BarChart3 className="w-4 h-4" />;
    case 'partnerHub':
      return <Building2 className="w-4 h-4" />;
    case 'aiTeam':
      return <Bot className="w-4 h-4" />;
    case 'myLink':
      return <ExternalLink className="w-4 h-4" />;
    case 'marketplace':
      return <ShoppingBag className="w-4 h-4" />;
    default:
      return null;
  }
};

export function DesktopNav({ items, className }: DesktopNavProps) {
  const location = useLocation();
  const t = useTranslations('nav');
  const { isAuthenticated } = useAuth();

  const isActive = (item: NavItem): boolean => {
    if (item.href) {
      return location.pathname === item.href || location.pathname.startsWith(item.href + '/');
    }
    return false;
  };

  const handleClick = (event: React.MouseEvent, item: NavItem) => {
    if (item.href && item.protected && !isAuthenticated) {
      event.preventDefault();
      // Redirect to login will be handled by routing
    }
  };

  return (
    <nav className={cn('flex items-center space-x-1', className)} role="navigation">
      {items.map((item) => {
        const active = isActive(item);
        
        return (
          <Link
            key={item.key}
            to={item.href!}
            onClick={(e) => handleClick(e, item)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
              'hover:bg-accent hover:text-accent-foreground',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
              active && 'bg-accent text-accent-foreground font-semibold'
            )}
            data-testid={item.testId}
            aria-current={active ? 'page' : undefined}
          >
            {getIconForNavItem(item.key)}
            <span>{t(item.key)}</span>
          </Link>
        );
      })}
    </nav>
  );
}