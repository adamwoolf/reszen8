import React from "react";
import PillarsCarousel from "../components/PillarsCarousel";
import "./Home.css";
import useContentful from "../hooks/useContentful";
import { getHomePage } from "../contentful";
import { marked } from "marked";

const Home: React.FC = () => {
  const content = useContentful(getHomePage)?.content?.fields;
  return (
    <div className='home-page'>
      <section className='mission-statement'>
        <div className='mission-content'>
          <h2>{content?.title}</h2>
          {content?.description && (
            <p className='mission-text' dangerouslySetInnerHTML={{ __html: marked(content?.description) }} />
          )}
          {content?.tagline && <p className='mission-tagline'>{content?.tagline}</p>}
        </div>
      </section>
      <div className='carousel-container'>
        <PillarsCarousel />
      </div>
    </div>
  );
};

export default Home;
