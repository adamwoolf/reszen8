import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { useSavedItems } from '../contexts/SavedItemsContext';
import './Dashboard.css';

type TabType = 'meditations' | 'ebooks' | 'publications';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { savedItems, removeItem } = useSavedItems();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('meditations');
  const [notification, setNotification] = useState<{show: boolean; message: string}>({show: false, message: ''});

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
              <div key={item.id} className="dashboard-card p-6 bg-gray-800 rounded-lg">
                <h3 className="text-xl font-semibold mb-2 text-white">{item.title}</h3>
                {item.duration && <p className="text-gray-300">Duration: {item.duration}</p>}
                {item.author && <p className="text-gray-300">By: {item.author}</p>}
                {item.savedDate && (
                  <p className="text-gray-400 text-sm mt-2">
                    Added on: {item.savedDate}
                  </p>
                )}
                <button
                  onClick={() => handleRemoveItem(item.id, activeTab)}
                  className="mt-4 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Remove from Dashboard
                </button>
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
