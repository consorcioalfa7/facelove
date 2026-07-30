import { db } from "@/lib/db";
import { StoryCard } from "@/components/story-card";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  SlidersHorizontal,
  Grid3X3,
  ArrowUpDown,
  TrendingUp,
  Clock,
  Eye,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Link from "next/link";

// Server component for stories listing
async function getStories(page: number = 1, limit: number = 20, sortBy: string = "date") {
  const skip = (page - 1) * limit;
  
  const orderBy: Record<string, "asc" | "desc"> = {};
  switch (sortBy) {
    case "rating":
      orderBy.rating = "desc";
      break;
    case "reads":
      orderBy.readsCount = "desc";
      break;
    case "title":
      // For title sorting, we'll need to do it differently
      break;
    case "oldest":
      orderBy.publishedAt = "asc";
      break;
    default:
      orderBy.publishedAt = "desc";
  }

  const [stories, total] = await Promise.all([
    db.story.findMany({
      where: { publishedAt: { not: null } },
      include: {
        author: true,
        genre: true,
        themes: {
          include: { theme: true },
          take: 3,
        },
      },
      orderBy: Object.keys(orderBy).length > 0 ? orderBy : { publishedAt: "desc" },
      take: limit,
      skip,
    }),
    db.story.count({ where: { publishedAt: { not: null } } }),
  ]);

  return {
    stories: stories.map((story) => ({
      ...story,
      themes: story.themes.map((st) => st.theme),
      publishedAt: story.publishedAt ? new Date(story.publishedAt) : null,
    })),
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export const metadata = {
  title: "Histórias | FaceLove",
  description: "Explore todas as histórias disponíveis no FaceLove",
};

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sortBy?: string; limit?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1", 10) || 1;
  const limit = parseInt(params.limit || "20", 10) || 20;
  const sortBy = params.sortBy || "date";

  const data = await getStories(page, limit, sortBy);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header is in layout */}
      
      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-fuchsia-500/10 border-b">
          <div className="container mx-auto px-4 py-10 md:py-14">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                  Todas as Histórias
                </h1>
                <p className="text-muted-foreground">
                  Explore nossa coleção completa de {data.total.toLocaleString()} histórias
                </p>
              </div>
              
              {/* Sort controls */}
              <div className="flex items-center gap-3">
                <Select defaultValue={sortBy}>
                  <SelectTrigger className="w-[160px]" size="sm">
                    <SlidersHorizontal className="w-4 h-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Ordenar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Mais recentes</SelectItem>
                    <SelectItem value="oldest">Mais antigas</SelectItem>
                    <SelectItem value="rating">Melhor avaliadas</SelectItem>
                    <SelectItem value="reads">Mais lidas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </section>

        {/* Stats bar */}
        <section className="py-6 border-b bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="flex items-center justify-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                <span className="font-semibold">{data.total.toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">histórias</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Eye className="w-5 h-5 text-pink-600" />
                <span className="font-semibold">{(data.total * 1250).toLocaleString()}</span>
                <span className="text-sm text-muted-foreground">leituras</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <TrendingUp className="w-5 h-5 text-fuchsia-600" />
                <span className="font-semibold">4.7</span>
                <span className="text-sm text-muted-foreground">avg rating</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stories grid */}
        <section className="py-10">
          <div className="container mx-auto px-4">
            {data.stories.length > 0 ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {data.stories.map((story, index) => (
                    <div
                      key={story.id}
                      className="animate-fade-in-up"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <StoryCard story={story} />
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {data.totalPages > 1 && (
                  <div className="mt-12 pt-8 border-t flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        {page > 1 && (
                          <PaginationItem>
                            <PaginationLink href={`/stories?page=${page - 1}&sortBy=${sortBy}`}>
                              <PaginationPrevious />
                            </PaginationLink>
                          </PaginationItem>
                        )}
                        
                        {Array.from({ length: Math.min(data.totalPages, 5) }, (_, i) => {
                          let pageNum = i + 1;
                          if (data.totalPages > 5 && page > 3) {
                            pageNum = page + i - 2;
                            if (pageNum > data.totalPages) pageNum = data.totalPages - 4 + i;
                          }
                          
                          if (pageNum >= 1 && pageNum <= data.totalPages) {
                            if (i === 2 && data.totalPages > 5 && page < data.totalPages - 2) {
                              return (
                                <PaginationEllipsis key="ellipsis" />
                              );
                            }
                            return (
                              <PaginationItem key={pageNum}>
                                <PaginationLink
                                  href={`/stories?page=${pageNum}&sortBy=${sortBy}`}
                                  isActive={pageNum === page}
                                  className={pageNum === page ? "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400" : ""}
                                >
                                  {pageNum}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                          return null;
                        })}

                        {page < data.totalPages && (
                          <PaginationItem>
                            <PaginationLink href={`/stories?page=${page + 1}&sortBy=${sortBy}`}>
                              <PaginationNext />
                            </PaginationLink>
                          </PaginationItem>
                        )}
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              /* Empty state */
              <div className="text-center py-20 animate-fade-in">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-100 to-pink-100 mb-6">
                  <BookOpen className="w-12 h-12 text-purple-400" />
                </div>
                <h2 className="text-2xl font-bold mb-3">Nenhuma história encontrada</h2>
                <p className="text-muted-foreground max-w-md mx-auto mb-8">
                  Volte em breve para novas histórias, ou explore nossos gêneros e temas.
                </p>
                <div className="flex gap-4 justify-center">
                  <Link href="/genres">
                    <Button variant="outline" className="gap-2">
                      Explorar Gêneros
                    </Button>
                  </Link>
                  <Link href="/themes">
                    <Button variant="outline" className="gap-2">
                      Explorar Temas
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer is in layout */}
    </div>
  );
}
