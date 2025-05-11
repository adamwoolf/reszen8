import React, { useState, useEffect } from 'react';
import './Watches.css';

interface Watch {
  id: number;
  brand: string;
  model: string;
  price: string;
  imageUrl: string;
  dominantColor: string;
  carColor: string;
}

interface CarImage {
  id: string;
  url: string;
  alt: string;
}

interface ImageModalProps {
  imageUrl: string;
  brand: string;
  model: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ imageUrl, brand, model, onClose }) => {
  const [carImages, setCarImages] = useState<CarImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCarImages = async () => {
      try {
        setIsLoading(true);
        // Using Unsplash API to get luxury car images with colors that complement the watch
        const colors = ['black', 'silver', 'blue', 'brown'];
        const promises = colors.map(async (color) => {
          const response = await fetch(
            `https://api.unsplash.com/photos/random?query=luxury+car+${color}&client_id=YOUR_UNSPLASH_ACCESS_KEY`
          );
          const data = await response.json();
          return {
            id: data.id,
            url: data.urls.regular,
            alt: data.alt_description || 'Luxury car',
          };
        });
        
        const images = await Promise.all(promises);
        setCarImages(images);
      } catch (error) {
        console.error('Error fetching car images:', error);
        // Define reliable car images by color
        const colorToCars: Record<string, Array<{url: string, alt: string}>> = {
          'black': [
            { url: 'https://images.unsplash.com/photo-1580273916551-e264ee7e3c76?ixlib=rb-4.0.3&w=600&auto=format', alt: 'Black BMW luxury car' },
            { url: 'https://images.unsplash.com/photo-1580273916551-e264ee7e3c76?ixlib=rb-4.0.3&w=600&auto=format', alt: 'Black Mercedes luxury car' },
            { url: 'https://images.unsplash.com/photo-1580273916551-e264ee7e3c76?ixlib=rb-4.0.3&w=600&auto=format', alt: 'Black Audi luxury car' },
            { url: 'https://images.unsplash.com/photo-1580273916551-e264ee7e3c76?ixlib=rb-4.0.3&w=600&auto=format', alt: 'Black Porsche luxury car' }
          ],
          'silver': [
            { url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&w=600&auto=format', alt: 'Silver Audi luxury car' },
            { url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&w=600&auto=format', alt: 'Silver Mercedes luxury car' },
            { url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&w=600&auto=format', alt: 'Silver BMW luxury car' },
            { url: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?ixlib=rb-4.0.3&w=600&auto=format', alt: 'Silver Porsche luxury car' }
          ],
          'blue': [
            { url: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?ixlib=rb-4.0.3&w=600&auto=format', alt: 'Blue Mercedes luxury car' },
            { url: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?ixlib=rb-4.0.3&w=600&auto=format', alt: 'Blue BMW luxury car' },
            { url: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?ixlib=rb-4.0.3&w=600&auto=format', alt: 'Blue Audi luxury car' },
            { url: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?ixlib=rb-4.0.3&w=600&auto=format', alt: 'Blue Porsche luxury car' }
          ],
          'brown': [
            { url: 'https://images.unsplash.com/photo-1583121274602-3e2820c6988f?ixlib=rb-4.0.3&w=600&auto=format', alt: 'Brown Porsche luxury car' },
            { url: 'https://images.unsplash.com/photo-1583121274602-3e2820c6988f?ixlib=rb-4.0.3&w=600&auto=format', alt: 'Brown Mercedes luxury car' },
            { url: 'https://images.unsplash.com/photo-1583121274602-3e2820c6988f?ixlib=rb-4.0.3&w=600&auto=format', alt: 'Brown BMW luxury car' },
            { url: 'https://images.unsplash.com/photo-1583121274602-3e2820c6988f?ixlib=rb-4.0.3&w=600&auto=format', alt: 'Brown Audi luxury car' }
          ]
        };

        // Determine the watch color based on brand
        const colorKey = brand.toLowerCase().includes('rolex') ? 'brown' : 
                         brand.toLowerCase().includes('patek') ? 'blue' :
                         brand.toLowerCase().includes('audemars') ? 'black' : 'silver';
        
        const cars = colorToCars[colorKey] || colorToCars['black'];
        
        // Map the car images to the expected format
        const mappedCars = cars.map((car: {url: string, alt: string}, index: number) => ({
          id: index.toString(),
          url: car.url,
          alt: car.alt
        }));
        
        setCarImages(mappedCars);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCarImages();
  }, [brand, model]);
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>&times;</button>
        <div className="modal-main-content">
          <img src={imageUrl} alt={`${brand} ${model}`} className="modal-image" />
          <div className="modal-caption">
            <h3>{brand}</h3>
            <p>{model}</p>
          </div>
        </div>
        
        <div className="complementary-cars">
          <h4>Complimentary Luxury Cars</h4>
          {isLoading ? (
            <div className="car-images-loading">Loading...</div>
          ) : (
            <div className="car-images-grid">
              {carImages.map((car) => (
                <div key={car.id} className="car-image-container">
                  <img 
                    src={car.url} 
                    alt={car.alt} 
                    className="car-image"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};



const Watches: React.FC = () => {
  const [selectedWatch, setSelectedWatch] = useState<Watch | null>(null);

  const openModal = async (watch: Watch) => {
    setSelectedWatch(watch);
    document.body.style.overflow = 'hidden'; // Prevent scrolling when modal is open
  };

  const closeModal = () => {
    setSelectedWatch(null);
    document.body.style.overflow = 'unset'; // Re-enable scrolling
  };

  const watches: Watch[] = [
    {
      id: 1,
      brand: 'Patek Philippe',
      model: 'Nautilus 5711',
      price: '$45,000',
      dominantColor: '#2c3e50',
      carColor: 'blue',
      imageUrl: 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80',
    },
    {
      id: 2,
      brand: 'Audemars Piguet',
      model: 'Royal Oak',
      price: '$52,000',
      dominantColor: '#1a1a1a',
      carColor: 'black',
      imageUrl: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1480&q=80',
    },
    {
      id: 3,
      brand: 'Rolex',
      model: 'Daytona',
      price: '$32,500',
      dominantColor: '#f1c40f',
      carColor: 'brown',
      imageUrl: 'https://images.unsplash.com/photo-1611591437281-fb904a76a0d9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    },
    {
      id: 4,
      brand: 'Vacheron Constantin',
      model: 'Overseas',
      price: '$38,000',
      dominantColor: '#9b59b6',
      carColor: 'silver',
      imageUrl: 'https://images.unsplash.com/photo-1548169874-fb8e9c8b9db2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    },
    {
      id: 5,
      brand: 'A. Lange & Söhne',
      model: 'Lange 1',
      price: '$48,000',
      dominantColor: '#e67e22',
      carColor: 'brown',
      imageUrl: 'https://images.unsplash.com/photo-1539874754764-5a96559165b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    },
    {
      id: 6,
      brand: 'Jaeger-LeCoultre',
      model: 'Reverso',
      price: '$28,500',
      dominantColor: '#2c3e50',
      carColor: 'black',
      imageUrl: 'https://images.unsplash.com/photo-1526045432337-406d5f0daa2b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80',
    },
    {
      id: 7,
      brand: 'IWC',
      model: 'Portugieser',
      price: '$12,500',
      dominantColor: '#1a1a1a',
      carColor: 'black',
      imageUrl: 'https://images.unsplash.com/photo-1587925358603-6f29d0b3d014?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80'
    },
    {
      id: 8,
      brand: 'Omega',
      model: 'Speedmaster',
      price: '$8,500',
      dominantColor: '#95a5a6',
      carColor: 'silver',
      imageUrl: 'https://images.unsplash.com/photo-1551817955-d4e834d2b1f0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80'
    }
  ];

  return (
    <div className="watches-page">
      <div className="watches-header">
        <h1>Swiss Luxury Watches</h1>
        <p>Discover our curated collection of exceptional timepieces from the finest Swiss manufacturers</p>
      </div>
      
      <div className="watches-grid">
        {watches.map((watch) => (
          <div key={watch.id} className="watch-card">
            <div className="watch-image" onClick={() => openModal(watch)}>
              <img 
                src={watch.imageUrl} 
                alt={`${watch.brand} ${watch.model}`} 
                className="watch-thumbnail"
              />
              <div className="watch-overlay">
                <span className="price">{watch.price}</span>
              </div>
            </div>
            <div className="watch-details">
              <h3>{watch.brand}</h3>
              <p className="model">{watch.model}</p>
            </div>
          </div>
        ))}
      </div>
      
      {selectedWatch && (
        <ImageModal 
          imageUrl={selectedWatch.imageUrl}
          brand={selectedWatch.brand}
          model={selectedWatch.model}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default Watches;
