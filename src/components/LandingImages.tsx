import { useState, useEffect } from "react";
import { getStorage, ref, getDownloadURL } from "firebase/storage";
import "./LandingImages.css";

interface ImageUrls {
  aiMedGen: string;
  library: string;
  dashboard: string;
}

const LandingImages = () => {
  const [images, setImages] = useState<ImageUrls>({
    aiMedGen: "",
    library: "",
    dashboard: "",
  });

  useEffect(() => {
    const storage = getStorage();

    const loadImages = async () => {
      try {
        const aiMedGenUrl = await getDownloadURL(ref(storage, "Landing page images/AI MED GEN_black_bg.png"));
        const libraryUrl = await getDownloadURL(ref(storage, "Landing page images/Library_black_bg.png"));
        const dashboardUrl = await getDownloadURL(ref(storage, "Landing page images/Personalised Dash_black_bg.png"));

        setImages({
          aiMedGen: aiMedGenUrl,
          library: libraryUrl,
          dashboard: dashboardUrl,
        });
      } catch (error) {
        // Failed to load images from Firebase storage
      }
    };

    loadImages();
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.style.display = "none";
  };

  return (
    <div className='landing-images-container'>
      <div className='landing-image-wrapper'>
        <img
          src={images.library}
          alt='Digital Library'
          className='landing-image'
          onError={handleImageError}
        />
        <h3>Meditation Library</h3>
      </div>
      <div className='landing-image-wrapper'>
        <img
          src={images.aiMedGen}
          alt='AI Meditation Generator'
          className='landing-image'
          onError={handleImageError}
        />
        <h3>AI Meditation Generator</h3>
      </div>
      <div className='landing-image-wrapper'>
        <img
          src={images.dashboard}
          alt='Personalised Journey'
          className='landing-image'
          onError={handleImageError}
        />
        <h3>Personalised Dashboard</h3>
      </div>
    </div>
  );
};

export default LandingImages;
