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

  // API Open-Meteo (gratuite, pas de clé API nécessaire)
  const WEATHER_API_URL = 'https://api.open-meteo.com/v1/forecast';
  const GEOCODING_API_URL = 'https://geocoding-api.open-meteo.com/v1/search';

  // Fonction pour obtenir le code météo WMO en description française
  const getWeatherDescription = (weatherCode: number): string => {
    const weatherCodes: { [key: number]: string } = {
      0: 'Ciel dégagé',
      1: 'Principalement dégagé',
      2: 'Partiellement nuageux',
      3: 'Couvert',
      45: 'Brouillard',
      48: 'Brouillard givrant',
      51: 'Bruine légère',
      53: 'Bruine modérée',
      55: 'Bruine dense',
      56: 'Bruine verglaçante légère',
      57: 'Bruine verglaçante dense',
      61: 'Pluie légère',
      63: 'Pluie modérée',
      65: 'Pluie forte',
      66: 'Pluie verglaçante légère',
      67: 'Pluie verglaçante forte',
      71: 'Neige légère',
      73: 'Neige modérée',
      75: 'Neige forte',
      77: 'Grains de neige',
      80: 'Averses légères',
      81: 'Averses modérées',
      82: 'Averses violentes',
      85: 'Averses de neige légères',
      86: 'Averses de neige fortes',
      95: 'Orage léger ou modéré',
      96: 'Orage avec grêle légère',
      99: 'Orage avec grêle forte'
    };
    return weatherCodes[weatherCode] || 'Conditions inconnues';
  };

  // Fonction pour obtenir l'URL de l'icône basée sur le code météo
  const getWeatherIcon = (weatherCode: number, isDay: boolean): string => {
    const iconMap: { [key: number]: { day: string; night: string } } = {
      0: { day: 'https://openweathermap.org/img/wn/01d@2x.png', night: 'https://openweathermap.org/img/wn/01n@2x.png' },
      1: { day: 'https://openweathermap.org/img/wn/02d@2x.png', night: 'https://openweathermap.org/img/wn/02n@2x.png' },
      2: { day: 'https://openweathermap.org/img/wn/03d@2x.png', night: 'https://openweathermap.org/img/wn/03n@2x.png' },
      3: { day: 'https://openweathermap.org/img/wn/04d@2x.png', night: 'https://openweathermap.org/img/wn/04n@2x.png' },
      45: { day: 'https://openweathermap.org/img/wn/50d@2x.png', night: 'https://openweathermap.org/img/wn/50n@2x.png' },
      48: { day: 'https://openweathermap.org/img/wn/50d@2x.png', night: 'https://openweathermap.org/img/wn/50n@2x.png' },
      51: { day: 'https://openweathermap.org/img/wn/09d@2x.png', night: 'https://openweathermap.org/img/wn/09n@2x.png' },
      53: { day: 'https://openweathermap.org/img/wn/09d@2x.png', night: 'https://openweathermap.org/img/wn/09n@2x.png' },
      55: { day: 'https://openweathermap.org/img/wn/09d@2x.png', night: 'https://openweathermap.org/img/wn/09n@2x.png' },
      56: { day: 'https://openweathermap.org/img/wn/09d@2x.png', night: 'https://openweathermap.org/img/wn/09n@2x.png' },
      57: { day: 'https://openweathermap.org/img/wn/09d@2x.png', night: 'https://openweathermap.org/img/wn/09n@2x.png' },
      61: { day: 'https://openweathermap.org/img/wn/10d@2x.png', night: 'https://openweathermap.org/img/wn/10n@2x.png' },
      63: { day: 'https://openweathermap.org/img/wn/10d@2x.png', night: 'https://openweathermap.org/img/wn/10n@2x.png' },
      65: { day: 'https://openweathermap.org/img/wn/10d@2x.png', night: 'https://openweathermap.org/img/wn/10n@2x.png' },
      66: { day: 'https://openweathermap.org/img/wn/13d@2x.png', night: 'https://openweathermap.org/img/wn/13n@2x.png' },
      67: { day: 'https://openweathermap.org/img/wn/13d@2x.png', night: 'https://openweathermap.org/img/wn/13n@2x.png' },
      71: { day: 'https://openweathermap.org/img/wn/13d@2x.png', night: 'https://openweathermap.org/img/wn/13n@2x.png' },
      73: { day: 'https://openweathermap.org/img/wn/13d@2x.png', night: 'https://openweathermap.org/img/wn/13n@2x.png' },
      75: { day: 'https://openweathermap.org/img/wn/13d@2x.png', night: 'https://openweathermap.org/img/wn/13n@2x.png' },
      77: { day: 'https://openweathermap.org/img/wn/13d@2x.png', night: 'https://openweathermap.org/img/wn/13n@2x.png' },
      80: { day: 'https://openweathermap.org/img/wn/09d@2x.png', night: 'https://openweathermap.org/img/wn/09n@2x.png' },
      81: { day: 'https://openweathermap.org/img/wn/09d@2x.png', night: 'https://openweathermap.org/img/wn/09n@2x.png' },
      82: { day: 'https://openweathermap.org/img/wn/09d@2x.png', night: 'https://openweathermap.org/img/wn/09n@2x.png' },
      85: { day: 'https://openweathermap.org/img/wn/13d@2x.png', night: 'https://openweathermap.org/img/wn/13n@2x.png' },
      86: { day: 'https://openweathermap.org/img/wn/13d@2x.png', night: 'https://openweathermap.org/img/wn/13n@2x.png' },
      95: { day: 'https://openweathermap.org/img/wn/11d@2x.png', night: 'https://openweathermap.org/img/wn/11n@2x.png' },
      96: { day: 'https://openweathermap.org/img/wn/11d@2x.png', night: 'https://openweathermap.org/img/wn/11n@2x.png' },
      99: { day: 'https://openweathermap.org/img/wn/11d@2x.png', night: 'https://openweathermap.org/img/wn/11n@2x.png' }
    };
    
    const icons = iconMap[weatherCode] || iconMap[0];
    return isDay ? icons.day : icons.night;
  };

  // Fonction pour obtenir le nom de la ville à partir des coordonnées
  const getCityName = async (lat: number, lon: number): Promise<string> => {
    try {
      const response = await fetch(
        `${GEOCODING_API_URL}?latitude=${lat}&longitude=${lon}&count=1&language=fr&format=json`
      );
      
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération du nom de la ville');
      }
      
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].name || 'Localisation inconnue';
      }
      
      return 'Localisation inconnue';
    } catch (error) {
      console.error('Erreur géocodage:', error);
      return 'Localisation inconnue';
    }
  };

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
        setError(null);
        
        // Appel à l'API Open-Meteo
        const response = await fetch(
          `${WEATHER_API_URL}?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=auto`
        );
        
        if (!response.ok) {
          throw new Error('Impossible de récupérer les données météo');
        }
        
        const data = await response.json();
        
        // Obtenir le nom de la ville
        const cityName = await getCityName(coords.lat, coords.lon);
        
        // Extraire les données actuelles
        const current = data.current;
        
        setWeather({
          temperature: Math.round(current.temperature_2m),
          feelsLike: Math.round(current.apparent_temperature),
          description: getWeatherDescription(current.weather_code),
          iconUrl: getWeatherIcon(current.weather_code, current.is_day === 1),
          location: cityName,
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m * 10) / 10 // Arrondir à 1 décimale
        });
        
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
      
      // Relancer la récupération des données météo
      const fetchWeather = async () => {
        try {
          const response = await fetch(
            `${WEATHER_API_URL}?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,weather_code,wind_speed_10m&timezone=auto`
          );
          
          if (!response.ok) {
            throw new Error('Impossible de récupérer les données météo');
          }
          
          const data = await response.json();
          const cityName = await getCityName(coords.lat, coords.lon);
          const current = data.current;
          
          setWeather({
            temperature: Math.round(current.temperature_2m),
            feelsLike: Math.round(current.apparent_temperature),
            description: getWeatherDescription(current.weather_code),
            iconUrl: getWeatherIcon(current.weather_code, current.is_day === 1),
            location: cityName,
            humidity: current.relative_humidity_2m,
            windSpeed: Math.round(current.wind_speed_10m * 10) / 10
          });
          
        } catch (err) {
          setError('Erreur lors de la récupération des données météo');
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      
      fetchWeather();
    }
  };

  return {
    weather,
    loading,
    error,
    refreshWeather
  };
}; 