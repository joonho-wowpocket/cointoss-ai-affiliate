'use client';

import { Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocale, useSetLocale } from '@/contexts/I18nContext';
import { SUPPORTED_LOCALES } from '@/lib/i18n';

export function LanguageSwitcher() {
  const locale = useLocale();
  const setLocale = useSetLocale();

  const handleLanguageChange = (newLocale: string) => {
    setLocale(newLocale as 'ko' | 'ja' | 'id' | 'vi' | 'en');
  };

  const currentLanguage = SUPPORTED_LOCALES.find(l => l.code === locale) || SUPPORTED_LOCALES[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-9 px-2"
          aria-label="Change language"
        >
          <Globe className="h-4 w-4 mr-1" />
          <span className="hidden sm:inline text-xs font-medium">
            {currentLanguage.code.toUpperCase()}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="bg-background/95 backdrop-blur-xl border shadow-lg"
      >
        {SUPPORTED_LOCALES.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`cursor-pointer ${locale === lang.code ? 'bg-accent' : ''}`}
          >
            <span className="mr-2 text-base">{lang.flag}</span>
            <span>{lang.name}</span>
            {locale === lang.code && (
              <div className="ml-auto w-2 h-2 bg-primary rounded-full" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}