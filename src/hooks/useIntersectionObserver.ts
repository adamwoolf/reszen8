import { useState, useEffect, RefObject } from "react";

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /** If true, will disconnect observer after first intersect */
  once?: boolean;
}

/**
 * Tracks if an element is intersecting the viewport (or a root element).
 * Returns a boolean for simplicity.
 */
export function useIntersectionObserver(
  ref: RefObject<Element>,
  options: UseIntersectionObserverOptions = {}
): boolean {
  const { once = false, ...observerOptions } = options;
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);

      // If we only care about the first intersection, disconnect
      if (once && entry.isIntersecting) {
        observer.disconnect();
      }
    }, observerOptions);

    observer.observe(element);

    return () => observer.disconnect();
  }, [ref, observerOptions.root, observerOptions.rootMargin, observerOptions.threshold, once]);

  return isIntersecting;
}
