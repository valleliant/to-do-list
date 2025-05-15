'use client';

import { motion } from 'framer-motion';
import React from 'react';
import { Task as TaskType } from '../hooks/useTasks';

interface TaskProps {
  task: TaskType;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

const Task: React.FC<TaskProps> = ({ task, onToggle, onDelete, onEdit }) => {
  // Styles conditionnels selon la priorité
  const getPriorityStyles = () => {
    switch (task.priority) {
      case 'high':
        return 'border-l-4 border-apple-red';
      case 'medium':
        return 'border-l-4 border-apple-blue';
      case 'low':
        return 'border-l-4 border-apple-green';
      default:
        return '';
    }
  };

  // Animation variants avec Framer Motion
  const variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.2 } },
    check: {
      scale: [1, 1.2, 1],
      transition: { duration: 0.2 }
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
    
    // Sinon, format standard
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short'
    });
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      layout
      className={`ios-card mb-3 ${getPriorityStyles()} ${task.completed ? 'opacity-60' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-grow">
          <motion.button
            whileTap="check"
            variants={variants}
            onClick={() => onToggle(task.id)}
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center 
              ${task.completed 
                ? 'bg-apple-blue border-apple-blue' 
                : 'border-gray-300 dark:border-gray-600'}`}
            aria-label={task.completed ? "Marquer comme non terminée" : "Marquer comme terminée"}
          >
            {task.completed && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </motion.button>
          
          <div className="flex-grow">
            <p className={`font-medium ${task.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
              {task.title}
            </p>
            {task.dueDate && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formatDueDate(task.dueDate)}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(task.id)}
            className="text-apple-blue p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Modifier la tâche"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          
          <button
            onClick={() => onDelete(task.id)}
            className="text-apple-red p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Supprimer la tâche"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Task; 