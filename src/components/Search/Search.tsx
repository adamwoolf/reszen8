import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import "./SearchStyles.scss";
import { useContentStore } from "../../store/contentStore";
import Popup from "../../pages/MeditationGenerator/Popup";
import { Link } from "react-router-dom";
import useFirebaseDatabase from "../../hooks/useFirestoreCollection";
import { Meditation, Publication } from "../../models";
import AudioPlayer from "../AudioPlayer/AudioPlayer";

const Search = () => {
  const [show, setShow] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Publication[]>([]);
  const [meds, setMeds] = useState<Meditation[]>([]);
  const { publications, meditations, setMeditations } = useContentStore();

  const { data } = useFirebaseDatabase("meditations");

  useEffect(() => {
    if (!meditations && data) setMeditations(data);
  }, [meditations, data]);

  const search = () => {
    const pubs = publications.filter((pub: Publication) => pub.fields.body.toLowerCase().includes(query.toLowerCase()));
    const ms = meditations
      ? Object.values(meditations).filter(
          (m: any) =>
            m.content.toLowerCase().includes(query.toLowerCase()) || m.title.toLowerCase().includes(query.toLowerCase())
        )
      : [];
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

  return (
    <div>
      <button onClick={() => setShow(true)} className='search-cta'>
        <FaSearch color='orange' />
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
              <a className='search__results-tab' href='#publications'>
                Publications {results.length}
              </a>
            )}
            {meds.length > 0 && (
              <a className='search__results-tab' href='#meditations'>
                Meditations: {meds.length}
              </a>
            )}
          </div>
          <div className='search__results-container'>
            <div className='search__results-section' id='publications'>
              {results.length > 0 && <h3>PUBLICATIONS</h3>}
              {results.length > 0 &&
                results.map((r, i) => {
                  return (
                    <div className='search__result' key={i}>
                      <span>{r.fields.title}</span>
                      <Link
                        className='search__result-link'
                        onClick={closeOverlay}
                        to={`/publications/${r.fields.slug}`}
                      >
                        Read...
                      </Link>
                    </div>
                  );
                })}
            </div>
            <div className='search__results-section' id='meditations'>
              {meds.length > 0 && <h3>MEDITATIONS</h3>}

              {meds.length > 0 &&
                meds.map((r, i) => {
                  return (
                    <div className='search__result search__result--meditation' key={i}>
                      <p>{r.title}</p>
                      <AudioPlayer audioUrl={r.audioUrl} />
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
