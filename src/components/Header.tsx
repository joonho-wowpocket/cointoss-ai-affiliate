'use client';

import { ResponsiveSidebar } from './ResponsiveSidebar';
import { ThemeToggle } from './ThemeToggle';
import { LanguageSwitcher } from './LanguageSwitcher';

export function Header() {
  return (
    <header className="h-14 flex items-center justify-between border-b border-primary/20 bg-background/95 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center">
        <ResponsiveSidebar />
      </div>
      
      <div className="flex items-center space-x-2">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </header>
  );
}