import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function SearchLoading() {
  return (
    <div className="min-h-screen">
      {/* Search header skeleton */}
      <section className="bg-gradient-to-br from-purple-500/10 via-pink-500/5 to-fuchsia-500/10 border-b">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Skeleton className="h-12 w-full max-w-2xl mx-auto rounded-2xl" />
          <p className="text-center mt-4">
            <Skeleton className="h-5 w-48 mx-auto" />
          </p>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          {/* Tabs skeleton */}
          <div className="flex gap-3 mb-8 justify-center">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-24 rounded-lg" />
            ))}
          </div>

          {/* Results grid skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6 pb-6">
                  <Skeleton className="h-5 w-24 mb-2" />
                  <Skeleton className="h-6 w-full mb-2" />
                  <Skeleton className="h-6 w-3/4 mb-4" />
                  <div className="flex gap-2 mb-4">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-5 w-20 rounded-full" />
                  </div>
                  <div className="flex items-center gap-3 pt-4 border-t">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
