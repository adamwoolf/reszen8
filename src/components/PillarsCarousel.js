import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./PillarsCarousel.css";
import useContentful from "../hooks/useContentful";
import { getCarouselSlides } from "../contentful";
const PillarsCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const carouselTrackRef = useRef(null);
    const slideRefs = useRef([]);
    const autoAdvanceTimerRef = useRef(null);
    const navigate = useNavigate();
    const pillars = useContentful(getCarouselSlides)?.content.items || [];
    // Initialize slide refs
    useEffect(() => {
        slideRefs.current = slideRefs.current.slice(0, pillars.length);
    }, [pillars]);
    // Set up observer to track which slide is currently visible
    useEffect(() => {
        const trackElement = carouselTrackRef.current;
        if (!trackElement)
            return;
        // Update active dot based on which slide is most visible
        const handleScroll = () => {
            if (!trackElement)
                return;
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
    const scrollToSlide = (index) => {
        if (!carouselTrackRef.current)
            return;
        const slideWidth = carouselTrackRef.current.clientWidth;
        carouselTrackRef.current.scrollTo({
            left: slideWidth * index,
            behavior: "smooth",
        });
        setCurrentIndex(index);
    };
    // Navigate to the pillar page when clicked
    const handlePillarClick = (path) => {
        navigate(path);
    };
    return (_jsxs("div", { className: 'pillars-carousel', onMouseEnter: () => setIsPaused(true), onMouseLeave: () => setIsPaused(false), children: [_jsx("button", { className: 'carousel-button prev', onClick: prevSlide, "aria-label": 'Previous slide', children: "<" }), _jsx("div", { className: 'carousel-track', ref: carouselTrackRef, children: pillars.map((pillar, index) => (_jsx("div", { className: 'carousel-slide', ref: (el) => (slideRefs.current[index] = el), onClick: () => handlePillarClick(pillar.fields.path), tabIndex: 0, children: _jsxs("div", { className: 'pillar-content', children: [_jsx("h3", { children: pillar.fields.title }), _jsx("p", { children: pillar.fields.description }), _jsxs("button", { className: 'explore-button', children: ["Explore ", pillar.fields.title] })] }) }, pillar.id))) }), _jsx("button", { className: 'carousel-button next', onClick: nextSlide, "aria-label": 'Next slide', children: ">" }), _jsx("div", { className: 'carousel-dots', children: pillars.map((_, index) => (_jsx("button", { className: `dot ${index === currentIndex ? "active" : ""}`, onClick: () => scrollToSlide(index), "aria-label": `Go to slide ${index + 1}` }, index))) })] }));
};
export default PillarsCarousel;
