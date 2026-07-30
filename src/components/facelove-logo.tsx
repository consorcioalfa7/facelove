import React from "react";
import { cn } from "@/lib/utils";

interface FaceLoveLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

// FaceLove Logo Component
// Based on the reference: Purple hexagonal logo with white "f" and pink heart
export function FaceLoveLogo({ 
  size = "md", 
  showText = true, 
  className 
}: FaceLoveLogoProps) {
  const sizes = {
    sm: { icon: "w-8 h-8", text: "text-lg", heart: "w-3 h-3", letter: "text-sm" },
    md: { icon: "w-10 h-10", text: "text-xl", heart: "w-4 h-4", letter: "text-base" },
    lg: { icon: "w-12 h-12", text: "text-2xl", heart: "w-5 h-5", letter: "text-xl" },
    xl: { icon: "w-16 h-16", text: "text-3xl", heart: "w-6 h-6", letter: "text-2xl" },
  };

  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5 group", className)}>
      {/* Hexagonal Logo with f + heart */}
      <div className={cn(
        "relative flex items-center justify-center",
        s.icon,
        "rounded-2xl",
        // Purple gradient background (matching the reference)
        "bg-gradient-to-br from-violet-500 via-purple-600 to-fuchsia-700",
        // Glow effect
        "shadow-lg shadow-purple-500/30",
        "group-hover:shadow-purple-500/50 group-hover:scale-105",
        "transition-all duration-300"
      )}>
        {/* Hexagonal clip path effect using border-radius */}
        <div className="absolute inset-0 rounded-[1.25rem] bg-gradient-to-br from-violet-400/20 to-transparent" />
        
        {/* White "f" letter */}
        <span className={cn(
          "font-bold text-white relative z-10",
          s.letter,
          "drop-shadow-md"
        )}>
          f
        </span>
        
        {/* Pink Heart */}
        <svg
          className={cn(
            "absolute bottom-0.5 right-0.5 text-pink-300 fill-current z-10",
            s.heart,
            "drop-shadow-sm"
          )}
          viewBox="0 0 24 24"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <span className={cn(
          "font-bold tracking-tight",
          s.text,
          "text-foreground"
        )}>
          Face<span className="gradient-text">Love</span>
        </span>
      )}
    </div>
  );
}

// Simplified version for small spaces
export function FaceLoveIcon({ size = "md", className }: Omit<FaceLoveLogoProps, 'showText'>) {
  return <FaceLoveLogo size={size} showText={false} className={className} />;
}
