import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

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
    default: "StoryVault - Discover Amazing Stories",
    template: "%s | StoryVault",
  },
  description:
    "Explore a vast library of stories across multiple genres and themes. From romance to fantasy, find your next favorite read at StoryVault.",
  keywords: [
    "stories",
    "fiction",
    "reading",
    "library",
    "genres",
    "romance",
    "fantasy",
    "literature",
  ],
  authors: [{ name: "StoryVault Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "StoryVault - Discover Amazing Stories",
    description:
      "Explore a vast library of stories across multiple genres and themes.",
    url: "https://storyvault.com",
    siteName: "StoryVault",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "StoryVault - Discover Amazing Stories",
    description:
      "Explore a vast library of stories across multiple genres and themes.",
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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
