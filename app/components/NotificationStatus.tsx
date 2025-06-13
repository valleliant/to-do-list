'use client';

import { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationPermissionModal from './NotificationPermissionModal';

export default function NotificationStatus() {
  const { permissionGranted, canUseNotifications, isIOSDevice, isStandalone } = useNotifications();
  const [showModal, setShowModal] = useState(false);

  // Ne rien afficher si les notifications sont complètement fonctionnelles
  if (permissionGranted && canUseNotifications) {
    return null;
  }

  // Affichage pour iOS non installé
  if (isIOSDevice && !isStandalone) {
    return (
      <>
        <div 
          className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-3 mb-4 text-center cursor-pointer hover:bg-blue-500/30 transition-colors"
          onClick={() => setShowModal(true)}
        >
          <p className="text-sm text-white/90">
            📱 <strong>Installez l'app</strong> pour recevoir des notifications de rappel
          </p>
          <p className="text-xs text-white/70 mt-1">
            Appuyez ici pour plus d'informations
          </p>
        </div>
        <NotificationPermissionModal 
          isVisible={showModal} 
          onClose={() => setShowModal(false)} 
        />
      </>
    );
  }

  // Affichage pour permissions non accordées
  if (!permissionGranted && canUseNotifications) {
    return (
      <>
        <div 
          className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-3 mb-4 text-center cursor-pointer hover:bg-yellow-500/30 transition-colors"
          onClick={() => setShowModal(true)}
        >
          <p className="text-sm text-white/90">
            🔔 <strong>Autorisez les notifications</strong> pour ne rien oublier
          </p>
          <p className="text-xs text-white/70 mt-1">
            Appuyez ici pour activer les rappels automatiques
          </p>
        </div>
        <NotificationPermissionModal 
          isVisible={showModal} 
          onClose={() => setShowModal(false)} 
        />
      </>
    );
  }

  return null;
} 