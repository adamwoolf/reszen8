import React from 'react';

const Photos: React.FC = () => {
  const photoUrls = [
    'https://picsum.photos/300/200?random=1',
    'https://picsum.photos/300/200?random=2',
    'https://picsum.photos/300/200?random=3',
    'https://picsum.photos/300/200?random=4',
  ];

  return (
    <div className="page">
      <h1>Photo Gallery</h1>
      <div className="photo-grid">
        {photoUrls.map((url, index) => (
          <div key={index} className="photo-item">
            <img src={url} alt={`Photo ${index + 1}`} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Photos;
