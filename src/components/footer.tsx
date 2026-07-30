"use client";

import Link from "next/link";
import { Heart, Github, Twitter, Instagram } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FaceLoveLogo } from "@/components/facelove-logo";
import { Newsletter } from "@/components/newsletter";
import { LanguageSelector } from "@/components/language-selector";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

const footerLinks = {
  explore: [
    { name: "Gêneros", href: "/genres", i18nKey: "genres" },
    { name: "Temas", href: "/themes", i18nKey: "themes" },
    { name: "Autores", href: "/authors", i18nKey: "authors" },
    { name: "Histórias recentes", href: "/latest" },
  ],
  community: [
    { name: "Enviar história", href: "/submit" },
    { name: "Diretrizes", href: "/guidelines" },
    { name: "FAQ", href: "/faq" },
    { name: "Suporte", href: "/support" },
  ],
  legal: [
    { name: "Privacidade", href: "/privacy", i18nKey: "privacy" },
    { name: "Termos", href: "/terms", i18nKey: "terms" },
    { name: "Cookies", href: "/cookies" },
    { name: "DMCA", href: "/dmca" },
  ],
};

const socialLinks = [
  {
    icon: Twitter,
    href: "#",
    label: "Twitter / X",
  },
  {
    icon: Github,
    href: "https://github.com/consorcioalfa7/facelove",
    label: "GitHub",
    external: true,
  },
  {
    icon: Instagram,
    href: "#",
    label: "Instagram",
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useI18n();

  return (
    <footer 
      className="mt-auto relative"
      style={{
        background: 'var(--fl-surface)',
        borderTop: '1px solid var(--fl-border-subtle)',
      }}
    >
      {/* Subtle gradient overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(147, 51, 234, 0.03) 100%)',
        }}
      />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand section - spans 4 columns */}
          <div className="lg:col-span-4">
            <Link href="/" className="flex items-center gap-3 group mb-5">
              <FaceLoveLogo size="md" />
            </Link>
            <p 
              className="text-sm leading-relaxed mb-8 max-w-sm"
              style={{ color: 'var(--fl-text-muted)' }}
            >
              {t('footer.description')}
            </p>
            
            {/* Social links */}
            <div className="flex items-center gap-2.5">
              {socialLinks.map((social) => (
                <Link
                  key={social.label}
                  href={social.href}
                  target={social.external ? "_blank" : undefined}
                  rel={social.external ? "noopener noreferrer" : undefined}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg transition-all duration-300",
                    "hover:scale-105 active:scale-95"
                  )}
                  style={{
                    backgroundColor: 'rgba(147, 51, 234, 0.08)',
                    color: 'var(--fl-text-muted)',
                    border: '1px solid transparent',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--fl-surface-elevated)';
                    e.currentTarget.style.color = 'var(--fl-primary)';
                    e.currentTarget.style.borderColor = 'var(--fl-border)';
                    e.currentTarget.style.boxShadow = '0 0 20px var(--fl-glow)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(147, 51, 234, 0.08)';
                    e.currentTarget.style.color = 'var(--fl-text-muted)';
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                  aria-label={social.label}
                >
                  <social.icon className="w-[18px] h-[18px]" />
                </Link>
              ))}
            </div>
          </div>

          {/* Explore section */}
          <div className="lg:col-span-2">
            <h3 
              className="font-semibold mb-5 text-xs uppercase tracking-widest"
              style={{ color: 'var(--fl-text-secondary)' }}
            >
              {t('footer.explore')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200 hover:underline underline-offset-4"
                    style={{ color: 'var(--fl-text-muted)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--fl-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--fl-text-muted)';
                    }}
                  >
                    {t(`nav.${link.i18nKey || link.name.toLowerCase()}`, link.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community section */}
          <div className="lg:col-span-2">
            <h3 
              className="font-semibold mb-5 text-xs uppercase tracking-widest"
              style={{ color: 'var(--fl-text-secondary)' }}
            >
              {t('footer.community')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200 hover:underline underline-offset-4"
                    style={{ color: 'var(--fl-text-muted)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--fl-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--fl-text-muted)';
                    }}
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal section */}
          <div className="lg:col-span-2">
            <h3 
              className="font-semibold mb-5 text-xs uppercase tracking-widest"
              style={{ color: 'var(--fl-text-secondary)' }}
            >
              {t('footer.legal')}
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors duration-200 hover:underline underline-offset-4"
                    style={{ color: 'var(--fl-text-muted)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--fl-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--fl-text-muted)';
                    }}
                  >
                    {t(`footer.${link.i18nKey || link.name.toLowerCase()}`, link.name)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter Section - spans 2 columns on large screens */}
          <div className="lg:col-span-2 lg:pl-4">
            <h3 
              className="font-semibold mb-5 text-xs uppercase tracking-widest"
              style={{ color: 'var(--fl-text-secondary)' }}
            >
              {t('footer.newsletter', 'Newsletter')}
            </h3>
            <p 
              className="text-sm leading-relaxed mb-4"
              style={{ color: 'var(--fl-text-muted)' }}
            >
              Receba novidades e histórias selecionadas.
            </p>
            <Newsletter variant="footer" />
          </div>
        </div>

        {/* Separator */}
        <Separator 
          className="my-10" 
          style={{ 
            backgroundColor: 'var(--fl-border-subtle)',
            opacity: 0.6 
          }} 
        />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-x-4 gap-y-2 text-center sm:text-left">
            <p 
              className="text-sm"
              style={{ color: 'var(--fl-text-muted)' }}
            >
              © {currentYear} FaceLove. {t('footer.rights', 'All rights reserved.')}.
            </p>
            <span 
              className="hidden sm:inline"
              style={{ color: 'var(--fl-border)', opacity: 0.5 }}
            >
              •
            </span>
            <p className="flex items-center gap-1.5 text-sm">
              <span style={{ color: 'var(--fl-text-muted)' }}>
                Made with
              </span>
              <Heart 
                className="w-4 h-4 fill-current animate-pulse" 
                style={{ color: 'var(--fl-primary)' }}
              />
              <span style={{ color: 'var(--fl-text-muted)' }}>
                by{' '}
              </span>
              <a 
                href="https://github.com/consorcioalfa7" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-medium transition-colors duration-200 hover:underline"
                style={{ color: 'var(--fl-text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = 'var(--fl-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = 'var(--fl-text-secondary)';
                }}
              >
                DarkToolsLabs
              </a>
            </p>
          </div>

          {/* Language Selector */}
          <LanguageSelector />
        </div>
      </div>
    </footer>
  );
}
