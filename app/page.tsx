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
import NotificationStatus from './components/NotificationStatus';
import CompletedTasksMenu from './components/CompletedTasksMenu';
import SwipeHint from './components/SwipeHint';

export default function Home() {
  // États locaux
  const [userName, setUserName] = useState('');
  const [showUserNameInput, setShowUserNameInput] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [viewingTask, setViewingTask] = useState<TaskType | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [showCompletedTasks, setShowCompletedTasks] = useState(false);
  const [showSwipeHint, setShowSwipeHint] = useState(false);
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
    refreshWeather,
    refreshLocation
  } = useWeather();
  
  const { 
    permissionGranted,
    canUseNotifications,
    scheduleTaskReminders,
    cancelTaskReminders,
    updateTaskNotifications,
    sendNotification,
    requestPermission
  } = useNotifications();

  // Filtrer les tâches actives et terminées
  const activeTasks = tasks.filter(task => !task.completed);
  const completedTasks = tasks.filter(task => task.completed);

  // Synchroniser les notifications avec les tâches
  useEffect(() => {
    if (permissionGranted && tasks.length > 0) {
      updateTaskNotifications(tasks);
    }
  }, [tasks, permissionGranted, updateTaskNotifications]);

  // Vérifier si on doit afficher l'aide au glissement
  useEffect(() => {
    const hasSeenSwipeHint = localStorage.getItem('hasSeenSwipeHint');
    if (!hasSeenSwipeHint && activeTasks.length > 0) {
      setShowSwipeHint(true);
    }
  }, [activeTasks.length]);

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
    const newTask = await addTask(
      taskData.title || '',
      taskData.priority || 'medium',
      taskData.dueDate,
      taskData.description
    );
    setShowAddTaskForm(false);
    
    // Notification immédiate de confirmation pour chaque nouvelle tâche
    if (newTask && canUseNotifications) {
      const priorityEmoji = newTask.priority === 'high' ? '🔴' : newTask.priority === 'medium' ? '🟡' : '🟢';
      await sendNotification(
        '✅ Nouvelle tâche créée !', 
        `${priorityEmoji} ${newTask.title}`, 
        { tag: 'task-created' }
      );
    }
    
    // Programmer les rappels pour la nouvelle tâche si elle a une date d'échéance
    if (newTask && newTask.dueDate) {
      await scheduleTaskReminders(newTask);
    }
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
      
      // Reprogrammer les rappels si la tâche a été modifiée
      const updatedTask = tasks.find(t => t.id === taskData.id);
      if (updatedTask && !updatedTask.completed && updatedTask.dueDate) {
        await scheduleTaskReminders({ ...updatedTask, ...taskData } as TaskType);
      }
      
      setViewingTask(null);
    }
  };

  // Gérer la suppression d'une tâche
  const handleDeleteTask = async (id: string) => {
    // Annuler les rappels pour cette tâche
    cancelTaskReminders(id);
    await deleteTask(id);
  };

  // Gérer le basculement de completion d'une tâche
  const handleToggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      if (!task.completed) {
        // Si on marque la tâche comme terminée, annuler les rappels
        cancelTaskReminders(id);
        
        // Notification de félicitations
        if (canUseNotifications) {
          await sendNotification(
            '🎉 Tâche terminée !', 
            `Bravo ! "${task.title}" est maintenant terminée.`, 
            { tag: 'task-completed' }
          );
        }
      }
    }
    
    await toggleTaskCompletion(id);
  };

  // Gérer la restauration d'une tâche terminée
  const handleRestoreTask = async (id: string) => {
    await toggleTaskCompletion(id);
    
    // Reprogrammer les rappels si la tâche a une date d'échéance
    const restoredTask = tasks.find(t => t.id === id);
    if (restoredTask && restoredTask.dueDate) {
      await scheduleTaskReminders(restoredTask);
    }
  };

  // Grouper les tâches actives par date
  const groupTasksByDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const taskGroups: Record<string, TaskType[]> = {};
    
    activeTasks.forEach(task => {
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

  // Gérer la fermeture de l'aide au glissement
  const handleDismissSwipeHint = () => {
    setShowSwipeHint(false);
    localStorage.setItem('hasSeenSwipeHint', 'true');
  };

  return (
    <main className="min-h-screen bg-[#4B9BC3] text-white overflow-y-auto pb-6 flex flex-col">
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
                className="w-full mb-4 p-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500"
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
      
      {/* Menu des tâches terminées */}
      <CompletedTasksMenu
        isOpen={showCompletedTasks}
        onClose={() => setShowCompletedTasks(false)}
        completedTasks={completedTasks}
        onRestoreTask={handleRestoreTask}
        onDeleteTask={handleDeleteTask}
      />
      
      {/* Détail d'une tâche */}
      <AnimatePresence>
        {viewingTask && (
          <TaskDetail 
            task={viewingTask} 
            onClose={() => setViewingTask(null)} 
            onEdit={handleUpdateTask}
            onDelete={(id) => {
              handleDeleteTask(id);
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
      
      {/* Aide au glissement */}
      <AnimatePresence>
        {showSwipeHint && (
          <SwipeHint
            isVisible={showSwipeHint}
            onDismiss={handleDismissSwipeHint}
          />
        )}
      </AnimatePresence>
      
      <div className="max-w-md mx-auto pt-12 px-4 pb-20 overflow-y-auto">
        {/* En-tête avec message de bienvenue */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-2xl font-bold">
              {getGreeting(userName)}
            </h1>
            
            {/* Bouton pour les tâches terminées */}
            <motion.button
              onClick={() => setShowCompletedTasks(true)}
              className={`backdrop-blur-sm rounded-full px-3 py-1 text-sm flex items-center space-x-2 transition-all ${
                completedTasks.length > 0 
                  ? 'bg-white/20 hover:bg-white/30' 
                  : 'bg-white/10 opacity-50 cursor-not-allowed'
              }`}
              whileHover={completedTasks.length > 0 ? { scale: 1.05 } : {}}
              whileTap={completedTasks.length > 0 ? { scale: 0.95 } : {}}
              disabled={completedTasks.length === 0}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>{completedTasks.length}</span>
            </motion.button>
          </div>
          
          {/* Widget météo simplifié comme dans la maquette */}
          <div className="inline-block bg-black/20 backdrop-blur-sm rounded-full px-4 py-1 text-sm">
            {weather ? (
              <div className="flex items-center">
                <span>{weather.location}</span>
                <button 
                  onClick={refreshLocation}
                  className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                  title="Rafraîchir la localisation"
                >
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <svg className="h-4 w-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7zm0-11.5c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 5.5c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1z"/>
                  </svg>
                  {weather.temperature.toFixed(0)}°
                </span>
              </div>
            ) : weatherLoading ? (
              <span>Localisation...</span>
            ) : weatherError ? (
              <div className="flex items-center">
                <span>Météo indisponible</span>
                <button 
                  onClick={refreshLocation}
                  className="ml-2 p-1 hover:bg-white/20 rounded-full transition-colors"
                  title="Réessayer la localisation"
                >
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              <span>Chargement...</span>
            )}
          </div>
        </motion.div>
        
        {/* État des notifications */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <NotificationStatus />
        </motion.div>
        
        {/* Liste des tâches actives */}
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
          ) : activeTasks.length === 0 ? (
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
                      onToggle={handleToggleTask}
                      onDelete={handleDeleteTask}
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
        className="fixed bottom-6 right-6 w-14 h-14 bg-white text-blue-500 rounded-full shadow-lg flex items-center justify-center text-3xl"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        +
      </motion.button>
    </main>
  );
} 