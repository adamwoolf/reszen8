import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

type TabType = 'meditations' | 'ebooks' | 'wishlist' | 'recent';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('meditations');

  // Redirect to login if not authenticated
  if (!currentUser) {
    navigate('/login');
    return null;
  }

  // Sample data - replace with actual data from your backend
  const sampleData = {
    meditations: [
      { id: 1, title: 'Morning Calm', duration: '10 min', savedDate: '2023-05-20' },
      { id: 2, title: 'Deep Sleep', duration: '20 min', savedDate: '2023-05-18' },
    ],
    ebooks: [
      { id: 1, title: 'Mindfulness for Beginners', progress: '45%', savedDate: '2023-05-15' },
    ],
    wishlist: [
      { id: 1, title: 'Yoga Mat', price: '$29.99', savedDate: '2023-05-10' },
      { id: 2, title: 'Meditation Cushion', price: '$49.99', savedDate: '2023-05-05' },
    ],
    recent: [
      { id: 1, title: 'Evening Wind Down', type: 'meditation', date: '2023-05-25' },
      { id: 2, title: 'The Art of Breathing', type: 'ebook', date: '2023-05-24' },
    ]
  };

  const renderTabContent = () => {
    const data = sampleData[activeTab];
    
    return (
      <div className="dashboard-content">
        {data.length === 0 ? (
          <div className="empty-state">
            <p>No {activeTab} saved yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((item) => (
              <div key={item.id} className="dashboard-card">
                <h3>{item.title}</h3>
                {item.duration && <p>Duration: {item.duration}</p>}
                {item.progress && <p>Progress: {item.progress}</p>}
                {item.price && <p>Price: {item.price}</p>}
                <p className="text-sm text-gray-500">Saved on: {item.savedDate || item.date}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <h1 className="text-3xl font-bold mb-6">My Dashboard</h1>
      
      <div className="tabs mb-8">
        <button
          className={`tab-btn ${activeTab === 'meditations' ? 'active' : ''}`}
          onClick={() => setActiveTab('meditations')}
        >
          Saved Meditations
        </button>
        <button
          className={`tab-btn ${activeTab === 'ebooks' ? 'active' : ''}`}
          onClick={() => setActiveTab('ebooks')}
        >
          E-books
        </button>
        <button
          className={`tab-btn ${activeTab === 'wishlist' ? 'active' : ''}`}
          onClick={() => setActiveTab('wishlist')}
        >
          Wishlist
        </button>
        <button
          className={`tab-btn ${activeTab === 'recent' ? 'active' : ''}`}
          onClick={() => setActiveTab('recent')}
        >
          Recently Viewed
        </button>
      </div>

      {renderTabContent()}
    </div>
  );
};

export default Dashboard;
