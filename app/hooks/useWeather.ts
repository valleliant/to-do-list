import { useState, useEffect } from 'react';

// Structure de données pour la météo
export interface WeatherData {
  temperature: number;
  feelsLike: number;
  description: string;
  iconUrl: string;
  location: string;
  humidity: number;
  windSpeed: number;
}

export const useWeather = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  // API OpenWeather (remplacer par une vraie clé API dans une application réelle)
  // Dans un projet réel, cette clé serait stockée côté serveur
  const API_KEY = 'DUMMY_API_KEY';
  const API_URL = 'https://api.openweathermap.org/data/2.5/weather';

  // Obtenir la géolocalisation
  useEffect(() => {
    const getLocation = () => {
      if (!navigator.geolocation) {
        setError('La géolocalisation n\'est pas supportée par ce navigateur');
        setLoading(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (err) => {
          setError(`Erreur de géolocalisation: ${err.message}`);
          setLoading(false);
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    };

    getLocation();
  }, []);

  // Obtenir la météo lorsque les coordonnées sont disponibles
  useEffect(() => {
    if (!coords) return;

    const fetchWeather = async () => {
      try {
        setLoading(true);
        
        // Dans une vraie application, nous ferions un appel API réel
        // Ici, nous simulons les données pour l'exemple
        
        // Simulation de données météo (à remplacer par un vrai appel API)
        setTimeout(() => {
          const mockWeatherData: WeatherData = {
            temperature: 21,
            feelsLike: 22,
            description: 'Ensoleillé',
            iconUrl: 'https://openweathermap.org/img/wn/01d@2x.png',
            location: 'Paris',
            humidity: 65,
            windSpeed: 5.2
          };
          
          setWeather(mockWeatherData);
          setLoading(false);
        }, 1000);
        
        // Code pour un appel API réel (à utiliser dans une vraie application)
        /*
        const response = await fetch(
          `${API_URL}?lat=${coords.lat}&lon=${coords.lon}&units=metric&lang=fr&appid=${API_KEY}`
        );
        
        if (!response.ok) {
          throw new Error('Impossible de récupérer les données météo');
        }
        
        const data = await response.json();
        
        setWeather({
          temperature: Math.round(data.main.temp),
          feelsLike: Math.round(data.main.feels_like),
          description: data.weather[0].description,
          iconUrl: `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`,
          location: data.name,
          humidity: data.main.humidity,
          windSpeed: data.wind.speed
        });
        */
        
      } catch (err) {
        setError('Erreur lors de la récupération des données météo');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [coords]);

  // Fonction pour rafraîchir manuellement les données météo
  const refreshWeather = () => {
    if (coords) {
      setLoading(true);
      setError(null);
      
      // Simuler un rafraîchissement des données
      setTimeout(() => {
        const mockWeatherData: WeatherData = {
          temperature: Math.round(15 + Math.random() * 10),
          feelsLike: Math.round(15 + Math.random() * 10),
          description: 'Ensoleillé',
          iconUrl: 'https://openweathermap.org/img/wn/01d@2x.png',
          location: 'Paris',
          humidity: Math.round(50 + Math.random() * 30),
          windSpeed: 3 + Math.random() * 5
        };
        
        setWeather(mockWeatherData);
        setLoading(false);
      }, 1000);
    }
  };

  return {
    weather,
    loading,
    error,
    refreshWeather
  };
}; 