"use client";

import { useState } from "react";
import { Mail, Sparkles, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface NewsletterProps {
  variant?: "default" | "compact" | "footer";
  className?: string;
}

export function Newsletter({ variant = "default", className }: NewsletterProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic email validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setErrorMessage("Por favor, insira um email válido.");
      return;
    }

    setStatus("loading");

    // Call actual newsletter API
    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus("success");
        setEmail("");
        
        // Reset after 5 seconds
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Erro ao inscrever. Tente novamente.");
      }
    } catch (error) {
      console.error("[Newsletter] Error:", error);
     setStatus("error");
      setErrorMessage("Algo deu errado. Tente novamente.");
    }
  };

  // Footer variant - compact horizontal layout
  if (variant === "footer") {
    return (
      <div className={cn("w-full", className)}>
        {status === "success" ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
            <CheckCircle className="w-4 h-4" />
            <span>Inscrito com sucesso!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor email..."
                className="pl-9 h-9 text-sm"
                disabled={status === "loading"}
              />
            </div>
            <Button
              type="submit"
              size="sm"
              disabled={status === "loading"}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4"
            >
              {status === "loading" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Inscrever"
              )}
            </Button>
          </form>
        )}
        {status === "error" && (
          <p className="text-xs text-destructive mt-1">{errorMessage}</p>
        )}
      </div>
    );
  }

  // Compact variant - for sidebars or small spaces
  if (variant === "compact") {
    return (
      <div className={cn("p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-border/50", className)}>
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
            <Mail className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm">Newsletter</span>
        </div>
        
        {status === "success" ? (
          <div className="text-center py-2">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm font-medium">Inscrito! ✓</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-2">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu email"
              className="h-9 text-sm"
              disabled={status === "loading"}
            />
            <Button
              type="submit"
              size="sm"
              disabled={status === "loading"}
              className={cn(
                "w-full",
                "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600",
                "text-white"
              )}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Inscrevendo...
                </>
              ) : (
                "Inscrever-se"
              )}
            </Button>
          </form>
        )}
      </div>
    );
  }

  // Default variant - full featured card for main content areas
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-pink-600 p-8 md:p-10",
        className
      )}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "32px 32px",
          }}
        />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-black/10 rounded-full blur-xl translate-y-1/2 -translate-x-1/2" />

      <div className="relative z-10 max-w-2xl mx-auto text-center text-white">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm mb-6">
          <Sparkles className="w-7 h-7" />
        </div>

        <h2 className="text-2xl md:text-3xl font-bold mb-3">
          Nunca Perca Uma História
        </h2>
        <p className="text-white/80 mb-6 leading-relaxed">
          Receba as melhores histórias diretamente na sua caixa de entrada. 
          Novidades, recomendações exclusivas e muito mais!
        </p>

        {status === "success" ? (
          <div className="py-6 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4">
              <CheckCircle className="w-8 h-8" />
            </div>
            <p className="text-xl font-semibold mb-1">Bem-vindo ao FaceLove!</p>
            <p className="text-white/70">
              Verifique sua caixa de entrada para confirmar a inscrição.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Seu melhor email..."
                className={cn(
                  "pl-12 pr-4 py-6 rounded-xl bg-white/95 backdrop-blur-sm",
                  "border-0 text-foreground placeholder:text-muted-foreground",
                  "focus:ring-2 focus:ring-white/50 focus:bg-white transition-all"
                )}
                disabled={status === "loading"}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={status === "loading"}
              className={cn(
                "px-8 py-6 rounded-xl font-semibold",
                "bg-white text-purple-600 hover:bg-gray-100 shadow-lg",
                "transition-all duration-300 hover:-translate-y-0.5"
              )}
            >
              {status === "loading" ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Inscrevendo...
                </>
              ) : (
                "Inscrever-se"
              )}
            </Button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-3 text-sm text-red-200">{errorMessage}</p>
        )}

        <p className="text-xs text-white/50 mt-4">
          Ao se inscrever, você concorda com nossa{" "}
          <a href="/privacy" className="underline hover:text-white transition-colors">
            Política de Privacidade
          </a>
        </p>
      </div>
    </div>
  );
}
