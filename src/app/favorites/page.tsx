import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { FavoritesContent } from "./favorites-client";
import { ReadingStatistics } from "@/components/reading-statistics";
import { Bookshelf } from "@/components/bookshelf";
import { SearchHistory } from "@/components/search-history";
import { Heart, BookOpen, BarChart3, BookMarked, Clock, Layers } from "lucide-react";

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

        {/* Dashboard Grid - Favorites + Stats */}
        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* Reading Lists / Bookshelf Section */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <BookMarked className="w-6 h-6 text-purple-500" />
                Minha Estante de Leitura
              </h2>
            </div>
            <Bookshelf viewMode="grid" />
          </section>

          {/* Search History Section */}
          <section className="mb-12">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Clock className="w-6 h-6 text-pink-500" />
              Histórico de Busca
            </h2>
            <SearchHistory showPopular={true} maxItems={8} />
          </section>

          {/* Favorites Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Main Content - Favorites (2/3 width) */}
            <div className="lg:col-span-2">
              <FavoritesContent />
            </div>

            {/* Sidebar - Statistics (1/3 width) */}
            <div className="space-y-6">
              {/* Reading Statistics Card */}
              <ReadingStatistics showDetails={true} className="sticky top-24" />
              
              {/* Quick Links Card */}
              <div className="rounded-xl border bg-card p-5 space-y-4">
                <div className="flex items-center gap-2 text-sm font-semibold">
                  <BookMarked className="w-4 h-4 text-purple-500" />
                  Acesso Rápido
                </div>
                <div className="space-y-2">
                  <a href="/stories" className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-muted transition-colors group">
                    <BookOpen className="w-4 h-4 text-muted-foreground group-hover:text-purple-500 transition-colors" />
                    <span className="text-sm group-hover:text-purple-600 dark:group-hover:text-purple-400">Todas as Histórias</span>
                  </a>
                  <a href="/genres" className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-muted transition-colors group">
                    <Heart className="w-4 h-4 text-muted-foreground group-hover:text-pink-500 transition-colors" />
                    <span className="text-sm group-hover:text-pink-600 dark:group-hover:text-pink-400">Explorar Gêneros</span>
                  </a>
                  <a href="/themes" className="flex items-center gap-2.5 p-2.5 rounded-lg hover:bg-muted transition-colors group">
                    <BarChart3 className="w-4 h-4 text-muted-foreground group-hover:text-fuchsia-500 transition-colors" />
                    <span className="text-sm group-hover:text-fuchsia-600 dark:group-hover:text-fuchsia-400">Temas Populares</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
