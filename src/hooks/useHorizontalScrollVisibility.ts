import { useState, useEffect, RefObject } from "react";

export function useHorizontalIntersectionObserver(
  containerRef: RefObject<HTMLElement>,
  panelIds: string[],
  threshold: number = 0.5
): string {
  const [activePanel, setActivePanel] = useState(panelIds[0] || "");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        let maxRatio = 0;
        let mostVisible = panelIds[0];

        entries.forEach((entry) => {
          if (entry.intersectionRatio > maxRatio) {
            maxRatio = entry.intersectionRatio;
            mostVisible = entry.target.id;
          }
        });

        setActivePanel(mostVisible);
      },
      {
        root: container, // observe relative to scroll container
        threshold: Array.from({ length: 101 }, (_, i) => i / 100), // fine-grained thresholds
        rootMargin: "0px",
      }
    );

    panelIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [containerRef, panelIds, threshold]);

  return activePanel;
}
