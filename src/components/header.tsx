"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Menu,
  Search,
  Tags,
  Users,
  LayoutGrid,
  Heart,
  MessageCircle,
  ChevronDown,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { FaceLoveLogo, FaceLoveLogoFull } from "@/components/facelove-logo";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/lib/i18n/I18nProvider";

// Navigation items configuration
const navigation = [
  { key: "home", href: "/", icon: "bookopen" },
  { key: "stories", href: "/stories", icon: "bookopen" },
  { key: "genres", href: "/genres", icon: "layoutgrid" },
  { key: "themes", href: "/themes", icon: "tags" },
  { key: "authors", href: "/authors", icon: "users" },
  { key: "community", href: "/community", icon: "messagecircle" },
];

// Icon component to avoid creating components during render
function NavIcon({ name, className }: { name: string; className?: string }) {
  const props = { className };
  
  switch (name) {
    case "bookopen":
      return <BookOpen {...props} />;
    case "layoutgrid":
      return <LayoutGrid {...props} />;
    case "tags":
      return <Tags {...props} />;
    case "users":
      return <Users {...props} />;
    case "heart":
      return <Heart {...props} />;
    case "messagecircle":
      return <MessageCircle {...props} />;
    default:
      return <BookOpen {...props} />;
  }
}

export function Header() {
  const { t } = useI18n();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const scrolled = useRef(false);
  const [scrolledState, setScrolledState] = useState(false);

  // Handle scroll with ref to avoid state updates during render
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (scrolled.current !== isScrolled) {
        scrolled.current = isScrolled;
        setScrolledState(isScrolled);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu handler
  const closeMenu = () => {
    setIsOpen(false);
  };

  // Check if a navigation item is active
  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500 ease-out",
        // Premium glass morphism effect with scroll state changes
        scrolledState 
          ? "glass-header shadow-lg shadow-purple-900/10" 
          : "bg-transparent"
      )}
      style={{
        // Using CSS design tokens for premium feel
        ...(scrolledState ? {} : {})
      }}
    >
      {/* Subtle gradient overlay for extra depth */}
      <div className={cn(
        "absolute inset-0 pointer-events-none transition-opacity duration-500",
        scrolledState ? "opacity-100" : "opacity-0"
      )}>
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 lg:px-6">
        <div className="flex h-18 items-center justify-between">
          {/* ========================================
              LOGO SECTION - Left Side
              ======================================== */}
          <Link 
            href="/" 
            className="flex items-center group relative"
            aria-label="FaceLove - Página Inicial"
          >
            {/* Neon Logo with integrated text */}
            <FaceLoveLogoFull />
          </Link>

          {/* ========================================
              DESKTOP NAVIGATION - Center
              ======================================== */}
          <nav className="hidden lg:flex items-center gap-1" role="navigation" aria-label="Navegação principal">
            {navigation.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium rounded-lg",
                    "transition-all duration-300 ease-out",
                    "group flex items-center gap-2",
                    // Text colors
                    active
                      ? "text-white"
                      : "text-[var(--fl-text-secondary)] hover:text-white",
                    // Background states
                    active && "bg-white/[0.08]"
                  )}
                >
                  {/* Active/Hover indicator bar */}
                  <span className={cn(
                    "absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 rounded-full transition-all duration-300",
                    active
                      ? "w-4/5 bg-gradient-to-r from-[var(--fl-primary)] to-[var(--fl-secondary)]"
                      : "w-0 group-hover:w-3/5 bg-gradient-to-r from-[var(--fl-primary)] to-[var(--fl-secondary)]"
                  )} />
                  
                  <NavIcon name={item.icon} className={cn(
                    "w-4 h-4 transition-colors duration-300",
                    active ? "text-[var(--fl-primary)]" : "group-hover:text-[var(--fl-secondary)]"
                  )} />
                  
                  <span className="relative">
                    {t(`nav.${item.key}` as any)}
                    {/* Text glow effect when active */}
                    {active && (
                      <span className="absolute inset-0 text-transparent blur-sm opacity-50">
                        {t(`nav.${item.key}` as any)}
                      </span>
                    )}
                  </span>
                </Link>
              );
            })}
          </nav>

          {/* ========================================
              RIGHT SIDE ACTIONS
              ======================================== */}
          <div className="flex items-center gap-2 md:gap-3">
            {/* Search button */}
            <Link 
              href="/search" 
              className={cn(
                "hidden sm:flex items-center justify-center",
                "w-9 h-9 rounded-lg",
                "text-[var(--fl-text-secondary)] hover:text-white",
                "bg-white/[0.05] hover:bg-white/[0.1]",
                "border border-white/[0.06] hover:border-[var(--fl-border-hover)]",
                "transition-all duration-300",
                "hover:shadow-lg hover:shadow-purple-500/10",
                "active:scale-95"
              )}
              aria-label="Pesquisar"
            >
              <Search className="w-4 h-4" />
            </Link>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* "Entrar" button - Premium pink/magenta style */}
            <Button
              asChild
              className={cn(
                "hidden md:flex items-center gap-2",
                "h-9 px-5 rounded-lg",
                "text-sm font-semibold",
                // Gradient background
                "bg-gradient-to-r from-[var(--fl-primary)] via-[#d946ef] to-[var(--fl-secondary)]",
                "hover:from-[var(--fl-primary-hover)] hover:via-[#e879f9] hover:to-[var(--fl-secondary-hover)]",
                "text-white",
                // Shadow and glow effects
                "shadow-lg shadow-pink-500/25",
                "hover:shadow-xl hover:shadow-pink-500/40 hover:shadow-purple-500/20",
                // Transitions
                "transition-all duration-300 ease-out",
                // Active state
                "active:scale-[0.97]",
                // Border
                "border border-white/10 hover:border-white/20"
              )}
            >
              <Link href="/login">
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </Link>
            </Button>

            {/* ========================================
                MOBILE MENU - Hamburger
                ======================================== */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "lg:hidden",
                    "w-9 h-9 rounded-lg",
                    "text-[var(--fl-text-secondary)] hover:text-white",
                    "hover:bg-white/[0.08]",
                    "transition-all duration-300"
                  )}
                  aria-label="Abrir menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              
              <SheetContent 
                side="right" 
                className={cn(
                  "w-80 p-0",
                  // Premium dark mobile drawer styling
                  "bg-[var(--fl-background-secondary)]",
                  "border-l border-[var(--fl-border)]"
                )}
              >
                {/* Mobile Drawer Header */}
                <div className="px-6 pt-6 pb-4 border-b border-[var(--fl-border-subtle)]">
                  <SheetHeader className="flex flex-row items-center justify-between">
                    <SheetTitle className="flex items-center">
                      <FaceLoveLogo size="sm" variant="neon" />
                    </SheetTitle>
                    
                    {/* Quick actions in header */}
                    <div className="flex items-center gap-2">
                      <LanguageSelector />
                      <ThemeToggle size="sm" />
                    </div>
                  </SheetHeader>
                </div>
                
                {/* Mobile Navigation Links */}
                <nav className="flex flex-col p-4 gap-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
                  {navigation.map((item) => {
                    const active = isActive(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMenu}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3.5 rounded-xl",
                          "transition-all duration-200",
                          // Typography
                          "text-sm font-medium",
                          // States
                          active
                            ? [
                                "text-white",
                                "bg-gradient-to-r from-[var(--fl-primary)]/20 to-[var(--fl-secondary)]/20",
                                "border border-[var(--fl-primary)]/30"
                              ]
                            : [
                                "text-[var(--fl-text-secondary)]",
                                "hover:text-white",
                                "hover:bg-white/[0.05]"
                              ]
                        )}
                      >
                        <NavIcon 
                          name={item.icon} 
                          className={cn(
                            "w-5 h-5 transition-colors",
                            active ? "text-[var(--fl-primary)]" : "text-[var(--fl-text-muted)]"
                          )} 
                        />
                        <span>{t(`nav.${item.key}` as any)}</span>
                        
                        {/* Active indicator */}
                        {active && (
                          <div className="ml-auto w-2 h-2 rounded-full bg-[var(--fl-primary)] shadow-lg shadow-pink-500/50" />
                        )}
                      </Link>
                    );
                  })}
                  
                  {/* Divider */}
                  <div className="my-3 h-px bg-gradient-to-r from-transparent via-[var(--fl-border)] to-transparent" />
                  
                  {/* Search link in mobile */}
                  <Link
                    href="/search"
                    onClick={closeMenu}
                    className={cn(
                      "flex items-center gap-3 px-4 py-3.5 rounded-xl",
                      "text-sm font-medium text-[var(--fl-text-secondary)]",
                      "hover:text-white hover:bg-white/[0.05]",
                      "transition-all duration-200"
                    )}
                  >
                    <Search className="w-5 h-5 text-[var(--fl-text-muted)]" />
                    <span>{t('nav.search')}</span>
                  </Link>
                </nav>
                
                {/* Mobile Drawer Footer - Login CTA */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[var(--fl-border-subtle)] bg-[var(--fl-background)]/80 backdrop-blur-sm">
                  <Button
                    asChild
                    className={cn(
                      "w-full",
                      "h-12 rounded-xl",
                      "text-sm font-semibold",
                      "bg-gradient-to-r from-[var(--fl-primary)] via-[#d946ef] to-[var(--fl-secondary)]",
                      "hover:from-[var(--fl-primary-hover)] hover:via-[#e879f9] hover:to-[var(--fl-secondary-hover)]",
                      "text-white",
                      "shadow-lg shadow-pink-500/25",
                      "transition-all duration-300"
                    )}
                  >
                    <Link href="/login" onClick={closeMenu}>
                      <LogIn className="w-4 h-4 mr-2" />
                      Entrar na Conta
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
