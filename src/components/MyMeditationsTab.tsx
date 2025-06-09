import React, { useState } from 'react';
import { useSavedItems } from '../contexts/SavedItemsContext';
import  AudioPlayer  from './AudioPlayer';
import { Link } from 'react-router-dom'
import './MyMeditationsTab.css';

type FilterType = 'all' | 'ai' | 'bookmarked';

const MyMeditationsTab = () => {
  const { savedItems } = useSavedItems();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter meditations based on active filter and search query
  const filteredMeditations = (savedItems.meditations || []).filter(item => {
    const matchesSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (item.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'ai') return item.isAiGenerated === true && matchesSearch;
    if (activeFilter === 'bookmarked') return item.isAiGenerated !== true && matchesSearch;
    return matchesSearch;
  });

  const aiMeditations = filteredMeditations.filter(item => item.isAiGenerated === true);
  const bookmarkedMeditations = filteredMeditations.filter(item => item.isAiGenerated !== true);

  // If there are no meditations, show a message
  if ((savedItems.meditations || []).length === 0) {
    return (
      <div className="meditations-container">
        <div className="no-meditations">
          <p>You haven't saved any meditations yet.</p>
          <Link to="/digital-library" className="browse-link">
            Browse Meditations →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="meditations-container">
      {/* Filter and Search Bar */}
      <div className="filter-section">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveFilter('ai')}
          >
            AI Generated
          </button>
          <button 
            className={`filter-btn ${activeFilter === 'bookmarked' ? 'active' : ''}`}
            onClick={() => setActiveFilter('bookmarked')}
          >
            Bookmarked
          </button>
        </div>
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search meditations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
      </div>

      {/* AI Generated Meditations Section */}
      {activeFilter !== 'bookmarked' && (
        <section className="meditation-section">
          <h2 className="section-title">AI Generated Meditations</h2>
          {aiMeditations.length > 0 ? (
            <div className="meditation-grid">
              {aiMeditations.map((item, index) => (
                <div key={`ai-${index}`} className="meditation-card">
                  <div className="meditation-content">
                    <h3 className="meditation-title">{item.title}</h3>
                    {item.description && <p className="meditation-description">{item.description}</p>}
                    {item.duration && (
                      <div className="meditation-meta">
                        <span className="duration">{item.duration} min</span>
                      </div>
                    )}
                  </div>
                  <div className="meditation-actions">
                    {item.audioUrl && <AudioPlayer audioUrl={item.audioUrl} />}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-items">No AI generated meditations found.</p>
          )}
        </section>
      )}

      {/* Bookmarked Meditations Section */}
      {activeFilter !== 'ai' && (
        <section className="meditation-section">
          <h2 className="section-title">Bookmarked from Digital Library</h2>
          {bookmarkedMeditations.length > 0 ? (
            <div className="meditation-grid">
              {bookmarkedMeditations.map((item, index) => (
                <div key={`bookmarked-${index}`} className="meditation-card">
                  <div className="meditation-content">
                    <h3 className="meditation-title">{item.title}</h3>
                    {item.description && <p className="meditation-description">{item.description}</p>}
                    {item.duration && (
                      <div className="meditation-meta">
                        <span className="duration">{item.duration} min</span>
                      </div>
                    )}
                  </div>
                  <div className="meditation-actions">
                    {item.audioUrl && <AudioPlayer audioUrl={item.audioUrl} />}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-items">No bookmarked meditations found.</p>
          )}
        </section>
      )}
    </div>
  );
};

export default MyMeditationsTab;
