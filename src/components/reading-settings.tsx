"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Type,
  Sun,
  Moon,
  Monitor,
  RotateCcw,
  BookOpen,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Storage key
const READING_SETTINGS_KEY = "facelove-reading-settings";

export interface ReadingSettings {
  fontSize: number; // 14-24px default 16
  lineHeight: number; // 1.4-2.0 default 1.7
  textAlign: "left" | "center" | "justify";
  theme: "light" | "dark" | "system";
}

const DEFAULT_SETTINGS: ReadingSettings = {
  fontSize: 16,
  lineHeight: 1.7,
  textAlign: "left",
  theme: "system",
};

/**
 * Get current reading settings
 */
export function getReadingSettings(): ReadingSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const stored = localStorage.getItem(READING_SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    
    return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update reading settings
 */
export function updateReadingSettings(updates: Partial<ReadingSettings>): ReadingSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const current = getReadingSettings();
    const updated = { ...current, ...updates };
    localStorage.setItem(READING_SETTINGS_KEY, JSON.stringify(updated));
    
    window.dispatchEvent(new CustomEvent("readingSettingsChanged", { detail: updated }));
    return updated;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * Apply reading settings to document
 */
export function applyReadingSettings(settings?: ReadingSettings): void {
  if (typeof window === "undefined") return;

  const s = settings || getReadingSettings();
  
  // Apply font size to story content
  const root = document.documentElement;
  root.style.setProperty("--story-font-size", `${s.fontSize}px`);
  root.style.setProperty("--story-line-height", s.lineHeight.toString());
  root.style.setProperty("--story-text-align", s.textAlign);
}

interface ReadingSettingsProps {
  /** Show compact version (icon only) */
  compact?: boolean;
  /** Additional class names */
  className?: string;
  /** Settings changed callback */
  onSettingsChange?: (settings: ReadingSettings) => void;
}

export function ReadingSettings({
  compact = false,
  className,
  onSettingsChange,
}: ReadingSettingsProps) {
  // Use lazy initializer to load settings on mount (avoids setState in effect)
  const [settings, setSettings] = useState<ReadingSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    return getReadingSettings();
  });
  const [isOpen, setIsOpen] = useState(false);

  // Apply settings and listen for changes
  useEffect(() => {
    // Apply settings to DOM when component mounts
    applyReadingSettings(settings);

    // Subscribe to external changes
    const handleChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as ReadingSettings;
      setSettings(detail);
      onSettingsChange?.(detail);
    };

    window.addEventListener("readingSettingsChanged", handleChange);
    return () => window.removeEventListener("readingSettingsChanged", handleChange);
  }, [settings, onSettingsChange]);

  // Update setting
  const updateSetting = <K extends keyof ReadingSettings>(
    key: K,
    value: ReadingSettings[K]
  ) => {
    const updated = updateReadingSettings({ [key]: value });
    setSettings(updated);
    applyReadingSettings(updated);
    onSettingsChange?.(updated);
  };

  // Reset to defaults
  const resetToDefaults = () => {
    const defaults = updateReadingSettings(DEFAULT_SETTINGS);
    setSettings(defaults);
    applyReadingSettings(defaults);
    onSettingsChange?.(defaults);
  };

  if (compact) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-9 w-9", className)}
            title="Configurações de leitura"
          >
            <Type className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-500" />
            Configurações de Leitura
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Font Size */}
          <div className="px-3 py-2 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Type className="w-3.5 h-3.5" />
                Tamanho da Fonte
              </span>
              <span className="text-muted-foreground font-mono text-xs">
                {settings.fontSize}px
              </span>
            </div>
            <Slider
              value={[settings.fontSize]}
              min={14}
              max={24}
              step={1}
              onValueChange={([value]) => updateSetting("fontSize", value)}
            />
          </div>

          {/* Line Height */}
          <div className="px-3 py-2 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" />
                Altura da Linha
              </span>
              <span className="text-muted-foreground font-mono text-xs">
                {settings.lineHeight.toFixed(1)}
              </span>
            </div>
            <Slider
              value={[settings.lineHeight * 10]}
              min={14}
              max={20}
              step={1}
              onValueChange={([value]) =>
                updateSetting("lineHeight", value / 10)
              }
            />
          </div>

          <DropdownMenuSeparator />

          {/* Text Alignment */}
          <div className="px-3 py-1">
            <p className="text-xs text-muted-foreground mb-2">Alinhamento</p>
            <div className="flex gap-1">
              {[
                { value: "left" as const, icon: AlignLeft, label: "Esquerda" },
                { value: "center" as const, icon: AlignCenter, label: "Centro" },
                { value: "justify" as const, icon: AlignRight, label: "Justificar" },
              ].map(({ value, icon: Icon }) => (
                <Button
                  key={value}
                  variant={settings.textAlign === value ? "secondary" : "ghost"}
                  size="sm"
                  className="flex-1 h-8"
                  onClick={() => updateSetting("textAlign", value)}
                  title={label}
                >
                  <Icon className="w-3.5 h-3.5" />
                </Button>
              ))}
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Reset */}
          <DropdownMenuItem
            onClick={resetToDefaults}
            className="text-muted-foreground focus:text-destructive"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Restaurar Padrões
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Full settings panel (for sidebar or dedicated section)
  return (
    <div className={cn("rounded-xl border bg-card p-5 space-y-5", className)}>
      <div className="flex items-center gap-2 font-semibold text-sm">
        <Type className="w-4 h-4 text-purple-500" />
        Configurações de Leitura
      </div>

      {/* Font Size Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Tamanho da Fonte</span>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted">
            {settings.fontSize}px
          </span>
        </div>
        <Slider
          value={[settings.fontSize]}
          min={14}
          max={24}
          step={1}
          onValueChange={([value]) => updateSetting("fontSize", value)}
          className="[&>span]:bg-purple-500"
        />
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Aa</span>
          <span style={{ fontSize: settings.fontSize + "px" }}>Amostra</span>
          <span className="text-lg">Aa</span>
        </div>
      </div>

      {/* Line Height Control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span>Altura da Linha</span>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-muted">
            {settings.lineHeight.toFixed(1)}
          </span>
        </div>
        <Slider
          value={[settings.lineHeight * 10]}
          min={14}
          max={20}
          step={1}
          onValueChange={([value]) => updateSetting("lineHeight", value / 10)}
          className="[&>span]:bg-pink-500"
        />
      </div>

      {/* Text Alignment */}
      <div className="space-y-2">
        <span className="text-sm">Alinhamento do Texto</span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: "left" as const, icon: AlignLeft, label: "Esquerda" },
            { value: "center" as const, icon: AlignCenter, label: "Centro" },
            { value: "justify" as const, icon: AlignRight, label: "Justificar" },
          ].map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              variant={settings.textAlign === value ? "default" : "outline"}
              size="sm"
              className="gap-2"
              onClick={() => updateSetting("textAlign", value)}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="sr-only sm:not-sr-only sm:inline">{label}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={resetToDefaults}
        className="w-full gap-2"
      >
        <RotateCcw className="w-4 h-4" />
        Restaurar Padrões
      </Button>
    </div>
  );
}

// Hook for consuming settings in components
export function useReadingSettings() {
  // Use lazy initializer to avoid setState in effect
  const [settings, setSettings] = useState<ReadingSettings>(() => {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    return getReadingSettings();
  });

  useEffect(() => {
    applyReadingSettings(settings);

    const handleChange = (e: Event) => {
      const detail = (e as CustomEvent).detail as ReadingSettings;
      setSettings(detail);
    };

    window.addEventListener("readingSettingsChanged", handleChange);
    return () => window.removeEventListener("readingSettingsChanged", handleChange);
  }, [settings]);

  return settings;
}
