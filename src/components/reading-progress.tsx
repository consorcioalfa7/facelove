"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ReadingProgressProps {
  containerRef?: React.RefObject<HTMLElement | null>;
  color?: "purple" | "pink" | "gradient";
  height?: "thin" | "medium" | "thick";
  showPercentage?: boolean;
}

export function ReadingProgress({
  containerRef,
  color = "gradient",
  height = "thin",
  showPercentage = false,
}: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateProgress = () => {
      const container = containerRef?.current || document.documentElement;
      const scrollTop = window.scrollY;
      const scrollHeight = container.scrollHeight - window.innerHeight;
      
      if (scrollHeight > 0) {
        const newProgress = Math.min((scrollTop / scrollHeight) * 100, 100);
        setProgress(newProgress);
        setIsVisible(newProgress > 2 && newProgress < 98);
      }
    };

    // Use scroll event with passive listener for performance
    window.addEventListener("scroll", updateProgress, { passive: true });
    
    // Initial calculation
    updateProgress();

    return () => window.removeEventListener("scroll", updateProgress);
  }, [containerRef]);

  const heightClasses = {
    thin: "h-1",
    medium: "h-1.5",
    thick: "h-2.5",
  };

  const colorClasses = {
    purple: "bg-purple-500",
    pink: "bg-pink-500",
    gradient: "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500",
  };

  return (
    <div
      className={cn(
        "fixed top-16 left-0 right-0 z-40 transition-opacity duration-300",
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      {/* Progress bar */}
      <div className="w-full bg-border/30">
        <div
          className={cn(
            heightClasses[color],
            colorClasses[color],
            "transition-all duration-150 ease-out relative"
          )}
          style={{ width: `${progress}%` }}
        >
          {/* Shimmer effect */}
          <div 
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"
            style={{ animationDuration: '2s' }}
          />
        </div>
      </div>

      {/* Percentage indicator */}
      {showPercentage && (
        <div className="absolute right-4 -top-8">
          <span className="text-xs font-medium text-muted-foreground bg-background/90 backdrop-blur-sm px-2 py-1 rounded-full border">
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
}
