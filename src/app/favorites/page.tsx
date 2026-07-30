import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FavoritesContent } from "./favorites-client";
import { Heart, BookOpen } from "lucide-react";

export const metadata = {
  title: "Favoritos | FaceLove",
  description: "Suas histórias favoritas no FaceLove",
};

export default function FavoritesPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-fuchsia-500/10 border-b">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 right-1/4 w-96 h-96 bg-pink-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-1/4 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
            {/* Floating hearts decoration */}
            <div className="absolute top-10 left-20 text-pink-200 dark:text-pink-900/30 opacity-40">
              <Heart className="w-8 h-8 fill-current" />
            </div>
            <div className="absolute bottom-20 right-32 text-purple-200 dark:text-purple-900/30 opacity-30">
              <Heart className="w-12 h-12 fill-current" />
            </div>
            <div className="absolute top-1/2 right-16 text-fuchsia-200 dark:text-fuchsia-900/30 opacity-35">
              <Heart className="w-6 h-6 fill-current" />
            </div>
          </div>

          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 text-sm font-medium mb-6">
                <Heart className="w-4 h-4 fill-current" />
                Coleção Pessoal
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Minhos{" "}
                <span className="gradient-text">Favoritos</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-6">
                Aqui estão todas as histórias que você salvou. Sua coleção pessoal de 
                leituras favoritas para acessar a qualquer momento.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                  <span className="font-semibold text-foreground" id="favorites-count">0</span> histórias salvas
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Favorites Content - Client Component for localStorage access */}
        <FavoritesContent />
      </main>

      <Footer />
    </div>
  );
}
