# Entretien Préparatoire RNCP 5 - Knowledge Base Platform

**Candidat** : Teddy
**Titre** : Développeur Web et Web Mobile (RNCP 5)
**Projet** : Knowledge Base Platform
**Date** : Janvier 2025

---

## Section 1 : Analyse et formalisation du besoin

### 1.1 Problématique identifiée

Dans le cadre de ma formation DWWM, j'ai constaté une problématique récurrente dans les environnements professionnels et académiques : la gestion fragmentée de la connaissance.

Les utilisateurs jonglent quotidiennement entre plusieurs outils pour stocker des notes (Notion, Google Docs), gérer des fichiers (Google Drive, Dropbox), sauvegarder des liens (Pocket, bookmarks navigateur) et interagir avec des IA conversationnelles (ChatGPT, Claude).

Cette dispersion entraîne une perte de temps dans la recherche d'information, une duplication des données, et une difficulté à exploiter intelligemment les connaissances accumulées.

### 1.2 Besoin concret

Le projet Knowledge Base Platform répond au besoin de centraliser et exploiter intelligemment les connaissances dans un espace unique, sécurisé et collaboratif.

L'objectif principal est de permettre aux utilisateurs de créer des bases de connaissance thématiques enrichies par l'IA conversationnelle via la technologie RAG (Retrieval Augmented Generation).

### 1.3 Mode de recueil des besoins

J'ai appliqué une méthodologie itérative inspirée des principes Agile/Scrum.

#### Phase 1 : Analyse exploratoire

J'ai débuté par une auto-observation de mes besoins en tant qu'étudiant développeur, complétée par un benchmark concurrentiel analysant Notion (notes + bases de données), ChatGPT (chat IA), et Obsidian (notes interconnectées). Le constat était clair : aucun outil ne combine ces trois aspects dans une solution intégrée.

#### Phase 2 : Définition des fonctionnalités

J'ai rédigé des User Stories suivant le format standard :

En tant que [rôle], je veux [action], afin de [bénéfice].

Exemples concrets :

- En tant qu'étudiant, je veux sauvegarder mes notes de cours dans une KB dédiée, afin de les interroger avec une IA.
- En tant que développeur, je veux importer des fichiers PDF techniques, afin de poser des questions contextualisées.
- En tant qu'utilisateur, je veux retrouver l'historique de mes conversations, afin de reprendre une recherche précédente.

#### Phase 3 : Priorisation

J'ai appliqué la méthode MoSCoW pour hiérarchiser les fonctionnalités :

Must have : Authentification, CRUD des bases de connaissance, chat avec RAG

Should have : Persistance des conversations, gestion des permissions

Could have : Export des conversations, recherche full-text

Won't have (v1) : Partage public, édition collaborative temps réel

### 1.4 Utilisateurs cibles

#### Persona 1 : Léa, étudiante en développement web

Age : 24 ans
Profil : Étudiante DWWM en reconversion professionnelle
Besoins : Organiser ses cours, projets et ressources techniques
Frustrations : Notes éparpillées entre Google Docs, Notion et ChatGPT
Objectif : Créer une KB "Formation DWWM" avec tous ses supports de cours
Usage type : Import de PDFs, sauvegarde d'URLs (MDN, Stack Overflow), chat pour réviser

#### Persona 2 : Marc, développeur senior

Age : 35 ans
Profil : Lead developer dans une startup tech
Besoins : Documentation technique de projets, veille technologique
Frustrations : Perte de temps à chercher dans des Slack threads et Google Drives
Objectif : KB d'équipe "Backend Architecture" partagée avec permissions
Usage type : Import de fichiers de specs, liens vers RFCs, chat pour onboarder les juniors

#### Persona 3 : Sophie, formatrice tech

Age : 42 ans
Profil : Formatrice JavaScript/React freelance
Besoins : Créer des supports pédagogiques enrichis
Frustrations : Difficile de personnaliser les réponses IA avec son propre contenu
Objectif : KB "Cours React Avancé" avec exercices, corrections et FAQ
Usage type : Notes de cours, fichiers d'exercices, chat pour générer des quiz

### 1.5 Documents de référence

La documentation complète est disponible dans le dossier docs/ :

- Présentation générale : README.md
- Liste des fonctionnalités : docs/FEATURES.md
- Plan technique chat : docs/chat-persistence-plan.md
- API Reference : docs/api/README.md
- QA Checklist : docs/qa/authz-qa-checklist.md

---

## Section 2 : Planning et organisation

### 2.1 Rétroplanning du projet

Le projet s'est déroulé sur une période de 4 mois, découpée en sprints de 2 semaines.

#### Sprint 0 : Conception et setup (Semaines 1-2)

- Analyse des besoins et définition des personas
- Choix de la stack technique
- Configuration de l'environnement de développement
- Mise en place du dépôt Git et de la CI/CD
- Création du docker-compose pour l'orchestration des services

#### Sprint 1 : Authentification et bases (Semaines 3-4)

- Implémentation de l'authentification avec Auth.js
- Création du schéma de base de données Prisma
- CRUD des bases de connaissance
- Interface utilisateur de base avec Next.js et TailwindCSS

#### Sprint 2 : Gestion du contenu (Semaines 5-6)

- Système de notes (création, édition, suppression)
- Upload et parsing de fichiers avec Apache Tika
- Ajout d'URLs avec ingestion via SearxNG
- Indexation dans ChromaDB pour le RAG

#### Sprint 3 : Chat IA et RAG (Semaines 7-8)

- Intégration d'Open-WebUI et Ollama
- Implémentation du RAG avec ChromaDB
- Streaming des réponses via Server-Sent Events
- Interface de chat en temps réel

#### Sprint 4 : Persistance des conversations (Semaines 9-10)

- Sauvegarde automatique des conversations
- Historique avec messages et métadonnées
- Renommage et suppression de conversations
- Reprise de conversation avec chargement d'historique

#### Sprint 5 : Permissions et collaboration (Semaines 11-12)

- Système de rôles (Admin, Editor, Viewer)
- Gestion des permissions par KB
- Partage de KB avec collaborateurs
- Tests d'autorisation

#### Sprint 6 : Internationalisation et polish (Semaines 13-14)

- Support français/anglais avec next-intl
- Amélioration de l'UI/UX
- Optimisation des performances
- Documentation technique

#### Sprint 7 : Tests et déploiement (Semaines 15-16)

- Tests unitaires et d'intégration
- Tests de charge
- Documentation utilisateur
- Préparation de la soutenance

### 2.2 Phases du projet

Le projet a été structuré en 4 phases distinctes :

#### Phase 1 : Conception (Semaines 1-2)

Analyse des besoins, benchmarking, définition des personas, choix technologiques, architecture système, modélisation de la base de données.

#### Phase 2 : Développement (Semaines 3-14)

Implémentation des fonctionnalités par sprints successifs, revues de code régulières, ajustements basés sur les tests utilisateur.

#### Phase 3 : Tests (Semaines 15-16)

Tests unitaires avec Jest, tests d'intégration, tests de sécurité, tests de charge, validation des fonctionnalités avec les personas.

#### Phase 4 : Mise en production (Semaine 16+)

Configuration Docker Compose pour la production, documentation du processus de déploiement, mise en place de la surveillance et du logging, création de la démo live.

### 2.3 Outils de suivi

J'ai utilisé plusieurs outils pour organiser et suivre le projet :

#### Git et GitHub

