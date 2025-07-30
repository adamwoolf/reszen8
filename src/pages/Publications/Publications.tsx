import React, { useState, useEffect } from "react";
import { getPublications } from "../../contentful";
import { Link } from "react-router-dom";
import { marked } from "marked";
import "./PublicationsStyles.scss";
import { useAuth } from "../../contexts/AuthContext";
import LikeCta from "./LikeCta";
import { useContentStore } from "../../store/contentStore";
interface Publication {
  fields: {
    title: string;
    body: string;
  };
}

const Publications = () => {
  const { publications, setPublications } = useContentStore();
  const { currentUser, setCurrentUser } = useAuth();
  const [displayPubs, setDisplayPubs] = useState([]);
  const [activeFilter, setActiveFilter] = useState("");
  const [showingFavs, setShowingFavs] = useState(false);
  const [search, setSearch] = useState("");
  function truncateTo25Words(text: string) {
    const words = text.trim().split(/\s+/); // split on any whitespace
    if (words.length <= 25) return text;
    return words.slice(0, 25).join(" ") + "…";
  }

  useEffect(() => {
    if (!publications?.length) {
      getPublications().then((data) => {
        setPublications(data.items);
      });
    }
  }, [publications]);

  useEffect(() => {
    if (publications && !displayPubs?.length) setDisplayPubs(publications);
  }, [setDisplayPubs, displayPubs, publications]);

  const filterPubs = (word: string) => {
    setActiveFilter(word);
    setDisplayPubs(
      publications.filter(
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
      publications.filter(
        (pub: Publication) =>
          pub.fields.body.toLowerCase().includes(query.toLowerCase()) ||
          pub.fields.title.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const showAll = () => {
    setActiveFilter("");
    setSearch("");
    setDisplayPubs(publications);
  };

  const showFavourites = () => {
    setShowingFavs(!showingFavs);
    setActiveFilter("favourite");
    const favPubs = currentUser?.favourites?.publications;
    const favs = publications.filter((item: any) => favPubs.includes(item.sys.id));
    setDisplayPubs(favs);
  };

  const keyWords = ["Mindfulness", "Growth", "Awareness", "Stress", "Anger"];

  return (
    <div className='publications'>
      <h1>Publications</h1>
      {currentUser && (
        <>
          <div className='publications__filters'>
            <input className='publications__search' value={search} onChange={searchText} placeholder='Type to search' />
            <div>
              <button className='publications__filter' onClick={showAll}>
                Show all
              </button>
              <button
                className={!showingFavs ? "publications__filter non-active-filter" : "publications__filter"}
                onClick={showFavourites}
              >
                Only Favourites
              </button>
              {keyWords.map((word) => (
                <button
                  key={word}
                  className={activeFilter !== word ? "publications__filter non-active-filter" : "publications__filter"}
                  onClick={() => filterPubs(word)}
                >
                  {word}
                </button>
              ))}
            </div>
            {displayPubs?.length > 0 && (
              <span className='publications__count'>
                Showing: {displayPubs?.length} {activeFilter} publications.
              </span>
            )}
          </div>
          {!displayPubs?.length && (
            <span className='publications__no-results'>
              Sorry, we couldn't find any publications that match your search
            </span>
          )}
        </>
      )}

      {!currentUser && (
        <div className='publications__user-prompt'>
          <p>Sign up to enable filtering, searching and building a list of favourite articles in your User Dashboard</p>
        </div>
      )}

      <div className='publication__grid'>
        {displayPubs?.map(({ fields, sys }) => {
          const truncatedBody = truncateTo25Words(fields.body);
          const isSaved = !!currentUser?.savedItems?.publications?.find((p) => p.id === sys.id);
          return (
            <article key={sys.id} className='feature-card clickable publication__card'>
              <LikeCta id={sys.id} />

              <Link to={`/publications/${fields.slug}`}>
                <div className='publication__card-content'>
                  <h3 className='publication__card-title'>{fields.title}</h3>
                  {isSaved && <p className='publication__card-saved'>Saved to my dashboard</p>}
                  <div className='publication__card-divider' />
                  <span dangerouslySetInnerHTML={{ __html: marked(truncatedBody) }} />
                </div>
                read more...
              </Link>
            </article>
          );
        })}
      </div>
    </div>
  );
};

export default Publications;
