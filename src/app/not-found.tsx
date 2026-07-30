import Link from "next/link";
import { Home, Search, ArrowLeft, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FaceLoveLogo } from "@/components/facelove-logo";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-purple-950/20 dark:via-background dark:to-pink-950/20">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative">
        <div className="max-w-lg mx-auto text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <FaceLoveLogo size="lg" />
          </div>

          {/* 404 Illustration */}
          <div className="relative mb-8">
            <div className="text-[12rem] font-bold leading-none gradient-text opacity-20 select-none">
              404
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 flex items-center justify-center">
                  <Heart className="w-12 h-12 text-purple-500 dark:text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Error message */}
          <h1 className="text-3xl font-bold mb-3 text-foreground">
            Página Não Encontrada
          </h1>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto leading-relaxed">
            Ops! Parece que esta história ainda não foi escrita. A página que você 
            está procurando não existe ou foi movida para outro lugar.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/">
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg shadow-purple-500/25"
              >
                <Home className="w-5 h-5" />
                Voltar ao Início
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="outline" size="lg" className="gap-2">
                <Search className="w-5 h-5" />
                Buscar Histórias
              </Button>
            </Link>
          </div>

          {/* Helpful links */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-4">
              Ou explore estas seções populares:
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/genres"
                className="text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              >
                Gêneros
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link
                href="/themes"
                className="text-sm text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 transition-colors"
              >
                Temas
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link
                href="/authors"
                className="text-sm text-fuchsia-600 dark:text-fuchsia-400 hover:text-fuchsia-700 dark:hover:text-fuchsia-300 transition-colors"
              >
                Autores
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link
                href="/stories"
                className="text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
              >
                Histórias
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
