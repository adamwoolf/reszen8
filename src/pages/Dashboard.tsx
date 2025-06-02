import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useSavedItems } from "../contexts/SavedItemsContext";
import "./Dashboard.css";

type TabType = "meditations" | "ebooks" | "publications";

const mockAudioData = {
  mindfulness: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
  sleep: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
  anxiety: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
  gratitude: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
  focus: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
  "loving-kindness": "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { savedItems, removeItem } = useSavedItems();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('meditations');
  const [notification, setNotification] = useState<{show: boolean; message: string}>({show: false, message: ''});
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Redirect to login if not authenticated
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  const togglePlayPause = (item: any) => {
    if (currentlyPlaying === item.id) {
      // Toggle play/pause for the current item
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause();
          if (progressInterval.current) {
            clearInterval(progressInterval.current);
          }
        } else {
          audioRef.current.play();
          startProgressTimer();
        }
        setIsPlaying(!isPlaying);
      }
    } else {
      // Stop any currently playing audio and start the new one
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Set up new audio
      const audioUrl = savedItems.meditations[0].audioUrl;
      console.log(audioUrl);
      audioRef.current = new Audio(audioUrl);

      // Set up event listeners
      audioRef.current.onended = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        setCurrentlyPlaying(null);
        if (progressInterval.current) {
          clearInterval(progressInterval.current);
        }
      };

      // Start playing
      audioRef.current
        .play()
        .then(() => {
          setCurrentlyPlaying(item.id);
          setIsPlaying(true);
          startProgressTimer();
        })
        .catch((error) => {
          console.error("Error playing audio:", error);
          setNotification({
            show: true,
            message: "Error playing meditation. Please try again.",
          });
        });
    }
  };

  // Update progress bar
  const startProgressTimer = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      if (audioRef.current) {
        const currentProgress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
        setProgress(isNaN(currentProgress) ? 0 : currentProgress);
        setCurrentTime(audioRef.current.currentTime);
      }
    }, 100);
  };

  const handleRemoveItem = (itemId: number, type: keyof typeof savedItems) => {
    removeItem(itemId, type);
    setNotification({
      show: true,
      message: 'Item removed from your dashboard'
    });
    setTimeout(() => setNotification({...notification, show: false}), 3000);
  };

  const renderTabContent = () => {
    const data = savedItems[activeTab];

    if (data.length === 0) {
      return (
        <div className="dashboard-content">
          <div className="text-center py-10">
            <p className="text-gray-400 mb-4">You haven't added any {activeTab} to your dashboard yet.</p>
            <Link to='/digital-library' className="text-orange-400 hover:text-orange-300 font-medium">
              Browse {activeTab === 'meditations' ? 'Meditations' : activeTab === 'ebooks' ? 'E-Books' : 'Publications'} →
            </Link>
          </div>
        </div>
      );
    }

    return (
      <div className="dashboard-content">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((item) => (
            <div key={item.id} className="dashboard-card p-6 bg-gray-800 rounded-lg">
              <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
              {item.duration && <p className="text-gray-300">Duration: {item.duration}</p>}
              {item.author && <p className="text-gray-300">By: {item.author}</p>}
              <div className="card-actions mt-4">
                <button 
                  onClick={() => togglePlayPause(item)}
                  className="action-button play-button"
                  aria-label={currentlyPlaying === item.id && isPlaying ? 'Pause' : 'Play'}
                >
                  {currentlyPlaying === item.id && isPlaying ? '⏸' : '▶'}
                </button>
                <button 
                  onClick={() => handleRemoveItem(item.id, activeTab as keyof typeof savedItems)}
                  className="action-button delete-button"
                  aria-label="Remove"
                >
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

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

  return (
    <div className="dashboard-container">
      <h1 className="text-3xl font-bold mb-6 text-white">My Dashboard</h1>
      
      <div className="tabs mb-8">
        <button
          className={`tab-btn ${activeTab === 'meditations' ? 'active' : ''}`}
          onClick={() => setActiveTab('meditations')}
        >
          My Meditations
        </button>
        <button
          className={`tab-btn ${activeTab === 'ebooks' ? 'active' : ''}`}
          onClick={() => setActiveTab('ebooks')}
        >
          My E-Books
        </button>
        <button
          className={`tab-btn ${activeTab === 'publications' ? 'active' : ''}`}
          onClick={() => setActiveTab('publications')}
        >
          My Publications
        </button>
      </div>

      {notification.show && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {notification.message}
        </div>
      )}

      {renderTabContent()}
      
      <audio ref={audioRef} />
    </div>
  );
};

export default Dashboard;

function AudioPlayer({ audioUrl }: { audioUrl: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Clean up audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const togglePlayPause = () => {
    if (!audioUrl) return;

    if (!audioRef.current) {
      // Create a new audio element if it doesn't exist
      audioRef.current = new Audio(audioUrl);
      
      // Set up event listeners
      audioRef.current.onended = () => {
        setIsPlaying(false);
      };
      
      audioRef.current.onpause = () => {
        setIsPlaying(false);
      };
      
      audioRef.current.onplay = () => {
        setIsPlaying(true);
      };
    }

    // Toggle play/pause
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
      });
    }
  };

  return (
    <button
      onClick={togglePlayPause}
      className="flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-full transition-colors"
    >
      {isPlaying ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>Pause</span>
        </>
      ) : (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
              clipRule="evenodd"
            />
          </svg>
          <span>Play</span>
        </>
      )}
    </button>
  );
}
