import React from "react";
import { useSelector } from "react-redux";
import { getStaticMeds } from "../../pages/MeditationLibrary/MeditationLibrary.selectors";
import { getPublicationsWithCategories } from "../../pages/Publications/Publications.selector";
import MeditationCard from "../MeditationCard/MeditationCard";
import QuoteOfTheDay from "../QuoteOfTheDay/QuoteOdTheDay";
import { Link } from "react-router-dom";
import "./FreeForeverStyles.scss";
import NewUserPlanPurchaseCta from "../../pages/Memberships/NewUserPlanPurchaseCta";
import { useAuth } from "../../contexts/AuthContext";

const FreeForever = () => {
  const meditations = useSelector(getStaticMeds);
  const articles = useSelector(getPublicationsWithCategories);
  const { currentUser } = useAuth();
  if (!articles.length || !meditations.length) return null;

  return (
    <div className='freemium'>
      {!currentUser && (
        <div className='freemium__cta'>
          <NewUserPlanPurchaseCta homepage />
        </div>
      )}
      <h1 className='freemium__title'>Sample Content</h1>

      <div className='freemium__top-row'>
        {meditations
          .filter((med) => med.immersive)
          .filter(
            (med) => med.title === "Resilience, Immersive Tibetan Meditation" || med.title === "Stillness of Breath"
          )
          .map((med) => (
            <MeditationCard
              showLike={false}
              customTitle={
                med.title === "Stillness of Breath"
                  ? "The Awakening Collection - Meditation 1: Stillness of Breath"
                  : ""
              }
              isCollection
              key={med.title}
              item={med}
            />
          ))}
        {meditations
          .filter((med) => !med.mmersive)
          .filter((med) => med.title === "Smiling from Within")
          .map((med) => (
            <MeditationCard
              customTitle='The Joy Practice Collection - Smiling from Within'
              showLike={false}
              isCollection
              key={med.title}
              item={med}
            />
          ))}
      </div>
      <div className='freemium__second-row'>
        <div className='freemium__section'>
          <span className='freemium__sub-heading'>Articles</span>
          {articles.slice(0, 2).map((article) => (
            <Link key={article.title} className='freemium__article' to={`/articles/${article.title}`}>
              {article.title}
            </Link>
          ))}
        </div>
        <div className='freemium__section'>
          <QuoteOfTheDay />
        </div>
      </div>
      {!currentUser && (
        <div className='freemium__cta freemium__cta--bottom'>
          <NewUserPlanPurchaseCta homepage />
        </div>
      )}
    </div>
  );
};

export default FreeForever;
