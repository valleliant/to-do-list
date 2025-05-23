'use client';

import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { Task as TaskType } from '../hooks/useTasks';

interface CompletedTasksMenuProps {
  isOpen: boolean;
  onClose: () => void;
  completedTasks: TaskType[];
  onRestoreTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}

const CompletedTasksMenu: React.FC<CompletedTasksMenuProps> = ({
  isOpen,
  onClose,
  completedTasks,
  onRestoreTask,
  onDeleteTask
}) => {
  // Format de date lisible
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Grouper les tâches terminées par date de création
  const groupCompletedTasksByDate = () => {
    const groups: Record<string, TaskType[]> = {};
    
    completedTasks.forEach(task => {
      const createdDate = new Date(task.createdAt);
      const dateKey = createdDate.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(task);
    });
    
    // Trier par date (plus récent en premier)
    const sortedEntries = Object.entries(groups).sort(([dateA], [dateB]) => {
      const [dayA, monthA, yearA] = dateA.split(' ');
      const [dayB, monthB, yearB] = dateB.split(' ');
      const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
      
      const dateObjA = new Date(parseInt(yearA), months.indexOf(monthA), parseInt(dayA));
      const dateObjB = new Date(parseInt(yearB), months.indexOf(monthB), parseInt(dayB));
      
      return dateObjB.getTime() - dateObjA.getTime();
    });
    
    return sortedEntries;
  };

  const groupedTasks = groupCompletedTasksByDate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />
          
          {/* Menu */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-[#4B9BC3] z-50 overflow-y-auto"
          >
            {/* En-tête */}
            <div className="sticky top-0 bg-[#4B9BC3] border-b border-white/20 p-4 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Tâches terminées</h2>
                <p className="text-white/70 text-sm">
                  {completedTasks.length} tâche{completedTasks.length > 1 ? 's' : ''} terminée{completedTasks.length > 1 ? 's' : ''}
                </p>
              </div>
              
              <motion.button
                onClick={onClose}
                className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white"
                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.3)' }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Contenu */}
            <div className="p-4">
              {completedTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">Aucune tâche terminée</h3>
                  <p className="text-white/70 text-sm">
                    Les tâches que vous marquerez comme terminées apparaîtront ici.
                  </p>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {groupedTasks.map(([dateStr, tasks], groupIndex) => (
                    <motion.div
                      key={dateStr}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: groupIndex * 0.1 }}
                    >
                      {/* Séparateur avec date */}
                      <div className="flex items-center mb-4">
                        <div className="flex-grow h-px bg-white/20"></div>
                        <div className="px-4 text-sm font-medium text-white">{dateStr}</div>
                        <div className="flex-grow h-px bg-white/20"></div>
                      </div>
                      
                      {/* Tâches du groupe */}
                      <div className="space-y-3">
                        {tasks.map((task, taskIndex) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (groupIndex * 0.1) + (taskIndex * 0.05) }}
                            className="bg-[#1C3B46] rounded-xl p-4 relative group"
                          >
                            <div className="flex items-start">
                              <div className="mr-3 w-6 h-6 flex items-center justify-center">
                                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              </div>
                              
                              <div className="flex-grow">
                                <h3 className="font-medium text-base text-white/90 line-through">
                                  {task.title}
                                </h3>
                                
                                {task.description && (
                                  <p className="text-xs text-white/60 mt-1 line-through">
                                    {task.description.substring(0, 80)}{task.description.length > 80 ? '...' : ''}
                                  </p>
                                )}
                                
                                <div className="flex items-center mt-2 space-x-4">
                                  {task.dueDate && (
                                    <p className="text-xs text-white/50">
                                      Échéance: {formatDate(task.dueDate)}
                                    </p>
                                  )}
                                  
                                  <p className="text-xs text-white/50">
                                    Terminé: {formatDate(task.createdAt)}
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Actions au survol */}
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {/* Restaurer */}
                              <motion.button
                                onClick={() => onRestoreTask(task.id)}
                                className="w-8 h-8 bg-green-500/80 rounded-full flex items-center justify-center text-white text-xs"
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(34, 197, 94, 1)' }}
                                whileTap={{ scale: 0.9 }}
                                title="Restaurer la tâche"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                              </motion.button>
                              
                              {/* Supprimer définitivement */}
                              <motion.button
                                onClick={() => onDeleteTask(task.id)}
                                className="w-8 h-8 bg-red-500/80 rounded-full flex items-center justify-center text-white text-xs"
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(239, 68, 68, 1)' }}
                                whileTap={{ scale: 0.9 }}
                                title="Supprimer définitivement"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </motion.button>
                            </motion.div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CompletedTasksMenu; 