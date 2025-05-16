'use client';

import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { Task as TaskType } from '../hooks/useTasks';

interface TaskProps {
  task: TaskType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const Task: React.FC<TaskProps> = ({ task, onToggle, onDelete, onEdit }) => {
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);

  // Styles et couleurs selon la priorité
  const getPriorityData = () => {
    switch (task.priority) {
      case 'high':
        return {
          borderClass: 'task-priority-high',
          gradientClass: 'from-apple-red to-apple-pink',
          icon: '🔴',
          label: 'Priorité haute'
        };
      case 'medium':
        return {
          borderClass: 'task-priority-medium',
          gradientClass: 'from-apple-blue to-apple-teal',
          icon: '🔵',
          label: 'Priorité moyenne'
        };
      case 'low':
        return {
          borderClass: 'task-priority-low',
          gradientClass: 'from-apple-green to-apple-teal',
          icon: '🟢',
          label: 'Priorité basse'
        };
      default:
        return {
          borderClass: '',
          gradientClass: 'from-apple-gray to-apple-blue',
          icon: '⚪',
          label: 'Non définie'
        };
    }
  };

  const priorityData = getPriorityData();

  // Animation variants avec Framer Motion
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
    exit: { opacity: 0, x: -100, scale: 0.9, transition: { duration: 0.2 } },
    check: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.3, ease: 'easeInOut' }
    },
    hover: {
      y: -2,
      boxShadow: '0 5px 15px rgba(0,0,0,0.1)'
    },
    tap: {
      y: 0,
      scale: 0.98
    }
  };

  // Format de date lisible
  const formatDueDate = (dateString?: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    // Si c'est aujourd'hui
    if (date.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    }
    
    // Si c'est demain
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Demain";
    }
    
    // Différence en jours
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `En retard de ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`;
    }
    
    if (diffDays <= 7) {
      const options: Intl.DateTimeFormatOptions = { weekday: 'long' };
      return date.toLocaleDateString('fr-FR', options);
    }
    
    // Plus d'une semaine
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  // Formater l'heure si présente
  const formatTime = (dateString?: string) => {
    if (!dateString) return null;
    
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  const dueDateText = formatDueDate(task.dueDate);
  const dueTimeText = formatTime(task.dueDate);
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      whileHover="hover"
      whileTap="tap"
      layout
      className={`ios-card mb-4 overflow-hidden ${priorityData.borderClass} ${task.completed ? 'opacity-70' : ''}`}
    >
      <div className="flex items-center gap-3">
        <motion.button
          whileTap="check"
          variants={variants}
          onClick={() => onToggle(task.id)}
          className={`w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all duration-300
            ${task.completed 
              ? 'bg-gradient-to-br from-apple-blue to-apple-teal border-0' 
              : 'border-2 border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-black/20'}`}
          aria-label={task.completed ? "Marquer comme non terminée" : "Marquer comme terminée"}
        >
          {task.completed && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </motion.button>
        
        <div className="flex-grow py-1">
          <h3 className={`font-medium text-base ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-900 dark:text-white'}`}>
            {task.title}
          </h3>
          
          {task.dueDate && (
            <div className="flex items-center gap-2 mt-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" 
                className={`h-3.5 w-3.5 ${isOverdue ? 'text-apple-red' : 'text-gray-500 dark:text-gray-400'}`} 
                viewBox="0 0 20 20" 
                fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span className={`text-xs ${isOverdue ? 'font-medium text-apple-red' : 'text-gray-500 dark:text-gray-400'}`}>
                {dueDateText}
                {dueTimeText && <span> à {dueTimeText}</span>}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onEdit(task.id)}
            className="text-apple-blue p-2 rounded-full bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-colors"
            aria-label="Modifier la tâche"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onDelete(task.id)}
            className="text-apple-red p-2 rounded-full bg-gray-100/50 dark:bg-gray-800/50 hover:bg-gray-200/70 dark:hover:bg-gray-700/70 transition-colors"
            aria-label="Supprimer la tâche"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </motion.button>
        </div>
      </div>
      
      {/* Badge de priorité */}
      <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
        <div className={`text-xs bg-gradient-to-br ${priorityData.gradientClass} text-white px-2 py-0.5 rounded-full opacity-70`}>
          {priorityData.icon}
        </div>
      </div>
    </motion.div>
  );
};

export default Task; 