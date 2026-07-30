"use client";

import { useEffect } from "react";
import { ReadingProgress } from "@/components/reading-progress";

interface StoryClientWrapperProps {
  children: React.ReactNode;
}

export function StoryClientWrapper({ children }: StoryClientWrapperProps) {
  // Scroll to top on mount when navigating to a new story
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  return (
    <>
      <ReadingProgress color="gradient" height="medium" showPercentage={false} />
      {children}
    </>
  );
}
