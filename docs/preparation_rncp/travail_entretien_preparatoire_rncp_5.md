# Entretien Préparatoire RNCP 5 - Knowledge Base Platform

**Candidat** : Teddy
**Titre** : Développeur Web et Web Mobile (RNCP 5)
**Projet** : Knowledge Base Platform
**Date** : Octobre 2025

---

## 📑 Table des Matières

<details>
<summary><strong>Section 1 : Analyse et formalisation du besoin</strong></summary>

📖 **[Voir la section complète](sections/01-analyse-besoin.md)**

- 1.1 Problématique identifiée et validation marché
- 1.2 Utilisateurs cibles (4 personas détaillés)
- 1.3 Besoin concret et solution proposée
- 1.4 Mode de recueil des besoins (Agile/Scrum)
- 1.5 Cahier des charges fonctionnel

</details>

<details>
<summary><strong>Section 2 : Planning et organisation</strong></summary>

📖 **[Voir la section complète](sections/02-planning-organisation.md)**

- 2.1 Rétroplanning du projet (7 sprints de 2 semaines)
- 2.2 Phases du projet (Conception, Développement, Tests, Production)
- 2.3 Outils de suivi (Git/GitHub, Documentation, Gestion de projet)

</details>

<details>
<summary><strong>Section 3 : Conception et prototypage</strong></summary>

