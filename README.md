# FaceLove 🩷

<p align="center">
  <strong>Histórias reais. Conexões que ficam.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js 16" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript 5" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS 4" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License MIT" />
</p>

---

## 📝 Descrição

**FaceLove** é uma plataforma premium de storytelling e comunidade, focada em conteúdo adulto (18+), romance, ficção e confissões. Construída com as tecnologias mais modernas do ecossistema web, oferece uma experiência imersiva e sofisticada para criadores e leitores de histórias.

### 💎 O que torna o FaceLove especial?

- **Conteúdo Premium**: Histórias de alta qualidade com curadoria cuidadosa
- **Comunidade Ativa**: Espaço para conexões reais entre autores e leitores
- **Experiência Imersiva**: Design premium com animações suaves e estética "Purple Velvet"
- **Acessibilidade Total**: PWA instalável, responsivo em todos os dispositivos
- **Multi-idioma**: Suporte para PT-BR, EN-US, ES, FR, DE e mais idiomas

> ⚠️ **Aviso**: Este projeto cont conteúdo destinado exclusivamente a maiores de 18 anos.

---

## 📸 Screenshots/Preview

As screenshots e previews do projeto estão disponíveis na pasta `/upload` do repositório.

```
/upload/
├── hero-preview.png
├── age-gate-demo.png
├── story-card-examples.png
└── mobile-responsive.png
```

---

## ✨ Features Principais

### 1. Sistema de Histórias Completo
- 🔧 **CRUD completo**: Criar, ler, atualizar e excluir histórias
- ⭐ **Sistema de ratings**: Avalie histórias com estrelas
- 👁️ **Contador de views**: Acompanhe a popularidade
- ❤️ **Favoritos**: Salve suas histórias preferidas
- 📖 **Leitor imersivo**: Experiência de leitura otimizada

### 2. Gêneros & Temas Diversificados
- 📚 **12+ gêneros**: Romance, Erotica, Drama, Comédia, Suspense, Fantasy, Sci-Fi, e mais
- 🏷️ **100+ temas**: Tags específicas para categorização precisa
- 🔍 **Filtragem avançada**: Encontre exatamente o que procura

### 3. Comunidade Interativa
- 💬 **Comentários**: Discuta histórias com outros usuários
- 👥 **Seguidores**: Siga seus autores favoritos
- 🎭 **Perfis de autor**: Descubra novos criadores
- 🔥 **Trending**: Acompanhe o que está em alta

### 4. Age Gate Premium (18+)
- 🎬 **Animações sofisticadas**: Floating hearts, glow effects
- 🔒 **Verificação segura**: Persistência via localStorage
- ♿ **Acessível**: Suporte completo a teclado e screen readers
- 🎨 **Design premium**: Experiência visual única na entrada

### 5. Progressive Web App (PWA)
- 📲 **Instalável**: Adicione à tela inicial como app nativo
- 🔄 **Offline-ready**: Service Worker para cache inteligente
- ⚡ **Performance**: Carregamento rápido e responsivo
- 🔔 **Notificações**: Pronto para push notifications

### 6. Multi-idioma (i18n)
- 🇧🇷 Português (Brasil) - PT-BR
- 🇺🇸 English (US) - EN-US  
- 🇪🇸 Español - ES
- 🇫🇷 Français - FR
- 🇩🇪 Deutsch - DE
- ➕ Mais idiomas em breve

### 7. Dark Theme Premium
- 🌙 **Purple Velvet Theme**: Estética escura e sofisticada
- 🎨 **Design tokens customizados**: Cores únicas da marca
- ☀️ **Toggle suave**: Transição perfeita entre temas
- 👁️ **Comfort visual**: Otimizado para longas sessões de leitura

### 8. SEO Otimizado
- 🏷️ **Meta tags completas**: Title, description, keywords
- 📱 **Open Graph**: Preview perfeito em redes sociais
- 🐦 **Twitter Cards**: Compartilhamento otimizado
- 🗺️ **Sitemap dinâmico**: Indexação eficiente
- 🤖 **Robots.txt configurado**: Controle de crawling
- 🔗 **Canonical URLs**: Evita conteúdo duplicado

