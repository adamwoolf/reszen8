import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./PillarsCarousel.css";
import useContentful from "../hooks/useContentful";
import { getCarouselSlides } from "../contentful";

interface Pillar {
  id: number;
  title: string;
  description: string;
  path: string;
  icon?: string;
}

const PillarsCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();
  const pillars = useContentful(getCarouselSlides)?.content.items || [];
  // Initialize slide refs
  useEffect(() => {
    slideRefs.current = slideRefs.current.slice(0, pillars.length);
  }, [pillars]);
  // Set up observer to track which slide is currently visible
  useEffect(() => {
    const trackElement = carouselTrackRef.current;
    if (!trackElement) return;

    // Update active dot based on which slide is most visible
    const handleScroll = () => {
      if (!trackElement) return;

      // Calculate which slide is most visible based on scroll position
      const scrollPosition = trackElement.scrollLeft;
      const slideWidth = trackElement.clientWidth;
      const newIndex = Math.round(scrollPosition / slideWidth);

      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
      }
    };

    trackElement.addEventListener("scroll", handleScroll);
    return () => trackElement.removeEventListener("scroll", handleScroll);
  }, [currentIndex]);

  // Auto-advance slides
  useEffect(() => {
    if (isPaused) {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
      return;
    }

    autoAdvanceTimerRef.current = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => {
      if (autoAdvanceTimerRef.current) {
        clearInterval(autoAdvanceTimerRef.current);
        autoAdvanceTimerRef.current = null;
      }
    };
  }, [isPaused, currentIndex]);

  // Scroll to next slide
  const nextSlide = () => {
    const nextIndex = currentIndex < pillars.length - 1 ? currentIndex + 1 : 0;
    scrollToSlide(nextIndex);
  };

  // Scroll to previous slide
  const prevSlide = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : pillars.length - 1;
    scrollToSlide(prevIndex);
  };

  // Scroll to specified slide
  const scrollToSlide = (index: number) => {
    if (!carouselTrackRef.current) return;

    const slideWidth = carouselTrackRef.current.clientWidth;
    carouselTrackRef.current.scrollTo({
      left: slideWidth * index,
      behavior: "smooth",
    });

    setCurrentIndex(index);
  };

  // Navigate to the pillar page when clicked
  const handlePillarClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className='pillars-carousel' onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
      <button className='carousel-button prev' onClick={prevSlide} aria-label='Previous slide'>
        &lt;
      </button>

      <div className='carousel-track' ref={carouselTrackRef}>
        {pillars.map((pillar, index) => (
          <div
            key={pillar.fields.title}
            className='carousel-slide'
            ref={(el) => (slideRefs.current[index] = el)}
            onClick={() => handlePillarClick(pillar.fields.path)}
            tabIndex={0}
          >
            <div className='pillar-content'>
              {/* Add icon if available */}
              {pillar.fields.icon && (
                <div className="pillar-icon" dangerouslySetInnerHTML={{ __html: pillar.fields.icon }} />
              )}
              <h3>{pillar.fields.title}</h3>
              <p>{pillar.fields.description}</p>
              <button className='explore-button'>Explore {pillar.fields.title}</button>
            </div>
          </div>
        ))}
      </div>

      <button className='carousel-button next' onClick={nextSlide} aria-label='Next slide'>
        &gt;
      </button>

      <div className='carousel-dots'>
        {pillars.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => scrollToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PillarsCarousel;
