import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import "../Dashboard/Dashboard.scss";
import "./MeditationLibraryStyles.scss";
import { useSavedItems } from "../../contexts/SavedItemsContext";

import { Meditation } from "../../models";
import MeditationCard from "../../components/MeditationCard/MeditationCard";
import { useSelector } from "react-redux";
import { getMeditationsWithLikes } from "./MeditationLibrary.selectors";
type TabType = "meditations" | "ebooks" | "publications";

const DigitalLibrary = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  const [search, setSearch] = useState("");

  const { addItem } = useSavedItems();
  const libraryMeditations = useSelector(getMeditationsWithLikes);
  const [displayMeds, setDisplayMeds] = useState([]);

  useEffect(() => {
    setDisplayMeds(libraryMeditations);
  }, [libraryMeditations]);

  const searchText = (e) => {
    const query = e.target.value;
    setSearch(query);
    setDisplayMeds(
      libraryMeditations.filter(
        (pub: Meditation) =>
          pub.content.toLowerCase().includes(query.toLowerCase()) ||
          pub.title.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const showAll = () => {
    setSearch("");
    setDisplayMeds(libraryMeditations);
  };

  const handleAddItem = (item: any) => {
    const wasAdded = addItem(item);
    if (wasAdded) {
      setNotification({
        show: true,
        message: `${item.title} has been added to your Dashboard`,
      });
    } else {
      setNotification({
        show: true,
        message: `${item.title} is already in your Dashboard`,
      });
    }

    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
  };
  const renderTabContent = () => {
    return (
      <div className='dashboard-content'>
        {notification.show && (
          <div className='fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'>
            {notification.message}
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {displayMeds?.map((item, i) => (
            <MeditationCard key={`meditation-card-${i}`} handleAddItem={handleAddItem} item={item} i={i} />
          ))}
        </div>
      </div>
    );
  };

  const showStatic = () => {
    setSearch("static only");
    setDisplayMeds(libraryMeditations.filter((m) => m.staticMed));
  };

  const showNonVerified = () => {
    setSearch("non - verified");
    setDisplayMeds(libraryMeditations.filter((m) => m.staticMed && !m.verified));
  };

  const renderSearch = () => {
    return (
      <div className='publications__filters'>
        <input
          className='publications__search'
          value={search}
          onChange={searchText}
          placeholder='Type to search meditations'
        />
        <span className='meditation-library__search-results'>
          Showing {displayMeds.length} of {libraryMeditations?.length}
        </span>
        {search.length > 0 && (
          <button className='publications__filter' onClick={showAll}>
            Show all
          </button>
        )}
        {currentUser && currentUser.isGod && (
          <div style={{ display: "flex" }}>
            <button style={{ marginRight: 12 }} onClick={showStatic}>
              Only Static
            </button>
            <button onClick={showNonVerified}>Only Non-verified</button>
          </div>
        )}
      </div>
    );
    {
      /* {currentUser && (
        <button
          className={!showingFavs ? "publications__filter non-active-filter" : "publications__filter"}
          onClick={showFavourites}
        >
          Only Favourites
        </button>
      )} */
    }
  };

  return (
    <div className='dashboard-container'>
      <h1 className='page-header'>Meditation Library</h1>
      {renderSearch()}
      {renderTabContent()}
    </div>
  );
};

export default DigitalLibrary;
