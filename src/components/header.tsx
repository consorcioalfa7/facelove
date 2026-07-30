"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import {
  BookOpen,
  Menu,
  X,
  Sun,
  Moon,
  Search,
  Tags,
  Users,
  LayoutGrid,
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

const navigation = [
  { name: "Home", href: "/", icon: BookOpen },
  { name: "Genres", href: "/genres", icon: LayoutGrid },
  { name: "Themes", href: "/themes", icon: Tags },
  { name: "Authors", href: "/authors", icon: Users },
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
    default:
      return <BookOpen {...props} />;
  }
}

export function Header() {
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
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-rose-500 shadow-lg shadow-amber-500/25 group-hover:shadow-amber-500/40 transition-shadow">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Story<span className="gradient-text">Vault</span>
            </span>
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
                      isActive && "font-medium"
                    )}
                  >
                    <NavIcon name={item.icon.name} className="w-4 h-4" />
                    {item.name}
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
                <span className="hidden lg:inline">Search</span>
              </Button>
            </Link>

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
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-rose-500">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    StoryVault
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
                            isActive && "font-medium"
                          )}
                        >
                          <NavIcon name={item.icon.name} className="w-5 h-5" />
                          {item.name}
                        </Button>
                      </Link>
                    );
                  })}
                  
                  <div className="my-3 border-t" />
                  
                  <Link href="/search" onClick={closeMenu}>
                    <Button variant="ghost" className="w-full justify-start gap-3 py-3">
                      <Search className="w-5 h-5" />
                      Search Stories
                    </Button>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
