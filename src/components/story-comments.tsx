"use client";

import { useState, useEffect, useCallback } from "react";
import {
  MessageSquare,
  Star,
  ThumbsUp,
  ThumbsDown,
  Send,
  User,
  Flag,
  MoreHorizontal,
  Reply,
  Heart,
  Trash2,
  Edit3,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Types
interface Comment {
  id: string;
  storyId: string;
  author: string;
  content: string;
  rating?: number;
  likes: number;
  dislikes: number;
  userVote?: "up" | "down";
  createdAt: Date;
  replies?: Comment[];
  isEdited?: boolean;
}

// Generate unique ID
function generateId(): string {
  return `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// LocalStorage key
const COMMENTS_KEY = "facelove-comments";

// Load comments for a story
function loadComments(storyId: string): Comment[] {
  try {
    const all = JSON.parse(localStorage.getItem(COMMENTS_KEY) || "{}");
    return (all[storyId] || []).map((c: Comment) => ({
      ...c,
      createdAt: new Date(c.createdAt),
    }));
  } catch {
    return [];
  }
}

// Save comments
function saveComments(storyId: string, comments: Comment[]): void {
  try {
    const all = JSON.parse(localStorage.getItem(COMMENTS_KEY) || "{}");
    all[storyId] = comments;
    localStorage.setItem(COMMENTS_KEY, JSON.stringify(all));
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent("commentsChanged", { detail: { storyId, count: comments.length } }));
  } catch {
    // Ignore storage errors
  }
}

// Format relative time
function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "agora mesmo";
  if (seconds < 3600) return `há ${Math.floor(seconds / 60)}min`;
  if (seconds < 86400) return `há ${Math.floor(seconds / 3600)}h`;
  if (seconds < 604800) return `há ${Math.floor(seconds / 86400)}d`;
  
  return date.toLocaleDateString("pt-BR");
}

interface StoryCommentsProps {
  storyId: string;
  storyTitle?: string;
  /** Max visible comments before "show more" */
  maxVisible?: number;
  /** Show rating input in comment form */
  allowRating?: boolean;
  /** Additional class names */
  className?: string;
}

export function StoryComments({
  storyId,
  storyTitle,
  maxVisible = 5,
  allowRating = true,
  className,
}: StoryCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [newRating, setNewRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [replyTo, setReplyTo] = useState<Comment | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [commentToDelete, setCommentToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load comments on mount
  useEffect(() => {
    loadStoryComments();
    
    const handleChange = () => loadStoryComments();
    window.addEventListener("commentsChanged", handleChange);
    return () => window.removeEventListener("commentsChanged", handleChange);
  }, [storyId]);

  function loadStoryComments() {
    setComments(loadComments(storyId));
  }

  // Submit new comment
  const handleSubmit = useCallback(async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const comment: Comment = {
        id: generateId(),
        storyId,
        author: "Leitor", // Default anonymous name
        content: newComment.trim(),
        rating: allowRating ? newRating : undefined,
        likes: 0,
        dislikes: 0,
        createdAt: new Date(),
      };

      const updated = [comment, ...comments];
      saveComments(storyId, updated);
      setComments(updated);
      setNewComment("");
      setNewRating(0);

      toast.success("Comentário publicado!", {
        description: "Seu comentário foi adicionado com sucesso.",
      });
    } catch {
      toast.error("Erro ao publicar comentário");
    } finally {
      setIsSubmitting(false);
    }
  }, [newComment, newRating, comments, storyId, allowRating, isSubmitting]);

  // Submit reply
  const handleReply = async () => {
    if (!replyText.trim() || !replyTo) return;

    try {
      await new Promise((resolve) => setTimeout(resolve, 300));

      const reply: Comment = {
        id: generateId(),
        storyId,
        author: "Leitor",
        content: replyText.trim(),
        likes: 0,
        dislikes: 0,
        createdAt: new Date(),
      };

      const updateReplies = (cmts: Comment[]): Comment[] =>
        cmts.map((c) => {
          if (c.id === replyTo.id) {
            return {
              ...c,
              replies: [...(c.replies || []), reply],
            };
          }
          if (c.replies) {
            return { ...c, replies: updateReplies(c.replies) };
          }
          return c;
        });

      const updated = updateReplies(comments);
      saveComments(storyId, updated);
      setComments(updated);
      setReplyText("");
      setReplyTo(null);

      toast.success("Resposta publicada!");
    } catch {
      toast.error("Erro ao publicar resposta");
    }
  };

  // Vote on comment
  const handleVote = (commentId: string, voteType: "up" | "down") => {
    const updateVote = (cmts: Comment[]): Comment[] =>
      cmts.map((c) => {
        if (c.id === commentId) {
          let newLikes = c.likes;
          let newDislikes = c.dislikes;
          let userVote = c.userVote;

          if (userVote === voteType) {
            // Remove vote
            if (voteType === "up") newLikes--;
            else newDislikes--;
            userVote = undefined;
          } else {
            // Change or add vote
            if (userVote === "up") newLikes--;
            if (userVote === "down") newDislikes--;
            if (voteType === "up") newLikes++;
            else newDislikes++;
            userVote = voteType;
          }

          return { ...c, likes: newLikes, dislikes: newDislikes, userVote };
        }
        if (c.replies) {
          return { ...c, replies: updateVote(c.replies) };
        }
        return c;
      });

    const updated = updateVote(comments);
    saveComments(storyId, updated);
    setComments(updated);
  };

  // Edit comment
  const handleEdit = () => {
    if (!editText.trim() || !editingComment) return;

    const editInList = (cmts: Comment[]): Comment[] =>
      cmts.map((c) => {
        if (c.id === editingComment) {
          return { ...c, content: editText.trim(), isEdited: true };
        }
        if (c.replies) {
          return { ...c, replies: editInList(c.replies) };
        }
        return c;
      });

    const updated = editInList(comments);
    saveComments(storyId, updated);
    setComments(updated);
    setEditingComment(null);
    setEditText("");

    toast.success("Comentário atualizado");
  };

  // Delete comment
  const handleDelete = () => {
    if (!commentToDelete) return;

    const deleteFromList = (cmts: Comment[]): Comment[] =>
      cmts.filter((c) => {
        if (c.id === commentToDelete) return false;
        if (c.replies) {
          c.replies = deleteFromList(c.replies);
        }
        return true;
      });

    const updated = deleteFromList(comments);
    saveComments(storyId, updated);
    setComments(updated);
    setDeleteDialogOpen(false);
    setCommentToDelete(null);

    toast.success("Comentário removido");
  };

  // Calculate average rating
  const averageRating =
    comments.filter((c) => c.rating).length > 0
      ? (
          comments.reduce((sum, c) => sum + (c.rating || 0), 0) /
          comments.filter((c) => c.rating).length
        ).toFixed(1)
      : null;

  // Displayed comments
  const displayedComments = showAll ? comments : comments.slice(0, maxVisible);
  const totalComments = comments.length;
  const totalReplies = comments.reduce(
    (acc, c) => acc + (c.replies?.length || 0),
    0
  );

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <MessageSquare className="w-5 h-5 text-purple-500" />
          <h3 className="text-lg font-semibold">
            Comentários ({totalComments})
          </h3>
          
          {/* Average Rating Badge */}
          {averageRating && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-sm">
              <Star className="w-4 h-4 fill-current" />
              {averageRating}
            </span>
          )}
        </div>

        {totalReplies > 0 && (
          <span className="text-sm text-muted-foreground">
            +{totalReplies} respostas
          </span>
        )}
      </div>

      {/* Comment Form */}
      <Card className="bg-gradient-to-br from-purple-50/50 to-pink-50/30 dark:from-purple-950/20 dark:to-pink-950/10">
        <CardContent className="pt-5 space-y-4">
          {/* Rating Input */}
          {allowRating && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sua avaliação:</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setNewRating(newRating === star ? 0 : star)}
                    className="p-0.5 transition-transform hover:scale-110"
                  >
                    <Star
                      className={cn(
                        "w-6 h-6 transition-colors",
                        star <= (hoverRating || newRating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      )}
                    />
                  </button>
                ))}
                {newRating > 0 && (
                  <span className="ml-2 text-sm text-yellow-600 dark:text-yellow-400">
                    {newRating}/5
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Comment Input */}
          <Textarea
            placeholder={`Escreva um comentário sobre "${storyTitle || "esta história"}"...`}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            maxLength={1000}
            className="resize-none bg-background"
          />

          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {newComment.length}/1000
            </span>
            
            <Button
              onClick={handleSubmit}
              disabled={!newComment.trim() || isSubmitting}
              className="gap-2 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Publicar
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Comments List */}
      {displayedComments.length > 0 ? (
        <div className="space-y-4">
          {displayedComments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              onVote={handleVote}
              onReply={() => setReplyTo(comment)}
              onEdit={() => {
                setEditingComment(comment.id);
                setEditText(comment.content);
              }}
              onDelete={() => {
                setCommentToDelete(comment.id);
                setDeleteDialogOpen(true);
              }}
              isEditing={editingComment === comment.id}
              editText={editText}
              onEditTextChange={setEditText}
              onSaveEdit={handleEdit}
              onCancelEdit={() => {
                setEditingComment(null);
                setEditText("");
              }}
            />
          ))}

          {/* Show More Button */}
          {!showAll && comments.length > maxVisible && (
            <Button
              variant="outline"
              onClick={() => setShowAll(true)}
              className="w-full gap-2"
            >
              <ChevronDown className="w-4 h-4" />
              Ver mais comentários ({comments.length - maxVisible} restantes)
            </Button>
          )}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 px-4 rounded-xl bg-muted/30 border border-dashed">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 text-muted-foreground/40" />
          <h4 className="font-medium mb-1">Nenhum comentário ainda</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Seja o primeiro a comentar sobre esta história!
          </p>
        </div>
      )}

      {/* Reply Dialog */}
      {replyTo && (
        <Card className="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/20 mt-4">
          <CardHeader className="pb-3">
            <p className="text-sm font-medium flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Reply className="w-4 h-4 text-purple-500" />
                Respondendo a {replyTo.author}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setReplyTo(null);
                  setReplyText("");
                }}
              >
                Cancelar
              </Button>
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground bg-background p-2 rounded line-clamp-2">
              "{replyTo.content}"
            </p>
            <Textarea
              placeholder="Escreva sua resposta..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={2}
              maxLength={500}
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" onClick={handleReply} disabled={!replyText.trim()}>
                Responder
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir comentário?</DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. O comentário será removido permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Individual Comment Card Component
interface CommentCardProps {
  comment: Comment;
  onVote: (id: string, vote: "up" | "down") => void;
  onReply: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isEditing: boolean;
  editText: string;
  onEditTextChange: (text: string) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
}

function CommentCard({
  comment,
  onVote,
  onReply,
  onEdit,
  onDelete,
  isEditing,
  editText,
  onEditTextChange,
  onSaveEdit,
  onCancelEdit,
}: CommentCardProps) {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="rounded-xl border bg-card p-4 transition-colors hover:bg-muted/20">
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-9 w-9 shrink-0">
          <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
            {getInitials(comment.author)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-sm truncate">{comment.author}</span>
              
              {/* Rating Display */}
              {comment.rating && (
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        "w-3 h-3",
                        star <= comment.rating!
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300 dark:text-gray-600"
                      )}
                    />
                  ))}
                </div>
              )}

              <span className="text-xs text-muted-foreground shrink-0">
                {timeAgo(comment.createdAt)}
              </span>

              {comment.isEdited && (
                <span className="text-xs text-muted-foreground italic">
                  (editado)
                </span>
              )}
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 opacity-0 group-hover:opacity-100 focus:opacity-100"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onReply} className="gap-2 cursor-pointer">
                  <Reply className="w-4 h-4" />
                  Responder
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
                  <Edit3 className="w-4 h-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onDelete}
                  className="gap-2 text-destructive cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-2">
              <Textarea
                value={editText}
                onChange={(e) => onEditTextChange(e.target.value)}
                rows={3}
                className="text-sm"
              />
              <div className="flex gap-2 justify-end">
                <Button size="sm" variant="ghost" onClick={onCancelEdit}>
                  Cancelar
                </Button>
                <Button size="sm" onClick={onSaveEdit}>
                  Salvar
                </Button>
              </div>
            </div>
          ) : (
            /* Normal View */
            <p className="text-sm leading-relaxed whitespace-pre-wrap">
              {comment.content}
            </p>
          )}

          {/* Actions Bar */}
          <div className="flex items-center gap-4 mt-3 pt-2 border-t">
            <button
              onClick={() => onVote(comment.id, "up")}
              className={cn(
                "flex items-center gap-1 text-xs transition-colors hover:text-green-600",
                comment.userVote === "up" && "text-green-600 font-medium"
              )}
            >
              <ThumbsUp className={cn("w-4 h-4", comment.userVote === "up" && "fill-current")} />
              {comment.likes}
            </button>
            
            <button
              onClick={() => onVote(comment.id, "down")}
              className={cn(
                "flex items-center gap-1 text-xs transition-colors hover:text-red-600",
                comment.userVote === "down" && "text-red-600 font-medium"
              )}
            >
              <ThumbsDown className={cn("w-4 h-4", comment.userVote === "down" && "fill-current")} />
              {comment.dislikes}
            </button>

            <button
              onClick={onReply}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-purple-600 transition-colors"
            >
              <Reply className="w-4 h-4" />
              Responder
            </button>
          </div>

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 ml-4 pl-4 border-l-2 border-purple-200 dark:border-purple-800 space-y-3">
              {comment.replies.map((reply) => (
                <div key={reply.id} className="flex gap-2">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarFallback className="bg-purple-500/20 text-purple-600 text-[10px]">
                      {getInitials(reply.author)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-xs">{reply.author}</span>
                      <span className="text-xs text-muted-foreground">
                        {timeAgo(reply.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Hook for accessing comment data
export function useStoryComments(storyId: string) {
  // Use lazy initializer for initial values
  const [count, setCount] = useState<number>(() => {
    const comments = loadComments(storyId);
    return comments.length;
  });
  const [avgRating, setAvgRating] = useState<number | null>(() => {
    const comments = loadComments(storyId);
    const rated = comments.filter((c) => c.rating);
    if (rated.length > 0) {
      return rated.reduce((sum, c) => sum + (c.rating || 0), 0) / rated.length;
    }
    return null;
  });

  useEffect(() => {
    const handleChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.storyId === storyId) {
        const updated = loadComments(storyId);
        setCount(updated.length);
        
        const ratedUpdated = updated.filter((c) => c.rating);
        if (ratedUpdated.length > 0) {
          setAvgRating(ratedUpdated.reduce((sum, c) => sum + (c.rating || 0), 0) / ratedUpdated.length);
        }
      }
    };

    window.addEventListener("commentsChanged", handleChange);
    return () => window.removeEventListener("commentsChanged", handleChange);
  }, [storyId]);

  return { count, avgRating };
}
