import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import "./Dashboard/Dashboard.scss";
import { useSavedItems } from "../contexts/SavedItemsContext";

import useContentful from "../hooks/useContentful";
import { getMeditationItems } from "../contentful";
import useFirebaseDatabase from "../hooks/useFirestoreCollection";
import { Meditation } from "../models";
import MeditationCard from "../components/MeditationCard/MeditationCard";
import { useSelector } from "react-redux";
type TabType = "meditations" | "ebooks" | "publications";

const DigitalLibrary = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("meditations");
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  const staticMeditations = useContentful(getMeditationItems)?.content;
  const { data: bespokeMeds } = useFirebaseDatabase("meditations");
  const { addItem } = useSavedItems();

  const meditations = useSelector((state) => state.content.meditations);

  // Redirect to login if not authenticated
  if (!currentUser) {
    navigate("/login");
    return null;
  }
  const [libraryData, setLibraryData] = useState<{ meditations: Meditation[] }>({
    meditations: [],
  });

  useEffect(() => {
    if (!meditations && bespokeMeds) setMeditations(bespokeMeds);
  }, [bespokeMeds, meditations]);

  useEffect(() => {
    const normalisedBespoke = bespokeMeds
      ? Object.values(bespokeMeds)
          .reverse()
          ?.map((med: Meditation) => {
            return {
              ...med,
              type: "meditation",
              id: med.audioUrl,
            };
          })
      : [];

    setLibraryData({ ...libraryData, meditations: [...libraryData.meditations, ...normalisedBespoke] });
  }, [bespokeMeds]);

  useEffect(() => {
    if (!libraryData?.meditations.length) {
      const staticMeds: Meditation[] = staticMeditations?.map(({ fields, sys }: Meditation) => ({
        audioUrl: fields.audioFile.fields.file.url,
        type: fields.type,
        title: fields.title,
        id: sys.id,
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
            <MeditationCard key={item.id + i} handleAddItem={handleAddItem} item={item} i={i} />
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

        <Link to='/publications' className={`tab-btn ${activeTab === "publications" ? "active" : ""}`}>
          Browse Publications
        </Link>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default DigitalLibrary;
