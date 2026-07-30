"use client";

import { useState, useEffect } from "react";
import {
  Bookmark,
  BookmarkPlus,
  BookmarkCheck,
  Trash2,
  X,
  Plus,
  StickyNote,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  addBookmark,
  removeBookmark,
  getStoryBookmarks,
  clearBookmarks,
  type Bookmark,
} from "@/lib/bookmarks";
import { toast } from "sonner";

interface BookmarkButtonProps {
  storyId: string;
  storyTitle: string;
  /** Current scroll position (0-100) */
  currentPosition?: number;
  /** Show bookmark list when clicked */
  showList?: boolean;
  /** Compact variant */
  compact?: boolean;
}

export function BookmarkButton({
  storyId,
  storyTitle,
  currentPosition = 0,
  showList = false,
  compact = false,
}: BookmarkButtonProps) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "list">("add");
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Load bookmarks
  useEffect(() => {
    loadBookmarks();

    const handleChange = () => loadBookmarks();
    window.addEventListener("bookmarksChanged", handleChange);
    return () => window.removeEventListener("bookmarksChanged", handleChange);
  }, [storyId]);

  function loadBookmarks() {
    if (showList) {
      // Get all bookmarks
      const all = localStorage.getItem("facelove-bookmarks");
      setBookmarks(all ? JSON.parse(all) : []);
    } else {
      // Get only this story's bookmarks
      setBookmarks(getStoryBookmarks(storyId));
    }
  }

  // Add new bookmark
  const handleAddBookmark = async () => {
    setIsLoading(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 200)); // Brief delay for UX
      
      const bookmark = addBookmark({
        storyId,
        storyTitle,
        position: currentPosition,
        note: note.trim() || undefined,
      });
      
      setNote("");
      setIsDialogOpen(false);
      
      toast.success("Marcador adicionado!", {
        description: `Posição salva: ${Math.round(currentPosition)}%`,
        action: {
          label: "Ver",
          onClick: () => {
            setDialogMode("list");
            setIsDialogOpen(true);
          },
        },
      });
    } catch (error) {
      toast.error("Erro ao salvar marcador");
    } finally {
      setIsLoading(false);
    }
  };

  // Remove bookmark
  const handleRemove = async (bookmarkId: string) => {
    try {
      removeBookmark(bookmarkId);
      toast.success("Marcador removido");
    } catch {
      toast.error("Erro ao remover marcador");
    }
  };

  // Clear all
  const handleClearAll = async () => {
    if (!confirm("Tem certeza que deseja remover todos os marcadores?")) return;
    
    try {
      clearBookmarks();
      setBookmarks([]);
      toast.success("Todos os marcadores removidos");
      setIsDialogOpen(false);
    } catch {
      toast.error("Erro ao limpar marcadores");
    }
  };

  // Check if current position is already bookmarked (within 5% tolerance)
  const hasBookmarkNearPosition = bookmarks.some(
    (b) => Math.abs(b.position - currentPosition) < 5
  );

  if (compact) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={`h-9 w-9 ${hasBookmarkNearPosition ? "text-purple-500" : ""}`}
              onClick={() => {
                setDialogMode(bookmarks.length > 0 && showList ? "list" : "add");
                setIsDialogOpen(true);
              }}
            >
              {bookmarks.length > 0 ? (
                <BookmarkCheck className="h-4 w-4 text-purple-500" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {bookmarks.length > 0
              ? `${bookmarks.length} marcador(es)`
              : "Adicionar marcador"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <>
      {/* Main Button */}
      <Button
        variant={bookmarks.length > 0 ? "secondary" : "outline"}
        size="sm"
        gap={2}
        className="relative"
        onClick={() => {
          setDialogMode(hasBookmarkNearPosition || bookmarks.length > 0 && !showList ? "list" : "add");
          setIsDialogOpen(true);
        }}
      >
        {bookmarks.length > 0 ? (
          <>
            <BookmarkCheck className="w-4 h-4 text-purple-500" />
            Marcadores ({bookmarks.length})
          </>
        ) : (
          <>
            <BookmarkPlus className="w-4 h-4" />
            Salvar Posição
          </>
        )}
      </Button>

      {/* Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StickyNote className="w-5 h-5 text-purple-500" />
              {dialogMode === "add" ? "Novo Marcador" : "Seus Marcadores"}
            </DialogTitle>
            <DialogDescription>
              {dialogMode === "add"
                ? "Salve sua posição atual para retornar depois"
                : "Clique em um marcador para ir até aquela posição"}
            </DialogDescription>
          </DialogHeader>

          {dialogMode === "add" ? (
            /* Add Bookmark Form */
            <div className="space-y-4 mt-4">
              {/* Current Position Display */}
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-sm text-muted-foreground">Posição Atual</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(currentPosition)}%
                </p>
              </div>

              {/* Note Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-1.5">
                  <StickyNote className="w-3.5 h-3.5" />
                  Nota (opcional)
                </label>
                <Textarea
                  placeholder="Ex: Capítulo interessante sobre..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  maxLength={200}
                />
                <p className="text-[10px] text-muted-foreground text-right">
                  {note.length}/200
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddBookmark}
                  disabled={isLoading}
                  className="flex-1 gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  Salvar
                </Button>
              </div>
            </div>
          ) : (
            /* Bookmarks List */
            <div className="mt-4 space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {bookmarks.length === 0 ? (
                /* Empty State */
                <div className="text-center py-8">
                  <Bookmark className="w-12 h-12 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">
                    Nenhum marcador salvo
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => setDialogMode("add")}
                  >
                    Criar primeiro marcador
                  </Button>
                </div>
              ) : (
                /* Bookmarks */
                <>
                  {bookmarks.map((bookmark) => (
                    <div
                      key={bookmark.id}
                      className="group p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <button
                          className="flex-1 text-left min-w-0"
                          onClick={() => {
                            // Scroll to position - dispatch event for story page
                            window.dispatchEvent(
                              new CustomEvent("scrollToPosition", {
                                detail: { position: bookmark.position },
                              })
                            );
                            setIsDialogOpen(false);
                            toast.success(`Indo para ${Math.round(bookmark.position)}%`);
                          }}
                        >
                          <p className="font-medium text-sm truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            {bookmark.storyTitle}
                          </p>
                          
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{Math.round(bookmark.position)}% da história</span>
                          </div>

                          {bookmark.note && (
                            <p className="mt-2 text-xs bg-muted/50 p-2 rounded line-clamp-2">
                              {bookmark.note}
                            </p>
                          )}

                          <p className="text-[10px] text-muted-foreground mt-1.5">
                            {new Date(bookmark.createdAt).toLocaleString("pt-BR")}
                          </p>
                        </button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemove(bookmark.id);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Clear All */}
                  {bookmarks.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleClearAll}
                      className="w-full text-destructive hover:text-destructive text-xs"
                    >
                      Limpar todos os marcadores
                    </Button>
                  )}
                </>
              )}
            </div>
          )}

          {/* Mode Switch */}
          {(dialogMode === "list" || bookmarks.length > 0) && (
            <div className="pt-4 border-t mt-4">
              <Button
                variant="ghost"
                size="sm"
                className="w-full gap-2"
                onClick={() =>
                  setDialogMode((m) => (m === "add" ? "list" : "add"))
                }
              >
                {dialogMode === "add" ? (
                  <>
                    Ver marcadores existentes
                    <Bookmark className="w-3.5 h-3.5" />
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    Novo marcador
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

// Full bookmarks panel for sidebar/dedicated page
export function BookmarksPanel({ compact = false }: { compact?: boolean }) {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  useEffect(() => {
    loadBookmarks();
    
    const handleChange = () => loadBookmarks();
    window.addEventListener("bookmarksChanged", handleChange);
    return () => window.removeEventListener("bookmarksChanged", handleChange);
  }, []);

  function loadBookmarks() {
    const all = localStorage.getItem("facelove-bookmarks");
    setBookmarks(all ? JSON.parse(all) : []);
  }

  if (compact) {
    return (
      <div className="space-y-2">
        {bookmarks.slice(0, 3).map((bookmark) => (
          <a
            key={bookmark.id}
            href={`/story/${bookmark.storyId}`}
            className="block p-2 rounded-lg hover:bg-muted transition-colors group"
          >
            <p className="text-xs font-medium truncate group-hover:text-purple-600">
              {bookmark.storyTitle}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {Math.round(bookmark.position)}%
            </p>
          </a>
        ))}
      </div>
    );
  }

  return null; // Full panel would be implemented separately
}