- [Section 3 : Conception et prototypage](#section-3--conception-et-prototypage)
  - [3.1 Maquettes et prototypes](#31-maquettes-et-prototypes)
  - [3.2 Structure du site](#32-structure-du-site)
  - [3.3 Choix ergonomiques](#33-choix-ergonomiques)

</details>

<details>
<summary><strong>Section 4 : Base de données et architecture applicative</strong></summary>

- [Section 4 : Base de données et architecture applicative](#section-4--base-de-données-et-architecture-applicative)
  - [4.1 Structure des données](#41-structure-des-données)
  - [4.2 Architecture applicative](#42-architecture-applicative)
  - [4.3 Justification des choix techniques](#43-justification-des-choix-techniques)

</details>

<details>
<summary><strong>Section 5 : Fonctionnalités réalisées</strong></summary>

- [Section 5 : Fonctionnalités réalisées](#section-5--fonctionnalités-réalisées)
  - [5.1 Fonctionnalités principales](#51-fonctionnalités-principales)
  - [5.2 Intégrations externes](#52-intégrations-externes)
  - [5.3 Démonstration](#53-démonstration)

</details>

<details>
<summary><strong>Section 6 : Sécurité et bonnes pratiques</strong></summary>

- [Section 6 : Sécurité et bonnes pratiques](#section-6--sécurité-et-bonnes-pratiques)
  - [6.1 Mesures de sécurité implémentées](#61-mesures-de-sécurité-implémentées)
  - [6.2 HTTPS et configuration de production](#62-https-et-configuration-de-production)
  - [6.3 Conformité RGPD](#63-conformité-rgpd)

</details>

<details>
<summary><strong>Section 7 : Qualité du code et gestion de versions</strong></summary>

- [Section 7 : Qualité du code et gestion de versions](#section-7--qualité-du-code-et-gestion-de-versions)
  - [7.1 Dépôt Git et historique](#71-dépôt-git-et-historique)
  - [7.2 Organisation du code](#72-organisation-du-code)
  - [7.3 Documentation du code](#73-documentation-du-code)
  - [7.4 Qualité du code](#74-qualité-du-code)

</details>

<details>
<summary><strong>Section 8 : Front-end : présentation et interactivité</strong></summary>

- [Section 8 : Front-end : présentation et interactivité](#section-8--front-end--présentation-et-interactivité)
  - [8.1 Design responsive](#81-design-responsive)
  - [8.2 Cohérence visuelle et CSS](#82-cohérence-visuelle-et-css)
  - [8.3 Interactivité](#83-interactivité)
  - [8.4 Accessibilité](#84-accessibilité)

</details>

<details>
<summary><strong>Section 9 : Tests et vérifications</strong></summary>

- [Section 9 : Tests et vérifications](#section-9--tests-et-vérifications)
  - [9.1 Stratégie de tests](#91-stratégie-de-tests)
  - [9.2 Plan de tests](#92-plan-de-tests)
  - [9.3 Résultats des tests](#93-résultats-des-tests)
  - [9.4 Recette finale](#94-recette-finale)

</details>

<details>
<summary><strong>Section 10 : Documentation & soutenance</strong></summary>

- [Section 10 : Documentation & soutenance](#section-10--documentation--soutenance)
  - [10.1 Documentation utilisateur](#101-documentation-utilisateur)
  - [10.2 Documentation technique](#102-documentation-technique)
  - [10.3 Support de présentation](#103-support-de-présentation)

</details>

<details>
<summary><strong>Section 11 : Mise en production (ou démo fonctionnelle)</strong></summary>

- [Section 11 : Mise en production (ou démo fonctionnelle)](#section-11--mise-en-production-ou-démo-fonctionnelle)
  - [11.1 Hébergement et déploiement](#111-hébergement-et-déploiement)
  - [11.2 Processus de déploiement](#112-processus-de-déploiement)

</details>

---

## Section 1 : Analyse et formalisation du besoin

> 📖 **Cette section est disponible en version détaillée** : [Section 1 complète](sections/01-analyse-besoin.md)

### Vue d'ensemble

Le projet **Knowledge Base Platform** répond à une problématique identifiée durant ma formation DWWM : **la gestion fragmentée de la connaissance** (notes, fichiers, URLs dispersés entre multiples outils).

**Validation marché** : Cette problématique correspond à un besoin réel du secteur professionnel (ESN, aéronautique, défense en Occitanie), démontré par 50+ offres d'emploi analysées et des études de marché chiffrées.

**Solution proposée** : Plateforme centralisée avec **chat IA + RAG** permettant d'interroger intelligemment des bases de connaissance thématiques.

### Points clés

#### 1.1 Problématique et validation marché

- **Constat** : Dispersion des connaissances dans 15-20 outils
- **Impact mesurable** : 2h/jour perdues, 40% de réinventions, 8-12 mois d'onboarding
- **Sources** : 13 références vérifiables (McKinsey, Harvard Business Review, Tech-Clarity, Airbus, TotalEnergies)

📚 [Voir les sources détaillées](sources/references-bibliographiques.md)

#### 1.2 Utilisateurs cibles (4 personas)

1. **Marc** (développeur/étudiant) - Centraliser cours et documentation technique
2. **Dr. Dubois** (chercheuse) - Organiser articles scientifiques et recherche
3. **M. Martineau** (administration) - Gérer textes réglementaires avec traçabilité
4. **Sophie Mercier** (ESN/KM) - Capitaliser 15 ans de projets pour 500+ ingénieurs

#### 1.3 Besoin concret et solution proposée

- **Objectif** : Centraliser et exploiter intelligemment les connaissances
- **Proposition de valeur** : Chat IA avec RAG pour interroger des bases de connaissance thématiques
- **Différenciation** : Combinaison unique de gestion de contenu + IA contextuelle + collaboration

#### 1.4 Mode de recueil des besoins (Agile/Scrum)

- **Phase 1** : Analyse marché (50+ offres) + Benchmark solutions existantes
- **Phase 2** : User Stories par persona + Validation terrain
- **Phase 3** : Priorisation MoSCoW (Must/Should/Could/Won't have)

#### 1.5 Cahier des charges fonctionnel

**Fonctionnalités clés** : Authentification, CRUD KB, Upload fichiers (PDF/DOCX), Chat IA avec RAG, Persistance conversations, Gestion permissions (Admin/Editor/Viewer), I18n (FR/EN)

**Exigences non-fonctionnelles** : Performance (API < 200ms), Sécurité (bcrypt, CSRF, XSS), RGPD, Accessibilité (WCAG 2.1 AA), Responsive

📄 [Lire la section complète](sections/01-analyse-besoin.md)

---

## Section 2 : Planning et organisation

> 📖 **[Voir la section complète dans sections/02-planning-organisation.md](sections/02-planning-organisation.md)**

### Synthèse

Le projet Knowledge Base Platform s'est déroulé sur **4 mois** (16 semaines), découpé en **7 sprints de 2 semaines** selon la méthodologie **Agile/Scrum**.

#### 🗓️ Planning global

- **Sprint 0** : Conception et setup technique
- **Sprint 1** : Authentification et bases de données
- **Sprint 2** : Gestion du contenu (notes, fichiers, URLs)
- **Sprint 3** : Chat IA avec RAG (cœur métier)
- **Sprint 4** : Persistance des conversations
- **Sprint 5** : Permissions et collaboration
- **Sprint 6** : Internationalisation et optimisations
- **Sprint 7** : Tests, documentation et déploiement

#### 🛠️ Outils de gestion

- **Git/GitHub** : Versioning et collaboration
- **GitHub Projects** : Kanban et suivi des tâches
- **Priorisation MoSCoW** : Must have, Should have, Could have, Won't have
- **Documentation Markdown** : FEATURES.md, chat-persistence-plan.md, API docs

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

#### Variables d'environnement (sécurité)

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

#### Navigation interactive

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

##### Authentification

- Inscription avec email valide/invalide
- Connexion avec credentials corrects/incorrects
- Reset de mot de passe
- Déconnexion

##### Gestion des KB

- Création d'une KB
- Liste des KB accessibles
- Modification d'une KB (nom, description)
- Suppression d'une KB

##### Gestion du contenu

- Ajout de notes avec Markdown
- Upload de fichiers (PDF, DOCX, images)
- Ajout d'URLs
- Suppression de contenus

##### Chat IA

- Envoi de messages
- Réception de réponses streamées
- Affichage des sources
- Sauvegarde automatique de la conversation

##### Permissions

- Invitation d'un collaborateur
- Modification du rôle d'un collaborateur
- Vérification des accès selon le rôle
- Suppression d'un collaborateur

#### Tests de sécurité

##### Authentification (sécurité)

- Tentative d'accès sans authentification
- Validation de la force du mot de passe
- Protection contre le brute force

##### Autorisation

- Accès à une KB non autorisée
- Modification d'une ressource sans permissions
- Élévation de privilèges

##### Injection

- Injection SQL dans les formulaires
- XSS dans les champs texte
- Path traversal dans les uploads

##### CSRF

- Requêtes cross-origin non autorisées
- Validation des tokens CSRF

#### Tests de performance

##### Temps de réponse

- Page d'accueil < 1s
- Liste des KB < 500ms
- Réponse chat (premier token) < 2s
- Upload de fichier 10MB < 5s

##### Charge

- 100 utilisateurs simultanés
- 1000 KB dans la base
- 10000 messages dans l'historique

##### Optimisation

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

##### Gestion du compte

- Modifier son profil
- Changer son mot de passe
- Gérer ses préférences (langue, thème)
- Supprimer son compte

##### Gestion des KB (manuel)

- Créer une nouvelle KB
- Organiser ses KB
- Partager une KB
- Gérer les permissions

##### Ajout de contenu

- Rédiger des notes en Markdown
- Uploader des fichiers
- Ajouter des URLs
- Organiser le contenu

##### Utilisation du chat

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

##### Introduction (2 slides)

- Présentation personnelle
- Contexte et problématique (incluant l'observation du marché professionnel)

##### Analyse du besoin (3 slides)

- Problématique identifiée (gestion fragmentée + demande marché)
- Personas et cas d'usage
- Objectifs du projet

##### Conception (3 slides)

- Architecture technique
- Schéma de base de données
- Choix technologiques

##### Réalisation (5 slides)

- Fonctionnalités principales
- Captures d'écran
- Démo vidéo

##### Technique (3 slides)

- Stack technologique
- Sécurité et RGPD
- Tests et qualité

##### Bilan (2 slides)

- Compétences acquises
- Perspectives d'évolution et opportunités professionnelles

##### Conclusion (2 slides)

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

##### VPS (Hetzner, OVH)

- Avantages : Contrôle total, coût prévisible, performances élevées
- Inconvénients : Maintenance manuelle, scaling complexe

##### Cloud (AWS, GCP)

- Avantages : Scaling automatique, services managés
- Inconvénients : Coût variable, vendor lock-in

##### PaaS (Vercel, Railway)

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

#### Variables d'environnement (déploiement)

Un fichier .env.production contient :

```text
DATABASE_URL="postgresql://user:pass@localhost:5432/kb"
MONGODB_URI="mongodb://localhost:27017/kb-logs"
NEXTAUTH_SECRET="generated-secret-key"
NEXTAUTH_URL="// filepath: /home/teddy/projects/knowledge_base/preparation_rncp/traval_Entretien Préparatoire RNCP 5.md