### 9. Design Responsivo
- 📱 **Mobile-first**: Otimizado para smartphones
- 💻 **Desktop perfeito**: Experiência completa em telas grandes
- 📐 **Breakpoints inteligentes**: 375px, 768px, 1024px, 1440px
- 👆 **Touch-friendly**: Mínimo de 44px para elementos interativos

---

## 🛠 Tech Stack

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Next.js** | 16 (App Router) | Framework React full-stack |
| **TypeScript** | 5 | Tipagem estática |
| **Tailwind CSS** | 4 | Estilização utility-first |
| **shadcn/ui** | Latest | Componentes UI premium |
| **Prisma ORM** | Latest | Banco de dados e ORM |
| **SQLite** | 3 | Banco de dados local |
| **Lucide Icons** | Latest | Ícones consistentes |
| **next-themes** | Latest | Dark/Light mode |
| **z-ai-web-dev-sdk** | Latest | Geração de imagens IA |
| **Zustand** | Latest | State management client |
| **TanStack Query** | Latest | State management server |

---

## 📁 Estrutura do Projeto

```
src/
├── app/                          # Páginas (App Router)
│   ├── page.tsx                 # Homepage principal
│   ├── layout.tsx               # Layout raiz com providers
│   ├── globals.css              # Estilos globais e tokens
│   ├── story/
│   │   └── [id]/
│   │       └── page.tsx         # Detalhe da história
│   ├── genres/
│   │   └── page.tsx             # Página de gêneros
│   ├── themes/
│   │   └── page.tsx             # Página de temas
│   ├── authors/
│   │   └── page.tsx             # Lista de autores
│   ├── search/
│   │   └── page.tsx             # Busca avançada
│   └── api/                     # API routes
│       ├── stories/             # CRUD de histórias
│       ├── genres/              # API de gêneros
│       ├── themes/              # API de temas
│       └── authors/             # API de autores
│
├── components/
│   ├── ui/                      # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   └── ...
│   │
│   ├── hero-section.tsx         # Hero banner principal
│   ├── age-gate.tsx             # Validador 18+ animado
│   ├── header.tsx               # Navegação principal
│   ├── footer.tsx               # Rodapé do site
│   ├── story-card.tsx           # Card de história
│   ├── trending-stories.tsx     # Stories em destaque
│   ├── platform-stats.tsx       # Estatísticas da plataforma
│   ├── explore-cards.tsx        # Cards de exploração
│   ├── value-props.tsx          # Propostas de valor
│   ├── pwa-install-prompt.tsx   # Prompt de instalação PWA
│   ├── theme-provider.tsx       # Provider de tema
│   └── language-switcher.tsx    # Seletor de idioma
│
├── lib/
│   ├── db.ts                    # Prisma client singleton
│   ├── utils.ts                 # Utilitários gerais
│   └── i18n/                    # Internacionalização
│       ├── index.ts             # Configuração i18n
│       ├── pt-BR.json           # Traduções PT-BR
│       ├── en-US.json           # Traduções EN-US
│       └── ...
│
├── hooks/                       # Custom React hooks
│   ├── use-age-verified.ts      # Hook age gate
│   └── use-stories.ts           # Hook stories data
│
└── types/                       # TypeScript types
    ├── story.ts                 # Types de story
    ├── genre.ts                 # Types de genre
    └── index.ts                 # Types exportados

public/
├── images/                      # Imagens otimizadas
│   ├── hero/                    # Hero backgrounds
│   ├── genres/                  # Capas de gêneros
│   └── stories/                 # Capas de histórias
├── icons/                       # Ícones PWA
│   ├── icon-72x72.png
│   ├── icon-96x96.png
│   ├── icon-128x128.png
│   ├── icon-144x144.png
│   ├── icon-152x152.png
│   ├── icon-192x192.png
│   ├── icon-384x384.png
│   └── icon-512x512.png
├── manifest.json                # PWA manifest
├── sw.js                        # Service Worker
└── robots.txt                   # SEO robots
```

