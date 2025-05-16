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
    setIsVisible(!!activeTask || isFocusMode || true); // Toujours visible pour l'effet
  }, [activeTask, isFocusMode]);

  // Formatter le temps restant du timer
  const formatTime = (seconds: number | null | undefined): string => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Obtenir le contenu approprié selon l'état
  const getContent = () => {
    if (isFocusMode) {
      return {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        ),
        title: 'Focus',
        subtitle: formatTime(focusTimeRemaining),
        color: 'from-apple-red to-apple-orange'
      };
    } 
    
    if (activeTask) {
      let priorityColor = 'from-apple-blue to-apple-teal';
      if (activeTask.priority === 'high') {
        priorityColor = 'from-apple-red to-apple-pink';
      } else if (activeTask.priority === 'low') {
        priorityColor = 'from-apple-green to-apple-teal';
      }
      
      return {
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
          </svg>
        ),
        title: activeTask.title,
        subtitle: 'Tâche active',
        color: priorityColor
      };
    }
    
    // État par défaut
    return {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
        </svg>
      ),
      title: 'Aujourd\'hui',
      subtitle: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      color: 'from-apple-blue to-apple-indigo'
    };
  };

  const content = getContent();

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
    }
  };
  
  const expandVariants = {
    expanded: {
      width: '90%',
      height: 'auto',
      borderRadius: '1.5rem',
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 30 
      }
    },
    collapsed: {
      width: 'auto',
      height: 'auto',
      borderRadius: '2rem',
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 30 
      }
    }
  };

  const iconVariants = {
    expanded: { 
      scale: 1.2,
      transition: { duration: 0.2 }
    },
    collapsed: { 
      scale: 1,
      transition: { duration: 0.2 }
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={islandVariants}
          className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 p-0 overflow-hidden"
        >
          <motion.div
            initial="collapsed"
            animate={isExpanded ? "expanded" : "collapsed"}
            variants={expandVariants}
            onClick={() => setIsExpanded(prev => !prev)}
            className={`bg-gradient-to-br ${content.color} shadow-lg px-4 py-3 flex items-center justify-between`}
          >
            <div className="flex items-center space-x-3">
              <motion.div 
                variants={iconVariants}
                animate={isExpanded ? "expanded" : "collapsed"}
                className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center"
              >
                {content.icon}
              </motion.div>
              
              <div className="flex flex-col text-white">
                <span className="text-sm font-semibold line-clamp-1">
                  {isExpanded ? content.title : 'ToDo PWA'}
                </span>
                
                {isExpanded && (
                  <span className="text-xs text-white/80">
                    {content.subtitle}
                  </span>
                )}
              </div>
            </div>
            
            {isExpanded && (
              <div className="flex space-x-2">
                {isFocusMode ? (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenFocus) onOpenFocus();
                    }}
                    className="p-1.5 bg-white/20 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                ) : (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenFocus) onOpenFocus();
                    }}
                    className="p-1.5 bg-white/20 rounded-full"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DynamicIsland; 