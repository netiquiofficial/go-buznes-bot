# Mission : Créer une nouvelle version professionnelle de l’application Go Buznes

Vous êtes un architecte logiciel senior. Vous allez créer un nouveau dépôt GitHub pour une application web de marketplace nommée **Go Buznes**.  
L’application existante (dont le code est fourni en référence) est fonctionnelle mais manque de structure, de sécurité et d’optimisations.  
Votre tâche est de **reconstruire cette application dans un nouveau dépôt**, en suivant les meilleures pratiques modernes, sans reprendre directement l’ancien code (sauf pour la logique métier et les données).  

---

## Contexte du projet

Go Buznes est une vitrine commerciale pour la ville de Goma (RDC). Elle permet :
- Afficher des boutiques et leurs articles (avec badges « Or » et « Bleu »).
- Visualiser des annonces publicitaires (avec compteur à rebours).
- Rechercher des produits et des boutiques.
- Partager des liens profonds vers des boutiques, articles ou annonces.
- Contacter les vendeurs via WhatsApp.
- Gérer l’état hors-ligne avec un cache local.

Le nouveau dépôt doit contenir toute l’application avec une architecture claire, des tests, un système de build et une documentation.

---

## 1. Initialisation du nouveau dépôt

- Créez un nouveau dépôt sur GitHub (ou simulez-le) nommé `go-buznes-v2`.
- Initialisez un projet avec **Vite** (ou un bundler de votre choix) pour la gestion des modules, du HMR et du build.
- Utilisez `npm` ou `yarn` pour les dépendances.
- Configurez un fichier `.gitignore` approprié (node_modules, dist, fichiers de configuration locaux, etc.).
- Ajoutez un fichier `README.md` complet (voir section 8).

---

## 2. Organisation du code (structure de dossiers)

src/
├── assets/            (images, polices, icônes)
├── components/        (composants UI réutilisables : Card, Badge, Modal, SearchBar, etc.)
├── services/          (API, cache, crypto, storage)
├── store/             (gestion d’état centralisée – pattern Observer ou Pinia-like)
├── views/             (pages principales : Home, Stores, Sell, Biens, Profil)
├── utils/             (helpers, formateurs, validateurs, constants)
├── styles/            (fichiers CSS modulaires, variables, thèmes)
├── router/            (gestion des routes et des liens profonds)
├── app.js             (point d’entrée de l’application)
└── main.js            (fichier de lancement Vite)


---

## 3. Fonctionnalités à implémenter (conservées et améliorées)

- **Affichage de l’accueil** : stories des boutiques vedettes, classement top 3, grille des bonnes affaires (≤ 20 USD), annonces publicitaires en haut et en bas.
- **Liste des boutiques** : affichage avec filtres par badge (Or, Bleu, Toutes), podium des plus grands catalogues.
- **Page « Vendre »** : formulaire de contact pour créer une boutique, ajouter un article, signaler un problème, ou donner un avis (redirection vers WhatsApp).
- **Page « Biens »** : affichage des annonces actives avec images et compte à rebours.
- **Page « Profil »** : catalogue global de tous les articles, trié par prix croissant, avec chargement progressif (+100 articles).
- **Recherche** : barre de recherche avec suggestions instantanées et historique local.
- **Partage et liens profonds** : génération d’URLs de la forme `/Boutique/:id`, `/Article/:boutiqueId/:articleId`, `/Annonce/:id`, avec redirection intelligente et métadonnées Open Graph (via des fichiers statiques générés à la volée).
- **Modales d’aperçu** : affichage détaillé d’un produit (image, prix, description, bouton WhatsApp, lien vers la boutique).
- **Gestion des badges** : les badges Or et Bleu sont attribués aux boutiques et doivent expirer (vérification de la date de fin).
- **Chiffrement des données** : les données (boutiques, articles, annonces) sont stockées dans des fichiers JSON chiffrés (actuellement en XOR). Améliorez le chiffrement en utilisant un algorithme standard (AES-GCM) avec une clé issue d’une variable d’environnement.

---

## 4. Sécurité et performances

- **Clé secrète** : ne pas la mettre en dur. Utiliser `import.meta.env.VITE_SECRET_KEY` (Vite) ou `process.env`.
- **Chiffrement** : remplacer le XOR par AES-GCM (via Web Crypto API ou une bibliothèque comme `crypto-js`).
- **Assainissement** : échapper les sorties HTML pour prévenir les XSS (utiliser `textContent` ou des bibliothèques de templating sécurisées).
- **Cache et offline** : mettre en place un Service Worker (Workbox) pour mettre en cache les assets et les données indexées (IndexedDB pour les données déchiffrées).
- **Lazy loading** : charger les images uniquement lorsqu’elles entrent dans le viewport (utilisation de `IntersectionObserver`).
- **Bundle optimisé** : code splitting automatique par page (via Vite).

