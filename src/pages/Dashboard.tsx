import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useSavedItems } from "../contexts/SavedItemsContext";
import "./Dashboard.css";
import useFirebasedatabase from "../hooks/useFirestoreCollection";

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
  console.log(currentUser);
  const { removeItem, savedItems } = useSavedItems();
  const [allItems, setAllItems] = useState([]);
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>("meditations");
  const [notification, setNotification] = useState<{ show: boolean; message: string }>({ show: false, message: "" });
  // Audio player state
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  console.log(currentUser);
  // Format time from seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // Redirect to login if not authenticated
  if (!currentUser) {
    navigate("/login");
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

  // const handleRemoveItem = (itemId: number, type: keyof typeof savedItems) => {
  //   removeItem(itemId, type);
  //   setNotification({
  //     show: true,
  //     message: 'Item removed from your dashboard'
  //   });
  //   setTimeout(() => setNotification({...notification, show: false}), 3000);
  // };

  // const renderTabContent = () => {
  //   const data = savedItems[activeTab];

  //   if (data.length === 0) {
  //     return (
  //       <div className='dashboard-content'>
  //         <div className='text-center py-10'>
  //           <p className='text-gray-400 mb-4'>You haven't added any {activeTab} to your dashboard yet.</p>
  //           <Link to='/digital-library' className='text-orange-400 hover:text-orange-300 font-medium'>
  //             Browse {activeTab === "meditations" ? "Meditations" : activeTab === "ebooks" ? "E-Books" : "Publications"}{" "}
  //             →
  //           </Link>
  //         </div>
  //       </div>
  //     );
  //   }

  //   return (
  //     <div className='dashboard-content'>
  //       <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
  //         {data.map((item) => (
  //           <div key={item.id} className='dashboard-card p-6 bg-gray-800 rounded-lg'>
  //             <h3 className='text-xl font-semibold mb-2 text-white'>{item.title}</h3>
  //             {item.duration && <p className='text-gray-300'>Duration: {item.duration}</p>}
  //             {item.author && <p className='text-gray-300'>By: {item.author}</p>}
  //             <div className='card-actions mt-4'>
  //               <button
  //                 onClick={() => togglePlayPause(item)}
  //                 className='action-button play-button'
  //                 aria-label={currentlyPlaying === item.id && isPlaying ? "Pause" : "Play"}
  //               >
  //                 {currentlyPlaying === item.id && isPlaying ? "⏸" : "▶"}
  //               </button>
  //               <button
  //                 onClick={() => handleRemoveItem(item.id, activeTab as keyof typeof savedItems)}
  //                 className='action-button delete-button'
  //                 aria-label='Remove'
  //               >
  //                 🗑
  //               </button>
  //             </div>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };

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

  const handleRemoveItem = (itemId: number, type: keyof typeof savedItems) => {
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
    const data = savedItems[activeTab];
    return (
      <div className='dashboard-content'>
        {notification.show && (
          <div className='fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'>
            {notification.message}
          </div>
        )}

        {data.length === 0 ? (
          <div className='text-center py-10'>
            <p className='text-gray-400 mb-4'>You haven't added any {activeTab} to your dashboard yet.</p>
            <Link to='/digital-library' className='text-orange-400 hover:text-orange-300 font-medium'>
              Browse {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)} →
            </Link>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {data.map((item, i) => (
              <div
                key={`dashboard-item ${i}`}
                className='bg-gray-800 bg-opacity-50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-gray-700 transition-all hover:border-amber-500/30 hover:shadow-lg hover:shadow-amber-500/10'
              >
                <div className='flex flex-col md:flex-row justify-between gap-6'>
                  <div className='flex-1'>
                    <h3 className='text-xl font-semibold text-white mb-2'>{item.title}</h3>
                    {/* {item.content && <p className='text-gray-300 mb-4 line-clamp-3'>{item.content}</p>} */}
                    <div className='flex items-center gap-4 text-sm text-gray-400 mb-4'>
                      {/* {item.duration && (
                        <span className='flex items-center'>
                          <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-4 w-4 mr-1 text-amber-400'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
                            />
                          </svg>
                          {item.duration}
                        </span>
                      )} */}
                      {item.savedDate && (
                        <span className='flex items-center'>
                          {/* <svg
                            xmlns='http://www.w3.org/2000/svg'
                            className='h-4 w-4 mr-1 text-amber-400'
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                          >
                            <path
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeWidth={2}
                              d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'
                            />
                          </svg> */}
                          {new Date(item.savedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className='flex flex-col gap-3 min-w-[200px]'>
                    {item.audioUrl && (
                      <div className='mb-2'>
                        <AudioPlayer audioUrl={item.audioUrl} />
                        {/* <DownloadButton downloadLink={item.downloadLink} /> */}
                      </div>
                    )}
                    {/* <div className='flex gap-3'>
                      {/* <button
                        onClick={() => handleRemoveItem(item.id, "meditations")}
                        className='flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white font-semibold py-2 px-4 rounded-full shadow-md transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm'
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
                      </button> */}
                    {/* </div>  */}
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
        <button
          className={`tab-btn ${activeTab === "meditations" ? "active" : ""}`}
          onClick={() => setActiveTab("meditations")}
        >
          My Meditations
          {savedItems?.meditations.length > 0 && (
            <span className='ml-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full tab-count'>
              {savedItems?.meditations.length}
            </span>
          )}
        </button>
        <button className={`tab-btn ${activeTab === "ebooks" ? "active" : ""}`} onClick={() => setActiveTab("ebooks")}>
          My E-Books
          {savedItems.ebooks.length > 0 && (
            <span className='ml-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full tab-count'>
              {savedItems.ebooks.length}
            </span>
          )}
        </button>
        <button className={`tab-btn ${activeTab === "ebooks" ? "active" : ""}`} onClick={() => setActiveTab("ebooks")}>
          My E-Books
        </button>
        <button
          className={`tab-btn ${activeTab === "publications" ? "active" : ""}`}
          onClick={() => setActiveTab("publications")}
        >
          My Publications
          {savedItems.publications.length > 0 && (
            <span className='ml-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full tab-count'>
              {savedItems.publications.length}
            </span>
          )}
        </button>
      </div>

      {notification.show && (
        <div className='fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'>
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
      audioRef.current.play().catch((error) => {
        console.error("Error playing audio:", error);
        setIsPlaying(false);
      });
    }
  };

  return (
    <button
      onClick={togglePlayPause}
      className='flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2 px-4 rounded-full transition-colors'
    >
      {isPlaying ? (
        <>
          <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z'
              clipRule='evenodd'
            />
          </svg>
          <span>Pause</span>
        </>
      ) : (
        <>
          <svg xmlns='http://www.w3.org/2000/svg' className='h-5 w-5' viewBox='0 0 20 20' fill='currentColor'>
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z'
              clipRule='evenodd'
            />
          </svg>
          <span>Play</span>
        </>
      )}
    </button>
  );
}

const DownloadButton = ({ downloadLink }: { downloadLink: string }) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = downloadLink;
    link.download = "meditation.mp3";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return <button onClick={handleDownload}>Download Meditation Audio</button>;
};
