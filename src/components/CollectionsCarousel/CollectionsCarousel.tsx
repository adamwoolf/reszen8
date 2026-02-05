import React, { useRef } from "react";
import { useSelector } from "react-redux";
import { getStaticMeds } from "../../pages/MeditationLibrary/MeditationLibrary.selectors";
import "./styles.scss";

import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";

const CollectionsCarousel = ({ handleClick }: { handleClick?: (value: string) => void }) => {
  const carouselRef = useRef<HTMLDivElement>(null);

  const collections = useSelector(getStaticMeds).filter((med) => med.collection);

  const collectionTiles = [...new Set(collections.map((col) => col.collection))];
  const images = useSelector((state) => state.content.collectionImages);

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
          <FaChevronRight />
        </button>
      </div>
      <div ref={carouselRef} className='c-carousel__cards'>
        {collectionTiles.map((col) => {
          const imgSrc = images.find((im) => im.collectionName === col)?.image?.url;
          if (!imgSrc) return;
          return (
            <Link to='/meditation-library' key={col} className='c-carousel__card'>
              <img
                alt={`collection-main-image--${col}`}
                className={"c-carousel__card-image c-carousel__card-image--active"}
                src={imgSrc}
              />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CollectionsCarousel;
