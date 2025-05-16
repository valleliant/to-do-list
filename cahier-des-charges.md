## Cahier des charges : PWA de gestion de tâches quotidiennes

Ce document détaille le projet de création d’une Progressive Web App (PWA) de to-do list, très visuelle, moderne et épurée, optimisée pour iPhone, et extensible avec de petites fonctionnalités supplémentaires.

---

### 1. Contexte & Objectifs

* **Contexte** : Disposer d’une app légère, installable via Safari sur iPhone, offrant une expérience utilisateur rapide, animations micro-interactions soignées et fonctionnement offline.
* **Objectif principal** : Gérer ses tâches du jour de façon fluide et intuitive.
* **Objectifs secondaires** :

  * Mode Focus immersif.
  * Rappels via push notifications.
  * Stockage local offline-first.
  * Affichage de la météo locale selon position.
  * Messages de bienvenue personnalisés selon nom et moment de la journée.
  * UX/UI très moderne et épuré, fond blanc majoritaire avec accents de couleurs vives.

---

### 2. Périmètre (MVP)

* **Utilisateur cible** : Utilisateurs iOS souhaitant une to-do list sans installer d’app native.
* **Plateforme principale** : iPhone (Safari + ajout à l’écran d’accueil).
* **Fonctionnalités essentielles (v1)** :

  1. CRUD tâches (ajout, édition, suppression).
  2. Stockage local (IndexedDB via localforage) — pas de DB externe pour l’instant.
  3. Push notifications pour rappels.
  4. Mode Focus / Deep Work avec timer Pomodoro.
  5. Affichage de la météo locale (API meteo + géolocalisation).
  6. Message de bienvenue personnalisé (Bonjour/Bonsoir/Bien dormi) + nom utilisateur.
  7. UI moderne et épuré : fond majoritairement blanc, micro-animations, touches de couleurs pour dynamiser.
  8. Expérience sans barre de navigation : tout accessible depuis l’écran d’accueil.

---

### 3. Technologies & Outils

* **Framework** : Next.js

  * Plugin **next-pwa** pour service worker, manifest, offline.
* **Langage** : TypeScript
* **UI** : TailwindCSS
* **Animations** : Framer Motion (micro-animations) et Lottie (icônes animées simples)
* **Stockage local** : IndexedDB (via `localforage`)
* **Push Notifications** : Web Push API
* **Géolocalisation** : `navigator.geolocation`
* **API Météo** : API tierce (OpenWeather, MeteoSwiss, etc.)
* **Déploiement** : Vercel
* **Icônes** : Pack d’icônes minimalistes, style moderne (SVG monochromes avec accents colorés)

---

### 4. Architecture générale

```plaintext
Client PWA (Next.js)
├─ Pages / Components
│   ├─ Home.tsx (to-do list, météo, message de bienvenue)
│   ├─ FocusMode.tsx (mode plein écran)
│   └─ Composants UI (Button, Card, IslandFake)
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
    └─ greeting.ts (message selon heure)
```

---

### 5. Exigences fonctionnelles

| ID  | Fonctionnalité                  | Description                                                                                    | Priorité |
| --- | ------------------------------- | ---------------------------------------------------------------------------------------------- | -------- |
| F1  | CRUD tâches                     | Création, lecture, modification, suppression de tâches (titre, échéance, priorité).            | Must     |
| F2  | Stockage local offline          | Persist unique via IndexedDB; disponible hors ligne.                                           | Must     |
| F3  | Push notifications              | Rappels programmables; notifications push même si PWA inactive.                                | Must     |
| F4  | Mode Focus                      | UI plein écran, timer Pomodoro, micro-animations fluides.                                      | Must     |
| F5  | UI moderne et épuré             | Fond blanc, accents de couleurs dynamiques, transitions et micro-interactions (Framer Motion). | Must     |
| F6  | Ajout à l’écran d’accueil       | Installation PWA via Safari.                                                                   | Must     |
| F7  | Météo locale                    | Affiche météo actuelle basée sur géolocalisation.                                              | Must     |
| F8  | Message personnalisé            | Affiche message selon moment de la journée + nom utilisateur.                                  | Must     |
| F9  | Fake Dynamic Island (optionnel) | Composant en haut imitant une bulle info dynamique.                                            | Could    |
| F10 | Thèmes et couleurs              | Palette claire majoritaire avec accents colorés.                                               | Could    |

---

### 6. Exigences non-fonctionnelles

* **Performances** : Chargement initial ≤ 1s, micro-animations < 300ms.
* **Accessibilité** : Contraste WCAG AA, zones tactiles ≥ 44px.
* **Sécurité** : HTTPS, permissions explicites.
* **Responsive** : Adapté à tous les formats iPhone (portrait/paysage).
* **Maintenabilité** : Code TS strict, architecture modulaire.

---

### 7. UX/UI & Design

* **Style moderne et épuré** : Dominante blanche, accents colorés pour points d’intérêt (boutons, statuts).
* **Micro-animations** : Entrée/sortie des tâches, effet de survol et de sélection, transitions douces.
* **Typographie** : Sans-serif contemporaine (Inter).
* **Layouts** : Cartes minimalistes, espacements généreux, icônes monochromes accentuées.
* **Écran d’accueil unique** : Pas de barre de navigation, tous les modules accessibles via un scroll vertical simple.

---

### 8. Planification & Livrables

| Étape                   | Livrable                    | Durée estimée |
| ----------------------- | --------------------------- | ------------- |
| Setup starter           | Repo GitHub + CI pipeline   | 1 jour        |
| Développement MVP       | CRUD + offline + notif      | 3–4 jours     |
| UI & micro-animations   | Composants & Framer Motion  | 2–3 jours     |
| Météo & géolocalisation | Integration API météo + geo | 1 jour        |
| Message persos          | Greeting fonctionnel        | 0.5 jour      |
| Tests & optimisations   | Perf & QA manuels           | 1–2 jours     |
| Déploiement & doc       | Vercel + README             | 1 jour        |

---

### 9. Critères d’acceptation

* Gestion des tâches fonctionnelle offline.
* Notifications push reçoivent les rappels configurés.
* Mode Focus immersif et timer opérationnel.
* Météo locale fiable et actualisée.
* Message de bienvenue correct selon heure et nom.
* UX moderne et épuré, animations micro-interactions bien visibles.
* Interface mono-écran sans menu visible.

---

