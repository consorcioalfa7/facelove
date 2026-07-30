"use client";

import { useEffect, useCallback, useRef } from "react";
import { getStoryProgress, updateStoryProgress, markStoryCompleted } from "@/lib/reading-stats";

interface AutoSaveProgressProps {
  /** Story ID */
  storyId: string;
  /** Story title */
  storyTitle: string;
  /** Content element ID to track */
  contentId?: string;
  /** Save interval in milliseconds (default: 5000ms) */
  saveInterval?: number;
  /** Callback when progress is saved */
  onProgressSaved?: (progress: number) => void;
  /** Enable auto-completion detection */
  enableAutoComplete?: boolean;
}

/**
 * AutoSaveProgress - Automatically saves reading progress based on scroll position
 * 
 * This component:
 * - Tracks scroll position within the content element
 * - Saves progress to localStorage at regular intervals
 * - Auto-marks story as completed when user reaches the end
 * - Dispatches custom events for other components to react
 */
export function AutoSaveProgress({
  storyId,
  storyTitle,
  contentId = "story-content",
  saveInterval = 5000,
  onProgressSaved,
  enableAutoComplete = true,
}: AutoSaveProgressProps) {
  const lastSavedProgress = useRef<number>(0);
  const hasMarkedCompleted = useRef<boolean>(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate scroll progress as percentage (0-100)
  const calculateProgress = useCallback((): number => {
    try {
      const element = document.getElementById(contentId);
      
      if (!element) return 0;
      
      const windowHeight = window.innerHeight;
      const documentHeight = element.scrollHeight;
      const scrollTop = window.scrollY - element.offsetTop + 64; // Account for header height
      
      // Handle edge cases
      if (documentHeight <= windowHeight) return 100;
      if (scrollTop <= 0) return 0;
      
      const rawProgress = (scrollTop / (documentHeight - windowHeight)) * 100;
      return Math.min(Math.max(Math.round(rawProgress), 0), 100);
    } catch (error) {
      console.error("Error calculating progress:", error);
      return 0;
    }
  }, [contentId]);

  // Save progress (debounced)
  const saveProgress = useCallback(
    (progress: number) => {
      // Only save if changed significantly (>1%) or reached important milestones
      const shouldSave =
        Math.abs(progress - lastSavedProgress.current) > 1 ||
        progress === 0 ||
        progress === 100 ||
        (progress >= 90 && lastSavedProgress.current < 90);

      if (!shouldSave && progress !== 0 && progress !== 100) return;

      try {
        // Update reading statistics
        updateStoryProgress(storyId, {
          title: storyTitle,
          progress,
          lastReadAt: new Date().toISOString(),
        });

        // Mark as completed if near end and not already marked
        if (
          enableAutoComplete &&
          progress >= 95 &&
          !hasMarkedCompleted.current
        ) {
          markStoryCompleted(storyId, { title: storyTitle });
          hasMarkedCompleted.current = true;
          
          // Dispatch completion event
          window.dispatchEvent(
            new CustomEvent("storyCompleted", {
              detail: { storyId, storyTitle },
            })
          );
        }

        lastSavedProgress.current = progress;
        onProgressSaved?.(progress);

        // Dispatch progress change event
        window.dispatchEvent(
          new CustomEvent("readingProgressChanged", {
            detail: { storyId, progress },
          })
        );
      } catch (error) {
        console.error("Error saving progress:", error);
      }
    },
    [storyId, storyTitle, enableAutoComplete, onProgressSaved]
  );

  // Scroll handler with debouncing
  const handleScroll = useCallback(() => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Calculate current progress immediately but save after delay
    const currentProgress = calculateProgress();
    
    // Show real-time progress (without saving)
    window.dispatchEvent(
      new CustomEvent("readingProgressRealtime", {
        detail: { storyId, progress: currentProgress },
      })
    );

    // Debounced save
    saveTimeoutRef.current = setTimeout(() => {
      saveProgress(currentProgress);
    }, saveInterval);
  }, [calculateProgress, saveProgress, storyId, saveInterval]);

  // Set up scroll listener
  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Initial calculation
    setTimeout(() => {
      const initialProgress = calculateProgress();
      if (initialProgress > 0) {
        // Restore previous position if returning
        const savedData = getStoryProgress(storyId);
        if (savedData?.progress && savedData.progress > 5) {
          // Could restore position here if needed
          console.log(`[AutoSave] Restored progress: ${savedData.progress}%`);
        }
      }
    }, 500);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [handleScroll, storyId, calculateProgress]);

  // Save before page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      const finalProgress = calculateProgress();
      saveProgress(finalProgress);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () =>
      window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [calculateProgress, saveProgress]);

  // This component doesn't render anything visible
  return null;
}

// Hook version for use in other components
export function useAutoSaveProgress() {
  const isSaving = useRef(false);

  const saveNow = useCallback((storyId: string, progress: number) => {
    if (isSaving.current) return;
    
    isSaving.current = true;
    
    try {
      updateStoryProgress(storyId, { progress });
      window.dispatchEvent(
        new CustomEvent("readingProgressChanged", {
          detail: { storyId, progress },
        })
      );
    } finally {
      isSaving.current = false;
    }
  }, []);

  const completeNow = useCallback((storyId: string, title: string) => {
    try {
      markStoryCompleted(storyId, { title });
      window.dispatchEvent(
        new CustomEvent("storyCompleted", {
          detail: { storyId, storyTitle: title },
        })
      );
    } catch (error) {
      console.error("Error marking completed:", error);
    }
  }, []);

  return { saveNow, completeNow };
}
