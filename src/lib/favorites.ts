/**
 * Favorites utility module for FaceLove
 * Manages favorited story IDs in localStorage
 */

const FAVORITES_STORAGE_KEY = "facelove-favorites";

/**
 * Get list of favorited story IDs from localStorage
 * @returns Array of favorited story IDs
 */
export function getFavorites(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) {
      return [];
    }
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Error reading favorites from localStorage:", error);
    return [];
  }
}

/**
 * Add a story to favorites
 * @param id - The story ID to add
 */
export function addFavorite(id: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const favorites = getFavorites();
    if (!favorites.includes(id)) {
      favorites.push(id);
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    }

    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent("favoritesChanged", { detail: { favorites } }));
  } catch (error) {
    console.error("Error adding favorite:", error);
  }
}

/**
 * Remove a story from favorites
 * @param id - The story ID to remove
 */
export function removeFavorite(id: string): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    let favorites = getFavorites();
    favorites = favorites.filter((favId) => favId !== id);
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));

    // Dispatch custom event for other components to listen
    window.dispatchEvent(new CustomEvent("favoritesChanged", { detail: { favorites } }));
  } catch (error) {
    console.error("Error removing favorite:", error);
  }
}

/**
 * Check if a story is favorited
 * @param id - The story ID to check
 * @returns True if the story is in favorites
 */
export function isFavorite(id: string): boolean {
  const favorites = getFavorites();
  return favorites.includes(id);
}

/**
 * Toggle a story's favorite status
 * @param id - The story ID to toggle
 * @returns The new favorite status (true = added, false = removed)
 */
export function toggleFavorite(id: string): boolean {
  if (isFavorite(id)) {
    removeFavorite(id);
    return false;
  } else {
    addFavorite(id);
    return true;
  }
}

/**
 * Get count of total favorites
 * @returns Number of favorited stories
 */
export function getFavoritesCount(): number {
  return getFavorites().length;
}

/**
 * Clear all favorites
 */
export function clearFavorites(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent("favoritesChanged", { detail: { favorites: [] } }));
  } catch (error) {
    console.error("Error clearing favorites:", error);
  }
}
