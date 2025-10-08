> 📍 **Navigation** : [🏠 Sommaire](../travail_entretien_preparatoire_rncp_5.md) | [➡️ Section 2 : Planning](02-planning-organisation.md)

# Section 1 : Analyse et formalisation du besoin

## 📑 Table des matières

<details>
<summary><strong>1.1 Problématique identifiée</strong></summary>

- [1.1 Problématique identifiée](#11-problématique-identifiée)
  - [Validation par le marché professionnel](#validation-par-le-marché-professionnel)

</details>

<details>
<summary><strong>1.2 Utilisateurs cibles</strong></summary>

- [1.2 Utilisateurs cibles](#12-utilisateurs-cibles)
  - [Persona 1 : Marc, développeur en reconversion (28 ans)](#persona-1--marc-développeur-en-reconversion-28-ans)
  - [Persona 2 : Dr. Claire Dubois, chercheuse CNRS (38 ans)](#persona-2--dr-claire-dubois-chercheuse-cnrs-38-ans)
  - [Persona 3 : Jean Martineau, responsable documentation publique (45 ans)](#persona-3--jean-martineau-responsable-documentation-publique-45-ans)
  - [Persona 4 : Sophie Mercier, Responsable Knowledge Management ESN (42 ans)](#persona-4--sophie-mercier-responsable-knowledge-management-esn-42-ans)

</details>

<details>
<summary><strong>1.3 Besoin concret et solution proposée</strong></summary>

- [1.3 Besoin concret et solution proposée](#13-besoin-concret-et-solution-proposée)
  - [Objectif du projet](#objectif-du-projet)
  - [Valeur ajoutée de l'IA](#valeur-ajoutée-de-lia)
  - [Différenciation par rapport aux solutions existantes](#différenciation-par-rapport-aux-solutions-existantes)

</details>

<details>
<summary><strong>1.4 Mode de recueil des besoins</strong></summary>

- [1.4 Mode de recueil des besoins](#14-mode-de-recueil-des-besoins)
  - [Démarche Agile adoptée](#démarche-agile-adoptée)
  - [Phase 1 : Analyse exploratoire](#phase-1--analyse-exploratoire)
    - [Observation du marché professionnel](#observation-du-marché-professionnel)
    - [Validation auprès des personas](#validation-auprès-des-personas)
  - [Phase 2 : Définition des fonctionnalités](#phase-2--définition-des-fonctionnalités)
    - [User Stories essentielles (condensées)](#user-stories-essentielles-condensées)
  - [Phase 3 : Priorisation MoSCoW](#phase-3--priorisation-moscow)

</details>

<details>
<summary><strong>1.5 Cahier des charges fonctionnel</strong></summary>

- [Exigences fonctionnelles principales](#exigences-fonctionnelles-principales)
- [Exigences non-fonctionnelles](#exigences-non-fonctionnelles)
- [Documentation de référence](#documentation-de-référence)

</details>

---

## 1.1 Problématique identifiée

Dans le cadre de ma formation DWWM à la Holberton School de Toulouse, j'ai constaté une problématique récurrente dans les environnements professionnels et académiques : **la gestion fragmentée de la connaissance**.

Les utilisateurs jonglent quotidiennement entre plusieurs outils pour stocker des notes (Notion, Google Docs), gérer des fichiers (Google Drive, Dropbox), sauvegarder des liens (Pocket, bookmarks navigateur) et interagir avec des IA conversationnelles (ChatGPT, Claude).

Cette dispersion entraîne une **perte de temps** dans la recherche d'information, une **duplication des données**, et une difficulté à **exploiter intelligemment les connaissances accumulées**.

### Validation par le marché professionnel

Lors de ma recherche de stage et d'alternance dans le bassin toulousain, j'ai observé que cette problématique correspondait à **un besoin réel et urgent du monde de l'entreprise**.

De nombreuses **ESN** (Capgemini, Sopra Steria, Atos) et **sous-traitants de l'aéronautique** (Airbus, Thales, Safran) publiaient des offres d'emploi concernant le développement d'**applications IA générative utilisant le RAG (Retrieval Augmented Generation)**.

**Constat terrain** : Ces entreprises possèdent des **volumes massifs de données techniques** accumulées sur 10-20 ans (documentation projets, bases de connaissances, code source, expertise non capitalisée). Ces connaissances sont **dispersées dans 15-20 outils différents** et **sous-exploitées**.

Les études de marché démontrent l'urgence du besoin :

- **2h/jour** perdues à chercher de l'information <sup>[[1]](../sources/references-bibliographiques.md#productivite-recherche)</sup>
- **40% des développements** réinventent des solutions existantes <sup>[[2]](../sources/references-bibliographiques.md#reinvention-solutions)</sup>
- **8-12 mois d'onboarding** au lieu de 3-6 mois <sup>[[3]](../sources/references-bibliographiques.md#duree-onboarding)</sup>
- **27 000 années d'expérience** perdues lors des départs <sup>[[4]](../sources/references-bibliographiques.md#perte-experts)</sup>

**L'opportunité** : Ces entreprises cherchent activement des **plateformes de knowledge management augmentées par l'IA** pour capitaliser leur patrimoine intellectuel, interroger en langage naturel leur base documentaire et réduire drastiquement le temps de recherche.

**Alignement avec le marché** : Mon projet RNCP répond à un **besoin personnel** (formation) et à une **demande réelle du secteur**, démontrant sa pertinence professionnelle.

> 📚 **Sources détaillées** : [Références bibliographiques complètes](../sources/references-bibliographiques.md) (13 sources : McKinsey, Harvard Business Review, Tech-Clarity, Airbus, TotalEnergies, Atos, Plan IA Occitanie)

---

## 1.2 Utilisateurs cibles

La solution s'adresse à **quatre profils** représentatifs du marché :

### Persona 1 : Marc, développeur en reconversion (28 ans)

**Contexte** : Développeur junior en formation DWWM à Holberton School

**Besoins** :

- Centraliser supports de cours, documentation technique et projets de formation
- Interroger intelligemment ses ressources d'apprentissage via IA

**Frustrations** :

- Notes éparpillées entre Google Docs, Notion et ChatGPT
- Difficulté à retrouver les concepts vus en cours
- Perte de temps à chercher dans plusieurs outils

**Objectif KB** : "Formation & Développement" avec PDFs de cours, URLs (MDN, Stack Overflow), notes de révision

**Usage type** : Import de fichiers techniques, chat pour réviser et comprendre des concepts complexes

---

### Persona 2 : Dr. Claire Dubois, chercheuse CNRS (38 ans)

**Contexte** : Chercheuse en neurosciences et apprentissage automatique

**Besoins** :

- Centraliser articles scientifiques, données de recherche et littérature académique
- Identifier des liens entre études et synthétiser des concepts

**Frustrations** :

- Publications dispersées entre Zotero, Google Scholar et fichiers PDF
- Impossibilité d'interroger intelligemment sa bibliothèque de 500+ articles
- Difficulté à faire des synthèses transversales

**Objectif KB** : "Recherche Neurosciences IA" avec articles, datasets, notes expérimentales

**Usage type** : Import de PDFs scientifiques, chat pour synthétiser et identifier des corrélations

---

### Persona 3 : Jean Martineau, responsable documentation publique (45 ans)

**Contexte** : Chef de service documentation - Ministère de la Transition Écologique

**Besoins** :

- Centraliser textes réglementaires, circulaires et procédures pour 50+ agents
- Permettre aux agents de trouver rapidement l'information à jour
- Garantir traçabilité et conformité

**Frustrations** :

- Documentation dispersée entre SharePoint, emails et classeurs réseau
- Agents perdent du temps à chercher les textes applicables
- Risque de non-conformité si les agents utilisent de vieilles versions

**Objectif KB** : "Réglementation Environnement" avec permissions par service

**Usage type** : Import de PDFs de lois/décrets, chat pour questions réglementaires avec réponses sourcées

---

### Persona 4 : Sophie Mercier, Responsable Knowledge Management ESN (42 ans)

**Contexte** : Capgemini Engineering Toulouse - Business Unit de 500+ consultants en ingénierie embarquée (aéronautique, défense, spatial)

**Besoins critiques** :

- Capitaliser 15 ans de projets techniques pour éviter la réinvention
- Permettre aux ingénieurs de retrouver instantanément des solutions existantes
- Faciliter l'onboarding des nouveaux consultants (actuellement 8-12 mois)
- Répondre plus vite aux appels d'offres en retrouvant les livrables similaires
- Garantir conformité normes (DO-178C, ISO 26262)

**Frustrations majeures** :

- Connaissance dispersée dans 20+ outils sans moteur de recherche unifié
- **2h/jour/ingénieur** perdues à chercher l'information (étude interne)
- Perte de connaissance critique lors des départs (700 experts seniors attendus en retraite)
- Les juniors saturent les seniors avec des questions répétitives
- Plusieurs équipes redéveloppent les mêmes composants

**Objectif KB** : "Engineering Knowledge Hub" avec permissions granulaires par projet/client

**Usage type** :

- Import massif de documentation (PDF, DOCX, Confluence, GitLab wikis)
- Chat IA pour questions techniques : *"Comment implémenter un bootloader sécurisé DO-178C niveau A ?"*
- Gestion fine des permissions (projets défense confidentiels)
- Traçabilité complète pour audits qualité (ISO 9001, AS9100)

**ROI attendu** : -30% temps de recherche, +20% qualité livrables, -50% temps onboarding

---

## 1.3 Besoin concret et solution proposée

Fort de cette analyse terrain auprès de quatre profils utilisateurs distincts, j'ai pu définir précisément le besoin à adresser et la solution à développer.

### Objectif du projet

Le projet **Knowledge Base Platform** (plateforme de base de connaissances) centralise et exploite intelligemment les connaissances dans un espace unique, sécurisé et collaboratif.

**Proposition de valeur** : Permettre aux utilisateurs de créer des bases de connaissance thématiques enrichies par l'IA conversationnelle via la technologie **RAG (Retrieval Augmented Generation)**.

### Valeur ajoutée de l'IA

Au-delà de la simple centralisation, l'IA :

- **Analyse** l'ensemble des connaissances stockées
- **Révèle** des insights invisibles à l'œil humain
- **Identifie** des patterns, corrélations et connexions entre documents
- **Synthétise** et contextualise l'information de manière intelligente

La base de connaissance devient un **assistant intelligent** capable de comprendre et d'exploiter le contenu.

### Différenciation par rapport aux solutions existantes

**Benchmark marché** :

| Solution | Points forts | Limitations |
|----------|--------------|-------------|
| **Notion** | Notes et bases de données | Pas d'IA conversationnelle contextuelle |
| **ChatGPT** | Chat IA puissant | Pas de KB personnalisées persistantes |
| **Obsidian** | Notes interconnectées | Pas de capacité RAG native |
| **Zotero** | Gestion bibliographique | Limité à la recherche académique, sans IA |
| **SharePoint** | Robuste pour organisations | Complexe, peu adapté à l'interrogation IA |

**Constat** : Aucun outil ne combine **gestion de contenu structuré** + **chat IA contextuel** + **collaboration sécurisée** dans une solution intégrée.

**Notre réponse** : Knowledge Base Platform unifie ces trois aspects.

---

## 1.4 Mode de recueil des besoins

J'ai appliqué une **méthodologie itérative inspirée des principes Agile/Scrum**, organisée en **sprints de 2 semaines** avec objectifs mesurables.

### Démarche Agile adoptée

Cette approche m'a permis de :

- ✅ Affiner progressivement ma compréhension des besoins terrain
- ✅ Prioriser les fonctionnalités selon leur valeur métier (MoSCoW)
- ✅ Ajuster le périmètre fonctionnel selon les contraintes techniques
- ✅ Livrer un **MVP fonctionnel** plutôt que tout développer d'un coup
- ✅ Documenter chaque décision pour la traçabilité

La démarche s'articule en **3 phases** : **Découverte**, **Définition** et **Priorisation**.

---

### Phase 1 : Analyse exploratoire

J'ai débuté par une **auto-observation de mes besoins** durant ma formation de DWWM à la Holberton School de Toulouse. J'ai ensuite confronté cette analyse au **marché professionnel réel** en étudiant les offres d'emploi et les besoins exprimés par les entreprises du bassin toulousain.

#### Observation du marché professionnel

Durant ma recherche de stage/alternance, j'ai analysé **50+ offres d'emploi** :

**Entreprises étudiées** :

- **ESN** : Capgemini Engineering, Sopra Steria, Atos, Alten
- **Aéronautique** : Airbus, Safran, Thales, sous-traitants Tier 1/2
- **Défense/Spatial** : Airbus Defence & Space, CNES, DGA
- **Autres** : Banking, Automotive, Energy

**Besoins récurrents identifiés** :

- Plateformes de **knowledge management** avec IA générative
- Implémentation de **RAG** sur bases documentaires existantes
- Chatbots internes pour interrogation technique
- Capitalisation des connaissances projets dispersées
- Conformité réglementaire (ISO 9001, AS9100, DO-178C)

**Exemples d'offres concrètes** :

- *"Ingénieur IA - Assistant conversationnel RAG pour 15 ans de documentation aéronautique"* (Capgemini Engineering)
- *"Développeur Full Stack - Plateforme knowledge management IA pour 5000 ingénieurs"* (Airbus)
- *"Data Scientist - Interrogation intelligente de bases documentaires réglementaires"* (Collectivité territoriale)

#### Validation auprès des personas

- **Marc** : Confirme la frustration du multi-outil pour organiser ses cours
- **Dr. Dubois** : Besoin urgent d'interroger intelligemment 500+ articles dispersés
- **M. Martineau** : Difficulté des agents à trouver l'information réglementaire à jour
- **Sophie Mercier** : Dispersion = **2h/jour/ingénieur perdues**, ROI potentiel de plusieurs millions d'€ pour 500 personnes

---

### Phase 2 : Définition des fonctionnalités

J'ai rédigé des **User Stories** au format : *"En tant que [rôle], je veux [action], afin de [bénéfice]"*

#### User Stories essentielles (condensées)

**Marc (développeur/étudiant)** :

- Sauvegarder mes notes de cours dans une KB dédiée pour les interroger avec l'IA
- Importer des PDFs techniques pour poser des questions contextualisées
- Retrouver l'historique de mes conversations pour reprendre mes recherches

**Dr. Dubois (chercheuse)** :

- Importer des articles scientifiques PDF pour créer une base interrogeable
- Poser des questions sur plusieurs études pour identifier des liens et synthétiser
- Exporter mes conversations avec citations pour mes publications

**M. Martineau (administration)** :

- Partager une KB avec mon équipe pour centraliser la réglementation
- Gérer les permissions par service pour contrôler l'accès aux documents sensibles
- Permettre aux agents de poser des questions réglementaires avec réponses sourcées

**Sophie Mercier (ESN/KM)** :

- Importer massivement des milliers de documents techniques (PDF, DOCX, Confluence)
- Permettre aux ingénieurs de poser des questions techniques complexes avec réponses sourcées depuis les projets précédents
- Configurer des permissions granulaires par projet/client pour respecter la confidentialité défense
- Tracer les accès documentaires pour répondre aux audits de certification
- Mesurer le taux d'utilisation pour démontrer le ROI

---

### Phase 3 : Priorisation MoSCoW

J'ai hiérarchisé les fonctionnalités selon la méthode **MoSCoW** :

| Priorité | Fonctionnalités | Justification |
|----------|----------------|---------------|
| **Must have** | Authentification, CRUD KB, Chat avec RAG | Cœur du MVP, valeur métier critique |
| **Should have** | Persistance conversations, Gestion permissions | Important pour l'usage professionnel |
| **Could have** | Export conversations, Recherche full-text | Améliore l'UX mais non bloquant |
| **Won't have (v1)** | Partage public, Édition collaborative temps réel | Complexité vs. valeur différée en v2 |

Cette priorisation a guidé l'ordre des sprints de développement (voir [Section 2 : Planning](02-planning-organisation.md)).

---

## 1.5 Cahier des charges fonctionnel

### Exigences fonctionnelles principales

#### 1. Gestion des utilisateurs

- ✅ Inscription/Connexion sécurisée (email + mot de passe)
- ✅ Profil utilisateur modifiable
- ✅ Gestion de session persistante
- ✅ Reset de mot de passe

#### 2. Gestion des bases de connaissance

- ✅ Création de KB avec nom et description
- ✅ Liste des KB accessibles (propriétaire + partagées)
- ✅ Modification/Suppression (propriétaire uniquement)
- ✅ Partage avec permissions (Admin, Editor, Viewer)

#### 3. Gestion du contenu

- ✅ **Notes** : Création en Markdown, édition, suppression, recherche
- ✅ **Fichiers** : Upload (PDF, DOCX, TXT), extraction texte (Apache Tika), prévisualisation
- ✅ **URLs** : Ajout, crawling automatique (SearxNG), extraction métadonnées

#### 4. Chat IA avec RAG

- ✅ Interface de chat en temps réel
- ✅ RAG : récupération passages pertinents (ChromaDB)
- ✅ Génération réponses contextuelles (Ollama)
- ✅ Streaming des réponses (Server-Sent Events)
- ✅ Affichage des sources utilisées

#### 5. Persistance des conversations

- ✅ Sauvegarde automatique des conversations
- ✅ Historique avec messages et métadonnées
- ✅ Renommage/Suppression de conversations
- ✅ Reprise de conversation avec contexte

#### 6. Permissions et sécurité

- ✅ Système de rôles (Admin, Editor, Viewer)
- ✅ Vérification des permissions à chaque requête
- ✅ Isolation des données par utilisateur/KB
- ✅ Traçabilité des accès (logs)

#### 7. Internationalisation

- ✅ Support français/anglais (next-intl)
- ✅ Détection automatique de la langue
- ✅ Changement de langue persisté

### Exigences non-fonctionnelles

#### Performance

- Temps de réponse API < 200ms (hors IA)
- Streaming IA : premiers tokens < 2s
- Upload fichiers : support jusqu'à 50MB
- Recherche vectorielle : < 500ms pour 10 000 documents

#### Sécurité

- Mots de passe hashés (bcrypt, 12 rounds)
- Sessions JWT avec renouvellement automatique
- Protection CSRF, XSS, injections SQL
- HTTPS en production
- Headers de sécurité (CSP, X-Frame-Options, etc.)

#### Scalabilité

- Architecture microservices (Docker Compose)
- Base vectorielle optimisée (ChromaDB)
- Possibilité de scaling horizontal (PostgreSQL, ChromaDB)

#### Accessibilité

- Conformité WCAG 2.1 niveau AA
- Navigation clavier complète
- Support lecteurs d'écran (ARIA)
- Contrastes suffisants (ratio 4.5:1 min)

#### Compatibilité

- Responsive : mobile, tablette, desktop
- Navigateurs : Chrome, Firefox, Safari, Edge (2 dernières versions)
- Support dark mode

### Documentation de référence

La documentation technique complète est disponible dans le dossier `docs/` :

| Document | Description | Lien |
|----------|-------------|------|
| **README.md** | Présentation générale du projet | [Voir](../../README.md) |
| **FEATURES.md** | État détaillé des fonctionnalités | [Voir](../../docs/FEATURES.md) |
| **chat-persistence-plan.md** | Roadmap technique du chat | [Voir](../../docs/chat-persistence-plan.md) |
| **API Reference** | Documentation API REST | [Voir](../../docs/api/README.md) |
| **QA Checklist** | Tests d'autorisation et sécurité | [Voir](../../docs/qa/authz-qa-checklist.md) |
| **Références bibliographiques** | Sources et validation marché | [Voir](../sources/references-bibliographiques.md) |

---

> 📍 **Navigation** : [🏠 Sommaire](../travail_entretien_preparatoire_rncp_5.md) | [➡️ Section 2 : Planning](02-planning-organisation.md)
