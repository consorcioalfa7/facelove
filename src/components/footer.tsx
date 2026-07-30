import Link from "next/link";
import { BookOpen, Heart, Github, Twitter, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const footerLinks = {
  explore: [
    { name: "All Genres", href: "/genres" },
    { name: "Popular Themes", href: "/themes" },
    { name: "Top Authors", href: "/authors" },
    { name: "Latest Stories", href: "/latest" },
  ],
  community: [
    { name: "Submit a Story", href: "/submit" },
    { name: "Writing Tips", href: "/tips" },
    { name: "Community Guidelines", href: "/guidelines" },
    { name: "FAQ", href: "/faq" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Content Policy", href: "/content-policy" },
    { name: "DMCA", href: "/dmca" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-rose-500 shadow-lg">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Story<span className="gradient-text">Vault</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
              Discover a world of captivating stories across every genre. Your
              next favorite read is just a click away.
            </p>
            
            {/* Social links */}
            <div className="flex items-center gap-3">
              <Link
                href="#"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted hover:bg-amber-500/10 text-muted-foreground hover:text-amber-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted hover:bg-rose-500/10 text-muted-foreground hover:text-rose-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </Link>
              <Link
                href="#"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-600 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Explore section */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Explore
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.explore.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community section */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Community
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal section */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              Legal
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} StoryVault. All rights reserved.
          </p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with{" "}
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />{" "}
            for story lovers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
}
