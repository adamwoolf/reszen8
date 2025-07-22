import React, { useState, useEffect } from "react";
import useContentful from "../../hooks/useContentful";
import { getPublications } from "../../contentful";
import { Link } from "react-router-dom";
import { marked } from "marked";
import "./PublicationsStyles.scss";
import { useAuth } from "../../contexts/AuthContext";

interface Publication {
  fields: {
    title: string;
    body: string;
  };
}

const Publications = () => {
  const content = useContentful(getPublications)?.content?.items || [];
  const { currentUser } = useAuth();
  const [displayPubs, setDisplayPubs] = useState([]);
  const [activeFilter, setActiveFilter] = useState("");
  const [search, setSearch] = useState("");
  function truncateTo25Words(text: string) {
    const words = text.trim().split(/\s+/); // split on any whitespace
    if (words.length <= 25) return text;
    return words.slice(0, 25).join(" ") + "…";
  }

  useEffect(() => {
    setDisplayPubs(content);
  }, [content]);

  const filterPubs = (word: string) => {
    setActiveFilter(word);
    setDisplayPubs(
      content.filter(
        (pub: Publication) =>
          pub.fields.body.toLowerCase().includes(word.toLowerCase()) ||
          pub.fields.title.toLowerCase().includes(word.toLowerCase())
      )
    );
  };

  const searchText = (e) => {
    const query = e.target.value;
    setActiveFilter("");
    setSearch(query);
    setDisplayPubs(
      content.filter(
        (pub: Publication) =>
          pub.fields.body.toLowerCase().includes(query.toLowerCase()) ||
          pub.fields.title.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const showAll = () => {
    setActiveFilter("");
    setSearch("");
    setDisplayPubs(content);
  };

  const keyWords = ["Mindfulness", "Growth", "Awareness", "Stress", "Anger"];

  return (
    <div className='publications'>
      <h1>Publications</h1>
      <div className='publications__filters'>
        <input className='publications__search' value={search} onChange={searchText} placeholder='Type to search' />
        <div>
          <button className='publications__filter' onClick={showAll}>
            Show all
          </button>
          {keyWords.map((word) => (
            <button
              className={activeFilter !== word ? "publications__filter non-active-filter" : "publications__filter"}
              onClick={() => filterPubs(word)}
            >
              {word}
            </button>
          ))}
        </div>
        {displayPubs.length > 0 && (
          <span className='publications__count'>
            Showing: {displayPubs.length} publications {activeFilter && `for ${activeFilter}`}
          </span>
        )}
      </div>
      {!displayPubs.length && (
        <span className='publications__no-results'>
          Sorry, we couldn't find any publications that match your search
        </span>
      )}

      <div className='publication__grid'>
        {displayPubs?.map(({ fields, sys }) => {
          const date = new Date(fields.publishDate);
          const truncatedBody = truncateTo25Words(fields.body);

          const isSaved = !!currentUser?.savedItems?.publications?.find((p) => p.id === sys.id);
          return (
            <article className='feature-card clickable publication__card'>
              <div className='publication__card-content'>
                <h3>{fields.title}</h3>
                <span className='publication__card-date'>{date.toDateString()}</span>
                {isSaved && <p className='publication__card-saved'>Saved to my dashboard</p>}
                <div className='publication__card-divider' />
                <span dangerouslySetInnerHTML={{ __html: marked(truncatedBody) }} />
              </div>
              <Link to={`/publications/${fields.slug}`}>read more</Link>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default Publications;
