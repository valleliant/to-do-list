'use client';

import { motion, PanInfo, useMotionValue, useTransform } from 'framer-motion';
import React, { useState } from 'react';
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
  const x = useMotionValue(0);
  
  // Transformations pour les indicateurs de glissement
  const leftOpacity = useTransform(x, [-150, -50, 0], [1, 0.5, 0]);
  const rightOpacity = useTransform(x, [0, 50, 150], [0, 0.5, 1]);
  const leftScale = useTransform(x, [-150, -50, 0], [1.2, 1, 0.8]);
  const rightScale = useTransform(x, [0, 50, 150], [0.8, 1, 1.2]);
  
  // Couleur de fond selon la direction
  const backgroundColor = useTransform(
    x,
    [-150, -50, 0, 50, 150],
    ['#10B981', '#10B981', '#1C3B46', '#EF4444', '#EF4444']
  );

  // Styles et couleurs selon la priorité
  const getPriorityData = () => {
    switch (task.priority) {
      case 'high':
        return {
          color: 'bg-red-500',
          bullet: '🔴',
          label: 'Haute'
        };
      case 'medium':
        return {
          color: 'bg-orange-500',
          bullet: '🟠',
          label: 'Moyenne'
        };
      case 'low':
        return {
          color: 'bg-green-500',
          bullet: '🟢',
          label: 'Basse'
        };
      default:
        return {
          color: 'bg-blue-500',
          bullet: '⚪',
          label: 'Non définie'
        };
    }
  };

  const priorityData = getPriorityData();

  // Gestion du glissement
  const handleDragEnd = (event: any, info: PanInfo) => {
    setIsDragging(false);
    const threshold = 100;
    
    if (info.offset.x < -threshold) {
      // Glissement vers la gauche - marquer comme terminé
      onToggle(task.id);
    } else if (info.offset.x > threshold) {
      // Glissement vers la droite - supprimer
      onDelete(task.id);
    }
    
    // Remettre à zéro la position avec animation
    x.set(0);
  };

  const handleDragStart = () => {
    setIsDragging(true);
  };

  // Animation variants
  const variants = {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1, 
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 25 
      } 
    },
    exit: { 
      opacity: 0, 
      scale: 0.8,
      y: -20,
      transition: { 
        duration: 0.4,
        ease: "easeInOut"
      } 
    },
    completed: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    },
    deleted: {
      x: [0, 10, -10, 0],
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
      {/* Indicateurs de glissement en arrière-plan */}
      <div className="absolute inset-0 flex items-center justify-between px-6 rounded-xl">
        {/* Indicateur gauche - Terminé */}
        <motion.div 
          className="flex items-center text-white"
          style={{ opacity: leftOpacity, scale: leftScale }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="font-medium">Terminé</span>
          </div>
        </motion.div>
        
        {/* Indicateur droite - Supprimer */}
        <motion.div 
          className="flex items-center text-white"
          style={{ opacity: rightOpacity, scale: rightScale }}
        >
          <div className="flex items-center space-x-2">
            <span className="font-medium">Supprimer</span>
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
          backgroundColor: isDragging ? backgroundColor : '#1C3B46'
        }}
        drag="x"
        dragConstraints={{ left: -200, right: 200 }}
        dragElastic={0.2}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onClick={() => !isDragging && onView(task)}
        className={`relative rounded-xl p-4 cursor-pointer transition-all duration-200 ${
          task.completed ? 'opacity-75' : ''
        }`}
        whileHover={!isDragging ? { y: -2, boxShadow: '0 5px 15px rgba(0,0,0,0.1)' } : {}}
        whileTap={!isDragging ? { scale: 0.98 } : {}}
      >
        <div className="flex items-start">
          <motion.span 
            className="mr-3 text-lg"
            animate={task.completed ? { scale: [1, 1.3, 1] } : {}}
            transition={{ duration: 0.3 }}
          >
            {task.completed ? '✅' : priorityData.bullet}
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
        
        {/* Indicateur de glissement actif */}
        {isDragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute top-2 right-2 text-white/50 text-xs"
          >
            ← Terminé | Supprimer →
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Task; 