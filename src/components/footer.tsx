"use client";

import Link from "next/link";
import { 
  Heart, 
  Facebook, 
  Instagram, 
  MessageCircle,
  Send,
  Gamepad2
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { FaceLoveLogoFull } from "@/components/facelove-logo";
import { Newsletter } from "@/components/newsletter";
import { LanguageSelector } from "@/components/language-selector";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { cn } from "@/lib/utils";

// Footer navigation links configuration
const footerLinks = {
  explore: [
    { name: "Gêneros", href: "/genres", i18nKey: "genres" },
    { name: "Temas", href: "/themes", i18nKey: "themes" },
    { name: "Autores", href: "/authors", i18nKey: "authors" },
    { name: "Histórias recentes", href: "/latest" },
    { name: "Mais lidas", href: "/trending" },
  ],
  community: [
    { name: "Enviar história", href: "/submit" },
    { name: "Diretrizes da comunidade", href: "/guidelines" },
    { name: "FAQ", href: "/faq" },
    { name: "Suporte", href: "/support" },
    { name: "Fórum", href: "/forum" },
  ],
  legal: [
    { name: "Privacidade", href: "/privacy", i18nKey: "privacy" },
    { name: "Termos de uso", href: "/terms", i18nKey: "terms" },
    { name: "Cookies", href: "/cookies" },
    { name: "DMCA", href: "/dmca" },
    { name: "Idade (18+)", href: "/age-verification" },
  ],
};

// Social media links with icons and branded colors
const socialLinks = [
  {
    icon: Facebook,
    href: "https://facebook.com/facelove",
    label: "Facebook",
    color: "#1877F2",
    hoverBg: "rgba(24, 119, 242, 0.15)",
  },
  {
    icon: Instagram,
    href: "https://instagram.com/facelove",
    label: "Instagram",
    color: "#E4405F",
    hoverBg: "rgba(228, 64, 95, 0.15)",
  },
  {
    icon: MessageCircle,
    href: "https://tiktok.com/@facelove",
    label: "TikTok",
    color: "#00F2EA",
    hoverBg: "rgba(0, 242, 234, 0.15)",
  },
  {
    icon: Send,
    href: "https://t.me/facelove",
    label: "Telegram",
    color: "#26A5E4",
    hoverBg: "rgba(38, 165, 228, 0.15)",
  },
  {
    icon: Gamepad2,
    href: "https://discord.gg/facelove",
    label: "Discord",
    color: "#5865F2",
    hoverBg: "rgba(88, 101, 242, 0.15)",
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useI18n();

  return (
    <footer 
      className="mt-auto relative overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, var(--fl-background) 0%, var(--fl-surface) 100%)',
        borderTop: '1px solid var(--fl-border-subtle)',
      }}
    >
      {/* Decorative gradient orbs */}
      <div 
        className="absolute top-0 left-1/4 w-[400px] h-[200px] rounded-full opacity-30 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(147, 51, 234, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
        aria-hidden="true"
      />
      <div 
        className="absolute bottom-0 right-1/4 w-[300px] h-[150px] rounded-full opacity-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(236, 72, 153, 0.1) 0%, transparent 70%)',
          filter: 'blur(50px)',
        }}
        aria-hidden="true"
      />
      
      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* ==========================================
              BRAND SECTION - Spans 4 columns
              Logo, description & social links
              ========================================== */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block group mb-5">
              <FaceLoveLogoFull />
            </Link>
            
            <p 
              className="text-sm leading-relaxed mb-6 max-w-sm"
              style={{ color: 'var(--fl-text-muted)' }}
            >
              A plataforma premium de storytelling para adultos. 
              Descubra histórias que despertam emoções e criam conexões reais.
            </p>
            
            {/* Social Media Links Section */}
            <div className="mb-6">
              <p 
                className="text-xs font-semibold uppercase tracking-wider mb-3"
                style={{ color: 'var(--fl-text-secondary)' }}
              >
                Siga-nos nas redes sociais
              </p>
              <div className="flex items-center gap-2.5 flex-wrap">
                {socialLinks.map((social) => (
                  <Link
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "group relative flex items-center justify-center",
                      "w-10 h-10 rounded-xl transition-all duration-300",
                      "hover:scale-110 active:scale-95",
                      "border border-transparent"
                    )}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      color: 'var(--fl-text-muted)',
                    }}
                    onMouseEnter={(e) => {
                      const el = e.currentTarget;
                      el.style.backgroundColor = social.hoverBg;
                      el.style.color = social.color;
                      el.style.borderColor = `${social.color}30`;
                      el.style.boxShadow = `0 0 20px ${social.color}25`;
                      // Icon glow effect
                      const icon = el.querySelector('svg');
                      if (icon) {
                        icon.style.filter = `drop-shadow(0 0 8px ${social.color}50)`;
                      }
                    }}
                    onMouseLeave={(e) => {
                      const el = e.currentTarget;
                      el.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
                      el.style.color = 'var(--fl-text-muted)';
                      el.style.borderColor = 'transparent';
                      el.style.boxShadow = 'none';
                      const icon = el.querySelector('svg');
                      if (icon) {
                        icon.style.filter = 'none';
                      }
                    }}
                    aria-label={social.label}
                  >
                    <social.icon className="w-[18px] h-[18px] transition-transform duration-300 group-hover:scale-110" />
                    
                    {/* Tooltip on hover */}
                    <span 
                      className={cn(
                        "absolute -top-8 left-1/2 -translate-x-1/2",
                        "px-2 py-1 rounded text-xs font-medium whitespace-nowrap",
                        "opacity-0 group-hover:opacity-100 transition-opacity duration-200",
                        "pointer-events-none z-50"
                      )}
                      style={{
                        backgroundColor: 'var(--fl-surface-elevated)',
                        color: social.color,
                        border: `1px solid ${social.color}30`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      }}
                    >
                      {social.label}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Age verification badge */}
            <div 
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.15)',
              }}
            >
              <Heart className="w-3 h-3 fill-current" />
              Conteúdo +18
            </div>
          </div>

          {/* ==========================================
              EXPLORE SECTION
              ========================================== */}
          <div className="lg:col-span-2">
            <h3 
              className="font-semibold mb-5 text-xs uppercase tracking-widest"
              style={{ color: 'var(--fl-text-secondary)' }}
            >
              Explorar
            </h3>
            <ul className="space-y-3">
              {footerLinks.explore.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1"
                    style={{ color: 'var(--fl-text-muted)' }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = 'var(--fl-primary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = 'var(--fl-text-muted)';
                    }}
                  >
                    <span className="w-0 h-px bg-[var(--fl-primary)] transition-all duration-200 group-hover:w-3" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ==========================================
              COMMUNITY SECTION
              ========================================== */}
          <div className="lg:col-span-2">
            <h3 
              className="font-semibold mb-5 text-xs uppercase tracking-widest"
              style={{ color: 'var(--fl-text-secondary)' }}
            >
              Comunidade
            </h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1"
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

          {/* ==========================================
              LEGAL SECTION
              ========================================== */}
          <div className="lg:col-span-2">
            <h3 
              className="font-semibold mb-5 text-xs uppercase tracking-widest"
              style={{ color: 'var(--fl-text-secondary)' }}
            >
              Legal
            </h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm transition-all duration-200 hover:translate-x-1 inline-flex items-center gap-1"
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

          {/* ==========================================
              NEWSLETTER SECTION
              ========================================== */}
          <div className="lg:col-span-2 lg:pl-4">
            <h3 
              className="font-semibold mb-5 text-xs uppercase tracking-widest"
              style={{ color: 'var(--fl-text-secondary)' }}
            >
              Newsletter
            </h3>
            <p 
              className="text-sm leading-relaxed mb-4"
              style={{ color: 'var(--fl-text-muted)' }}
            >
              Receba novidades semanais e histórias selecionadas exclusivamente.
            </p>
            <Newsletter variant="footer" />
            
            {/* Trust badges */}
            <div className="mt-6 flex items-center gap-3 flex-wrap">
              <span 
                className="text-xs px-2 py-1 rounded-md"
                style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.08)',
                  color: '#22c55e',
                  border: '1px solid rgba(34, 197, 94, 0.15)',
                }}
              >
                ✓ SSL Seguro
              </span>
              <span 
                className="text-xs px-2 py-1 rounded-md"
                style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.08)',
                  color: '#3b82f6',
                  border: '1px solid rgba(59, 130, 246, 0.15)',
                }}
              >
                ✓ Privado
              </span>
            </div>
          </div>
        </div>

        {/* Separator with gradient */}
        <div 
          className="my-10 h-px"
          style={{
            background: 'linear-gradient(90deg, transparent 0%, var(--fl-border-subtle) 50%, transparent 100%)',
          }}
        />

        {/* Bottom bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-x-4 gap-y-2 text-center sm:text-left">
            <p 
              className="text-sm"
              style={{ color: 'var(--fl-text-muted)' }}
            >
              © {currentYear} FaceLove. Todos os direitos reservados.
            </p>
            
            <p className="flex items-center gap-1.5 text-sm">
              <span style={{ color: 'var(--fl-text-muted)' }}>
                Feito com
              </span>
              <Heart 
                className="w-4 h-4 fill-current animate-pulse" 
                style={{ color: 'var(--fl-secondary)' }}
              />
              <span style={{ color: 'var(--fl-text-muted)' }}>
                por{' '}
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

export default Footer;