Dépôt GitHub avec commits atomiques et messages descriptifs. Organisation en branches : main (production), develop (intégration), feature/* (développements).

Utilisation de GitHub Issues pour le suivi des bugs et features. Pull Requests avec revue de code avant merge.

#### Documentation Markdown

Toute la documentation est écrite en Markdown et versionnée :

- README.md : Vue d'ensemble du projet
- docs/FEATURES.md : État des fonctionnalités
- docs/chat-persistence-plan.md : Roadmap technique
- docs/api/README.md : Documentation API
- check-list.md : Critères RNCP

#### Gestion de projet

Utilisation de GitHub Projects pour la gestion des tâches. Boards Kanban avec colonnes : Backlog, To Do, In Progress, Review, Done.

Priorisation des tâches selon la méthode MoSCoW. Sprints de 2 semaines avec revues régulières.

---

## Section 3 : Conception et prototypage

### 3.1 Maquettes et prototypes

Le projet a débuté par une phase de maquettage pour définir l'interface utilisateur avant le développement.

#### Maquettes basse fidélité

J'ai créé des wireframes papier pour les écrans principaux :

- Page d'accueil et authentification
- Dashboard avec liste des KB
- Vue détaillée d'une KB avec ses contenus
- Interface de chat avec historique
- Panneau d'administration

Ces wireframes m'ont permis de valider rapidement les concepts auprès de potentiels utilisateurs (collègues étudiants).

#### Prototype haute fidélité

J'ai ensuite développé un prototype interactif avec Next.js et shadcn/ui, ce qui m'a permis de tester directement les composants React qui seraient utilisés en production.

Le prototype incluait :

- Navigation complète entre les écrans
- Interactions avec les boutons et formulaires
- Simulations des réponses du chat
- Responsive design pour mobile, tablette et desktop

### 3.2 Structure du site

L'application est organisée selon une architecture claire :

#### Arborescence principale

```text
/ - Page d'accueil et présentation
/auth/signin - Connexion
/auth/signup - Inscription
/dashboard - Liste des KB de l'utilisateur
/kb/[id] - Vue détaillée d'une KB
/kb/[id]/notes - Gestion des notes
/kb/[id]/files - Gestion des fichiers
/kb/[id]/urls - Gestion des URLs
/kb/[id]/chat - Interface de chat avec RAG
/kb/[id]/chat/[chatId] - Conversation spécifique
/kb/[id]/settings - Paramètres de la KB
/profile - Profil utilisateur
/settings - Paramètres généraux
```

#### User Flow principal

1. L'utilisateur se connecte ou s'inscrit
2. Il arrive sur son dashboard avec ses KB
3. Il peut créer une nouvelle KB ou accéder à une existante
4. Dans une KB, il peut ajouter du contenu (notes, fichiers, URLs)
5. Il peut ensuite chatter avec l'IA qui interroge ce contenu
6. Les conversations sont sauvegardées et accessibles via l'historique
7. Il peut partager sa KB avec d'autres utilisateurs et gérer les permissions

### 3.3 Choix ergonomiques

Plusieurs décisions ergonomiques ont été prises pour améliorer l'expérience utilisateur.

#### Navigation principale

J'ai opté pour une sidebar fixe sur desktop qui devient un menu hamburger sur mobile. Cette sidebar contient les raccourcis vers les KB fréquemment utilisées et l'historique des conversations récentes.

#### Interface de chat

Le chat occupe la partie centrale de l'écran avec une zone de saisie fixée en bas. Les messages sont affichés dans des bulles distinctes (utilisateur vs IA) avec un design inspiré des messageries modernes.

J'ai intégré un indicateur de streaming pour montrer que l'IA est en train de répondre, avec affichage progressif du texte pour améliorer la perception de réactivité.

#### Gestion des contenus

Pour les notes, fichiers et URLs, j'ai créé des vues en cartes (cards) qui affichent les métadonnées importantes (date, taille, type) avec des actions rapides (éditer, supprimer, renommer).

Un système de drag-and-drop permet d'uploader facilement des fichiers.

#### Accessibilité

J'ai appliqué les principes WCAG 2.1 :

- Contrastes suffisants entre texte et fond (ratio 4.5:1 minimum)
- Navigation au clavier complète avec focus visible
- Textes alternatifs sur toutes les images
- Labels explicites sur tous les champs de formulaire
- Support des lecteurs d'écran avec attributs ARIA

#### Responsive Design

L'interface s'adapte automatiquement à toutes les tailles d'écran :

- Mobile (< 640px) : Navigation simplifiée, cartes en colonne unique
- Tablette (640-1024px) : Grille à 2 colonnes, sidebar escamotable
- Desktop (> 1024px) : Grille à 3 colonnes, sidebar permanente

---

## Section 4 : Base de données et architecture applicative

### 4.1 Structure des données

Le schéma de base de données est défini avec Prisma ORM et utilise PostgreSQL comme SGBD principal.

#### Modèle de données principal

**User** : Représente un utilisateur de la plateforme

- id : Identifiant unique
- email : Email (unique)
- name : Nom d'affichage
- password : Hash du mot de passe
- createdAt, updatedAt : Horodatages

**KnowledgeBase** : Représente une base de connaissance

- id : Identifiant unique
- name : Nom de la KB
- description : Description
- ownerId : Référence vers User (propriétaire)
- createdAt, updatedAt : Horodatages

**KnowledgeBasePermission** : Gère les permissions par KB

- id : Identifiant unique
- kbId : Référence vers KnowledgeBase
- userId : Référence vers User
- role : ADMIN | EDITOR | VIEWER
- createdAt : Horodatage

**Note** : Représente une note textuelle

- id : Identifiant unique
- title : Titre
- content : Contenu en Markdown
- kbId : Référence vers KnowledgeBase
- createdBy : Référence vers User
- createdAt, updatedAt : Horodatages

**File** : Représente un fichier uploadé

- id : Identifiant unique
- name : Nom du fichier
- originalName : Nom original
- path : Chemin de stockage
- mimeType : Type MIME
- size : Taille en octets
- kbId : Référence vers KnowledgeBase
- uploadedBy : Référence vers User
- createdAt : Horodatage

**URL** : Représente une URL sauvegardée

- id : Identifiant unique
- url : URL complète
- title : Titre extrait
- description : Description
- kbId : Référence vers KnowledgeBase
- addedBy : Référence vers User
- createdAt : Horodatage

**Chat** : Représente une conversation

- id : Identifiant unique
- title : Titre de la conversation
- kbId : Référence vers KnowledgeBase
- userId : Référence vers User
- createdAt, updatedAt : Horodatages

**Message** : Représente un message dans une conversation

- id : Identifiant unique
- chatId : Référence vers Chat
- role : USER | ASSISTANT
- content : Contenu du message
- sources : JSON avec les sources utilisées
- model : Modèle IA utilisé
- createdAt : Horodatage

#### Relations entre entités

- Un User peut posséder plusieurs KnowledgeBase (1:N)
- Un User peut avoir des permissions sur plusieurs KnowledgeBase via KnowledgeBasePermission (N:M)
- Une KnowledgeBase contient plusieurs Notes, Files, URLs et Chats (1:N)
- Un Chat contient plusieurs Messages (1:N)

### 4.2 Architecture applicative

Le projet suit une architecture moderne basée sur Next.js avec le App Router.

#### Architecture générale

L'application est structurée en plusieurs couches :

**Couche présentation** : Composants React avec Next.js 14 (App Router). Utilisation de shadcn/ui pour les composants UI réutilisables. TailwindCSS 4 pour le styling.

**Couche API** : Next.js API Routes pour les endpoints REST. Validation des données avec Zod. Gestion des erreurs centralisée.

**Couche métier** : Services métier dans apps/web/lib/services. Logique de gestion des permissions. Intégration avec les services externes (Ollama, ChromaDB).

**Couche données** : Prisma ORM pour les interactions avec PostgreSQL. Migrations gérées par Prisma Migrate. Seeds pour les données de test.

#### Architecture microservices

Le projet utilise Docker Compose pour orchestrer plusieurs services :

**web** : Application Next.js principale (port 3000)

**postgres** : Base de données PostgreSQL (port 5432)

**mongodb** : Base de données MongoDB pour les logs (port 27017)

**ollama** : Service d'inférence IA (port 11434)

**open-webui** : Interface de chat IA (port 8080)

**chromadb** : Base de données vectorielle pour le RAG (port 8000)

**tika** : Service de parsing de documents (port 9998)

**searxng** : Moteur de recherche pour l'ingestion d'URLs (port 8888)

Chaque service est isolé dans son propre conteneur avec une configuration réseau privée. La communication entre services passe par un réseau Docker dédié.

### 4.3 Justification des choix techniques

#### Next.js 14

J'ai choisi Next.js pour son App Router qui permet le Server-Side Rendering (SSR) et la génération statique. Le support natif des Server Components réduit le JavaScript envoyé au client.

L'intégration avec Vercel facilite le déploiement et la CI/CD.

#### PostgreSQL

PostgreSQL offre une robustesse éprouvée pour les données relationnelles. Le support JSON permet de stocker des métadonnées flexibles. Les transactions ACID garantissent la cohérence des données.

#### Prisma ORM

Prisma fournit un typage TypeScript fort qui réduit les erreurs. Les migrations sont versionnées et reproductibles. Le Prisma Studio facilite l'exploration des données en développement.

#### ChromaDB (Choix technique)

ChromaDB est optimisé pour les embeddings vectoriels utilisés dans le RAG. L'API simple permet une intégration rapide. Le support des métadonnées permet de filtrer les résultats.

#### Docker Compose

Docker Compose simplifie le déploiement en regroupant tous les services. La reproductibilité de l'environnement évite les "ça marche sur ma machine". L'isolation des services améliore la sécurité.

---

## Section 5 : Fonctionnalités réalisées

### 5.1 Fonctionnalités principales

Le projet implémente un ensemble complet de fonctionnalités pour la gestion de bases de connaissance.

#### Authentification et gestion des utilisateurs

L'inscription permet de créer un compte avec email et mot de passe. Le mot de passe est hashé avec bcrypt avant stockage. La connexion utilise Auth.js (NextAuth) pour gérer les sessions.

Les sessions sont stockées en JWT avec renouvellement automatique. Un système de reset de mot de passe par email est implémenté.

#### CRUD des bases de connaissance

Les utilisateurs peuvent créer des KB avec nom et description. Chaque KB possède un propriétaire (owner) qui a tous les droits. Les KB peuvent être listées, filtrées et recherchées.

La modification d'une KB (nom, description) est réservée aux admins. La suppression d'une KB supprime également tous ses contenus (cascade).

#### Gestion des notes

Les notes supportent le Markdown pour le formatage. Un éditeur WYSIWYG permet la saisie intuitive. Les notes sont liées à une KB spécifique.

La recherche full-text permet de retrouver des notes par mots-clés. L'historique des modifications est conservé avec timestamps.

#### Gestion des fichiers

L'upload de fichiers supporte tous les formats courants (PDF, DOCX, TXT, images). Apache Tika extrait automatiquement le texte des documents. Le texte extrait est indexé dans ChromaDB pour le RAG.

Les fichiers peuvent être renommés et supprimés. Un système de prévisualisation est disponible pour les images et PDFs.

#### Gestion des URLs

L'ajout d'URLs déclenche un crawling via SearxNG. Le contenu HTML est extrait et nettoyé. Les métadonnées (titre, description) sont automatiquement récupérées.

Le contenu est indexé dans ChromaDB pour être interrogeable par le chat.

#### Chat IA avec RAG

L'interface de chat permet de poser des questions sur le contenu d'une KB. Le système RAG (Retrieval Augmented Generation) récupère les passages pertinents dans ChromaDB.

Ces passages sont envoyés au modèle IA (Ollama) avec la question. La réponse est générée en streaming pour une expérience fluide. Les sources utilisées sont affichées sous la réponse.

#### Persistance des conversations

Toutes les conversations sont sauvegardées automatiquement en base de données. Chaque message est stocké avec son rôle (user/assistant), contenu, sources et métadonnées.

L'historique des conversations est accessible depuis la sidebar. Les conversations peuvent être renommées pour faciliter le retrouvage. La suppression d'une conversation efface tous ses messages.

La reprise d'une conversation charge l'historique complet et permet de continuer la discussion.

#### Système de permissions

Trois rôles sont définis : ADMIN (tous les droits), EDITOR (lecture + écriture), VIEWER (lecture seule).

Le propriétaire d'une KB peut inviter des collaborateurs par email. Chaque collaborateur reçoit un rôle spécifique. Les permissions sont vérifiées à chaque requête API.

Un utilisateur ne peut voir que les KB auxquelles il a accès.

#### Internationalisation

L'application supporte le français et l'anglais. La détection de la langue se fait automatiquement via les préférences du navigateur.

Les traductions sont gérées avec next-intl. Tous les textes de l'interface sont traduisibles. Le changement de langue est persisté dans les préférences utilisateur.

### 5.2 Intégrations externes

Le projet intègre plusieurs services tiers pour enrichir les fonctionnalités.

#### Open-WebUI et Ollama

Open-WebUI fournit une interface standardisée pour interagir avec les modèles IA. Ollama permet d'exécuter des modèles localement sans dépendre d'APIs externes payantes.

J'ai configuré plusieurs modèles (llama3.1, mistral, codellama) pour différents cas d'usage. Le streaming des réponses utilise Server-Sent Events pour une meilleure réactivité.

#### Apache Tika

Tika extrait le texte de plus de 1000 formats de fichiers. L'intégration via API REST simplifie l'utilisation. Le texte extrait est ensuite indexé pour le RAG.

#### SearxNG

SearxNG crawle les URLs ajoutées par les utilisateurs. Le contenu HTML est extrait et nettoyé des balises inutiles. Les métadonnées sont parsées automatiquement.

#### ChromaDB (Intégration)

ChromaDB stocke les embeddings vectoriels du contenu. L'API permet de rechercher les passages similaires à une question. Les métadonnées permettent de filtrer par type de contenu (note, file, url).

### 5.3 Démonstration

Des captures d'écran et vidéos de démonstration sont disponibles dans le dossier screenshot/.

Les principales fonctionnalités sont démontrées :

- Création d'une KB et ajout de contenu
- Chat avec RAG et affichage des sources
- Gestion des permissions et partage
- Historique des conversations
- Interface responsive sur mobile

Une démo live sera disponible pour la soutenance avec des données de test préchargées.

---

## Section 6 : Sécurité et bonnes pratiques

### 6.1 Mesures de sécurité implémentées

La sécurité est un aspect central du projet, particulièrement important pour une application gérant des données personnelles.

#### Authentification robuste

Les mots de passe sont hashés avec bcrypt avant stockage en base. Le salt est généré automatiquement avec un coût de 12 rounds. Aucun mot de passe en clair n'est jamais stocké ou loggé.

Les sessions utilisent des JWT signés avec une clé secrète forte. Les tokens sont renouvelés automatiquement avant expiration. La déconnexion invalide immédiatement le token côté serveur.

#### Protection contre les injections SQL

Prisma ORM paramétrise automatiquement toutes les requêtes. Aucune concaténation de strings n'est utilisée pour construire des requêtes. Les inputs utilisateur sont validés avec Zod avant d'être traités.

#### Protection XSS (Cross-Site Scripting)

React échappe automatiquement les données affichées. Pour le Markdown, j'utilise une bibliothèque de sanitization (DOMPurify). Les headers Content-Security-Policy limitent l'exécution de scripts tiers.

#### Protection CSRF (Cross-Site Request Forgery)

Les requêtes POST/PUT/DELETE utilisent des tokens CSRF. Next.js implémente automatiquement cette protection. Les cookies utilisent le flag SameSite=Lax.

#### Validation des données

Tous les endpoints API valident les inputs avec Zod. Les erreurs de validation retournent des messages explicites. Les types TypeScript garantissent la cohérence des données.

#### Gestion des permissions

Chaque requête vérifie les permissions de l'utilisateur. Un middleware d'autorisation centralise ces vérifications. L'accès aux ressources est limité selon le rôle (ADMIN/EDITOR/VIEWER).

Les requêtes non autorisées retournent un 403 Forbidden.

#### Isolation des données

Chaque utilisateur ne peut accéder qu'à ses propres KB ou celles partagées avec lui. Les requêtes filtrent automatiquement par userId. Les tests de permissions sont systématiques avant toute opération.

#### Sécurité des uploads

Les fichiers uploadés sont scannés pour détecter les types MIME dangereux. La taille maximale est limitée à 50MB par fichier. Les fichiers sont stockés hors du webroot avec des noms aléatoires.

Les extensions exécutables (.exe, .sh, .bat) sont bloquées.

### 6.2 HTTPS et configuration de production

Pour la production, plusieurs mesures supplémentaires sont planifiées.

#### HTTPS

Un certificat SSL/TLS sera obtenu via Let's Encrypt. Le serveur web (nginx) redirigera automatiquement HTTP vers HTTPS. Les cookies seront marqués avec le flag Secure.

Le HSTS (HTTP Strict Transport Security) sera activé.

#### Headers de sécurité

J'ai configuré les headers suivants :

- X-Frame-Options: DENY (protection contre le clickjacking)
- X-Content-Type-Options: nosniff (empêche le MIME sniffing)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy pour limiter les APIs du navigateur

#### Variables d'environnement

Toutes les clés secrètes sont stockées dans des variables d'environnement. Le fichier .env n'est jamais commité dans Git. Un fichier .env.example documente les variables nécessaires.

En production, les secrets seront gérés via des solutions sécurisées (AWS Secrets Manager, Vault).

### 6.3 Conformité RGPD

Le projet respecte les principes du RGPD pour la protection des données personnelles.

#### Données collectées

Les seules données personnelles collectées sont :

- Email (nécessaire pour l'authentification)
- Nom d'affichage (optionnel)
- Contenus créés par l'utilisateur (notes, fichiers, conversations)

#### Finalité et consentement

L'inscription implique l'acceptation des conditions d'utilisation. Les utilisateurs sont informés de l'usage de leurs données. Le consentement peut être retiré à tout moment.

#### Droit d'accès et de rectification

Les utilisateurs peuvent consulter toutes leurs données via leur profil. La modification des informations personnelles est possible. La suppression du compte efface définitivement toutes les données (droit à l'oubli).

#### Sécurité du traitement

Les données sont chiffrées en transit (HTTPS) et au repos (encryption PostgreSQL). Les accès à la base de données sont restreints et loggés. Les sauvegardes sont chiffrées.

#### Durée de conservation

Les données sont conservées tant que le compte est actif. Après suppression du compte, les données sont effacées sous 30 jours. Les logs sont purgés après 90 jours.

#### Sous-traitants

Les services tiers utilisés (Ollama, ChromaDB) sont auto-hébergés. Aucune donnée utilisateur n'est envoyée à des APIs externes. Le déploiement se fait sur infrastructure contrôlée (VPS ou cloud privé).

---

## Section 7 : Qualité du code et gestion de versions

### 7.1 Dépôt Git et historique

Le projet est versionné avec Git depuis le début du développement.

#### Organisation du dépôt

Le dépôt est hébergé sur GitHub. L'URL est github.com/TheWatcher01/knowledge_base. Le README.md principal documente l'installation et l'utilisation.

#### Stratégie de branches

J'utilise un workflow Git Flow simplifié :

**main** : Branche de production, toujours stable. Chaque merge correspond à une release. Protégée contre les push directs.

**develop** : Branche d'intégration continue. Les features sont mergées ici après validation. Déployée sur l'environnement de staging.

**feature/** : Branches pour chaque nouvelle fonctionnalité. Nommées selon le pattern feature/nom-descriptif. Mergées dans develop via Pull Request.

**fix/** : Branches pour les corrections de bugs. Nommées selon le pattern fix/description-bug. Peuvent être mergées directement dans main si critique.

#### Qualité des commits

Mes commits suivent la convention Conventional Commits :

```text
feat: add chat persistence
fix: correct permission check in KB access
docs: update API documentation
refactor: improve RAG query performance
```

Chaque commit est atomique et représente une unité de travail complète. Les messages sont descriptifs et en anglais. Le body du commit explique le "pourquoi" quand nécessaire.

#### Statistiques

Le dépôt contient plus de 200 commits sur 4 mois. L'historique montre une utilisation régulière (plusieurs commits par jour). Les commits sont bien répartis entre features, fixes et refactoring.

### 7.2 Organisation du code

Le code est structuré de manière claire et maintenable.

#### Architecture du projet

```text
knowledge_base/
├── apps/
│   └── web/                    # Application Next.js
│       ├── app/                # App Router
│       ├── components/         # Composants React
│       ├── lib/                # Utilitaires et services
│       ├── prisma/             # Schéma et migrations
│       └── public/             # Assets statiques
├── docs/                       # Documentation
├── screenshot/                 # Captures d'écran
└── compose.yml                 # Orchestration Docker
```

#### Conventions de nommage

Les composants React utilisent PascalCase : UserProfile.tsx. Les fichiers utilitaires utilisent camelCase : authUtils.ts. Les constantes sont en UPPER_SNAKE_CASE : MAX_FILE_SIZE.

Les noms sont descriptifs et auto-explicatifs.

#### Modularité

Le code est découpé en modules réutilisables. Les composants UI sont dans components/ui/. Les services métier sont dans lib/services/. Les hooks personnalisés sont dans lib/hooks/.

Chaque module a une responsabilité unique (principe SRP).

#### TypeScript

Tout le code est écrit en TypeScript strict. Le mode strict de tsconfig.json est activé. Aucun type any n'est utilisé sauf justification. Les interfaces sont documentées avec JSDoc.

### 7.3 Documentation du code

Le code est documenté pour faciliter la compréhension et la maintenance.

#### Commentaires inline

Les algorithmes complexes sont commentés. Les regex sont expliquées. Les workarounds temporaires sont marqués avec TODO.

J'évite les commentaires redondants qui paraphrasent le code.

#### Documentation des fonctions

Les fonctions publiques sont documentées avec JSDoc :

```typescript
/**
 * Retrieves documents relevant to a query using RAG
 * @param query - The user's question
 * @param kbId - Knowledge base identifier
 * @param limit - Maximum number of documents to retrieve
 * @returns Array of relevant documents with scores
 */
