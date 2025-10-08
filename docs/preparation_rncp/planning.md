# Planning Prévisionnel - Knowledge Base Platform

**Projet** : Knowledge Base Platform
**Candidat** : Teddy
**Titre RNCP** : Développeur Web et Web Mobile (Niveau 5)
**Durée totale** : 4 mois (16 semaines)
**Méthodologie** : Agile/Scrum - Sprints de 2 semaines

---

## 📅 Calendrier prévisionnel

| Sprint | Période | Durée | Objectif principal | Statut |
|--------|---------|-------|-------------------|--------|
| **Sprint 0** | Semaines 1-2 | 2 sem. | Conception et setup | ✅ Terminé |
| **Sprint 1** | Semaines 3-4 | 2 sem. | Authentification et bases | ✅ Terminé |
| **Sprint 2** | Semaines 5-6 | 2 sem. | Gestion du contenu | ✅ Terminé |
| **Sprint 3** | Semaines 7-8 | 2 sem. | Chat IA et RAG | ✅ Terminé |
| **Sprint 4** | Semaines 9-10 | 2 sem. | Persistance conversations | ✅ Terminé |
| **Sprint 5** | Semaines 11-12 | 2 sem. | Permissions et collaboration | ✅ Terminé |
| **Sprint 6** | Semaines 13-14 | 2 sem. | I18n et optimisations | ✅ Terminé |
| **Sprint 7** | Semaines 15-16 | 2 sem. | Tests et déploiement | 🔄 En cours |

---

## 📋 Détail par Sprint

### Sprint 0 : Conception et setup (Semaines 1-2)

**Objectif** : Poser les bases du projet

#### Tâches planifiées

- [ ] Analyse des besoins utilisateurs
- [ ] Définition des 4 personas (Étudiant, Chercheur, Chef de projet, Développeur)
- [ ] Benchmarking des solutions existantes (Notion, Obsidian, Roam Research)
- [ ] Choix de la stack technique
  - [ ] Frontend : Next.js 15, React 19, TypeScript, TailwindCSS
  - [ ] Backend : Next.js API Routes, Prisma ORM
  - [ ] IA : Open-WebUI, Ollama, ChromaDB
  - [ ] Infrastructure : Docker, PostgreSQL, SearxNG, Apache Tika
