'use client';

import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    // Détecter iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOSDevice(isIOS);

    // Détecter si l'app est déjà installée
    const checkIsStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as any).standalone === true;
      return isStandaloneMode || isIOSStandalone;
    };
    setIsStandalone(checkIsStandalone());

    // Écouter l'événement beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const choiceResult = await deferredPrompt.userChoice;
    
    if (choiceResult.outcome === 'accepted') {
      console.log('PWA installée');
    }
    
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  // Ne pas afficher si déjà installé
  if (isStandalone) {
    return null;
  }

  // Instructions spéciales pour iOS
  if (isIOSDevice) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg mb-4 shadow-lg">
        <div className="flex items-start space-x-3">
          <div className="bg-white/20 rounded-lg p-2 flex-shrink-0">
            📱
          </div>
          <div className="flex-grow">
            <h3 className="font-semibold mb-1">Installer l'application</h3>
            <p className="text-sm opacity-90 mb-3">
              Ajoutez cette app à votre écran d'accueil pour recevoir des notifications !
            </p>
            <div className="text-xs opacity-80 space-y-1">
              <div>1. Appuyez sur 📤 (Partager)</div>
              <div>2. Sélectionnez "Sur l'écran d'accueil"</div>
              <div>3. Appuyez sur "Ajouter"</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Bouton d'installation pour autres navigateurs
  if (isInstallable && deferredPrompt) {
    return (
      <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white p-4 rounded-lg mb-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 rounded-lg p-2">
              📲
            </div>
            <div>
              <h3 className="font-semibold">Installer l'application</h3>
              <p className="text-sm opacity-90">
                Accès rapide et notifications push !
              </p>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-colors"
          >
            Installer
          </button>
        </div>
      </div>
    );
  }

  return null;
} 