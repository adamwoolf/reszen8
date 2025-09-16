import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useSavedItems } from "../../contexts/SavedItemsContext";
import "./Dashboard.scss";
import { FaArrowRight, FaChevronRight, FaChevronLeft } from "react-icons/fa";
import AudioPlayer from "../../components/AudioPlayer/AudioController";
import { useSelector } from "react-redux";
import Search from "../../components/Search/Search";
import immersiveLogo from "../../assets/icons/immersiveAudio.png";
import { deleteBespokeMed } from "../../store/apiUtils";
import Popup from "../MeditationGenerator/Popup";

type TabType = "meditations" | "publications" | "myMeds";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { removeItem, savedItems } = useSavedItems();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("meditations");
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [myMeds, setMyMeds] = useState([]);
  const data = useSelector((state) => state.content.meditations);
  const tabsRef = useRef();
  const [showPopup, setShowPopup] = useState(false);
  const [itemToRemove, setItemToRemove] = useState(null);

  // ✅ build dynamically instead of storing
  const allItems = {
    ...savedItems,
    myMeds,
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

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

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

  const handleDeleteBespokeMed = async (itemId: string) => {
    deleteBespokeMed;
  };

  const renderTabContent = () => {
    const data = allItems[activeTab];
    const destination = activeTab === "publications" ? "articles" : "meditation-library";
    return (
      <div className='dashboard-content'>
        {notification.show && (
          <div className='fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'>
            {notification.message}
          </div>
        )}

        {data?.length === 0 ? (
          <div className='text-center py-10'>
            <p className='text-gray-400 mb-4'>You haven't added any {activeTab} to your dashboard yet.</p>
            <Link to={`/${destination}`} className='text-orange-400 hover:text-orange-300 font-medium'>
              Browse{" "}
              {activeTab === "publications" ? "Articles" : activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)} →
            </Link>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {data?.map((item, i) => {
              const keyId = `${activeTab}-${item?.uid ?? item?.id ?? i}`;

              function isToday(timestamp) {
                const today = new Date();
                const dateToCheck = new Date(timestamp);

                return (
                  today.getFullYear() === dateToCheck.getFullYear() &&
                  today.getMonth() === dateToCheck.getMonth() &&
                  today.getDate() === dateToCheck.getDate()
                );
              }
              return (
                <div key={keyId} className='feature-card publication__card'>
                  <div className='publications__card-content dashboard__card-inner'>
                    <div>
                      <h3>{item.title}</h3>
                      <div>
                        {/* {item.createdAt && (
                        <span className='flex items-center'>{new Date(item.createdAt).toLocaleDateString()}</span>
                      )} */}
                        {item.style && <p>{item.style}</p>}
                        {item.createdAt && !item.staticMed && activeTab !== "publications" && (
                          <span className='dashboard__date'>
                            Created: {isToday(item.createdAt) ? "Today" : new Date(item.createdAt).toDateString()}{" "}
                          </span>
                        )}
                      </div>
                    </div>
                    {item.immersive && (
                      <div className='dashboard__immersive-icon'>
                        <img className='immersive-icon' src={immersiveLogo} />
                      </div>
                    )}

                    <div className='dashboard-buttons'>
                      {item.audioUrl && activeTab !== "publications" && (
                        <div className='dashboard__audio'>
                          <AudioPlayer isImmersive={item.immersive} audioUrl={item.audioUrl} />
                        </div>
                      )}
                      {activeTab === "publications" && (
                        <Link className='read-link' to={`/articles/${item.title}`}>
                          <span className='read-link-text'> Read</span>
                          <FaArrowRight />{" "}
                        </Link>
                      )}

                      <div>
                        {activeTab !== "myMeds" && (
                          <button
                            onClick={() => {
                              setItemToRemove(item);
                              setShowPopup(true);
                            }}
                            className='dashboard-button dashboard__remove-cta'
                          >
                            Remove
                          </button>
                        )}
                        <Popup showClose={false} fitContent show={showPopup} onClose={() => setShowPopup(false)}>
                          <h3>Remove from Dashboard</h3>
                          <p>
                            "{itemToRemove?.title}" will be removed from your dashboard, but still be available in the{" "}
                            {activeTab === "publications" ? "the Articles page" : "the Meditation Library"}
                          </p>
                          <button onClick={() => setShowPopup(false)} className='dashboard-button'>
                            Cancel
                          </button>
                          <button
                            onClick={() => {
                              handleRemoveItem(item, activeTab as keyof typeof savedItems, i);
                              setShowPopup(false);
                            }}
                            className='dashboard-button'
                          >
                            Okay
                          </button>
                        </Popup>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };
  const [showLeftChevron, setShowLeftChevron] = useState(false);
  const [showRightChevron, setShowRightChevron] = useState(false);

  const updateChevronVisibility = () => {
    if (!tabsRef.current) return;

    const container = tabsRef.current;
    const firstTab = container.firstElementChild as HTMLElement;
    const lastTab = container.lastElementChild as HTMLElement;

    const isFirstVisible = container.scrollLeft <= firstTab.offsetLeft;
    const isLastVisible = container.scrollLeft + container.offsetWidth >= lastTab.offsetLeft + lastTab.offsetWidth - 10;

    setShowLeftChevron(!isFirstVisible);
    setShowRightChevron(!isLastVisible);
  };

  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;

    updateChevronVisibility(); // Initial check

    container.addEventListener("scroll", updateChevronVisibility);
    window.addEventListener("resize", updateChevronVisibility);

    return () => {
      container.removeEventListener("scroll", updateChevronVisibility);
      window.removeEventListener("resize", updateChevronVisibility);
    };
  }, []);

  const scrollTabs = (direction: "left" | "right") => {
    if (!tabsRef.current) return;

    const container = tabsRef.current;

    if (direction === "right") {
      const lastTab = container.lastElementChild as HTMLElement;
      if (lastTab) {
        const scrollLeft = lastTab.offsetLeft + lastTab.offsetWidth - container.offsetWidth;

        container.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    } else {
      // Scroll all the way to the left
      container.scrollTo({
        left: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className='dashboard-container'>
      <h1 className='page-header'>My Dashboard</h1>
      <div className='dashboard__search-container'>
        <Search dashboard text='Search Dashboard Items' />
      </div>
      <div key={activeTab} className='tabs__container'>
        {showLeftChevron && (
          <button onClick={() => scrollTabs("left")} className='tabs__arrow tabs__arrow--left'>
            <FaChevronLeft />
          </button>
        )}
        <div ref={tabsRef} className='tabs'>
          <button
            className={`tab-btn ${activeTab === "myMeds" ? "active" : ""}`}
            onClick={() => setActiveTab("myMeds")}
          >
            Bespoke Meditations
            {myMeds?.length > 0 && <span className='tab-count'>{myMeds?.length}</span>}
          </button>
          <button
            className={`tab-btn ${activeTab === "meditations" ? "active" : ""}`}
            onClick={() => setActiveTab("meditations")}
          >
            Library Meditations
            {savedItems?.meditations?.length > 0 && <span className='tab-count'>{savedItems?.meditations.length}</span>}
          </button>

          <button
            className={`tab-btn ${activeTab === "publications" ? "active" : ""}`}
            onClick={() => setActiveTab("publications")}
          >
            My Articles
            {savedItems.publications.length > 0 && <span className='tab-count'>{savedItems.publications.length}</span>}
          </button>
          {/* <button
            className={`tab-btn ${activeTab === "publications" ? "active" : ""}`}
            onClick={() => setActiveTab("publications")}
          >
            My Playlist
            <span className='tab-count'>0</span>
          </button> */}
        </div>
        {showRightChevron && (
          <button onClick={() => scrollTabs("right")} className='tabs__arrow tabs__arrow--right'>
            <FaChevronRight />
          </button>
        )}
      </div>

      {renderTabContent()}

      <audio ref={audioRef} />
    </div>
  );
};

export default Dashboard;
