# Todo List - PWA

Une application de gestion de tâches moderne et responsive, développée avec Next.js et optimisée pour les appareils mobiles. Cette PWA (Progressive Web App) offre une expérience native avec des notifications push, un mode hors ligne et une interface utilisateur intuitive.

## ✨ Fonctionnalités

- **Interface moderne** : Design épuré et responsive optimisé pour mobile
- **PWA complète** : Installation sur l'écran d'accueil, mode hors ligne robuste
- **Notifications intelligentes** : Rappels automatiques selon la priorité des tâches
- **Gestion des permissions** : Pop-up intuitive pour demander l'autorisation des notifications
- **Mode hors ligne avancé** : Détection automatique de la connexion avec interface dédiée
- **Géolocalisation** : Widget météo avec localisation automatique
- **Gestion avancée** : Priorités, dates d'échéance, descriptions détaillées
- **Animations fluides** : Interface animée avec Framer Motion
- **Stockage local** : Données sauvegardées localement avec synchronisation automatique

## 🚀 Installation et développement

### Prérequis

- Node.js 18+ 
- npm ou yarn

### Installation

```bash
# Cloner le repository
git clone <your-repo-url>
cd to-do-list

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

Ouvrez [http://localhost:3000](http://localhost:3000) avec votre navigateur pour voir l'application.

## 🔧 Configuration pour la production

### Variables d'environnement

Créez un fichier `.env.local` avec les variables suivantes :

```bash
# Clé publique VAPID pour les notifications push
NEXT_PUBLIC_VAPID_KEY=your_vapid_public_key_here

# URL de base de l'application
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Génération des clés VAPID

Pour les notifications push, générez vos propres clés VAPID :

```bash
npx web-push generate-vapid-keys
```

### Build de production

```bash
# Build optimisé pour la production
npm run build

# Lancer en mode production
npm start
```

## 📱 Installation PWA

### Sur mobile (iOS/Android)
1. Ouvrez l'application dans votre navigateur
2. Appuyez sur le bouton "Partager" (iOS) ou menu (Android)
3. Sélectionnez "Ajouter à l'écran d'accueil"

### Sur desktop
1. Cliquez sur l'icône d'installation dans la barre d'adresse
2. Confirmez l'installation

## 🔔 Notifications

L'application utilise les notifications push natives du navigateur :

- **Rappels automatiques** : Selon la priorité des tâches
- **Rappel matinal** : Résumé quotidien à 8h00
- **Notifications de félicitations** : Lors de la completion des tâches
- **Synchronisation hors ligne** : Notification lors de la synchronisation des données

### Gestion des permissions

L'application inclut un système intelligent de gestion des permissions :

- **Détection automatique** : Vérifie l'état des permissions de notification
- **Pop-up personnalisée** : Interface utilisateur intuitive pour demander l'autorisation
- **Adaptative** : Affiche des instructions spécifiques selon la plateforme (iOS, Android, Desktop)
- **Non-intrusive** : S'affiche au moment opportun sans perturber l'expérience utilisateur

### Configuration des notifications

Les intervalles de rappel sont configurables :
- **Haute priorité** : Toutes les 2 heures
- **Priorité moyenne** : Toutes les 4 heures  
- **Basse priorité** : Toutes les 8 heures

## 🌍 Déploiement

### Vercel (recommandé)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel
```

### Autres plateformes

L'application est compatible avec :
- Netlify
- Railway
- Heroku
- Tout hébergeur supportant Next.js

## 🛠️ Technologies utilisées

- **Next.js 14** : Framework React avec App Router
- **TypeScript** : Typage statique
- **Tailwind CSS** : Styles utilitaires
- **Framer Motion** : Animations
- **Service Workers** : Mode hors ligne et notifications
- **Web APIs** : Géolocalisation, Notifications, Storage

## 📂 Structure du projet

```
app/
├── components/          # Composants React réutilisables
│   ├── Task.tsx         # Composant de tâche individuelle
│   ├── TaskForm.tsx     # Formulaire d'ajout/édition de tâche
│   ├── TaskDetail.tsx   # Vue détaillée d'une tâche
│   ├── NotificationStatus.tsx  # Indicateur de statut des notifications
│   ├── NotificationPermissionModal.tsx  # Pop-up de demande d'autorisation
│   ├── OfflineIndicator.tsx    # Système de détection et gestion hors ligne
│   ├── CompletedTasksMenu.tsx  # Menu des tâches terminées
│   └── SwipeHint.tsx    # Aide au glissement
├── hooks/              # Hooks personnalisés
│   ├── useTasks.ts     # Gestion des tâches
│   ├── useNotifications.ts  # Gestion des notifications
│   ├── useWeather.ts   # Données météo
│   └── useOfflineSync.ts  # Synchronisation hors ligne
├── utils/              # Fonctions utilitaires
│   └── greeting.ts     # Génération de messages de bienvenue
├── globals.css         # Styles globaux
├── layout.tsx          # Layout principal
└── page.tsx            # Page d'accueil

public/
├── icons/              # Icônes PWA
├── service-worker.js   # Service Worker avec gestion hors ligne avancée
├── sw.js              # Service Worker généré par Next-PWA
└── manifest.json       # Manifeste PWA
```

## 🔒 Sécurité et production

- ✅ Toutes les données de debug supprimées
- ✅ Console.log nettoyés pour la production
- ✅ Variables d'environnement pour les clés sensibles
- ✅ Service Worker optimisé avec gestion hors ligne avancée
- ✅ Gestion d'erreurs robuste
- ✅ Fallback HTML pour navigation hors ligne
- ✅ Détection automatique de l'état de la connexion
- ✅ Synchronisation intelligente des données

## 🔄 Mode hors ligne

L'application offre une expérience hors ligne complète :

- **Détection automatique** : Surveillance continue de l'état de la connexion
- **Interface dédiée** : Modal explicative lors de la perte de connexion
- **Indicateur de statut** : Bandeau discret indiquant le mode hors ligne
- **Fallback HTML** : Page spéciale si l'application est chargée sans connexion
- **Synchronisation automatique** : Mise à jour des données au retour de la connexion
- **Stockage local** : Toutes les tâches restent accessibles hors ligne
- **Reprise transparente** : Transition fluide entre les modes connecté et déconnecté

---

Développé avec ❤️ pour une gestion de tâches moderne et efficace. 