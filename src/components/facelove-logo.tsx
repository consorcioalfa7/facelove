import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface FaceLoveLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showText?: boolean;
  className?: string;
}

export function FaceLoveLogo({ 
  size = "md", 
  showText = true, 
  className 
}: FaceLoveLogoProps) {
  const sizes = {
    sm: { logo: "w-8 h-8", text: "text-lg" },
    md: { logo: "w-10 h-10", text: "text-xl" },
    lg: { logo: "w-12 h-12", text: "text-2xl" },
    xl: { logo: "w-16 h-16", text: "text-3xl" },
  };

  const s = sizes[size];

  return (
    <div className={cn("flex items-center gap-2.5 group", className)}>
      <div className={cn(
        "relative flex items-center justify-center overflow-hidden rounded-xl",
        s.logo,
        "shadow-lg shadow-purple-500/25",
        "group-hover:shadow-purple-500/40 group-hover:scale-105",
        "transition-all duration-300"
      )}>
        <Image
          src="/logo-facelove.png"
          alt="FaceLove Logo"
          fill
          className="object-contain p-0.5"
          priority
        />
      </div>

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

export function FaceLoveIcon({ size = "md", className }: Omit<FaceLoveLogoProps, 'showText'>) {
  return <FaceLoveLogo size={size} showText={false} className={className} />;
}
