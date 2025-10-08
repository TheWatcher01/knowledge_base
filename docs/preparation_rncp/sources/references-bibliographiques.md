# Références bibliographiques - Validation du besoin marché

> 📄 **Document source** : `Recherche de sources fiables.pdf`  
> 📅 **Date de compilation** : Octobre 2025  
> 🎯 **Objectif** : Étayer les affirmations chiffrées de la Section 1 du dossier RNCP 5  
> 🔙 **Retour au document principal** : [Entretien Préparatoire RNCP 5](../travail_Entretien%20Préparatoire%20RNCP%205.md)

---

## Table des matières

- [Références bibliographiques - Validation du besoin marché](#références-bibliographiques---validation-du-besoin-marché)
  - [Table des matières](#table-des-matières)
  - [Contexte et besoin exprimé par les entreprises](#contexte-et-besoin-exprimé-par-les-entreprises)
    - [Ingénieurs cherchant longtemps une information et réinventant l'existant](#ingénieurs-cherchant-longtemps-une-information-et-réinventant-lexistant)
      - [📊 Productivité et recherche d'information](#-productivité-et-recherche-dinformation)
      - [🔄 Impact d'une mauvaise gestion des données techniques](#-impact-dune-mauvaise-gestion-des-données-techniques)
      - [👴 Pertes lors des départs d'experts](#-pertes-lors-des-départs-dexperts)
    - [Durée d'intégration des nouveaux collaborateurs](#durée-dintégration-des-nouveaux-collaborateurs)
      - [⏱️ Onboarding des nouveaux collaborateurs](#️-onboarding-des-nouveaux-collaborateurs)
  - [Exemples d'adoption du RAG et de l'IA générative](#exemples-dadoption-du-rag-et-de-lia-générative)
    - [Aéronautique et spatial en Occitanie](#aéronautique-et-spatial-en-occitanie)
      - [✈️ Usage du RAG dans l'aéronautique](#️-usage-du-rag-dans-laéronautique)
      - [🌍 Plan IA de l'Occitanie](#-plan-ia-de-loccitanie)
      - [🛩️ Initiatives d'Airbus](#️-initiatives-dairbus)
    - [Énergie et industrie](#énergie-et-industrie)
      - [⚡ TotalEnergies et moteur de recherche augmenté](#-totalenergies-et-moteur-de-recherche-augmenté)
      - [💼 Atos et demande de compétences RAG](#-atos-et-demande-de-compétences-rag)
      - [📈 Marché de l'IA générative](#-marché-de-lia-générative)
  - [Synthèse : alignement entre la problématique et les besoins du marché](#synthèse--alignement-entre-la-problématique-et-les-besoins-du-marché)
    - [🎯 Points clés démontrés par les sources](#-points-clés-démontrés-par-les-sources)
    - [💡 Opportunités identifiées](#-opportunités-identifiées)
  - [Conclusion](#conclusion)
    - [Bénéfices attendus d'une solution RAG](#bénéfices-attendus-dune-solution-rag)
  - [Bibliographie](#bibliographie)

---

## Contexte et besoin exprimé par les entreprises

### Ingénieurs cherchant longtemps une information et réinventant l'existant

#### <a name="productivite-recherche"></a>📊 Productivité et recherche d'information

**Affirmation** : Les ingénieurs passent **2h/jour à chercher de l'information** existante

**Source** : McKinsey Global Institute

Selon le McKinsey Global Institute, les travailleurs du savoir consacrent près de **20 % de leur temps** (environ **1,8 h par jour**) à rechercher des informations internes (courriels, documents, contacts).

Une meilleure gestion et un accès centralisé aux connaissances pourraient **réduire d'environ 35 % ce temps de recherche** [[1]](#ref-1).

---

#### <a name="reinvention-solutions"></a>🔄 Impact d'une mauvaise gestion des données techniques

**Affirmation** : **40% des développements réinventent des solutions déjà implémentées** sur d'autres projets

**Source** : Tech-Clarity (enquête sur plus de 2 000 ingénieurs)

Un rapport de Tech-Clarity constate que **40 % des répondants ont du mal à retrouver des données techniques ou de conception**. Cette difficulté entraîne :

- La **perte ou la duplication de documents**
- L'obligation pour les équipes de **ré-créer des fichiers**
- Des **semaines de retard** et des **coûts supplémentaires** [[2]](#ref-2)

Le même rapport indique que **plus d'un quart des entreprises perdent au moins 20 % du temps de leurs ingénieurs** dans des tâches de gestion de données sans valeur ajoutée. La mauvaise gestion des connaissances force souvent les équipes à **« réinventer la roue »** [[3]](#ref-3).

---

#### <a name="perte-experts"></a>👴 Pertes lors des départs d'experts

**Affirmation** : La **perte de connaissance critique** lors des départs d'experts seniors coûte des millions d'euros

**Source** : Harvard Business Review

La revue Harvard Business Review rappelle qu'avec la vague de départs à la retraite des baby-boomers, certaines organisations ont calculé que **la retraite de 700 experts entraînerait la perte de plus de 27 000 années d'expérience cumulée** [[4]](#ref-4).

Cette perte de savoir tacite montre l'importance de **capter et de diffuser la connaissance interne avant qu'elle ne disparaisse**.

---

### Durée d'intégration des nouveaux collaborateurs

#### <a name="duree-onboarding"></a>⏱️ Onboarding des nouveaux collaborateurs

**Affirmation** : L'onboarding des nouveaux collaborateurs prend **6 mois au lieu de 3** par manque d'accès structuré à la connaissance

**Source** : LumApps (2025) - études RH

Des articles RH soulignent que l'onboarding dure souvent **plusieurs mois**. Le blog de la plateforme LumApps (2025) cite des études indiquant que :

- Des collaborateurs atteignent leur **pleine productivité après 8 à 12 mois**
- **La moitié des employés se sentent sous-formés** [[5]](#ref-5)

Ces chiffres, bien que relayés par un fournisseur, montrent que la montée en compétences des nouveaux arrivants est longue lorsque l'information est éparpillée.

---

## Exemples d'adoption du RAG et de l'IA générative

### Aéronautique et spatial en Occitanie

#### <a name="rag-aeronautique"></a>✈️ Usage du RAG dans l'aéronautique

**Source** : La Tribune (Sopra Steria Next)

La Tribune note que les entreprises de l'aéronautique et du spatial (par ex. **Sopra Steria Next**) expérimentent des architectures **Retrieval Augmented Generation (RAG)** et **graphRAG** pour tirer parti de volumes massifs de données hétérogènes (schémas 2D/3D, images, textes, IoT).

Les solutions RAG permettent de :

- Traiter plus rapidement des demandes techniques
- Répondre aux clients
- Produire des synthèses fiables

**Condition** : Respecter la confidentialité et impliquer des superviseurs humains [[6]](#ref-6).

---

#### <a name="plan-ia-occitanie"></a>🌍 Plan IA de l'Occitanie

**Source** : Région Occitanie (2024)

En 2024, la Région Occitanie a adopté un **plan IA de 60 millions d'euros** afin de structurer une filière régionale autour d'une IA responsable. Ce plan :

- Soutient **250 entreprises spécialisées en IA** employant **3 500 personnes**
- Finance des projets R&D
- Crée un cluster **« IA Occitanie »**
- Finance des programmes de formation pour **plus de 6 000 étudiants** à Toulouse et Montpellier [[7]](#ref-7)

**Secteurs ciblés** : aéronautique, défense et spatial

Ce contexte régional est **favorable au développement de solutions d'IA générative et de gestion des connaissances**.

---

#### <a name="airbus-ia"></a>🛩️ Initiatives d'Airbus

**Source** : Airbus (2024)

Dans un article de 2024, **Airbus** explique qu'une cellule interne a recensé **600 cas d'usage de l'IA générative** et que la technologie améliore l'efficacité et la qualité des opérations.

**Exemple concret** : Un assistant d'IA répond aux ouvriers qui se demandent quel outil utiliser, au lieu de consulter des instructions volumineuses [[8]](#ref-8).

Airbus mentionne l'importance de la conformité réglementaire mais observe des **gains de temps et de qualité** grâce aux assistants de recherche documentaire.

---

### Énergie et industrie

#### <a name="totalenergies-jafar"></a>⚡ TotalEnergies et moteur de recherche augmenté

**Source** : La Revue du Digital (2024)

La Revue du Digital rapporte que **TotalEnergies** a développé un assistant interne appelé **Jafar**, combinant :

- Le moteur de recherche **Sinequa**
- Une **IA générative RAG**

**Aude Giraudel** (responsable des moteurs de recherche intelligents) explique que cette solution :

- Fournit des **réponses synthétiques avec liens vers les sources**
- **Gagne du temps** tout en maintenant la **confiance des utilisateurs** [[9]](#ref-9)

L'entreprise gère des données très techniques et non structurées (textes, tableaux, images). La solution RAG permet de retrouver des informations qui auraient échappé à des recherches classiques [[10]](#ref-10).

---

#### <a name="atos-rag"></a>💼 Atos et demande de compétences RAG

**Source** : Atos / HelloWork (2025)

Dans une interview donnée en 2025 au média de l'emploi **HelloWork**, la directrice de l'unité **GenAI du groupe Atos** décrit la **gestion de la connaissance comme l'une des applications les plus matures de l'IA générative**.

Elle souligne que l'IA générative sert à :

- Rédiger des spécifications et de la documentation
- Maîtriser des technologies comme la **Retrieval Augmented Generation (RAG)** pour intégrer et exploiter les données internes [[11]](#ref-11)

**Atos recrute** ainsi des développeurs, des data-scientists et des ingénieurs MLOps pour concevoir ces plateformes de gestion des connaissances [[12]](#ref-12).

---

#### <a name="marche-ia-generative"></a>📈 Marché de l'IA générative

**Source** : Sopra Steria Next (2024)

Un communiqué de **Sopra Steria Next** rappelle que :

- Le marché mondial de l'IA générative a **doublé en 2024** pour atteindre **20 à 25 milliards de dollars**
- Il pourrait **dépasser 100 milliards en 2028**
- En 2024, seules **22 % des grandes entreprises** ont déployé au moins un cas d'usage de manière industrielle

**Principaux freins** :

- Gouvernance des données
- Obstacles organisationnels
- Manque de compétences [[13]](#ref-13)

**Conclusion** : Des opportunités importantes existent pour les entreprises capables de développer et d'industrialiser des plateformes RAG.

---

## Synthèse : alignement entre la problématique et les besoins du marché

Les **ESN** (Capgemini, Atos, Sopra Steria…), les **sous-traitants aéronautiques** (Airbus, Safran, Thales) et les **grands groupes industriels** gèrent des volumes massifs de données techniques accumulées depuis des décennies : spécifications, procédures, code source, documents qualité, etc.

### 🎯 Points clés démontrés par les sources

| **Problématique** | **Chiffre clé** | **Source** |
|-------------------|-----------------|------------|
| Temps de recherche d'information | **2h/jour** (20% du temps) | McKinsey [[1]](#ref-1) |
| Perte de temps sur gestion de données | Jusqu'à **20% du temps** | Tech-Clarity [[2]](#ref-2) [[3]](#ref-3) |
| Réinvention de solutions existantes | **40% des ingénieurs** | Tech-Clarity [[2]](#ref-2) |
| Perte d'expertise lors de départs | **27 000 années d'expérience** (700 retraites) | Harvard Business Review [[4]](#ref-4) |
| Durée d'onboarding | **8 à 12 mois** pour pleine productivité | LumApps [[5]](#ref-5) |

### 💡 Opportunités identifiées

Face à ces enjeux, les entreprises recherchent activement des **solutions d'IA générative augmentée par la récupération (RAG)** pour :

- ✅ Interroger en langage naturel l'ensemble de leur patrimoine documentaire
- ✅ Capitaliser l'expertise interne
- ✅ Améliorer la productivité

Les initiatives d'**Airbus**, **TotalEnergies** et **Atos** montrent que ces technologies sont **déjà à l'œuvre** dans l'aéronautique, l'énergie et les services numériques [[6]](#ref-6) [[9]](#ref-9) [[11]](#ref-11).

Le **plan régional IA Occitanie** confirme également le soutien institutionnel et l'importance stratégique de ce secteur pour la région toulousaine [[7]](#ref-7).

---

## Conclusion

> 💼 **Ces sources démontrent que la problématique identifiée lors de votre formation (mise en place d'un système de gestion de connaissances basé sur la RAG) répond à une demande réelle et urgente du marché professionnel en Occitanie et plus largement en France.**

### Bénéfices attendus d'une solution RAG

1. ⏱️ **Réduire le temps de recherche d'information** (gain de 35% selon McKinsey)
2. 🔄 **Éviter la redondance des développements** (40% réinventent la roue)
3. 🎓 **Faciliter le transfert de compétences** (réduire l'onboarding de 12 à 6 mois)
4. 💎 **Valoriser l'expertise accumulée** (éviter la perte de 27 000 années d'expérience)
5. 🚀 **S'inscrire dans les priorités stratégiques** des entreprises technologiques et industrielles

---

## Bibliographie

<a name="ref-1"></a>
**[1]** **McKinsey Global Institute** - "The social economy: Unlocking value and productivity through social technologies"  
📎 [Lien vers l'étude](https://www.mckinsey.com/industries/technology-media-and-telecommunications/our-insights/the-social-economy)

<a name="ref-2"></a>
**[2]** **Tech-Clarity** - "Design Data Best Practice" (enquête sur 2 000+ ingénieurs)  
📎 [Lien vers le rapport PDF](https://www.plm.automation.siemens.com/en_us/Images/Tech-Clarity-Perspective-Design-Data-Best-Practice-30239_tcm1023-244068.pdf)

<a name="ref-3"></a>
**[3]** **Tech-Clarity** - Ibid. (même source, données sur la réinvention de solutions)

<a name="ref-4"></a>
**[4]** **Harvard Business Review** - "What's Lost When Experts Retire"  
📎 [Lien vers l'article](https://hbr.org/2014/12/whats-lost-when-experts-retire)

<a name="ref-5"></a>
**[5]** **LumApps** - "Employee Onboarding & Retention Challenges: What's Holding Your Company Back?" (2025)  
📎 [Lien vers l'article](https://www.lumapps.com/employee-experience/employee-onboarding-retention-challenges)

<a name="ref-6"></a>
**[6]** **La Tribune** - "L'IA au défi des requêtes client dans l'aéronautique" (Sopra Steria Next)  
📎 [Lien vers l'article](https://www.latribune.fr/opinions/tribunes/l-intelligence-artificielle-au-defi-des-requetes-client-dans-l-aeronautique-1010007.html)

<a name="ref-7"></a>
**[7]** **Gazette du Midi** - "La Région Occitanie adopte un Plan de 60 M€ dédié aux IA"  
📎 [Lien vers l'article](https://gazette-du-midi.fr/au-sommaire/collectivites/la-region-occitanie-adopte-un-plan-de-60-meur-dedie-aux-intelligences)

<a name="ref-8"></a>
**[8]** **Airbus** - "How Airbus uses generative artificial intelligence to reinvent itself" (2024)  
📎 [Lien vers l'article](https://www.airbus.com/en/newsroom/stories/2024-05-how-airbus-uses-generative-artificial-intelligence-to-reinvent-itself)

<a name="ref-9"></a>
**[9]** **La Revue du Digital** - "L'IA générative RAG s'apprête à améliorer la recherche d'informations chez TotalEnergies"  
📎 [Lien vers l'article](https://www.larevuedudigital.com/lia-generative-rag-ameliore-la-recherche-dinformations-chez-totalenergies/)

<a name="ref-10"></a>
**[10]** **La Revue du Digital** - Ibid. (même source, informations complémentaires)

<a name="ref-11"></a>
**[11]** **HelloWork** - "INTERVIEW. « L'IA générative n'est pas une vague, elle est là pour durer ! »" (Atos, 2025)  
📎 [Lien vers l'interview](https://www.hellowork.com/fr-fr/medias/ia-generative-atos.html)

<a name="ref-12"></a>
**[12]** **HelloWork** - Ibid. (même source, informations sur le recrutement)

<a name="ref-13"></a>
**[13]** **Sopra Steria Next** - "Generative AI: from Exploration to Impact" (étude 2024)  
📎 [Lien vers le communiqué](https://www.soprasteria.com/newsroom/press-releases/details/sopra-steria-next-unveils-its-study-generative-ai-from-exploration-to-impact)

---

📝 **Note méthodologique** : Ce document compile et structure les sources du PDF `Recherche de sources fiables.pdf` pour faciliter les références bibliographiques dans le dossier RNCP 5.
