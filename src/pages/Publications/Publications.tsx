import React, { useState, useEffect, useRef } from "react";
import "./PublicationsStyles.scss";
import { useAuth } from "../../contexts/AuthContext";
import PublicationCard from "../../components/PublicationCard/PublicationCard";
import { useSelector } from "react-redux";
import { getPublicationsWithCategories } from "./Publications.selector";
import Icon, { getIcon } from "../../components/Icon/Icon";
import Filters from "../../components/Filters/Filters";
interface Publication {
  fields: {
    title: string;
    body: string;
  };
}

const Publications = () => {
  const publications = useSelector(getPublicationsWithCategories);
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
      console.log("here");
      const elementTop = resultsContainer.current.getBoundingClientRect().top + window.scrollY; // absolute Y position in document

      const scrollTarget = elementTop - headerHeight;

      // window.scrollTo({ top: scrollTarget, behavior: "smooth" });
      resultsContainer.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const searchText = (e) => {
    const query = e.target.value;
    setActiveFilter("");
    setSearch(query);
    setDisplayPubs(
      publications.filter(
        (pub: Publication) =>
          pub.content.toLowerCase().includes(query.toLowerCase()) ||
          pub.title.toLowerCase().includes(query.toLowerCase())
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

  return (
    <div className='publications'>
      <h1>Articles</h1>
      <Filters search={search} searchText={searchText} activeFilter={activeFilter} filterPubs={filterPubs} />
      <div className='publications__filters'>
        {displayPubs?.length > 0 && (
          <span ref={resultsContainer} className='publications__count'>
            {/* Showing: {displayPubs?.length} publications {activeFilter && `related to ${activeFilter}`} */}
          </span>
        )}
        {(activeFilter || search) && (
          <button className='publications__filter' onClick={showAll}>
            clear filter
          </button>
        )}
      </div>
      {!displayPubs?.length && (
        <span className='publications__no-results'>Sorry, we couldn't find any articles that match your search</span>
      )}

      {!currentUser && (
        <div className='publications__user-prompt'>
          <p>
            Sign up to enable site-wide filtering and searching and building a list of favourite articles in your
            Journey
          </p>
        </div>
      )}

      <div className='publication__grid'>
        {displayPubs?.map((item) => (
          <PublicationCard key={item.uid} item={item} />
        ))}
      </div>
    </div>
  );
};

export default Publications;
