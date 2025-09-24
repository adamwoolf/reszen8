import { useState, useEffect, RefObject } from "react";

interface UseIntersectionObserverOptions extends IntersectionObserverInit {}

export function useIntersectionObserver(
  ref: RefObject<Element>,
  options: UseIntersectionObserverOptions = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    if (!ref.current) return; // wait until ref exists

    const element = ref.current;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observer.observe(element);

    // Check initial visibility manually in case the element is already in view
    // (important for first mount)
    if (element) {
      const rect = element.getBoundingClientRect();
      const inView = rect.top < (options.root?.clientHeight || window.innerHeight) && rect.bottom > 0;
      setIsIntersecting(inView);
    }

    return () => observer.disconnect();
  }, [ref.current, options.root, options.rootMargin, options.threshold]);

  return isIntersecting;
}
