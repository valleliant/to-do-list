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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-[#1C3B46] text-white z-50 flex flex-col"
    >
      <header className="flex items-center p-4">
        <button onClick={onClose} className="text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex-grow text-center">
          <h1 className="text-xl font-semibold">Mode Focus</h1>
        </div>
        <div className="w-6"></div> {/* Pour équilibrer le header */}
      </header>
      
      <div className="flex-grow flex flex-col items-center justify-center p-6 overflow-y-auto">
        <div className="relative w-64 h-64 mb-10">
          {/* Cercle de fond */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="5"
            />
            
            {/* Cercle de progression */}
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke={timerState === 'focus' ? '#FF9500' : '#34C759'}
              strokeWidth="5"
              strokeDasharray={`${2 * Math.PI * 45}`}
              strokeDashoffset={`${2 * Math.PI * 45 * (1 - calculateCircleProgress() / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          </svg>
          
          {/* Affichage du temps */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-bold mb-2">
              {formatTime(timeRemaining)}
            </span>
            <span className="text-sm text-gray-300">
              {timerState === 'focus' ? 'Concentration' : timerState === 'break' ? 'Pause' : 'Prêt ?'}
            </span>
          </div>
        </div>
        
        <div className="flex space-x-4 mb-8">
          {timerState === 'idle' || timerState === 'completed' ? (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={startFocusTimer}
              className="bg-[#4B9BC3] text-white px-6 py-3 rounded-full font-medium"
            >
              {timerState === 'completed' ? 'Nouveau cycle' : 'Démarrer'}
            </motion.button>
          ) : (
            <>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={toggleTimer}
                className={`px-6 py-3 rounded-full font-medium ${
                  isRunning 
                    ? 'bg-red-500 text-white' 
                    : 'bg-green-500 text-white'
                }`}
              >
                {isRunning ? 'Pause' : 'Reprendre'}
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={resetTimer}
                className="bg-gray-700 text-white px-6 py-3 rounded-full font-medium"
              >
                Réinitialiser
              </motion.button>
            </>
          )}
        </div>
        
        {cycles > 0 && (
          <div className="text-center">
            <p className="text-gray-300">
              Cycles complétés : {cycles}
            </p>
          </div>
        )}
      </div>
      
      {/* Navigation */}
      <div className="bg-[#4B9BC3] py-4 flex justify-around">
        <button className="text-white p-2 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <button className="text-white p-2 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
        <button className="text-white p-2 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default FocusMode; 