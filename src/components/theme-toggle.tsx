"use client";

import { useState, useEffect, useCallback } from "react";
import { Moon, Sun, Monitor, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Theme types
type Theme = "light" | "dark" | "system";

// LocalStorage key
const THEME_KEY = "facelove-theme";

// Get system preference
function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// Apply theme to document
function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  
  if (theme === "system") {
    const system = getSystemTheme();
    root.classList.toggle("dark", system === "dark");
  } else {
    root.classList.toggle("dark", theme === "dark");
  }
}

interface ThemeToggleProps {
  /** Show label next to icon */
  showLabel?: boolean;
  /** Size variant */
  size?: "sm" | "default" | "lg";
  /** Additional class names */
  className?: string;
}

export function ThemeToggle({
  showLabel = false,
  size = "default",
  className,
}: ThemeToggleProps) {
  // Use lazy initializer to avoid hydration mismatch
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    if (saved && ["light", "dark", "system"].includes(saved)) {
      return saved;
    }
    return "system";
  });

  // Use lazy initializer for currentTheme based on theme
  const [currentTheme, setCurrentTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    
    const saved = localStorage.getItem(THEME_KEY) as Theme | null;
    const effectiveTheme = (saved && ["light", "dark", "system"].includes(saved)) ? saved : "system";
    
    return effectiveTheme === "system" ? getSystemTheme() : effectiveTheme;
  });

  // Apply theme and listen for system changes
  useEffect(() => {
    // Apply theme on mount and when it changes - side effect only (DOM manipulation)
    applyTheme(theme);

    // Listen for system preference changes - update state in callback
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    
    const handleChange = (e: MediaQueryListEvent) => {
      if (theme === "system") {
        applyTheme("system");
        setCurrentTheme(e.matches ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // Change theme handler
  const changeTheme = useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    localStorage.setItem(THEME_KEY, newTheme);
  }, []);

  // Toggle between light/dark (quick action)
  const toggleTheme = useCallback(() => {
    const newTheme: Theme = currentTheme === "dark" ? "light" : "dark";
    changeTheme(newTheme);
  }, [currentTheme, changeTheme]);

  // Size configurations
  const sizeConfig = {
    sm: { icon: "h-4 w-4", button: "h-8 w-8", text: "text-xs" },
    default: { icon: "h-5 w-5", button: "h-9 w-9", text: "text-sm" },
    lg: { icon: "h-6 w-6", button: "h-11 w-11", text: "text-base" },
  };

  const config = sizeConfig[size];

  // Icon based on current effective theme
  const ThemeIcon = currentTheme === "dark" ? Sun : Moon;

  if (!showLabel) {
    return (
      <DropdownMenu>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={`relative ${config.button} ${className || ""}`}
                  aria-label="Alterar tema"
                >
                  <ThemeIcon className={config.icon} />
                  {/* Active indicator dot */}
                  {theme !== "system" && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-purple-500" />
                  )}
                  
                  {/* Animation on change */}
                  <span key={currentTheme} className="absolute inset-0 flex items-center justify-center animate-scale-in">
                    <ThemeIcon className={config.icon} />
                  </span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tema: {theme === "system" ? "Sistema" : currentTheme === "dark" ? "Escuro" : "Claro"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            Tema
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Light option */}
          <DropdownMenuItem
            onClick={() => changeTheme("light")}
            className={cn(
              "gap-2 cursor-pointer",
              theme === "light" && "bg-accent"
            )}
          >
            <Sun className="w-4 h-4 text-yellow-500" />
            Claro
            {theme === "light" && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>

          {/* Dark option */}
          <DropdownMenuItem
            onClick={() => changeTheme("dark")}
            className={cn(
              "gap-2 cursor-pointer",
              theme === "dark" && "bg-accent"
            )}
          >
            <Moon className="w-4 h-4 text-purple-500" />
            Escuro
            {theme === "dark" && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* System option */}
          <DropdownMenuItem
            onClick={() => changeTheme("system")}
            className={cn(
              "gap-2 cursor-pointer",
              theme === "system" && "bg-accent"
            )}
          >
            <Monitor className="w-4 h-4" />
            Sistema
            {theme === "system" && (
              <span className="ml-auto text-xs text-muted-foreground">✓</span>
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Version with label (for sidebar or settings)
  return (
    <div className={`flex items-center gap-3 ${className || ""}`}>
      <span className={`font-medium ${config.text}`}>Tema</span>
      
      <div className="flex items-center bg-muted rounded-lg p-1">
        <Button
          variant={theme === "light" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => changeTheme("light")}
          className="gap-1.5"
        >
          <Sun className={config.icon} />
          <span className={`${config.text} hidden sm:inline`}>Claro</span>
        </Button>
        
        <Button
          variant={theme === "dark" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => changeTheme("dark")}
          className="gap-1.5"
        >
          <Moon className={config.icon} />
          <span className={`${config.text} hidden sm:inline`}>Escuro</span>
        </Button>
        
        <Button
          variant={theme === "system" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => changeTheme("system")}
          className="gap-1.5"
        >
          <Monitor className={config.icon} />
          <span className={`${config.text} hidden sm:inline`}>Auto</span>
        </Button>
      </div>
    </div>
  );
}

// Helper function to import in other components
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
