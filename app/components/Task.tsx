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
  const [actionState, setActionState] = useState<'none' | 'completing' | 'deleting'>('none');
  const x = useMotionValue(0);
  
  // Seuils optimisés style Gmail
  const SWIPE_THRESHOLD = 60; // Encore plus bas pour être plus "glissant"
  const MAX_DRAG = 100;
  const VELOCITY_THRESHOLD = 300; // Réduit pour plus de sensibilité
  
  // Transformations pour les indicateurs de glissement - style Gmail
  const leftOpacity = useTransform(x, [-MAX_DRAG, -30, 0], [1, 0.9, 0]);
  const rightOpacity = useTransform(x, [0, 30, MAX_DRAG], [0, 0.9, 1]);
  const leftScale = useTransform(x, [-MAX_DRAG, -30, 0], [1.1, 1, 0.95]);
  const rightScale = useTransform(x, [0, 30, MAX_DRAG], [0.95, 1, 1.1]);
  
  // Couleur de fond selon la direction - transitions Gmail-like
  const backgroundColor = useTransform(
    x,
    [-MAX_DRAG, -40, -20, 0, 20, 40, MAX_DRAG],
    ['#10B981', '#10B981', '#1C3B46', '#1C3B46', '#1C3B46', '#EF4444', '#EF4444']
  );

  // Pas de rotation pour un style plus Gmail
  const scale = useTransform(x, [-MAX_DRAG, 0, MAX_DRAG], [0.98, 1, 0.98]);

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

  // Gestion du glissement style Gmail
  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    setDragProgress(0);
    
    const velocity = info.velocity.x;
    const offset = info.offset.x;
    
    // Seuils très bas pour un glissement fluide
    const isHighVelocity = Math.abs(velocity) > VELOCITY_THRESHOLD;
    const dynamicThreshold = isHighVelocity ? SWIPE_THRESHOLD * 0.5 : SWIPE_THRESHOLD;
    
    if (offset < -dynamicThreshold || (velocity < -VELOCITY_THRESHOLD && offset < -20)) {
      // Animation de completion style Gmail
      setActionState('completing');
      x.set(-MAX_DRAG * 1.2);
      
      // Affichage de confirmation pendant 800ms
      setTimeout(() => {
        onToggle(task.id);
        setActionState('none');
      }, 800);
      
    } else if (offset > dynamicThreshold || (velocity > VELOCITY_THRESHOLD && offset > 20)) {
      // Animation de suppression style Gmail
      setActionState('deleting');
      x.set(MAX_DRAG * 1.2);
      
      // Affichage de confirmation pendant 800ms
      setTimeout(() => {
        onDelete(task.id);
        setActionState('none');
      }, 800);
      
    } else {
      // Retour fluide au centre
      x.set(0);
    }
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Animation variants style Gmail
  const variants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        type: 'spring', 
        stiffness: 400, 
        damping: 30 
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.9,
      y: -10,
      transition: { 
        duration: 0.3,
        ease: "easeInOut"
      } 
    },
    completing: {
      backgroundColor: '#10B981',
      transition: {
        duration: 0.3,
        ease: "easeInOut"
      }
    },
    deleting: {
      backgroundColor: '#EF4444',
      transition: {
        duration: 0.3,
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
      {/* Indicateurs de glissement en arrière-plan - style Gmail */}
      <div className="absolute inset-0 flex items-center justify-between px-6 rounded-xl">
        {/* Indicateur gauche - Terminé */}
        <motion.div 
          className="flex items-center text-white"
          style={{ opacity: leftOpacity, scale: leftScale }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="text-left">
              <div className="font-semibold text-lg">Terminé</div>
              <div className="text-sm opacity-90">Tâche accomplie</div>
            </div>
          </div>
        </motion.div>
        
        {/* Indicateur droite - Supprimer */}
        <motion.div 
          className="flex items-center text-white"
          style={{ opacity: rightOpacity, scale: rightScale }}
        >
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="font-semibold text-lg">Supprimer</div>
              <div className="text-sm opacity-90">Effacer la tâche</div>
            </div>
            <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
              <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 20 20">
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
        animate={
          actionState === 'completing' ? 'completing' :
          actionState === 'deleting' ? 'deleting' :
          task.completed ? "animate" : "animate"
        }
        exit="exit"
        variants={variants}
        style={{ 
          x,
          backgroundColor: 
            actionState === 'completing' ? '#10B981' :
            actionState === 'deleting' ? '#EF4444' :
            isDragging ? backgroundColor : '#1C3B46',
          scale: isDragging ? scale : 1
        }}
        drag="x"
        dragConstraints={{ left: -MAX_DRAG, right: MAX_DRAG }}
        dragElastic={0.02}
        dragMomentum={true}
        dragTransition={{ 
          bounceStiffness: 600, 
          bounceDamping: 30,
          power: 0.1,
          timeConstant: 100
        }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => !isDragging && onView(task)}
        className={`relative rounded-xl p-4 cursor-pointer transition-all duration-200 ${
          task.completed ? 'opacity-75' : ''
        } ${actionState !== 'none' ? 'pointer-events-none' : ''}`}
        whileHover={!isDragging && actionState === 'none' ? { y: -1, boxShadow: '0 4px 15px rgba(0,0,0,0.1)' } : {}}
        whileTap={!isDragging && actionState === 'none' ? { scale: 0.99 } : {}}
      >
        {/* Overlay de confirmation d'action */}
        {actionState !== 'none' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-xl"
          >
            <div className="flex items-center space-x-3 text-white">
              {actionState === 'completing' ? (
                <>
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium">Tâche terminée !</span>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 bg-white/30 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="font-medium">Tâche supprimée !</span>
                </>
              )}
            </div>
          </motion.div>
        )}

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
        
        {/* Barre de progression du glissement */}
        {isDragging && actionState === 'none' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-2 left-1/2 transform -translate-x-1/2"
          >
            <div className="bg-white/20 rounded-full h-1 w-24">
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