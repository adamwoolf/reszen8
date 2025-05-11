import React, { useState, useEffect } from 'react';

interface LocationData {
  city: string;
  country: string;
}

const Weather: React.FC = () => {
  const [weather, setWeather] = useState<string>('Loading weather...');
  const [location, setLocation] = useState<LocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Get user's geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Get city name using reverse geocoding (using OpenStreetMap Nominatim)
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );
            
            if (!response.ok) {
              throw new Error('Failed to fetch location data');
            }
            
            const data = await response.json();
            
            setLocation({
              city: data.address.city || data.address.town || data.address.village || 'Unknown',
              country: data.address.country || 'Unknown'
            });
            
            // Simulate weather data fetch
            const weatherResponses = [
              'Sunny, 22°C',
              'Partly Cloudy, 20°C',
              'Rainy, 18°C',
              'Cloudy, 19°C',
              'Clear, 24°C'
            ];
            
            const randomWeather = weatherResponses[Math.floor(Math.random() * weatherResponses.length)];
            setWeather(randomWeather);
            setIsLoading(false);
          } catch (err) {
            console.error('Error fetching location data:', err);
            setError('Unable to fetch location data');
            setIsLoading(false);
          }
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Unable to access your location. Please enable location services.');
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="page">
      <h1>Weather</h1>
      {isLoading ? (
        <p>Loading weather data...</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : (
        <div className="weather-info">
          <p className="weather-display">{weather}</p>
          {location && (
            <p className="location">
              <i className="fas fa-map-marker-alt"></i> {location.city}, {location.country}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Weather;