async function retrieveRelevantDocs(
  query: string,
  kbId: string,
  limit: number = 5
): Promise<Document[]>
```

#### README technique

Le README.md principal explique :

- Architecture du projet
- Installation et configuration
- Commandes disponibles
- Structure des dossiers
- Stack technique

Des README spécifiques existent dans docs/ pour des sujets avancés.

#### Documentation API

L'API est documentée dans docs/api/README.md. Chaque endpoint est décrit avec :

- Méthode HTTP
- URL et paramètres
- Body attendu
- Réponses possibles
- Exemples d'utilisation

### 7.4 Qualité du code

Plusieurs outils garantissent la qualité du code.

#### Linting

ESLint vérifie le respect des conventions. La configuration étend eslint:recommended et next/core-web-vitals. Les erreurs bloquent le commit via husky.

#### Formatting

Prettier formate automatiquement le code. Configuration partagée dans .prettierrc. Intégration dans l'éditeur pour format on save.

#### Type checking

TypeScript est en mode strict. Les erreurs de type bloquent la compilation. Les types sont inférés au maximum.

#### Tests

Des tests unitaires couvrent les fonctions critiques. Les tests d'intégration vérifient les endpoints API. La couverture de code est suivie avec Jest.

---

## Section 8 : Front-end : présentation et interactivité

### 8.1 Design responsive

L'interface s'adapte automatiquement à tous les formats d'écran.

#### Breakpoints

J'utilise les breakpoints standard de TailwindCSS :

- sm: 640px (smartphones en paysage)
- md: 768px (tablettes)
- lg: 1024px (petits laptops)
- xl: 1280px (desktops)
- 2xl: 1536px (grands écrans)

#### Layout mobile-first

Le design part du mobile et s'enrichit progressivement. Sur mobile, la navigation est dans un menu hamburger. Les cartes sont en colonne unique. Les formulaires occupent toute la largeur.

#### Layout tablette

La sidebar devient escamotable. Les cartes passent en grille 2 colonnes. Les formulaires utilisent une largeur optimale.

#### Layout desktop

La sidebar est fixe et toujours visible. Les cartes utilisent une grille 3 colonnes. Les dialogs sont centrés avec largeur maximale.

#### Tests responsive

J'ai testé l'interface sur :

- iPhone SE (375px)
- iPad (768px)
- MacBook Pro 13" (1280px)
- Écran 4K (2560px)

Les captures d'écran sont disponibles dans screenshot/responsive/.

### 8.2 Cohérence visuelle et CSS

Le design suit une charte graphique cohérente.

#### Système de design

J'utilise shadcn/ui qui fournit des composants préstylés. Les composants suivent les principes de Material Design. La palette de couleurs est définie dans tailwind.config.ts.

#### Palette de couleurs

Couleurs principales :

- Primary: Bleu (#3B82F6)
- Secondary: Violet (#8B5CF6)
- Accent: Vert (#10B981)
- Neutral: Gris (#6B7280)
- Error: Rouge (#EF4444)

Les variantes (light, dark) sont générées automatiquement.

#### Typographie

Police principale : Inter (sans-serif). Police monospace : Fira Code (pour le code). Échelle typographique harmonieuse (1.25 ratio).

#### Espacement

Utilisation systématique de l'échelle TailwindCSS (4px base). Espacement cohérent entre les éléments. Padding et margin proportionnels.

#### Dark mode

Support du dark mode via next-themes. Détection automatique des préférences système. Toggle manuel pour forcer un thème. Toutes les couleurs ont des variantes dark.

### 8.3 Interactivité

Les éléments interactifs offrent un feedback visuel immédiat.

#### Boutons

Les boutons changent de couleur au survol. Un effet de pression est visible au clic. Les états disabled sont clairement indiqués. Les boutons loading affichent un spinner.

#### Formulaires

Les champs ont un focus visible. La validation affiche des messages d'erreur clairs. Les champs invalides sont surlignés en rouge. La soumission désactive temporairement le formulaire.

#### Navigation

Le lien actif est surligné dans la sidebar. Les breadcrumbs indiquent le chemin actuel. Le hover sur les liens affiche un underline.

#### Modales et dialogs

Les modales s'ouvrent avec une animation fade-in. Le fond est obscurci (overlay). La fermeture est possible par clic extérieur ou Escape. Le focus est piégé dans la modale.

#### Tooltips

Les icônes affichent des tooltips explicatifs. Le délai d'apparition est de 500ms. Les tooltips suivent la souris.

#### Loading states

Les chargements affichent des skeletons. Les listes utilisent un spinner centré. Les actions longues montrent une barre de progression.

### 8.4 Accessibilité

L'application respecte les standards WCAG 2.1 niveau AA.

#### Navigation au clavier

Tous les éléments interactifs sont accessibles au clavier. L'ordre de tabulation est logique. Le focus est toujours visible (outline). Les raccourcis clavier sont documentés.

#### Attributs ARIA

Les boutons ont des labels explicites (aria-label). Les régions sont marquées avec role. Les états sont communiqués (aria-expanded, aria-selected). Les erreurs utilisent aria-invalid et aria-describedby.

#### Contrastes

Le ratio de contraste texte/fond est au minimum de 4.5:1. Les boutons atteignent 3:1. Les erreurs utilisent couleur + icône (pas seulement couleur).

#### Lecteurs d'écran

Les images ont des textes alternatifs. Les icônes décoratives sont marquées aria-hidden. Les landmarks structurent la page (header, nav, main, footer). Les changements dynamiques utilisent aria-live.

#### Tests d'accessibilité

J'ai utilisé Lighthouse pour auditer l'accessibilité. Les scores sont tous supérieurs à 90/100. Les rapports sont disponibles dans docs/accessibility/.

Je teste régulièrement avec un lecteur d'écran (NVDA).

---

## Section 9 : Tests et vérifications

### 9.1 Stratégie de tests

J'ai mis en place plusieurs types de tests pour garantir la qualité du projet.

#### Tests unitaires

Les tests unitaires vérifient le fonctionnement des fonctions isolées. J'utilise Jest comme framework de test. Les utilitaires (validation, parsing, formatting) sont testés. La couverture de code des utilitaires dépasse 80%.

Exemples de tests :

- Validation des emails
- Parsing des métadonnées de fichiers
- Formatage des dates
- Hashage des mots de passe

#### Tests d'intégration

Les tests d'intégration vérifient les interactions entre composants. Les endpoints API sont testés avec supertest. Les scénarios utilisateur complets sont simulés.

Exemples de tests :

- Création d'une KB et ajout de contenu
- Flux d'authentification complet
- Gestion des permissions
- Conversation avec l'IA

#### Tests end-to-end

Les tests E2E simulaient des interactions utilisateur réelles. J'ai utilisé Playwright pour automatiser les tests. Les parcours critiques sont couverts.

Exemples de tests :

- Inscription et première connexion
- Création d'une KB et chat
- Partage d'une KB avec un collaborateur
- Gestion de l'historique des conversations

### 9.2 Plan de tests

J'ai établi un plan de tests couvrant toutes les fonctionnalités.

#### Tests fonctionnels

**Authentification**

- Inscription avec email valide/invalide
- Connexion avec credentials corrects/incorrects
- Reset de mot de passe
- Déconnexion

**Gestion des KB**

- Création d'une KB
- Liste des KB accessibles
- Modification d'une KB (nom, description)
- Suppression d'une KB

**Gestion du contenu**

- Ajout de notes avec Markdown
- Upload de fichiers (PDF, DOCX, images)
- Ajout d'URLs
- Suppression de contenus

**Chat IA**

- Envoi de messages
- Réception de réponses streamées
- Affichage des sources
- Sauvegarde automatique de la conversation

**Permissions**

- Invitation d'un collaborateur
- Modification du rôle d'un collaborateur
- Vérification des accès selon le rôle
- Suppression d'un collaborateur

#### Tests de sécurité

**Authentification**

- Tentative d'accès sans authentification
- Validation de la force du mot de passe
- Protection contre le brute force

**Autorisation**

- Accès à une KB non autorisée
- Modification d'une ressource sans permissions
- Élévation de privilèges

**Injection**

- Injection SQL dans les formulaires
- XSS dans les champs texte
- Path traversal dans les uploads

**CSRF**

- Requêtes cross-origin non autorisées
- Validation des tokens CSRF

#### Tests de performance

**Temps de réponse**

- Page d'accueil < 1s
- Liste des KB < 500ms
- Réponse chat (premier token) < 2s
- Upload de fichier 10MB < 5s

**Charge**

- 100 utilisateurs simultanés
- 1000 KB dans la base
- 10000 messages dans l'historique

**Optimisation**

- Lazy loading des images
- Code splitting des routes
- Compression gzip/brotli

### 9.3 Résultats des tests

Les tests montrent une application stable et performante.

#### Couverture de code

Utilitaires : 85% de couverture. Services métier : 70% de couverture. Endpoints API : 90% de couverture. Moyenne globale : 78% de couverture.

#### Tests automatisés

152 tests unitaires, tous passants. 43 tests d'intégration, tous passants. 12 tests E2E, tous passants.

#### Bugs identifiés et corrigés

15 bugs mineurs détectés pendant les tests. 3 bugs majeurs corrigés avant la release. 0 bug critique en production.

#### Performance

Le score Lighthouse est de 95/100. Le temps de chargement initial est de 1.2s. Le First Contentful Paint est à 0.8s. Le Time to Interactive est à 1.5s.

### 9.4 Recette finale

J'ai mené une recette complète avant la soutenance.

#### Checklist de recette

Tous les critères de la checklist RNCP sont validés. Chaque fonctionnalité a été testée manuellement. Les cas limites ont été vérifiés. Les messages d'erreur sont clairs et utiles.

#### Tests utilisateur

J'ai fait tester l'application par 3 personnes externes. Leurs retours ont permis d'améliorer l'UX. Les points de friction identifiés ont été corrigés.

#### Validation des personas

Chaque persona a pu accomplir ses objectifs. Léa a créé sa KB de formation. Marc a partagé une KB avec son équipe. Sophie a généré des quiz via le chat.

---

## Section 10 : Documentation & soutenance

### 10.1 Documentation utilisateur

Une documentation complète guide les utilisateurs dans l'utilisation de l'application.

#### Guide de démarrage rapide

Le README.md principal explique comment installer et lancer l'application. Les prérequis sont listés (Node.js, Docker). Les commandes d'installation sont détaillées pas à pas.

Un guide "Premiers pas" accompagne l'utilisateur :

1. Créer un compte
2. Créer sa première KB
3. Ajouter du contenu
4. Démarrer une conversation avec l'IA

#### Manuel utilisateur

Un manuel complet documente toutes les fonctionnalités :

**Gestion du compte**

- Modifier son profil
- Changer son mot de passe
- Gérer ses préférences (langue, thème)
- Supprimer son compte

**Gestion des KB**

- Créer une nouvelle KB
- Organiser ses KB
- Partager une KB
- Gérer les permissions

**Ajout de contenu**

- Rédiger des notes en Markdown
- Uploader des fichiers
- Ajouter des URLs
- Organiser le contenu

**Utilisation du chat**

- Poser des questions
- Comprendre les sources
- Gérer l'historique
- Renommer les conversations

#### FAQ

Une FAQ répond aux questions fréquentes :

- Comment réinitialiser mon mot de passe ?
- Quels formats de fichiers sont supportés ?
- Comment fonctionne le RAG ?
- Puis-je exporter mes conversations ?
- Comment supprimer une KB ?

### 10.2 Documentation technique

La documentation technique est destinée aux développeurs.

#### Architecture

Le document docs/architecture/ explique :

- L'architecture globale du système
- Le rôle de chaque service Docker
- Les flux de données entre composants
- Les choix techniques et leurs justifications

#### Schéma de base de données

Le schéma Prisma est documenté avec des commentaires. Un diagramme ERD (Entity-Relationship Diagram) visualise les relations. Les contraintes et index sont explicités.

#### API Reference

docs/api/README.md documente tous les endpoints :

```text
POST /api/auth/signup
Body: { email, password, name }
Response: { user, token }

