import { useState, useEffect } from 'react';
import { Task } from './useTasks';

// Clés VAPID pour les notifications push - À remplacer par vos propres clés en production
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || 'MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEzuUPet5D_gSyZgniz65YZjpxwQ-_gem6YWaUswV8eOuVybf8yvyEIxSu9e6xIf-JjwKwZgc2W-j3JIXSR50AKQ';

// Configuration des rappels selon la priorité
const REMINDER_INTERVALS = {
  high: 2 * 60 * 60 * 1000,   // 2 heures
  medium: 4 * 60 * 60 * 1000, // 4 heures  
  low: 8 * 60 * 60 * 1000     // 8 heures
};

// Heure du rappel matinal (8h00)
const MORNING_REMINDER_HOUR = 8;

interface ScheduledNotification {
  taskId: string;
  type: 'task_reminder' | 'morning_summary';
  scheduledTime: number;
  intervalId?: NodeJS.Timeout;
}

// Convertir la clé VAPID en Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [canUseNotifications, setCanUseNotifications] = useState(false);
  const [scheduledNotifications, setScheduledNotifications] = useState<ScheduledNotification[]>([]);

  // Vérifier si c'est iOS
  const checkIsIOS = () => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  };

  // Vérifier si l'app est en mode standalone
  const checkIsStandalone = () => {
    if (typeof window === 'undefined') return false;
    
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    const hasStandaloneDisplay = window.matchMedia('(display-mode: standalone)').matches ||
                                window.matchMedia('(display-mode: fullscreen)').matches ||
                                window.matchMedia('(display-mode: minimal-ui)').matches;
    
    return isStandaloneMode || isIOSStandalone || hasStandaloneDisplay;
  };

  // Initialiser les notifications
  useEffect(() => {
    const initializeNotifications = async () => {
      const isIOS = checkIsIOS();
      const isStandaloneApp = checkIsStandalone();
      
      // Logs de diagnostic temporaires
      console.log('🔍 Diagnostic notifications:');
      console.log('- iOS détecté:', isIOS);
      console.log('- Mode standalone:', isStandaloneApp);
      console.log('- User Agent:', navigator.userAgent);
      console.log('- Display mode standalone:', window.matchMedia('(display-mode: standalone)').matches);
      console.log('- iOS standalone:', (window.navigator as any).standalone);
      
      setIsIOSDevice(isIOS);
      setIsStandalone(isStandaloneApp);
      
      // Vérifier les APIs nécessaires
      if (!('Notification' in window)) {
        console.log('❌ API Notification non supportée');
        setError('Les notifications ne sont pas supportées par ce navigateur');
        setCanUseNotifications(false);
        return;
      }

      if (!('serviceWorker' in navigator)) {
        console.log('❌ Service Workers non supportés');
        setError('Les service workers ne sont pas supportés');
        setCanUseNotifications(false);
        return;
      }

      // Sur iOS, les notifications ne fonctionnent que si l'app est installée
      if (isIOS && !isStandaloneApp) {
        console.log('❌ iOS détecté mais app non installée - notifications désactivées');
        setCanUseNotifications(false);
        return;
      }

      console.log('✅ APIs supportées - activation des notifications');
      setCanUseNotifications(true);

      try {
        // Enregistrer le service worker
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('✅ Service Worker enregistré');

        // Vérifier le statut actuel des permissions
        const currentPermission = Notification.permission;
        console.log('📋 Permission actuelle:', currentPermission);
        
        if (currentPermission === 'granted') {
          setPermissionGranted(true);
          if (isIOS) {
            setSubscription({ endpoint: 'ios-local' } as any);
          } else {
            await createPushSubscription(registration);
          }
          setError(null);
        } else if (currentPermission === 'default') {
          // Ne pas demander automatiquement, laisser l'utilisateur décider
          console.log('⏳ Permission en attente - l\'utilisateur doit autoriser manuellement');
        } else {
          console.log('❌ Permission refusée');
          setError('Les notifications ont été refusées');
        }

        // Programmer le rappel matinal quotidien si les permissions sont accordées
        if (currentPermission === 'granted') {
          scheduleMorningReminder();
        }

      } catch (err) {
        console.error('❌ Erreur lors de l\'initialisation des notifications:', err);
        setError('Erreur lors de l\'initialisation des notifications');
      }
    };

    initializeNotifications();
  }, []);

  // Créer une souscription push (non-iOS)
  const createPushSubscription = async (registration: ServiceWorkerRegistration) => {
    try {
      if (!('PushManager' in window)) {
        throw new Error('Les notifications push ne sont pas supportées');
      }

      let pushSubscription = await registration.pushManager.getSubscription();

      if (!pushSubscription) {
        pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      setSubscription(pushSubscription);
      localStorage.setItem('pushSubscription', JSON.stringify(pushSubscription));
    } catch (err) {
      console.error('Erreur lors de la création de la souscription push:', err);
    }
  };

  // Demander la permission pour les notifications
  const requestPermission = async () => {
    try {
      console.log('🔔 Demande de permission notifications...');
      
      if (!canUseNotifications) {
        console.log('❌ Notifications non disponibles');
        return false;
      }

      if (!('Notification' in window)) {
        console.log('❌ API Notification non supportée');
        return false;
      }

      const permission = await Notification.requestPermission();
      console.log('📋 Résultat permission:', permission);
      
      setPermissionGranted(permission === 'granted');

      if (permission === 'granted') {
        if (isIOSDevice) {
          setSubscription({ endpoint: 'ios-local' } as any);
        } else {
          const registration = await navigator.serviceWorker.ready;
          await createPushSubscription(registration);
        }
        setError(null);
        
        // Programmer le rappel matinal maintenant que les permissions sont accordées
        scheduleMorningReminder();
      } else if (permission === 'denied') {
        setError('Les notifications ont été refusées');
      }

      return permission === 'granted';
    } catch (err) {
      console.error('❌ Erreur de permission:', err);
      setError('Erreur lors de la demande de permission');
      return false;
    }
  };

  // Envoyer une notification
  const sendNotification = async (title: string, body: string, data?: any) => {
    try {
      console.log('📤 Tentative d\'envoi de notification:', { 
        title, 
        body, 
        permissionGranted, 
        isIOSDevice,
        canUseNotifications,
        notificationPermission: Notification.permission 
      });
      
      if (!canUseNotifications) {
        console.log('❌ Notifications non disponibles');
        return false;
      }

      if (!('Notification' in window)) {
        console.log('❌ API Notification non supportée');
        return false;
      }

      if (Notification.permission !== 'granted') {
        console.log('❌ Permission non accordée, statut:', Notification.permission);
        return false;
      }

      const notificationData = {
        title,
        body,
        url: window.location.origin,
        ...data
      };

      if (isIOSDevice) {
        console.log('📱 Envoi notification iOS directe');
        // Notification directe pour iOS
        const notification = new Notification(title, {
          body,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-96x96.png',
          tag: data?.tag || 'general',
          requireInteraction: false,
          data: notificationData
        });

        notification.onclick = function(event) {
          event.preventDefault();
          window.focus();
          notification.close();
        };
        
        console.log('✅ Notification iOS créée');
      } else {
        console.log('🖥️ Envoi notification via Service Worker');
        // Via service worker pour autres plateformes
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          if (registration.active) {
            registration.active.postMessage({
              type: 'SIMULATE_PUSH',
              data: notificationData
            });
            console.log('✅ Message envoyé au Service Worker');
          } else {
            console.log('❌ Service Worker non actif');
            return false;
          }
        }
      }

      return true;
    } catch (err) {
      console.error('❌ Erreur lors de l\'envoi de la notification:', err);
      return false;
    }
  };

  // Programmer les rappels pour une tâche selon sa priorité
  const scheduleTaskReminders = async (task: Task) => {
    if (!permissionGranted || !task.dueDate) return;

    // Annuler les rappels existants pour cette tâche
    cancelTaskReminders(task.id);

    const now = new Date();
    const dueDate = new Date(task.dueDate);
    const timeUntilDue = dueDate.getTime() - now.getTime();

    // Ne pas programmer si la tâche est déjà échue
    if (timeUntilDue <= 0) return;

    const interval = REMINDER_INTERVALS[task.priority];
    const reminderTimes: number[] = [];

    // Calculer les moments de rappel selon la priorité
    let nextReminderTime = now.getTime() + interval;
    while (nextReminderTime < dueDate.getTime()) {
      reminderTimes.push(nextReminderTime);
      nextReminderTime += interval;
    }

    // Ajouter un rappel final 1 heure avant l'échéance
    const finalReminderTime = dueDate.getTime() - (60 * 60 * 1000);
    if (finalReminderTime > now.getTime()) {
      reminderTimes.push(finalReminderTime);
    }

    // Programmer tous les rappels
    reminderTimes.forEach((reminderTime, index) => {
      const timeUntilReminder = reminderTime - now.getTime();
      
      const timeoutId = setTimeout(async () => {
        const isLastReminder = index === reminderTimes.length - 1;
        const priorityEmoji = task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢';
        
        const title = isLastReminder ? '⏰ Rappel urgent !' : `${priorityEmoji} Rappel de tâche`;
        const body = isLastReminder 
          ? `Échéance dans 1 heure : ${task.title}`
          : `N'oubliez pas : ${task.title}`;

        await sendNotification(title, body, {
          tag: `task-${task.id}-${index}`,
          taskId: task.id
        });
      }, timeUntilReminder);

      // Stocker la notification programmée
      const scheduledNotif: ScheduledNotification = {
        taskId: task.id,
        type: 'task_reminder',
        scheduledTime: reminderTime,
        intervalId: timeoutId as NodeJS.Timeout
      };

      setScheduledNotifications(prev => [...prev, scheduledNotif]);
    });
  };

  // Annuler les rappels pour une tâche
  const cancelTaskReminders = (taskId: string) => {
    setScheduledNotifications(prev => {
      const notificationsToCancel = prev.filter(notif => notif.taskId === taskId);
      const remainingNotifications = prev.filter(notif => notif.taskId !== taskId);

      notificationsToCancel.forEach(notif => {
        if (notif.intervalId) {
          clearTimeout(notif.intervalId);
        }
      });

      return remainingNotifications;
    });
  };

  // Programmer le rappel matinal quotidien
  const scheduleMorningReminder = () => {
    const scheduleNextMorningReminder = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(MORNING_REMINDER_HOUR, 0, 0, 0);

      const timeUntilMorning = tomorrow.getTime() - now.getTime();

      setTimeout(async () => {
        // Récupérer les tâches depuis le localStorage
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
          const tasks: Task[] = JSON.parse(storedTasks);
          const incompleteTasks = tasks.filter(task => !task.completed);
          const taskCount = incompleteTasks.length;

          if (taskCount > 0) {
            const urgentTasks = incompleteTasks.filter(task => {
              if (!task.dueDate) return false;
              const dueDate = new Date(task.dueDate);
              const today = new Date();
              today.setHours(23, 59, 59, 999);
              return dueDate <= today;
            }).length;


            let title = '🌅 Bonjour !';
            let body = '';

            if (urgentTasks > 0) {
              body = `Vous avez ${taskCount} tâche${taskCount > 1 ? 's' : ''} à faire, dont ${urgentTasks} urgente${urgentTasks > 1 ? 's' : ''} !`;
            } else {
              body = `Vous avez ${taskCount} tâche${taskCount > 1 ? 's' : ''} à accomplir aujourd'hui.`;
            }

            await sendNotification(title, body, {
              tag: 'morning-reminder'
            });
          }
        }

        // Programmer le prochain rappel matinal
        scheduleNextMorningReminder();
      }, timeUntilMorning);
    };

    scheduleNextMorningReminder();
  };

  // Fonction pour mettre à jour les notifications quand les tâches changent
  const updateTaskNotifications = (tasks: Task[]) => {
    if (!permissionGranted) return;

    // Reprogrammer les rappels pour toutes les tâches incomplètes
    tasks
      .filter(task => !task.completed && task.dueDate)
      .forEach(task => {
        scheduleTaskReminders(task);
      });
  };

  return {
    permissionGranted,
    error,
    canUseNotifications,
    isIOSDevice,
    isStandalone,
    requestPermission,
    scheduleTaskReminders,
    cancelTaskReminders,
    updateTaskNotifications,
    sendNotification
  };
}; 