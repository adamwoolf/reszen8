import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchStyles.scss";
import Popup from "../Popup/Popup";
import { Meditation, Publication } from "../../models";
import PublicationCard from "../PublicationCard/PublicationCard";
import MeditationCard from "../MeditationCard/MeditationCard";
import { useSelector } from "react-redux";
import { useSavedItems } from "../../contexts/SavedItemsContext";
import { useAuth } from "../../contexts/AuthContext";
import { getPublicationsWithLikes } from "../../pages/Publications/Publications.selector";
import Icon, { getIcon } from "../Icon/Icon";
import { getMeditationsWithLikes } from "../../pages/MeditationLibrary/MeditationLibrary.selectors";

const Search = ({ text, dashboard }: { dashboard?: boolean; text?: string }) => {
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("");
  const [results, setResults] = useState<Publication[]>([]);
  const [meds, setMeds] = useState<Meditation[]>([]);
  const meditations = useSelector(getMeditationsWithLikes);
  const publications = useSelector(getPublicationsWithLikes);
  const [bespokeMeds, setBespokeMeds] = useState([]);
  const { savedItems } = useSavedItems();
  const { currentUser } = useAuth();

  const searchDashboardItems = () => {
    const { meditations: dashboardMeditations, publications: dashBoardPubs } = savedItems || {};

    const pubs = dashBoardPubs.filter((pub: Publication) => pub?.body.toLowerCase().includes(query.toLowerCase()));
    const normalisedPubs = pubs.map((pub) => ({ fields: { ...pub }, sys: { ...pub } }));
    setResults(normalisedPubs);
    const ms = dashboardMeditations.filter(
      (med) =>
        med.content?.toLowerCase().includes(query?.toLowerCase()) ||
        med.title.toLowerCase().includes(query?.toLowerCase())
    );
    setMeds(ms);
    if (!currentUser) return;
    const myMs = Object.values(meditations).filter((m) => m.generatedBy === currentUser.uid);
    const filtered = myMs.filter(
      (med) =>
        med.content?.toLowerCase().includes(query?.toLowerCase()) ||
        med.title.toLowerCase().includes(query?.toLowerCase())
    );
    setBespokeMeds(filtered);
  };

  const search = () => {
    if (dashboard) return searchDashboardItems();
    const pubs = publications.filter((pub: Publication) => pub.content.toLowerCase().includes(query.toLowerCase()));

    const ms = meditations.filter(
      (m: any) =>
        m.content.toLowerCase().includes(query.toLowerCase()) || m.title.toLowerCase().includes(query.toLowerCase())
    );

    setResults(pubs);
    setMeds(ms as Meditation[]);
  };

  useEffect(() => {
    if (query) search();
  }, [query]);

  const closeOverlay = () => {
    setQuery("");
    setResults([]);
    setMeds([]);
    setShow(false);
  };

  const clear = () => {
    setQuery("");
    setResults([]);
    setMeds([]);
    setFilter("");
  };

  const ScrollLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
    const handleClick = (e: React.MouseEvent) => {
      e.preventDefault();
      const el = document.getElementById(to);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    };

    return (
      <a href={`#${to}`} onClick={handleClick}>
        {children}
      </a>
    );
  };

  const filterContent = (word: string) => {
    setFilter(word);
    const filtered = publications.filter((pub: Publication) => {
      const cats = pub.category.map((cat) => cat.category.replace(/\s+/g, ""));
      return cats.includes(word);
    });
    const filteredMeds = meditations.filter((pub: Publication) => {
      const cats = pub.category.map((cat) => cat.category.replace(/\s+/g, ""));
      return cats.includes(word);
    });
    setResults(filtered);
    setMeds(filteredMeds);
  };

  return (
    <div>
      <button onClick={() => setShow(true)} className='search-cta'>
        <span className='search__header-text'>{text ?? "Site Search"}</span> <FaSearch size={20} color='orange' />
      </button>
      <Popup show={show} onClose={closeOverlay}>
        <div className='search'>
          <h3>{text ?? "Search"}</h3>
          <div className='search__inputs'>
            <input
              className='search__input'
              placeholder='Type to find content'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={clear} className='search__clear'>
              clear
            </button>
          </div>
          {!results.length && !meds.length && !bespokeMeds.length && (
            <div className='search__tile-container'>
              {Object.keys(getIcon).map((icon, i) => (
                <button
                  style={{ animationDelay: `${i * 40}ms` }}
                  key={icon}
                  className='search__tile'
                  onClick={() => filterContent(icon)}
                >
                  <Icon large type={icon} />
                </button>
              ))}
            </div>
          )}
          <div className='search__results-count'>
            {bespokeMeds.length > 0 && (
              <ScrollLink to='bespokeMeditations'>
                <span className='search__results-tab'>Bespoke Meditations {bespokeMeds.length}</span>
              </ScrollLink>
            )}
            {results.length > 0 && (
              <ScrollLink to='publications'>
                <span className='search__results-tab'>Articles {results.length}</span>
              </ScrollLink>
            )}
            {meds.length > 0 && (
              <ScrollLink to='meditations'>
                <span className='search__results-tab'> Meditations: {meds.length}</span>
              </ScrollLink>
            )}
            {query && meds.length === 0 && results.length === 0 && bespokeMeds.length === 0 && (
              <p className='search__no-results'>
                Sorry, there are no items which match your search text. Please try different search text.
              </p>
            )}
            {filter && (meds.length > 0 || results.length > 0 || bespokeMeds.length > 0) && (
              <p className='search__no-results'>Showing results related to {filter}</p>
            )}
          </div>
          {(bespokeMeds.length > 0 || results.length > 0 || meds.length > 0) && (
            <div className='search__results-container'>
              {bespokeMeds.length > 0 && (
                <h3 className='search__results-heading' id='bespokeMeditations'>
                  Bespoke Meditations
                </h3>
              )}

              {bespokeMeds.length > 0 && (
                <div className='search__results-section'>
                  {bespokeMeds.length > 0 &&
                    bespokeMeds.map((item, i) => {
                      return (
                        <div className='search__result search__result--meditation' key={i}>
                          <MeditationCard item={item} i={i} />
                        </div>
                      );
                    })}
                </div>
              )}
              {results.length > 0 && (
                <h3 className='search__results-heading' id='publications'>
                  ARTICLES
                </h3>
              )}

              {results.length > 0 && (
                <div className='search__results-section'>
                  {results.length > 0 &&
                    results.map((r, i) => {
                      return (
                        <div className='search__result' key={i}>
                          <PublicationCard onClose={closeOverlay} item={r} />
                        </div>
                      );
                    })}
                </div>
              )}
              {meds.length > 0 && (
                <h3 className='search__results-heading' id='meditations'>
                  MEDITATIONS
                </h3>
              )}

              {meds.length > 0 && (
                <div className='search__results-section'>
                  {meds.length > 0 &&
                    meds.map((item, i) => {
                      return (
                        <div className='search__result search__result--meditation' key={i}>
                          <MeditationCard item={item} i={i} />
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      </Popup>
    </div>
  );
};

export default Search;
