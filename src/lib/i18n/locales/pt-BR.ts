// Portuguese (Brazil) - Default Language
export const ptBR = {
  // App
  appName: 'FaceLove',
  appTagline: 'Descubra histórias que tocam o coração',
  appDescription: 'O melhor lugar para encontrar histórias incríveis de amor, romance e muito mais.',
  
  // Navigation
  nav: {
    home: 'Início',
    genres: 'Gêneros',
    themes: 'Temas',
    authors: 'Autores',
    search: 'Buscar',
    darkMode: 'Modo escuro',
    lightMode: 'Modo claro',
  },
  
  // Home Page
  home: {
    heroTitle: 'Bem-vindo ao',
    heroSubtitle: 'Explore milhares de histórias cativantes em cada gênero. De romances comoventes a aventuras emocionantes, encontre sua leitura perfeita hoje.',
    searchPlaceholder: 'Buscar histórias, gêneros, temas...',
    popularThemes: 'Populares',
    browseByGenre: 'Explorar por Gênero',
    browseByGenreDesc: 'Encontre histórias em sua categoria favorita',
    viewAllGenres: 'Ver todos os gêneros →',
    recentStories: 'Histórias Recentes',
    stats: {
      stories: 'Histórias',
      authors: 'Autores',
      genres: 'Gêneros',
      themes: 'Temas',
    },
    ctaTitle: 'Pronto para começar?',
    ctaSubtitle: 'Mergulhe em um mundo de histórias inesquecíveis',
    ctaButton: 'Explorar Histórias',
  },
  
  // Genre Page
  genre: {
    genreLabel: 'Gênero',
    allGenres: 'Todos os Gêneros',
    storiesCount: '{count} histórias',
    storyCount: '{count} história',
    exploreStories: 'Explorar histórias →',
    sortBy: 'Ordenar por',
    sortOptions: {
      date: 'Mais recentes',
      oldest: 'Mais antigos',
      rating: 'Melhor avaliados',
      reads: 'Mais lidos',
      title: 'Título A-Z',
    },
    perPage: 'Por página',
    noStories: 'Nenhuma história encontrada neste gênero ainda.',
    notFound: 'Gênero Não Encontrado',
    notFoundDesc: 'O gênero que você procura não existe ou pode ter sido removido. Vamos colocar você de volta nos trilhos!',
  },
  
  // Theme Page
  theme: {
    themeLabel: 'Tema',
    allThemes: 'Todos os Temas',
    storiesCount: '{count} histórias',
    exploreStories: 'Explorar histórias →',
    noStories: 'Nenhuma história encontrada com este tema.',
    notFound: 'Tema Não Encontrado',
    notFoundDesc: 'O tema que você procura não existe ou pode ter sido removido.',
  },
  
  // Author Page
  author: {
    authorLabel: 'Autor',
    memberSince: 'Membro desde',
    totalStories: 'Total de histórias',
    avgRating: 'Avaliação média',
    totalReads: 'Total de leituras',
    storiesByAuthor: 'Histórias de {name}',
    noStories: 'Este autor ainda não tem histórias publicadas.',
    notFound: 'Autor Não Encontrado',
    notFoundDesc: 'O autor que você procura não foi encontrado.',
  },
  
  // Story Page
  story: {
    publishedAt: 'Publicado em',
    readingTime: 'min de leitura',
    rating: 'Avaliação',
    votes: 'votos',
    reads: 'leituras',
    comments: 'comentários',
    saveStory: 'Salvar',
    shareStory: 'Compartilhar',
    relatedStories: 'Histórias Relacionadas',
    moreFromAuthor: 'Mais do Autor',
    moreInGenre: 'Mais em',
    backToStories: 'Voltar às Histórias',
    introduction: 'Introdução:',
    endOfStory: '✨ Fim da História ✨',
    notFound: 'História Não Encontrada',
    notFoundDesc: 'A história que você procura não existe ou foi removida.',
  },
  
  // Story Card
  card: {
    by: 'por',
    readMore: 'Ler mais',
    viewStory: 'Ver História',
  },
  
  // Common
  common: {
    loading: 'Carregando...',
    error: 'Ocorreu um erro',
    retry: 'Tentar novamente',
    back: 'Voltar',
    next: 'Próximo',
    previous: 'Anterior',
    page: 'Página',
    of: 'de',
    showAll: 'Mostrar todos',
    close: 'Fechar',
    language: 'Idioma',
    changeLanguage: 'Alterar Idioma',
  },
  
  // Footer
  footer: {
    description: 'FaceLove - O melhor lugar para descobrir histórias que tocam o coração.',
    explore: 'Explorar',
    community: 'Comunidade',
    legal: 'Legal',
    about: 'Sobre',
    contact: 'Contato',
    privacy: 'Privacidade',
    terms: 'Termos',
    copyright: '© {year} FaceLove. Feito com ❤️',
  },
  
  // Meta tags for SEO
  meta: {
    homeTitle: 'FaceLove - Descubra Histórias que Tocam o Coração',
    homeDescription: 'Explore milhares de histórias de romance, ficção, fantasia e mais. Encontre sua próxima história favorita no FaceLove.',
    genresTitle: 'Gêneros - Explore Histórias por Categoria',
    themesTitle: 'Temas - Descubra Histórias por Tema',
    authorsTitle: 'Autores - Conheça Nossos Escritores',
  },
};

export type Translations = typeof ptBR;
