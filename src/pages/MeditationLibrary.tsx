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
  const likes = useSelector((state) => state.content.meta.meditationLIKES);
  console.log(likes);

  // Redirect to login if not authenticated
  if (!currentUser) {
    navigate("/login");
    return null;
  }
  const [libraryMeditations, setLibraryMeditations] = useState<Meditation[]>([]);

  useEffect(() => {
    if (!meditations && bespokeMeds) setLibraryMeditations(bespokeMeds);
  }, [bespokeMeds, meditations]);

  useEffect(() => {
    const normalisedBespoke = bespokeMeds
      ? Object.values(bespokeMeds)
          .reverse()
          ?.map((med: Meditation) => {
            return {
              ...med,
              contentType: "meditation",
              id: med.audioUrl,
              likes: likes?.find((l) => l.id === med.audioUrl)?.likes,
            };
          })
      : [];
    setLibraryMeditations([...libraryMeditations, ...normalisedBespoke]);
  }, [bespokeMeds, likes]);

  useEffect(() => {
    if (!libraryMeditations.length) {
      const staticMeds: Meditation[] = staticMeditations?.map(({ fields, sys }: Meditation) => ({
        audioUrl: fields.audioFile.fields.file.url,
        type: fields.type,
        title: fields.title,
        id: sys.id,
        likes: likes?.find((l) => l.id === sys.id)?.likes,
      }));
      setLibraryMeditations([...libraryMeditations, ...staticMeds]);
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
    return (
      <div className='dashboard-content'>
        {notification.show && (
          <div className='fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'>
            {notification.message}
          </div>
        )}

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[...new Set(libraryMeditations)]
            ?.sort((a, b) => b?.likes - a?.likes)
            ?.map((item, i) => (
              <MeditationCard key={item.id + i} handleAddItem={handleAddItem} item={item} i={i} />
            ))}
        </div>
      </div>
    );
  };

  return (
    <div className='dashboard-container'>
      <h1 className='page-header'>Meditation Library</h1>

      {renderTabContent()}
    </div>
  );
};

export default DigitalLibrary;
