import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './PillarsCarousel.css';

interface Pillar {
  id: number;
  title: string;
  description: string;
  path: string;
}

const pillars: Pillar[] = [
  {
    id: 1,
    title: 'Apparel & Accessories',
    description: 'Premium comfort wear designed for your relaxation journey',
    path: '/apparel'
  },
  {
    id: 2,
    title: 'Digital Goods',
    description: 'Digital resources to enhance your daily practice',
    path: '/digital-goods'
  },
  {
    id: 3,
    title: 'Guided Meditations',
    description: 'Expert-led sessions for all experience levels',
    path: '/guided-meditations'
  },
  {
    id: 4,
    title: 'Memberships',
    description: 'Exclusive access to premium content, products, and experiences',
    path: '/memberships'
  }
];

const PillarsCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const carouselTrackRef = useRef<HTMLDivElement>(null);
  const slideRefs = useRef<(HTMLDivElement | null)[]>([]);
  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Initialize slide refs
  useEffect(() => {
    slideRefs.current = slideRefs.current.slice(0, pillars.length);
  }, []);

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

    trackElement.addEventListener('scroll', handleScroll);
    return () => trackElement.removeEventListener('scroll', handleScroll);
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
      behavior: 'smooth'
    });
    
    setCurrentIndex(index);
  };

  // Navigate to the pillar page when clicked
  const handlePillarClick = (path: string) => {
    navigate(path);
  };
  
  return (
    <div 
      className="pillars-carousel"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <button 
        className="carousel-button prev" 
        onClick={prevSlide}
        aria-label="Previous slide"
      >
        &lt;
      </button>
      
      <div 
        className="carousel-track" 
        ref={carouselTrackRef}
      >
        {pillars.map((pillar, index) => (
          <div 
            key={pillar.id}
            className="carousel-slide"
            ref={el => slideRefs.current[index] = el}
            onClick={() => handlePillarClick(pillar.path)}
            tabIndex={0}
          >
            <div className="pillar-content">
              <h3>{pillar.title}</h3>
              <p>{pillar.description}</p>
              <button className="explore-button">Explore {pillar.title}</button>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        className="carousel-button next" 
        onClick={nextSlide}
        aria-label="Next slide"
      >
        &gt;
      </button>
      
      <div className="carousel-dots">
        {pillars.map((_, index) => (
          <button
            key={index}
            className={`dot ${index === currentIndex ? 'active' : ''}`}
            onClick={() => scrollToSlide(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default PillarsCarousel;
