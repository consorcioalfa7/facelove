"use client";

import * as React from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { locales, Locale } from "@/lib/i18n";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export function LanguageSelector({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();
  
  const currentLocale = locales[locale as Locale] || locales['pt-BR'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn("gap-2 font-normal", className)}
          aria-label={t('common.changeLanguage')}
        >
          <Globe className="h-4 w-4" />
          <span className="hidden sm:inline">{currentLocale.flag}</span>
          <span className="hidden md:inline">{currentLocale.name.split(' ')[0]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 max-h-80 overflow-y-auto">
        {Object.entries(locales).map(([key, value]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setLocale(key as Locale)}
            className={cn(
              "flex items-center gap-3 cursor-pointer",
              locale === key && "bg-accent"
            )}
          >
            <span className="text-lg">{value.flag}</span>
            <span className="flex-1">{value.name}</span>
            {locale === key && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
