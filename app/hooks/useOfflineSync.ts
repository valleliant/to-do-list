import { useState, useEffect, useCallback } from 'react';

interface OfflineSyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingChanges: number;
}

export const useOfflineSync = () => {
  const [syncState, setSyncState] = useState<OfflineSyncState>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    isSyncing: false,
    lastSyncTime: null,
    pendingChanges: 0
  });

  // Fonction pour marquer des changements comme en attente de synchronisation
  const markPendingChanges = useCallback((count: number = 1) => {
    setSyncState(prev => ({
      ...prev,
      pendingChanges: prev.pendingChanges + count
    }));
  }, []);

  // Fonction pour synchroniser les données
  const syncData = useCallback(async () => {
    if (!syncState.isOnline || syncState.isSyncing) {
      return;
    }

    setSyncState(prev => ({ ...prev, isSyncing: true }));

    try {
      // Ici, vous pouvez ajouter la logique de synchronisation
      // Par exemple, envoyer les données en attente vers un serveur
      
      // Simuler une synchronisation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSyncState(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date(),
        pendingChanges: 0
      }));

      // Optionnel : afficher une notification de succès
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Synchronisation terminée', {
          body: 'Vos données ont été synchronisées avec succès.',
          icon: '/icons/icon-192x192.png',
          tag: 'sync-success'
        });
      }

    } catch (error) {
      console.error('Erreur lors de la synchronisation:', error);
      setSyncState(prev => ({ ...prev, isSyncing: false }));
    }
  }, [syncState.isOnline, syncState.isSyncing]);

  // Écouter les changements de connexion
  useEffect(() => {
    const handleOnline = () => {
      setSyncState(prev => ({ ...prev, isOnline: true }));
      
      // Synchroniser automatiquement quand on revient en ligne
      if (syncState.pendingChanges > 0) {
        setTimeout(() => {
          syncData();
        }, 1000); // Attendre un peu pour s'assurer que la connexion est stable
      }
    };

    const handleOffline = () => {
      setSyncState(prev => ({ ...prev, isOnline: false }));
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, [syncData, syncState.pendingChanges]);

  // Vérification périodique de la connexion
  useEffect(() => {
    const checkConnection = async () => {
      if (typeof window === 'undefined') return;

      try {
        const response = await fetch(window.location.origin + '/manifest.json', {
          method: 'HEAD',
          cache: 'no-cache'
        });
        
        const isOnline = response.ok;
        if (isOnline !== syncState.isOnline) {
          setSyncState(prev => ({ ...prev, isOnline }));
          
          if (isOnline && syncState.pendingChanges > 0) {
            syncData();
          }
        }
      } catch (error) {
        if (syncState.isOnline) {
          setSyncState(prev => ({ ...prev, isOnline: false }));
        }
      }
    };

    const interval = setInterval(checkConnection, 30000); // Vérifier toutes les 30 secondes
    return () => clearInterval(interval);
  }, [syncState.isOnline, syncState.pendingChanges, syncData]);

  return {
    ...syncState,
    markPendingChanges,
    syncData
  };
}; 