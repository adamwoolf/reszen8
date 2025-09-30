import { useRef, useEffect, useState } from "react";

const Carousel = ({ items, cardWidth = 300, gap = 20 }) => {
  const containerRef = useRef(null);
  const [scrolling, setScrolling] = useState(false);

  // Center the first card on mount
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollLeft = 0;
    }
  }, []);

  return (
    <div
      style={{
        overflowX: "auto",
        display: "flex",
        gap: `${gap}px`,
        scrollSnapType: "x mandatory",
        scrollBehavior: "smooth",
        padding: `0 calc(50% - ${cardWidth / 2}px)`, // center first/last card
      }}
      ref={containerRef}
      onMouseDown={() => setScrolling(true)}
      onMouseUp={() => setScrolling(false)}
      onMouseLeave={() => setScrolling(false)}
      onTouchStart={() => setScrolling(true)}
      onTouchEnd={() => setScrolling(false)}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          style={{
            minWidth: `${cardWidth}px`,
            flexShrink: 0,
            scrollSnapAlign: "center",
            transition: "transform 0.3s",
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

export default Carousel;
