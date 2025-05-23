'use client';

import { useNotifications } from '../hooks/useNotifications';

export default function NotificationStatus() {
  const { permissionGranted, canUseNotifications, isIOSDevice, isStandalone } = useNotifications();

  // Ne rien afficher si les notifications sont complètement fonctionnelles
  if (permissionGranted && canUseNotifications) {
    return null;
  }

  // Affichage pour iOS non installé
  if (isIOSDevice && !isStandalone) {
    return (
      <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-3 mb-4 text-center">
        <p className="text-sm text-white/90">
          📱 <strong>Installez l'app</strong> pour recevoir des notifications de rappel
        </p>
        <p className="text-xs text-white/70 mt-1">
          Appuyez sur 📤 → "Sur l'écran d'accueil"
        </p>
      </div>
    );
  }

  // Affichage pour permissions non accordées
  if (!permissionGranted && canUseNotifications) {
    return (
      <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-3 mb-4 text-center">
        <p className="text-sm text-white/90">
          🔔 <strong>Autorisez les notifications</strong> pour ne rien oublier
        </p>
        <p className="text-xs text-white/70 mt-1">
          Les rappels automatiques vous aideront à rester organisé
        </p>
      </div>
    );
  }

  return null;
} 