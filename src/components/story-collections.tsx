"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Sparkles,
  Heart,
  Star,
  Clock,
  TrendingUp,
  BookOpen,
  Users,
  Flame,
  Crown,
  ArrowRight,
  Plus,
  Grid3X3,
  List,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

// Types
interface CollectionItem {
  storyId: string;
  title: string;
  author?: string;
  genre?: string;
  slug?: string;
  coverUrl?: string;
  rating?: number;
}

interface StoryCollection {
  id: string;
  title: string;
  description: string;
  coverGradient: string; // CSS gradient for cover
  icon: string;
  type: "curated" | "trending" | "staff-picks" | "seasonal" | "custom";
  items: CollectionItem[];
  author?: string; // For curated collections
  createdAt: Date;
  isFeatured?: boolean;
  tags?: string[];
}

// Predefined collections (in a real app, these would come from API)
const PREDEFINED_COLLECTIONS: StoryCollection[] = [
  {
    id: "trending-week",
    title: "Em Alta Esta Semana",
    description:
      "As histórias mais populares da semana, escolhidas pela comunidade FaceLove",
    coverGradient: "from-orange-500 via-rose-500 to-pink-500",
    icon: "TrendingUp",
    type: "trending",
    items: [], // Would be populated from API
    isFeatured: true,
    tags: ["popular", "semanal"],
  },
  {
    id: "romance-classics",
    title: "Clássicos do Romance",
    description:
      "Os romances mais amados de todos os tempos que você não pode perder",
    coverGradient: "from-pink-500 via-red-500 to-rose-600",
    icon: "Heart",
    type: "curated",
    author: "Equipe FaceLove",
    items: [],
    isFeatured: true,
    tags: ["romance", "clássicos"],
  },
  {
    id: "new-releases",
    title: "Lançamentos Recentes",
    description:
      "Descubra as histórias mais recentes adicionadas à nossa biblioteca",
    coverGradient: "from-green-500 via-teal-400 to-cyan-500",
    icon: "Sparkles",
    type: "seasonal",
    items: [],
    isFeatured: true,
    tags: ["novos", "recentes"],
  },
  {
    id: "staff-picks",
    title: "Escolhas da Equipe",
    description:
      "Histórias selecionadas manualmente por nossa equipe como favoritas pessoais",
    coverGradient: "from-purple-600 via-fuchsia-600 to-violet-600",
    icon: "Crown",
    type: "staff-picks",
    author: "Equipe FaceLove",
    items: [],
    isFeatured: false,
    tags: ["recomendado", "equipe"],
  },
  {
    id: "quick-reads",
    title: "Leituras Rápidas",
    description:
      "Histórias curtas para quando você tem pouco tempo mas quer uma boa leitura",
    coverGradient: "from-blue-500 via-indigo-500 to-purple-600",
    icon: "Clock",
    type: "custom",
    items: [],
    isFeatured: false,
    tags: ["rápido", "curto", "<5min"],
  },
  {
    id: "top-rated",
    title: "Melhor Avaliados",
    description:
      "As histórias com as maiores notas dos leitores da FaceLove",
    coverGradient: "from-yellow-500 via-amber-500 to-orange-500",
    icon: "Star",
    type: "trending",
    items: [],
    isFeatured: true,
    tags: ["top", "avaliação"],
  },
];

// LocalStorage key
const CUSTOM_COLLECTIONS_KEY = "facelove-custom-collections";
const FAVORITE_COLLECTIONS_KEY = "facelove-favorite-collections";

