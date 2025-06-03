import React from "react";
import { Link } from "react-router-dom";
import "./CategoryPage.css";
import { getMeditationPage } from "../contentful";
import { marked } from "marked";
import useContentful from "../hooks/useContentful";

const Meditations: React.FC = () => {
  const content = useContentful(getMeditationPage)?.content?.fields;

  console.log(content);
  return (
    <div className='category-page'>
      <header className='category-header'>
        <h1>{content?.title}</h1>
      </header>

      <section className='category-content'>
        {content?.text && (
          <div className='category-intro' dangerouslySetInnerHTML={{ __html: marked(content?.text) }} />
        )}

        {/* <div className='feature-grid'>
          {content?.option
            ?.filter((o) => !o?.fields?.isDigital)
            .map(({ fields }) => (
              <div className='feature-item'>
                <h3>{fields.title}</h3>
                <p>{fields.description}</p>
              </div>
            ))}
        </div> */}

        <div className='digital-features'>
          <h2>{content?.digitalResourcesTitle}</h2>
          <p>{content?.digitalResourcesDescription}</p>

          <div className='feature-grid'>
            {content?.option
              ?.filter((o) => o?.fields?.isDigital)
              .map(({ fields }) => (
                <div className='feature-item'>
                  <h3>{fields.title}</h3>
                  <p>{fields.description}</p>
                </div>
              ))}
          </div>
        </div>

        <div className='meditation-samples'>
          <h2>{content?.meditationsTitle}</h2>
          <div className='sample-list'>
            {content?.meditations?.map(({ fields }) => (
              <div className='sample-item'>
                <h3>{fields.title}</h3>
                <p>{fields.description}</p>
                <button className='play-button'>▶ Listen</button>
              </div>
            ))}
          </div>
          <div className='access-all'>
            <p>{content?.membershipDescription}</p>
            <Link to='/memberships' className='cta-button'>
              Explore Membership Options
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Meditations;
