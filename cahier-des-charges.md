## Cahier des charges : PWA de gestion de tâches quotidiennes

Ce document détaille le projet de création d’une Progressive Web App (PWA) de to-do list, très visuelle, inspirée du style Apple, optimisée pour iPhone, et extensible avec de petites fonctionnalités supplémentaires.

---

### 1. Contexte & Objectifs

* **Contexte** : Disposer d’une app légère, installable via Safari sur iPhone, offrant une expérience utilisateur fluide, animations soignées et fonctionnant offline.
* **Objectif principal** : Gérer ses tâches du jour de façon rapide, visuelle et immersive, comme une app native iOS.
* **Objectifs secondaires** :

  * « Mode Focus » immersif.
  * Rappels via push notifications.
  * Stockage local offline-first.
  * Intégration de la météo actuelle selon position.
  * Messages de bienvenue personnalisés selon nom et heure.
  * UX/UI ultra clean, 100% adapté à l’iPhone, style Apple, toujours mode fullscreen.

---

### 2. Périmètre (MVP)

* **Utilisateur cible** : Utilisateurs iOS souhaitant une to-do list sans installer d’app native.
* **Plateforme principale** : iPhone (Safari + ajout à l’écran d’accueil).
* **Fonctionnalités essentielles (v1)** :

  1. Ajouter / éditer / supprimer des tâches.
  2. Stockage local (IndexedDB via localforage) — pas de DB externe pour l’instant.
  3. Push notifications pour rappels (Notifications API + service worker).
  4. Mode Focus / Deep Work (plein écran, timer Pomodoro).
  5. Affichage de la météo locale (API meteo + géolocalisation).
  6. Message de bienvenue personnalisé (Bonjour/Bonsoir/Bien dormi) suivi du nom de l’utilisateur selon l’heure.
  7. UI ultra clean, animations « Apple-like », sans navbar ni menu hamburger — tout accessible depuis l’écran d’accueil.

---

### 3. Technologies & Outils

* **Framework** : Next.js

  * Plugin **next-pwa** pour service worker, manifest, offline.
* **Langage** : TypeScript
* **UI** : TailwindCSS
* **Animations** : Framer Motion, Lottie (icônes animées)
* **Stockage local** : IndexedDB (via `localforage`)
* **Push Notifications** : Web Push API
* **Géolocalisation** : `navigator.geolocation`
* **API Météo** : API tierce (OpenWeather, MeteoSwiss, etc.)
* **Déploiement** : Vercel
* **Icônes** : Pack d’icônes dans le style Apple (SF Symbols ou équivalent SVG)

---

### 4. Architecture générale

```plaintext
Client PWA (Next.js)
├─ Pages / Components
│   ├─ Home.tsx (to-do list, météo, message de bienvenue)
│   ├─ FocusMode.tsx (mode plein écran)
│   └─ Shared UI (Button, Card, IslandFake)
├─ Hooks / services
│   ├─ useTasks (localforage)
│   ├─ useNotifications
│   ├─ useGeolocation
│   └─ useWeather
├─ Styles
│   └─ tailwind.config.ts + global index.css
├─ PWA config
│   ├─ next.config.js (next-pwa)
│   ├─ manifest.json + icons
│   └─ service-worker.js
└─ Utils
    └─ greeting.ts (fonction pour message selon heure)
```

---

### 5. Exigences fonctionnelles

| ID  | Fonctionnalité                  | Description                                                                                 | Priorité |
| --- | ------------------------------- | ------------------------------------------------------------------------------------------- | -------- |
| F1  | CRUD tâches                     | Création, lecture, modification, suppression de tâches (titre, échéance, priorité).         | Must     |
| F2  | Stockage local offline          | Persist unique via IndexedDB; disponible hors ligne.                                        | Must     |
| F3  | Push notifications              | Rappels programmables; notifications push même si la PWA n’est pas active.                  | Must     |
| F4  | Mode Focus                      | UI plein écran, timer Pomodoro, micro-interactions fluides.                                 | Must     |
| F5  | UI Apple-like                   | Style minimal, glassmorphism, animations organiques, responsive iPhone; pas de navbar/menu. | Must     |
| F6  | Ajout à l’écran d’accueil       | Installation PWA classique via Safari.                                                      | Must     |
| F7  | Météo locale                    | Affiche la météo actuelle basée sur la géolocalisation de l’utilisateur.                    | Must     |
| F8  | Message personnalisé            | Affiche « Bonjour/Bonsoir/Bien dormi » + nom saisi par l’utilisateur selon l’heure.         | Must     |
| F9  | Fake Dynamic Island (optionnel) | Composant en haut imitant la Dynamic Island pour tâche active/timer.                        | Must     |
| F10 | Thème clair/sombre              | Basé sur préférence système iOS.                                                            | Could    |

---

### 6. Exigences non-fonctionnelles

* **Performances** : Chargement initial ≤ 1s, animations < 400ms.
* **Accessibilité** : WCAG AA, zones tactiles ≥ 44px.
* **Sécurité** : HTTPS, permissions explicites.
* **UX iOS** : Utiliser les conventions Apple (gestes, tailles, polices).
* **Maintenabilité** : Code TS strict, architecture modulaire.
* **Fullscreen** : Faire en sorte que l'app soit toujours en mode standalone.

---

### 7. UX/UI & Design

* **100% iPhone** : taille et espacement adaptés, portrait et paysage.
* **Style Apple** : glassmorphism, ombres subtiles, typographie SF Pro ou Inter.
* **Animations** : entrées/sorties, transitions de cartes, micro-interactions (Framer Motion).
* **Icônes** : SF Symbols ou packs SVG « Apple-like ».
* **Écran d’accueil** : unicité, tout accessible sans barre de navigation.

---

### 9. Critères d’acceptation

* Gestion des tâches fonctionnelle offline et online (intégration futur).
* Notifications push reçoivent les rappels configurés.
* Mode Focus immersif et timer opérationnel.
* Météo locale fiable et actualisée.
* Message de bienvenue correct selon l’heure et nom.
* UI/UX sans barre de navigation, 100% iPhone native-like.