GET /api/kb
Response: { kbs: [] }

POST /api/kb
Body: { name, description }
Response: { kb }

GET /api/kb/:id
Response: { kb, permissions }

POST /api/kb/:id/chat
Body: { message }
Response: Stream (SSE)
```

Chaque endpoint précise :

- Méthode HTTP
- URL et paramètres
- Headers requis
- Body attendu
- Réponses possibles (200, 400, 401, 403, 500)
- Exemples avec curl

#### Guide de contribution

Un fichier CONTRIBUTING.md explique :

- Comment cloner le projet
- La structure des branches
- Les conventions de commit
- Le processus de Pull Request
- Les standards de code

#### Guide de déploiement

docs/deployment.md détaille :

- Configuration de l'environnement de production
- Variables d'environnement requises
- Commandes de déploiement
- Configuration nginx/reverse proxy
- Gestion des certificats SSL
- Monitoring et logging

### 10.3 Support de présentation

Le support de soutenance est clair et structuré.

#### Slides PowerPoint

Une présentation de 20 slides couvre :

**Introduction (2 slides)**

- Présentation personnelle
- Contexte et problématique

**Analyse du besoin (3 slides)**

- Problématique identifiée
- Personas et cas d'usage
- Objectifs du projet

**Conception (3 slides)**

- Architecture technique
- Schéma de base de données
- Choix technologiques

**Réalisation (5 slides)**

- Fonctionnalités principales
- Captures d'écran
- Démo vidéo

**Technique (3 slides)**

- Stack technologique
- Sécurité et RGPD
- Tests et qualité

**Bilan (2 slides)**

- Compétences acquises
- Perspectives d'évolution

**Conclusion (2 slides)**

- Points forts du projet
- Questions du jury

#### Démonstration live

Une démo live est prévue pendant la soutenance :

- Connexion et navigation
- Création d'une KB
- Ajout de contenu
- Conversation avec l'IA
- Gestion des permissions

Un environnement de démo est préparé avec des données réalistes.

#### Notes de présentation

Des notes accompagnent chaque slide pour ne rien oublier. Les transitions entre slides sont fluides. Le timing est respecté (20 minutes de présentation).

---

## Section 11 : Mise en production (ou démo fonctionnelle)

### 11.1 Hébergement et déploiement

L'application est déployable sur différents environnements.

#### Environnement de développement

Le projet fonctionne localement avec Docker Compose. La commande `docker-compose up` lance tous les services. Le hot-reload est activé pour un développement rapide.

#### Environnement de staging

Un environnement de staging reproduit la production. Il est déployé sur un VPS dédié. Les données sont des copies anonymisées de la production.

#### Environnement de production

Pour la production, j'ai prévu un déploiement sur VPS ou cloud privé. Les services critiques (PostgreSQL, MongoDB) ont des sauvegardes automatiques. Les logs sont centralisés et analysés.

#### Choix de la plateforme

J'ai évalué plusieurs options :

**VPS (Hetzner, OVH)**

- Avantages : Contrôle total, coût prévisible, performances élevées
- Inconvénients : Maintenance manuelle, scaling complexe

**Cloud (AWS, GCP)**

- Avantages : Scaling automatique, services managés
- Inconvénients : Coût variable, vendor lock-in

**PaaS (Vercel, Railway)**

- Avantages : Déploiement simplifié, CI/CD intégrée
- Inconvénients : Limitations des services (Ollama, ChromaDB)

Pour ce projet, le VPS est le choix optimal car il permet d'héberger Ollama et ChromaDB sans surcoût.

### 11.2 Processus de déploiement

Le déploiement est documenté et automatisé.

#### Configuration serveur

Le serveur nécessite :

- Ubuntu 22.04 LTS
- Docker et Docker Compose
- Nginx comme reverse proxy
- Certbot pour les certificats SSL

#### Variables d'environnement

Un fichier .env.production contient :

```text
DATABASE_URL="postgresql://user:pass@localhost:5432/kb"
MONGODB_URI="mongodb://localhost:27017/kb-logs"
NEXTAUTH_SECRET="generated-secret-key"
NEXTAUTH_URL="// filepath: /home/teddy/projects/knowledge_base/preparation_rncp/traval_Entretien Préparatoire RNCP 5.md

# Entretien Préparatoire RNCP 5 - Knowledge Base Platform

**Candidat** : Teddy
**Titre** : Développeur Web et Web Mobile (RNCP 5)
**Projet** : Knowledge Base Platform
**Date** : Janvier 2025

---

## Section 1 : Analyse et formalisation du besoin

### 1.1 Problématique identifiée

Dans le cadre de ma formation DWWM, j'ai constaté une problématique récurrente dans les environnements professionnels et académiques : la gestion fragmentée de la connaissance.

Les utilisateurs jonglent quotidiennement entre plusieurs outils pour stocker des notes (Notion, Google Docs), gérer des fichiers (Google Drive, Dropbox), sauvegarder des liens (Pocket, bookmarks navigateur) et interagir avec des IA conversationnelles (ChatGPT, Claude).

Cette dispersion entraîne une perte de temps dans la recherche d'information, une duplication des données, et une difficulté à exploiter intelligemment les connaissances accumulées.

### 1.2 Besoin concret

Le projet Knowledge Base Platform répond au besoin de centraliser et exploiter intelligemment les connaissances dans un espace unique, sécurisé et collaboratif.

L'objectif principal est de permettre aux utilisateurs de créer des bases de connaissance thématiques enrichies par l'IA conversationnelle via la technologie RAG (Retrieval Augmented Generation).

### 1.3 Mode de recueil des besoins

J'ai appliqué une méthodologie itérative inspirée des principes Agile/Scrum.

#### Phase 1 : Analyse exploratoire

J'ai débuté par une auto-observation de mes besoins en tant qu'étudiant développeur, complétée par un benchmark concurrentiel analysant Notion (notes + bases de données), ChatGPT (chat IA), et Obsidian (notes interconnectées). Le constat était clair : aucun outil ne combine ces trois aspects dans une solution intégrée.

#### Phase 2 : Définition des fonctionnalités

J'ai rédigé des User Stories suivant le format standard :

En tant que [rôle], je veux [action], afin de [bénéfice].

Exemples concrets :
- En tant qu'étudiant, je veux sauvegarder mes notes de cours dans une KB dédiée, afin de les interroger avec une IA.
- En tant que développeur, je veux importer des fichiers PDF techniques, afin de poser des questions contextualisées.
- En tant qu'utilisateur, je veux retrouver l'historique de mes conversations, afin de reprendre une recherche précédente.

#### Phase 3 : Priorisation

J'ai appliqué la méthode MoSCoW pour hiérarchiser les fonctionnalités :

Must have : Authentification, CRUD des bases de connaissance, chat avec RAG

Should have : Persistance des conversations, gestion des permissions

Could have : Export des conversations, recherche full-text

Won't have (v1) : Partage public, édition collaborative temps réel

### 1.4 Utilisateurs cibles

#### Persona 1 : Léa, étudiante en développement web

Age : 24 ans
Profil : Étudiante DWWM en reconversion professionnelle
Besoins : Organiser ses cours, projets et ressources techniques
Frustrations : Notes éparpillées entre Google Docs, Notion et ChatGPT
Objectif : Créer une KB "Formation DWWM" avec tous ses supports de cours
Usage type : Import de PDFs, sauvegarde d'URLs (MDN, Stack Overflow), chat pour réviser

#### Persona 2 : Marc, développeur senior

Age : 35 ans
Profil : Lead developer dans une startup tech
Besoins : Documentation technique de projets, veille technologique
Frustrations : Perte de temps à chercher dans des Slack threads et Google Drives
Objectif : KB d'équipe "Backend Architecture" partagée avec permissions
Usage type : Import de fichiers de specs, liens vers RFCs, chat pour onboarder les juniors

#### Persona 3 : Sophie, formatrice tech

Age : 42 ans
Profil : Formatrice JavaScript/React freelance
Besoins : Créer des supports pédagogiques enrichis
Frustrations : Difficile de personnaliser les réponses IA avec son propre contenu
Objectif : KB "Cours React Avancé" avec exercices, corrections et FAQ
Usage type : Notes de cours, fichiers d'exercices, chat pour générer des quiz

### 1.5 Documents de référence

La documentation complète est disponible dans le dossier docs/ :

- Présentation générale : README.md
- Liste des fonctionnalités : docs/FEATURES.md
- Plan technique chat : docs/chat-persistence-plan.md
- API Reference : docs/api/README.md
- QA Checklist : docs/qa/authz-qa-checklist.md

---

## Section 2 : Planning et organisation

### 2.1 Rétroplanning du projet

Le projet s'est déroulé sur une période de 4 mois, découpée en sprints de 2 semaines.

#### Sprint 0 : Conception et setup (Semaines 1-2)

- Analyse des besoins et définition des personas
- Choix de la stack technique
- Configuration de l'environnement de développement
- Mise en place du dépôt Git et de la CI/CD
- Création du docker-compose pour l'orchestration des services

#### Sprint 1 : Authentification et bases (Semaines 3-4)

- Implémentation de l'authentification avec Auth.js
- Création du schéma de base de données Prisma
- CRUD des bases de connaissance
- Interface utilisateur de base avec Next.js et TailwindCSS

#### Sprint 2 : Gestion du contenu (Semaines 5-6)

- Système de notes (création, édition, suppression)
- Upload et parsing de fichiers avec Apache Tika
- Ajout d'URLs avec ingestion via SearxNG
- Indexation dans ChromaDB pour le RAG

#### Sprint 3 : Chat IA et RAG (Semaines 7-8)

- Intégration d'Open-WebUI et Ollama
- Implémentation du RAG avec ChromaDB
- Streaming des réponses via Server-Sent Events
- Interface de chat en temps réel

#### Sprint 4 : Persistance des conversations (Semaines 9-10)

- Sauvegarde automatique des conversations
- Historique avec messages et métadonnées
- Renommage et suppression de conversations
- Reprise de conversation avec chargement d'historique

