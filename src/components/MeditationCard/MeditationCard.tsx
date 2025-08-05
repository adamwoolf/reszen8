import React from "react";
import AudioPlayer from "../AudioPlayer/AudioPlayer";
import { useAuth } from "../../contexts/AuthContext";
import LikeCta from "../../pages/Publications/LikeCta";

const MeditationCard = ({ item, i, showLike = true, handleAddItem }) => {
  const { currentUser } = useAuth();
  const hasBeenSaved = currentUser?.savedItems?.meditations?.some((m) => m.id === item.id);

  return (
    <div className='dashboard-card p-6 bg-gray-800 rounded-lg'>
      <h3 className='text-xl font-semibold mb-2 text-white'>{item.title}</h3>
      {item.duration && <p className='text-gray-300'>Duration: {item.duration}</p>}
      {item.meditationType && <p className='text-gray-300'>Meditation Type: {item.meditationType}</p>}
      {item.language && <p className='text-gray-300'>Language: {item.language}</p>}
      {item.audioUrl && <AudioPlayer audioUrl={item.audioUrl} />}
      <button
        disabled={hasBeenSaved}
        onClick={() => handleAddItem(item)}
        className='mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 rounded-lg transition-colors'
      >
        {hasBeenSaved ? "Saved to dashboard" : "Save to my dashboard"}
      </button>
      {currentUser && showLike && <LikeCta id={item.id} content='meditations' />}
    </div>
  );
};

export default MeditationCard;
