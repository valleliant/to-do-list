import { useState, useEffect } from 'react';
import { Task } from './useTasks';

// Détection de l'environnement iOS
const isIOS = () => {
  if (typeof window === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const useNotifications = () => {
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  // Vérifier la plateforme et les permissions au chargement
  useEffect(() => {
    const checkEnvironment = async () => {
      setIsIOSDevice(isIOS());
      
      try {
        // Sur iOS, les notifications web ne fonctionnent pas, donc nous simulons toujours
        // un état où les notifications sont "activées" mais utilisons des alternatives
        if (isIOS()) {
          console.log('Environnement iOS détecté, utilisation des alertes locales');
          setPermissionGranted(true);
          return;
        }

        // Pour les autres plateformes, vérifier normalement
        if (!('Notification' in window)) {
          setError('Les notifications ne sont pas supportées par ce navigateur');
          return;
        }

        if (Notification.permission === 'granted') {
          setPermissionGranted(true);
        } else if (Notification.permission !== 'denied') {
          const permission = await Notification.requestPermission();
          setPermissionGranted(permission === 'granted');
        }
      } catch (err) {
        console.error('Erreur lors de la vérification des notifications:', err);
        setError('Erreur lors de la vérification des permissions de notification');
      }
    };

    checkEnvironment();
  }, []);

  // Demander la permission explicitement
  const requestPermission = async () => {
    try {
      // Sur iOS, simuler une demande réussie
      if (isIOSDevice) {
        console.log('Environnement iOS: permissions simulées');
        setPermissionGranted(true);
        return true;
      }

      if (!('Notification' in window)) {
        throw new Error('Les notifications ne sont pas supportées');
      }

      const permission = await Notification.requestPermission();
      setPermissionGranted(permission === 'granted');
      return permission === 'granted';
    } catch (err) {
      console.error('Erreur de permission:', err);
      setError('Erreur lors de la demande de permission');
      return false;
    }
  };

  // Solution alternative pour iOS: alert dans l'app
  const showIOSNotification = (title: string, body: string) => {
    // Sur iOS, nous utilisons une alerte visuelle dans l'application
    // Cette fonction sera appelée seulement si l'app est au premier plan
    console.log('Affichage notification iOS simulée:', title, body);
    
    // Créer un élément visuel qui ressemble à une notification iOS
    const notifElement = document.createElement('div');
    notifElement.style.position = 'fixed';
    notifElement.style.top = '10px';
    notifElement.style.left = '50%';
    notifElement.style.transform = 'translateX(-50%)';
    notifElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    notifElement.style.color = 'white';
    notifElement.style.padding = '12px 16px';
    notifElement.style.borderRadius = '12px';
    notifElement.style.zIndex = '9999';
    notifElement.style.maxWidth = '90%';
    notifElement.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    notifElement.style.display = 'flex';
    notifElement.style.flexDirection = 'column';

    const titleEl = document.createElement('div');
    titleEl.style.fontWeight = 'bold';
    titleEl.style.marginBottom = '4px';
    titleEl.textContent = title;

    const bodyEl = document.createElement('div');
    bodyEl.style.fontSize = '14px';
    bodyEl.style.opacity = '0.9';
    bodyEl.textContent = body;

    notifElement.appendChild(titleEl);
    notifElement.appendChild(bodyEl);
    document.body.appendChild(notifElement);

    // Animation d'entrée
    notifElement.style.transition = 'all 0.3s ease-out';
    notifElement.style.opacity = '0';
    notifElement.style.transform = 'translateX(-50%) translateY(-20px)';
    
    setTimeout(() => {
      notifElement.style.opacity = '1';
      notifElement.style.transform = 'translateX(-50%) translateY(0)';
    }, 10);

    // Disparaître après 4 secondes
    setTimeout(() => {
      notifElement.style.opacity = '0';
      notifElement.style.transform = 'translateX(-50%) translateY(-20px)';
      
      // Supprimer l'élément après la fin de l'animation
      setTimeout(() => {
        document.body.removeChild(notifElement);
      }, 300);
    }, 4000);
  };

  // Programmer une notification pour une tâche
  const scheduleNotification = async (task: Task, notificationTime: Date) => {
    try {
      const timeUntilNotification = notificationTime.getTime() - Date.now();
      if (timeUntilNotification <= 0) return false;

      // Solution alternative pour iOS
      if (isIOSDevice) {
        console.log(`Programmation notification iOS dans ${timeUntilNotification}ms pour: ${task.title}`);
        setTimeout(() => {
          showIOSNotification('Nouvelle tâche ajoutée', task.title);
        }, timeUntilNotification);
        return true;
      }

      // Pour les autres plateformes, demander la permission si nécessaire
      if (!permissionGranted) {
        const granted = await requestPermission();
        if (!granted) return false;
      }

      // Utiliser les notifications web standards si disponibles
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        const registration = await navigator.serviceWorker.ready;
        
        setTimeout(() => {
          registration.showNotification('Nouvelle tâche ajoutée', {
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
        // Fallback pour les navigateurs qui ne supportent pas les service workers
        setTimeout(() => {
          new Notification('Nouvelle tâche ajoutée', {
            body: task.title,
            icon: '/icons/icon-192x192.png',
          });
        }, timeUntilNotification);
        
        return true;
      }
    } catch (err) {
      console.error('Erreur de notification:', err);
      setError('Erreur lors de la programmation de la notification');
      return false;
    }
  };

  return {
    permissionGranted,
    error,
    requestPermission,
    scheduleNotification,
    isIOSDevice
  };
}; 