'use client';

import { motion } from 'framer-motion';
import React, { useState, useEffect } from 'react';
import { Task } from '../hooks/useTasks';

interface TaskFormProps {
  onSubmit: (task: Partial<Task>) => void;
  onCancel: () => void;
  initialTask?: Partial<Task>;
  isEditing?: boolean;
}

const TaskForm: React.FC<TaskFormProps> = ({ 
  onSubmit, 
  onCancel, 
  initialTask = {}, 
  isEditing = false 
}) => {
  const [title, setTitle] = useState(initialTask.title || '');
  const [description, setDescription] = useState(initialTask.description || '');
  const [priority, setPriority] = useState<Task['priority']>(initialTask.priority || 'medium');
  const [dueDate, setDueDate] = useState(initialTask.dueDate || '');
  const [titleError, setTitleError] = useState('');

  // Animation variants avec Framer Motion
  const variants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30
      }
    },
    exit: { 
      opacity: 0, 
      y: 50,
      transition: {
        duration: 0.2
      }
    }
  };

  // Validation du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation du titre
    if (!title.trim()) {
      setTitleError('Le titre est requis');
      return;
    }
    
    onSubmit({
      id: initialTask.id,
      title,
      description,
      priority,
      dueDate: dueDate || undefined,
    });
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={variants}
      className="bg-slate-50 rounded-xl p-6 shadow-lg w-full max-w-md"
    >
      <form onSubmit={handleSubmit}>
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          {isEditing ? 'Modifier la tâche' : 'Nouvelle tâche'}
        </h2>
        
        <div className="mb-4">
          <label htmlFor="title" className="block text-sm font-medium mb-1 text-gray-700">
            Titre
          </label>
          <input
            type="text"
            id="title"
            className={`w-full p-2 rounded-lg border ${titleError ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-1 focus:ring-blue-500`}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (e.target.value.trim()) setTitleError('');
            }}
            placeholder="Que faut-il faire ?"
            autoFocus
          />
          {titleError && (
            <p className="text-red-500 text-xs mt-1">{titleError}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium mb-1 text-gray-700">
            Description
          </label>
          <textarea
            id="description"
            className="w-full p-2 rounded-lg border border-gray-300 min-h-[80px] focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Détails supplémentaires..."
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="priority" className="block text-sm font-medium mb-1 text-gray-700">
            Priorité
          </label>
          <div className="flex space-x-2">
            {(['low', 'medium', 'high'] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPriority(p)}
                className={`flex-1 py-1 px-2 rounded-lg text-sm font-medium border ${
                  priority === p 
                    ? p === 'high' 
                      ? 'bg-red-500 text-white border-red-500' 
                      : p === 'medium'
                        ? 'bg-orange-500 text-white border-orange-500'
                        : 'bg-green-500 text-white border-green-500'
                    : 'bg-white text-gray-700 border-gray-300'
                }`}
              >
                {p === 'low' ? 'Basse' : p === 'medium' ? 'Moyenne' : 'Haute'}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-6">
          <label htmlFor="dueDate" className="block text-sm font-medium mb-1 text-gray-700">
            Échéance (optionnelle)
          </label>
          <input
            type="date"
            id="dueDate"
            className="w-full p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded-lg font-medium"
          >
            {isEditing ? 'Mettre à jour' : 'Ajouter'}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default TaskForm; 