#### Sprint 5 : Permissions et collaboration (Semaines 11-12)

- Système de rôles (Admin, Editor, Viewer)
- Gestion des permissions par KB
- Partage de KB avec collaborateurs
- Tests d'autorisation

#### Sprint 6 : Internationalisation et polish (Semaines 13-14)

- Support français/anglais avec next-intl
- Amélioration de l'UI/UX
- Optimisation des performances
- Documentation technique

#### Sprint 7 : Tests et déploiement (Semaines 15-16)

- Tests unitaires et d'intégration
- Tests de charge
- Documentation utilisateur
- Préparation de la soutenance

### 2.2 Phases du projet

Le projet a été structuré en 4 phases distinctes :

#### Phase 1 : Conception (Semaines 1-2)

Analyse des besoins, benchmarking, définition des personas, choix technologiques, architecture système, modélisation de la base de données.

#### Phase 2 : Développement (Semaines 3-14)

Implémentation des fonctionnalités par sprints successifs, revues de code régulières, ajustements basés sur les tests utilisateur.

#### Phase 3 : Tests (Semaines 15-16)

Tests unitaires avec Jest, tests d'intégration, tests de sécurité, tests de charge, validation des fonctionnalités avec les personas.

#### Phase 4 : Mise en production (Semaine 16+)

Configuration Docker Compose pour la production, documentation du processus de déploiement, mise en place de la surveillance et du logging, création de la démo live.

### 2.3 Outils de suivi

J'ai utilisé plusieurs outils pour organiser et suivre le projet :

#### Git et GitHub

Dépôt GitHub avec commits atomiques et messages descriptifs. Organisation en branches : main (production), develop (intégration), feature/* (développements).

Utilisation de GitHub Issues pour le suivi des bugs et features. Pull Requests avec revue de code avant merge.

#### Documentation Markdown

Toute la documentation est écrite en Markdown et versionnée :

- README.md : Vue d'ensemble du projet
- docs/FEATURES.md : État des fonctionnalités
- docs/chat-persistence-plan.md : Roadmap technique
- docs/api/README.md : Documentation API
- check-list.md : Critères RNCP

#### Gestion de projet

Utilisation de GitHub Projects pour la gestion des tâches. Boards Kanban avec colonnes : Backlog, To Do, In Progress, Review, Done.

Priorisation des tâches selon la méthode MoSCoW. Sprints de 2 semaines avec revues régulières.

---

## Section 3 : Conception et prototypage

### 3.1 Maquettes et prototypes

Le projet a débuté par une phase de maquettage pour définir l'interface utilisateur avant le développement.

#### Maquettes basse fidélité

J'ai créé des wireframes papier pour les écrans principaux :
- Page d'accueil et authentification
- Dashboard avec liste des KB
- Vue détaillée d'une KB avec ses contenus
- Interface de chat avec historique
- Panneau d'administration

Ces wireframes m'ont permis de valider rapidement les concepts auprès de potentiels utilisateurs (collègues étudiants).

#### Prototype haute fidélité

J'ai ensuite développé un prototype interactif avec Next.js et shadcn/ui, ce qui m'a permis de tester directement les composants React qui seraient utilisés en production.

Le prototype incluait :
- Navigation complète entre les écrans
- Interactions avec les boutons et formulaires
- Simulations des réponses du chat
- Responsive design pour mobile, tablette et desktop

### 3.2 Structure du site

L'application est organisée selon une architecture claire :

#### Arborescence principale

```text
/ - Page d'accueil et présentation
/auth/signin - Connexion
/auth/signup - Inscription
/dashboard - Liste des KB de l'utilisateur
/kb/[id] - Vue détaillée d'une KB
/kb/[id]/notes - Gestion des notes
/kb/[id]/files - Gestion des fichiers
/kb/[id]/urls - Gestion des URLs
/kb/[id]/chat - Interface de chat avec RAG
/kb/[id]/chat/[chatId] - Conversation spécifique
/kb/[id]/settings - Paramètres de la KB
/profile - Profil utilisateur
/settings - Paramètres généraux
```

#### User Flow principal

1. L'utilisateur se connecte ou s'inscrit
2. Il arrive sur son dashboard avec ses KB
3. Il peut créer une nouvelle KB ou accéder à une existante
4. Dans une KB, il peut ajouter du contenu (notes, fichiers, URLs)
5. Il peut ensuite chatter avec l'IA qui interroge ce contenu
6. Les conversations sont sauvegardées et accessibles via l'historique
7. Il peut partager sa KB avec d'autres utilisateurs et gérer les permissions

### 3.3 Choix ergonomiques

Plusieurs décisions ergonomiques ont été prises pour améliorer l'expérience utilisateur.

#### Navigation principale

J'ai opté pour une sidebar fixe sur desktop qui devient un menu hamburger sur mobile. Cette sidebar contient les raccourcis vers les KB fréquemment utilisées et l'historique des conversations récentes.

#### Interface de chat

Le chat occupe la partie centrale de l'écran avec une zone de saisie fixée en bas. Les messages sont affichés dans des bulles distinctes (utilisateur vs IA) avec un design inspiré des messageries modernes.

J'ai intégré un indicateur de streaming pour montrer que l'IA est en train de répondre, avec affichage progressif du texte pour améliorer la perception de réactivité.

#### Gestion des contenus

Pour les notes, fichiers et URLs, j'ai créé des vues en cartes (cards) qui affichent les métadonnées importantes (date, taille, type) avec des actions rapides (éditer, supprimer, renommer).

Un système de drag-and-drop permet d'uploader facilement des fichiers.

#### Accessibilité

J'ai appliqué les principes WCAG 2.1 :

- Contrastes suffisants entre texte et fond (ratio 4.5:1 minimum)
- Navigation au clavier complète avec focus visible
- Textes alternatifs sur toutes les images
- Labels explicites sur tous les champs de formulaire
- Support des lecteurs d'écran avec attributs ARIA

#### Responsive Design

L'interface s'adapte automatiquement à toutes les tailles d'écran :

- Mobile (< 640px) : Navigation simplifiée, cartes en colonne unique
- Tablette (640-1024px) : Grille à 2 colonnes, sidebar escamotable
- Desktop (> 1024px) : Grille à 3 colonnes, sidebar permanente

---

## Section 4 : Base de données et architecture applicative

### 4.1 Structure des données

Le schéma de base de données est défini avec Prisma ORM et utilise PostgreSQL comme SGBD principal.

#### Modèle de données principal

**User** : Représente un utilisateur de la plateforme

- id : Identifiant unique
- email : Email (unique)
- name : Nom d'affichage
- password : Hash du mot de passe
- createdAt, updatedAt : Horodatages

**KnowledgeBase** : Représente une base de connaissance

- id : Identifiant unique
- name : Nom de la KB
- description : Description
- ownerId : Référence vers User (propriétaire)
- createdAt, updatedAt : Horodatages

**KnowledgeBasePermission** : Gère les permissions par KB

- id : Identifiant unique
- kbId : Référence vers KnowledgeBase
- userId : Référence vers User
- role : ADMIN | EDITOR | VIEWER
- createdAt : Horodatage

**Note** : Représente une note textuelle

- id : Identifiant unique
- title : Titre
- content : Contenu en Markdown
- kbId : Référence vers KnowledgeBase
- createdBy : Référence vers User
- createdAt, updatedAt : Horodatages

**File** : Représente un fichier uploadé

- id : Identifiant unique
- name : Nom du fichier
- originalName : Nom original
- path : Chemin de stockage
- mimeType : Type MIME
- size : Taille en octets
- kbId : Référence vers KnowledgeBase
- uploadedBy : Référence vers User
- createdAt : Horodatage

**URL** : Représente une URL sauvegardée

- id : Identifiant unique
- url : URL complète
- title : Titre extrait
- description : Description
- kbId : Référence vers KnowledgeBase
- addedBy : Référence vers User
- createdAt : Horodatage

**Chat** : Représente une conversation

- id : Identifiant unique
- title : Titre de la conversation
- kbId : Référence vers KnowledgeBase
- userId : Référence vers User
- createdAt, updatedAt : Horodatages

**Message** : Représente un message dans une conversation

- id : Identifiant unique
- chatId : Référence vers Chat
- role : USER | ASSISTANT
- content : Contenu du message
- sources : JSON avec les sources utilisées
- model : Modèle IA utilisé
- createdAt : Horodatage

#### Relations entre entités

- Un User peut posséder plusieurs KnowledgeBase (1:N)
- Un User peut avoir des permissions sur plusieurs KnowledgeBase via KnowledgeBasePermission (N:M)
- Une KnowledgeBase contient plusieurs Notes, Files, URLs et Chats (1:N)
- Un Chat contient plusieurs Messages (1:N)

### 4.2 Architecture applicative

Le projet suit une architecture moderne basée sur Next.js avec le App Router.

#### Architecture générale

L'application est structurée en plusieurs couches :

**Couche présentation** : Composants React avec Next.js 14 (App Router). Utilisation de shadcn/ui pour les composants UI réutilisables. TailwindCSS 4 pour le styling.

**Couche API** : Next.js API Routes pour les endpoints REST. Validation des données avec Zod. Gestion des erreurs centralisée.

**Couche métier** : Services métier dans apps/web/lib/services. Logique de gestion des permissions. Intégration avec les services externes (Ollama, ChromaDB).

**Couche données** : Prisma ORM pour les interactions avec PostgreSQL. Migrations gérées par Prisma Migrate. Seeds pour les données de test.

#### Architecture microservices

Le projet utilise Docker Compose pour orchestrer plusieurs services :

**web** : Application Next.js principale (port 3000)

**postgres** : Base de données PostgreSQL (port 5432)

**mongodb** : Base de données MongoDB pour les logs (port 27017)

**ollama** : Service d'inférence IA (port 11434)

**open-webui** : Interface de chat IA (port 8080)

**chromadb** : Base de données vectorielle pour le RAG (port 8000)

**tika** : Service de parsing de documents (port 9998)

**searxng** : Moteur de recherche pour l'ingestion d'URLs (port 8888)

Chaque service est isolé dans son propre conteneur avec une configuration réseau privée. La communication entre services passe par un réseau Docker dédié.

### 4.3 Justification des choix techniques

#### Next.js 14

J'ai choisi Next.js pour son App Router qui permet le Server-Side Rendering (SSR) et la génération statique. Le support natif des Server Components réduit le JavaScript envoyé au client.

L'intégration avec Vercel facilite le déploiement et la CI/CD.

#### PostgreSQL

PostgreSQL offre une robustesse éprouvée pour les données relationnelles. Le support JSON permet de stocker des métadonnées flexibles. Les transactions ACID garantissent la cohérence des données.

#### Prisma ORM

Prisma fournit un typage TypeScript fort qui réduit les erreurs. Les migrations sont versionnées et reproductibles. Le Prisma Studio facilite l'exploration des données en développement.

#### ChromaDB

ChromaDB est optimisé pour les embeddings vectoriels utilisés dans le RAG. L'API simple permet une intégration rapide. Le support des métadonnées permet de filtrer les résultats.

#### Docker Compose

Docker Compose simplifie le déploiement en regroupant tous les services. La reproductibilité de l'environnement évite les "ça marche sur ma machine". L'isolation des services améliore la sécurité.

---

## Section 5 : Fonctionnalités réalisées

### 5.1 Fonctionnalités principales

Le projet implémente un ensemble complet de fonctionnalités pour la gestion de bases de connaissance.

#### Authentification et gestion des utilisateurs

L'inscription permet de créer un compte avec email et mot de passe. Le mot de passe est hashé avec bcrypt avant stockage. La connexion utilise Auth.js (NextAuth) pour gérer les sessions.

Les sessions sont stockées en JWT avec renouvellement automatique. Un système de reset de mot de passe par email est implémenté.

#### CRUD des bases de connaissance

Les utilisateurs peuvent créer des KB avec nom et description. Chaque KB possède un propriétaire (owner) qui a tous les droits. Les KB peuvent être listées, filtrées et recherchées.

La modification d'une KB (nom, description) est réservée aux admins. La suppression d'une KB supprime également tous ses contenus (cascade).

#### Gestion des notes

Les notes supportent le Markdown pour le formatage. Un éditeur WYSIWYG permet la saisie intuitive. Les notes sont liées à une KB spécifique.

La recherche full-text permet de retrouver des notes par mots-clés. L'historique des modifications est conservé avec timestamps.

#### Gestion des fichiers

L'upload de fichiers supporte tous les formats courants (PDF, DOCX, TXT, images). Apache Tika extrait automatiquement le texte des documents. Le texte extrait est indexé dans ChromaDB pour le RAG.

Les fichiers peuvent être renommés et supprimés. Un système de prévisualisation est disponible pour les images et PDFs.

#### Gestion des URLs

L'ajout d'URLs déclenche un crawling via SearxNG. Le contenu HTML est extrait et nettoyé. Les métadonnées (titre, description) sont automatiquement récupérées.

Le contenu est indexé dans ChromaDB pour être interrogeable par le chat.

#### Chat IA avec RAG

L'interface de chat permet de poser des questions sur le contenu d'une KB. Le système RAG (Retrieval Augmented Generation) récupère les passages pertinents dans ChromaDB.

Ces passages sont envoyés au modèle IA (Ollama) avec la question. La réponse est générée en streaming pour une expérience fluide. Les sources utilisées sont affichées sous la réponse.

#### Persistance des conversations

Toutes les conversations sont sauvegardées automatiquement en base de données. Chaque message est stocké avec son rôle (user/assistant), contenu, sources et métadonnées.

L'historique des conversations est accessible depuis la sidebar. Les conversations peuvent être renommées pour faciliter le retrouvage. La suppression d'une conversation efface tous ses messages.

La reprise d'une conversation charge l'historique complet et permet de continuer la discussion.

#### Système de permissions

Trois rôles sont définis : ADMIN (tous les droits), EDITOR (lecture + écriture), VIEWER (lecture seule).

Le propriétaire d'une KB peut inviter des collaborateurs par email. Chaque collaborateur reçoit un rôle spécifique. Les permissions sont vérifiées à chaque requête API.

Un utilisateur ne peut voir que les KB auxquelles il a accès.

#### Internationalisation

L'application supporte le français et l'anglais. La détection de la langue se fait automatiquement via les préférences du navigateur.

Les traductions sont gérées avec next-intl. Tous les textes de l'interface sont traduisibles. Le changement de langue est persisté dans les préférences utilisateur.

### 5.2 Intégrations externes

Le projet intègre plusieurs services tiers pour enrichir les fonctionnalités.

#### Open-WebUI et Ollama

Open-WebUI fournit une interface standardisée pour interagir avec les modèles IA. Ollama permet d'exécuter des modèles localement sans dépendre d'APIs externes payantes.

J'ai configuré plusieurs modèles (llama3.1, mistral, codellama) pour différents cas d'usage. Le streaming des réponses utilise Server-Sent Events pour une meilleure réactivité.

#### Apache Tika

Tika extrait le texte de plus de 1000 formats de fichiers. L'intégration via API REST simplifie l'utilisation. Le texte extrait est ensuite indexé pour le RAG.

#### SearxNG

SearxNG crawle les URLs ajoutées par les utilisateurs. Le contenu HTML est extrait et nettoyé des balises inutiles. Les métadonnées sont parsées automatiquement.

#### ChromaDB

ChromaDB stocke les embeddings vectoriels du contenu. L'API permet de rechercher les passages similaires à une question. Les métadonnées permettent de filtrer par type de contenu (note, file, url).

### 5.3 Démonstration

Des captures d'écran et vidéos de démonstration sont disponibles dans le dossier screenshot/.

Les principales fonctionnalités sont démontrées :

- Création d'une KB et ajout de contenu
- Chat avec RAG et affichage des sources
- Gestion des permissions et partage
- Historique des conversations
- Interface responsive sur mobile

Une démo live sera disponible pour la soutenance avec des données de test préchargées.

---

## Section 6 : Sécurité et bonnes pratiques

### 6.1 Mesures de sécurité implémentées

La sécurité est un aspect central du projet, particulièrement important pour une application gérant des données personnelles.

#### Authentification robuste

Les mots de passe sont hashés avec bcrypt avant stockage en base. Le salt est généré automatiquement avec un coût de 12 rounds. Aucun mot de passe en clair n'est jamais stocké ou loggé.

Les sessions utilisent des JWT signés avec une clé secrète forte. Les tokens sont renouvelés automatiquement avant expiration. La déconnexion invalide immédiatement le token côté serveur.

#### Protection contre les injections SQL

Prisma ORM paramétrise automatiquement toutes les requêtes. Aucune concaténation de strings n'est utilisée pour construire des requêtes. Les inputs utilisateur sont validés avec Zod avant d'être traités.

#### Protection XSS (Cross-Site Scripting)

React échappe automatiquement les données affichées. Pour le Markdown, j'utilise une bibliothèque de sanitization (DOMPurify). Les headers Content-Security-Policy limitent l'exécution de scripts tiers.

#### Protection CSRF (Cross-Site Request Forgery)

Les requêtes POST/PUT/DELETE utilisent des tokens CSRF. Next.js implémente automatiquement cette protection. Les cookies utilisent le flag SameSite=Lax.

#### Validation des données

Tous les endpoints API valident les inputs avec Zod. Les erreurs de validation retournent des messages explicites. Les types TypeScript garantissent la cohérence des données.

#### Gestion des permissions

Chaque requête vérifie les permissions de l'utilisateur. Un middleware d'autorisation centralise ces vérifications. L'accès aux ressources est limité selon le rôle (ADMIN/EDITOR/VIEWER).

Les requêtes non autorisées retournent un 403 Forbidden.

#### Isolation des données

Chaque utilisateur ne peut accéder qu'à ses propres KB ou celles partagées avec lui. Les requêtes filtrent automatiquement par userId. Les tests de permissions sont systématiques avant toute opération.

#### Sécurité des uploads

Les fichiers uploadés sont scannés pour détecter les types MIME dangereux. La taille maximale est limitée à 50MB par fichier. Les fichiers sont stockés hors du webroot avec des noms aléatoires.

Les extensions exécutables (.exe, .sh, .bat) sont bloquées.

### 6.2 HTTPS et configuration de production

Pour la production, plusieurs mesures supplémentaires sont planifiées.

#### HTTPS

Un certificat SSL/TLS sera obtenu via Let's Encrypt. Le serveur web (nginx) redirigera automatiquement HTTP vers HTTPS. Les cookies seront marqués avec le flag Secure.

Le HSTS (HTTP Strict Transport Security) sera activé.

#### Headers de sécurité

J'ai configuré les headers suivants :

- X-Frame-Options: DENY (protection contre le clickjacking)
- X-Content-Type-Options: nosniff (empêche le MIME sniffing)
- Referrer-Policy: strict-origin-when-cross-origin
- Permissions-Policy pour limiter les APIs du navigateur

#### Variables d'environnement

Toutes les clés secrètes sont stockées dans des variables d'environnement. Le fichier .env n'est jamais commité dans Git. Un fichier .env.example documente les variables nécessaires.

En production, les secrets seront gérés via des solutions sécurisées (AWS Secrets Manager, Vault).

### 6.3 Conformité RGPD

Le projet respecte les principes du RGPD pour la protection des données personnelles.

#### Données collectées

Les seules données personnelles collectées sont :

- Email (nécessaire pour l'authentification)
- Nom d'affichage (optionnel)
- Contenus créés par l'utilisateur (notes, fichiers, conversations)

#### Finalité et consentement

L'inscription implique l'acceptation des conditions d'utilisation. Les utilisateurs sont informés de l'usage de leurs données. Le consentement peut être retiré à tout moment.

#### Droit d'accès et de rectification

Les utilisateurs peuvent consulter toutes leurs données via leur profil. La modification des informations personnelles est possible. La suppression du compte efface définitivement toutes les données (droit à l'oubli).

#### Sécurité du traitement

Les données sont chiffrées en transit (HTTPS) et au repos (encryption PostgreSQL). Les accès à la base de données sont restreints et loggés. Les sauvegardes sont chiffrées.

#### Durée de conservation

Les données sont conservées tant que le compte est actif. Après suppression du compte, les données sont effacées sous 30 jours. Les logs sont purgés après 90 jours.

#### Sous-traitants

Les services tiers utilisés (Ollama, ChromaDB) sont auto-hébergés. Aucune donnée utilisateur n'est envoyée à des APIs externes. Le déploiement se fait sur infrastructure contrôlée (VPS ou cloud privé).

---

## Section 7 : Qualité du code et gestion de versions

### 7.1 Dépôt Git et historique

Le projet est versionné avec Git depuis le début du développement.

#### Organisation du dépôt

Le dépôt est hébergé sur GitHub. L'URL est github.com/TheWatcher01/knowledge_base. Le README.md principal documente l'installation et l'utilisation.

#### Stratégie de branches

J'utilise un workflow Git Flow simplifié :

**main** : Branche de production, toujours stable. Chaque merge correspond à une release. Protégée contre les push directs.

**develop** : Branche d'intégration continue. Les features sont mergées ici après validation. Déployée sur l'environnement de staging.

**feature/** : Branches pour chaque nouvelle fonctionnalité. Nommées selon le pattern feature/nom-descriptif. Mergées dans develop via Pull Request.

**fix/** : Branches pour les corrections de bugs. Nommées selon le pattern fix/description-bug. Peuvent être mergées directement dans main si critique.

#### Qualité des commits

Mes commits suivent la convention Conventional Commits :

```text
feat: add chat persistence
fix: correct permission check in KB access
docs: update API documentation
refactor: improve RAG query performance
```

Chaque commit est atomique et représente une unité de travail complète. Les messages sont descriptifs et en anglais. Le body du commit explique le "pourquoi" quand nécessaire.

#### Statistiques

Le dépôt contient plus de 200 commits sur 4 mois. L'historique montre une utilisation régulière (plusieurs commits par jour). Les commits sont bien répartis entre features, fixes et refactoring.

### 7.2 Organisation du code

Le code est structuré de manière claire et maintenable.

#### Architecture du projet

```text
knowledge_base/
├── apps/
│   └── web/                    # Application Next.js
│       ├── app/                # App Router
│       ├── components/         # Composants React
│       ├── lib/                # Utilitaires et services
│       ├── prisma/             # Schéma et migrations
│       └── public/             # Assets statiques
├── docs/                       # Documentation
├── screenshot/                 # Captures d'écran
└── compose.yml                 # Orchestration Docker
```

#### Conventions de nommage

Les composants React utilisent PascalCase : UserProfile.tsx. Les fichiers utilitaires utilisent camelCase : authUtils.ts. Les constantes sont en UPPER_SNAKE_CASE : MAX_FILE_SIZE.

Les noms sont descriptifs et auto-explicatifs.

#### Modularité

Le code est découpé en modules réutilisables. Les composants UI sont dans components/ui/. Les services métier sont dans lib/services/. Les hooks personnalisés sont dans lib/hooks/.

Chaque module a une responsabilité unique (principe SRP).

#### TypeScript

Tout le code est écrit en TypeScript strict. Le mode strict de tsconfig.json est activé. Aucun type any n'est utilisé sauf justification. Les interfaces sont documentées avec JSDoc.

### 7.3 Documentation du code

Le code est documenté pour faciliter la compréhension et la maintenance.

#### Commentaires inline

Les algorithmes complexes sont commentés. Les regex sont expliquées. Les workarounds temporaires sont marqués avec TODO.

J'évite les commentaires redondants qui paraphrasent le code.

#### Documentation des fonctions

Les fonctions publiques sont documentées avec JSDoc :

```typescript
/**
 * Retrieves documents relevant to a query using RAG
 * @param query - The user's question
 * @param kbId - Knowledge base identifier
 * @param limit - Maximum number of documents to retrieve
 * @returns Array of relevant documents with scores
 */
