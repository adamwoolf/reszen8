import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchStyles.scss";
import Popup from "../../pages/MeditationGenerator/Popup";
import useFirebaseDatabase from "../../hooks/useFirestoreCollection";
import { Meditation, Publication } from "../../models";
import PublicationCard from "../PublicationCard/PublicationCard";
import MeditationCard from "../MeditationCard/MeditationCard";
import { useSelector } from "react-redux";
const Search = () => {
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Publication[]>([]);
  const [meds, setMeds] = useState<Meditation[]>([]);
  const meditations = useSelector((state) => state.content.meditations);
  const publications = useSelector((state) => state.content.publications);
  const { data } = useFirebaseDatabase("meditations");

  const search = () => {
    const pubs = publications.filter((pub: Publication) => pub.fields.body.toLowerCase().includes(query.toLowerCase()));

    const normalisedBespoke = data
      ? Object.values(meditations)
          .reverse()
          ?.map((med: Meditation) => {
            return {
              ...med,
              type: "meditation",
              id: med.audioUrl,
            };
          })
      : [];
    const ms = normalisedBespoke.filter(
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

  return (
    <div>
      <button onClick={() => setShow(true)} className='search-cta'>
        <span>MultiSearch</span> <FaSearch size={20} color='orange' />
      </button>
      <Popup show={show} onClose={closeOverlay}>
        <div className='search'>
          <h3>Search</h3>
          <div className='search__inputs'>
            <input
              className='search__input'
              placeholder='Type to find publications and meditations'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <button onClick={clear} className='search__clear'>
              clear
            </button>
          </div>
          <div className='search__results-count'>
            {results.length > 0 && (
              <ScrollLink to='publications'>
                <span className='search__results-tab'>Publications {results.length}</span>
              </ScrollLink>
            )}
            {meds.length > 0 && (
              <ScrollLink to='meditations'>
                <span className='search__results-tab'> Meditations: {meds.length}</span>
              </ScrollLink>
            )}
            {query && meds.length === 0 && results.length === 0 && (
              <p className='search__no-results'>
                Sorry, there are no items which match your search text. Please try different search text.
              </p>
            )}
          </div>
          <div className='search__results-container'>
            {results.length > 0 && <h3 id='publications'>PUBLICATIONS</h3>}

            <div className='search__results-section'>
              {results.length > 0 &&
                results.map((r, i) => {
                  return (
                    <div className='search__result' key={i}>
                      <PublicationCard fields={r.fields} sys={r.sys} />
                    </div>
                  );
                })}
            </div>
            {meds.length > 0 && <h3 id='meditations'>MEDITATIONS</h3>}

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
          </div>
        </div>
      </Popup>
    </div>
  );
};

export default Search;
