'use client';

import { motion } from 'framer-motion';
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
  const [isSwipeOpen, setIsSwipeOpen] = useState(false);

  // Styles et couleurs selon la priorité
  const getPriorityData = () => {
    switch (task.priority) {
      case 'high':
        return {
          color: 'bg-red-500',
          icon: '🔴',
          label: 'Haute'
        };
      case 'medium':
        return {
          color: 'bg-orange-500',
          icon: '🟠',
          label: 'Moyenne'
        };
      case 'low':
        return {
          color: 'bg-green-500',
          icon: '🟢',
          label: 'Basse'
        };
      default:
        return {
          color: 'bg-blue-500',
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
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric' 
    });
  };

  const dueDateText = formatDueDate(task.dueDate);

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      whileHover="hover"
      whileTap="tap"
      layout
      onClick={() => onView(task)}
      className="bg-white rounded-xl shadow-sm mb-3 p-3 cursor-pointer"
    >
      <div className="flex items-start">
        <div className={`w-2 h-2 ${priorityData.color} rounded-full mt-2 mr-2`} />
        
        <div className="flex-grow">
          <h3 className="font-medium text-base text-gray-800">
            {task.title}
          </h3>
          
          <p className="text-xs text-gray-500 mt-1">
            {task.description?.substring(0, 50)}{task.description && task.description.length > 50 ? '...' : ''}
          </p>
        </div>
        
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task.id);
          }}
          className="text-gray-400 p-1"
          aria-label="Options"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default Task; 