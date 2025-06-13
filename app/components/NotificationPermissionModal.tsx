'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationPermissionModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export default function NotificationPermissionModal({ isVisible, onClose }: NotificationPermissionModalProps) {
  const { 
    permissionGranted, 
    canUseNotifications, 
    isIOSDevice, 
    isStandalone, 
    requestPermission,
    error 
  } = useNotifications();
  
  const [isRequesting, setIsRequesting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Fermer automatiquement si les permissions sont déjà accordées
  useEffect(() => {
    if (permissionGranted && canUseNotifications) {
      setShowSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  }, [permissionGranted, canUseNotifications, onClose]);

  const handleRequestPermission = async () => {
    setIsRequesting(true);
    try {
      const granted = await requestPermission();
      if (granted) {
        setShowSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    } catch (err) {
      console.error('Erreur lors de la demande de permission:', err);
    } finally {
      setIsRequesting(false);
    }
  };

  const getModalContent = () => {
    // Succès
    if (showSuccess) {
      return {
        icon: '✅',
        title: 'Notifications activées !',
        description: 'Vous recevrez maintenant des rappels pour vos tâches importantes.',
        showButton: false
      };
    }

    // iOS non installé
    if (isIOSDevice && !isStandalone) {
      return {
        icon: '📱',
        title: 'Installez l\'application',
        description: 'Pour recevoir des notifications sur iOS, vous devez d\'abord installer l\'application sur votre écran d\'accueil.',
        instructions: 'Appuyez sur le bouton de partage 📤 puis sélectionnez "Sur l\'écran d\'accueil"',
        showButton: false
      };
    }

    // Notifications non supportées
    if (!canUseNotifications) {
      return {
        icon: '❌',
        title: 'Notifications non supportées',
        description: 'Votre navigateur ne supporte pas les notifications push.',
        showButton: false
      };
    }

    // Permission refusée
    if (Notification.permission === 'denied') {
      return {
        icon: '🚫',
        title: 'Notifications bloquées',
        description: 'Les notifications ont été bloquées. Vous pouvez les réactiver dans les paramètres de votre navigateur.',
        instructions: 'Cliquez sur l\'icône de cadenas dans la barre d\'adresse et autorisez les notifications.',
        showButton: false
      };
    }

    // Demande de permission
    return {
      icon: '🔔',
      title: 'Activer les notifications',
      description: 'Recevez des rappels pour ne jamais oublier vos tâches importantes.',
      benefits: [
        'Rappels automatiques selon la priorité',
        'Résumé matinal de vos tâches',
        'Notifications de félicitations'
      ],
      showButton: true
    };
  };

  const content = getModalContent();

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white/10 backdrop-blur-md rounded-2xl p-6 max-w-sm w-full mx-4 border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icône */}
          <div className="text-center mb-4">
            <div className="text-4xl mb-2">{content.icon}</div>
            <h2 className="text-xl font-bold text-white mb-2">{content.title}</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              {content.description}
            </p>
          </div>

          {/* Instructions supplémentaires */}
          {content.instructions && (
            <div className="bg-white/10 rounded-lg p-3 mb-4">
              <p className="text-white/90 text-xs leading-relaxed">
                💡 {content.instructions}
              </p>
            </div>
          )}

          {/* Avantages */}
          {content.benefits && (
            <div className="mb-6">
              <p className="text-white/90 text-sm font-medium mb-2">Avantages :</p>
              <ul className="space-y-1">
                {content.benefits.map((benefit, index) => (
                  <li key={index} className="text-white/80 text-sm flex items-start">
                    <span className="text-green-400 mr-2">•</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Erreur */}
          {error && (
            <div className="bg-red-500/20 rounded-lg p-3 mb-4">
              <p className="text-red-200 text-sm">
                ⚠️ {error}
              </p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3">
            {content.showButton && (
              <motion.button
                onClick={handleRequestPermission}
                disabled={isRequesting}
                className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-500/50 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {isRequesting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white mr-2"></div>
                    Activation...
                  </>
                ) : (
                  'Activer les notifications'
                )}
              </motion.button>
            )}
            
            <motion.button
              onClick={onClose}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-4 rounded-xl transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {content.showButton ? 'Plus tard' : 'Fermer'}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 