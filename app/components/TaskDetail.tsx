'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Task } from '../hooks/useTasks';

interface TaskDetailProps {
  task: Task;
  onClose: () => void;
  onEdit: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({ task, onClose, onEdit }) => {
  // Obtenir la couleur de priorité
  const getPriorityColor = () => {
    switch(task.priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-orange-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };
  
  // Obtenir le libellé de priorité
  const getPriorityLabel = () => {
    switch(task.priority) {
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Basse';
      default: return 'Non définie';
    }
  };
  
  // Formater la date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gray-900 text-white z-50 flex flex-col"
    >
      {/* Header */}
      <header className="flex items-center p-4">
        <button onClick={onClose} className="text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div className="flex-grow"></div>
        <button onClick={onEdit} className="text-white">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        </button>
      </header>

      {/* Contenu */}
      <div className="p-6 flex-grow flex flex-col">
        <h1 className="text-2xl font-bold mb-6">{task.title}</h1>
        
        <div className="mb-6">
          <h2 className="text-lg mb-2">Description :</h2>
          <div className="bg-white bg-opacity-10 rounded-lg p-4">
            <p className="text-sm">{task.description || 'Aucune description'}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg mb-2">À faire pour le :</h2>
          <div className="bg-white bg-opacity-5 rounded-lg p-3 inline-block">
            <p>{task.dueDate ? formatDate(task.dueDate) : 'Non défini'}</p>
          </div>
        </div>
        
        <div>
          <h2 className="text-lg mb-2">Priorité :</h2>
          <div className="flex items-center">
            <div className={`w-4 h-4 ${getPriorityColor()} rounded-full mr-2`}></div>
            <div className="bg-white bg-opacity-5 rounded-lg px-4 py-2">
              {getPriorityLabel()}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-blue-400 py-4 flex justify-around">
        <button className="text-white p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <button className="text-white p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
        <button className="text-white p-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

export default TaskDetail; 