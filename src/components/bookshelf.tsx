"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  BookMarked,
  Plus,
  Check,
  Trash2,
  Clock,
  BookOpen,
  Star,
  ArrowRight,
  List,
  Grid3X3,
  FolderOpen,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types
interface ReadingListItem {
  id: string;
  storyId: string;
  title: string;
  author?: string;
  genre?: string;
  slug?: string;
  addedAt: number;
  notes?: string;
  status: "want-to-read" | "reading" | "completed" | "on-hold";
  rating?: number;
  progress?: number; // 0-100
}

interface ReadingList {
  id: string;
  name: string;
  description?: string;
  items: ReadingListItem[];
  createdAt: number;
  isDefault?: boolean;
  color?: string;
}

// LocalStorage key
const LISTS_KEY = "facelove-reading-lists";

// Color options for lists
const LIST_COLORS = [
  "#9333ea", // Purple (default)
  "#ec4899", // Pink
  "#f97316", // Orange
  "#14b8a6", // Teal
  "#3b82f6", // Blue
  "#84cc16", // Lime
];

// Get all reading lists
function getReadingLists(): ReadingList[] {
  try {
    const data = localStorage.getItem(LISTS_KEY);
    if (!data) return getDefaultLists();
    return JSON.parse(data);
  } catch {
    return getDefaultLists();
  }
}

// Create default lists if none exist
function getDefaultLists(): ReadingList[] {
  const defaultLists: ReadingList[] = [
    {
      id: "default-want-to-read",
      name: "Quero Ler",
      description: "Histórias que você quer ler no futuro",
      isDefault: true,
      color: "#9333ea",
      items: [],
      createdAt: Date.now(),
    },
    {
      id: "default-reading",
      name: "Lendo Agora",
      description: "Histórias que você está lendo atualmente",
      isDefault: true,
      color: "#14b8a6",
      items: [],
      createdAt: Date.now(),
    },
    {
      id: "default-completed",
      name: "Concluídas",
      description: "Histórias que você já terminou de ler",
      isDefault: true,
      color: "#84cc16",
      items: [],
      createdAt: Date.now(),
    },
  ];
  
  saveReadingLists(defaultLists);
  return defaultLists;
}

// Save all reading lists
function saveReadingLists(lists: ReadingList[]): void {
  try {
    localStorage.setItem(LISTS_KEY, JSON.stringify(lists));
    window.dispatchEvent(new CustomEvent("readingListsChanged"));
  } catch {
    // Ignore errors
  }
}

