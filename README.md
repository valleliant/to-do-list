# Todo List - PWA

Une Progressive Web App de gestion de tâches quotidiennes, avec un design inspiré d'Apple et optimisée pour iPhone.

## Fonctionnalités

- ✅ Gestion complète des tâches (ajout, édition, suppression)
- 📱 Interface utilisateur minimaliste style Apple
- 🌤️ Affichage de la météo locale
- 👋 Message de bienvenue personnalisé selon l'heure
- ⏰ Mode Focus avec timer Pomodoro
- 🔔 Notifications push pour les rappels
- 📲 Installation sur écran d'accueil (PWA)
- 🔄 Fonctionne hors ligne
- 🏝️ Dynamic Island pour les tâches actives et le timer

## Installation

Ce projet est construit avec Next.js, TypeScript et TailwindCSS.

### Prérequis

- Node.js (version 14 ou supérieure)
- npm ou yarn

### Installation depuis le dépôt

```bash
# Cloner le dépôt
git clone <url-du-repo>

# Accéder au répertoire du projet
cd to-do-list

# Installer les dépendances
npm install
# ou
yarn install

# Lancer le serveur de développement
npm run dev
# ou
yarn dev
```

### Utilisation

Ouvrez [http://localhost:3000](http://localhost:3000) avec votre navigateur pour voir l'application.

Pour une expérience optimale sur iPhone :
1. Ouvrez l'application dans Safari
2. Appuyez sur le bouton de partage
3. Sélectionnez "Sur l'écran d'accueil"
4. Confirmez pour installer l'application

## Structure du projet

```
to-do-list/
├── app/
│   ├── components/      # Composants React
│   ├── hooks/           # Hooks personnalisés 
│   ├── utils/           # Fonctions utilitaires
│   ├── layout.tsx       # Layout principal
│   ├── page.tsx         # Page d'accueil
│   └── globals.css      # CSS global
├── public/
│   ├── icons/           # Icônes pour la PWA
│   ├── manifest.json    # Manifeste pour l'installation
│   └── service-worker.js # Service worker pour le fonctionnement offline
└── ...
```

## Cahier des charges

Le projet suit les spécifications détaillées dans le document `cahier-des-charges.md`, mettant l'accent sur :

- Interface utilisateur ultra clean, style Apple
- Mode Focus immersif
- Stockage local offline-first
- Intégration météo et géolocalisation
- Messages de bienvenue personnalisés 