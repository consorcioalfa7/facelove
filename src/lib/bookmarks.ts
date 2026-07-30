/**
 * Bookmarks utility module for FaceLove
 * Allows users to bookmark specific positions in stories for easy return
 */

const BOOKMARKS_STORAGE_KEY = "facelove-bookmarks";

export interface Bookmark {
  id: string; // Unique ID for this bookmark
  storyId: string;
  storyTitle: string;
  position: number; // Scroll position percentage (0-100)
  chapter?: string; // Optional chapter/section name
  note?: string; // User's optional note
  createdAt: string; // ISO timestamp
}

/**
 * Get all bookmarks
 */
export function getBookmarks(): Bookmark[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (!stored) return [];

    const data: Bookmark[] = JSON.parse(stored);
    // Sort by creation date, newest first
    return data.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("[Bookmarks] Error loading:", error);
    return [];
  }
}

/**
 * Get bookmarks for a specific story
 */
export function getStoryBookmarks(storyId: string): Bookmark[] {
  return getBookmarks().filter((b) => b.storyId === storyId);
}

/**
 * Add a new bookmark
 */
export function addBookmark(bookmark: Omit<Bookmark, "id" | "createdAt">): Bookmark {
  if (typeof window === "undefined") {
    throw new Error("Cannot add bookmark on server");
  }

  const bookmarks = getBookmarks();
  const newBookmark: Bookmark = {
    ...bookmark,
    id: `bookmark-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  };

  // Limit to 50 bookmarks total (prevent storage bloat)
  const updated = [newBookmark, ...bookmarks].slice(0, 50);

  localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(updated));

  // Dispatch event
  window.dispatchEvent(new CustomEvent("bookmarksChanged", { detail: { action: "add", bookmark: newBookmark } }));

  return newBookmark;
}

/**
 * Remove a bookmark by ID
 */
export function removeBookmark(bookmarkId: string): boolean {
  if (typeof window === "undefined") return false;

  const bookmarks = getBookmarks();
  const filtered = bookmarks.filter((b) => b.id !== bookmarkId);

  if (filtered.length === bookmarks.length) return false;

  localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(filtered));

  window.dispatchEvent(new CustomEvent("bookmarksChanged", { detail: { action: "remove", bookmarkId } }));

  return true;
}

/**
 * Clear all bookmarks
 */
export function clearBookmarks(): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(BOOKMARKS_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("bookmarksChanged", { detail: { action: "clear" } }));
}

/**
 * Check if a story has any bookmarks
 */
export function hasBookmarks(storyId: string): boolean {
  return getStoryBookmarks(storyId).length > 0;
}

/**
 * Get the most recent bookmark for a story
 */
export function getLatestBookmark(storyId: string): Bookmark | null {
  const storyBookmarks = getStoryBookmarks(storyId);
  return storyBookmarks.length > 0 ? storyBookmarks[0] : null;
}