- [ ] Configuration de l'environnement de développement
- [ ] Mise en place du dépôt Git (master/dev/feature/*)
- [ ] Création du `docker-compose.yml` pour orchestration
- [ ] Modélisation de la base de données (schéma Prisma)
- [ ] Rédaction du README.md

**Livrables** :

- ✅ Schéma de base de données
- ✅ Architecture système documentée
- ✅ Environnement Docker opérationnel
- ✅ Dépôt Git structuré

---

### Sprint 1 : Authentification et bases (Semaines 3-4)

**Objectif** : Système d'authentification et CRUD des bases de connaissance

#### Tâches planifiées - Sprint 1

**Authentification** :

- [ ] Installation et configuration Auth.js (NextAuth v5)
- [ ] Connexion email/mot de passe
- [ ] Hashage des mots de passe (bcrypt)
- [ ] Gestion des sessions
- [ ] Protection des routes avec middleware
- [ ] Page de login/register

**Base de données** :

- [ ] Configuration Prisma avec PostgreSQL
- [ ] Migrations initiales (User, KnowledgeBase, Note, File, URL)
- [ ] Seed de données de test

**CRUD Knowledge Bases** :

- [ ] Créer une base de connaissance
- [ ] Lister les bases de connaissance
- [ ] Éditer une base de connaissance
- [ ] Supprimer une base de connaissance
- [ ] Interface utilisateur avec Next.js

**Interface** :

- [ ] Layout de base avec TailwindCSS
- [ ] Composants UI (Button, Card, Input, Modal)
- [ ] Navigation responsive
- [ ] Dark mode

**Livrables** :

- ✅ Authentification fonctionnelle
- ✅ CRUD KB opérationnel
- ✅ Interface utilisateur de base

---

### Sprint 2 : Gestion du contenu (Semaines 5-6)

**Objectif** : Ajouter différents types de contenu aux bases de connaissance

#### Tâches planifiées - Sprint 2

**Système de notes** :

- [ ] Créer une note (texte Markdown)
- [ ] Éditer une note avec éditeur WYSIWYG
- [ ] Supprimer une note
- [ ] Lier notes aux KB
- [ ] Recherche full-text dans les notes

**Upload de fichiers** :

- [ ] Configuration Apache Tika (parsing PDF, DOCX, etc.)
- [ ] Upload de fichiers (drag & drop)
- [ ] Extraction du contenu avec Tika
- [ ] Stockage des fichiers et métadonnées
- [ ] Liste et suppression de fichiers

**Ajout d'URLs** :

- [ ] Configuration SearxNG pour web scraping
- [ ] Ajout d'URL avec ingestion
- [ ] Extraction du contenu web
- [ ] Stockage du contenu
- [ ] Liste et suppression d'URLs

**Indexation RAG** :

- [ ] Configuration ChromaDB
- [ ] Création d'embeddings pour notes/fichiers/URLs
- [ ] Indexation automatique dans ChromaDB
- [ ] Recherche sémantique de base

**Livrables** :

- ✅ CRUD notes complet
- ✅ Upload et parsing de fichiers
- ✅ Ingestion d'URLs
- ✅ Indexation ChromaDB

---

### Sprint 3 : Chat IA et RAG (Semaines 7-8)

**Objectif** : Intégrer le chat IA avec RAG

#### Tâches planifiées - Sprint 3

**Intégration Open-WebUI** :

- [ ] Configuration Open-WebUI avec Docker
- [ ] Connexion à Ollama (LLMs locaux)
- [ ] API proxy pour requêtes chat

**Implémentation RAG** :

- [ ] Recherche sémantique dans ChromaDB
- [ ] Construction du contexte avec top-k résultats
- [ ] Prompt engineering pour RAG
- [ ] Injection du contexte dans le prompt

**Streaming SSE** :

- [ ] Configuration Server-Sent Events
- [ ] Streaming des réponses token par token
- [ ] Gestion des erreurs de streaming
- [ ] Indicateur de chargement

**Interface chat** :

- [ ] Composant Chat UI
- [ ] Liste des messages
- [ ] Input utilisateur
- [ ] Affichage streaming des réponses
- [ ] Citations des sources (notes/fichiers/URLs)

**Livrables** :

- ✅ Chat IA fonctionnel
- ✅ RAG opérationnel
- ✅ Streaming temps réel
- ✅ Interface chat intuitive

---

### Sprint 4 : Persistance des conversations (Semaines 9-10)

**Objectif** : Sauvegarder et gérer l'historique des conversations

#### Tâches planifiées - Sprint 4

**Modèle de données** :

- [ ] Migration Prisma (Conversation, Message)
- [ ] Relations Conversation ↔ KnowledgeBase ↔ User
- [ ] Stockage des métadonnées (titre, date, token count)

**Sauvegarde automatique** :

- [ ] Création automatique de conversation au 1er message
- [ ] Sauvegarde de chaque message (user + assistant)
- [ ] Génération de titre de conversation
- [ ] Mise à jour des métadonnées

**Gestion de l'historique** :

- [ ] Liste des conversations par KB
- [ ] Affichage d'une conversation complète
- [ ] Reprise d'une conversation (chargement historique)
- [ ] Renommer une conversation
- [ ] Supprimer une conversation
- [ ] Recherche dans les conversations

**Interface** :

- [ ] Sidebar avec liste des conversations
- [ ] Bouton "Nouvelle conversation"
- [ ] Actions contextuelles (renommer, supprimer)
- [ ] Filtres et recherche

**Livrables** :

- ✅ Persistance automatique
- ✅ Historique complet
- ✅ Reprise de conversation
- ✅ Interface de gestion

---

### Sprint 5 : Permissions et collaboration (Semaines 11-12)

**Objectif** : Système de rôles et partage de bases de connaissance

#### Tâches planifiées - Sprint 5

**Système de rôles** :

- [ ] Définition des rôles (Admin, Editor, Viewer)
- [ ] Modèle de données (UserKnowledgeBase avec role)
- [ ] Middleware de vérification des permissions
- [ ] Tests d'autorisation

**Permissions par action** :

- [ ] Admin : Toutes actions + gestion des membres
- [ ] Editor : CRUD notes/files/URLs, lecture chat
- [ ] Viewer : Lecture seule (notes, chat)
- [ ] Matrice de permissions documentée

**Partage de KB** :

- [ ] Inviter des collaborateurs (par email)
- [ ] Acceptation d'invitation
- [ ] Liste des membres avec rôles
- [ ] Modifier le rôle d'un membre
- [ ] Retirer un membre
- [ ] Quitter une KB partagée

**Interface** :

- [ ] Page de gestion des membres
- [ ] Formulaire d'invitation
- [ ] Liste des membres avec actions
- [ ] Indicateurs visuels de rôle

**Livrables** :

- ✅ RBAC fonctionnel
- ✅ Partage de KB
- ✅ Tests de permissions
- ✅ Interface de collaboration

---

### Sprint 6 : Internationalisation et optimisations (Semaines 13-14)

**Objectif** : Support multilingue et amélioration des performances

#### Tâches planifiées - Sprint 6

**Internationalisation (i18n)** :

- [ ] Installation next-intl
- [ ] Dictionnaires FR/EN
- [ ] Traduction de l'interface
- [ ] Sélecteur de langue
- [ ] Détection automatique de la langue
- [ ] URLs localisées

**Optimisations UI/UX** :

- [ ] Amélioration du design (spacing, colors)
- [ ] Animations et transitions
- [ ] Feedback utilisateur (toasts, loading states)
- [ ] Raccourcis clavier
- [ ] Accessibilité (ARIA, contrast, keyboard nav)

**Optimisations performances** :

- [ ] Optimisation des requêtes Prisma
- [ ] Mise en cache avec React Query
- [ ] Lazy loading des composants
- [ ] Optimisation des images
- [ ] Code splitting
- [ ] Lighthouse audit (>90 score)

**Documentation** :

- [ ] Documentation technique complète
- [ ] Documentation API (Swagger)
- [ ] Guide de contribution
- [ ] CHANGELOG.md

**Livrables** :

- ✅ Support FR/EN
- ✅ UI/UX améliorée
- ✅ Performances optimisées
- ✅ Documentation complète

---

### Sprint 7 : Tests et déploiement (Semaines 15-16)

**Objectif** : Tests complets et mise en production

#### Tâches planifiées - Sprint 7

**Tests unitaires** :

- [ ] Tests des composants React (Vitest + Testing Library)
- [ ] Tests des utilitaires
- [ ] Tests des hooks personnalisés
- [ ] Couverture >80%

**Tests d'intégration** :

- [ ] Tests des API routes
- [ ] Tests de la base de données (Prisma)
- [ ] Tests d'authentification
- [ ] Tests de permissions

**Tests E2E** :

- [ ] Configuration Playwright
- [ ] Scénarios utilisateur complets
  - [ ] Inscription/Connexion
  - [ ] Créer KB et ajouter contenu
  - [ ] Utiliser le chat IA
  - [ ] Partager une KB
- [ ] Tests multi-navigateurs

**Tests de sécurité** :

- [ ] Tests OWASP (injection SQL, XSS, CSRF)
- [ ] Tests de permissions
- [ ] Audit de dépendances (npm audit)
- [ ] Scan de vulnérabilités

**Déploiement** :

- [ ] Configuration Docker Compose production
- [ ] Variables d'environnement sécurisées
- [ ] HTTPS avec certificat SSL
- [ ] Monitoring et logs (Sentry)
- [ ] Sauvegarde automatique BDD
- [ ] CI/CD avec GitHub Actions
- [ ] Déploiement sur serveur/cloud
- [ ] Démo live accessible

**Documentation finale** :

- [ ] README.md utilisateur
- [ ] Guide d'installation
- [ ] Documentation de déploiement
- [ ] Support de présentation (slides)
- [ ] Dossier RNCP complet

**Livrables** :

- 🔄 Suite de tests complète
- 🔄 Application déployée
- 🔄 Documentation finale
- 🔄 Préparation soutenance

---

## 🎯 Méthode de priorisation : MoSCoW

### Must Have (Obligatoire - MVP)

- ✅ Authentification sécurisée
- ✅ CRUD bases de connaissance
- ✅ Ajout de contenu (notes, fichiers, URLs)
- ✅ Chat IA avec RAG
- ✅ Interface responsive

### Should Have (Important)

- ✅ Persistance des conversations
- ✅ Système de permissions
- ✅ Partage de KB
- 🔄 Tests automatisés

### Could Have (Souhaitable)

- ✅ Internationalisation FR/EN
- ✅ Optimisations performances
- 🔄 Déploiement production

### Won't Have (Reporté)

- ❌ Collaboration temps réel (WebSockets)
- ❌ Application mobile native
- ❌ Intégration Slack/Teams
- ❌ Export PDF des conversations

---

## 📊 Indicateurs de suivi

| Métrique | Objectif | Actuel | Statut |
|----------|----------|--------|--------|
| **Sprints complétés** | 7/7 | 6/7 | 🔄 86% |
| **Fonctionnalités MVP** | 100% | 100% | ✅ |
| **Couverture tests** | >80% | 75% | 🔄 |
| **Score Lighthouse** | >90 | 92 | ✅ |
| **Vulnérabilités** | 0 critical | 0 | ✅ |
| **Documentation** | Complète | 90% | 🔄 |

---

## 🔄 Réajustements et adaptations

### Changements par rapport au plan initial

| Sprint | Changement | Raison | Impact |
|--------|-----------|--------|--------|
| Sprint 3 | Ajout Server-Sent Events | Meilleure UX pour streaming | +2 jours |
| Sprint 4 | Auto-génération titres conversations | Amélioration UX | +1 jour |
| Sprint 5 | Simplification système d'invitation | Complexité réduite | -2 jours |
| Sprint 6 | Ajout next-intl (non prévu) | Besoin i18n identifié | +3 jours |

---

## 📋 Checklist RNCP 5 - Critères de conformité

### 1. Analyse et formalisation du besoin

[ ] Le projet répond à un besoin ou à une problématique concrète, clairement présentée.
[x] Il existe un document (ou une présentation) expliquant la finalité du projet (objectifs, fonctionnalités).
[ ] Le mode de recueil des besoins (entretiens, questionnaire, cahier des charges…) est explicité.
[ ] Les utilisateurs cibles ou personas sont identifiés (ex. : grand public, collaborateurs internes…).
Remarques :

### 2. Planning et organisation

[ ] Le projet inclut un rétroplanning ou un planning prévisionnel (même basique) indiquant les grandes étapes.
[ ] Les phases du projet (conception, développement, tests, mise en production) sont distinguées.
[ ] L'équipe (ou l'étudiant seul) a utilisé un outil de suivi (Trello, GitHub Projects, etc.) pour répartir les tâches.
Remarques :

### 3. Maquettage, Design responsive & CSS

[ ] Existence d'une maquette ou d'un prototype (basse/haute fidélité) pour l'interface utilisateur.
[ ] Présentation de la structure du site ou de l'appli (arborescence, [wireframes](https://cdn-images.visual-paradigm.com/handbooks/agile-handbook/wireframe/01-youtube-wireframe-example.png), user flow…).
[ ] Justification de choix ergonomiques (placement des boutons, menus, formulaires…).
[x] L'interface est responsive (adaptation smartphone, tablette, desktop).
[x] L'usage du CSS (ou d'un framework comme Bootstrap, Tailwind) est cohérent (charte graphique, cohésion visuelle).
[x] Les techniques de design responsive sont maîtrisées (media queries, grilles flexibles, images adaptatives).
[ ] Un système de design ou guide de style est documenté (couleurs, typographies, composants).
Remarques :

### 4. Base de données et architecture applicative

[x] Le projet présente clairement la structure des données ([MCD](https://www.tlgpro.fr/wp-content/uploads/2019/05/MCD-Exemple.jpg), schéma, etc.).
[x] L'architecture choisie (front-end / back-end, MVC, microservices, etc.) est expliquée.
[ ] Les technologies serveur (PHP, Node.js, etc.) et SGBD (MySQL, MongoDB, etc.) sont justifiées.
Remarques :

### 5. Fonctionnalités réalisées

[x] Le projet démontre au moins 2-3 fonctionnalités concrètes et utiles pour l'utilisateur final.
[x] La gestion des utilisateurs (inscription, connexion, rôles) est implémentée (si pertinent).
[x] Les appels externes (API tierces, services en ligne, etc.) sont intégrés (si pertinent).
[ ] Les fonctionnalités sont présentées de manière démonstrative (captures d'écran, démo live…).
Remarques :

### 6. Backend - Sécurité

[x] Les aspects sécurité sont pris en compte (protégé contre injections SQL, XSS, CSRF…).
[x] Les mots de passe sont correctement hashés (bcrypt, Argon2…).
[x] Mise en place d'un système d'authentification sécurisé (JWT, sessions, OAuth…).
[x] Validation et sanitisation des données côté serveur.
[x] Gestion des erreurs sans exposer d'informations sensibles.
[ ] Protection contre les attaques par force brute (rate limiting, captcha).
[ ] Le HTTPS est configuré (environnement de prod) ou du moins planifié.
[ ] Les headers de sécurité sont configurés (CSP, X-Frame-Options, HSTS…).
[ ] Gestion sécurisée des variables d'environnement et secrets (clés API, credentials).
Remarques :

### 7. RGPD & Protection des données

[ ] Respect minimal du RGPD (mention des données personnelles, consentements si nécessaire).
[ ] Présence d'une politique de confidentialité et mentions légales.
[ ] Mise en place du consentement pour les cookies (si applicable).
[ ] Possibilité pour l'utilisateur d'accéder, modifier ou supprimer ses données.
[ ] Durée de conservation des données définie et justifiée.
[ ] Mesures de sécurité pour protéger les données personnelles.
[ ] Minimisation de la collecte de données (principe de minimisation).
Remarques :

### 8. Qualité du code et gestion de versions

[x] Un dépôt Git est disponible et l'historique montre une utilisation régulière (commits pertinents).
[x] L'organisation des branches (develop, feature branches…) est cohérente.
[x] Il y a un minimum de commentaires dans le code ou un README technique pour guider le lecteur.
[x] Le code respecte les conventions de nommage et standards de qualité.
[x] Utilisation d'un linter ou formateur de code (ESLint, Prettier, PSR…).
Remarques :

### 9. Accessibilité

[x] Un soin est apporté à l'accessibilité (au moins des contrastes suffisants, textes alternatifs).
[x] Utilisation correcte des balises sémantiques HTML5.
[ ] Navigation au clavier fonctionnelle (tabulation, focus visible).
[ ] Attributs ARIA utilisés quand nécessaire.
[ ] Test avec un lecteur d'écran effectué (NVDA, JAWS, VoiceOver…).
[ ] Respect des normes WCAG 2.1 (niveau A ou AA minimum).
[x] Audit d'accessibilité réalisé avec Lighthouse, Axe ou WAVE.
Remarques :

### 10. Tests Frontend

[x] Des tests unitaires frontend sont implémentés (Jest, Vitest, Mocha…).
[x] Des tests d'intégration ou E2E sont mis en place (Cypress, Playwright, Selenium…).
[x] Les principales interactions utilisateur sont testées automatiquement.
[ ] Tests de régression visuelle si applicable (Percy, Chromatic…).
[ ] Tests de compatibilité multi-navigateurs documentés.
[ ] Utilisation d'outils de validation HTML/CSS (W3C Validator).
Remarques :

### 11. Tests Backend & Infrastructure

[x] Le projet inclut des tests unitaires backend.
[x] Des tests d'intégration API sont présents (Postman, Insomnia, tests automatisés…).
[x] Les endpoints sont testés avec différents scénarios (succès, erreurs, edge cases).
[ ] Tests de charge ou performance effectués si pertinent (JMeter, k6…).
[ ] Utilisation de CI/CD pour l'exécution automatique des tests (GitHub Actions, GitLab CI…).
[ ] Documentation des tests et couverture de code mesurée.
Remarques :

### 12. SEO (Référencement naturel)

[x] Les balises meta (title, description) sont correctement renseignées.
[x] Structure sémantique du HTML respectée (h1, h2, etc.).
[x] URLs propres et lisibles (slug SEO-friendly).
[ ] Fichier sitemap.xml généré et robots.txt configuré.
[ ] Temps de chargement optimisé (images compressées, lazy loading…).
[ ] Open Graph et Twitter Cards configurés pour le partage social.
[ ] Audit SEO réalisé avec Lighthouse ou d'autres outils (SEMrush, Ahrefs…).
[ ] Schema.org / données structurées implémentées si pertinent.
Remarques :

### 13. Infrastructure & Déploiement

[ ] Le projet est hébergé quelque part (serveur, plateforme type Heroku, Netlify, Vercel, AWS…) ou déployable.
[x] Le processus de déploiement (comment installer et lancer l'appli) est documenté.
[ ] Configuration de l'environnement de production (variables d'env, base de données…).
[x] Utilisation de conteneurs (Docker) ou orchestration (Kubernetes) si applicable.
[ ] Mise en place de sauvegardes automatiques des données.
[ ] Monitoring et logs configurés (Sentry, LogRocket, CloudWatch…).
[ ] Stratégie de mise à jour et rollback définie.
[ ] Une URL de démonstration (ou un APK, si mobile) est communiquée et fonctionne.
Remarques :

### 14. Documentation & soutenance

[x] Une documentation utilisateur est fournie (même succincte : installation, démarrage, usage).
[x] Une documentation technique est disponible (architecture, schéma BDD, dépendances).
[ ] Le support de présentation / soutenance est clair et reflète la réalisation (slides, notes, etc.).
[x] Documentation API (Swagger, Postman collection…) si applicable.
[ ] Guide de contribution pour les développeurs futurs.
Remarques :
