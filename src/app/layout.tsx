import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { BackToTop } from "@/components/back-to-top";
import { KeyboardShortcuts, KeyboardShortcutButton } from "@/components/keyboard-shortcuts";
import { I18nProvider } from "@/lib/i18n/I18nProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FaceLove - Descubra Histórias que Tocam o Coração",
    template: "%s | FaceLove",
  },
  description:
    "Explore milhares de histórias de romance, ficção, fantasia e muito mais. Encontre sua próxima história favorita no FaceLove.",
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
  ],
  authors: [{ name: "FaceLove by DarkToolsLabs" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "FaceLove - Descubra Histórias que Tocam o Coração",
    description:
      "Explore milhares de história de romance, ficção, fantasia e mais.",
    url: "https://facelove.com",
    siteName: "FaceLove",
    type: "website",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "FaceLove - Descubra Histórias que Tocam o Coração",
    description:
      "Explore milhares de história de romance, ficção, fantasia e mais.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
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
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <BackToTop />
            <KeyboardShortcutButton />
            <KeyboardShortcuts />
            <Toaster />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
