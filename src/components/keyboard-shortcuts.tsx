"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Keyboard,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Home,
  Search,
  Heart,
  BookOpen,
  Bookmark,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface Shortcut {
  key: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  action?: () => void;
}

// Global keyboard shortcuts configuration
const SHORTCUTS: Shortcut[] = [
  {
    key: "?",
    "label": "Mostrar Atalhos",
    "description": "Abrir este painel de atalhos",
    icon: Keyboard,
  },
  {
    key: "h",
    "label": "Início",
    "description": "Ir para a página inicial",
    icon: Home,
  },
  {
    key: "s",
    "label": "Buscar",
    "description": "Ir para a busca",
    icon: Search,
  },
  {
    key: "g",
    "label": "Gêneros",
    "description": "Explorar gêneros",
    icon: BookOpen,
  },
  {
    key: "f",
    "label": "Favoritos",
    "description": "Ver favoritos",
    icon: Heart,
  },
  {
    key: "←",
    "label": "Voltar",
    "description": "Voltar à página anterior",
    icon: ArrowLeft,
  },
  {
    key: "/",
    "label": "Foco na Busca",
    "description": "Focar no campo de busca",
    icon: Search,
  },
];

export function KeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const router = useRouter();

  // Execute shortcut action
  const executeShortcut = useCallback(
    (key: string) => {
      switch (key) {
        case "h":
          router.push("/");
          break;
        case "s":
          router.push("/search");
          break;
        case "g":
          router.push("/genres");
          break;
        case "f":
          router.push("/favorites");
          break;
        case "?":
          setIsOpen((prev) => !prev);
          break;
        default:
          break;
      }
    },
    [router]
  );

  // Handle keyboard events
  useEffect(() => {
    let lastKeyTime = 0;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in input fields
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        // Allow "/" to focus search even in some contexts
        if (e.key === "/" && target.tagName !== "INPUT") {
          e.preventDefault();
          // Dispatch custom event for search focus
          window.dispatchEvent(new CustomEvent("focusSearch"));
        }
        return;
      }

      const now = Date.now();
      const key = e.key;
      
      // Debounce rapid key presses
      if (now - lastKeyTime < 100) return;
      lastKeyTime = now;

      // Map arrow keys to readable format
      const shortcutKey =
        key === "ArrowLeft"
          ? "←"
          : key === "ArrowRight"
            ? "→"
            : key === "ArrowUp"
              ? "↑"
              : key === "ArrowDown"
                ? "↓"
                : key.toLowerCase();

      // Check if pressed key matches a shortcut
      const matchedShortcut = SHORTCUTS.find((s) => s.key === shortcutKey);
      if (matchedShortcut) {
        e.preventDefault();
        
        if (shortcutKey === "?") {
          setIsOpen((prev) => !prev);
        } else if (shortcutKey === "/") {
          // Focus search input via custom event
          window.dispatchEvent(new CustomEvent("focusSearch"));
          // Also navigate to search page if not there
          if (!window.location.pathname.includes("/search")) {
            router.push("/search");
          }
        } else {
          executeShortcut(shortcutKey);
        }
      }

      // Escape to close dialog
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    // Show hint after 5 seconds on first visit
    const hintTimer = setTimeout(() => {
      const hasSeenHint = localStorage.getItem("facelove-seen-shortcut-hint");
      if (!hasSeenHint) {
        setShowHint(true);
        localStorage.setItem("facelove-seen-shortcut-hint", "true");
      }
    }, 10000);

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(hintTimer);
    };
  }, [executeShortcut, router]);

  return (
    <>
      {/* Keyboard Shortcuts Hint Toast */}
      {showHint && (
        <div className="fixed bottom-24 right-6 z-50 animate-slide-up-fade">
          <div className="bg-card border shadow-lg rounded-xl p-4 max-w-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 shrink-0">
                <Keyboard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground mb-1">
                  Atalhos de Teclado
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  Pressione <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10px]">?</kbd> para ver todos os atalhos
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHint(false)}
                  className="h-7 text-xs"
                >
                  Entendi
                </Button>
              </div>
              <button
                onClick={() => setShowHint(false)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-purple-500" />
              Atalhos de Teclado
            </DialogTitle>
            <DialogDescription>
              Use these shortcuts to navigate faster. Press{" "}
              <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">
                Esc
              </kbd>{" "}
              to close.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            {SHORTCUTS.map((shortcut) => (
              <div
                key={shortcut.key}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-background border group-hover:border-purple-300 dark:group-hover:border-purple-700 transition-colors shrink-0">
                  <shortcut.icon className="w-4 h-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {shortcut.label}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {shortcut.description}
                  </p>
                </div>
                <kbd className="px-2 py-1 rounded-md bg-background border font-mono text-xs font-semibold shrink-0 min-w-[28px] text-center">
                  {shortcut.key}
                </kbd>
              </div>
            ))}
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-purple-100 dark:border-purple-900/30">
            <p className="text-sm font-medium text-foreground mb-1">💡 Dicas</p>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Os atalhos funcionam em qualquer página</li>
              <li>• Pressione <kbd className="px-1 py-0.5 rounded bg-white/60 font-mono">?</kbd> a qualquer momento para abrir este painel</li>
              <li>• Use <kbd className="px-1 py-0.5 rounded bg-white/60 font-mono">/</kbd> para focar rapidamente na busca</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Floating button to trigger shortcuts help
export function KeyboardShortcutButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 left-6 z-40 p-3 rounded-full bg-muted/80 backdrop-blur-sm border shadow-sm hover:bg-muted transition-all hover:scale-105 group"
      aria-label="Mostrar atalhos de teclado"
      title="Atalhos de teclado (?)"
    >
      <Keyboard className="w-4 h-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
    </button>
  );
}