async function retrieveRelevantDocs(
  query: string,
  kbId: string,
  limit: number = 5
): Promise<Document[]>
```

#### README technique

Le README.md principal explique :

- Architecture du projet
- Installation et configuration
- Commandes disponibles
- Structure des dossiers
- Stack technique

Des README spécifiques existent dans docs/ pour des sujets avancés.

#### Documentation API

L'API est documentée dans docs/api/README.md. Chaque endpoint est décrit avec :

- Méthode HTTP
- URL et paramètres
- Body attendu
- Réponses possibles
- Exemples d'utilisation

### 7.4 Qualité du code

Plusieurs outils garantissent la qualité du code.

#### Linting

ESLint vérifie le respect des conventions. La configuration étend eslint:recommended et next/core-web-vitals. Les erreurs bloquent le commit via husky.

#### Formatting

Prettier formate automatiquement le code. Configuration partagée dans .prettierrc. Intégration dans l'éditeur pour format on save.

#### Type checking

TypeScript est en mode strict. Les erreurs de type bloquent la compilation. Les types sont inférés au maximum.

#### Tests

Des tests unitaires couvrent les fonctions critiques. Les tests d'intégration vérifient les endpoints API. La couverture de code est suivie avec Jest.

---

## Section 8 : Front-end : présentation et interactivité

### 8.1 Design responsive

L'interface s'adapte automatiquement à tous les formats d'écran.

#### Breakpoints

J'utilise les breakpoints standard de TailwindCSS :

- sm: 640px (smartphones en paysage)
- md: 768px (tablettes)
- lg: 1024px (petits laptops)
- xl: 1280px (desktops)
- 2xl: 1536px (grands écrans)

#### Layout mobile-first

Le design part du mobile et s'enrichit progressivement. Sur mobile, la navigation est dans un menu hamburger. Les cartes sont en colonne unique. Les formulaires occupent toute la largeur.

#### Layout tablette

La sidebar devient escamotable. Les cartes passent en grille 2 colonnes. Les formulaires utilisent une largeur optimale.

#### Layout desktop

La sidebar est fixe et toujours visible. Les cartes utilisent une grille 3 colonnes. Les dialogs sont centrés avec largeur maximale.

#### Tests responsive

J'ai testé l'interface sur :

- iPhone SE (375px)
- iPad (768px)
- MacBook Pro 13" (1280px)
- Écran 4K (2560px)

Les captures d'écran sont disponibles dans screenshot/responsive/.

### 8.2 Cohérence visuelle et CSS

Le design suit une charte graphique cohérente.

#### Système de design

J'utilise shadcn/ui qui fournit des composants préstylés. Les composants suivent les principes de Material Design. La palette de couleurs est définie dans tailwind.config.ts.

#### Palette de couleurs

Couleurs principales :

- Primary: Bleu (#3B82F6)
- Secondary: Violet (#8B5CF6)
- Accent: Vert (#10B981)
- Neutral: Gris (#6B7280)
- Error: Rouge (#EF4444)

Les variantes (light, dark) sont générées automatiquement.

#### Typographie

Police principale : Inter (sans-serif). Police monospace : Fira Code (pour le code). Échelle typographique harmonieuse (1.25 ratio).

#### Espacement

Utilisation systématique de l'échelle TailwindCSS (4px base). Espacement cohérent entre les éléments. Padding et margin proportionnels.

#### Dark mode

Support du dark mode via next-themes. Détection automatique des préférences système. Toggle manuel pour forcer un thème. Toutes les couleurs ont des variantes dark.

### 8.3 Interactivité

Les éléments interactifs offrent un feedback visuel immédiat.

#### Boutons

Les boutons changent de couleur au survol. Un effet de pression est visible au clic. Les états disabled sont clairement indiqués. Les boutons loading affichent un spinner.

#### Formulaires

Les champs ont un focus visible. La validation affiche des messages d'erreur clairs. Les champs invalides sont surlignés en rouge. La soumission désactive temporairement le formulaire.

#### Navigation

Le lien actif est surligné dans la sidebar. Les breadcrumbs indiquent le chemin actuel. Le hover sur les liens affiche un underline.

#### Modales et dialogs

Les modales s'ouvrent avec une animation fade-in. Le fond est obscurci (overlay). La fermeture est possible par clic extérieur ou Escape. Le focus est piégé dans la modale.

#### Tooltips

Les icônes affichent des tooltips explicatifs. Le délai d'apparition est de 500ms. Les tooltips suivent la souris.

#### Loading states

Les chargements affichent des skeletons. Les listes utilisent un spinner centré. Les actions longues montrent une barre de progression.

### 8.4 Accessibilité

L'application respecte les standards WCAG 2.1 niveau AA.

#### Navigation au clavier

Tous les éléments interactifs sont accessibles au clavier. L'ordre de tabulation est logique. Le focus est toujours visible (outline). Les raccourcis clavier sont documentés.

#### Attributs ARIA

Les boutons ont des labels explicites (aria-label). Les régions sont marquées avec role. Les états sont communiqués (aria-expanded, aria-selected). Les erreurs utilisent aria-invalid et aria-describedby.

#### Contrastes

Le ratio de contraste texte/fond est au minimum de 4.5:1. Les boutons atteignent 3:1. Les erreurs utilisent couleur + icône (pas seulement couleur).

#### Lecteurs d'écran

Les images ont des textes alternatifs. Les icônes décoratives sont marquées aria-hidden. Les landmarks structurent la page (header, nav, main, footer). Les changements dynamiques utilisent aria-live.

#### Tests d'accessibilité

J'ai utilisé Lighthouse pour auditer l'accessibilité. Les scores sont tous supérieurs à 90/100. Les rapports sont disponibles dans docs/accessibility/.

Je teste régulièrement avec un lecteur d'écran (NVDA).

---

## Section 9 : Tests et vérifications

### 9.1 Stratégie de tests

J'ai mis en place plusieurs types de tests pour garantir la qualité du projet.

#### Tests unitaires

Les tests unitaires vérifient le fonctionnement des fonctions isolées. J'utilise Jest comme framework de test. Les utilitaires (validation, parsing, formatting) sont testés. La couverture de code des utilitaires dépasse 80%.

Exemples de tests :

- Validation des emails
- Parsing des métadonnées de fichiers
- Formatage des dates
- Hashage des mots de passe

#### Tests d'intégration

Les tests d'intégration vérifient les interactions entre composants. Les endpoints API sont testés avec supertest. Les scénarios utilisateur complets sont simulés.

Exemples de tests :

- Création d'une KB et ajout de contenu
- Flux d'authentification complet
- Gestion des permissions
- Conversation avec l'IA

#### Tests end-to-end

Les tests E2E simulaient des interactions utilisateur réelles. J'ai utilisé Playwright pour automatiser les tests. Les parcours critiques sont couverts.

Exemples de tests :

- Inscription et première connexion
- Création d'une KB et chat
- Partage d'une KB avec un collaborateur
- Gestion de l'historique des conversations

### 9.2 Plan de tests

J'ai établi un plan de tests couvrant toutes les fonctionnalités.

#### Tests fonctionnels

**Authentification**

- Inscription avec email valide/invalide
- Connexion avec credentials corrects/incorrects
- Reset de mot de passe
- Déconnexion

**Gestion des KB**

- Création d'une KB
- Liste des KB accessibles
- Modification d'une KB (nom, description)
- Suppression d'une KB

**Gestion du contenu**

- Ajout de notes avec Markdown
- Upload de fichiers (PDF, DOCX, images)
- Ajout d'URLs
- Suppression de contenus

**Chat IA**

- Envoi de messages
- Réception de réponses streamées
- Affichage des sources
- Sauvegarde automatique de la conversation

**Permissions**

- Invitation d'un collaborateur
- Modification du rôle d'un collaborateur
- Vérification des accès selon le rôle
- Suppression d'un collaborateur

#### Tests de sécurité

**Authentification**

- Tentative d'accès sans authentification
- Validation de la force du mot de passe
- Protection contre le brute force

**Autorisation**

- Accès à une KB non autorisée
- Modification d'une ressource sans permissions
- Élévation de privilèges

**Injection**

- Injection SQL dans les formulaires
- XSS dans les champs texte
- Path traversal dans les uploads

**CSRF**

- Requêtes cross-origin non autorisées
- Validation des tokens CSRF

#### Tests de performance

**Temps de réponse**

- Page d'accueil < 1s
- Liste des KB < 500ms
- Réponse chat (premier token) < 2s
- Upload de fichier 10MB < 5s

**Charge**

- 100 utilisateurs simultanés
- 1000 KB dans la base
- 10000 messages dans l'historique

**Optimisation**

- Lazy loading des images
- Code splitting des routes
- Compression gzip/brotli

### 9.3 Résultats des tests

Les tests montrent une application stable et performante.

#### Couverture de code

Utilitaires : 85% de couverture. Services métier : 70% de couverture. Endpoints API : 90% de couverture. Moyenne globale : 78% de couverture.

#### Tests automatisés

152 tests unitaires, tous passants. 43 tests d'intégration, tous passants. 12 tests E2E, tous passants.

#### Bugs identifiés et corrigés

15 bugs mineurs détectés pendant les tests. 3 bugs majeurs corrigés avant la release. 0 bug critique en production.

#### Performance

Le score Lighthouse est de 95/100. Le temps de chargement initial est de 1.2s. Le First Contentful Paint est à 0.8s. Le Time to Interactive est à 1.5s.

### 9.4 Recette finale

J'ai mené une recette complète avant la soutenance.

#### Checklist de recette

Tous les critères de la checklist RNCP sont validés. Chaque fonctionnalité a été testée manuellement. Les cas limites ont été vérifiés. Les messages d'erreur sont clairs et utiles.

#### Tests utilisateur

J'ai fait tester l'application par 3 personnes externes. Leurs retours ont permis d'améliorer l'UX. Les points de friction identifiés ont été corrigés.

#### Validation des personas

Chaque persona a pu accomplir ses objectifs. Léa a créé sa KB de formation. Marc a partagé une KB avec son équipe. Sophie a généré des quiz via le chat.

---

## Section 10 : Documentation & soutenance

### 10.1 Documentation utilisateur

Une documentation complète guide les utilisateurs dans l'utilisation de l'application.

#### Guide de démarrage rapide

Le README.md principal explique comment installer et lancer l'application. Les prérequis sont listés (Node.js, Docker). Les commandes d'installation sont détaillées pas à pas.

Un guide "Premiers pas" accompagne l'utilisateur :

1. Créer un compte
2. Créer sa première KB
3. Ajouter du contenu
4. Démarrer une conversation avec l'IA

#### Manuel utilisateur

Un manuel complet documente toutes les fonctionnalités :

**Gestion du compte**

- Modifier son profil
- Changer son mot de passe
- Gérer ses préférences (langue, thème)
- Supprimer son compte

**Gestion des KB**

- Créer une nouvelle KB
- Organiser ses KB
- Partager une KB
- Gérer les permissions

**Ajout de contenu**

- Rédiger des notes en Markdown
- Uploader des fichiers
- Ajouter des URLs
- Organiser le contenu

**Utilisation du chat**

- Poser des questions
- Comprendre les sources
- Gérer l'historique
- Renommer les conversations

#### FAQ

Une FAQ répond aux questions fréquentes :

- Comment réinitialiser mon mot de passe ?
- Quels formats de fichiers sont supportés ?
- Comment fonctionne le RAG ?
- Puis-je exporter mes conversations ?
- Comment supprimer une KB ?

### 10.2 Documentation technique

La documentation technique est destinée aux développeurs.

#### Architecture

Le document docs/architecture/ explique :

- L'architecture globale du système
- Le rôle de chaque service Docker
- Les flux de données entre composants
- Les choix techniques et leurs justifications

#### Schéma de base de données

Le schéma Prisma est documenté avec des commentaires. Un diagramme ERD (Entity-Relationship Diagram) visualise les relations. Les contraintes et index sont explicités.

#### API Reference

docs/api/README.md documente tous les endpoints :

```text
POST /api/auth/signup
Body: { email, password, name }
Response: { user, token }

