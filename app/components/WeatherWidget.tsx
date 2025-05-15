'use client';

import { motion } from 'framer-motion';
import React from 'react';
import { WeatherData } from '../hooks/useWeather';

interface WeatherWidgetProps {
  weather: WeatherData | null;
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const WeatherWidget: React.FC<WeatherWidgetProps> = ({ 
  weather, 
  loading, 
  error, 
  onRefresh 
}) => {
  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="ios-card w-full p-4 flex justify-center items-center"
      >
        <div className="animate-pulse flex items-center space-x-2">
          <div className="h-6 w-6 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
          <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="ios-card w-full p-4"
      >
        <div className="text-center text-apple-red">
          <p>{error}</p>
          <button 
            onClick={onRefresh}
            className="mt-2 text-apple-blue font-medium"
          >
            Réessayer
          </button>
        </div>
      </motion.div>
    );
  }

  if (!weather) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="ios-card w-full p-4"
      >
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>Données météo indisponibles</p>
          <button 
            onClick={onRefresh}
            className="mt-2 text-apple-blue font-medium"
          >
            Actualiser
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="ios-card w-full"
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{weather.location}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{weather.description}</p>
        </div>
        
        <div className="flex items-center">
          <img 
            src={weather.iconUrl} 
            alt={weather.description}
            className="w-12 h-12"
          />
          <div className="text-right">
            <p className="text-2xl font-semibold">{weather.temperature}°C</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Ressenti: {weather.feelsLike}°C
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-2 grid grid-cols-2 gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-gray-500 dark:text-gray-400">Humidité: {weather.humidity}%</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span className="text-xs text-gray-500 dark:text-gray-400">Vent: {weather.windSpeed} km/h</span>
        </div>
      </div>
      
      <button 
        onClick={onRefresh}
        className="mt-3 text-xs text-apple-blue font-medium w-full text-center"
      >
        Actualiser
      </button>
    </motion.div>
  );
};

export default WeatherWidget; 