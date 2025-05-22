'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTasks, Task as TaskType } from './hooks/useTasks';
import { useWeather } from './hooks/useWeather';
import { useNotifications } from './hooks/useNotifications';
import { getGreeting } from './utils/greeting';

import Task from './components/Task';
import TaskDetail from './components/TaskDetail';
import TaskForm from './components/TaskForm';
import WeatherWidget from './components/WeatherWidget';
import FocusMode from './components/FocusMode';

export default function Home() {
  // États locaux
  const [userName, setUserName] = useState('Thibaud');
  const [showUserNameInput, setShowUserNameInput] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [viewingTask, setViewingTask] = useState<TaskType | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Hooks personnalisés
  const { 
    tasks, 
    loading: tasksLoading, 
    error: tasksError, 
    addTask, 
    updateTask, 
    deleteTask,
    toggleTaskCompletion 
  } = useTasks();
  
  const { 
    weather, 
    loading: weatherLoading, 
    error: weatherError, 
    refreshWeather 
  } = useWeather();
  
  const { 
    permissionGranted: notificationsPermissionGranted,
    requestPermission: requestNotificationsPermission
  } = useNotifications();

  // Format de date pour l'affichage
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Format simplifié pour les séparateurs
  const formatSimpleDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Charger le nom d'utilisateur depuis le stockage local au démarrage
  useEffect(() => {
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      setShowUserNameInput(true);
    }
  }, []);

  // Gérer la sauvegarde du nom d'utilisateur
  const handleSaveUserName = (name: string) => {
    setUserName(name);
    localStorage.setItem('userName', name);
    setShowUserNameInput(false);
  };

  // Gérer l'ajout d'une tâche
  const handleAddTask = async (taskData: Partial<TaskType>) => {
    await addTask(
      taskData.title || '',
      taskData.priority || 'medium',
      taskData.dueDate,
      taskData.description
    );
    setShowAddTaskForm(false);
  };

  // Gérer la modification d'une tâche
  const handleUpdateTask = async (taskData: Partial<TaskType>) => {
    if (taskData.id) {
      await updateTask(taskData.id, {
        title: taskData.title,
        description: taskData.description,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
      });
      setViewingTask(null);
    }
  };

  // Grouper les tâches par date
  const groupTasksByDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const taskGroups: Record<string, TaskType[]> = {};
    
    tasks.forEach(task => {
      let groupDate = 'Sans date';
      
      if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        
        // Formatter comme "18 mai 2025"
        groupDate = formatSimpleDate(dueDate);
      }
      
      if (!taskGroups[groupDate]) {
        taskGroups[groupDate] = [];
      }
      
      taskGroups[groupDate].push(task);
    });
    
    return taskGroups;
  };

  // Trier les dates des groupes
  const getSortedDateGroups = () => {
    const groups = groupTasksByDate();
    const today = new Date().setHours(0, 0, 0, 0);
    
    // Transformer les clés de date en objets Date pour le tri
    const dateEntries = Object.entries(groups).map(([dateStr, tasks]) => {
      if (dateStr === 'Sans date') {
        return { dateStr, date: new Date(8640000000000000), tasks }; // Date max pour "Sans date"
      }
      
      const dateParts = dateStr.split(' ');
      const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
      const day = parseInt(dateParts[0]);
      const month = months.indexOf(dateParts[1]);
      const year = parseInt(dateParts[2]);
      
      return { 
        dateStr, 
        date: new Date(year, month, day), 
        tasks 
      };
    });
    
    // Trier par date (de la plus proche à la plus lointaine)
    dateEntries.sort((a, b) => a.date.getTime() - b.date.getTime());
    
    return dateEntries;
  };

  const sortedDateGroups = getSortedDateGroups();

  return (
    <main className="min-h-screen bg-[#4B9BC3] text-white overflow-y-auto pb-24">
      {/* Formulaire du nom d'utilisateur */}
      <AnimatePresence>
        {showUserNameInput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-lg z-50"
          >
            <div className="bg-white w-full max-w-sm p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Bienvenue !</h2>
              <p className="mb-4 text-gray-600">Comment souhaitez-vous être appelé ?</p>
              
              <input
                type="text"
                className="w-full mb-4 p-3 border border-gray-300 rounded-lg"
                placeholder="Votre nom"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                autoFocus
              />
              
              <button
                onClick={() => handleSaveUserName(userName)}
                className="w-full bg-[#4B9BC3] text-white py-3 rounded-lg font-medium"
              >
                Continuer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Détail d'une tâche */}
      <AnimatePresence>
        {viewingTask && (
          <TaskDetail 
            task={viewingTask} 
            onClose={() => setViewingTask(null)} 
            onEdit={handleUpdateTask}
            onDelete={(id) => {
              deleteTask(id);
              setViewingTask(null);
            }}
          />
        )}
      </AnimatePresence>
      
      {/* Formulaire d'ajout de tâche */}
      <AnimatePresence>
        {showAddTaskForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4"
          >
            <TaskForm
              onSubmit={handleAddTask}
              onCancel={() => setShowAddTaskForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Mode Focus */}
      <AnimatePresence>
        {isFocusMode && (
          <FocusMode 
            onClose={() => setIsFocusMode(false)} 
          />
        )}
      </AnimatePresence>
      
      <div className="max-w-md mx-auto pt-12 px-4 pb-32 overflow-y-auto">
        {/* En-tête avec message de bienvenue */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold mb-3">
            {getGreeting(userName)}
          </h1>
          
          {/* Widget météo simplifié comme dans la maquette */}
          <div className="inline-block bg-black/20 backdrop-blur-sm rounded-full px-4 py-1 text-sm">
            {weather ? (
              <div className="flex items-center">
                <span>Fribourg</span>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-11.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 5.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                  </svg>
                  {weather.temperature.toFixed(0)}°
                </span>
              </div>
            ) : (
              <span>Chargement...</span>
            )}
          </div>
        </motion.div>
        
        {/* Liste des tâches */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {tasksLoading ? (
            <div className="text-center py-8">
              <div className="animate-pulse">Chargement...</div>
            </div>
          ) : tasksError ? (
            <div className="text-center py-8 text-red-400">
              {tasksError}
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-white/80">Vous n'avez pas encore de tâches</p>
              <p className="text-sm text-white/60 mt-1">Ajoutez votre première tâche en appuyant sur +</p>
            </div>
          ) : (
            <AnimatePresence>
              {sortedDateGroups.map(({ dateStr, tasks }) => (
                <div key={dateStr}>
                  {/* Séparateur avec date */}
                  <div className="flex items-center my-6">
                    <div className="flex-grow h-px bg-white/20"></div>
                    <div className="px-4 text-sm font-medium">{dateStr}</div>
                    <div className="flex-grow h-px bg-white/20"></div>
                  </div>
                  
                  {tasks.map(task => (
                    <Task
                      key={task.id}
                      task={task}
                      onToggle={toggleTaskCompletion}
                      onDelete={deleteTask}
                      onEdit={(id) => {
                        const taskToView = tasks.find(t => t.id === id);
                        if (taskToView) setViewingTask(taskToView);
                      }}
                      onView={(task) => setViewingTask(task)}
                    />
                  ))}
                </div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      </div>
      
      {/* Bouton d'ajout de tâche */}
      <motion.button
        onClick={() => setShowAddTaskForm(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-white text-blue-500 rounded-full shadow-lg flex items-center justify-center text-3xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        +
      </motion.button>
      
      {/* Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#4B9BC3] py-4 px-4 flex justify-around border-t border-white/20">
        <button className="text-white p-2 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
        <button className="text-white p-2 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
        <button className="text-white p-2 flex flex-col items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>
    </main>
  );
} 