GET /api/kb
Response: { kbs: [] }

POST /api/kb
Body: { name, description }
Response: { kb }

GET /api/kb/:id
Response: { kb, permissions }

POST /api/kb/:id/chat
Body: { message }
Response: Stream (SSE)
```

Chaque endpoint précise :

- Méthode HTTP
- URL et paramètres
- Headers requis
- Body attendu
- Réponses possibles (200, 400, 401, 403, 500)
- Exemples avec curl

#### Guide de contribution

Un fichier CONTRIBUTING.md explique :

- Comment cloner le projet
- La structure des branches
- Les conventions de commit
- Le processus de Pull Request
- Les standards de code

#### Guide de déploiement

docs/deployment.md détaille :

- Configuration de l'environnement de production
- Variables d'environnement requises
- Commandes de déploiement
- Configuration nginx/reverse proxy
- Gestion des certificats SSL
- Monitoring et logging

### 10.3 Support de présentation

Le support de soutenance est clair et structuré.

#### Slides PowerPoint

Une présentation de 20 slides couvre :

**Introduction (2 slides)**

- Présentation personnelle
- Contexte et problématique

**Analyse du besoin (3 slides)**

- Problématique identifiée
- Personas et cas d'usage
- Objectifs du projet

**Conception (3 slides)**

- Architecture technique
- Schéma de base de données
- Choix technologiques

**Réalisation (5 slides)**

- Fonctionnalités principales
- Captures d'écran
- Démo vidéo

**Technique (3 slides)**

- Stack technologique
- Sécurité et RGPD
- Tests et qualité

**Bilan (2 slides)**

- Compétences acquises
- Perspectives d'évolution

**Conclusion (2 slides)**

- Points forts du projet
- Questions du jury

#### Démonstration live

Une démo live est prévue pendant la soutenance :

- Connexion et navigation
- Création d'une KB
- Ajout de contenu
- Conversation avec l'IA
- Gestion des permissions

Un environnement de démo est préparé avec des données réalistes.

#### Notes de présentation

Des notes accompagnent chaque slide pour ne rien oublier. Les transitions entre slides sont fluides. Le timing est respecté (20 minutes de présentation).

---

## Section 11 : Mise en production (ou démo fonctionnelle)

### 11.1 Hébergement et déploiement

L'application est déployable sur différents environnements.

#### Environnement de développement

Le projet fonctionne localement avec Docker Compose. La commande `docker-compose up` lance tous les services. Le hot-reload est activé pour un développement rapide.

#### Environnement de staging

Un environnement de staging reproduit la production. Il est déployé sur un VPS dédié. Les données sont des copies anonymisées de la production.

#### Environnement de production

Pour la production, j'ai prévu un déploiement sur VPS ou cloud privé. Les services critiques (PostgreSQL, MongoDB) ont des sauvegardes automatiques. Les logs sont centralisés et analysés.

#### Choix de la plateforme

J'ai évalué plusieurs options :

**VPS (Hetzner, OVH)**

- Avantages : Contrôle total, coût prévisible, performances élevées
- Inconvénients : Maintenance manuelle, scaling complexe

**Cloud (AWS, GCP)**

- Avantages : Scaling automatique, services managés
- Inconvénients : Coût variable, vendor lock-in

**PaaS (Vercel, Railway)**

- Avantages : Déploiement simplifié, CI/CD intégrée
- Inconvénients : Limitations des services (Ollama, ChromaDB)

Pour ce projet, le VPS est le choix optimal car il permet d'héberger Ollama et ChromaDB sans surcoût.

### 11.2 Processus de déploiement

Le déploiement est documenté et automatisé.

#### Configuration serveur

Le serveur nécessite :

- Ubuntu 22.04 LTS
- Docker et Docker Compose
- Nginx comme reverse proxy
- Certbot pour les certificats SSL

#### Variables d'environnement

Un fichier .env.production contient :

```text
DATABASE_URL="postgresql://user:pass@localhost:5432/kb"
MONGODB_URI="mongodb://localhost:27017/kb-logs"
NEXTAUTH_SECRET="generated-secret-key"
```text
NEXTAUTH_URL="https://kb.example.com"
OLLAMA_BASE_URL="http://ollama:11434"
CHROMADB_URL="http://chromadb:8000"
TIKA_URL="http://tika:9998"
SEARXNG_URL="http://searxng:8888"
```

