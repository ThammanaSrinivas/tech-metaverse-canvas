import { useEffect, useRef, useState, useCallback } from 'react';

export function useSectionTimeTracker(sectionIds: string[]): Record<string, number> {
  const [timePercentages, setTimePercentages] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    for (const id of sectionIds) {
      initial[id] = 0;
    }
    return initial;
  });

  const accumulatedTime = useRef<Record<string, number>>({});
  const visibleSections = useRef<Set<string>>(new Set());
  const observerRef = useRef<IntersectionObserver | null>(null);

  const computePercentages = useCallback(() => {
    const total = Object.values(accumulatedTime.current).reduce((sum, t) => sum + t, 0);
    if (total === 0) return;

    const percentages: Record<string, number> = {};
    for (const id of sectionIds) {
      percentages[id] = (accumulatedTime.current[id] || 0) / total;
    }
    setTimePercentages(percentages);
  }, [sectionIds]);

  useEffect(() => {
    // Initialize accumulated time
    for (const id of sectionIds) {
      if (!(id in accumulatedTime.current)) {
        accumulatedTime.current[id] = 0;
      }
    }

    // Tick interval: increment time for all visible sections every 1s
    const tickInterval = setInterval(() => {
      for (const id of visibleSections.current) {
        accumulatedTime.current[id] = (accumulatedTime.current[id] || 0) + 1;
      }
    }, 1000);

    // State update interval: recompute percentages every 3s
    const updateInterval = setInterval(() => {
      computePercentages();
    }, 3000);

    // Set up IntersectionObserver
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (entry.isIntersecting) {
            visibleSections.current.add(id);
          } else {
            visibleSections.current.delete(id);
          }
        }
      },
      { threshold: 0.3 }
    );

    // Observe section elements
    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) {
        observerRef.current.observe(el);
      }
    }

    return () => {
      clearInterval(tickInterval);
      clearInterval(updateInterval);
      observerRef.current?.disconnect();
    };
  }, [sectionIds, computePercentages]);

  return timePercentages;
}
