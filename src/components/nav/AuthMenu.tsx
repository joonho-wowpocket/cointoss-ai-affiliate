'use client';

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useTranslations } from '@/contexts/I18nContext';
import { useAuthGate } from '@/lib/auth/withAuthGate';
import { ACCOUNT_MENU_ITEMS } from '@/lib/navigation/menuConfig';

export function AuthMenu() {
  const t = useTranslations('nav');
  const { isAuthenticated, guardAction } = useAuthGate();

  const handleSignOut = () => {
    guardAction(() => {
      // TODO: Implement actual sign out logic
      console.log('Signing out...');
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/auth/login">{t('signIn')}</Link>
        </Button>
        <Button size="sm" asChild>
          <Link to="/auth/signup">{t('getStarted')}</Link>
        </Button>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-9 w-9 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/placeholder.svg" alt="Profile" />
            <AvatarFallback className="bg-primary text-primary-foreground">
              CT
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="w-56 bg-background/95 backdrop-blur-xl border shadow-lg" 
        align="end" 
        forceMount
      >
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">CoinToss User</p>
            <p className="text-xs leading-none text-muted-foreground">
              user@cointoss.app
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {ACCOUNT_MENU_ITEMS.map((item) => (
          <DropdownMenuItem key={item.key} asChild>
            <Link 
              to={item.href!}
              className="flex items-center gap-2 cursor-pointer"
            >
              {item.icon}
              <span>{t(item.key)}</span>
            </Link>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={handleSignOut}
          className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4" />
          <span>{t('signOut')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}