import Link from "next/link";
import { Tags, ArrowLeft, Search } from "lucide-react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";

export default function ThemeNotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="text-center max-w-md animate-fade-in-up">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-6">
            <Tags className="w-10 h-10 text-muted-foreground/50" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold mb-3">Theme Not Found</h1>

          {/* Description */}
          <p className="text-muted-foreground mb-8 leading-relaxed">
            The theme you&apos;re looking for doesn&apos;t exist or may have been
            removed. Let&apos;s get you back on track!
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/themes">
              <Button variant="default" className="gap-2 w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4" />
                Browse All Themes
              </Button>
            </Link>
            <Link href="/search">
              <Button
                variant="outline"
                className="gap-2 w-full sm:w-auto"
              >
                <Search className="w-4 h-4" />
                Search Stories
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
