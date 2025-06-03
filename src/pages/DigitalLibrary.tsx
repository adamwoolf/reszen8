import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useSavedItems } from "../contexts/SavedItemsContext";
import "./Dashboard.css";
import useFirebaseDatabase from "../hooks/useFirestoreCollection";

type TabType = "meditations" | "ebooks" | "publications";

const DigitalLibrary = () => {
  const { currentUser } = useAuth();
  // const { add } = useFirebaseDatabase('USERS')
  const navigate = useNavigate();
  const { addItem } = useSavedItems();
  const [activeTab, setActiveTab] = useState<TabType>("meditations");
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  const { data } = useFirebaseDatabase("meditations");
  console.log(data);
  // Redirect to login if not authenticated
  if (!currentUser) {
    navigate("/login");
    return null;
  }
  const [libraryData, setLibraryData] = useState({
    meditations: [
      { id: 101, title: "Morning Calm", duration: "10 min", type: "meditation" as const },
      { id: 102, title: "Deep Sleep", duration: "20 min", type: "meditation" as const },
      { id: 103, title: "Anxiety Relief", duration: "15 min", type: "meditation" as const },
    ],
    ebooks: [
      { id: 201, title: "Mindfulness for Beginners", author: "Dr. Sarah Johnson", type: "ebook" as const },
      { id: 202, title: "The Art of Breathing", author: "Michael Chen", type: "ebook" as const },
    ],
    publications: [
      { id: 301, title: "The Science of Mindfulness", author: "Dr. Jane Smith", type: "publication" as const },
      { id: 302, title: "Meditation and Mental Health", author: "Dr. John Doe", type: "publication" as const },
      { id: 303, title: "Modern Meditation Techniques", author: "Dr. Emily Wilson", type: "publication" as const },
    ],
  });

  useEffect(() => {
    if (data) {
      const meds = Object.values(data);
      console.log("MEDS", meds);
      setLibraryData({
        ...libraryData,
        meditations: meds.map((m) => ({ ...(m as {}), type: "meditation", meditationType: m.type })),
      });
    }
  }, [data]);

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
    console.log(data);

    return (
      <div className='dashboard-content'>
        {notification.show && (
          <div className='fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'>
            {notification.message}
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {data.map((item) => (
            <div key={item.id} className='dashboard-card p-6 bg-gray-800 rounded-lg'>
              <h3 className='text-xl font-semibold mb-2 text-white'>{item.title}</h3>
              {item.duration && <p className='text-gray-300'>Duration: {item.duration}</p>}
              {item.meditationType && <p className='text-gray-300'>Meditation Type: {item.meditationType}</p>}
              {item.language && <p className='text-gray-300'>Language: {item.language}</p>}

              <button
                onClick={() => handleAddItem(item)}
                className='mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors'
              >
                {item.type === "meditation"
                  ? "Add Meditation"
                  : item.type === "ebook"
                  ? "Add E-Book"
                  : "Add Publication"}
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
        <button className={`tab-btn ${activeTab === "ebooks" ? "active" : ""}`} onClick={() => setActiveTab("ebooks")}>
          Browse E-Books
        </button>
        <button
          className={`tab-btn ${activeTab === "publications" ? "active" : ""}`}
          onClick={() => setActiveTab("publications")}
        >
          Browse Publications
        </button>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default DigitalLibrary;
