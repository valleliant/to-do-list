import { useState, useEffect } from 'react';
import { Task } from './useTasks';

export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Vérifier si les notifications sont supportées et demander la permission au chargement
  useEffect(() => {
    const checkNotificationPermission = async () => {
      try {
        // Vérifier si les notifications sont supportées
        if (!('Notification' in window)) {
          setError('Les notifications ne sont pas supportées par ce navigateur');
          return;
        }

        // Vérifier la permission actuelle
        if (Notification.permission === 'granted') {
          setPermissionGranted(true);
        } else if (Notification.permission !== 'denied') {
          // Demander la permission
          const permission = await Notification.requestPermission();
          setPermissionGranted(permission === 'granted');
        }
      } catch (err) {
        setError('Erreur lors de la vérification des permissions de notification');
        console.error(err);
      }
    };

    checkNotificationPermission();
  }, []);

  // Demander la permission explicitement
  const requestPermission = async () => {
    try {
      if (!('Notification' in window)) {
        throw new Error('Les notifications ne sont pas supportées');
      }

      const permission = await Notification.requestPermission();
      setPermissionGranted(permission === 'granted');
      return permission === 'granted';
    } catch (err) {
      setError('Erreur lors de la demande de permission');
      console.error(err);
      return false;
    }
  };

  // Programmer une notification pour une tâche
  const scheduleNotification = async (task: Task, notificationTime: Date) => {
    try {
      if (!permissionGranted) {
        const granted = await requestPermission();
        if (!granted) return false;
      }

      // Pour les navigateurs qui supportent les notifications programmées
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;

        // Utiliser setTimeout pour simuler une notification programmée
        // Dans une vraie application, on utiliserait un service worker pour gérer cela
        const timeUntilNotification = notificationTime.getTime() - Date.now();
        
        if (timeUntilNotification <= 0) return false;

        setTimeout(() => {
          registration.showNotification('Rappel de tâche', {
            body: task.title,
            icon: '/icons/icon-192x192.png',
            badge: '/icons/badge-96x96.png',
            tag: `task-${task.id}`,
            vibrate: [200, 100, 200],
            data: {
              taskId: task.id,
              url: window.location.origin
            }
          });
        }, timeUntilNotification);

        return true;
      } else {
        // Fallback pour les navigateurs qui ne supportent pas les notifications programmées
        setTimeout(() => {
          new Notification('Rappel de tâche', {
            body: task.title,
            icon: '/icons/icon-192x192.png',
          });
        }, notificationTime.getTime() - Date.now());
        
        return true;
      }
    } catch (err) {
      setError('Erreur lors de la programmation de la notification');
      console.error(err);
      return false;
    }
  };

  return {
    permissionGranted,
    error,
    requestPermission,
    scheduleNotification
  };
}; 