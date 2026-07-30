"use client";

import { useState, useEffect, useCallback } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Type,
  Minus,
  Plus,
  RotateCcw,
} from "lucide-react";

type FontSize = "small" | "medium" | "large";

interface ReadingControlsProps {
  contentId: string;
}

const fontSizeMap: Record<FontSize, string> = {
  small: "text-base",
  medium: "text-lg",
  large: "text-xl",
};

const lineHeightMap: Record<FontSize, string> = {
  small: "leading-7",
  medium: "leading-8",
  large: "leading-9",
};

export function ReadingControls({ contentId }: ReadingControlsProps) {
  const [progress, setProgress] = useState(0);
  // Use lazy initializer to read from localStorage on mount (avoids useEffect + setState)
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    if (typeof window === "undefined") return "medium";
    const saved = localStorage.getItem("story-font-size") as FontSize | null;
    return saved && fontSizeMap[saved] ? saved : "medium";
  });
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Calculate scroll progress
  const handleScroll = useCallback(() => {
    const element = document.getElementById(contentId);
    if (element) {
      const windowHeight = window.innerHeight;
      const documentHeight = element.scrollHeight;
      const scrollTop = window.scrollY - element.offsetTop;
      
      if (scrollTop <= 0) {
        setProgress(0);
        setShowScrollTop(false);
      } else if (scrollTop >= documentHeight - windowHeight) {
        setProgress(100);
        setShowScrollTop(true);
      } else {
        setProgress(Math.round((scrollTop / (documentHeight - windowHeight)) * 100));
        setShowScrollTop(scrollTop > 500);
      }
    }
  }, [contentId]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Font size preference is now loaded via lazy initializer in useState

  // Save font size preference
  const changeFontSize = (size: FontSize) => {
    setFontSize(size);
    localStorage.setItem("story-font-size", size);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetToDefault = () => {
    setFontSize("medium");
    localStorage.setItem("story-font-size", "medium");
  };

  // Apply font size styles to content
  useEffect(() => {
    const element = document.getElementById(contentId);
    if (element) {
      Object.values(fontSizeMap).forEach((cls) => element.classList.remove(cls));
      Object.values(lineHeightMap).forEach((cls) => element.classList.remove(cls));
      element.classList.add(fontSizeMap[fontSize]);
      element.classList.add(lineHeightMap[fontSize]);
    }
  }, [contentId, fontSize]);

  return (
    <>
      {/* Progress Bar */}
      <div className="fixed top-[64px] left-0 right-0 z-40 bg-background/80 backdrop-blur-sm border-b">
        <div className="relative">
          <Progress 
            value={progress} 
            className="h-1 rounded-none [&>div]:bg-gradient-to-r [&>div]:from-purple-600 [&>div]:to-pink-500"
          />
          <TooltipProvider>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <span className="text-xs text-muted-foreground mr-1 hidden sm:inline">
                {progress}%
              </span>
              
              {/* Font Size Controls */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-purple-600"
                    onClick={() => {
                      const sizes: FontSize[] = ["small", "medium", "large"];
                      const currentIndex = sizes.indexOf(fontSize);
                      const prevSize = currentIndex > 0 ? sizes[currentIndex - 1] : fontSize;
                      changeFontSize(prevSize);
                    }}
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Diminuir fonte</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 ${fontSize === "small" ? "text-purple-600" : "text-muted-foreground hover:text-purple-600"}`}
                    onClick={() => changeFontSize("small")}
                  >
                    <Type className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Fonte Pequena</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 ${fontSize === "medium" ? "text-purple-600" : "text-muted-foreground hover:text-purple-600"}`}
                    onClick={() => changeFontSize("medium")}
                  >
                    <Type className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Fonte Média</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-7 w-7 ${fontSize === "large" ? "text-purple-600" : "text-muted-foreground hover:text-purple-600"}`}
                    onClick={() => changeFontSize("large")}
                  >
                    <Type className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Fonte Grande</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-purple-600"
                    onClick={() => {
                      const sizes: FontSize[] = ["small", "medium", "large"];
                      const currentIndex = sizes.indexOf(fontSize);
                      const nextSize = currentIndex < sizes.length - 1 ? sizes[currentIndex + 1] : fontSize;
                      changeFontSize(nextSize);
                    }}
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Aumentar fonte</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-purple-600"
                    onClick={resetToDefault}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Resetar tamanho</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className="fixed bottom-8 right-8 z-50 rounded-full h-12 w-12 shadow-lg bg-gradient-to-br from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 transition-all duration-300 animate-fade-in"
                onClick={scrollToTop}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="animate-bounce"
                >
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Voltar ao topo</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </>
  );
}

// Export utility functions for use in server component context
export function getReadingStyles(fontSize?: FontSize): string {
  const size = fontSize || "medium";
  return `${fontSizeMap[size]} ${lineHeightMap[size]}`;
}
