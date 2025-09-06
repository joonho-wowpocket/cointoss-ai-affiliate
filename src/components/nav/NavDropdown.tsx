'use client';

import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/contexts/I18nContext';
import { useAuthGate } from '@/lib/auth/withAuthGate';
import { NavItem } from '@/lib/navigation/menuConfig';

interface NavDropdownProps {
  items: NavItem[];
  parentKey: string;
  onClose: () => void;
  className?: string;
}

export function NavDropdown({ items, parentKey, onClose, className }: NavDropdownProps) {
  const location = useLocation();
  const t = useTranslations('nav');
  const { guardLink } = useAuthGate();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (item: NavItem): boolean => {
    if (item.href) {
      return location.pathname === item.href || location.pathname.startsWith(item.href + '/');
    }
    return false;
  };

  const handleClick = (event: React.MouseEvent, item: NavItem) => {
    if (item.href && item.protected) {
      if (!guardLink(item.href)) {
        event.preventDefault();
        return;
      }
    }
    onClose();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onClose();
        break;
      case 'Tab':
        // Allow natural tab navigation, close dropdown when needed
        setTimeout(() => {
          if (dropdownRef.current && !dropdownRef.current.contains(document.activeElement)) {
            onClose();
          }
        }, 0);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'absolute top-full left-0 mt-1 min-w-[260px] z-50',
        'bg-background/95 backdrop-blur-xl border rounded-2xl shadow-lg ring-1 ring-black/5',
        'p-2 space-y-1',
        'animate-in fade-in-0 zoom-in-95 duration-200',
        className
      )}
      role="menu"
      aria-label={`${t(parentKey)} submenu`}
      onKeyDown={handleKeyDown}
    >
      {items.map((item) => {
        const active = isActive(item);
        
        return (
            <Link
              key={item.key}
              to={item.href!}
              onClick={(e) => handleClick(e, item)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                active && 'bg-accent text-accent-foreground font-medium'
              )}
              data-testid={item.testId}
              role="menuitem"
              aria-current={active ? 'page' : undefined}
            >
              <Users className="h-4 w-4" />
              <span className="flex-1">{t(item.key)}</span>
              {active && (
                <div className="w-2 h-2 bg-primary rounded-full" />
              )}
            </Link>
        );
      })}
    </div>
  );
}