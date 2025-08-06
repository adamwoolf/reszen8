import React, { useState, useEffect } from "react";
import "./PublicationsStyles.scss";
import { useAuth } from "../../contexts/AuthContext";
import PublicationCard from "../../components/PublicationCard/PublicationCard";
import { useSelector } from "react-redux";

interface Publication {
  fields: {
    title: string;
    body: string;
  };
}

const Publications = () => {
  const publications = useSelector((state) => state.content.publications);
  const { currentUser, setCurrentUser } = useAuth();
  const [displayPubs, setDisplayPubs] = useState([]);
  const [activeFilter, setActiveFilter] = useState("");
  const [showingFavs, setShowingFavs] = useState(false);
  const [search, setSearch] = useState("");
  console.log(publications);
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
      <div className='publications__filters'>
        <input
          className='publications__search'
          value={search}
          onChange={searchText}
          placeholder='Type to search publications'
        />
        <div>
          <button className='publications__filter' onClick={showAll}>
            Show all
          </button>
          {currentUser && (
            <button
              className={!showingFavs ? "publications__filter non-active-filter" : "publications__filter"}
              onClick={showFavourites}
            >
              Only Favourites
            </button>
          )}
          {/* {keyWords.map((word) => (
                <button
                  key={word}
                  className={activeFilter !== word ? "publications__filter non-active-filter" : "publications__filter"}
                  onClick={() => filterPubs(word)}
                >
                  {word}
                </button>
              ))} */}
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

      {!currentUser && (
        <div className='publications__user-prompt'>
          <p>
            Sign up to enable site-wide filtering and searching and building a list of favourite articles in your User
            Dashboard
          </p>
        </div>
      )}

      <div className='publication__grid'>
        {displayPubs?.map(({ fields, sys }) => (
          <PublicationCard key={sys.id} fields={fields} sys={sys} />
        ))}
      </div>
    </div>
  );
};

export default Publications;
