'use client';

import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { Task as TaskType } from '../hooks/useTasks';

interface TaskProps {
  task: TaskType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onView: (task: TaskType) => void;
}

const Task: React.FC<TaskProps> = ({ task, onToggle, onDelete, onEdit, onView }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragProgress, setDragProgress] = useState(0);
  const x = useMotionValue(0);
  
  // Seuils optimisés pour mobile
  const SWIPE_THRESHOLD = 80; // Réduit de 180 à 80 pour mobile
  const MAX_DRAG = 120; // Distance maximale de glissement
  
  // Transformations pour les indicateurs de glissement - plus réactives
  const leftOpacity = useTransform(x, [-MAX_DRAG, -40, 0], [1, 0.8, 0]);
  const rightOpacity = useTransform(x, [0, 40, MAX_DRAG], [0, 0.8, 1]);
  const leftScale = useTransform(x, [-MAX_DRAG, -40, 0], [1.2, 1.05, 0.9]);
  const rightScale = useTransform(x, [0, 40, MAX_DRAG], [0.9, 1.05, 1.2]);
  
  // Couleur de fond selon la direction - transitions plus rapides
  const backgroundColor = useTransform(
    x,
    [-MAX_DRAG, -60, -30, 0, 30, 60, MAX_DRAG],
    ['#10B981', '#10B981', '#1C3B46', '#1C3B46', '#1C3B46', '#EF4444', '#EF4444']
  );

  // Rotation plus subtile pour mobile
  const rotate = useTransform(x, [-MAX_DRAG, 0, MAX_DRAG], [-1, 0, 1]);

  // Écouter les changements de position pour la barre de progression
  useEffect(() => {
    const unsubscribe = x.onChange((latest) => {
      const progress = Math.abs(latest) / SWIPE_THRESHOLD;
      setDragProgress(Math.min(progress, 1));
    });
    
    return unsubscribe;
  }, [x]);

  // Styles et couleurs selon la priorité
  const getPriorityData = () => {
    switch (task.priority) {
      case 'high':
        return {
          color: 'bg-red-500',
          icon: (
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          ),
          label: 'Haute'
        };
      case 'medium':
        return {
          color: 'bg-orange-500',
          icon: (
            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          ),
          label: 'Moyenne'
        };
      case 'low':
        return {
          color: 'bg-green-500',
          icon: (
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          ),
          label: 'Basse'
        };
      default:
        return {
          color: 'bg-gray-500',
          icon: (
            <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
          ),
          label: 'Non définie'
        };
    }
  };

  const priorityData = getPriorityData();

  // Gestion du glissement optimisée pour mobile
  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    setDragProgress(0);
    
    // Utilisation de la vélocité pour une meilleure réactivité mobile
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    
    // Si la vélocité est élevée, on peut déclencher avec un seuil plus bas
    const velocityThreshold = 500; // pixels/seconde
    const isHighVelocity = Math.abs(velocity) > velocityThreshold;
    const dynamicThreshold = isHighVelocity ? SWIPE_THRESHOLD * 0.6 : SWIPE_THRESHOLD;
    
    if (offset < -dynamicThreshold || (velocity < -velocityThreshold && offset < -30)) {
      // Glissement vers la gauche - marquer comme terminé
      onToggle(task.id);
      // Animation de confirmation rapide
      x.set(-200);
      setTimeout(() => x.set(0), 150);
    } else if (offset > dynamicThreshold || (velocity > velocityThreshold && offset > 30)) {
      // Glissement vers la droite - supprimer
      onDelete(task.id);
      // Animation de confirmation rapide
      x.set(200);
      setTimeout(() => x.set(0), 150);
    } else {
      // Retour automatique au centre avec animation fluide
      x.set(0);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Animation variants optimisées
  const variants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        type: 'spring', 
        stiffness: 500, 
        damping: 35 
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: -20,
      transition: { 
        duration: 0.25,
        ease: "easeInOut"
      } 
    },
    completed: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.4,
        ease: "easeInOut"
      }
    }
  };

  // Format de date lisible
  const formatDueDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric' 
    });
  };

  const dueDateText = formatDueDate(task.dueDate);

  return (
    <div className="relative mb-3 overflow-hidden rounded-xl">
      {/* Indicateurs de glissement en arrière-plan */}
      <div className="absolute inset-0 flex items-center justify-between px-6 rounded-xl">
        {/* Indicateur gauche - Terminé */}
        <motion.div 
          className="flex items-center text-white"
          style={{ opacity: leftOpacity, scale: leftScale }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-semibold text-lg">Terminé</span>
          </div>
        </motion.div>
        
        {/* Indicateur droite - Supprimer */}
        <motion.div 
          className="flex items-center text-white"
          style={{ opacity: rightOpacity, scale: rightScale }}
        >
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-lg">Supprimer</span>
            <div className="w-10 h-10 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Contenu principal de la tâche */}
      <motion.div
        initial="initial"
        animate={task.completed ? "completed" : "animate"}
        exit="exit"
        variants={variants}
        style={{ 
          x,
          backgroundColor: isDragging ? backgroundColor : '#1C3B46',
          rotate: isDragging ? rotate : 0
        }}
        drag="x"
        dragConstraints={{ left: -MAX_DRAG, right: MAX_DRAG }}
        dragElastic={0.05}
        dragMomentum={false}
        dragTransition={{ 
          bounceStiffness: 800, 
          bounceDamping: 40,
          power: 0.2,
          timeConstant: 150
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => !isDragging && onView(task)}
        className={`relative rounded-xl p-4 cursor-pointer transition-all duration-150 ${
          task.completed ? 'opacity-75' : ''
        }`}
        whileHover={!isDragging ? { y: -1, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' } : {}}
        whileTap={!isDragging ? { scale: 0.99 } : {}}
      >
        <div className="flex items-start">
          <motion.span 
            className="mr-3 text-lg flex items-center justify-center w-6 h-6"
            animate={task.completed ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {task.completed ? (
              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            ) : (
              priorityData.icon
            )}
          </motion.span>
          
          <div className="flex-grow">
            <motion.h3 
              className={`font-medium text-base text-white ${
                task.completed ? 'line-through opacity-70' : ''
              }`}
              animate={task.completed ? { x: [0, 5, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              {task.title}
            </motion.h3>
            
            {task.description && (
              <motion.p 
                className={`text-xs text-white/70 mt-1 ${
                  task.completed ? 'line-through opacity-50' : ''
                }`}
                animate={task.completed ? { x: [0, 5, 0] } : {}}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                {task.description.substring(0, 50)}{task.description.length > 50 ? '...' : ''}
              </motion.p>
            )}
            
            {task.dueDate && (
              <motion.p 
                className={`text-xs text-gray-400 mt-1 ${
                  task.completed ? 'line-through opacity-50' : ''
                }`}
                animate={task.completed ? { x: [0, 5, 0] } : {}}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                {dueDateText}
              </motion.p>
            )}
          </div>
          
          <motion.button 
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task.id);
            }}
            className="text-white/70 p-1 hover:text-white transition-colors"
            aria-label="Options"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </motion.button>
        </div>
        
        {/* Indicateur de progression du glissement */}
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-white/20 rounded-full h-1 w-32">
              <motion.div
                className="h-full rounded-full bg-white/60"
                style={{
                  width: dragProgress * 100 + '%'
                }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Task; 