import React from 'react';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { useState, useEffect } from 'react';
import './LandingImages.css';

const LandingImages = () => {
  const [images, setImages] = useState<{[key: string]: string}>({
    aiMedGen: '',
    library: '',
    dashboard: ''
  });

  useEffect(() => {
    const storage = getStorage();
    
    const loadImages = async () => {
      try {
        const aiMedGenUrl = await getDownloadURL(ref(storage, 'Landing page images/AI MED GEN_black_bg.png'));
        const libraryUrl = await getDownloadURL(ref(storage, 'Landing page images/Library_black_bg.png'));
        const dashboardUrl = await getDownloadURL(ref(storage, 'Landing page images/Personalised Dash_black_bg.png'));
        
        setImages({
          aiMedGen: aiMedGenUrl,
          library: libraryUrl,
          dashboard: dashboardUrl
        });
      } catch (error) {
        console.error('Error loading images:', error);
      }
    };

    loadImages();
  }, []);

  return (
    <div className="landing-images-container">
      <div className="landing-image-wrapper">
        <img 
          src={images.library} 
          alt="Digital Library" 
          className="landing-image"
          onError={(e) => {
            // @ts-ignore
            e.target.style.display = 'none';
          }}
        />
        <h3>Digital Library</h3>
      </div>
      <div className="landing-image-wrapper">
        <img 
          src={images.aiMedGen} 
          alt="AI Meditation Generator" 
          className="landing-image"
          onError={(e) => {
            // @ts-ignore
            e.target.style.display = 'none';
          }}
        />
        <h3>AI Meditation Generator</h3>
      </div>
      <div className="landing-image-wrapper">
        <img 
          src={images.dashboard} 
          alt="Personalised Dashboard" 
          className="landing-image"
          onError={(e) => {
            // @ts-ignore
            e.target.style.display = 'none';
          }}
        />
        <h3>Personalised Dashboard</h3>
      </div>
    </div>
  );
};

export default LandingImages;
