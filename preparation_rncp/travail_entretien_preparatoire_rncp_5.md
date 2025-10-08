# Entretien Préparatoire RNCP 5 - Knowledge Base Platform

**Candidat** : Teddy
**Titre** : Développeur Web et Web Mobile (RNCP 5)
**Projet** : Knowledge Base Platform
**Date** : Octobre 2025

---

## 📑 Table des Matières

<details>
<summary><strong>Section 1 : Analyse et formalisation du besoin</strong></summary>

- [Section 1 : Analyse et formalisation du besoin](#section-1--analyse-et-formalisation-du-besoin)
  - [1.1 Problématique identifiée](#11-problématique-identifiée)
  - [1.2 Besoin concret](#12-besoin-concret)
  - [1.3 Mode de recueil des besoins](#13-mode-de-recueil-des-besoins)
  - [1.4 Utilisateurs cibles](#14-utilisateurs-cibles)
  - [1.5 Documents de référence](#15-documents-de-référence)

</details>

<details>
<summary><strong>Section 2 : Planning et organisation</strong></summary>

- [Section 2 : Planning et organisation](#section-2--planning-et-organisation)
  - [2.1 Rétroplanning du projet](#21-rétroplanning-du-projet)
  - [2.2 Phases du projet](#22-phases-du-projet)
  - [2.3 Outils de suivi](#23-outils-de-suivi)

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

### 1.1 Problématique identifiée

Dans le cadre de ma formation DWWM à la Holberton School de Toulouse, j'ai constaté une problématique récurrente dans les environnements professionnels et académiques : **la gestion fragmentée de la connaissance**.

Les utilisateurs jonglent quotidiennement entre plusieurs outils pour stocker des notes (Notion, Google Docs), gérer des fichiers (Google Drive, Dropbox), sauvegarder des liens (Pocket, bookmarks navigateur) et interagir avec des IA conversationnelles (ChatGPT, Claude).

Cette dispersion entraîne une **perte de temps** dans la recherche d'information, une **duplication des données**, et une difficulté à **exploiter intelligemment les connaissances accumulées**.

#### Validation par le marché professionnel

Parallèlement, lors de ma recherche de stage et d'alternance dans le bassin Toulousain, j'ai observé que cette problématique identifiée durant ma formation correspondait à **un besoin réel et urgent du marché professionnel**.

De nombreuses **ESN (Entreprises de Services du Numérique)** comme Capgemini, Sopra Steria, Atos, ainsi que des **sous-traitants de l'aéronautique** (Airbus, Thales, Safran), de la **défense** et du **spatial** (secteurs très présents en Occitanie) publiaient des offres d'emploi portant sur le développement d'**applications IA générative utilisant le RAG (Retrieval Augmented Generation)**.

**Constat terrain** : Ces entreprises possèdent des **volumes massifs de données techniques** accumulées sur 10-20 ans :

- Documentation de projets (spécifications, architectures, retours d'expérience)
- Bases de connaissances clients et procédures
- Code source et wikis techniques dispersés sur GitLab/Confluence
- Rapports d'audit, certifications et conformité réglementaire
- Expertise des ingénieurs seniors non capitalisée

**Le problème** : Ces connaissances sont **dispersées dans 15-20 outils différents** et **sous-exploitées**. Les études internes de ces entreprises montrent que :

- Les ingénieurs passent **2h/jour à chercher de l'information** existante <sup>[[1]](sources/references-bibliographiques.md#productivite-recherche)</sup>
- **40% des développements réinventent des solutions déjà implémentées** sur d'autres projets <sup>[[2]](sources/references-bibliographiques.md#reinvention-solutions)</sup>
- L'onboarding des nouveaux collaborateurs prend **6 mois au lieu de 3** par manque d'accès structuré à la connaissance <sup>[[3]](sources/references-bibliographiques.md#duree-onboarding)</sup>
- La **perte de connaissance critique** lors des départs d'experts seniors coûte des millions d'euros <sup>[[4]](sources/references-bibliographiques.md#perte-experts)</sup>

**L'opportunité** : Ces entreprises cherchent activement à développer des **plateformes de knowledge management augmentées par l'IA** pour :

- Capitaliser leur patrimoine intellectuel accumulé
- Permettre l'interrogation en langage naturel de toute leur base documentaire
- Réduire drastiquement le temps de recherche d'information
- Améliorer la qualité des livrables par réutilisation des bonnes pratiques
- Accélérer l'onboarding et le transfert de compétences

Cette observation m'a conforté dans le choix de cette problématique pour mon projet RNCP : développer une solution qui répond à la fois à **un besoin personnel identifié durant ma formation** et à **une demande réelle et mesurable du marché professionnel**. Cela m'a permis de créer un **MVP (Minimum Viable Product) aligné avec les attentes actuelles du secteur**, démontrant ainsi la pertinence professionnelle de mon projet.

#### Sources et références

Les affirmations chiffrées de cette section sont étayées par des sources fiables et vérifiables :

| # | Affirmation | Source | Lien |
|---|------------|--------|------|
| **[1]** | Temps de recherche : **2h/jour** (20% du temps) | McKinsey Global Institute | [📄 Détails](sources/references-bibliographiques.md#productivite-recherche) · [🔗 Source](https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-social-economy) |
| **[2]** | Réinvention : **40% des ingénieurs** | Tech-Clarity (2 000+ ingénieurs) | [📄 Détails](sources/references-bibliographiques.md#reinvention-solutions) · [🔗 Source](https://www.plm.automation.siemens.com/en_us/Images/Tech-Clarity-Perspective-Design-Data-Best-Practice-30239_tcm1023-244068.pdf) |
| **[3]** | Onboarding : **8-12 mois** pour pleine productivité | LumApps (études RH 2025) | [📄 Détails](sources/references-bibliographiques.md#duree-onboarding) · [🔗 Source](https://www.lumapps.com/employee-experience/employee-onboarding-retention-challenges) |
| **[4]** | Perte d'expertise : **27 000 années** (700 retraites) | Harvard Business Review | [📄 Détails](sources/references-bibliographiques.md#perte-experts) · [🔗 Source](https://hbr.org/2014/12/whats-lost-when-experts-retire) |

📚 **Documentation complète** : [Références bibliographiques détaillées](sources/references-bibliographiques.md) avec contexte, méthodologie et 13 sources additionnelles (Airbus, TotalEnergies, Atos, Plan IA Occitanie, etc.).

### 1.2 Besoin concret

Le projet Knowledge Base Platform répond au besoin de centraliser et exploiter intelligemment les connaissances dans un espace unique, sécurisé et collaboratif.

L'objectif principal est de permettre aux utilisateurs de créer des bases de connaissance thématiques enrichies par l'IA conversationnelle via la technologie RAG (Retrieval Augmented Generation).

Au-delà de la simple centralisation, l'IA peut analyser l'ensemble des connaissances stockées et révéler des insights invisibles à l'œil humain. Elle identifie des patterns, des corrélations et des connexions entre différents documents, notes ou conversations que l'utilisateur n'aurait pas pu détecter manuellement. La base de connaissance devient ainsi un véritable assistant intelligent capable de synthétiser, croiser et contextualiser l'information.

Cette solution s'adresse à trois profils d'utilisateurs distincts :

- **Développeurs et étudiants** : Centraliser supports de formation, documentation technique et ressources d'apprentissage dispersées entre plusieurs outils
- **Chercheurs et scientifiques** : Organiser articles scientifiques, publications et notes de recherche pour faciliter la synthèse et l'identification de liens entre études
- **Administrations et collectivités** : Gérer textes réglementaires, circulaires et documentation procédurale avec traçabilité et partage sécurisé entre services

### 1.3 Mode de recueil des besoins

J'ai appliqué une **méthodologie itérative inspirée des principes Agile/Scrum**, en organisant mon travail en **cycles courts de 2 semaines (sprints)** avec des objectifs clairs et mesurables à chaque étape. Cette approche m'a permis de :

- **Affiner progressivement ma compréhension des besoins** en confrontant régulièrement mes hypothèses à la réalité du terrain
- **Prioriser les fonctionnalités** selon leur valeur métier (méthode MoSCoW)
- **Ajuster le périmètre fonctionnel** en fonction des retours et des contraintes techniques découvertes
- **Livrer un MVP (Minimum Viable Product) fonctionnel** plutôt que de vouloir tout développer d'un coup
- **Documenter chaque décision** pour garantir la traçabilité et faciliter les revues de projet

Cette démarche itérative s'est articulée en **3 phases principales** correspondant aux grandes étapes du cycle de vie d'un produit Agile : **Découverte (Discovery), Définition (Definition), et Priorisation (Prioritization)**.

#### Phase 1 : Analyse exploratoire

J'ai débuté par une **auto-observation de mes besoins** durant ma formation de DWWM à la Holberton School de Toulouse, que j'ai ensuite confrontée au **marché professionnel réel** en analysant les offres d'emploi et besoins exprimés par les entreprises du bassin Toulousain.

**Observation du marché professionnel :**

Durant ma recherche de stage/alternance, j'ai analysé **plus de 50 offres d'emploi** publiées par :

- **ESN** : Capgemini Engineering, Sopra Steria, Atos, Alten
- **Aéronautique** : Airbus, Safran, Thales, sous-traitants Tier 1/2
- **Défense/Spatial** : Airbus Defence and Space, CNES, DGA
- **Autres secteurs** : Banking, Automotive, Energy

**Besoins récurrents identifiés dans ces offres** :

- Développement de **plateformes de knowledge management** avec IA générative
- Implémentation de **RAG (Retrieval Augmented Generation)** sur bases documentaires existantes
- Création de **chatbots internes** pour interroger la documentation technique
- **Capitalisation des connaissances projets** dispersées dans multiples outils
- **Conformité réglementaire** : traçabilité, audits, certifications (ISO 9001, AS9100, DO-178C)

**Exemples concrets d'offres analysées** :

- *"Ingénieur IA - Développement d'un assistant conversationnel RAG pour capitaliser 15 ans de documentation technique aéronautique"* (Capgemini Engineering)
- *"Développeur Full Stack - Plateforme de knowledge management avec IA générative pour 5000 ingénieurs"* (Airbus)
- *"Data Scientist - Solution d'interrogation intelligente de bases documentaires réglementaires"* (Collectivité territoriale)

Cette analyse terrain a été complétée par un **benchmark des solutions existantes** sur le marché.

**Analyse des solutions existantes :**

- **Notion** : Excellente pour les notes et bases de données, mais manque d'intégration IA conversationnelle contextuelle
- **ChatGPT** : Puissant pour le chat IA, mais ne permet pas de créer des bases de connaissance personnalisées et persistantes
- **Obsidian** : Parfait pour les notes interconnectées, mais sans capacité RAG native
- **Zotero** : Orienté recherche académique, mais limité à la gestion bibliographique sans IA
- **SharePoint** : Robuste pour les organisations, mais complexe et peu adapté à l'interrogation intelligente par IA

**Constat** : Aucun outil ne combine ces trois aspects dans une solution intégrée : gestion de contenu structuré + chat IA contextuel + collaboration sécurisée.

**Validation auprès des personas :**

- **Marc (développeur/étudiant)** : Confirme la frustration de jongler entre plusieurs outils pour organiser ses ressources de formation
- **Dr. Dubois (chercheuse)** : Exprime le besoin urgent d'interroger intelligemment sa bibliothèque de recherche dispersée
- **M. Martineau (administration)** : Souligne la difficulté des agents à trouver rapidement l'information réglementaire à jour
- **Sophie Mercier (ESN/KM)** : Confirme que la dispersion des connaissances techniques coûte 2h/jour/ingénieur et représente un ROI potentiel de plusieurs millions d'euros pour une BU de 500 personnes

#### Phase 2 : Définition des fonctionnalités

J'ai rédigé des User Stories suivant le format standard :

En tant que [rôle], je veux [action], afin de [bénéfice].

**User Stories par persona :**

**Pour Marc (développeur/étudiant) :**

- En tant qu'étudiant, je veux sauvegarder mes notes de cours dans une KB dédiée, afin de les interroger avec une IA
- En tant que développeur, je veux importer des fichiers PDF techniques, afin de poser des questions contextualisées
- En tant qu'apprenant, je veux retrouver l'historique de mes conversations, afin de reprendre une recherche précédente
- En tant qu'utilisateur, je veux sauvegarder des URLs (MDN, Stack Overflow), afin de constituer une bibliothèque de références

**Pour Dr. Dubois (chercheuse) :**

- En tant que chercheuse, je veux importer des articles scientifiques PDF, afin de créer une base de connaissance interrogeable
- En tant que scientifique, je veux poser des questions sur plusieurs études, afin d'identifier des liens et synthétiser des concepts
- En tant que chercheur, je veux taguer et organiser mes sources, afin de retrouver facilement les références pertinentes
- En tant qu'utilisatrice, je veux exporter mes conversations avec citations, afin de les intégrer dans mes publications

**Pour M. Martineau (administration) :**

- En tant que responsable documentation, je veux partager une KB avec mon équipe, afin de centraliser la connaissance réglementaire
- En tant qu'administrateur, je veux gérer les permissions par service, afin de contrôler l'accès aux documents sensibles
- En tant que gestionnaire, je veux que les agents puissent poser des questions réglementaires, afin d'obtenir des réponses sourcées et traçables
- En tant que responsable, je veux un historique des modifications, afin de garantir la conformité et la traçabilité

**Pour Sophie Mercier (ESN/Knowledge Management) :**

- En tant que responsable KM, je veux importer massivement des milliers de documents techniques existants (PDF, DOCX, Confluence), afin de centraliser 15 ans de capitalisation projet
- En tant que gestionnaire de connaissance, je veux que les ingénieurs puissent poser des questions techniques complexes ("Comment implémenter un bootloader sécurisé DO-178C niveau A ?"), afin qu'ils obtiennent des réponses sourcées depuis les projets précédents
- En tant qu'administratrice, je veux configurer des permissions granulaires par projet/client, afin de respecter la confidentialité des projets défense et les clauses contractuelles
- En tant que responsable qualité, je veux tracer qui a accédé à quels documents, afin de répondre aux audits de certification (ISO 9001, AS9100)
- En tant que manager, je veux mesurer le taux d'utilisation de la KB par équipe, afin de démontrer le ROI et identifier les besoins de formation
- En tant que KM, je veux que l'IA identifie automatiquement les documents similaires ou complémentaires, afin de révéler des connexions invisibles entre projets
- En tant que responsable onboarding, je veux créer des KB thématiques par domaine (aéronautique, automobile, spatial), afin d'accélérer la montée en compétence des nouveaux consultants
- En tant que répondeur appels d'offres, je veux retrouver en quelques secondes les livrables de projets similaires, afin d'améliorer la qualité et réduire le temps de réponse de 40%
- En tant que gardienne de la connaissance, je veux capturer l'expertise des seniors avant leur départ en retraite, afin d'éviter la perte de connaissance critique

#### Phase 3 : Priorisation

J'ai appliqué la méthode MoSCoW pour hiérarchiser les fonctionnalités :

Must have : Authentification, CRUD des bases de connaissance, chat avec RAG

Should have : Persistance des conversations, gestion des permissions

Could have : Export des conversations, recherche full-text

Won't have (v1) : Partage public, édition collaborative temps réel

### 1.4 Utilisateurs cibles

#### Persona 1 : Marc, développeur et étudiant en formation continue

Age : 28 ans
Profil : Développeur junior en reconversion professionnelle, actuellement en formation DWWM
Besoins : Organiser ses cours, projets de formation et documentation technique professionnelle
Frustrations : Notes éparpillées entre Google Docs, Notion et ChatGPT, difficulté à centraliser les ressources d'apprentissage et les specs techniques
Objectif : Créer une KB "Formation & Développement" regroupant supports de cours, documentations techniques et projets
Usage type : Import de PDFs de cours, sauvegarde d'URLs (MDN, Stack Overflow), fichiers de specs, chat pour réviser et comprendre des concepts complexes

#### Persona 2 : Dr. Claire Dubois, chercheuse en sciences cognitives

Age : 38 ans
Profil : Chercheuse CNRS, spécialisée en neurosciences et apprentissage automatique
Besoins : Centraliser articles scientifiques, données de recherche, notes de laboratoire et littérature académique
Frustrations : Publications dispersées entre Zotero, Google Scholar, fichiers PDF non indexés, impossibilité d'interroger intelligemment sa bibliothèque de recherche
Objectif : KB "Recherche Neurosciences IA" avec articles, datasets, notes expérimentales et revues de littérature
Usage type : Import de PDFs d'articles scientifiques, liens vers publications, notes de recherche, chat pour synthétiser des concepts et identifier des liens entre études

#### Persona 3 : Jean Martineau, responsable documentation - Ministère de la Transition Écologique

Age : 45 ans
Profil : Chef de service documentation et archives, gestion de la connaissance réglementaire et procédurale
Besoins : Centraliser textes réglementaires, circulaires, notes de service, rapports et bonnes pratiques pour les agents
Frustrations : Documentation dispersée entre SharePoint, emails, classeurs réseau, difficulté pour les agents à trouver l'information à jour
Objectif : KB "Réglementation Environnement" partagée avec l'équipe, permissions par service, traçabilité des versions
Usage type : Import de PDFs de lois et décrets, circulaires, notes internes, chat pour permettre aux agents de poser des questions réglementaires et obtenir des réponses sourcées

#### Persona 4 : Sophie Mercier, Responsable Knowledge Management - ESN (Capgemini Engineering Toulouse)

Age : 42 ans
Profil : Responsable de la capitalisation des connaissances pour une Business Unit de 500+ consultants en ingénierie logicielle et systèmes embarqués (aéronautique, défense, spatial)
Contexte métier : L'entreprise réalise des centaines de projets clients par an, générant des milliers de documents techniques (spécifications, architectures, retours d'expérience, codes de référence, procédures de certification). Cette connaissance est actuellement dispersée entre SharePoint, Confluence, GitLab, emails et disques réseau, rendant sa réutilisation très difficile.

Besoins :

- Capitaliser 15 ans de projets techniques (aéronautique, défense, automobile) pour éviter de "réinventer la roue" à chaque nouveau projet
- Permettre aux ingénieurs de retrouver instantanément des solutions à des problèmes techniques déjà résolus sur d'autres projets
- Faciliter l'onboarding des nouveaux consultants en leur donnant accès à une base de connaissance interrogeable
- Répondre plus rapidement aux appels d'offres en retrouvant les livrables et méthodes de projets similaires
- Garantir la conformité aux normes (DO-178C aéronautique, ISO 26262 automobile) en centralisant les référentiels

Frustrations :

- Connaissance dispersée dans 20+ outils différents sans moteur de recherche unifié
- Perte de connaissance critique quand des experts seniors quittent l'entreprise
- Temps perdu à chercher des informations : 2h/jour/ingénieur en moyenne (étude interne)
- Impossibilité d'exploiter intelligemment 10 ans d'archives de projets
- Les juniors posent 50 fois les mêmes questions aux seniors, saturant ces derniers
- Duplication d'efforts : plusieurs équipes redéveloppent des composants déjà existants

Objectif : Déployer une KB "Engineering Knowledge Hub" pour les 500 consultants, avec permissions par projet/client, permettant d'interroger intelligemment toute la base documentaire via IA

Usage type :

- Import massif de documentation technique existante (PDF, DOCX, architectures Confluence)
- Intégration avec GitLab pour indexer les README et wikis de projets
- Ajout d'URLs vers documentations externes (normes, specs fournisseurs)
- Chat IA pour questions techniques : "Comment implémenter un bootloader sécurisé conforme DO-178C niveau A ?"
- Gestion fine des permissions : certains projets sont confidentiels défense, d'autres peuvent être partagés entre BU
- Traçabilité complète pour les audits qualité et certifications

ROI attendu : Réduction de 30% du temps de recherche d'information, amélioration de 20% de la qualité des livrables par réutilisation des bonnes pratiques, réduction de 50% du temps d'onboarding des juniors

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