---

## 5. Gestion d’état

- Créez un **store central** (par exemple, une classe `Store` avec des propriétés réactives) qui :
  - Contient les listes de boutiques, produits et annonces.
  - Fournit des méthodes pour les mettre à jour (ex: `setBoutiques`, `addProducts`).
  - Notifie les composants des changements (pattern Observable ou via un système d’événements personnalisés).
- Le store doit être initialisé au démarrage de l’application avec les données récupérées depuis les fichiers distants (via les services).

---

## 6. Services (couche data)

- **VaultStream** : service pour récupérer les fichiers JSON chiffrés depuis le serveur (avec gestion du mode local ou GitHub API).
- **PostStream** : service dédié aux annonces.
- **CryptoService** : méthodes `chiffrer` et `dechiffrer` utilisant AES-GCM.
- **StorageService** : wrapper autour de `localStorage` et `IndexedDB` pour le cache persistant.
- **ImageService** : chargement des images avec gestion du squelette (shimmer) et cache mémoire.

---

## 7. Composants UI réutilisables

- **`<ProductCard>`** : affiche une carte produit (image, titre, prix, badge, bouton info).
- **`<StoreCard>`** : carte boutique (logo, nom, adresse, badge, nombre d’articles).
- **`<AdCard>`** : carte annonce (images, titre, description, compte à rebours, bouton partage).
- **`<Modal>`** : composant générique pour les fenêtres modales (alerte, confirmation, aperçu produit).
- **`<SearchBar>`** : barre de recherche avec dropdown de suggestions.
- **`<StatsHeader>`** : affiche les compteurs de boutiques et badges.
- **`<BottomNav>`** : barre de navigation avec icônes et liens vers les vues.

Tous ces composants doivent être écrits en JavaScript pur (ou avec une bibliothèque légère comme Preact si vous le souhaitez, mais vanilla est préféré pour la légèreté).

---

## 8. Tests et qualité

- Configurez **Vitest** (ou Jest) pour les tests unitaires.
- Écrivez des tests pour :
  - Le chiffrement/déchiffrement.
  - Les méthodes du store.
  - Les services (mock des fetch).
  - Les composants (rendu et événements) avec `@testing-library/dom`.
- Mettez en place **ESLint** (configuration recommandée) et **Prettier**.
- Ajoutez un hook pre-commit (Husky + lint-staged) pour formater et vérifier le code avant chaque commit.

---

## 9. Build et déploiement

- Utilisez Vite comme outil de build.
- Scripts `package.json` :
  - `dev` : lancement du serveur de développement.
  - `build` : génération des fichiers optimisés dans `dist/`.
  - `preview` : aperçu de la version de production.
  - `test` : exécution des tests.
- Configurez GitHub Actions pour :
  - Exécuter les tests à chaque push.
  - Déployer automatiquement le contenu du dossier `dist/` sur la branche `gh-pages` (ou utiliser un autre service d’hébergement).

---

## 10. Documentation

Rédigez un `README.md` contenant :
- Présentation du projet.
- Technologies utilisées.
- Instructions d’installation (`npm install`, `npm run dev`).
- Structure des dossiers expliquée.
- Variables d’environnement nécessaires (avec un exemple `.env.example`).
- Comment contribuer.
- Licence (MIT par défaut).

Ajoutez également un guide pour l’administration des données (comment ajouter/modifier des boutiques, articles ou annonces via les fichiers JSON chiffrés).

---

## 11. Consignes supplémentaires

- **Ne pas copier-coller l’ancien code** : utilisez-le comme référence pour comprendre la logique métier, mais réécrivez tout avec une architecture propre.
- **Adaptez le style CSS** : le design actuel est sobre (couleurs bleu roi, blanc, gris). Conservez cette identité visuelle en la modernisant (ombres, arrondis, transitions).
- **Respectez l’accessibilité** : attributs ARIA, contraste, navigation clavier.
- **Gérez les erreurs** : affichez des messages conviviaux en cas d’échec réseau ou de données corrompues.
- **Optimisez les images** : utilisez des formats modernes (WebP) si possible, et un chargement progressif.

---

## Livrable final

Vous devez fournir l’intégralité du code source du nouveau projet, organisé comme décrit, avec tous les fichiers nécessaires (y compris les configurations, tests, et documentation). Le projet doit être prêt à être cloné, installé et exécuté immédiatement.

**Important** : Le nouveau dépôt doit être indépendant de l’ancien. Aucune référence à l’ancien code ou à l’ancien dépôt ne doit apparaître, sauf pour le contexte métier.

---

**Démarrez maintenant en créant le nouveau dépôt et en écrivant le code étape par étape.**
