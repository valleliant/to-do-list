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
            // Si la requête échoue (hors ligne), gérer selon le type de requête
            if (event.request.mode === 'navigate') {
              // Pour les navigations, retourner la page principale depuis le cache
              return caches.match('/')
                .then(response => {
                  if (response) {
                    return response;
                  }
                  
                  // Créer une page HTML minimale hors ligne si aucune page n'est en cache
                  const offlineHtml = `
                    <!DOCTYPE html>
                    <html lang="fr">
                    <head>
                      <meta charset="UTF-8" />
                      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
                      <title>Todo List - Hors ligne</title>
                      <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                          min-height: 100vh;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          color: white;
                          padding: 20px;
                        }
                        .offline-container {
                          text-align: center;
                          background: rgba(255, 255, 255, 0.1);
                          backdrop-filter: blur(10px);
                          border-radius: 20px;
                          padding: 40px;
                          border: 1px solid rgba(255, 255, 255, 0.2);
                          max-width: 400px;
                          width: 100%;
                        }
                        .offline-icon { font-size: 4rem; margin-bottom: 20px; }
                        h1 { font-size: 1.5rem; margin-bottom: 10px; font-weight: 600; }
                        p { opacity: 0.8; margin-bottom: 30px; line-height: 1.5; }
                        .features {
                          background: rgba(255, 255, 255, 0.1);
                          border-radius: 10px;
                          padding: 20px;
                          margin-bottom: 30px;
                          text-align: left;
                        }
                        .features h3 { font-size: 0.9rem; margin-bottom: 10px; }
                        .features ul { list-style: none; font-size: 0.8rem; opacity: 0.7; }
                        .features li { margin-bottom: 5px; }
                        .retry-btn {
                          background: #3b82f6;
                          color: white;
                          border: none;
                          padding: 12px 24px;
                          border-radius: 10px;
                          font-weight: 500;
                          cursor: pointer;
                          transition: background 0.2s;
                          margin-right: 10px;
                        }
                        .retry-btn:hover { background: #2563eb; }
                        .continue-btn {
                          background: rgba(255, 255, 255, 0.1);
                          color: white;
                          border: none;
                          padding: 12px 24px;
                          border-radius: 10px;
                          font-weight: 500;
                          cursor: pointer;
                          transition: background 0.2s;
                        }
                        .continue-btn:hover { background: rgba(255, 255, 255, 0.2); }
                      </style>
                    </head>
                    <body>
                      <div class="offline-container">
                        <div class="offline-icon">📡</div>
                        <h1>Pas de connexion</h1>
                        <p>Vous n'êtes pas connecté à internet. Vos données sont sauvegardées localement et se synchroniseront automatiquement lors de la reconnexion.</p>
                        
                        <div class="features">
                          <h3>Mode hors ligne activé :</h3>
                          <ul>
                            <li>• Vos tâches restent accessibles</li>
                            <li>• Les modifications sont sauvegardées</li>
                            <li>• Synchronisation automatique au retour</li>
                          </ul>
                        </div>
                        
                        <button id="retry-connection" class="retry-btn">🔄 Réessayer</button>
                        <button id="continue-offline" class="continue-btn">Continuer</button>
                      </div>
                      
                      <script>
                        document.getElementById('retry-connection').addEventListener('click', () => {
                          window.location.reload();
                        });
                        
                        document.getElementById('continue-offline').addEventListener('click', () => {
                          // Essayer de naviguer vers la page principale
                          window.location.href = '/';
                        });
                        
                        // Vérifier périodiquement la connexion
                        setInterval(() => {
                          if (navigator.onLine) {
                            window.location.reload();
                          }
                        }, 5000);
                      </script>
                    </body>
                    </html>
                  `;
                  
                  return new Response(offlineHtml, {
                    status: 200,
                    headers: { 'Content-Type': 'text/html' }
                  });
                });
            }
            
            // Pour les autres types de requêtes, retourner une réponse d'erreur appropriée
            if (event.request.destination === 'image') {
              // Retourner une image placeholder pour les images manquantes
              return new Response(
                '<svg width="200" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="200" height="200" fill="#f3f4f6"/><text x="100" y="100" text-anchor="middle" dy=".3em" fill="#9ca3af">Image indisponible</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            }
            
            // Pour les API calls, retourner une réponse JSON d'erreur
            if (event.request.url.includes('/api/')) {
              return new Response(
                JSON.stringify({ error: 'Hors ligne', offline: true }),
                { 
                  status: 503,
                  headers: { 'Content-Type': 'application/json' }
                }
              );
            }
            
            // Pour tout le reste, ne rien retourner (laisse l'erreur se propager)
            return Promise.reject('no-match');
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