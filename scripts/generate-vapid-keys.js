// Script pour générer des clés VAPID pour les notifications push
// Exécuter avec: node scripts/generate-vapid-keys.js

const crypto = require('crypto');

function generateVAPIDKeys() {
  // Générer une paire de clés publique/privée pour VAPID
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
    namedCurve: 'prime256v1',
    publicKeyEncoding: { type: 'spki', format: 'der' },
    privateKeyEncoding: { type: 'pkcs8', format: 'der' }
  });

  // Convertir en base64url
  const publicKeyBase64 = publicKey.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  const privateKeyBase64 = privateKey.toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');

  console.log('🔑 Clés VAPID générées:');
  console.log('');
  console.log('Clé publique (à utiliser dans le frontend):');
  console.log(publicKeyBase64);
  console.log('');
  console.log('Clé privée (à garder secrète sur le serveur):');
  console.log(privateKeyBase64);
  console.log('');
  console.log('⚠️  IMPORTANT: Gardez la clé privée secrète et ne la partagez jamais !');
  console.log('📝 Remplacez VAPID_PUBLIC_KEY dans useNotifications.ts par la clé publique générée.');
}

try {
  generateVAPIDKeys();
} catch (error) {
  console.error('Erreur lors de la génération des clés VAPID:', error);
  console.log('');
  console.log('💡 Alternative: Utilisez le package web-push:');
  console.log('npm install -g web-push');
  console.log('web-push generate-vapid-keys');
} 