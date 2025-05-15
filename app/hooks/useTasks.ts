import { useState, useEffect } from 'react';
import localforage from 'localforage';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  dueDate?: string;
  createdAt: string;
}

const TASKS_STORAGE_KEY = 'todoTasks';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les tâches depuis le stockage local au chargement
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        const storedTasks = await localforage.getItem<Task[]>(TASKS_STORAGE_KEY);
        setTasks(storedTasks || []);
      } catch (err) {
        setError('Erreur lors du chargement des tâches');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTasks();
  }, []);

  // Sauvegarder les tâches dans le stockage local à chaque changement
  useEffect(() => {
    if (!loading) {
      localforage.setItem(TASKS_STORAGE_KEY, tasks)
        .catch(err => {
          setError('Erreur lors de la sauvegarde des tâches');
          console.error(err);
        });
    }
  }, [tasks, loading]);

  // Ajouter une nouvelle tâche
  const addTask = async (title: string, priority: Task['priority'] = 'medium', dueDate?: string) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      priority,
      dueDate,
      createdAt: new Date().toISOString(),
    };

    setTasks(prevTasks => [...prevTasks, newTask]);
    return newTask;
  };

  // Mettre à jour une tâche existante
  const updateTask = async (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, ...updates } : task
      )
    );
  };

  // Supprimer une tâche
  const deleteTask = async (id: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };

  // Marquer une tâche comme complétée/non complétée
  const toggleTaskCompletion = async (id: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  return {
    tasks,
    loading,
    error,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
  };
}; 