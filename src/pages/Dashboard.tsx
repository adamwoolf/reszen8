import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useSavedItems } from '../contexts/SavedItemsContext';
import './Dashboard.css';

type TabType = 'meditations' | 'ebooks' | 'publications';

const mockAudioData = {
  mindfulness: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  sleep: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  anxiety: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  gratitude: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  focus: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  'loving-kindness': 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
};

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { savedItems, removeItem } = useSavedItems();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('meditations');
  const [notification, setNotification] = useState<{show: boolean; message: string}>({show: false, message: ''});
  
  // Audio player state
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
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle play/pause for a specific meditation
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
      const audioUrl = mockAudioData[item.type as keyof typeof mockAudioData] || mockAudioData.mindfulness;
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
      audioRef.current.play()
        .then(() => {
          setCurrentlyPlaying(item.id);
          setIsPlaying(true);
          startProgressTimer();
        })
        .catch(error => {
          console.error('Error playing audio:', error);
          setNotification({
            show: true,
            message: 'Error playing meditation. Please try again.'
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
    navigate('/login');
    return null;
  }

  const handleRemoveItem = (itemId: number, type: keyof typeof savedItems) => {
    removeItem(itemId, type);
    setNotification({
      show: true,
      message: 'Item removed from your Dashboard'
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({...prev, show: false}));
    }, 3000);
  };

  const renderTabContent = () => {
    const data = savedItems[activeTab];
    
    return (
      <div className="dashboard-content">
        {notification.show && (
          <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
            {notification.message}
          </div>
        )}
        
        {data.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 mb-4">
              You haven't added any {activeTab} to your dashboard yet.
            </p>
            <Link 
              to="/digital-library" 
              className="text-orange-400 hover:text-orange-300 font-medium"
            >
              Browse {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)} →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.map((item) => (
              <div key={item.id} className="dashboard-card p-6 bg-gray-800 rounded-lg flex flex-col">
                <div className="flex-grow">
                  <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                  {item.duration && <p className="text-gray-300">Duration: {item.duration}</p>}
                  {item.author && <p className="text-gray-300">By: {item.author}</p>}
                  {item.savedDate && (
                    <p className="text-gray-400 text-sm mt-2">
                      Added on: {new Date(item.savedDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="mt-4">
                  {activeTab === 'meditations' && (
                    <>
                      <div className="relative mb-2">
                        {currentlyPlaying === item.id && (
                          <div className="w-full bg-gray-700 rounded-full h-1.5 mb-2 overflow-hidden">
                            <div 
                              className="bg-amber-500 h-full rounded-full transition-all duration-300 ease-out"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                        )}
                        {currentlyPlaying === item.id && (
                          <div className="flex justify-between text-xs text-gray-400 mb-2 px-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{item.duration}</span>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  <div className="flex gap-4">
                    {activeTab === 'meditations' && (
                      <button
                        onClick={() => togglePlayPause(item)}
                        className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 ${
                          currentlyPlaying === item.id && isPlaying 
                            ? 'bg-amber-600 hover:bg-amber-700' 
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
                        } text-black font-semibold py-2.5 px-6 rounded-full shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95`}
                      >
                        {currentlyPlaying === item.id && isPlaying ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <span>Pause</span>
                          </>
                        ) : (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                            </svg>
                            <span>{currentlyPlaying === item.id ? 'Resume' : 'Play'}</span>
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveItem(item.id, activeTab)}
                      className="flex-1 min-w-[120px] flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-2.5 px-6 rounded-full shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>Remove</span>
                    </button>
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
    <div className="dashboard-container">
      <h1 className="text-3xl font-bold mb-6 text-white">My Dashboard</h1>
      
      <div className="tabs mb-8">
        <button
          className={`tab-btn ${activeTab === 'meditations' ? 'active' : ''}`}
          onClick={() => setActiveTab('meditations')}
        >
          My Meditations
          {savedItems.meditations.length > 0 && (
            <span className="ml-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {savedItems.meditations.length}
            </span>
          )}
        </button>
        <button
          className={`tab-btn ${activeTab === 'ebooks' ? 'active' : ''}`}
          onClick={() => setActiveTab('ebooks')}
        >
          My E-Books
          {savedItems.ebooks.length > 0 && (
            <span className="ml-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {savedItems.ebooks.length}
            </span>
          )}
        </button>
        <button
          className={`tab-btn ${activeTab === 'publications' ? 'active' : ''}`}
          onClick={() => setActiveTab('publications')}
        >
          My Publications
          {savedItems.publications.length > 0 && (
            <span className="ml-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
              {savedItems.publications.length}
            </span>
          )}
        </button>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default Dashboard;
