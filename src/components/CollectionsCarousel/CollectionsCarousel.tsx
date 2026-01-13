import React, { useState, useRef, useEffect } from "react";
import { useSelector } from "react-redux";
import { getStaticMeds } from "../../pages/MeditationLibrary/MeditationLibrary.selectors";
import "./styles.scss";
import { getCollectionImages } from "../../contentful";
import { trackCTA } from "../../utils/analytics";
import { useSavedItems } from "../../contexts/SavedItemsContext";
import { sortByEpisode } from "../../Util";
import AmbientEnv from "../AmbientEnv/AmbientEnv";
import { useAuth } from "../../contexts/AuthContext";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

const CollectionsCarousel = ({ handleClick }: { handleClick?: (value: string) => void }) => {
  const { addItem } = useSavedItems();
  const { currentUser } = useAuth();
  const carouselRef = useRef<HTMLDivElement>(null);

  const [displayCol, setDisplayCol] = useState("");
  const collections = useSelector(getStaticMeds).filter((med) => med.collection);
  // const [images, setImages] = useState([]);

  const headerRef = useRef<HTMLDivElement>(null);
  const collectionTiles = [...new Set(collections.map((col) => col.collection))];
  const [selected, setSelected] = useState<string>("");
  const isAdded = currentUser?.savedItems?.collections?.map((col) => col.title)?.includes(selected);
  const images = useSelector((state) => state.content.collectionImages);
  // const [canScrollLeft, setCanScrollLeft] = useState(false);
  // const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position to show/hide chevrons
  // const checkScrollPosition = () => {
  //   if (carouselRef.current) {
  //     const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
  //     setCanScrollLeft(scrollLeft > 0);
  //     setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  //   }
  // };

  // useEffect(() => {
  //   checkScrollPosition();
  //   const carousel = carouselRef.current;
  //   if (carousel) {
  //     carousel.addEventListener("scroll", checkScrollPosition);
  //     window.addEventListener("resize", checkScrollPosition);
  //     return () => {
  //       carousel.removeEventListener("scroll", checkScrollPosition);
  //       window.removeEventListener("resize", checkScrollPosition);
  //     };
  //   }
  // }, [images]);

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -500, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 500, behavior: "smooth" });
    }
  };

  return (
    <div className='c-carousel'>
      <h2>RESZEN8 Collections</h2>
      <div className='c-carousel__buttons'>
        <button onClick={scrollLeft}>
          <FaChevronLeft />
        </button>
        <button onClick={scrollRight}>
          {" "}
          <FaChevronRight />
        </button>
      </div>
      <div ref={carouselRef} className='c-carousel__cards'>
        {collectionTiles.map((col) => {
          const imgSrc = images.find((im) => im.collectionName === col)?.image?.url;
          if (!imgSrc) return;
          return (
            <div key={col} className='c-carousel__card'>
              <img
                alt={`collection-main-image--${col}`}
                className={"c-carousel__card-image c-carousel__card-image--active"}
                src={imgSrc}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionsCarousel;