---

## 🚀 Instalação e Setup

### Pré-requisitos

Certifique-se de ter as seguintes ferramentas instaladas:

- **Node.js** 18 ou superior ([Download](https://nodejs.org/))
- **Bun** ou **npm** ([Bun](https://bun.sh/) recomendado)
- **SQLite3** (geralmente incluído com o sistema operacional)

### Passos de Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/consorcioalfa7/facelove.git

# 2. Entrar no diretório do projeto
cd facelove

# 3. Instalar dependências
bun install

# 4. Configurar variáveis de ambiente (ver seção abaixo)

# 5. Inicializar o banco de dados
bun run db:push

# 6. Rodar o servidor de desenvolvimento
bun run dev

# 7. Acesse http://localhost:3000
```

### Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `bun run dev` | Servidor de desenvolvimento (hot reload) |
| `bun run build` | Build de produção |
| `bun run start` | Iniciar servidor de produção |
| `bun run lint` | Executar ESLint |
| `bun run db:push` | Push schema para o banco |
| `bun run db:studio` | Abrir Prisma Studio |

---

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Database
DATABASE_URL="file:./dev.db"

# Opcional: Configurações futuras
# NEXTAUTH_URL="http://localhost:3000"
# NEXTAUTH_SECRET="your-secret-key"
```

### Configuração PWA

O FaceLove é um Progressive Web App totalmente instalável:

- **Manifest**: `/public/manifest.json` - Configurações do app
- **Service Worker**: `/public/sw.js` - Cache e offline support
- **Ícones**: `/public/icons/` - Todos os tamanhos necessários

#### Manifest Configuration

```json
{
  "name": "FaceLove - Histórias & Conexões",
  "short_name": "FaceLove",
  "description": "Plataforma premium de storytelling",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#ec4899",
  "orientation": "portrait-primary"
}
```

---

## 🎨 Design System

### FaceLove Design Tokens

O FaceLove utiliza um sistema de design único chamado **"Purple Velvet"**, inspirado em luxo e sofisticação:

```css
/* === Core Colors === */
--fl-background: #0a0a0f;         /* Quase preto - fundo principal */
--fl-surface: #12121a;            /* Superfície elevada */
--fl-surface-elevated: #1a1a2e;   /* Superfície mais elevada */

/* === Brand Colors === */
--fl-primary: #ec4899;            /* Rosa/Magenta - cor primária */
--fl-secondary: #9333ea;          /* Roxo vibrante - secundária */
--fl-accent: #f472b6;             /* Pink - destaques */

/* === Text Colors === */
--fl-text-primary: #ffffff;       /* Texto principal */
--fl-text-secondary: #a1a1aa;     /* Texto secundário */
--fl-text-muted: #71717a;         /* Texto sutil */

/* === Effects === */
--fl-glow: rgba(236, 72, 153, 0.4);      /* Efeito brilho rosa */
--fl-glow-purple: rgba(147, 51, 234, 0.4); /* Efeito brilho roxo */
--fl-shadow-glow: 0 0 30px rgba(236, 72, 153, 0.3);

/* === Gradients === */
--fl-gradient-primary: linear-gradient(135deg, #ec4899, #9333ea);
--fl-gradient-accent: linear-gradient(135deg, #f472b6, #ec4899);
--fl-gradient-dark: linear-gradient(180deg, #0a0a0f, #12121a);
```

### Componentes Premium

Todos os componentes seguem princípios de design de alta qualidade:

#### Glass Morphism
```css
.glass {
  background: rgba(18, 18, 26, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}
```

#### Glow Effects
```css
.glow {
  box-shadow: 
    0 0 20px rgba(236, 72, 153, 0.3),
    0 0 40px rgba(236, 72, 153, 0.2),
    0 0 60px rgba(236, 72, 153, 0.1);
}
```

#### Gradient Text
```css
.gradient-text {
  background: linear-gradient(135deg, #ec4899, #f472b6, #9333ea);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
```

#### Smooth Animations
```css
.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

---

## 📱 PWA & Responsividade

### Breakpoints

| Breakpoint | Largura | Dispositivo |
|------------|---------|-------------|
| `sm` | ≥640px | Smartphones grandes |
| `md` | ≥768px | Tablets |
| `lg` | ≥1024px | Laptops |
| `xl` | ≥1280px | Desktops |
| `2xl` | ≥1536px | Telas grandes |

### Mobile-First Principles

- **Touch targets**: Mínimo 44px x 44px para elementos clicáveis
- **Thumb zones**: Áreas importantes na zona fácil de alcance
- **Font sizes**: Mínimo 16px para evitar zoom no iOS
- **Navigation**: Bottom nav em mobile, sidebar em desktop
- **Gestures**: Swipe, pinch-to-zoom onde aplicável

### Install Prompt

O prompt de instalação PWA é customizado e não intrusivo:

- Aparece após 30 segundos de uso
- Pode ser dispensado pelo usuário
- Reaparece após 7 dias se dispensado
- Design consistente com o tema Purple Velvet

---

## 🔒 Age Gate (18+)

O Age Gate é um componente crítico do FaceLove, garantindo conformidade legal:

### Funcionalidades

- ✅ Verificação obrigatória na primeira visita
- ✅ Persistência via localStorage
- ✅ Animações premium (floating hearts, particles)
- ✅ Suporte total a acessibilidade
- ✅ Redirecionamento se menor de idade

### Implementação Técnica

```typescript
// Hook useAgeVerified
const [isVerified, setIsVerified] = useState<boolean | null>(null);

useEffect(() => {
  const verified = localStorage.getItem('age-verified');
  setIsVerified(verified === 'true');
}, []);

const verifyAge = () => {
  localStorage.setItem('age-verified', 'true');
  setIsVerified(true);
};
```

### Acessibilidade

- Teclado: Enter/Space para confirmar
- Screen readers: ARIA labels completos
- Focus trap dentro do modal
- Escape key fecha (se permitido)

---

## 🌐 SEO & Metadados

### Open Graph Configuration

```typescript
// app/layout.tsx
export const metadata: Metadata = {
  title: 'FaceLove - Histórias Reais, Conexões Que Ficam',
  description: 'Plataforma premium de storytelling e comunidade...',
  openGraph: {
    title: 'FaceLove 🩷',
    description: 'Histórias reais. Conexões que ficam.',
    url: 'https://facelove.app',
    siteName: 'FaceLove',
    images: [{ url: '/images/og-image.png', width: 1200, height: 630 }],
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FaceLove 🩷',
    description: 'Histórias reais. Conexões que ficam.',
    images: ['/images/twitter-card.png'],
  },
};
```

### Sitemap Dinâmico

```typescript
// app/sitemap.ts
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://facelove.app', lastModified: new Date() },
    { url: 'https://facelove.app/stories', lastModified: new Date() },
    { url: 'https://facelove.app/genres', lastModified: new Date() },
    // ... mais URLs
  ];
}
```

---

## 📊 Database Schema (Prisma)

### Modelos Principais

```prisma
// prisma/schema.prisma

model Author {
  id          String   @id @default(cuid())
  name        String
  username    String   @unique
  bio         String?
  avatar      String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  stories     Story[]
}

model Genre {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  icon        String?
  color       String?
  createdAt   DateTime @default(now())
  
  stories     Story[]
}

model Theme {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  createdAt   DateTime @default(now())
  
  stories     StoryTheme[]
}

model Story {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  synopsis    String
  content     String   @db.Text
  coverImage  String?
  
  authorId    String
  author      Author   @relation(fields: [authorId], references: [id])
  genreId     String
  genre       Genre    @relation(fields: [genreId], references: [id])
  
  views       Int      @default(0)
  rating      Float    @default(0)
  isPublished Boolean  @default(false)
  isFeatured  Boolean  @default(false)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  themes      StoryTheme[]
  comments    Comment[]
  favorites   Favorite[]
}

model StoryTheme {
  id      String @id @default(cuid())
  storyId String
  themeId String
  
  story   Story @relation(fields: [storyId], references: [id])
  theme   Theme @relation(fields: [themeId], references: [id])
  
  @@unique([storyId, themeId])
}

model Comment {
  id        String   @id @default(cuid())
  content   String
  authorName String
  
  storyId   String
  story     Story    @relation(fields: [storyId], references: [id])
  
  createdAt DateTime @default(now())
}

model Favorite {
  id      String @id @default(cuid())
  storyId String
  story   Story  @relation(fields: [storyId], references: [id])
  
  @@unique([storyId])
}

// Preparado para futura implementação
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  image     String?
  createdAt DateTime @default(now())
}
```

---

## 🔮 Roadmap Futuro

### Q1 2025
- [ ] Integração com Supabase (Auth + Realtime)
- [ ] Sistema de autenticação completo (NextAuth.js)
- [ ] Perfil de usuário personalizado

### Q2 2025
- [ ] Chat/comunidade em tempo real (WebSocket)
- [ ] Sistema de notificações push
- [ ] Upload de histórias por usuários

### Q3 2025
- [ ] IA para recomendações personalizadas
- [ ] Busca semântica (pgvector)
- [ ] Sistema de assinatura/Premium

### Q4 2025
- [ ] App nativo (React Native / Capacitor)
- [ ] Marketplace de autores
- [ ] Eventos e lives

---

## 👥 Contribuição

Quer contribuir com o FaceLove? Siga os passos abaixo:

### Como Contribuir

1. **Fork** o repositório
2. Crie uma branch para sua feature:
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. Faça commit das suas mudanças:
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. Push para a branch:
   ```bash
   git push origin feature/AmazingFeature
   ```
5. Abra um **Pull Request**

### Código de Conduta

- Respeite todos os contribuidores
- Mantenha o código limpo e documentado
- Siga os padrões de código existentes
- Teste suas alterações antes de submeter

### Convenções de Commit

- `feat:` Nova funcionalidade
- `fix:` Bug fix
- `docs:` Documentação
- `style:` Formatação, ponto e vírgula, etc.
- `refactor:` Refatoração de código
- `test:` Adicionar testes
- `chore:` Tarefas de manutenção

---

## 📄 Licença

Este projeto está sob a licença **MIT License**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

```
MIT License

Copyright (c) 2024 DarkToolsLabs

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 👨‍💻 Autor

<div align="center">

**DarkToolsLabs**

| Plataforma | Link |
|------------|------|
| GitHub | [@consorcioalfa7](https://github.com/consorcioalfa7) |
| Projeto | [FaceLove](https://github.com/consorcioalfa7/facelove) |

</div>

---

## 🙏 Agradecimentos

Agradecemos a todas as tecnologias e comunidades que tornam este projeto possível:

- **[Next.js](https://nextjs.org/)** - Framework React incrível
- **[shadcn/ui](https://ui.shadcn.com/)** - Componentes beautiful e acessíveis
- **[Lucide](https://lucide.dev/)** - Ícones elegantes e consistentes
- **[Vercel](https://vercel.com/)** - Hosting e infraestrutura
- **[Prisma](https://www.prisma.io/)** - ORM moderno e type-safe
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework

---

## 📞 Contato

Tem dúvidas, sugestões ou quer conversar?

- Abra uma **Issue** no GitHub
- Faça um **Pull Request** com melhorias
- Entre em contato através do perfil do GitHub

---

<p align="center">
  Feito com ❤️ e muito ☕ por <strong>DarkToolsLabs</strong>
</p>

<p align="center">
  <sub><em>"Histórias reais. Conexões que ficam."</em></sub>
</p>