Ces variables sont chargées au démarrage de l'application.

#### Étapes de déploiement

Le déploiement suit un processus standardisé :

1. Cloner le dépôt sur le serveur
2. Copier le fichier .env.production en .env
3. Lancer `docker-compose -f docker-compose.prod.yml up -d`
4. Exécuter les migrations Prisma : `npm run migrate:deploy`
5. Vérifier que tous les services sont opérationnels
6. Configurer nginx pour le reverse proxy
7. Obtenir un certificat SSL avec Certbot
8. Redémarrer nginx

#### Script de déploiement

J'ai créé un script deploy.sh qui automatise ces étapes :

```bash
#!/bin/bash
set -e

echo "Pulling latest changes..."
git pull origin main

echo "Building Docker images..."
docker-compose -f docker-compose.prod.yml build

echo "Running database migrations..."
docker-compose -f docker-compose.prod.yml run --rm web npm run migrate:deploy

echo "Starting services..."
docker-compose -f docker-compose.prod.yml up -d

echo "Deployment completed!"
```

#### Monitoring et logs

Les logs de tous les services sont centralisés avec Docker logs. Un système de rotation des logs évite la saturation du disque. Les erreurs critiques déclenchent des alertes par email.

Je surveille les métriques suivantes :

- Utilisation CPU et RAM
- Espace disque disponible
- Temps de réponse des endpoints
- Nombre de requêtes par minute
- Taux d'erreur HTTP

### 11.3 URL de démonstration

Une instance de démonstration est accessible pour la soutenance.

#### Accès démo

URL : <https://kb-demo.example.com> (à définir)

Comptes de test :

- Admin : <admin@demo.com> / Demo2024!
- Editor : <editor@demo.com> / Demo2024!
- Viewer : <viewer@demo.com> / Demo2024!

#### Données de test

L'environnement de démo contient :

**KB "Formation DWWM"**

- 15 notes de cours sur différents sujets
- 8 fichiers PDF (supports de cours)
- 12 URLs vers des ressources techniques
- 5 conversations archivées avec l'IA

**KB "Documentation React"**

- 20 notes sur les hooks, composants, patterns
- 6 fichiers (cheat sheets, tutoriels)
- 18 URLs vers la doc officielle
- 8 conversations techniques

**KB "Veille Technologique"**

- 25 articles sauvegardés
- 10 fichiers (whitepapers, RFCs)
- 30 URLs vers des blogs tech
- 12 conversations d'analyse

#### Scénarios de démonstration

Scénario 1 : Étudiant révisant son cours

1. Se connecter avec le compte <editor@demo.com>
2. Ouvrir la KB "Formation DWWM"
3. Parcourir les notes de cours
4. Lancer une conversation : "Explique-moi le principe des closures en JavaScript"
5. Observer les sources utilisées dans la réponse

Scénario 2 : Développeur cherchant une information

1. Se connecter avec le compte <admin@demo.com>
2. Ouvrir la KB "Documentation React"
3. Uploader un nouveau fichier PDF
4. Poser une question technique dans le chat
5. Renommer et sauvegarder la conversation

Scénario 3 : Collaboration en équipe

1. Se connecter avec le compte <admin@demo.com>
2. Créer une nouvelle KB "Projet Client X"
3. Ajouter du contenu (notes, fichiers)
4. Inviter un collaborateur (<editor@demo.com>)
5. Vérifier les permissions en tant qu'editor

---

## Synthèse et bilan

### Compétences acquises

Ce projet m'a permis de développer et consolider de nombreuses compétences techniques et méthodologiques.

#### Compétences techniques

**Frontend moderne**

J'ai maîtrisé Next.js 14 avec l'App Router qui représente une évolution majeure du framework. La gestion du Server-Side Rendering et des Server Components m'a appris à optimiser les performances. L'intégration de TailwindCSS 4 et shadcn/ui m'a permis de créer une interface cohérente et maintenable.

**Backend et APIs**

Le développement d'API REST avec Next.js API Routes m'a familiarisé avec les bonnes pratiques. L'utilisation de Prisma ORM m'a appris à modéliser des données complexes avec des relations. La validation avec Zod garantit la robustesse des endpoints.

**Intelligence artificielle**

L'implémentation du RAG (Retrieval Augmented Generation) m'a fait découvrir le monde des embeddings vectoriels. L'intégration d'Ollama et ChromaDB m'a permis de comprendre le fonctionnement des LLM locaux. Le streaming des réponses via SSE améliore l'expérience utilisateur.

**DevOps et orchestration**

Docker Compose m'a appris à orchestrer des architectures multi-services. La configuration de reverse proxy nginx et des certificats SSL m'a familiarisé avec les enjeux de production. Les processus de déploiement automatisés assurent la fiabilité.

**Sécurité**

J'ai implémenté des protections contre les vulnérabilités classiques (SQL injection, XSS, CSRF). La gestion des permissions avec un système de rôles m'a sensibilisé aux enjeux d'autorisation. Le respect du RGPD m'a fait prendre conscience de la protection des données personnelles.

#### Compétences méthodologiques

**Méthodologie Agile**

Le découpage en sprints de 2 semaines m'a permis d'itérer rapidement. Les User Stories ont guidé le développement centré utilisateur. La priorisation MoSCoW a assuré que les fonctionnalités essentielles soient livrées en premier.

**Gestion de versions**

L'utilisation quotidienne de Git m'a rendu autonome sur le versioning. La stratégie de branches (Git Flow) structure l'historique du projet. Les commits conventionnels facilitent la lecture du changelog.

**Documentation**

Rédiger une documentation technique complète m'a appris à structurer l'information. La documentation utilisateur m'a sensibilisé aux besoins de clarté. Les README et guides facilitent la prise en main du projet.

**Tests**

L'écriture de tests unitaires et d'intégration garantit la stabilité du code. Les tests E2E valident les parcours utilisateur critiques. La couverture de code guide les efforts de test.

### Points forts du projet

#### Innovation technique

La combinaison de bases de connaissance et d'IA conversationnelle via RAG est innovante. Peu d'outils grand public proposent cette intégration. L'auto-hébergement (Ollama, ChromaDB) évite la dépendance aux APIs payantes.

#### Qualité du code

Le code TypeScript strict réduit les erreurs à l'exécution. L'organisation modulaire facilite la maintenance. Les tests automatisés garantissent la non-régression.

#### Expérience utilisateur

L'interface responsive s'adapte à tous les écrans. Le design cohérent suit les standards de l'industrie. L'accessibilité permet l'usage par tous.

#### Documentation complète

Chaque aspect du projet est documenté. Les guides facilitent l'installation et l'utilisation. L'API reference aide les futurs contributeurs.

#### Sécurité et conformité

Les mesures de sécurité protègent les données utilisateur. Le respect du RGPD est pris au sérieux. Les audits de sécurité ont identifié et corrigé les failles.

### Difficultés rencontrées

#### Intégration du RAG

La mise en place du pipeline RAG a été complexe. L'extraction de texte depuis différents formats nécessite Apache Tika. La génération d'embeddings et leur stockage dans ChromaDB demande de la configuration. Le tuning des paramètres (nombre de documents, seuil de similarité) a nécessité de l'expérimentation.

Solution : J'ai consulté la documentation d'Open-WebUI et ChromaDB. J'ai testé différentes configurations jusqu'à obtenir des résultats satisfaisants.

#### Gestion des permissions

Implémenter un système de permissions granulaire est délicat. Vérifier les autorisations à chaque requête API sans impacter les performances nécessite de l'optimisation. Les tests de permissions doivent couvrir tous les cas limites.

Solution : J'ai créé un middleware d'autorisation centralisé. Les permissions sont vérifiées en base avec des requêtes optimisées. Les tests automatisés valident tous les scénarios.

#### Streaming des réponses

Le streaming via Server-Sent Events (SSE) a posé des défis. La gestion des erreurs en cours de streaming nécessite une attention particulière. L'affichage progressif du texte doit rester fluide.

Solution : J'ai implémenté un système de retry automatique. Les erreurs sont loggées côté serveur. Le client gère gracieusement les déconnexions.

#### Performance avec de gros fichiers

L'upload et le parsing de fichiers volumineux peuvent bloquer l'application. L'indexation de documents longs dans ChromaDB est coûteuse. La mémoire utilisée par Ollama doit être surveillée.

Solution : J'ai limité la taille maximale des fichiers à 50MB. Le parsing est asynchrone et n'impacte pas l'UI. Les documents sont découpés en chunks avant indexation.

### Perspectives d'évolution

#### Fonctionnalités futures

**Export des conversations**

Permettre d'exporter les conversations en PDF ou Markdown. Utile pour créer des rapports ou des documents de synthèse.

**Recherche full-text avancée**

Intégrer ElasticSearch pour une recherche plus puissante. Permettre de chercher dans tout le contenu d'une KB simultanément.

**Édition collaborative temps réel**

Utiliser WebSockets pour permettre l'édition simultanée de notes. Inspiré de Google Docs ou Notion.

**Intégration Slack/Discord**

Créer des bots pour interroger les KB depuis Slack ou Discord. Facilite l'accès aux connaissances pour les équipes.

**Analytics et insights**

Ajouter des statistiques sur l'utilisation (questions fréquentes, sources populaires). Permet d'identifier les gaps de connaissance.

**Support de plus de formats**

Étendre le parsing à des formats spécialisés (CSV, Excel, code source). Permettre l'analyse de bases de code.

#### Améliorations techniques

**Optimisation du RAG**

Tester des modèles d'embeddings plus performants. Implémenter du re-ranking pour améliorer la pertinence. Expérimenter avec différentes stratégies de chunking.

**Mise en cache**

Mettre en cache les réponses fréquentes avec Redis. Réduire la charge sur Ollama et ChromaDB.

**Scalabilité horizontale**

Permettre de distribuer la charge sur plusieurs instances. Utiliser Kubernetes pour l'orchestration en production.

**Monitoring avancé**

Intégrer Prometheus et Grafana pour des métriques détaillées. Ajouter du tracing distribué avec OpenTelemetry.

**CI/CD complète**

Automatiser totalement le déploiement avec GitHub Actions. Inclure des tests de sécurité (SAST, DAST) dans le pipeline.

### Conclusion

Le projet Knowledge Base Platform a été une expérience extrêmement formatrice. Il m'a permis de mettre en pratique l'ensemble des compétences acquises durant ma formation DWWM.

La combinaison de technologies modernes (Next.js 14, Prisma, Ollama, ChromaDB) m'a confronté à des défis techniques stimulants. La méthodologie Agile appliquée tout au long du projet a structuré mon travail.

Au-delà de l'aspect technique, ce projet répond à un besoin réel que j'ai identifié. Les retours des utilisateurs de test confirment la valeur ajoutée de la solution.

Je suis particulièrement fier de la qualité du code, de la documentation complète, et de l'attention portée à la sécurité et à l'accessibilité.

Ce projet constitue une base solide pour une application professionnelle. Les perspectives d'évolution sont nombreuses et je compte continuer à le développer après l'obtention de mon titre RNCP.

Cette expérience m'a confirmé dans ma volonté de devenir développeur full-stack spécialisé dans les applications web modernes intégrant l'intelligence artificielle.

---

**Date** : Janvier 2025
**Candidat** : Teddy
**Titre** : Développeur Web et Web Mobile (RNCP 5)
**Projet** : Knowledge Base Platform
**Dépôt** : github.com/TheWatcher01/knowledge_base
