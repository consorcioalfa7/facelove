"use client";

import { useState, useCallback } from "react";
import {
  Share2,
  Check,
  Link as LinkIcon,
  Twitter,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toastStoryShared } from "@/lib/notifications";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ShareButtonProps {
  /** URL to share */
  url?: string;
  /** Title of the content */
  title: string;
  /** Optional additional class names */
  className?: string;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show text label */
  showLabel?: boolean;
}

export function ShareButton({
  url,
  title,
  className,
  size = "md",
  showLabel = false,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Get current page URL if not provided
  const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  const sizeConfig = {
    sm: { button: "h-7 w-7", icon: "w-3.5 h-3.5" },
    md: { button: "h-9 w-9", icon: "w-4 h-4" },
    lg: { button: "h-11 w-11", icon: "w-5 h-5" },
  };

  const config = sizeConfig[size];

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toastStoryShared(title);
      
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      
      setCopied(true);
      toastStoryShared(title);
      
      setTimeout(() => {
        setCopied(false);
        setIsOpen(false);
      }, 2000);
    }
  }, [shareUrl, title]);

  const shareToTwitter = () => {
    const text = `Lendo "${title}" no FaceLove! 📚✨`;
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterUrl, "_blank", "width=550,height=420");
  };

  const shareToWhatsApp = () => {
    const text = `Confira "${title}" no FaceLove! ${shareUrl}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <TooltipProvider>
      <div className={cn("relative", className)}>
        {/* Main button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={cn(
                "inline-flex items-center justify-center rounded-full transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500 focus-visible:ring-offset-2",
                "active:scale-90 hover:scale-105",
                copied
                  ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-muted/80 hover:bg-muted backdrop-blur-sm text-muted-foreground hover:text-purple-600",
                config.button
              )}
              aria-label="Compartilhar"
            >
              {copied ? (
                <Check className={cn(config.icon, "text-green-600")} />
              ) : (
                <Share2 className={config.icon} />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{copied ? "Copiado!" : "Compartilhar"}</p>
          </TooltipContent>
        </Tooltip>

        {/* Dropdown menu */}
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl bg-popover border shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-2">
                <p className="text-xs font-medium text-muted-foreground px-2 py-1.5">
                  Compartilhar história
                </p>

                {/* Copy link */}
                <button
                  onClick={copyToClipboard}
                  className={cn(
                    "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm",
                    "hover:bg-accent transition-colors text-left",
                    copied && "text-green-600"
                  )}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  )}
                  <span>{copied ? "Link Copiado!" : "Copiar link"}</span>
                </button>

                {/* Divider */}
                <div className="my-1 border-t" />

                {/* Social sharing */}
                <button
                  onClick={shareToTwitter}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors text-left"
                >
                  <Twitter className="w-4 h-4 text-[#1DA1F2]" />
                  <span>Compartilhar no X/Twitter</span>
                </button>

                <button
                  onClick={shareToWhatsApp}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors text-left"
                >
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Compartilhar no WhatsApp</span>
                </button>
              </div>

              {/* Arrow */}
              <div className="absolute -top-2 right-4 w-4 h-4 bg-popover border-t border-l rotate-45" />
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
}

// Simple version without dropdown
export function ShareLink({
  url,
  title,
  className,
}: Omit<ShareButtonProps, "size" | "showLabel">) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const shareUrl = url || (typeof window !== "undefined" ? window.location.href : "");
    
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toastStoryShared(title);
      
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className={cn("gap-2", copied && "text-green-600", className)}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          Copiado!
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          {showLabel ? "Compartilhar" : ""}
        </>
      )}
    </Button>
  );
}
