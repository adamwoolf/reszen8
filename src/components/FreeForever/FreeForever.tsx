import React from "react";
import { useSelector } from "react-redux";
import { getStaticMeds } from "../../pages/MeditationLibrary/MeditationLibrary.selectors";
import { getPublicationsWithCategories } from "../../pages/Publications/Publications.selector";
import MeditationCard from "../MeditationCard/MeditationCard";
import QuoteOfTheDay from "../QuoteOfTheDay/QuoteOdTheDay";
import { Link } from "react-router-dom";
import "./FreeForeverStyles.scss";
const FreeForever = () => {
  const meditations = useSelector(getStaticMeds);
  const articles = useSelector(getPublicationsWithCategories);
  if (!articles.length || !meditations.length) return null;
  return (
    <div className='freemium'>
      <h1 className='freemium__title'>Begin Your Journey</h1>
      <div className='freemium__top-row'>
        {meditations
          .filter((med) => med.immersive)
          .slice(1, 3)
          .map((med) => (
            <MeditationCard item={med} />
          ))}
        {meditations
          .filter((med) => !med.immersive)
          .slice(0, 1)
          .map((med) => (
            <MeditationCard item={med} />
          ))}
      </div>
      <div className='freemium__second-row'>
        <div className='freemium__section'>
          <h3>Articles</h3>
          {articles.slice(0, 2).map((article) => (
            <div>
              <Link className='freemium__article' to={`/articles/${article.title}`}>
                {article.title}
              </Link>
            </div>
          ))}
        </div>
        <div className='freemium__section'>
          <QuoteOfTheDay />
        </div>
      </div>
    </div>
  );
};

export default FreeForever;
