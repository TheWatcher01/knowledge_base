**📖 Navigation** : [← Section 1 : Analyse et formalisation du besoin](01-analyse-besoin.md) | [🏠 Retour au sommaire](../travail_entretien_preparatoire_rncp_5.md) | [Section 3 : Conception et prototypage →](03-conception-prototypage.md)

# Section 2 : Planning et organisation

## 📑 Table des matières

<details>
<summary><strong>2.1 Rétroplanning du projet</strong></summary>

- [2.1 Rétroplanning du projet](#21-rétroplanning-du-projet)
  - [Sprint 0 : Conception et setup (Semaines 1-2)](#sprint-0--conception-et-setup-semaines-1-2)
  - [Sprint 1 : Authentification et bases (Semaines 3-4)](#sprint-1--authentification-et-bases-semaines-3-4)
  - [Sprint 2 : Gestion du contenu (Semaines 5-6)](#sprint-2--gestion-du-contenu-semaines-5-6)
  - [Sprint 3 : Chat IA et RAG (Semaines 7-8)](#sprint-3--chat-ia-et-rag-semaines-7-8)
  - [Sprint 4 : Persistance des conversations (Semaines 9-10)](#sprint-4--persistance-des-conversations-semaines-9-10)
  - [Sprint 5 : Permissions et collaboration (Semaines 11-12)](#sprint-5--permissions-et-collaboration-semaines-11-12)
  - [Sprint 6 : Internationalisation et polish (Semaines 13-14)](#sprint-6--internationalisation-et-polish-semaines-13-14)
  - [Sprint 7 : Tests et déploiement (Semaines 15-16)](#sprint-7--tests-et-déploiement-semaines-15-16)

</details>

<details>
<summary><strong>2.2 Phases du projet</strong></summary>

- [2.2 Phases du projet](#22-phases-du-projet)
  - [Phase 1 : Conception (Semaines 1-2)](#phase-1--conception-semaines-1-2)
  - [Phase 2 : Développement (Semaines 3-14)](#phase-2--développement-semaines-3-14)
  - [Phase 3 : Tests (Semaines 15-16)](#phase-3--tests-semaines-15-16)
  - [Phase 4 : Mise en production (Semaine 16+)](#phase-4--mise-en-production-semaine-16)

</details>

<details>
<summary><strong>2.3 Outils de suivi</strong></summary>

- [2.3 Outils de suivi](#23-outils-de-suivi)
  - [Planning prévisionnel et checklist Markdown](#planning-prévisionnel-et-checklist-markdown)
  - [Git et GitHub](#git-et-github)
  - [Documentation Markdown](#documentation-markdown)
  - [Priorisation des tâches](#priorisation-des-tâches)

</details>

---

## 2.1 Rétroplanning du projet

Le projet s'est déroulé sur une période de 4 mois, découpée en sprints de 2 semaines.

### Sprint 0 : Conception et setup (Semaines 1-2)

- Analyse des besoins et définition des personas
- Choix de la stack technique
- Configuration de l'environnement de développement
- Mise en place du dépôt Git et de la CI/CD
- Création du docker-compose pour l'orchestration des services

### Sprint 1 : Authentification et bases (Semaines 3-4)

- Implémentation de l'authentification avec Auth.js
- Création du schéma de base de données Prisma
- CRUD des bases de connaissance
- Interface utilisateur de base avec Next.js et TailwindCSS

### Sprint 2 : Gestion du contenu (Semaines 5-6)

- Système de notes (création, édition, suppression)
- Upload et parsing de fichiers avec Apache Tika
- Ajout d'URLs avec ingestion via SearxNG
- Indexation dans ChromaDB pour le RAG

### Sprint 3 : Chat IA et RAG (Semaines 7-8)

- Intégration d'Open-WebUI et Ollama
- Implémentation du RAG avec ChromaDB
- Streaming des réponses via Server-Sent Events
- Interface de chat en temps réel

### Sprint 4 : Persistance des conversations (Semaines 9-10)

- Sauvegarde automatique des conversations
- Historique avec messages et métadonnées
- Renommage et suppression de conversations
- Reprise de conversation avec chargement d'historique

### Sprint 5 : Permissions et collaboration (Semaines 11-12)

- Système de rôles (Admin, Editor, Viewer)
- Gestion des permissions par KB
- Partage de KB avec collaborateurs
- Tests d'autorisation

### Sprint 6 : Internationalisation et polish (Semaines 13-14)

- Support français/anglais avec next-intl
- Amélioration de l'UI/UX
- Optimisation des performances
- Documentation technique

### Sprint 7 : Tests et déploiement (Semaines 15-16)

- Tests unitaires et d'intégration
- Tests de charge
- Documentation utilisateur
- Préparation de la soutenance

## 2.2 Phases du projet

Le projet a été structuré en 4 phases distinctes :

### Phase 1 : Conception (Semaines 1-2)

Analyse des besoins, benchmarking, définition des personas, choix technologiques, architecture système, modélisation de la base de données.

### Phase 2 : Développement (Semaines 3-14)

Implémentation des fonctionnalités par sprints successifs, revues de code régulières, ajustements basés sur les tests utilisateur.

### Phase 3 : Tests (Semaines 15-16)

Tests unitaires avec Jest, tests d'intégration, tests de sécurité, tests de charge, validation des fonctionnalités avec les personas.

### Phase 4 : Mise en production (Semaine 16+)

Configuration Docker Compose pour la production, documentation du processus de déploiement, mise en place de la surveillance et du logging, création de la démo live.

## 2.3 Outils de suivi

Travaillant seul sur ce projet, j'ai privilégié des outils légers et efficaces adaptés au développement solo :

### Planning prévisionnel et checklist Markdown

Au lieu d'utiliser une plateforme de gestion de projet, j'ai créé un **planning prévisionnel avec checklist en Markdown** (`planning.md`) versionné dans Git. Cette approche présente plusieurs avantages pour un développeur solo :

- **Simplicité** : Pas de configuration complexe, éditable dans n'importe quel éditeur
- **Traçabilité** : Versionné avec Git, historique complet des modifications
- **Flexibilité** : Facilement adaptable aux changements de priorités
- **Performance** : Pas de dépendance externe, fonctionne hors ligne

Le fichier `planning.md` combine un planning prévisionnel et une checklist organisée par thématiques RNCP (14 sections) avec cases à cocher pour suivre l'avancement :

```markdown
## 2. Planning et organisation
[ ] Rétroplanning avec grandes étapes
[x] Phases distinguées (conception, dev, tests, prod)
[ ] Outil de suivi des tâches
```

Chaque item peut être complété au fur et à mesure de l'avancement, offrant une vision claire du statut du projet.

### Git et GitHub

Dépôt GitHub avec commits atomiques et messages descriptifs. Organisation en branches :

- **master** : Branche principale (production)
- **dev** : Branche de développement et d'intégration
- **feature/*** : Branches de fonctionnalités (feature/chat-enhanced, feature/notes-crud, feature/files-crud, feature/urls-crud, feature/user-management)

Utilisation de GitHub Issues pour le suivi des bugs et features. Pull Requests avec revue de code (auto-revue avant merge).

### Documentation Markdown

Toute la documentation est écrite en Markdown et versionnée dans Git :

- **README.md** : Vue d'ensemble du projet, installation, démarrage
- **docs/FEATURES.md** : État détaillé des fonctionnalités implémentées
- **docs/chat-persistence-plan.md** : Roadmap technique et architecture
- **docs/api/README.md** : Documentation complète de l'API
- **planning.md** : Planning prévisionnel et critères de conformité RNCP

Cette documentation évolutive accompagne le projet et sert de référence technique.

### Priorisation des tâches

Utilisation de la **méthode MoSCoW** pour prioriser les fonctionnalités :

- **Must have** : Authentification, CRUD KB, Chat IA basique
- **Should have** : Persistance conversations, permissions
- **Could have** : Internationalisation, optimisations
- **Won't have** : Fonctionnalités reportées (collaboration temps réel, mobile app)

Cette méthode a permis de livrer un MVP fonctionnel rapidement, puis d'itérer sur les fonctionnalités avancées.

---

**📖 Navigation** : [← Section 1 : Analyse et formalisation du besoin](01-analyse-besoin.md) | [🏠 Retour au sommaire](../travail_entretien_preparatoire_rncp_5.md) | [Section 3 : Conception et prototypage →](03-conception-prototypage.md)
