import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useSavedItems } from "../contexts/SavedItemsContext";
import "./Dashboard/Dashboard.scss";
import useContentful from "../hooks/useContentful";
import { getMeditationItems } from "../contentful";
import useFirebaseDatabase from "../hooks/useFirestoreCollection";
import { Meditation } from "../models";
import AudioPlayer from "../components/AudioPlayer/AudioPlayer";

type TabType = "meditations" | "ebooks" | "publications";

const DigitalLibrary = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { addItem } = useSavedItems();
  const [activeTab, setActiveTab] = useState<TabType>("meditations");
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  const staticMeditations = useContentful(getMeditationItems)?.content;
  const { data: bespokeMeds } = useFirebaseDatabase("meditations");

  // Redirect to login if not authenticated
  if (!currentUser) {
    navigate("/login");
    return null;
  }
  const [libraryData, setLibraryData] = useState<{ meditations: Meditation[] }>({
    meditations: [],
  });

  useEffect(() => {
    const normalisedBespoke = bespokeMeds
      ? Object.values(bespokeMeds)
          .reverse()
          ?.map((med: Meditation) => {
            return {
              ...med,
              type: "meditation",
            };
          })
      : [];
    console.log(normalisedBespoke);
    setLibraryData({ ...libraryData, meditations: [...libraryData.meditations, ...normalisedBespoke] });
  }, [bespokeMeds]);

  useEffect(() => {
    if (!libraryData?.meditations.length) {
      const staticMeds: Meditation[] = staticMeditations?.map(({ fields }: Meditation) => ({
        audioUrl: fields.audioFile.fields.file.url,
        type: fields.type,
        title: fields.title,
      }));
      setLibraryData({
        ...libraryData,
        meditations: [...libraryData.meditations, ...staticMeds],
      });
    }
  }, [staticMeditations]);

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
    const data = libraryData[activeTab];

    return (
      <div className='dashboard-content'>
        {notification.show && (
          <div className='fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'>
            {notification.message}
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {data.map((item, i) => (
            <div key={item.id + i} className='dashboard-card p-6 bg-gray-800 rounded-lg'>
              <h3 className='text-xl font-semibold mb-2 text-white'>{item.title}</h3>
              {item.duration && <p className='text-gray-300'>Duration: {item.duration}</p>}
              {item.meditationType && <p className='text-gray-300'>Meditation Type: {item.meditationType}</p>}
              {item.language && <p className='text-gray-300'>Language: {item.language}</p>}
              {item.audioUrl && <AudioPlayer audioUrl={item.audioUrl} />}
              <button
                onClick={() => handleAddItem(item)}
                className='mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors'
              >
                Add to my dashboard
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className='dashboard-container'>
      <h1 className='text-3xl font-bold mb-6 text-white'>Digital Library</h1>

      <div className='tabs mb-8'>
        <button
          className={`tab-btn ${activeTab === "meditations" ? "active" : ""}`}
          onClick={() => setActiveTab("meditations")}
        >
          Browse Meditations
        </button>
        {/* <button className={`tab-btn ${activeTab === "ebooks" ? "active" : ""}`} onClick={() => setActiveTab("ebooks")}>
          Browse E-Books
        </button> */}
        {/* <button
          className={`tab-btn ${activeTab === "publications" ? "active" : ""}`}
          onClick={() => setActiveTab("publications")}
        >
          Browse Publications
        </button> */}
        <Link to='/publications' className={`tab-btn ${activeTab === "publications" ? "active" : ""}`}>
          Browse Publications
        </Link>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default DigitalLibrary;
