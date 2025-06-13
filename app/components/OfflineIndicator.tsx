'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineModal, setShowOfflineModal] = useState(false);
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    // Vérifier l'état initial de la connexion
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      if (wasOffline) {
        // Afficher brièvement un message de reconnexion
        setTimeout(() => {
          setShowOfflineModal(false);
          setWasOffline(false);
        }, 1000);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineModal(true);
      setWasOffline(true);
    };

    // Écouter les changements de connexion
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Vérification périodique de la connexion (pour détecter les problèmes réseau)
    const checkConnection = async () => {
      try {
        // Essayer de faire une requête vers notre propre domaine
        const response = await fetch(window.location.origin + '/manifest.json', {
          method: 'HEAD',
          cache: 'no-cache',
          mode: 'no-cors'
        });
        
        if (!isOnline && navigator.onLine) {
          handleOnline();
        }
      } catch (error) {
        if (isOnline) {
          handleOffline();
        }
      }
    };

    // Vérifier la connexion toutes les 30 secondes
    const connectionInterval = setInterval(checkConnection, 30000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(connectionInterval);
    };
  }, [isOnline, wasOffline]);

  const handleRetry = async () => {
    try {
      // Essayer de recharger la page ou de faire une requête test
      const response = await fetch(window.location.origin + '/manifest.json', {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      if (response.ok || navigator.onLine) {
        setIsOnline(true);
        setShowOfflineModal(false);
        setWasOffline(false);
        // Recharger la page pour récupérer les dernières données
        window.location.reload();
      }
    } catch (error) {
      // La connexion n'est toujours pas disponible
      console.log('Connexion toujours indisponible');
    }
  };

  return (
    <>
      {/* Indicateur de statut en haut de l'écran */}
      <AnimatePresence>
        {!isOnline && !showOfflineModal && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-0 left-0 right-0 bg-red-500/90 backdrop-blur-sm text-white text-center py-2 px-4 z-50"
          >
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Mode hors ligne</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal hors ligne */}
      <AnimatePresence>
        {showOfflineModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-sm w-full mx-4 border border-white/20 text-center"
            >
              {isOnline && wasOffline ? (
                // Message de reconnexion
                <>
                  <div className="text-6xl mb-4">✅</div>
                  <h2 className="text-xl font-bold text-white mb-2">Reconnecté !</h2>
                  <p className="text-white/80 text-sm">
                    Votre connexion internet a été rétablie.
                  </p>
                </>
              ) : (
                // Message hors ligne
                <>
                  <div className="text-6xl mb-4">📡</div>
                  <h2 className="text-xl font-bold text-white mb-2">Pas de connexion</h2>
                  <p className="text-white/80 text-sm mb-6 leading-relaxed">
                    Vous n'êtes pas connecté à internet. Vos données sont sauvegardées localement et se synchroniseront automatiquement lors de la reconnexion.
                  </p>

                  <div className="bg-white/10 rounded-lg p-4 mb-6">
                    <h3 className="text-white/90 font-medium text-sm mb-2">Mode hors ligne activé :</h3>
                    <ul className="text-white/70 text-xs space-y-1 text-left">
                      <li>• Vos tâches restent accessibles</li>
                      <li>• Les modifications sont sauvegardées</li>
                      <li>• Synchronisation automatique au retour</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleRetry}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      🔄 Réessayer
                    </motion.button>
                    
                    <motion.button
                      onClick={() => setShowOfflineModal(false)}
                      className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-xl transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      Continuer
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 