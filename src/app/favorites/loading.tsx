import { Skeleton } from "@/components/ui/skeleton";

export default function FavoritesLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header skeleton */}
      <section className="bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-fuchsia-500/10 border-b">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-12 w-80 max-w-full mb-4" />
          <Skeleton className="h-5 w-96 max-w-full mb-6" />
          <Skeleton className="h-5 w-32" />
        </div>
      </section>

      {/* Content skeleton */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 rounded-xl bg-muted/60 animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
