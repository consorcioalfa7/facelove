import { db } from "@/lib/db";
import { GenreCard } from "@/components/genre-card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  BookOpen,
  Grid3X3,
  Search,
  Layers,
} from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";

// Fetch genres data
async function getGenres() {
  const genres = await db.genre.findMany({
    orderBy: { sortOrder: "asc" },
  });
  
  const totalStories = await db.story.count({
    where: { publishedAt: { not: null } }
  });

  return { genres, totalStories };
}

export const metadata = {
  title: "Gêneros | FaceLove",
  description: "Explore todos os gêneros de histórias disponíveis no FaceLove. De romance a ficção científica, encontre sua leitura perfeita.",
};

export default async function GenresPage() {
  const { genres, totalStories } = await getGenres();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-fuchsia-500/5 to-pink-500/10 border-b">
          {/* Background decorations */}
          <div className="absolute inset-0 -z-10 overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-pink-500/5 rounded-full blur-3xl" />
          </div>

          <div className="container mx-auto px-4 py-12 md:py-16">
            <div className="max-w-3xl">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-sm font-medium mb-6">
                <Layers className="w-4 h-4" />
                Biblioteca Completa
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Explorar{" "}
                <span className="gradient-text">Gêneros</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-6">
                Descubra nossa coleção de gêneros. Cada categoria oferece uma experiência 
                de leitura única com histórias selecionadas para você.
              </p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <span className="flex items-center gap-2 text-muted-foreground">
                  <BookOpen className="w-5 h-5 text-purple-500" />
                  <span className="font-semibold text-foreground">{genres.length}</span> gênicos
                </span>
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Grid3X3 className="w-5 h-5 text-pink-500" />
                  <span className="font-semibold text-foreground">{totalStories.toLocaleString()}</span> histórias
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Genres Grid */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            {genres.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {genres.map((genre, index) => (
                  <div
                    key={genre.id}
                    className="animate-fade-in-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <GenreCard genre={genre} variant="featured" />
                  </div>
                ))}
              </div>
            ) : (
              /* Empty state */
              <div className="text-center py-20 animate-fade-in">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-6">
                  <Layers className="w-12 h-12 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Nenhum gênero encontrado</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Os gêneros estarão disponíveis em breve. Volte mais tarde!
                </p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 border-t bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl font-bold mb-3">Não sabe por onde começar?</h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-6">
              Explore nossas histórias mais populares ou use a busca para encontrar exatamente o que procura.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/stories">
                <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Ver Histórias Populares
                </div>
              </Link>
              <Link href="/themes">
                <div className="border border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-400 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors inline-flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  Explorar por Tema
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
