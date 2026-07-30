import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import { KeyboardShortcuts, KeyboardShortcutButton } from "@/components/keyboard-shortcuts";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { PWAInstallPrompt } from "@/components/pwa-install-prompt";
import { PWARegisterSW } from "@/components/pwa-register-sw";
import { AgeGate } from "@/components/age-gate";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ec4899' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0a0f' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  // Basic
  title: {
    default: "FaceLove - Histórias Reais. Conexões que Ficam.",
    template: "%s | FaceLove",
  },
  description:
    "Histórias reais. Conexões que ficam. Descubra, leia e compartilhe histórias que inspiram, excitam e conectam pessoas.",

  // Keywords
  keywords: [
    "facelove",
    "histórias",
    "stories",
    "romance",
    "ficção",
    "fantasia",
    "leitura",
    "literatura",
    "contos",
    "amor",
    "confissões",
    "relatos",
    "comunidade",
    "histórias reais",
    "storytelling",
    "livros online",
    "ler online",
    "histórias de amor",
  ],

  // Authors & Creator
  authors: [
    {
      name: "FaceLove by DarkToolsLabs",
      url: "https://github.com/consorcioalfa7/facelove",
    },
  ],
  creator: "DarkToolsLabs",
  publisher: "FaceLove",

  // Robots & Indexing
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  // PWA Manifest
  manifest: '/manifest.json',

  // Apple Web App
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'FaceLove',
  },

  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: "website",
    locale: "pt_BR",
    alternateLocale: ["en_US", "es_ES", "fr_FR"],
    url: "https://facelove.com",
    siteName: "FaceLove",
    title: "FaceLove - Histórias Reais. Conexões que Ficam.",
    description:
      "Histórias reais. Conexões que ficam. Descubra, leia e compartilhe histórias que inspiram e conectam.",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "FaceLove - Plataforma de Histórias e Conexões",
      },
    ],
  },

  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "FaceLove - Histórias Reais. Conexões que Ficam.",
    description:
      "Comunidade exclusiva para maiores de 18 anos. Histórias que inspiram e conectam.",
    images: ["/images/og-image.png"],
    creator: "@darktoolslabs",
  },

  // Verification (add placeholders)
  verification: {
    google: "your-google-verification-code",
  },

  // Icons
  icons: {
    icon: [
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
    ],
    shortcut: "/icons/icon-192x192.png",
  },

  // Category & Audience
  category: "Entertainment",
  classification: "Adult Content",
  audience: {
    ratingType: "restricted", // RTA label for adult content
  },

  // Alternates
  alternates: {
    canonical: "https://facelove.com",
    languages: {
      "pt-BR": "https://facelove.com",
      "en-US": "https://facelove.com/en",
      es: "https://facelove.com/es",
    },
  },

  // Additional PWA meta tags
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'FaceLove',
    'application-name': 'FaceLove',
    'msapplication-TileColor': '#ec4899',
    'msapplication-tap-highlight': 'no',
    'format-detection': 'telephone=no',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ec4899" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <AgeGate 
              minAge={18}
              title="Bem-vindo ao FaceLove"
              message="Este conteúdo é destinado exclusivamente a maiores de 18 anos. Ao continuar, você confirma que é adulto."
              confirmText="Sim, tenho 18+ anos"
              cancelText="Não, sou menor"
            />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <BackToTop />
            <KeyboardShortcutButton />
            <KeyboardShortcuts />
            <Toaster />
            <PWAInstallPrompt />
            <PWARegisterSW />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
