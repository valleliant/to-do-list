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
  // Animation variants
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        type: 'spring',
        stiffness: 300,
        damping: 20
      } 
    },
    hover: {
      y: -5,
      transition: { 
        duration: 0.3
      }
    }
  };

  // Animation pour les icônes
  const iconVariants = {
    animate: {
      y: [0, -5, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        repeatType: 'loop' as const,
        ease: 'easeInOut'
      }
    }
  };

  // Obtenir la classe de couleur en fonction de la température
  const getTemperatureColor = (temp: number) => {
    if (temp < 0) return 'text-blue-500';
    if (temp < 10) return 'text-blue-500';
    if (temp < 20) return 'text-green-500';
    if (temp < 30) return 'text-orange-500';
    return 'text-red-500';
  };

  // Obtenir l'effet de fond en fonction du temps
  const getWeatherBackground = (description?: string) => {
    if (!description) return 'bg-gradient-to-br from-blue-500 to-blue-300';
    
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('pluie') || lowerDesc.includes('averse')) {
      return 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20';
    }
    if (lowerDesc.includes('nuage') || lowerDesc.includes('couvert')) {
      return 'bg-gradient-to-br from-gray-500/10 to-blue-500/10';
    }
    if (lowerDesc.includes('orage')) {
      return 'bg-gradient-to-br from-indigo-500/30 to-purple-500/30';
    }
    if (lowerDesc.includes('neige')) {
      return 'bg-gradient-to-br from-white to-cyan-500/10';
    }
    if (lowerDesc.includes('brouillard') || lowerDesc.includes('brume')) {
      return 'bg-gradient-to-br from-gray-500/20 to-white/20';
    }
    // Par défaut, ciel clair
    return 'bg-gradient-to-br from-blue-50 to-cyan-50';
  };

  if (loading) {
    return (
      <motion.div 
        variants={variants}
        initial="hidden"
        animate="visible"
        className="rounded-2xl bg-white/90 backdrop-blur-lg shadow-sm border border-gray-100 w-full p-4 flex justify-center items-center h-24"
      >
        <div className="animate-pulse flex flex-col items-center space-y-3">
          <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
          <div className="h-4 w-36 bg-gray-200 rounded-lg"></div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        variants={variants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="rounded-2xl bg-white/90 backdrop-blur-lg shadow-sm border border-gray-100 w-full p-5"
      >
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm mb-3 text-gray-700">{error}</p>
          <button 
            onClick={onRefresh}
            className="mt-1 bg-white/70 text-blue-500 font-medium rounded-full py-3 px-5 border border-gray-100 active:opacity-90 transition-all duration-200 backdrop-blur-sm shadow-sm text-sm"
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
        variants={variants}
        initial="hidden"
        animate="visible" 
        whileHover="hover"
        className="rounded-2xl bg-white/90 backdrop-blur-lg shadow-sm border border-gray-100 w-full p-5"
      >
        <div className="text-center">
          <div className="flex justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm mb-3 text-gray-700">
            Activez la localisation pour afficher la météo
          </p>
          <button 
            onClick={onRefresh}
            className="mt-1 bg-white/70 text-blue-500 font-medium rounded-full py-3 px-5 border border-gray-100 active:opacity-90 transition-all duration-200 backdrop-blur-sm shadow-sm text-sm"
          >
            Actualiser
          </button>
        </div>
      </motion.div>
    );
  }

  const tempColor = getTemperatureColor(weather.temperature);
  const weatherBg = getWeatherBackground(weather.description);

  return (
    <motion.div 
      variants={variants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      className={`rounded-2xl bg-white/90 backdrop-blur-lg shadow-sm border border-gray-100 w-full relative overflow-hidden ${weatherBg}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 opacity-60 transform translate-x-8 -translate-y-8">
        <motion.div 
          variants={iconVariants}
          animate="animate"
          className="w-full h-full"
        >
          <img 
            src={weather.iconUrl} 
            alt={weather.description}
            className="w-full h-full"
          />
        </motion.div>
      </div>
      
      <div className="flex flex-col relative z-10 p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-semibold mb-1 text-shadow">{weather.location}</h3>
            <p className="text-sm text-gray-700 capitalize">{weather.description}</p>
          </div>
          
          <div className="flex flex-col items-end">
            <div className={`font-bold text-3xl ${tempColor}`}>{Math.round(weather.temperature)}°</div>
            <div className="text-xs text-gray-600">
              Ressenti: {Math.round(weather.feelsLike)}°
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-200/30">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-600 mb-1">Humidité</span>
            <span className="font-medium text-sm">{weather.humidity}%</span>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-600 mb-1">Vent</span>
            <span className="font-medium text-sm">{Math.round(weather.windSpeed)} km/h</span>
          </div>
          
          <div className="flex flex-col items-center">
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={onRefresh} 
              className="text-xs flex flex-col items-center text-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mb-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>Actualiser</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WeatherWidget; 