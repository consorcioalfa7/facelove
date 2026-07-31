# FaceLove - Premium Storytelling Platform

<div align="center">

![FaceLove Logo](public/logo-facelove.png)

**Histórias reais. Conexões que ficam.**

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

</div>

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development Guide](#development-guide)
- [Design System](#design-system)
- [PWA Configuration](#pwa-configuration)
- [SEO Optimization](#seo-optimization)
- [Internationalization (i18n)](#internationalization-i18n)
- [Database Schema](#database-schema)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

FaceLove is a premium storytelling platform designed for adult audiences (18+). It provides a sophisticated, immersive reading experience with a focus on romantic and emotional narratives. The platform features a stunning "Purple Velvet" dark theme aesthetic with glass morphism effects, smooth animations, and full PWA support.

### Key Highlights

- **Premium Dark Theme**: Purple Velvet + Pink Glow design system
- **Age Verification**: Animated 18+ gate with floating hearts and cinematic effects
- **PWA Support**: Installable app with offline capabilities
- **Multi-language**: 14 languages supported
- **SEO Optimized**: JSON-LD structured data, OpenGraph, Twitter Cards
- **Responsive Design**: Mobile-first approach, works on all devices

---

## Features

### Core Features

| Feature | Description |
|---------|-------------|
| Story Browsing | Browse stories by genre, theme, or author |
| Reading Experience | Immersive reader with progress tracking |
| Favorites System | Save and organize favorite stories |
| Bookmarks | Auto-save reading position |
| Search & Filter | Advanced search with multiple filters |
| Author Profiles | Dedicated author pages with bios |
| Community Features | Discussions, comments, activity feed |

### Premium Features

| Feature | Implementation |
|---------|----------------|
| Age Gate (18+) | Animated verification with localStorage persistence |
| PWA Install | Custom install prompt with iOS instructions |
| Offline Mode | Service worker with cache strategies |
| Push Notifications | Background sync support (ready) |
| Dark Theme | Premium "Purple Velvet" aesthetic |
| Glass Morphism | Backdrop blur effects throughout |
| Animations | Floating hearts, pulse glow, shimmer effects |

---

## Tech Stack

### Core Framework

```yaml
Framework: Next.js 16 (App Router)
Language: TypeScript 5
Styling: Tailwind CSS 4
Components: shadcn/ui (New York style)
Icons: Lucide React
```

### Database & Backend

```yaml
Database: SQLite via Prisma ORM
State Management: Zustand (client), TanStack Query (server)
Authentication: NextAuth.js v4 (ready)
Real-time: Socket.IO (mini-service)
```

### Development Tools

```yaml
Package Manager: Bun
Linting: ESLint
Formatting: Prettier (ready)
Testing: Ready for implementation
```

---

## Project Structure

```
facelove/
├── public/                      # Static assets
│   ├── icons/                   # PWA icons (SVG format)
│   │   ├── icon-72x72.svg
│   │   ├── icon-192x192.svg
│   │   ├── icon-512x512.svg
│   │   └── ... (all sizes)
│   ├── images/
│   │   ├── hero/
│   │   │   └── main-hero.png    # Hero background image
│   │   ├── stories/
│   │   │   ├── story-placeholder-1.png
│   │   │   ├── story-placeholder-2.png
│   │   │   ├── story-placeholder-3.png
│   │   │   └── story-placeholder-4.png
│   │   └── og-image.png         # OpenGraph social sharing image
│   ├── manifest.json            # PWA manifest
│   ├── sw.js                    # Service worker
│   ├── logo.svg                 # SVG logo
│   └── logo-facelove.png        # PNG logo
│
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── layout.tsx           # Root layout with metadata
│   │   ├── page.tsx             # Homepage
│   │   ├── globals.css          # Global styles & design tokens
│   │   ├── sitemap.ts           # Dynamic sitemap generation
│   │   ├── robots.ts            # Robots.txt configuration
│   │   ├── offline/page.tsx     # Offline fallback page
│   │   ├── story/[id]/page.tsx  # Individual story page
│   │   ├── stories/page.tsx     # Stories listing
│   │   ├── genres/page.tsx      # Genres listing
│   │   ├── genres/[slug]/page.tsx # Genre detail page
│   │   ├── themes/page.tsx      # Themes listing
│   │   ├── themes/[slug]/page.tsx # Theme detail page
│   │   ├── authors/page.tsx     # Authors listing
│   │   ├── authors/[slug]/page.tsx # Author profile page
│   │   ├── search/page.tsx      # Search page
│   │   ├── favorites/page.tsx   # User favorites
│   │   └── api/                 # API routes
│   │       ├── route.ts         # Health check
│   │       ├── stories/route.ts # Stories CRUD
│   │       ├── genres/route.ts  # Genres CRUD
│   │       ├── themes/route.ts  # Themes CRUD
│   │       ├── authors/route.ts # Authors CRUD
│   │       ├── search/route.ts  # Search endpoint
│   │       └── newsletter/route.ts # Newsletter signup
│   │
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn/ui base components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   └── ... (50+ components)
│   │   ├── age-gate.tsx         # 18+ age verification
│   │   ├── hero-section.tsx     # Cinematic hero banner
│   │   ├── header.tsx           # Navigation header
│   │   ├── footer.tsx           # Site footer
│   │   ├── story-card.tsx       # Story card component
│   │   ├── genre-card.tsx       # Genre card component
│   │   ├── platform-stats.tsx   # Statistics display
│   │   ├── explore-cards.tsx    # Category navigation cards
│   │   ├── trending-stories.tsx # Trending stories list
│   │   ├── value-props.tsx      # Trust badges section
│   │   ├── pwa-install-prompt.tsx    # PWA install UI
│   │   ├── pwa-register-sw.tsx        # Service worker registration
│   │   ├── facelove-logo.tsx    # Brand logo component
│   │   ├── language-selector.tsx # Language switcher
│   │   ├── search-bar.tsx       # Search input component
│   │   ├── theme-badge.tsx      # Theme tag badge
│   │   ├── bookmark-button.tsx  # Bookmark action
│   │   ├── favorite-button.tsx  # Favorite action
│   │   ├── reading-progress.tsx # Progress indicator
│   │   ├── reading-timer.tsx    # Reading time tracker
│   │   ├── story-comments.tsx   # Comments section
│   │   ├── achievements.tsx     # User achievements
│   │   └── ...
│   │
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-mobile.ts        # Mobile detection hook
│   │   └── use-toast.ts         # Toast notification hook
│   │
│   ├── lib/                     # Utilities & configurations
│   │   ├── db.ts                # Prisma client instance
│   │   ├── utils.ts             # General utilities (cn function)
│   │   ├── i18n/                # Internationalization system
│   │   │   ├── index.ts
│   │   │   ├── I18nProvider.tsx
│   │   │   ├── locales.ts
│   │   │   └── locales/
│   │   │       ├── pt-BR.ts
│   │   │       ├── en-US.ts
│   │   │       └── es.ts
│   │   ├── favorites.ts         # Favorites management
│   │   ├── bookmarks.ts         # Bookmarks management
│   │   ├── recently-viewed.ts   # Reading history
│   │   ├── notifications.ts     # Notification helpers
│   │   └── reading-stats.ts     # Reading statistics
│   │
│   └── middleware.ts            # Next.js middleware (optional)
│
├── prisma/
│   └── schema.prisma            # Database schema definition
│
├── mini-services/               # Independent services
│   └── (socket.io services)
│
├── docs/                        # Documentation (optional)
├── tests/                       # Test files (ready)
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── bun.lockb
└── README.md                    # This file
```

---

## Getting Started

### Prerequisites

- **Bun** >= 1.0.0 ([Installation guide](https://bun.sh/docs/installation))
- **Node.js** >= 20 LTS (for compatibility)

### Installation

```bash
# Clone the repository
git clone https://github.com/consorcioalfa7/facelove.git
cd facelove

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Initialize database
bun run db:push

# Seed database with sample data (optional)
bun run db:seed

# Start development server
bun run dev
```

The application will be available at `http://localhost:3000`

### Environment Variables

```env
# Database
DATABASE_URL="file:./dev.db"

# Authentication (NextAuth) - Optional
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"

# External APIs - Optional
IPAPI_KEY=""  # For country detection
```

---

## Development Guide

### Available Scripts

```bash
# Development
bun run dev          # Start development server with hot reload
bun run build        # Create production build
bun run start        # Start production server
bun run lint         # Run ESLint checks

# Database
bun run db:push      # Push schema changes to database
bun run db:studio    # Open Prisma Studio GUI
bun run db:seed      # Seed database with sample data
bun run db:reset     # Reset database to empty state
```

### Code Style Guidelines

1. **TypeScript Strict**: All files must have proper types
2. **Components**: Use functional components with hooks
3. **Naming**: 
   - Components: PascalCase (`HeroSection.tsx`)
   - Files: kebab-case (`hero-section.tsx`)
   - Utils: camelCase (`formatDate()`)
4. **Imports**: Use path aliases (`@/components/...`)
5. **CSS**: Use Tailwind classes, custom properties for theming

### Component Architecture

```tsx
// Example component structure
"use client"; // Add for interactive components

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface ComponentProps {
  /** Prop description */
  title: string;
}

export function Component({ title }: ComponentProps) {
  return (
    <div className="container">
      <h1>{title}</h1>
    </div>
  );
}
```

---

## Design System

### Color Palette (CSS Custom Properties)

The FaceLove design system uses CSS custom properties prefixed with `--fl-*`:

```css
/* Core Colors */
--fl-background: #0a0a0f;        /* Near-black with purple undertone */
--fl-surface: #12121a;           /* Elevated surfaces */
--fl-surface-elevated: #1a1a24; /* Higher elevation */
--fl-primary: #9333ea;           /* Purple primary */
--fl-secondary: #ec4899;         /* Pink secondary */
--fl-accent: #f472b6;            /* Light pink accent */

/* Text Colors */
--fl-text-primary: #ffffff;
--fl-text-secondary: #a1a1aa;
--fl-text-muted: #71717a;
--fl-text-disabled: #52525b;

/* Effects */
--fl-glow-purple: rgba(147, 51, 234, 0.3);
--fl-glow-pink: rgba(236, 72, 153, 0.25);
--fl-shadow-glow: 0 0 30px rgba(147, 51, 234, 0.2);
```

### Utility Classes

```css
/* Glass morphism effect */
.glass {
  background: rgba(18, 18, 26, 0.8);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-card {
  @apply glass rounded-2xl p-6;
}

/* Gradient text */
.gradient-text {
  background: linear-gradient(135deg, var(--fl-primary), var(--fl-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

### Animation Library

| Class | Duration | Effect |
|-------|----------|--------|
| `animate-fade-in-up` | 600ms | Fade in with upward movement |
| `animate-pulse-glow` | 2s | Soft pulsing glow |
| `animate-shimmer` | 2s | Shimmer sweep effect |
| `animate-float` | 6s | Gentle floating motion |
| `animate-logo-pulse` | 3s | Logo glow pulse |

---

## PWA Configuration

### Manifest Details

The PWA manifest is configured at `/public/manifest.json`:

```json
{
  "name": "FaceLove",
  "short_name": "FaceLove",
  "description": "Histórias reais. Conexões que ficam.",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#ec4899",
  "orientation": "portrait-primary",
  "categories": ["social", "entertainment", "lifestyle"]
}
```

### Service Worker Strategies

| Resource Type | Strategy | Cache Duration |
|---------------|----------|----------------|
| Static Assets (JS/CSS) | Cache-First | 30 days |
| Images | Stale-While-Revalidate | 7 days |
| API Calls | Network-First | 5 minutes |
| Navigation | Network-First with Fallback | - |

### Install Prompt

The custom install prompt:
- Detects installability via `beforeinstallprompt`
- Shows after 3-second delay on first visit
- Respects dismissal for 7 sessions
- Provides iOS installation instructions

---

## SEO Optimization

### Metadata Configuration

Located in `src/app/layout.tsx`:

```typescript
export const metadata: Metadata = {
  title: {
    default: "FaceLove - Histórias Reais. Conexões que Ficam.",
    template: "%s | FaceLove",
  },
  description: "Plataforma premium de storytelling para adultos...",
  
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "FaceLove",
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
  },
  
  twitter: {
    card: "summary_large_image",
    creator: "@darktoolslabs",
  },
};
```

### Structured Data (JSON-LD)

Homepage includes comprehensive schema.org markup:

- **WebSite** with SearchAction
- **Organization** details
- **CreativeWork** for featured story
- **ItemList** for trending stories
- **WebPage** with audience targeting

### Sitemap & Robots

- Dynamic sitemap at `/sitemap.xml` with hreflang support
- Configured robots.txt allowing all crawlers
- Proper canonical URLs set

---

## Internationalization (i18n)

### Supported Languages

| Code | Language |
|------|----------|
| pt-BR | Portuguese (Brazil) - Default |
| en-US | English (US) |
| es | Spanish |
| fr | French |
| de | German |
| it | Italian |
| zh-CN | Chinese Simplified |
| ja | Japanese |
| ko | Korean |
| ar | Arabic |
| ru | Russian |
| hi | Hindi |
| pt-PT | Portuguese (Portugal) |
| en-GB | English (UK) |

### Usage

```tsx
import { useI18n } from "@/lib/i18n/I18nProvider";

function MyComponent() {
  const { t, locale, setLocale } = useI18n();
  
  return (
    <h1>{t('welcome.title')}</h1>
  );
}
```

---

## Database Schema

### Entity Relationship Diagram

```
Author (1) ----< (N) Story >---- (N) Theme
                        |
                       (N) Genre
                        |
               (N) StoryTheme >---- (N) Theme
```

### Key Models

```prisma
model Author {
  id        String   @id @default(cuid())
  name      String
  slug      String   @unique
  bio       String?
  avatar    String?
  stories   Story[]
  createdAt DateTime @default(now())
}

model Story {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  content     String   @db.Text
  synopsis    String?
  authorId    String
  author      Author   @relation(fields: [authorId], references: [id])
  genreId     String
  genre       Genre    @relation(fields: [genreId], references: [id])
  rating      Float    @default(0)
  readsCount  Int      @default(0)
  publishedAt DateTime?
  themes      StoryTheme[]
  createdAt   DateTime @default(now())
}

model Genre {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  sortOrder   Int      @default(0)
  stories     Story[]
}

model Theme {
  id         String   @id @default(cuid())
  name       String
  slug       String   @unique
  storyCount Int      @default(0)
  stories    StoryTheme[]
}

model StoryTheme {
  storyId String
  themeId  String
  story   Story   @relation(fields: [storyId], references: [id])
  theme   Theme   @relation(fields: [themeId], references: [id])
  @@id([storyId, themeId])
}
```

---

## API Endpoints

### Base URL: `/api`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api` | Health check |
| GET | `/api/stories` | List all stories |
| GET | `/api/stories/:id` | Get single story |
| GET | `/api/genres` | List all genres |
| GET | `/api/genres/:slug` | Get genre by slug |
| GET | `/api/themes` | List all themes |
| GET | `/api/themes/:slug` | Get theme by slug |
| GET | `/api/authors` | List all authors |
| GET | `/api/authors/:slug` | Get author by slug |
| GET | `/api/search?q=` | Search stories |
| POST | `/api/newsletter` | Subscribe to newsletter |

### Response Format

```json
{
  "success": true,
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

---

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Environment variables to configure in Vercel dashboard:
- `DATABASE_URL` (use Vercel Postgres or external DB)
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`

### Docker

```dockerfile
FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json bun.lockb ./
RUN npm install -g bun && bun install --frozen-lockfile

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
CMD ["node", "server.js"]
```

### Build & Run

```bash
docker build -t facelove .
docker run -p 3000:3000 facelove
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run linting: `bun run lint`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Commit Message Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting)
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- **[Next.js](https://nextjs.org/)** - The React framework
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful component library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Prisma](https://www.prisma.io/)** - Next-generation ORM
- **[Lucide](https://lucide.dev/)** - Beautiful icons

---

## Contact

- **GitHub**: [consorcioalfa7/facelove](https://github.com/consorcioalfa7/facelove)
- **Creator**: [@DarkToolsLabs](https://github.com/DarkToolsLabs)

---

<div align="center">

**Built with ❤️ by DarkToolsLabs**

*Histórias reais. Conexões que ficam.*

</div>
