'use client';

import { useNotifications } from '../hooks/useNotifications';

export default function NotificationTest() {
  const { 
    permissionGranted, 
    error, 
    subscription, 
    isIOSDevice, 
    requestPermission, 
    sendTestNotification 
  } = useNotifications();

  const handleRequestPermission = async () => {
    await requestPermission();
  };

  const handleSendTest = async () => {
    const success = await sendTestNotification();
    if (success) {
      alert('Notification de test envoyée ! Vous devriez la voir apparaître même si vous fermez l\'onglet.');
    } else {
      alert('Erreur lors de l\'envoi de la notification de test.');
    }
  };

  if (isIOSDevice) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h3 className="text-lg font-semibold text-yellow-800 mb-2">
          📱 Appareil iOS détecté
        </h3>
        <p className="text-yellow-700">
          Les notifications push web ne sont pas encore supportées sur iOS Safari. 
          Cette fonctionnalité sera disponible dans une future mise à jour d'iOS.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        🔔 Test des Notifications Push
      </h3>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <span className="font-medium">État des permissions:</span>
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
          {!permissionGranted && (
            <button
              onClick={handleRequestPermission}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              Demander les permissions
            </button>
          )}
          
          {permissionGranted && (
            <button
              onClick={handleSendTest}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium transition-colors"
            >
              Envoyer une notification de test
            </button>
          )}
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
          <h4 className="font-medium text-blue-800 mb-2">💡 Comment tester :</h4>
          <ol className="text-sm text-blue-700 space-y-1">
            <li>1. Cliquez sur "Demander les permissions" si ce n'est pas fait</li>
            <li>2. Autorisez les notifications dans votre navigateur</li>
            <li>3. Cliquez sur "Envoyer une notification de test"</li>
            <li>4. Fermez ou réduisez votre navigateur pour voir la notification système</li>
          </ol>
        </div>
      </div>
    </div>
  );
} 