// Add story to a list
export function addToList(
  listId: string,
  item: Omit<ReadingListItem, "id" | "addedAt">
): boolean {
  try {
    const lists = getReadingLists();
    const listIndex = lists.findIndex((l) => l.id === listId);

    if (listIndex === -1) return false;

    // Check if already in list
    const exists = lists[listIndex].items.some(
      (i) => i.storyId === item.storyId
    );
    if (exists) {
      toast.info("Esta história já está na lista");
      return false;
    }

    lists[listIndex].items.unshift({
      ...item,
      id: `item-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      addedAt: Date.now(),
    });

    saveReadingLists(lists);
    toast.success("Adicionada à lista!", {
      description: `"${item.title}" adicionado à lista "${lists[listIndex].name}"`,
    });
    return true;
  } catch (error) {
    toast.error("Erro ao adicionar à lista");
    return false;
  }
}

// Remove item from list
export function removeFromList(listId: string, itemId: string): void {
  try {
    const lists = getReadingLists();
    const listIndex = lists.findIndex((l) => l.id === listId);

    if (listIndex === -1) return;

    lists[listIndex].items = lists[listIndex].items.filter(
      (i) => i.id !== itemId
    );

    saveReadingLists(lists);
    toast.success("Removida da lista");
  } catch {
    toast.error("Erro ao remover da lista");
  }
}

// Move item to different list
export function moveToList(
  fromListId: string,
  toListId: string,
  itemId: string
): void {
  try {
    const lists = getReadingLists();
    const fromIndex = lists.findIndex((l) => l.id === fromListId);
    const toIndex = lists.findIndex((l) => l.id === toListId);

    if (fromIndex === -1 || toIndex === -1) return;

    const itemIndex = lists[fromIndex].items.findIndex(
      (i) => i.id === itemId
    );
    if (itemIndex === -1) return;

    const [item] = lists[fromIndex].items.splice(itemIndex, 1);
    
    // Update status based on target list
    switch (toListId) {
      case "default-want-to-read":
        item.status = "want-to-read";
        break;
      case "default-reading":
        item.status = "reading";
        break;
      case "default-completed":
        item.status = "completed";
        break;
    }

    lists[toIndex].items.unshift(item);
    saveReadingLists(lists);
    toast.success("Movida para outra lista");
  } catch {
    toast.error("Erro ao mover item");
  }
}

// Update item status/progress
export function updateItemProgress(
  listId: string,
  itemId: string,
  updates: Partial<Pick<ReadingListItem, "progress" | "status" | "rating" | "notes">>
): void {
  try {
    const lists = getReadingLists();
    const listIndex = lists.findIndex((l) => l.id === listId);

    if (listIndex === -1) return;

    const itemIndex = lists[listIndex].items.findIndex(
      (i) => i.id === itemId
    );
    if (itemIndex === -1) return;

    lists[listIndex].items[itemIndex] = {
      ...lists[listIndex].items[itemIndex],
      ...updates,
    };

    saveReadingLists(lists);
  } catch {
    // Ignore
  }
}

// Create new custom list
export function createCustomList(name: string, description?: string): ReadingList {
  const newList: ReadingList = {
    id: `custom-${Date.now()}`,
    name,
    description,
    color: LIST_COLORS[Math.floor(Math.random() * LIST_COLORS.length)],
    items: [],
    createdAt: Date.now(),
  };

  const lists = getReadingLists();
  lists.push(newList);
  saveReadingLists(lists);
  
  toast.success(`Lista "${name}" criada!`);
  return newList;
}

// Delete a custom list
export function deleteCustomList(listId: string): void {
  const lists = getReadingLists().filter((l) => l.id !== listId);
  saveReadingLists(lists);
  toast.success("Lista removida");
}

// Check if story is in any list
export function isInAnyList(storyId: string): ReadingListItem | null {
  const lists = getReadingLists();
  for (const list of lists) {
    const found = list.items.find((i) => i.storyId === storyId);
    if (found) return found;
  }
  return null;
}

// Get status badge info
function getStatusInfo(status: ReadingListItem["status"]) {
  switch (status) {
    case "reading":
      return { label: "Lendo", className: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400" };
    case "completed":
      return { label: "Concluído", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" };
    case "on-hold":
      return { label: "Pausado", className: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" };
    default:
      return { label: "Quero Ler", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" };
  }
}

// Format relative time
function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return "agora";
  if (seconds < 3600) return `há ${Math.floor(seconds / 60)}min`;
  if (seconds < 86400) return `há ${Math.floor(seconds / 3600)}h`;
  return new Date(timestamp).toLocaleDateString("pt-BR");
}

interface AddToListButtonProps {
  storyId: string;
  title: string;
  author?: string;
  genre?: string;
  slug?: string;
  /** Compact variant */
  compact?: boolean;
  /** Additional class names */
  className?: string;
}

export function AddToListButton({
  storyId,
  title,
  author,
  genre,
  slug,
  compact = false,
  className,
}: AddToListButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Use lazy initializer for lists
  const [lists, setLists] = useState<ReadingList[]>(() => getReadingLists());
  const isInList = isInAnyList(storyId);

  // Update lists when event fires
  useEffect(() => {
    const handleChange = () => setLists(getReadingLists());
    window.addEventListener("readingListsChanged", handleChange);
    return () => window.removeEventListener("readingListsChanged", handleChange);
  }, []);

  const handleAdd = (listId: string) => {
    addToList(listId, {
      storyId,
      title,
      author,
      genre,
      slug,
      status: "want-to-read",
    });
    setIsOpen(false);
  };

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={isInList ? "secondary" : "ghost"}
            size="icon"
            className={cn(
              "h-9 w-9",
              isInList && "text-purple-500 bg-purple-50 dark:bg-purple-900/20",
              className
            )}
          >
            <BookMarked
              className={cn(
                "w-4 h-4",
                isInList && "fill-current"
              )}
            />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <p className="text-sm font-medium px-2 py-1.5">Adicionar à Lista</p>
          {lists.map((list) => (
            <DropdownMenuItem
              key={list.id}
              onClick={() => handleAdd(list.id)}
              className="cursor-pointer"
            >
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: list.color }}
              />
              {list.name}
              ({list.items.length})
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <>
      <Button
        variant={isInList ? "secondary" : "outline"}
        size="sm"
        onClick={() => setIsOpen(true)}
        className={cn(
          "gap-2",
          isInList &&
            "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
        )}
      >
        <BookMarked
          className={cn("w-4 h-4", isInList && "fill-current")}
        />
        {isInList ? "Na Lista" : "Adicionar"}
      </Button>

      {/* Selection Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-purple-500" />
              Adicionar à Lista de Leitura
            </DialogTitle>
            <DialogDescription>
              Escolha onde adicionar "{title}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 mt-4">
            {lists.map((list) => (
              <button
                key={list.id}
                onClick={() => handleAdd(list.id)}
                className="w-full flex items-center justify-between p-3 rounded-lg border hover:bg-muted transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: list.color }}
                  />
                  <div className="text-left">
                    <p className="font-medium text-sm group-hover:text-purple-600">
                      {list.name}
                    </p>
                    {list.description && (
                      <p className="text-xs text-muted-foreground">
                        {list.description}
                      </p>
                    )}
                  </div>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {list.items.length}
                </Badge>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Full Bookshelf Component
interface BookshelfProps {
  /** Show specific list only */
  filterByListId?: string;
  /** View mode */
  viewMode?: "grid" | "list";
  /** Additional class names */
  className?: string;
}

export function Bookshelf({
  filterByListId,
  viewMode = "grid",
  className,
}: BookshelfProps) {
  // Use lazy initializer for initial data
  const [lists, setLists] = useState<ReadingList[]>(() => getReadingLists());
  const [activeTab, setActiveTab] = useState<string>(
    filterByListId || "all"
  );

  // Update lists when event fires (only in callbacks)
  useEffect(() => {
    const handleChange = () => setLists(getReadingLists());
    window.addEventListener("readingListsChanged", handleChange);
    return () => window.removeEventListener("readingListsChanged", handleChange);
  }, []);

  // Filter lists for display
  const displayLists = activeTab === "all"
    ? lists
    : lists.filter((l) => l.id === activeTab);

  // Count total items across all lists
  const totalCount = lists.reduce((acc, l) => acc + l.items.length, 0);

  if (totalCount === 0) {
    return (
      <Card className={className}>
        <CardContent className="pt-6 text-center py-12">
          <FolderOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="font-semibold mb-2">Sua estante está vazia</h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            Adicione histórias às suas listas de leitura enquanto explora o FaceLove!
          </p>
          <Link href="/stories">
            <Button className="mt-4 gap-2" variant="outline">
              <BookOpen className="w-4 h-4" />
              Explorar Histórias
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BookMarked className="w-6 h-6 text-purple-500" />
          Minha Estante
          <Badge variant="secondary">{totalCount}</Badge>
        </h2>

        {!filterByListId && (
          <div className="flex items-center gap-1 overflow-x-auto pb-2">
            <button
              onClick={() => setActiveTab("all")}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === "all"
                  ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                  : "hover:bg-muted text-muted-foreground"
              )}
            >
              Todas ({totalCount})
            </button>
            {lists.map((list) => (
              <button
                key={list.id}
                onClick={() => setActiveTab(list.id)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex items-center gap-1.5",
                  activeTab === list.id
                    ? "text-white"
                    : "hover:bg-muted text-muted-foreground"
                )}
                style={
                  activeTab === list.id
                    ? { backgroundColor: list.color }
                    : {}
                }
              >
                {list.name} ({list.items.length})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lists content */}
      {displayLists.map((list) => (
        <div key={list.id}>
          {filterByListId || displayLists.length > 1 ? (
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: list.color }}
              />
              {list.name}
              <Badge variant="outline" className="text-xs">
                {list.items.length}
              </Badge>
            </h3>
          ) : null}

          {viewMode === "grid" ? (
            /* Grid View */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {list.items.map((item) => (
                <Card
                  key={item.id}
                  className="group overflow-hidden hover:shadow-md transition-all"
                >
                  <Link href={`/story/${item.storyId}`}>
                    <div
                      className="h-2"
                      style={{ backgroundColor: list.color }}
                    />
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-medium line-clamp-2 group-hover:text-purple-600 transition-colors">
                          {item.title}
                        </h4>
                        <Badge {...getStatusInfo(item.status)} className="shrink-0 text-[10px] px-1.5 py-0">
                          {getStatusInfo(item.status).label}
                        </Badge>
                      </div>

                      {(item.author || item.genre) && (
                        <p className="text-xs text-muted-foreground truncate">
                          {[item.author, item.genre].filter(Boolean).join(" • ")}
                        </p>
                      )}

                      {/* Progress bar */}
                      {item.progress !== undefined && item.progress > 0 && (
                        <div className="mt-3 space-y-1">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all"
                              style={{
                                width: `${item.progress}%`,
                                backgroundColor: list.color,
                              }}
                            />
                          </div>
                          <p className="text-[10px] text-right text-muted-foreground">
                            {item.progress}% lido
                          </p>
                        </div>
                      )}

                      <p className="text-[10px] text-muted-foreground mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Adicionado {timeAgo(item.addedAt)}
                      </p>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="space-y-2">
              {list.items.map((item) => (
                <Link
                  key={item.id}
                  href={`/story/${item.storyId}`}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors group"
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarFallback
                      style={{ backgroundColor: `${list.color}20`, color: list.color }}
                      className="text-xs"
                    >
                      <BookOpen className="w-4 h-4" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-purple-600">
                      {item.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {item.author && `${item.author}`}
                      {item.author && item.genre && " • "}
                      {item.genre && item.genre}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge {...getStatusInfo(item.status)} className="text-[10px]">
                      {getStatusInfo(item.status).label}
                    </Badge>
                    {item.rating && (
                      <span className="flex items-center gap-0.5 text-xs">
                        <Star className="w-3 h-3 text-yellow-400 fill-current" />
                        {item.rating}
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Hook for accessing reading lists data
export function useReadingLists() {
  // Use lazy initializer for initial data
  const [lists, setLists] = useState<ReadingList[]>(() => getReadingLists());

  useEffect(() => {
    const handleChange = () => setLists(getReadingLists());
    window.addEventListener("readingListsChanged", handleChange);
    return () => window.removeEventListener("readingListsChanged", handleChange);
  }, []);

  const totalItems = lists.reduce((acc, l) => acc + l.items.length, 0);

  return {
    lists,
    totalItems,
    add: addToList,
    remove: removeFromList,
    move: moveToList,
    update: updateItemProgress,
    create: createCustomList,
    delete: deleteCustomList,
    isInList: isInAnyList,
    refresh: updateData,
  };
}
