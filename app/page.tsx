'use client';

import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useTasks, Task as TaskType } from './hooks/useTasks';
import { useWeather } from './hooks/useWeather';
import { useNotifications } from './hooks/useNotifications';
import { getGreeting, getProductivityMessage } from './utils/greeting';

import Task from './components/Task';
import TaskForm from './components/TaskForm';
import WeatherWidget from './components/WeatherWidget';
import FocusMode from './components/FocusMode';
import DynamicIsland from './components/DynamicIsland';

export default function Home() {
  // États locaux
  const [userName, setUserName] = useState('');
  const [showUserNameInput, setShowUserNameInput] = useState(false);
  const [showAddTaskForm, setShowAddTaskForm] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const [focusTimeRemaining, setFocusTimeRemaining] = useState<number | null>(null);

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
      taskData.dueDate
    );
    setShowAddTaskForm(false);
  };

  // Gérer la modification d'une tâche
  const handleUpdateTask = async (taskData: Partial<TaskType>) => {
    if (taskData.id) {
      await updateTask(taskData.id, {
        title: taskData.title,
        priority: taskData.priority,
        dueDate: taskData.dueDate,
      });
      setEditingTask(null);
    }
  };

  // Gérer la définition d'une tâche active
  const handleSetActiveTask = (task: TaskType) => {
    setActiveTask(task);
  };

  return (
    <main className="min-h-screen px-4 pb-20">
      {/* Dynamic Island */}
      <DynamicIsland 
        activeTask={activeTask} 
        isFocusMode={isFocusMode} 
        focusTimeRemaining={focusTimeRemaining}
        onOpenFocus={() => setIsFocusMode(true)}
      />
      
      {/* Mode Focus */}
      <AnimatePresence>
        {isFocusMode && (
          <FocusMode 
            onClose={() => setIsFocusMode(false)} 
          />
        )}
      </AnimatePresence>
      
      {/* Formulaire du nom d'utilisateur */}
      <AnimatePresence>
        {showUserNameInput && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-lg z-50"
          >
            <div className="ios-card w-full max-w-sm p-6">
              <h2 className="text-xl font-semibold mb-4">Bienvenue !</h2>
              <p className="mb-4">Comment souhaitez-vous être appelé ?</p>
              
              <input
                type="text"
                className="ios-input w-full mb-4"
                placeholder="Votre nom"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                autoFocus
              />
              
              <button
                onClick={() => handleSaveUserName(userName)}
                className="bg-apple-blue text-white py-2 px-4 rounded-lg font-medium w-full"
              >
                Continuer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="max-w-md mx-auto pt-12">
        {/* En-tête avec message de bienvenue */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">
            {getGreeting(userName)}
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            {getProductivityMessage()}
          </p>
        </div>
        
        {/* Widget météo */}
        <div className="mb-8">
          <WeatherWidget
            weather={weather}
            loading={weatherLoading}
            error={weatherError}
            onRefresh={refreshWeather}
          />
        </div>
        
        {/* Liste des tâches */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Mes tâches</h2>
            
            <div className="flex space-x-2">
              <button
                onClick={() => setIsFocusMode(true)}
                className="text-apple-blue p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Mode focus"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </button>
              
              <button
                onClick={() => {
                  if (!notificationsPermissionGranted) {
                    requestNotificationsPermission();
                  }
                }}
                className="text-apple-blue p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="Activer les notifications"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                </svg>
              </button>
            </div>
          </div>
          
          {tasksLoading ? (
            <div className="ios-card p-6 text-center">
              <div className="animate-pulse">Chargement...</div>
            </div>
          ) : tasksError ? (
            <div className="ios-card p-6 text-center text-apple-red">
              {tasksError}
            </div>
          ) : tasks.length === 0 ? (
            <div className="ios-card p-6 text-center text-gray-500 dark:text-gray-400">
              <p>Vous n'avez pas encore de tâches.</p>
              <p className="mt-2">Ajoutez-en une !</p>
            </div>
          ) : (
            <AnimatePresence>
              {tasks.map(task => (
                <Task
                  key={task.id}
                  task={task}
                  onToggle={toggleTaskCompletion}
                  onDelete={deleteTask}
                  onEdit={(id) => {
                    const taskToEdit = tasks.find(t => t.id === id);
                    if (taskToEdit) setEditingTask(taskToEdit);
                  }}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
        
        {/* Formulaire d'ajout/édition de tâche */}
        <AnimatePresence>
          {(showAddTaskForm || editingTask) && (
            <TaskForm
              onSubmit={editingTask ? handleUpdateTask : handleAddTask}
              onCancel={() => {
                setShowAddTaskForm(false);
                setEditingTask(null);
              }}
              initialTask={editingTask || {}}
              isEditing={!!editingTask}
            />
          )}
        </AnimatePresence>
        
        {/* Bouton d'ajout de tâche */}
        {!showAddTaskForm && !editingTask && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddTaskForm(true)}
            className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-apple-blue text-white flex items-center justify-center shadow-lg"
            aria-label="Ajouter une tâche"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </motion.button>
        )}
      </div>
    </main>
  );
} 