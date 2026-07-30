import { Skeleton } from "@/components/ui/skeleton";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function GenreLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section Skeleton */}
        <section className="bg-gradient-to-br from-amber-500/10 via-rose-500/5 to-emerald-500/10 border-b">
          <div className="container mx-auto px-4 py-12 md:py-16">
            {/* Breadcrumb skeleton */}
            <div className="mb-6 animate-pulse">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Skeleton className="h-4 w-10" />
                <span>/</span>
                <Skeleton className="h-4 w-14" />
                <span>/</span>
                <Skeleton className="h-4 w-24" />
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-3 mb-4">
                  {/* Icon skeleton */}
                  <Skeleton className="w-14 h-14 rounded-xl" />
                  <div>
                    <Skeleton className="h-5 w-14 mb-1 rounded-full" />
                    <Skeleton className="h-9 w-48" />
                  </div>
                </div>

                {/* Description skeleton */}
                <Skeleton className="h-6 w-full max-w-lg mb-3" />
                <Skeleton className="h-6 w-5/6 max-w-md mb-4" />

                {/* Stats skeleton */}
                <div className="flex items-center gap-4">
                  <Skeleton className="h-5 w-28" />
                </div>
              </div>

              {/* Button skeleton */}
              <Skeleton className="h-10 w-32 rounded-md" />
            </div>
          </div>
        </section>

        {/* Controls bar skeleton */}
        <section className="py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b">
              <Skeleton className="h-5 w-64" />
              <div className="flex gap-3">
                <Skeleton className="h-9 w-40 rounded-md" />
                <Skeleton className="h-9 w-32 rounded-md" />
              </div>
            </div>

            {/* Stories grid skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-card rounded-xl border p-6 h-full space-y-4">
                    {/* Badge */}
                    <Skeleton className="h-5 w-16 rounded" />
                    {/* Title lines */}
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    {/* Description lines */}
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-4/6" />
                    {/* Theme badges */}
                    <div className="flex gap-2 pt-2">
                      <Skeleton className="h-6 w-16 rounded-full" />
                      <Skeleton className="h-6 w-20 rounded-full" />
                      <Skeleton className="h-6 w-14 rounded-full" />
                    </div>
                    {/* Footer spacer */}
                    <div className="pt-4 mt-auto border-t space-y-3">
                      <div className="flex justify-between">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-14" />
                      </div>
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
