import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useSavedItems } from "../../contexts/SavedItemsContext";
import "./Dashboard.scss";
import useFirebaseDatabase from "../../hooks/useFirestoreCollection";
import { FaArrowRight } from "react-icons/fa";
import AudioPlayer from "../../components/AudioPlayer/AudioPlayer";
import { useSelector } from "react-redux";
type TabType = "meditations" | "ebooks" | "publications" | "myMeds";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { removeItem, savedItems } = useSavedItems();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("meditations");
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  // Audio player state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [myMeds, setMyMeds] = useState([]);
  const data = useSelector((state) => state.content.dashboard);
  const [allItems, setAllItems] = useState({});
  // Redirect to login if not authenticated
  if (!currentUser) {
    navigate("/login");
    return null;
  }

  useEffect(() => {
    setAllItems({ ...savedItems, myMeds });
  }, [savedItems, myMeds]);

  useEffect(() => {
    if (data) {
      const meds = Object.values(data);
      const parsedMeds = meds
        .filter((item) => item.generatedBy === currentUser.uid)
        .map((m, i) => ({
          ...(m as {}),
          type: "meditation",
          id: `${m.type}-${i}`,
          meditationType: m.type,
        }));
      setMyMeds(Object.values(parsedMeds).reverse());
    }
  }, [data, currentUser]);

  //

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

  // Redirect to login if not authenticated
  if (!currentUser) {
    navigate("/login");
    return null;
  }

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

  const renderTabContent = () => {
    const data = allItems[activeTab];
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
            <Link to='/digital-library' className='text-orange-400 hover:text-orange-300 font-medium'>
              Browse {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)} →
            </Link>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {data?.reverse().map((item, i) => (
              <div key={`dashboard-item ${i}`} className='dashboard-card'>
                <div className='dashboard-card__content'>
                  <div>
                    <h3>{item.title}</h3>
                    <div className='flex items-center gap-4 text-sm text-gray-400 mb-4'>
                      {item.createdAt && (
                        <span className='flex items-center'>{new Date(item.createdAt).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className='dashboard-buttons'>
                    {item.audioUrl && (
                      <div className='mb-2'>
                        <AudioPlayer audioUrl={item.audioUrl} />
                      </div>
                    )}
                    {activeTab === "publications" && (
                      <Link className='read-link' to={`/publications/${item.slug}`}>
                        <span className='read-link-text'> Read</span>
                        <FaArrowRight />{" "}
                      </Link>
                    )}

                    <div className='flex gap-3'>
                      {activeTab !== "myMeds" && (
                        <button
                          onClick={() => handleRemoveItem(item, activeTab as keyof typeof savedItems, i)}
                          className='dashboard-button'
                        >
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-4 w-4'
                            viewBox='0 0 20 20'
                            fill='currentColor'
                          >
                            <path
                              fillRule='evenodd'
                              d='M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z'
                              clipRule='evenodd'
                            />
                          </svg>
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className='dashboard-container'>
      <h1 className='text-3xl font-bold mb-6 text-white'>My Dashboard</h1>

      <div className='tabs mb-8'>
        <button className={`tab-btn ${activeTab === "myMeds" ? "active" : ""}`} onClick={() => setActiveTab("myMeds")}>
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
          My Publications
          {savedItems.publications.length > 0 && <span className='tab-count'>{savedItems.publications.length}</span>}
        </button>
      </div>

      {renderTabContent()}

      <audio ref={audioRef} />
    </div>
  );
};

export default Dashboard;

// const DownloadButton = ({ downloadLink }: { downloadLink: string }) => {
//   const handleDownload = () => {
//     const link = document.createElement("a");
//     link.href = downloadLink;
//     link.download = "meditation.mp3";
//     document.body.appendChild(link);
//     link.click();
//     document.body.removeChild(link);
//   };

//   return <button onClick={handleDownload}>Download Meditation Audio</button>;
// };
