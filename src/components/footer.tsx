"use client";

import Link from "next/link";
import { Heart, Github, Twitter, Mail } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FaceLoveLogo } from "@/components/facelove-logo";
import { Newsletter } from "@/components/newsletter";
import { useI18n } from "@/lib/i18n/I18nProvider";

const footerLinks = {
  explore: [
    { name: "All Genres", href: "/genres", i18nKey: "genres" },
    { name: "Popular Themes", href: "/themes", i18nKey: "themes" },
    { name: "Top Authors", href: "/authors", i18nKey: "authors" },
    { name: "Latest Stories", href: "/latest" },
  ],
  community: [
    { name: "Submit a Story", href: "/submit" },
    { name: "Writing Tips", href: "/tips" },
    { name: "Community Guidelines", href: "/guidelines" },
    { name: "FAQ", href: "/faq" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy", i18nKey: "privacy" },
    { name: "Terms of Service", href: "/terms", i18nKey: "terms" },
    { name: "Content Policy", href: "/content-policy" },
    { name: "DMCA", href: "/dmca" },
  ],
};

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useI18n();

  return (
    <footer className="border-t bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-12">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand section */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 group mb-4">
              <FaceLoveLogo size="md" />
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
              {t('footer.description')}
            </p>
            
            {/* Social links */}
            <div className="flex items-center gap-3">
              <Link
                href="#"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted hover:bg-purple-500/10 text-muted-foreground hover:text-purple-600 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </Link>
              <Link
                href="https://github.com/consorcioalfa7/facelove"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted hover:bg-pink-500/10 text-muted-foreground hover:text-pink-600 transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </Link>
              <Link
                href="mailto:contact@facelove.com"
                className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted hover:bg-fuchsia-500/10 text-muted-foreground hover:text-fuchsia-600 transition-colors"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Explore section */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('footer.explore')}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.explore.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    {t(`nav.${link.i18nKey || link.name.toLowerCase()}`, link.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community section */}
          <div>
            <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">
              {t('footer.community')}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
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
              {t('footer.legal')}
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
                  >
                    {t(`footer.${link.i18nKey || link.name.toLowerCase()}`, link.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="my-8 p-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border border-border/50">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-foreground mb-1">Fique por dentro</h4>
              <p className="text-sm text-muted-foreground">
                Receba novidades e histórias selecionadas diretamente no seu email.
              </p>
            </div>
            <div className="w-full md:w-auto md:min-w-[320px]">
              <Newsletter variant="footer" />
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            {t('footer.copyright', { year: currentYear })}
          </p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Made with{" "}
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse" />{" "}
            by{" "}
            <a 
              href="https://github.com/consorcioalfa7" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium"
            >
              DarkToolsLabs
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