// Get custom collections
function getCustomCollections(): StoryCollection[] {
  try {
    const data = localStorage.getItem(CUSTOM_COLLECTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

// Save custom collection
function saveCustomCollection(collection: StoryCollection): void {
  const collections = getCustomCollections();
  
  // Check if updating or creating
  const existingIndex = collections.findIndex((c) => c.id === collection.id);
  if (existingIndex >= 0) {
    collections[existingIndex] = collection;
  } else {
    collections.unshift(collection);
  }
  
  localStorage.setItem(CUSTOM_COLLECTIONS_KEY, JSON.stringify(collections));
  window.dispatchEvent(new CustomEvent("collectionsChanged"));
}

// Delete custom collection
function deleteCustomCollection(id: string): void {
  const collections = getCustomCollections().filter((c) => c.id !== id);
  localStorage.setItem(CUSTOM_COLLECTIONS_KEY, JSON.stringify(collections));
  window.dispatchEvent(new CustomEvent("collectionsChanged"));
}

// Add/remove from favorites collections
function toggleFavoriteCollection(id: string): void {
  try {
    const saved = localStorage.getItem(FAVORITE_COLLECTIONS_KEY) || "[]";
    const favorites: string[] = JSON.parse(saved);
    
    const index = favorites.indexOf(id);
    if (index >= 0) {
      favorites.splice(index, 1);
    } else {
      favorites.push(id);
      // Limit favorites
      if (favorites.length > 10) favorites.shift();
    }
    
    localStorage.setItem(FAVORITE_COLLECTIONS_KEY, JSON.stringify(favorites));
    window.dispatchEvent(new CustomEvent("collectionsChanged"));
  } catch {
    // Ignore
  }
}

// Get favorite collection IDs
function getFavoriteCollections(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITE_COLLECTIONS_KEY) || "[]");
  } catch {
    return [];
  }
}

// Gradient options for custom collections
const GRADIENT_OPTIONS = [
  { value: "from-purple-500 to-pink-500", label: "Rosa", preview: "bg-gradient-to-r from-purple-500 to-pink-500" },
  { value: "from-blue-500 to-cyan-500", label: "Azul", preview: "bg-gradient-to-r from-blue-500 to-cyan-500" },
  { value: "from-green-500 to-emerald-500", label: "Verde", preview: "bg-gradient-to-r from-green-500 to-emerald-500" },
  { value: "from-orange-500 to-amber-500", label: "Laranja", preview: "bg-gradient-to-r from-orange-500 to-amber-500" },
  { value: "from-red-500 to-rose-500", label: "Vermelho", preview: "bg-gradient-to-r from-red-500 to-rose-500" },
  { value: "from-indigo-500 to-purple-500", label: "Índigo", preview: "bg-gradient-to-r from-indigo-500 to-purple-500" },
  { value: "from-teal-500 to-sky-500", label: "Turquesa", preview: "bg-gradient-to-r from-teal-500 to-sky-500" },
];

// Icon component for collections
function CollectionIcon({ name, className }: { name: string; className?: string }) {
  const props = { className };
  
  switch (name) {
    case "Sparkles": return <Sparkles {...props} />;
    case "Heart": return <Heart {...props} />;
    case "Star": return <Star {...props} />;
    case "Clock": return <Clock {...props} />;
    case "TrendingUp": return <TrendingUp {...props} />;
    case "BookOpen": return <BookOpen {...props} />;
    case "Users": return <Users {...props} />;
    case "Flame": return <Flame {...props} />;
    case "Crown": return <Crown {...props} />;
    default: return <Sparkles {...props} />;
  }
}

