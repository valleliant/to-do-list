import { useState, useEffect } from 'react';
import { Task } from './useTasks';

// Clés VAPID pour les notifications push (à remplacer par vos vraies clés en production)
const VAPID_PUBLIC_KEY = 'BH7eJ-4uTtRgbgFZPzJI2MNgJe7QJzJ3TGm5TGFBvPYTqTjM9Qx9BnYOe1NnQB7WH5L2mPQwKqGLR2P5JVR-abc';

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

  // Vérifier si c'est iOS
  const checkIsIOS = () => {
    if (typeof window === 'undefined') return false;
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  };

  // Initialiser les notifications push
  useEffect(() => {
    const initializeNotifications = async () => {
      setIsIOSDevice(checkIsIOS());
      
      // iOS ne supporte pas les notifications push web (pour l'instant)
      if (checkIsIOS()) {
        console.log('iOS détecté - notifications push non supportées');
        setError('Les notifications push ne sont pas supportées sur iOS');
        return;
      }

      try {
        // Vérifier le support des notifications
        if (!('Notification' in window)) {
          setError('Les notifications ne sont pas supportées par ce navigateur');
          return;
        }

        // Vérifier le support des service workers
        if (!('serviceWorker' in navigator)) {
          setError('Les service workers ne sont pas supportés');
          return;
        }

        // Vérifier le support des push notifications
        if (!('PushManager' in window)) {
          setError('Les notifications push ne sont pas supportées');
          return;
        }

        // Enregistrer le service worker
        const registration = await navigator.serviceWorker.register('/service-worker.js');
        console.log('Service Worker enregistré:', registration);

        // Vérifier les permissions
        const permission = await Notification.requestPermission();
        setPermissionGranted(permission === 'granted');

        if (permission === 'granted') {
          // Créer ou récupérer la souscription push
          await createPushSubscription(registration);
        }
      } catch (err) {
        console.error('Erreur lors de l\'initialisation des notifications:', err);
        setError('Erreur lors de l\'initialisation des notifications');
      }
    };

    initializeNotifications();
  }, []);

  // Créer une souscription push
  const createPushSubscription = async (registration: ServiceWorkerRegistration) => {
    try {
      // Vérifier si une souscription existe déjà
      let pushSubscription = await registration.pushManager.getSubscription();

      if (!pushSubscription) {
        // Créer une nouvelle souscription
        pushSubscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        });
      }

      setSubscription(pushSubscription);
      
      // Envoyer la souscription au serveur (vous devrez implémenter cette partie)
      await sendSubscriptionToServer(pushSubscription);
      
      console.log('Souscription push créée:', pushSubscription);
    } catch (err) {
      console.error('Erreur lors de la création de la souscription push:', err);
      setError('Erreur lors de la création de la souscription push');
    }
  };

  // Envoyer la souscription au serveur
  const sendSubscriptionToServer = async (subscription: PushSubscription) => {
    try {
      // Ici vous devriez envoyer la souscription à votre backend
      // Pour l'instant, on la stocke dans le localStorage comme exemple
      localStorage.setItem('pushSubscription', JSON.stringify(subscription));
      console.log('Souscription sauvegardée localement');
    } catch (err) {
      console.error('Erreur lors de l\'envoi de la souscription:', err);
    }
  };

  // Demander la permission pour les notifications
  const requestPermission = async () => {
    try {
      if (isIOSDevice) {
        setError('Les notifications push ne sont pas supportées sur iOS');
        return false;
      }

      const permission = await Notification.requestPermission();
      setPermissionGranted(permission === 'granted');

      if (permission === 'granted' && 'serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await createPushSubscription(registration);
      }

      return permission === 'granted';
    } catch (err) {
      console.error('Erreur de permission:', err);
      setError('Erreur lors de la demande de permission');
      return false;
    }
  };

  // Programmer une notification push pour une tâche
  const scheduleNotification = async (task: Task, notificationTime: Date) => {
    try {
      if (isIOSDevice) {
        setError('Les notifications push ne sont pas supportées sur iOS');
        return false;
      }

      if (!permissionGranted || !subscription) {
        const granted = await requestPermission();
        if (!granted) return false;
      }

      const timeUntilNotification = notificationTime.getTime() - Date.now();
      if (timeUntilNotification <= 0) {
        console.log('L\'heure de notification est déjà passée');
        return false;
      }

      // Programmer la notification
      // En production, vous devriez envoyer ceci à votre backend qui programmera l'envoi
      const notificationData = {
        taskId: task.id,
        title: 'Rappel de tâche',
        body: task.title,
        scheduledTime: notificationTime.toISOString(),
        url: window.location.origin
      };

      // Pour l'instant, simuler l'envoi immédiat après le délai
      setTimeout(async () => {
        await sendImmediatePushNotification(notificationData);
      }, timeUntilNotification);

      console.log(`Notification programmée pour ${task.title} dans ${timeUntilNotification}ms`);
      return true;
    } catch (err) {
      console.error('Erreur lors de la programmation de la notification:', err);
      setError('Erreur lors de la programmation de la notification');
      return false;
    }
  };

  // Envoyer une notification push immédiate (simulation)
  const sendImmediatePushNotification = async (data: any) => {
    try {
      // En production, cette fonction devrait appeler votre backend
      // qui enverra la notification push via FCM ou un autre service
      
      // Pour l'instant, on utilise l'API de notification locale comme fallback
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        
        // Déclencher l'événement push manuellement (simulation)
        if (registration.active) {
          registration.active.postMessage({
            type: 'SIMULATE_PUSH',
            data: data
          });
        }
      }
    } catch (err) {
      console.error('Erreur lors de l\'envoi de la notification:', err);
    }
  };

  // Envoyer une notification de test
  const sendTestNotification = async () => {
    try {
      if (!permissionGranted) {
        const granted = await requestPermission();
        if (!granted) return false;
      }

      await sendImmediatePushNotification({
        title: 'Notification de test',
        body: 'Ceci est une notification push de test !',
        url: window.location.origin
      });

      return true;
    } catch (err) {
      console.error('Erreur lors de l\'envoi de la notification de test:', err);
      return false;
    }
  };

  return {
    permissionGranted,
    error,
    subscription,
    isIOSDevice,
    requestPermission,
    scheduleNotification,
    sendTestNotification
  };
}; 