'use client';

import { useNotifications } from '../hooks/useNotifications';

export default function NotificationTest() {
  const { 
    permissionGranted, 
    error, 
    subscription, 
    isIOSDevice,
    isStandalone,
    canUseNotifications,
    requestPermission, 
    sendTestNotification 
  } = useNotifications();

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const handleSendTest = async () => {
    console.log('--- DÉBUT DU TEST DE NOTIFICATION ---');
    console.log('État actuel:', { 
      permissionGranted, 
      canUseNotifications, 
      isIOSDevice, 
      isStandalone,
      subscription: !!subscription 
    });
    
    // Vérifier les permissions avant l'envoi
    console.log('Permission Notification:', Notification.permission);
    
    try {
      const success = await sendTestNotification();
      console.log('Résultat sendTestNotification:', success);
      
      if (success) {
        if (isIOSDevice) {
          alert('Notification de test envoyée ! Sur iOS, elle devrait apparaître immédiatement. Si vous ne la voyez pas, vérifiez les paramètres de notification de votre iPhone dans Réglages > Notifications.');
        } else {
          alert('Notification de test envoyée ! Vous devriez la voir apparaître même si vous fermez l\'onglet.');
        }
      } else {
        console.error('Échec de l\'envoi de la notification');
        alert('Erreur lors de l\'envoi de la notification de test. Vérifiez la console pour plus de détails.');
      }
    } catch (error) {
      console.error('Erreur dans handleSendTest:', error);
      alert('Erreur lors de l\'envoi de la notification de test.');
    }
    
    console.log('--- FIN DU TEST DE NOTIFICATION ---');
  };

  // Test de diagnostic spécial pour iOS
  const handleIOSDiagnostic = async () => {
    console.log('--- DIAGNOSTIC iOS NOTIFICATION ---');
    
    try {
      // Test 1: Notification directe simple
      console.log('Test 1: Notification directe simple');
      const notif1 = new Notification('Test Direct', {
        body: 'Notification directe iOS - Test 1',
        icon: '/icons/icon-192x192.png'
      });
      
      setTimeout(() => {
        notif1.close();
      }, 5000);
      
      // Test 2: Avec toutes les options
      setTimeout(() => {
        console.log('Test 2: Notification avec options complètes');
        const notif2 = new Notification('Test Complet', {
          body: 'Notification avec toutes les options - Test 2',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-96x96.png',
          tag: 'test-diagnostic',
          requireInteraction: false,
          silent: false
        });
        
        setTimeout(() => {
          notif2.close();
        }, 5000);
      }, 2000);
      
      alert('Tests de diagnostic lancés ! Regardez votre écran pour voir les notifications. Vérifiez aussi la console.');
      
    } catch (error) {
      console.error('Erreur dans le diagnostic iOS:', error);
      alert(`Erreur de diagnostic: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    }
  };

  // Instructions d'installation pour iOS
  const IOSInstallInstructions = () => (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-blue-800 mb-3">
        📱 Installation requise pour les notifications iOS
      </h3>
      <div className="space-y-3 text-blue-700">
        <p className="font-medium">Pour recevoir des notifications sur iOS, suivez ces étapes :</p>
        <ol className="list-decimal list-inside space-y-2 text-sm">
          <li>Appuyez sur le bouton <strong>Partager</strong> 📤 en bas de Safari</li>
          <li>Faites défiler et sélectionnez <strong>"Sur l'écran d'accueil"</strong> 📲</li>
          <li>Appuyez sur <strong>"Ajouter"</strong> en haut à droite</li>
          <li>Ouvrez l'application depuis votre écran d'accueil</li>
          <li>Autorisez les notifications quand demandé</li>
        </ol>
        {isStandalone && (
          <div className="mt-3 p-3 bg-green-100 border border-green-200 rounded">
            <p className="text-green-800 font-medium">✅ Application installée détectée !</p>
            <p className="text-green-700 text-sm">Vous pouvez maintenant activer les notifications.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Instructions d'installation pour autres plateformes
  const GeneralInstallInstructions = () => (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-green-800 mb-2">
        💻 Installer l'application (recommandé)
      </h3>
      <p className="text-green-700 text-sm">
        Installez cette application sur votre appareil pour une meilleure expérience avec les notifications.
        Cherchez le bouton "Installer" dans la barre d'adresse de votre navigateur.
      </p>
      {isStandalone && (
        <div className="mt-2 p-2 bg-green-100 border border-green-200 rounded">
          <p className="text-green-800 text-sm font-medium">✅ Application installée</p>
        </div>
      )}
    </div>
  );

  if (isIOSDevice && !isStandalone) {
    return <IOSInstallInstructions />;
  }

  if (!isIOSDevice && !isStandalone) {
    return <GeneralInstallInstructions />;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        🔔 Test des Notifications Push
      </h3>
      
      <div className="space-y-4">
        {isIOSDevice && isStandalone && (
          <div className="bg-green-50 border border-green-200 rounded p-3 mb-4">
            <p className="text-green-800 font-medium">🎉 iOS PWA installée !</p>
            <p className="text-green-700 text-sm">Les notifications push sont maintenant supportées sur votre iPhone.</p>
          </div>
        )}

        <div className="flex items-center space-x-2">
          <span className="font-medium">État de l'application:</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            isStandalone 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {isStandalone ? 'Installée' : 'Navigateur'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-medium">Notifications disponibles:</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            canUseNotifications 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {canUseNotifications ? 'Oui' : 'Non'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-medium">Permissions:</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            permissionGranted 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {permissionGranted ? 'Accordées' : 'Non accordées'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-medium">Souscription push:</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            subscription 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {subscription ? 'Active' : 'Inactive'}
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="flex space-x-3">
          {!permissionGranted && canUseNotifications && (
            <button
              onClick={handleRequestPermission}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              Demander les permissions
            </button>
          )}
          
          {permissionGranted && canUseNotifications && (
            <button
              onClick={handleSendTest}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              Envoyer une notification de test
            </button>
          )}
          
          {permissionGranted && canUseNotifications && isIOSDevice && (
            <button
              onClick={handleIOSDiagnostic}
              className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-2 rounded font-medium transition-colors text-sm"
            >
              Diagnostic iOS
            </button>
          )}
        </div>

        {canUseNotifications && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
            <h4 className="font-medium text-blue-800 mb-2">💡 Comment tester :</h4>
            <ol className="text-sm text-blue-700 space-y-1">
              <li>1. Cliquez sur "Demander les permissions" si ce n'est pas fait</li>
              <li>2. Autorisez les notifications dans votre {isIOSDevice ? 'iPhone' : 'navigateur'}</li>
              <li>3. Cliquez sur "Envoyer une notification de test"</li>
              <li>4. {isIOSDevice ? 'Appuyez sur le bouton home ou fermez l\'app' : 'Fermez ou réduisez votre navigateur'} pour voir la notification système</li>
            </ol>
          </div>
        )}

        {canUseNotifications && isIOSDevice && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <h4 className="font-medium text-yellow-800 mb-2">🔧 Dépannage iOS :</h4>
            <div className="text-sm text-yellow-700 space-y-2">
              <p><strong>Si vous ne voyez pas les notifications :</strong></p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Vérifiez <strong>Réglages → Notifications → Todo List</strong></li>
                <li>Assurez-vous que "Autoriser les notifications" est activé</li>
                <li>Vérifiez que "Sons" et "Pastilles" sont activés</li>
                <li>Essayez le bouton "Diagnostic iOS" pour des tests détaillés</li>
                <li>Redémarrez l'app depuis l'écran d'accueil</li>
              </ul>
              <p className="mt-2"><strong>Note :</strong> Sur iOS, les notifications peuvent prendre quelques secondes à apparaître.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 