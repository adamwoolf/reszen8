import React, { useState, useEffect, useRef } from "react";
import "./PublicationsStyles.scss";
import { useAuth } from "../../contexts/AuthContext";
import PublicationCard from "../../components/PublicationCard/PublicationCard";
import { useSelector } from "react-redux";
import { getPublicationsWithLikes } from "./Publications.selector";
import Icon, { getIcon } from "../../components/Icon/Icon";
interface Publication {
  fields: {
    title: string;
    body: string;
  };
}

const Publications = () => {
  const publications = useSelector(getPublicationsWithLikes);
  const { currentUser } = useAuth();
  const [displayPubs, setDisplayPubs] = useState<[]>([]);
  const [activeFilter, setActiveFilter] = useState("");
  const [showingFavs, setShowingFavs] = useState(false);
  const [search, setSearch] = useState("");
  const resultsContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (publications && !displayPubs?.length) setDisplayPubs(publications);
  }, [setDisplayPubs, displayPubs, publications]);

  const filterPubs = (word: string) => {
    setActiveFilter(word);
    setDisplayPubs(
      publications.filter((pub: Publication) => {
        const cats = pub.category.map((cat) => cat.category.replace(/\s+/g, ""));
        return cats.includes(word);
      })
    );

    const isMobile = window.innerWidth < 768;
    const headerHeight = isMobile ? 300 : 240; // increased for taller header

    if (resultsContainer?.current) {
      const elementTop = resultsContainer.current.getBoundingClientRect().top + window.scrollY; // absolute Y position in document

      const scrollTarget = elementTop - headerHeight;

      window.scrollTo({ top: scrollTarget, behavior: "smooth" });
    }
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
          {/* {currentUser && (
            <button
              className={!showingFavs ? "publications__filter non-active-filter" : "publications__filter"}
              onClick={showFavourites}
            >
              Only Favourites
            </button>
          )} */}
        </div>

        <div className='publications__tiles'>
          {Object.keys(getIcon).map((icon) => (
            <button
              key={icon}
              className={activeFilter !== icon ? "publications__filter non-active-filter" : "publications__filter"}
              onClick={() => filterPubs(icon)}
            >
              <Icon large type={icon} />
            </button>
          ))}
        </div>
        {activeFilter && (
          <button className='publications__filter' onClick={showAll}>
            clear filter
          </button>
        )}
        {displayPubs?.length > 0 && (
          <span ref={resultsContainer} className='publications__count'>
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
        {displayPubs?.map((item) => (
          <PublicationCard key={item.sys.id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default Publications;
