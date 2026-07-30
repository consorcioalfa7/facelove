import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function ThemesLoading() {
  return (
    <div className="min-h-screen">
      {/* Page header skeleton */}
      <section className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-fuchsia-500/10 border-b">
        <div className="container mx-auto px-4 py-10 md:py-14">
          <Skeleton className="h-10 w-48 mb-3" />
          <Skeleton className="h-5 w-80 max-w-full" />
        </div>
      </section>

      {/* Popular themes skeleton */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <Skeleton className="h-7 w-40 mb-6" />
          <div className="flex flex-wrap gap-3 max-w-4xl">
            {[...Array(20)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-24 rounded-full" />
            ))}
          </div>
        </div>
      </section>

      {/* All themes grid skeleton */}
      <section className="py-10 border-t bg-muted/30">
        <div className="container mx-auto px-4">
          <Skeleton className="h-7 w-32 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[...Array(30)].map((_, i) => (
              <Card key={i} className="animate-pulse p-4 text-center">
                <Skeleton className="h-5 w-20 mx-auto mb-2" />
                <Skeleton className="h-4 w-12 mx-auto" />
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
