'use client';

import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, BarChart3, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/contexts/I18nContext';
import { useAuthGate } from '@/lib/auth/withAuthGate';
import { NavDropdown } from './NavDropdown';
import { NavItem } from '@/lib/navigation/menuConfig';

interface DesktopNavProps {
  items: NavItem[];
  className?: string;
}

export function DesktopNav({ items, className }: DesktopNavProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [focusedItem, setFocusedItem] = useState<string | null>(null);
  const location = useLocation();
  const t = useTranslations('nav');
  const { guardLink } = useAuthGate();
  const timeoutRef = useRef<NodeJS.Timeout>();

  const isActive = (item: NavItem): boolean => {
    if (item.href) {
      return location.pathname === item.href || location.pathname.startsWith(item.href + '/');
    }
    if (item.children) {
      return item.children.some(child => child.href && location.pathname.startsWith(child.href));
    }
    return false;
  };

  const handleMouseEnter = (key: string) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setOpenDropdown(key);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

  const handleKeyDown = (event: React.KeyboardEvent, item: NavItem) => {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (item.children) {
          setOpenDropdown(openDropdown === item.key ? null : item.key);
        } else if (item.href) {
          if (item.protected && !guardLink(item.href)) {
            return;
          }
          // Let react-router handle the navigation
        }
        break;
      case 'Escape':
        setOpenDropdown(null);
        setFocusedItem(null);
        break;
      case 'ArrowDown':
        if (item.children && openDropdown !== item.key) {
          event.preventDefault();
          setOpenDropdown(item.key);
        }
        break;
    }
  };

  const handleClick = (event: React.MouseEvent, item: NavItem) => {
    if (item.children) {
      event.preventDefault();
      setOpenDropdown(openDropdown === item.key ? null : item.key);
    } else if (item.href && item.protected) {
      if (!guardLink(item.href)) {
        event.preventDefault();
      }
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <nav className={cn('flex items-center space-x-1', className)} role="navigation">
      {items.map((item) => {
        const hasChildren = item.children && item.children.length > 0;
        const active = isActive(item);
        
        return (
          <div
            key={item.key}
            className="relative"
            onMouseEnter={() => hasChildren && handleMouseEnter(item.key)}
            onMouseLeave={handleMouseLeave}
          >
            {item.href ? (
              <Link
                to={item.href}
                onClick={(e) => handleClick(e, item)}
                onKeyDown={(e) => handleKeyDown(e, item)}
                onFocus={() => setFocusedItem(item.key)}
                onBlur={() => setFocusedItem(null)}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  active && 'bg-accent text-accent-foreground font-semibold',
                  focusedItem === item.key && 'ring-2 ring-primary ring-offset-2'
                )}
                data-testid={item.testId}
                aria-current={active ? 'page' : undefined}
              >
                <BarChart3 className="h-4 w-4" />
                <span>{t(item.key)}</span>
                {hasChildren && <ChevronDown className="h-3 w-3" />}
              </Link>
            ) : (
              <button
                onClick={(e) => handleClick(e, item)}
                onKeyDown={(e) => handleKeyDown(e, item)}
                onFocus={() => setFocusedItem(item.key)}
                onBlur={() => setFocusedItem(null)}
                className={cn(
                  'flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
                  active && 'bg-accent text-accent-foreground font-semibold',
                  focusedItem === item.key && 'ring-2 ring-primary ring-offset-2'
                )}
                data-testid={item.testId}
                aria-expanded={hasChildren ? openDropdown === item.key : undefined}
                aria-haspopup={hasChildren ? 'menu' : undefined}
              >
                <Building2 className="h-4 w-4" />
                <span>{t(item.key)}</span>
                {hasChildren && (
                  <ChevronDown 
                    className={cn(
                      'h-3 w-3 transition-transform',
                      openDropdown === item.key && 'rotate-180'
                    )} 
                  />
                )}
              </button>
            )}

            {hasChildren && openDropdown === item.key && (
              <NavDropdown
                items={item.children!}
                parentKey={item.key}
                onClose={() => setOpenDropdown(null)}
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}