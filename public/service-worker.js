// Nom du cache
const CACHE_NAME = 'todo-list-cache-v1';

// Fichiers à mettre en cache pour le fonctionnement offline
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/globals.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/favicon.ico',
];

// Installation du service worker
self.addEventListener('install', (event) => {
  // Mettre en cache les ressources essentielles
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Activation du service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Intercepter les requêtes réseau
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourner la réponse du cache si elle existe
        if (response) {
          return response;
        }
        
        // Sinon, faire la requête au réseau
        return fetch(event.request)
          .then((response) => {
            // Ne pas mettre en cache si ce n'est pas une requête GET
            if (!event.request.url.startsWith('http') || event.request.method !== 'GET') {
              return response;
            }
            
            // Cloner la réponse pour la mettre en cache
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          })
          .catch(() => {
            // Si la requête échoue, essayer de retourner une page offline
            if (event.request.mode === 'navigate') {
              return caches.match('/');
            }
          });
      })
  );
});

// Gérer les messages du client principal
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SIMULATE_PUSH') {
    // Simuler une notification push
    const data = event.data.data;
    
    const options = {
      body: data.body || 'Nouvelle notification',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-96x96.png',
      tag: data.taskId ? `task-${data.taskId}` : 'notification',
      requireInteraction: true,
      data: {
        url: data.url || self.location.origin,
        taskId: data.taskId
      }
    };
    
    self.registration.showNotification(data.title || 'Todo List', options);
  }
});

// Gérer les notifications push
self.addEventListener('push', (event) => {
  if (!event.data) return;
  
  const data = event.data.json();
  
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-96x96.png',
    tag: data.taskId ? `task-${data.taskId}` : 'notification',
    requireInteraction: true,
    data: {
      url: data.url || self.location.origin,
      taskId: data.taskId
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'Todo List', options)
  );
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  // Ouvrir l'URL associée à la notification
  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then((clientList) => {
        // Vérifier si une fenêtre est déjà ouverte
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Si aucune fenêtre n'est ouverte, en ouvrir une nouvelle
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
}); 