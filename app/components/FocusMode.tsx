'use client';

import { motion } from 'framer-motion';
import React, { useState, useEffect, useCallback } from 'react';

interface FocusModeProps {
  onClose: () => void;
}

const DEFAULT_FOCUS_TIME = 25 * 60; // 25 minutes en secondes
const DEFAULT_BREAK_TIME = 5 * 60; // 5 minutes en secondes

type TimerState = 'idle' | 'focus' | 'break' | 'completed';

const FocusMode: React.FC<FocusModeProps> = ({ onClose }) => {
  const [timerState, setTimerState] = useState<TimerState>('idle');
  const [timeRemaining, setTimeRemaining] = useState(DEFAULT_FOCUS_TIME);
  const [isRunning, setIsRunning] = useState(false);
  const [cycles, setCycles] = useState(0);

  // Formater le temps en minutes:secondes
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculer le pourcentage pour l'animation du cercle
  const calculateCircleProgress = (): number => {
    const totalTime = timerState === 'focus' ? DEFAULT_FOCUS_TIME : DEFAULT_BREAK_TIME;
    return ((totalTime - timeRemaining) / totalTime) * 100;
  };

  // Gérer la fin d'un cycle Pomodoro
  const handleTimerComplete = useCallback(() => {
    if (timerState === 'focus') {
      // Fin d'un cycle de focus, passer à une pause
      setTimerState('break');
      setTimeRemaining(DEFAULT_BREAK_TIME);
      
      // Jouer un son pour indiquer la fin du cycle focus
      try {
        const audio = new Audio('/sounds/focus-end.mp3');
        audio.play();
      } catch (error) {
        console.error('Erreur lors de la lecture du son', error);
      }
    } else if (timerState === 'break') {
      // Fin d'une pause, mettre à jour le nombre de cycles
      setCycles(prev => prev + 1);
      
      // Revenir à l'état "idle" après une pause
      setTimerState('completed');
      setIsRunning(false);
      
      // Jouer un son pour indiquer la fin de la pause
      try {
        const audio = new Audio('/sounds/break-end.mp3');
        audio.play();
      } catch (error) {
        console.error('Erreur lors de la lecture du son', error);
      }
    }
  }, [timerState]);

  // Décrémenter le timer
  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;

    if (isRunning && timeRemaining > 0) {
      timerId = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeRemaining === 0) {
      handleTimerComplete();
    }

    // Nettoyage à la désactivation du composant
    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [isRunning, timeRemaining, handleTimerComplete]);

  // Démarrer un nouveau cycle de focus
  const startFocusTimer = () => {
    setTimerState('focus');
    setTimeRemaining(DEFAULT_FOCUS_TIME);
    setIsRunning(true);
  };

  // Mettre en pause ou reprendre le timer
  const toggleTimer = () => {
    setIsRunning(prev => !prev);
  };

  // Réinitialiser complètement le timer
  const resetTimer = () => {
    setIsRunning(false);
    setTimerState('idle');
    setTimeRemaining(DEFAULT_FOCUS_TIME);
  };

  // Animation variants avec Framer Motion
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5 }
    },
    exit: { 
      opacity: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      className="fixed inset-0 bg-white dark:bg-black flex flex-col items-center justify-center z-50"
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-apple-blue p-2 rounded-full"
        aria-label="Fermer le mode focus"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      
      <div className="flex flex-col items-center">
        <h1 className="text-2xl font-bold mb-8">Mode Focus</h1>
        
        <div className="relative w-64 h-64 mb-8">
          {/* Cercle de fond */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(128, 128, 128, 0.2)"
              strokeWidth="5"
            />
            
            {/* Cercle de progression */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={timerState === 'focus' ? '#007AFF' : '#34C759'}
              strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - calculateCircleProgress() / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          
          {/* Affichage du temps */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold mb-2">
              {formatTime(timeRemaining)}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {timerState === 'focus' ? 'Concentration' : timerState === 'break' ? 'Pause' : 'Prêt ?'}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-4">
          {timerState === 'idle' || timerState === 'completed' ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startFocusTimer}
              className="bg-apple-blue text-white px-6 py-3 rounded-full font-semibold"
            >
              {timerState === 'completed' ? 'Nouveau cycle' : 'Démarrer'}
            </motion.button>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleTimer}
                className={`px-6 py-3 rounded-full font-semibold ${
                  isRunning 
                    ? 'bg-apple-red text-white' 
                    : 'bg-apple-green text-white'
                }`}
              >
                {isRunning ? 'Pause' : 'Reprendre'}
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={resetTimer}
                className="bg-gray-200 dark:bg-gray-800 px-6 py-3 rounded-full font-semibold"
              >
                Réinitialiser
              </motion.button>
            </>
          )}
        </div>
        
        {cycles > 0 && (
          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              Cycles complétés : {cycles}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default FocusMode; 