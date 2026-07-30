/**
 * Reading Statistics utility module for FaceLove
 * Tracks reading progress, time spent, and other metrics
 */

const READING_STATS_STORAGE_KEY = "facelove-reading-stats";

export interface StoryReadingProgress {
  storyId: string;
  storyTitle: string;
  lastPosition: number; // Scroll position percentage (0-100)
  lastReadAt: string; // ISO timestamp
  totalTimeSpent: number; // Total seconds spent reading
  readCount: number; // Number of times opened
  completed: boolean; // If user finished reading
}

export interface UserReadingStats {
  totalStoriesRead: number;
  totalReadingTime: number; // Total minutes
  favoriteGenre: string | null;
  storiesInProgress: string[]; // IDs of partially read stories
  completedStories: string[]; // IDs of completed stories
  streakDays: number;
  lastReadDate: string | null;
}

/**
 * Get all stored reading progress
 */
export function getAllReadingProgress(): StoryReadingProgress[] {
  if (typeof window === "undefined") return [];
  
  try {
    const stored = localStorage.getItem(READING_STATS_STORAGE_KEY);
    if (!stored) return [];
    
    const data: Record<string, StoryReadingProgress> = JSON.parse(stored);
    return Object.values(data).sort(
      (a, b) => new Date(b.lastReadAt).getTime() - new Date(a.lastReadAt).getTime()
    );
  } catch (error) {
    console.error("Error reading stats:", error);
    return [];
  }
}

/**
 * Get progress for a specific story
 */
export function getStoryProgress(storyId: string): StoryReadingProgress | null {
  if (typeof window === "undefined") return null;
  
  try {
    const stored = localStorage.getItem(READING_STATS_STORAGE_KEY);
    if (!stored) return null;
    
    const data: Record<string, StoryReadingProgress> = JSON.parse(stored);
    return data[storyId] || null;
  } catch (error) {
    console.error("Error getting story progress:", error);
    return null;
  }
}

/**
 * Update or create reading progress for a story
 */
export function updateStoryProgress(
  storyId: string,
  storyTitle: string,
  updates: Partial<Pick<StoryReadingProgress, 'lastPosition' | 'completed'>>
): StoryReadingProgress {
  if (typeof window === "undefined") {
    throw new Error("Cannot update reading progress on server");
  }

  try {
    const stored = localStorage.getItem(READING_STATS_STORAGE_KEY);
    const data: Record<string, StoryReadingProgress> = stored ? JSON.parse(stored) : {};
    
    const existing = data[storyId];
    const now = new Date().toISOString();
    
    const progress: StoryReadingProgress = {
      storyId,
      storyTitle: storyTitle || existing?.storyTitle || "",
      lastPosition: updates.lastPosition ?? existing?.lastPosition ?? 0,
      lastReadAt: now,
      totalTimeSpent: (existing?.totalTimeSpent || 0) + 1, // Add 1 second per call
      readCount: (existing?.readCount || 0) + 1,
      completed: updates.completed ?? existing?.completed ?? false,
    };
    
    data[storyId] = progress;
    localStorage.setItem(READING_STATS_STORAGE_KEY, JSON.stringify(data));
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent("readingProgressChanged", { 
      detail: { storyId, progress } 
    }));
    
    return progress;
  } catch (error) {
    console.error("Error updating reading progress:", error);
    throw error;
  }
}

/**
 * Mark a story as completed
 */
export function markStoryCompleted(storyId: string): StoryReadingProgress | null {
  const existing = getStoryProgress(storyId);
  if (!existing) return null;
  
  return updateStoryProgress(storyId, existing.storyTitle, { 
    lastPosition: 100, 
    completed: true 
  });
}

/**
 * Get aggregated user reading statistics
 */
export function getUserStats(): UserReadingStats {
  if (typeof window === "undefined") {
    return {
      totalStoriesRead: 0,
      totalReadingTime: 0,
      favoriteGenre: null,
      storiesInProgress: [],
      completedStories: [],
      streakDays: 0,
      lastReadDate: null,
    };
  }

  const progress = getAllReadingProgress();
  
  const completedStories = progress
    .filter(p => p.completed)
    .map(p => p.storyId);
  
  const inProgress = progress
    .filter(p => !p.completed && p.lastPosition > 0)
    .map(p => p.storyId);
  
  // Calculate total reading time in minutes
  const totalSeconds = progress.reduce((sum, p) => sum + p.totalTimeSpent, 0);
  const totalMinutes = Math.round(totalSeconds / 60);
  
  // Calculate reading streak (simplified - consecutive days with activity)
  const dates = progress.map(p => p.lastReadAt.split("T")[0]);
  const uniqueDates = [...new Set(dates)].sort().reverse();
  
  let streakDays = uniqueDates.length > 0 ? 1 : 0;
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  
  if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
    streakDays = 0;
  }

  return {
    totalStoriesRead: progress.length,
    totalReadingTime: totalMinutes,
    favoriteGenre: null, // Would need genre data
    storiesInProgress: inProgress,
    completedStories,
    streakDays,
    lastReadDate: progress.length > 0 ? progress[0].lastReadAt : null,
  };
}

/**
 * Clear all reading statistics
 */
export function clearReadingStats(): void {
  if (typeof window === "undefined") return;
  
  localStorage.removeItem(READING_STATS_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent("readingProgressChanged", { 
    detail: { cleared: true } 
  }));
}
