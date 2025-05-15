'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { Task } from '../hooks/useTasks';

interface DynamicIslandProps {
  activeTask?: Task | null;
  focusTimeRemaining?: number | null;
  isFocusMode?: boolean;
  onOpenFocus?: () => void;
}

const DynamicIsland: React.FC<DynamicIslandProps> = ({ 
  activeTask, 
  focusTimeRemaining, 
  isFocusMode = false,
  onOpenFocus
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Déterminer si l'île doit être visible
  useEffect(() => {
    // Afficher si on est en mode focus ou si une tâche active est définie
    setIsVisible(!!activeTask || isFocusMode);
  }, [activeTask, isFocusMode]);

  // Formatter le temps restant du timer
  const formatTime = (seconds: number | null | undefined): string => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Animation variants pour Framer Motion
  const islandVariants = {
    hidden: { y: -100, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { 
        type: 'spring', 
        stiffness: 500, 
        damping: 30 
      }
    },
    exit: { 
      y: -100, 
      opacity: 0,
      transition: { duration: 0.2 }
    },
    expanded: {
      width: 'auto',
      minWidth: '80%',
      borderRadius: '20px',
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 30 
      }
    },
    collapsed: {
      width: 'auto',
      minWidth: '120px',
      borderRadius: '30px',
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 30 
      }
    }
  };

  // Si rien n'est actif, ne pas afficher l'île
  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial="hidden"
          animate={[isExpanded ? 'expanded' : 'collapsed', 'visible']}
          exit="exit"
          variants={islandVariants}
          className="dynamic-island shadow-lg"
          onClick={() => {
            // Basculer l'état d'expansion si une tâche active est présente
            // Ou ouvrir directement le mode focus si on est en mode focus
            if (isFocusMode && onOpenFocus) {
              onOpenFocus();
            } else {
              setIsExpanded(prev => !prev);
            }
          }}
        >
          <div className="flex items-center justify-between py-1 px-2">
            {isFocusMode ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 rounded-full bg-apple-red animate-pulse"></div>
                  <span className="text-sm font-medium">Focus</span>
                </div>
                
                <span className="text-sm font-medium">
                  {formatTime(focusTimeRemaining)}
                </span>
              </>
            ) : activeTask ? (
              <>
                <span className="flex items-center space-x-1">
                  {isExpanded ? (
                    <span className="text-sm font-medium">{activeTask.title}</span>
                  ) : (
                    <>
                      <div className="w-2 h-2 rounded-full bg-apple-green"></div>
                      <span className="text-sm font-medium">Tâche active</span>
                    </>
                  )}
                </span>
                
                {isExpanded && (
                  <div className="flex items-center space-x-2">
                    <button 
                      className="p-1 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenFocus) onOpenFocus();
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DynamicIsland; 