import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "../Dashboard/Dashboard.scss";
import "./MeditationLibraryStyles.scss";
import { useSavedItems } from "../../contexts/SavedItemsContext";
import { FaInfoCircle } from "react-icons/fa";
import { Meditation } from "../../models";
import MeditationCard from "../../components/MeditationCard/MeditationCard";
import { useSelector } from "react-redux";
import { getStaticMeds } from "./MeditationLibrary.selectors";
import Filters from "../../components/Filters/Filters";
import ToggleSwitch from "../../components/ToggleSwitch/ToggleSwitch";
import ToggleContainer from "./ToggleContainer";
import Popup from "../../components/Popup/Popup";
import Collections from "../../components/Collections/Collections";
import { trackCTA } from "../../utils/analytics";
import { createToast } from "../../store/contentSlice";
import LoadingScene from "../../components/LoadingScene/LoadingScene";

type TabType = "meditations" | "ebooks" | "publications";

const DigitalLibrary = () => {
  const { currentUser } = useAuth();
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [ImmersiveMeds, setImmersiveMeds] = useState(true);
  const [activeCollection, setActiveCollection] = useState("");
  const { addItem } = useSavedItems();
  const libraryMeditations = useSelector(getStaticMeds)
    ?.filter((med) => !med.introMed)
    .filter((med) => !med.collection);

  const showGodControls = useSelector((state) => state.content.showGodControls);

  const [meditations, setMeditations] = useState([]);
  const [displayMeds, setDisplayMeds] = useState([]);
  const resultsContainer = useRef<HTMLDivElement>();
  const [allowDel, setAllowDel] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    if (meditations.length === 0)
      setMeditations(libraryMeditations.filter((med) => filterByImmersive(med, ImmersiveMeds)));
  }, [libraryMeditations]);

  useEffect(() => {
    setDisplayMeds(meditations);
  }, [meditations]);

  const filterMeds = (word: string) => {
    setActiveFilter(word);
    setDisplayMeds(
      libraryMeditations
        .filter((pub) => {
          const cats = pub.category.map((cat) => cat.category.replace(/\s+/g, ""));
          return cats[0].toLowerCase() === word.toLowerCase();
        })
        .filter((med) => filterByImmersive(med, ImmersiveMeds)),
    );

    if (resultsContainer?.current) {
      resultsContainer.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  function filterByImmersive<T extends { immersive?: boolean }>(item: T, immersiveMode: boolean) {
    return immersiveMode ? !!item.immersive : !item.immersive;
  }

  const searchText = (e) => {
    const query = e.target.value;
    setSearch(query);
    setDisplayMeds(
      libraryMeditations
        .filter(
          (pub: Meditation) =>
            pub.content?.toLowerCase().includes(query.toLowerCase()) ||
            pub.title?.toLowerCase().includes(query.toLowerCase()),
        )
        .filter((med) => filterByImmersive(med, ImmersiveMeds)),
    );
  };

  const showAll = () => {
    setSearch("");
    setDisplayMeds(libraryMeditations);
  };

  const handleAddItem = (item: any) => {
    addItem(item);
  };
  const renderTabContent = () => {
    return (
      <div className='dashboard-content'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {displayMeds
            .filter((med) => {
              if (currentUser?.isGod) return true;
              return med.verified;
            })
            ?.map((item, i) => (
              <MeditationCard
                showDelete={allowDel}
                key={`meditation-card-${i}`}
                handleAddItem={handleAddItem}
                item={item}
                i={i}
              />
            ))}
        </div>
      </div>
    );
  };

  const showNonVerified = () => {
    setSearch("non - verified");
    setDisplayMeds(libraryMeditations.filter((m) => m.staticMed && !m.verified));
  };

  useEffect(() => {
    if (ImmersiveMeds) {
      setDisplayMeds(libraryMeditations.filter((m) => m.immersive));
    } else {
      setDisplayMeds(libraryMeditations.filter((m) => !m.immersive));
    }
  }, [ImmersiveMeds]);
  const [showPopup, setShowPopup] = useState(false);

  const renderSearch = () => {
    return (
      <div className='publications__filters'>
        <div className='meditation-library__switches'>
          <div className='meditation-library__toggle-container'>
            <ToggleSwitch
              checked={ImmersiveMeds}
              onChange={(e) => {
                trackCTA(`Immersive Toggle value: ${e}`);
                setImmersiveMeds(e);
              }}
              size='md'
            />
            <button className='meditation-library__toggle-container__info-cta' onClick={() => setShowPopup(true)}>
              <FaInfoCircle />
            </button>
          </div>
          <div className='immersive-container'>
            <ToggleContainer show={ImmersiveMeds} />
          </div>
        </div>
        <Popup fitContent show={showPopup} onClose={() => setShowPopup(false)}>
          <div className='meditation-library__ai-popup'>
            <p>
              If you are toggled to Immersive Audio, you will only see meditations which can be played with Reszen8
              crafted Immersive Audio environments.
            </p>
            <p>Voice Only meditations do not have Immersive Audio compatability.</p>
          </div>
        </Popup>

        <Filters
          placeholder='Type to search meditations'
          filterPubs={filterMeds}
          activeFilter={activeFilter}
          search={search}
          searchText={searchText}
        />

        {libraryMeditations.length > 0 && (
          <span ref={resultsContainer} className='meditation-library__search-results'>
            Showing {displayMeds.length} of {libraryMeditations?.length}
          </span>
        )}
        {search.length > 0 ||
          (activeFilter && (
            <button className='publications__filter' onClick={showAll}>
              Show all
            </button>
          ))}
        {showGodControls && currentUser && currentUser.isGod && !window.location.href.includes("hideGodControls") && (
          <div style={{ display: "flex" }}>
            <button onClick={showNonVerified}>Only Non-verified</button>
            <button onClick={() => setAllowDel(!allowDel)}>Show Delete</button>
          </div>
        )}
      </div>
    );
  };

  if (!libraryMeditations.length) return <LoadingScene />;

  return (
    <div className='dashboard-container'>
      {/* <h1 className='page-header'>Meditation Library</h1> */}
      <Collections showDelete={allowDel} handleClick={setActiveCollection} />
      {!activeCollection && (
        <>
          <h2 style={{ textAlign: "center", marginTop: 50, fontSize: 30 }}>Meditation Library</h2>
          {renderSearch()}
          {renderTabContent()}
        </>
      )}
    </div>
  );
};

export default DigitalLibrary;
