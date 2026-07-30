/**
 * Recently Viewed Stories utility module
 * Manages recently viewed story IDs in localStorage with timestamps
 */

const RECENTLY_VIEWED_STORAGE_KEY = "facelove-recently-viewed";
const MAX_RECENTLY_VIEWED = 20;

interface RecentlyViewedItem {
  id: string;
  title: string;
  slug: string;
  viewedAt: string; // ISO timestamp
}

/**
 * Get list of recently viewed stories from localStorage
 * @returns Array of recently viewed items (sorted by most recent)
 */
export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed: RecentlyViewedItem[] = JSON.parse(stored);
    // Sort by most recent first
    return parsed.sort(
      (a, b) => new Date(b.viewedAt).getTime() - new Date(a.viewedAt).getTime()
    );
  } catch (error) {
    console.error("Error reading recently viewed from localStorage:", error);
    return [];
  }
}

/**
 * Add a story to recently viewed (or update its timestamp if already exists)
 * @param id - The story ID
 * @param title - The story title
 * @param slug - The story slug
 */
export function addRecentlyViewed(id: string, title: string, slug: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const items = getRecentlyViewed();
    
    // Remove existing entry if it exists (to update position)
    const filtered = items.filter((item) => item.id !== id);
    
    // Add new entry at the beginning
    const updated: RecentlyViewedItem[] = [
      { id, title, slug, viewedAt: new Date().toISOString() },
      ...filtered,
    ].slice(0, MAX_RECENTLY_VIEWED); // Keep only the most recent

    localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent("recentlyViewedChanged", { detail: updated }));
  } catch (error) {
    console.error("Error adding to recently viewed:", error);
  }
}

/**
 * Remove a story from recently viewed
 * @param id - The story ID to remove
 */
export function removeRecentlyViewed(id: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    let items = getRecentlyViewed();
    items = items.filter((item) => item.id !== id);
    localStorage.setItem(RECENTLY_VIEWED_STORAGE_KEY, JSON.stringify(items));
    
    window.dispatchEvent(new CustomEvent("recentlyViewedChanged", { detail: items }));
  } catch (error) {
    console.error("Error removing from recently viewed:", error);
  }
}

/**
 * Clear all recently viewed stories
 */
export function clearRecentlyViewed(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(RECENTLY_VIEWED_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("recentlyViewedChanged", { detail: [] }));
  } catch (error) {
    console.error("Error clearing recently viewed:", error);
  }
}

/**
 * Check if a story is in the recently viewed list
 * @param id - The story ID to check
 */
export function isRecentlyViewed(id: string): boolean {
  const items = getRecentlyViewed();
  return items.some((item) => item.id === id);
}
