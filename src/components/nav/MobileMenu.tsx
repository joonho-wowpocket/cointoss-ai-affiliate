'use client';

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, ChevronRight, Building2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/contexts/I18nContext';
import { useAuthGate } from '@/lib/auth/withAuthGate';
import { NavItem } from '@/lib/navigation/menuConfig';

interface MobileMenuProps {
  items: NavItem[];
}

export function MobileMenu({ items }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const location = useLocation();
  const t = useTranslations('nav');
  const { guardLink } = useAuthGate();

  const isActive = (item: NavItem): boolean => {
    if (item.href) {
      return location.pathname === item.href || location.pathname.startsWith(item.href + '/');
    }
    if (item.children) {
      return item.children.some(child => child.href && location.pathname.startsWith(child.href));
    }
    return false;
  };

  const toggleExpanded = (key: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedItems(newExpanded);
  };

  const handleLinkClick = (event: React.MouseEvent, item: NavItem) => {
    if (item.href && item.protected) {
      if (!guardLink(item.href)) {
        event.preventDefault();
        setOpen(false);
        return;
      }
    }
    setOpen(false);
  };

  const MobileNavItem = ({ item, level = 0 }: { item: NavItem; level?: number }) => {
    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item);
    const expanded = expandedItems.has(item.key);

    if (hasChildren) {
      return (
        <Collapsible open={expanded} onOpenChange={() => toggleExpanded(item.key)}>
          <CollapsibleTrigger asChild>
            <button
              className={cn(
                'flex items-center justify-between w-full px-4 py-3 text-left transition-colors',
                'hover:bg-accent hover:text-accent-foreground rounded-lg',
                active && 'bg-accent text-accent-foreground font-medium',
                level > 0 && 'ml-4 px-3 py-2'
              )}
              data-testid={item.testId}
            >
              <div className="flex items-center gap-3">
                <Building2 className="h-4 w-4" />
                <span>{t(item.key)}</span>
              </div>
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-1">
            {item.children!.map((child) => (
              <MobileNavItem key={child.key} item={child} level={level + 1} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      );
    }

    return (
            <Link
              to={item.href!}
              onClick={(e) => handleLinkClick(e, item)}
              className={cn(
                'flex items-center gap-3 px-4 py-3 transition-colors rounded-lg',
                'hover:bg-accent hover:text-accent-foreground',
                active && 'bg-accent text-accent-foreground font-medium',
                level > 0 && 'ml-4 px-3 py-2'
              )}
              data-testid={item.testId}
            >
              <Users className="h-4 w-4" />
              <span>{t(item.key)}</span>
              {active && (
                <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
              )}
            </Link>
    );
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
        className="w-[88vw] max-w-sm p-0"
        aria-describedby="mobile-menu-description"
      >
        <SheetHeader className="px-4 py-3 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg font-semibold">
              {t('nav.menu')}
            </SheetTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setOpen(false)}
              aria-label={t('closeSidebar')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        
        <div id="mobile-menu-description" className="sr-only">
          Navigation menu for mobile devices
        </div>
        
        <ScrollArea className="flex-1 px-2 py-4">
          <nav className="space-y-1" role="navigation">
            {items.map((item) => (
              <MobileNavItem key={item.key} item={item} />
            ))}
          </nav>
          
          <Separator className="my-6" />
          
          {/* Quick Actions */}
          <div className="px-2 space-y-1">
            <h3 className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t('nav.quickActions')}
            </h3>
            <Link
              to="/auth/signup"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3 text-sm transition-colors rounded-lg hover:bg-accent hover:text-accent-foreground"
            >
              <span>{t('nav.getStarted')}</span>
            </Link>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}