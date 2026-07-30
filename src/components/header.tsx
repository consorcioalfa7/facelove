"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import {
  BookOpen,
  Menu,
  Sun,
  Moon,
  Search,
  Tags,
  Users,
  LayoutGrid,
  Heart,
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
import { FaceLoveLogo } from "@/components/facelove-logo";
import { LanguageSelector } from "@/components/language-selector";
import { useI18n } from "@/lib/i18n/I18nProvider";

const navigation = [
  { key: "home", href: "/", icon: "bookopen" },
  { key: "genres", href: "/genres", icon: "layoutgrid" },
  { key: "themes", href: "/themes", icon: "tags" },
  { key: "authors", href: "/authors", icon: "users" },
  { key: "favorites", href: "/favorites", icon: "heart" },
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
    default:
      return <BookOpen {...props} />;
  }
}

export function Header() {
  const { t } = useI18n();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
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

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolledState
          ? "glass border-b shadow-sm"
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo - FaceLove */}
          <Link href="/" className="flex items-center gap-2 group">
            <FaceLoveLogo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={cn(
                      "gap-2 transition-all",
                      isActive && "font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300"
                    )}
                  >
                    <NavIcon name={item.icon} className="w-4 h-4" />
                    {t(`nav.${item.key}` as any)}
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Search button - desktop */}
            <Link href="/search" className="hidden sm:block">
              <Button variant="outline" size="sm" className="gap-2">
                <Search className="w-4 h-4" />
                <span className="hidden lg:inline">{t('nav.search')}</span>
              </Button>
            </Link>

            {/* Language Selector */}
            <LanguageSelector />

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="relative overflow-hidden"
              aria-label="Toggle theme"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <FaceLoveLogo size="sm" />
                  </SheetTitle>
                </SheetHeader>
                
                <nav className="flex flex-col gap-1 mt-6">
                  {navigation.map((item) => {
                    const isActive =
                      item.href === "/"
                        ? pathname === "/"
                        : pathname.startsWith(item.href);
                    return (
                      <Link key={item.href} href={item.href} onClick={closeMenu}>
                        <Button
                          variant={isActive ? "secondary" : "ghost"}
                          className={cn(
                            "w-full justify-start gap-3 py-3",
                            isActive && "font-medium bg-purple-100 text-purple-700"
                          )}
                        >
                          <NavIcon name={item.icon} className="w-5 h-5" />
                          {t(`nav.${item.key}` as any)}
                        </Button>
                      </Link>
                    );
                  })}
                  
                  <div className="my-3 border-t" />
                  
                  <Link href="/search" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start gap-3 py-3">
                      <Search className="w-5 h-5" />
                      {t('nav.search')}
                    </Button>
                  </Link>
                  
                  <div className="mt-2 px-4">
                    <LanguageSelector className="w-full justify-start" />
                  </div>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