// Type badge config
const TYPE_CONFIG = {
  trending: { label: "Em Alta", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" },
  curated: { label: "Curada", className: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400" },
  "staff-picks": { label: "Da Equipe", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  seasonal: { label: "Temporada", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  custom: { label: "Personalizada", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
};

// Main Collections Component
interface CollectionsProps {
  /** Show compact grid */
  compact?: boolean;
  /** Maximum number of featured to show */
  maxFeatured?: number;
  /** Show create button */
  allowCreate?: boolean;
  /** Additional class names */
  className?: string;
  /** Callback when collection is selected */
  onSelect?: (collection: StoryCollection) => void;
}

export function StoryCollections({
  compact = false,
  maxFeatured = 3,
  allowCreate = false,
  className,
  onSelect,
}: CollectionsProps) {
  const [allCollections, setAllCollections] = useState<StoryCollection[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadCollections();
    
    const handleChange = () => loadCollections();
    window.addEventListener("collectionsChanged", handleChange);
    return () => window.removeEventListener("collectionsChanged", handleChange);
  }, []);

  function loadCollections() {
    const custom = getCustomCollections().map((c) => ({ ...c, type: "custom" as const }));
    setAllCollections([...PREDEFINED_COLLECTIONS, ...custom]);
  }

  const featured = allCollections.filter((c) => c.isFeatured).slice(0, maxFeatured);
  const regular = allCollections.filter((c) => !c.isFeatured);

  if (compact) {
    return (
      <div className={cn("space-y-4", className)}>
        {/* Featured carousel */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            Coleções em Destaque
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {featured.map((collection) => (
              <Link key={collection.id} href={`/collections/${collection.id}`}>
                <Card className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300">
                  <div
                    className={cn(
                      "h-24 bg-gradient-to-br relative overflow-hidden",
                      collection.coverGradient
                    )}
                  >
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <CollectionIcon
                        name={collection.icon}
                        className="w-8 h-8 text-white drop-shadow-lg"
                      />
                    </div>
                  </div>
                  <CardContent className="pt-3 pb-2">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm truncate group-hover:text-purple-600 transition-colors">
                        {collection.title}
                      </h4>
                      <Badge {...TYPE_CONFIG[collection.type]} className="text-[10px] px-1.5 py-0">
                        {TYPE_CONFIG[collection.type].label}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {collection.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>{collection.items?.length || 0} histórias</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* View all link */}
        <Link href="/collections">
          <Button variant="outline" size="sm" className="w-full gap-2">
            Ver todas as coleções
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    );
  }

  // Full view with tabs
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Grid3X3 className="w-6 h-6 text-purple-500" />
            Coleções de Histórias
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Curadorias e listas organizadas pela equipe e comunidade
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "grid" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("grid")}
            className="h-9 w-9"
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setViewMode("list")}
            className="h-9 w-9"
          >
            <List className="w-4 h-4" />
          </Button>
          
          {allowCreate && (
            <Link href="/collections/new">
              <Button size="sm" className="gap-1.5">
                <Plus className="w-4 h-4" />
                Criar
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Featured Section */}
      {featured.length > 0 && (
        <section>
          <h3 className="font-semibold flex items-center gap-2 mb-4">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            Destaques
          </h3>
          
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                : "space-y-3"
            }
          >
            {featured.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                variant={viewMode}
                onSelect={onSelect}
              />
            ))}
          </div>
        </section>
      )}

      {/* All Collections */}
      <section>
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-purple-500" />
          Todas as Coleções
          <Badge variant="secondary" className="ml-2">
            {allCollections.length}
          </Badge>
        </h3>

        {allCollections.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "space-y-3"
            }
          >
            {allCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                variant={viewMode}
                onSelect={onSelect}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 border rounded-xl border-dashed">
            <Grid3X3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="font-semibold mb-2">Nenhuma coleção ainda</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              As coleções aparecerão aqui assim que forem criadas
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

// Individual Collection Card
interface CollectionCardProps {
  collection: StoryCollection;
  variant: "grid" | "list";
  onSelect?: (collection: StoryCollection) => void;
}

function CollectionCard({ collection, variant, onSelect }: CollectionCardProps) {
  const config = TYPE_CONFIG[collection.type];
  const favoriteIds = getFavoriteCollections();
  const isFavorite = favoriteIds.includes(collection.id);

  if (variant === "list") {
    return (
      <Card
        className="group hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden"
        onClick={() => onSelect?.(collection)}
      >
        <div className="flex">
          {/* Cover gradient */}
          <div
            className={cn(
              "w-24 sm:w-32 shrink-0 bg-gradient-to-br relative overflow-hidden",
              collection.coverGradient
            )}
          >
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <CollectionIcon
                name={collection.icon}
                className="w-10 h-10 text-white/80 drop-shadow-lg"
              />
            </div>
          </div>

          <CardContent className="py-4 flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className="font-semibold truncate group-hover:text-purple-600 transition-colors">
                {collection.title}
              </h4>
              <Badge {...config} className="shrink-0 text-[10px] px-1.5 py-0">
                {config.label}
              </Badge>
            </div>

            {collection.author && (
              <p className="text-xs text-muted-foreground mb-2">
                Por {collection.author}
              </p>
            )}
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {collection.description}
            </p>

            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5" />
                {collection.items?.length || 0} histórias
              </span>
              
              {collection.tags && (
                <div className="flex gap-1 flex-wrap">
                  {collection.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded-full bg-muted text-[10px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // Grid card variant
  return (
    <Card
      className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => onSelect?.(collection)}
    >
      {/* Cover */}
      <div
        className={cn(
          "h-36 sm:h-40 bg-gradient-to-br relative overflow-hidden",
          collection.coverGradient
        )}
      >
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/5 transition-colors flex items-center justify-between p-4">
          <CollectionIcon
            name={collection.icon}
            className="w-8 h-8 text-white/90 drop-shadow-lg"
          />
          
          {/* Type badge */}
          <Badge
            {...config}
            className="bg-white/20 backdrop-blur-sm border-white/30 text-white text-[11px]"
          >
            {config.label}
          </Badge>
        </div>
        
        {/* Favorite indicator */}
        {isFavorite && (
          <Heart className="absolute top-2 right-2 w-5 h-5 text-white fill-current drop-shadow" />
        )}
      </div>

      <CardContent className="pt-4 pb-3">
        <h4 className="font-semibold text-sm truncate group-hover:text-purple-600 transition-colors mb-1">
          {collection.title}
        </h4>
        
        {collection.author && (
          <p className="text-[11px] text-muted-foreground mb-2">
            por {collection.author}
          </p>
        )}
        
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {collection.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <BookOpen className="w-3.5 h-3.5" />
            {collection.items?.length || 0}
          </span>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavoriteCollection(collection.id);
            }}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
          >
            <Heart
              className={cn(
                "w-4 h-4 transition-colors",
                isFavorite
                  ? "fill-pink-500 text-pink-500"
                  : "text-muted-foreground hover:text-pink-500"
              )}
            />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// Create Collection Dialog Component
export function CreateCollectionDialog({
  open,
  onOpenChange,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (collection: Omit<StoryCollection, "id" | "createdAt" | "items">) => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [gradient, setGradient] = useState(GRADIENT_OPTIONS[0].value);
  const [icon, setIcon] = useState("Sparkles");

  const handleCreate = () => {
    if (!title.trim()) return;

    const newCollection: Omit<StoryCollection, "id" | "createdAt" | "items"> = {
      title: title.trim(),
      description: description.trim(),
      coverGradient: gradient,
      icon,
      type: "custom",
      tags: [],
      author: undefined,
    };

    onCreate(newCollection);
    
    // Reset form
    setTitle("");
    setDescription("");
    setGradient(GRADIENT_OPTIONS[0].value);
    setIcon("Sparkles");
    
    onOpenChange(false);
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-purple-500" />
          Nova Coleção
        </DialogTitle>
        <DialogDescription>
          Crie sua própria coleção de histórias personalizada
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 mt-4">
        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Nome da Coleção *</label>
          <input
            type="text"
            placeholder="Ex: Meus Favoritos de Verão"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            maxLength={50}
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Descrição</label>
          <textarea
            placeholder="O que torna esta coleção especial?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
            rows={3}
            maxLength={200}
          />
        </div>

        {/* Cover Gradient */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Capa</label>
          <div className="grid grid-cols-3 gap-2">
            {GRADIENT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setGradient(opt.value)}
                className={cn(
                  "h-10 rounded-md border-2 transition-all",
                  gradient === opt.value
                    ? "border-purple-500 ring-2 ring-purple-200"
                    : "hover:border-gray-300"
                )}
              >
                <span className={cn("h-full w-full rounded-md inline-block", opt.preview)} />
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!title.trim()}
            className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
          >
            <Plus className="w-4 h-4" />
            Criar
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

// Hook for using collections
export function useStoryCollections() {
  const [collections, setCollections] = useState<StoryCollection[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    updateData();

    const handleChange = () => updateData();
    window.addEventListener("collectionsChanged", handleChange);
    return () => window.removeEventListener("collectionsChanged", handleChange);
  }, []);

  function updateData() {
    setCollections([...PREDEFINED_COLLECTIONS, ...getCustomCollections()]);
    setFavoriteIds(getFavoriteCollections());
  }

  return {
    collections,
    favoriteIds,
    refresh: updateData,
    addFavorite: (id: string) => toggleFavoriteCollection(id),
    removeFavorite: (id: string) => toggleFavoriteCollection(id),
    create: saveCustomCollection,
    delete: deleteCustomCollection,
  };
}
