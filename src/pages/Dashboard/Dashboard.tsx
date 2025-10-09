import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useSavedItems } from "../../contexts/SavedItemsContext";
import "./Dashboard.scss";

import { useSelector } from "react-redux";
import Search from "../../components/Search/Search";
import immersiveLogo from "../../assets/icons/immersiveAudio.png";
import { deleteBespokeMed, updateMeditationDeleteStatus } from "../../store/apiUtils";
import Popup from "../../components/Popup/Popup";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { getStaticMeditations } from "../../store/contentSelectors";
import Panel from "./Panel";
import { useHorizontalIntersectionObserver } from "../../hooks/useHorizontalScrollVisibility";

type TabType = "meditations" | "publications" | "myMeds";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { removeItem, savedItems } = useSavedItems();
  const [activeTab, setActiveTab] = useState<TabType>("myMeds");
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  const [myMeds, setMyMeds] = useState([]);
  const data = useSelector((state) => state.content.meditations);
  const tabsRef = useRef();
  const [showPopup, setShowPopup] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);
  const introMeditations = useSelector(getStaticMeditations)?.filter((med) => med.introMed);

  // ✅ build dynamically instead of storing
  const allItems = {
    introMeditations,
    myMeds,

    ...savedItems,
    deleted: myMeds?.filter((item) => item.willDelete),
  };

  // user generated meditations
  useEffect(() => {
    if (data) {
      const meds = Object.values(data);
      const parsedMeds = meds.map((m, i) => ({
        ...(m as {}),
        type: "meditation",
        id: `${m.type}-${i}`,
        meditationType: m.type,
      }));
      setMyMeds(Object.values(parsedMeds).reverse());
    }
  }, [data, currentUser]);

  const handleRemoveItem = (itemId: number, type: keyof typeof savedItems, index: number) => {
    removeItem(itemId, type);
    setNotification({
      show: true,
      message: "Item removed from your Dashboard",
    });

    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const handleDeleteBespokeMed = async (itemId: string, shouldDelete: boolean) => {
    const array = [...myMeds].map((med) => {
      if (med.uid === itemId) {
        return { ...med, willDelete: shouldDelete ? Math.floor(Date.now()) / 1000 + 14 * 24 * 60 * 60 : false };
      }
      return med;
    });
    setMyMeds(array);
    if (currentUser?.uid) updateMeditationDeleteStatus(currentUser?.uid, itemId, shouldDelete);
  };
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleScroll = (key: string) => {
    const container = carouselRef.current;
    const panel = document.getElementById(`panel-${key}`);
    const containerCenter = container.offsetWidth / 2;
    const elCenter = panel.offsetLeft + panel.offsetWidth / 2;

    const scrollLeft = elCenter - containerCenter;

    container.scrollTo({
      left: scrollLeft,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    handleScroll("myMeds");
  }, []);

  const renderTabContent = (key: string) => {
    const data = allItems[key];
    const destination = activeTab === "publications" ? "articles" : "meditation-library";
    return (
      <Panel
        showPopup={showPopup}
        setShowPopup={setShowPopup}
        dataKey={key}
        data={data}
        notification={notification}
        destination={destination}
        itemToRemove={itemToRemove}
        setItemToRemove={setItemToRemove}
        setActiveTab={setActiveTab}
        activeTab={activeTab}
        handleDeleteBespokeMed={handleDeleteBespokeMed}
        handleRemoveItem={handleRemoveItem}
      />
    );
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    handleScroll(tab);
  };
  console.log(activeTab);
  return (
    <div className='dashboard-container'>
      <h1 className='page-header'>My Journey</h1>
      <div className='dashboard__search-container'>
        <Search dashboard text='Search Journey Items' />
      </div>
      <div key={activeTab} className='tabs__container'>
        <div ref={tabsRef} className='tabs'>
          <button
            className={`tab-btn ${activeTab === "introMeditations" ? "active" : ""}`}
            onClick={() => handleTabClick("introMeditations")}
          >
            Introduction Meditations
            {introMeditations?.length > 0 && <span className='tab-count'>{introMeditations?.length}</span>}
          </button>
          {/* <button
            className={`tab-btn ${activeTab === "myMeds" ? "active" : ""}`}
            onClick={() => handleTabClick("myMeds")}
          >
            My Collections
            {myMeds?.filter((item) => !item.willDelete).length > 0 && (
              <span className='tab-count'>{myMeds?.filter((item) => !item.willDelete).length}</span>
            )}
          </button> */}
          <button
            className={`tab-btn ${activeTab === "myMeds" ? "active" : ""}`}
            onClick={() => handleTabClick("myMeds")}
          >
            Bespoke Meditations
            {myMeds?.filter((item) => !item.willDelete).length > 0 && (
              <span className='tab-count'>{myMeds?.filter((item) => !item.willDelete).length}</span>
            )}
          </button>
          <button
            className={`tab-btn ${activeTab === "meditations" ? "active" : ""}`}
            onClick={() => handleTabClick("meditations")}
          >
            Library Meditations
            {savedItems?.meditations?.length > 0 && <span className='tab-count'>{savedItems?.meditations.length}</span>}
          </button>

          <button
            className={`tab-btn ${activeTab === "publications" ? "active" : ""}`}
            onClick={() => handleTabClick("publications")}
          >
            My Articles
            {savedItems.publications.length > 0 && <span className='tab-count'>{savedItems.publications.length}</span>}
          </button>
          <button
            style={{ color: "red" }}
            className={`tab-btn ${activeTab === "deleted" ? "active" : ""}`}
            onClick={() => handleTabClick("deleted")}
          >
            Recently Deleted
            {savedItems.publications.length > 0 && (
              <span className='tab-count'>{myMeds?.filter((item) => item.willDelete).length}</span>
            )}
          </button>
        </div>
      </div>
      <div ref={carouselRef} className='dashboard__content-carousel'>
        {["introMeditations", "myMeds", "meditations", "publications", "deleted"].map((key) => renderTabContent(key))}
      </div>
    </div>
  );
};

export default Dashboard;
