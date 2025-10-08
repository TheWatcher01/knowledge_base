# exemple dossier projet edouard halimi

> **Source** : `exemple_dossier-projet_edouard_halimi.pdf`  
> **Converti** : 2025-10-08 20:40:04

---

````
 ML-Explorer

Dossier projet
Titre RNCP 5 Développeur web et web mobile
(DWWM)




Edouard Halimi
19/12/2024
ML-Explorer                                                                                                                    Edouard Halimi



Table des matières
Table des matières ............................................................................................................................. 2
1.      Introduction ............................................................................................................................... 4
2.      Liste de compétences mises en œuvre ........................................................................................ 5
2.1        Compétences techniques ...................................................................................................... 5
2.2        Compétences transversales ................................................................................................... 5
3.      Expression des besoins du projet ................................................................................................ 5
3.1        Contexte et objectif ................................................................................................................ 5
3.2        Besoins fonctionnels.............................................................................................................. 7
3.2.1      Inscription et gestion des comptes utilisateurs ........................................................................ 7
3.2.2      Gestion des datasets ............................................................................................................. 7
3.2.3      Recherche et navigation ......................................................................................................... 7
3.2.4     Diagramme du cheminement de l’application ........................................................................... 8
3.3        Besoins non fonctionnels ....................................................................................................... 9
3.4        Contraintes du projet ............................................................................................................. 9
3.5        Critères de réussite ................................................................................................................ 9
3.6 Organisation et Planning ............................................................................................................. 10
4       Environnement technique......................................................................................................... 10
4.1 Langages de programmation utilisés / Frameworks, bibliothèques et base de données................... 10
4.1        Outils de développement ..................................................................................................... 13
4.2        Plateformes ou services utilisés ........................................................................................... 13
5       Réalisations permettant la mise en œuvre des compétences ..................................................... 14
5.1        Réalisation du front-end ....................................................................................................... 14
5.1.1      Présentation de maquettes de l’application, adaptation web et web mobile ............................ 14
5.1.2      Schéma de l’enchaînement des maquettes de l’application ................................................... 16
5.1.3      Captures d’écran d’interfaces utilisateur, adaptation web et web mobile ................................ 17
5.1.4      Initialisation du projet .......................................................................................................... 19
5.1.5      Installation des dépendances ............................................................................................... 19
5.1.6      Structure du front-end .......................................................................................................... 20
5.1.7      Les composants .................................................................................................................. 20
5.1.8      Configuration des routes ...................................................................................................... 23
5.1.9      Responsive design ............................................................................................................... 25
5.1.10         Les tests ......................................................................................................................... 25
5.1.11         Le déploiement................................................................................................................ 27
5.2        Réalisation du back-end ....................................................................................................... 28
5.2.1 Initialisation du projet .......................................................................................................... 29
19/12/2024                                                                                                                                 2
ML-Explorer                                                                                                                    Edouard Halimi


5.2.2      Installation des dépendances ............................................................................................... 29
5.2.3      Configuration du serveur Express.......................................................................................... 29
5.2.4      Présentation de la base de données ...................................................................................... 30
5.2.5      Création des Routes et Contrôleurs ...................................................................................... 35
5.2.6      Création des middlewares .................................................................................................... 35
5.2.7      Extraits de code ................................................................................................................... 36
5.2.8      Test de l’API ......................................................................................................................... 38
5.3        Présentation d’éléments de sécurité de l’application ............................................................. 39
5.3.1      Utilisation de variable d’environnement ................................................................................ 39
5.3.2      Configuration CORS ............................................................................................................. 41
5.3.3      Sécurités lors de la création d’un compte utilisateur .............................................................. 41
5.3.4      Authentification via Json Web Token (JWT) ............................................................................. 42
5.4        Présentation des tests.......................................................................................................... 43
5.5        Description de la veille, vulnérabilités de sécurité .................................................................. 45
6       Conclusion .............................................................................................................................. 45
7       Annexes .................................................................................................................................. 47




19/12/2024                                                                                                                                         3
ML-Explorer                                                                   Edouard Halimi



   1. Introduction


Lorsque je me suis intéressé au machine learning, j'ai commencé par m'exercer sur deux
plateformes : Kaggle, qui est plutôt orientée data science, et Hugging Face, qui est axée
sur le développement de modèles d'IA. En m'exerçant, j'ai appris les notions de base sur
le fonctionnement des modèles d'Intelligence Artificielle, comme les réseaux de
neurones, l'apprentissage supervisé et non supervisé, ainsi que la validation croisée des
modèles. J'ai alors réalisé qu'il serait utile de proposer un produit interactif permettant
aux utilisateurs n'ayant pas ou peu de notions de s'initier aux fondamentaux de
l'Intelligence Artificielle. Ce module éducatif viserait à leur expliquer de manière ludique
et accessible les concepts essentiels, avant qu'ils ne se lancent sur des plateformes
plus spécialisées comme Kaggle ou Hugging Face. En partant de cette idée, j'ai décidé
d'en faire mon projet de soutenance : ML-Explorer, une application interactive visant à
rendre l'apprentissage du machine learning plus simple et accessible. Ce projet offre
non seulement un parcours d'apprentissage progressif, mais aussi une série de
démonstrations interactives permettant aux utilisateurs de visualiser et de comprendre
le comportement des différents modèles. Mon objectif était de créer une expérience
immersive qui motive les débutants à se familiariser avec ces concepts avant de
s'aventurer dans des environnements plus complexes.


J’ai travaillé seul sur ce projet, mais j’ai régulièrement échangé avec mes camarades de
promotion (C23), car nous faisions face à des problématiques de développement
similaires.




19/12/2024                                                                                4
ML-Explorer                                                               Edouard Halimi



   2. Liste de compétences mises en œuvre

       2.1 Compétences techniques

Développer la partie front-end d’une application web ou web mobile sécurisée :
   -   Installer et configurer son environnement de travail en fonction du projet web ou
       web mobile.
   -   Maquetter des interfaces utilisateur web ou web mobile.
   -   Réaliser des interfaces utilisateur statiques web ou web mobile.
   -   Développer la partie dynamique des interfaces utilisateur web ou web mobile.
Développer la partie back-end d’une application web ou web mobile sécurisée :
   -   Mettre en place une base de données relationnelle.
   -   Développer des composants d’accès aux données SQL.
   -   Développer des composants métier côté serveur.
   -   Documenter le déploiement d’une application dynamique web ou web mobile.



       2.2 Compétences transversales

   -   Méthodologie Agile : Ecoute, Entraide, Coopération.
   -   Mettre en œuvre une démarche de résolution de problèmes.
   -   Apprentissage continu et en autonomie.
   -   Capacité de sélectionner et d’exploiter les ressources web.



   3. Expression des besoins du projet

       3.1 Contexte et objectif

       Le projet consiste à développer une application web pour des étudiants ou
       simplement des personnes curieuses, qui souhaiteraient mieux comprendre
       comment fonctionne l’intelligence artificielle.
       Le Machine Learning (ML), ou apprentissage automatique, est une branche de
       l'intelligence artificielle qui consiste à permettre à une machine d'apprendre à
       partir de données sans être explicitement programmée. Il existe plusieurs
       concepts clés en ML. Nous allons explorer certains d'entre eux :
19/12/2024                                                                            5
ML-Explorer                                                                Edouard Halimi


       - Apprentissage supervisé
       L'apprentissage supervisé est une méthode d'apprentissage où le modèle est
       entraîné à partir d'un ensemble de données qui contient à la fois des
       caractéristiques d'entrée et les réponses désirées (étiquettes). L'objectif est de
       permettre au modèle de généraliser à partir de ces données pour faire des
       prédictions précises sur de nouvelles données. Il existe plusieurs types de tâches
       d'apprentissage supervisé, notamment la classification et la régression.
       Exemple : Prédiction du prix de l'immobilier On pourrait avoir un jeu de données
       d'annonces immobilières qui inclut les caractéristiques de chaque maison
       (surface, nombre de pièces, emplacement, etc.) et le prix réel de la maison. Un
       algorithme d'apprentissage supervisé peut être entraîné sur ces données pour
       prédire le prix d'autres maisons à partir de leurs caractéristiques.
       - Apprentissage non supervisé
       On utilise l'apprentissage non supervisé lorsque nous disposons d'un ensemble
       de données d'entrée sans étiquettes correspondantes. L'objectif est de permettre
       au modèle de trouver la structure ou les motifs dans ces données. Les méthodes
       d'apprentissage non supervisé comprennent le clustering et la réduction de la
       dimensionalité.
       Exemple : Segmentation de la clientèle Supposons que nous ayons un jeu de
       données de clients d'un supermarché, avec des informations sur leurs
       transactions passées, mais sans aucune étiquette qui classe les clients en
       différents groupes. On peut utiliser un algorithme de clustering pour segmenter
       les clients en groupes distincts en fonction de leurs habitudes d'achat.
       -Apprentissage par renforcement
       Dans l'apprentissage par renforcement, un agent apprend à effectuer certaines
       actions dans un environnement afin de maximiser la récompense cumulative.
       Contrairement à l'apprentissage supervisé et non supervisé, il n'y a pas de
       réponse correcte ou incorrecte. L'apprentissage est basé sur l'expérimentation et
       la découverte.
       Exemple : Un apprentissage par renforcement peut être utilisé pour entraîner un
       agent à jouer à des jeux comme l'échec. L'agent, initialement, ne connaît pas la
       stratégie de jeu mais il apprend par l'expérience. Chaque bon mouvement est
       récompensé et en conséquence, l'agent apprend à faire des mouvements qui
       augmentent sa chance de victoire.


       L’objectif principal est d’initier aux fondamentaux du machine learning grâce à
       une interface didactique et ludique.
19/12/2024                                                                             6
ML-Explorer                                                                     Edouard Halimi




       3.2 Besoins fonctionnels

              3.2.1 Inscription et gestion des comptes utilisateurs

Inscription et connexion des utilisateurs :
Système de création de comptes utilisateurs, chaque utilisateur correspond à un email
et un mot de passe. Le hachage du mot de passe est assuré par bcrypt, et lorsque
l’utilisateur est créé, un token JWT est généré.
Le composant « Register » vérifie la réponse de la requête d’enregistrement et redirige
l’utilisateur vers la page de connexion si l’enregistrement est réussi.
Système de connexion des utilisateurs :
Système de connexion pour les utilisateurs, avec un point de terminaison qui vérifie si
l’utilisateur existe, s’il existe vérifie le mot de passe, et si le mot de passe est correct,
génère un token JWT.
Profil Utilisateur :
Chaque utilisateur doit pouvoir gérer son profil, mettre à jour ses informations ou pouvoir
supprimer entièrement son compte.

              3.2.2 Gestion des datasets


Pour ajouter un nouvel ensemble de données, vous avez besoin de trois fichiers : .csv,
.json et .jpg. Après les avoir ajoutés au bon dossier, mettez à jour le fichier .json avec les
détails de l'ensemble de données. Testez l'ensemble de données en vérifiant si les
métadonnées des colonnes s'affichent correctement dans le panneau de l'application.


Veillez à ce que chaque colonne soit correctement répertoriée dans le fichier .json et
testez son fonctionnement dans l'outil en mettant en surbrillance chaque colonne et en
vous assurant que ses métadonnées s'affichent correctement dans le panneau de
droite.

              3.2.3 Recherche et navigation

L'application utilise une approche scène par scène, avec une logique centralisée pour
contrôler le moment où les boutons « Précédent » et « Suivant » sont affichés et activés.


19/12/2024                                                                                  7
ML-Explorer                                                               Edouard Halimi


Par exemple, le bouton « Suivant » ne fonctionnera pas tant que l'utilisateur n'aura pas
sélectionné une étiquette.

              3.2.4 Diagramme du cheminement de l’application




19/12/2024                                                                            8
ML-Explorer                                                                     Edouard Halimi


       3.3 Besoins non fonctionnels

Sécurité des données : Protection et confidentialité des informations personnelles des
utilisateurs
Performance : Optimisation des ressources et du code pour assurer une navigation
fluide
Interface Utilisateur : Navigation intuitive et structurée logiquement
Accessibilité : Fiabilité du déploiement et de l’hébergement

       3.4 Contraintes du projet

Dans le but d’apprendre des technologies à fort potentiel, j’ai décidé de développer mon
site en utilisant des langages et frameworks que je ne connaissais pas ou peu.
J’ai opté en front-end pour du Javascript / React.js, technologies très utilisées par les
développeurs du monde entier. Ce choix me semblait évident dans le contexte web
actuel et répondait aux nécessités de mon projet.
Pour le back-end, j’ai choisi Node.js et MongoDB, dans le but de répondre à
l’architecture MERN (MongoDB, Express, React, Node), ceci afin d’optimiser les
performances de mon application, et permettre une meilleure compatibilité des
différents composants.

       3.5 Critères de réussite

Lors de la définition des axes du projet, je me suis fixé 4 critères de réussite :


Expérience Utilisateur Intuitive
   •   Interface simple et progressive par étapes
   •   Instructions dynamiques adaptées à chaque scène
   •   Navigation claire avec boutons "Précédent" et "Suivant" contextuels


Flexibilité d'Exploration des Données
   •   Capacité de charger différents types de jeux de données
   •   Support des données catégorielles et continues
   •   Visualisations variées (graphiques, tableaux croisés)

19/12/2024                                                                                  9
ML-Explorer                                                                 Edouard Halimi




Pédagogie de la Modélisation Machine Learning
   •   Démonstration pas à pas du processus d'apprentissage
   •   Visualisation de la performance du modèle
   •   Comparaison explicite des prédictions


Adaptabilité Technique
   •   Design responsive (mobile, tablette, ordinateur)
   •   Compatibilités multi-supports
   •   Possibilité de sauvegarder et réutiliser des modèles

   3.6 Organisation et Planning

J’ai utilisé Trello pour organiser mon travail :
La première phase qui a duré 2 semaines entre le 01/09/24 et le 13/09/24, était un travail
sur la Documentation et les Ressources en vue de la réalisation du projet (voir annexe
16)
La seconde phase qui a duré 1 semaine entre le 16/09/24 et le 20/09/24, avait pour but
de réaliser les diagrammes et schémas nécessaires à la réalisation de mon application
(voir annexe 17)
La troisième phase qui a duré 7 semaines entre le 23/09/24 et le 08/11/24 avait comme
objectif de coder entièrement l’application (voir annexe 18)




              4 Environnement technique

                     4.1 Langages de programmation utilisés / Frameworks,
              bibliothèques et base de données




19/12/2024                                                                             10
ML-Explorer                                                             Edouard Halimi


J’ai utilisé principalement Javascript pour le développement de mon application, dans
un cadre React pour le front et Node pour le back.




Voici une illustration du fonctionnement back-end de mon application




19/12/2024                                                                         11
ML-Explorer                                                  Edouard Halimi


Et voici un diagramme du fonctionnement de mon application




19/12/2024                                                              12
ML-Explorer                                                                 Edouard Halimi


              4.1   Outils de développement

Bibliothèques
   •   React: Une bibliothèque JavaScript pour la construction d'interface utilisateur
       interactive.
   •   react-dom: Un connecteur entre React et le DOM.
   •   Redux: Une bibliothèque JavaScript qui aide à gérer l'état de l’application.
   •   Mongoose: Une bibliothèque qui facilite la communication entre MongoDB et
       Node.js.
Outils de développement
   •   react-dom: Un connecteur entre React et le DOM (Document Object Model).
   •   Babel-loader: Un package pour webpack qui transforme JavaScript basé sur la
       configuration Babel.
   •   Express: Un framework pour créer une application web sur le serveur, basé sur
       Node.js.
   •   Webpack: Un assembleur de modules pour JavaScript.
   •   Webpack Dev Server: Fournit un serveur de développement qui offre un
       rafraîchissement automatique des pages pour webpack.
   •   Babel-core: Le compilateur Babel qui possède une API pour l'utilisation des
       plugins, la transformation du code et la génération du code.
   •   React-redux: La liaison officielle de Redux pour React.
   •   ESlint: Un outil de linting pour JavaScript.
   •   Jest: Un framework de test pour JavaScript.
   •   Dotenv: Un module sans dépendance qui charge les variables d'environnement
       d'un fichier .env dans process .env.
   •   Axios: Un package client HTTP pour le navigateur et Node.js.

              4.2   Plateformes ou services utilisés



   1. GitHub : Je l'utilise en tant que plateforme d'hébergement de code source offrant
      non seulement les fonctionnalités de Git pour le contrôle de version, mais aussi
      ses propres caractéristiques.

19/12/2024                                                                             13
ML-Explorer                                                                 Edouard Halimi


   2. GitHub Actions : C'est un outil précieux que j'emploie pour l'automatisation des
      workflows. Il me permet de créer, tester et déployer mon code directement
      depuis mon dépôt GitHub.
   3. MongoDB Atlas : C'est ma solution pour une base de données dans le cloud. Elle
      me donne la flexibilité de contrôler où déployer mes données pour répondre aux
      exigences de conformité, de latence et de performance.
   4. AWS (Amazon Web Services) : J'utilise AWS pour le stockage de mes bases de
      données. C'est une plateforme robuste de cloud computing.



5 Réalisations permettant la mise en œuvre des compétences

              5.1   Réalisation du front-end

J’ai choisi le cadre de travail React pour le développement front end de mon application.

                       5.1.1 Présentation de maquettes de l’application, adaptation web et
                             web mobile

Lors de la conception du projet, j’avais en tête 4 scènes principales dans mon
application :


La première scène correspondait à la sélection de son dataset :




La deuxième scène correspondait au tableau du dataset sélectionné et à la construction
de son modèle : c’est-à-dire choisir la colonne à prédire, en fonction d’une ou plusieurs
autres colonnes correspondant aux « features », c’est-à-dire les datas que le modèle va
utiliser lors de l’entraînement.

19/12/2024                                                                             14
ML-Explorer                                                               Edouard Halimi




La troisième scène correspondait au résultat du modèle donné, à savoir le taux de
précision avec lequel le modèle était capable de prédire la colonne en question :




Enfin, la quatrième scène correspondait à une fiche récapitulative permettant de
sauvegarder son modèle et de décrire ce qui fonctionne bien ainsi que les limites de ce
dernier.




19/12/2024                                                                           15
ML-Explorer                                                                      Edouard Halimi




J’ai par la suite rajouté une scène entre la scène 2 et la scène 3, qui correspond à une
cinématique qui illustre l’entrainement du modèle. Cette approche visuelle a pour
objectif de maintenir l’attention et l’intérêt de l’utilisateur, et de rendre l’application plus
attractive.

                      5.1.2 Schéma de l’enchaînement des maquettes de l’application

J’ai rapidement esquissé les 4 principales scènes en utilisant Balsamiq (extrait ci-
dessus), puis j’ai approfondi le travail au fil du développement, notamment en
incorporant des éléments de style CSS.
Enfin, j’ai intégré la navigation entre les scènes grâce à redux :




19/12/2024                                                                                   16
ML-Explorer                                                                   Edouard Halimi


                      5.1.3 Captures d’écran d’interfaces utilisateur, adaptation web et
                            web mobile


Voici les principales scènes de mon application :


Scène n°1 Chargement du dataset :




Ici, l’utilisateur peut choisir un dataset parmi la sélection, ou télécharger son propre
dataset grâce au bouton en bas à gauche « Upload CSV »


Scène n°2 Choix de la prédiction « x » basé sur « y, z … »




19/12/2024                                                                                 17
ML-Explorer                                                                    Edouard Halimi


Dans cette scène, l’utilisateur accède à son dataset, choisis la colonne à prédire en
orange, appuis sur le bouton « select label », puis sur le bouton « continue » , puis choisis
plusieurs autre colonnes, appuis sur « add feature », et enfin appuis sur « train » pour
l’entrainement du modèle.


Scène n°3 Illustration visuelle de l’entraînement du modèle :




Dans cette scène, l’utilisateur observe le modèle « s’entraîner », à l’aide d’une
représentation visuelle d’un petit robot qui « absorbe » les différentes données.
Scène n°4 Document pour sauvegarder son modèle :




19/12/2024                                                                                18
ML-Explorer                                                                  Edouard Halimi


Enfin, l’utilisateur, peut sauvegarder son modèle, en remplissant les champs suivants :
   -   Model name
   -   Intended Use
   -   Limitations and Warnings

                     5.1.4 Initialisation du projet

Lors de l’initialisation du projet, j’ai d’abord créé un nouveau dossier pour mon projet.
   -   J’ai installé Node.js.
   -   J’ai installé React et ReactDOM.
   -   J’ai installé les autres packages nécessaires, tels que Redux, Babel Loader,
       Express et Mongoose.
   -   J’ai créé et configuré mon fichier webpack.config.js pour utiliser Babel et
       transpiler mon code React.
   -   J’ai configuré mon serveur Express dans un fichier séparé, server.js.
   -   J’ai configuré des scripts dans mon fichier package.json pour démarrer, tester et
       construire mon application.

                     5.1.5 Installation des dépendances

       Les dépendances front-end pour ce projet sont :

   -   react@18.3.1: Il s’agit de la bibliothèque ReactJS, qui est le cœur de notre
       application front-end.
   -   react-dom@18.3.1: Ce package sert à faire le rendu des composants React dans
       le DOM.
   -   redux@5.0.1: Redux est utilisé pour gérer l’état global de l’application.
   -   react-redux@9.1.2: Ce package lie ensemble React et Redux, facilitant
       l’utilisation de Redux dans un projet React.
   -   @testing-library/react : bibliothèque qui fournit un ensemble de fonctions pour
       interagir avec des composants React lors de tests, de manière similaire à ce que
       ferait un utilisateur réel.
   -   @testing-library/jest-dom : Offre un ensemble de matchers personnalisés jest-
       dom pour écrire des assertions plus facilement lisibles et expressives.
   -   @fortawesome/react-fontawesome@0.1.7 et @fortawesome/free-solid-svg-
       icons@5.11.2 : Ces deux packages sont utilisés pour utiliser les icônes de
       FontAwesome dans notre application React.
   -   chart.js@2.9.4 et react-chartjs-2@2.11.1: Ces deux librairies sont utilisées pour
       la visualisation de données sous forme graphiques.

19/12/2024                                                                              19
ML-Explorer                                                                     Edouard Halimi


   -   query-string@4.1.0: Cette librairie est utilisée pour parser les chaînes de requête
       dans les URL.




                      5.1.6 Structure du front-end

       Le front-end est basé sur React et utilise la structure standard des applications
       React. Il y a un composant racine qui rend d'autres composants en fonction de
       l'état et des routes. Ces composants sont organisés en dossiers, chaque dossier
       contenant le code du composant et son style. Redux est utilisé pour gérer l'état
       global, avec actions et réducteurs séparés. Les composants peuvent faire des
       appels API via Axios. FontAwesome et Chart.js sont utilisés pour l'UI.


       Palette de couleurs
       J'ai imaginé une palette de couleurs minimale et moderne qui reflète l'esprit de
       l'analyse de données. J'ai utilisé des tons de gris et orange pour représenter la
       confiance et l'intelligence, et des gris doux pour les arrière-plans pour un
       contraste minimal.
   •   Orange léger #FFA500 : Je l'ai utilisé pour les boutons et les liens importants
   •   Noir #020000 : Il a été utilisé pour les en-têtes et le texte de grande taille
   •   Gris clair #CCD1D1 : Utilisé pour les arrière-plans et les zones de contenu
       Police de caractères
       J'ai considéré une police Aptos pour refléter la modernité et la lisibilité, pour
       correspondre à la nature du projet :
       SEO
       J'ai axé le SEO du projet sur le référencement technique en raison de la nature du
       projet ML-Explorer. J'ai veillé à ce que les titres et descriptions méta soient
       clairement définis pour chaque page, incluant des mots clés tels que "machine
       learning", "ML Explorer", "analyse de données".




                      5.1.7 Les composants

       Voici les principaux composants React, présent dans le dossier UIComponents :
19/12/2024                                                                                 20
ML-Explorer                                                                  Edouard Halimi




   -   DataTable.jsx : Ce composant est utilisé pour afficher les données importées
       dans un format de tableau. Il a plusieurs responsabilités : rendre les en-têtes de
       colonne, rendre les rangées de données, interaction utilisateur. (voir annexe 1)

   -   DataDisplay.jsx: Ce composant affiche les données importées à l'utilisateur. Si
       aucune donnée n'a été importée, il ne rend rien. Sinon, il affiche le nombre de
       lignes de données et un composant DataTable qui rend les données elles-
       mêmes. (voir annexe 2)
   -   DataCard.jsx: Ce composant affiche les informations détaillées du jeu de
       données sélectionné. Il affiche des informations comme le nom du jeu de
       données, sa description, le nombre de lignes, etc. (voir annexe 3)

   -   AddFeatureButton.jsx: Ce bouton permet à l'utilisateur d'ajouter une colonne
       sélectionnée à la liste des fonctionnalités qui seront utilisées pour l'entraînement
       du modèle.
   -   ColumnDataTypeDropdown.jsx: Ce composant est un menu déroulant qui
       permet à l'utilisateur de choisir le type de données pour une colonne
       sélectionnée.

   -   ColumnDetailsCategorical.jsx: Ce composant affiche les détails d'une colonne
       catégorielle, y compris un histogramme des différentes catégories et leurs
       fréquences.

   -   ColumnDetailsNumerical.jsx: Ce composant affiche des informations
       détaillées sur une colonne de type numérique, telles que la gamme de valeurs et
       si toutes les entrées sont de type numérique.

   -   ColumnInspector.jsx: Ce composant inspecte une colonne sélectionnée, et
       affiche des détails pertinents en fonction du type de donnée de la colonne. Il peut
       aussi afficher un bouton pour ajouter la colonne en tant que caractéristique ou
       étiquette pour l'entraînement du modèle.
   -   GenerateResults.jsx : Ce composant gère les animations lors de la génération
       des résultats. Il utilise un intervalle pour mettre à jour une animation frame par
       frame et rend le contenu à différents états de l'animation.

   -   ModelCard.jsx : Ce composant affiche les détails de la carte du modèle, y
       compris le nom du modèle, l'exactitude, l'utilisation prévue, les limites, les
       détails du jeu de données, les caractéristiques et les labels. Ces détails sont
       utiles pour comprendre comment le modèle fonctionne et quels facteurs
       contribuent à ses prédictions. (voir annexe 4)

   -   Predict.jsx : Ce composant permet de prédire les résultats en entrée à l'aide du
       modèle entrainé. Il permet aux utilisateurs d'entrer les valeurs pour les
19/12/2024                                                                              21
ML-Explorer                                                                     Edouard Halimi


       caractéristiques sélectionnées et rend la prédiction du label par le modèle. (voir
       annexe 5)

   -   ResultsDetails.jsx: Ce composant affiche les détails des résultats du modèle. Il
       comprend une table qui montre les prédictions correctes et incorrectes du
       modèle. (voir annexe 6)

   -   ResultsToggle.jsx : Ce composant est un bouton basculant qui permet aux
       utilisateurs de basculer entre les résultats corrects et incorrects.

   -   ResultsTable.jsx : Ce composant affiche un tableau récapitulatif des résultats
       de l'entraînement du modèle. Il met en évidence les entrées de données, les
       labels réels, et les labels prédits par le modèle d'A.I. Ce composant fournit un
       moyen visuel d'évaluer la performance du modèle d'A.I. (voir annexe 7)

   -   SaveModel.jsx : Ce composant gère la sauvegarde d'un modèle entraîné. Il
       permet aux utilisateurs de définir un nom pour le modèle, d'ajouter une
       description pour la dataset utilisée et d'inclure des informations sur les
       utilisations potentielles et les mésusages potentiels du modèle. Ce composant
       est important pour la gestion et le suivi des modèles d'A.I entraînés. (voir annexe
       8)

   -   ScatterPlot.jsx : Ce composant crée un graphique de dispersion qui vous permet
       de visualiser les résultats de votre modèle d'A.I. Il utilise le package 'react-chartjs-
       2' pour générer ce graphique.

   -   ScrollableContent.jsx : Ce composant encapsule du contenu qui nécessite le
       défilement. Il est souvent utilisé pour afficher une liste d'objets ou d'informations
       qui pourraient ne pas tenir dans la zone d'affichage disponible.

   -   SelectDataset.jsx : Ce composant gère la sélection d'une dataset pour
       l'entraînement du modèle d'A.I. Il permet aux utilisateurs de choisir parmi
       plusieurs datasets prédéfinis ou de télécharger leur propre dataset au format
       CSV. Le choix de la dataset est une étape clé de l'entraînement du modèle d'A.I.
       (voir annexe 9)

   -   SelectLabelButton.jsx : Ce composant est un bouton qui, lorsqu'il est cliqué,
       définit une colonne spécifique de la dataset comme étant la colonne des labels.
       Les labels sont utilisés par le modèle d'A.I pour effectuer des prédictions; donc,
       choisir la bonne colonne comme label est crucial pour l'entraînement du modèle.
   -   Statement.jsx : Il gère l'affichage d'une déclaration qui résume le modèle actuel
       (label et caractéristiques sélectionnés). Il fournit également des fonctionnalités
       pour supprimer des features ou la colonne label via des icônes de suppression. Il
       reçoit des propriétés depuis le store Redux, y compris la colonne label actuelle,
       les features sélectionnées, et l'état de l'overlay d'instructions. Les methodes
       removeLabel() et removeFeature(id) sont utilisées pour supprimer
       respectivement la colonne label et une feature spécifique.
19/12/2024                                                                                  22
ML-Explorer                                                                  Edouard Halimi


   -   TrainModel.jsx : Il gère l'entraînement du modèle. Durant le processus
       d'entraînement, une animation est affichée où chaque ligne de la dataset se
       dirige vers la tête du robot AI. Le composant récupére l'état de Redux pour
       déterminer quand commencer et arrêter l'animation. Le tableau de données est
       affiché avec une opacité qui varie en fonction de l'état de l'animation. (voir
       annexe 10)




                     5.1.8 Configuration des routes

Dans cette application, je ne travaille pas avec la configuration de routage traditionnelle
que vous pourriez voir avec react-router-dom. Au lieu de cela, je gère la navigation entre
différents "écrans" ou "panels" par le biais des actions Redux et de l'état du store.


Voilà comment je le fais :


   -   J'ai plusieurs composants qui servent d'écrans différents dans l'application :
       SelectDataset, DataDisplay, TrainModel, GenerateResults, Results, SaveModel
       et ModelCard.

   -   L'écran actuellement affiché est déterminé par la propriété currentPanel dans le
       store Redux. Je mets à jour cette propriété avec l'action setCurrentPanel(panel).


   -   Dans le composant App, j'utilise la propriété currentPanel pour décider quel
       écran (ou panel) je dois afficher à l'utilisateur. Par exemple, si currentPanel vaut
       "selectDataset", alors je rends le composant SelectDataset, et ainsi de suite pour
       les autres écrans.

   -   Je gère les boutons de navigation (suivant et précédent) dans le composant
       PanelButtons. Lorsque ces boutons sont cliqués, ils déclenchent soit la fonction
       onClickPrev (pour le bouton précédent) ou onClickNext (pour le bouton suivant).
       Ces fonctions appellent ensuite setCurrentPanel avec le panel approprié à
       afficher.




19/12/2024                                                                              23
ML-Explorer                                                                Edouard Halimi


   -   De cette manière, je gère le passage d'un écran à un autre en modifiant l'état
       currentPanel dans le store Redux, ce qui déclenche un nouveau rendu de mon
       application avec le bon panel affiché.
Il est important de noter que cette approche de gestion de la navigation est spécifique à
cette application. Elle diffère de l'utilisation classique de react-router-dom pour le
routage entre les pages. Elle convient mieux à une application de type "assistant" où
l'utilisateur avance d'un écran à un autre dans un ordre spécifique.
Voici un diagramme qui représente la gestion des écrans via Redux :




19/12/2024                                                                            24
ML-Explorer                                                                 Edouard Halimi




                     5.1.9 Responsive design

L’application est réactive horizontalement et fonctionne bien en mode paysage sur
mobile. Il s’ajuste également verticalement à l’aide de flexbox, certains éléments étant
fixés en hauteur et d’autres réglables.

                     5.1.10 Les tests

Pour réaliser les tests, j’utilise la bibliothèque @testing-library/react pour rendre les
composants et interagir avec eux, et jest pour exécuter les tests et faire des assertions.
Ils testent que les composants se comportent correctement en réponse à des actions
de l'utilisateur, comme des clics ou des changements de type de données de colonne,
en vérifiant que les bonnes fonctions sont appelées avec les bonnes valeurs.


Voici 3 exemples de tests de mes composants react :




19/12/2024                                                                             25
ML-Explorer   Edouard Halimi




19/12/2024               26
ML-Explorer                                                                   Edouard Halimi


Et voici un tableau qui récapitule l’ensemble de ces tests :




                     5.1.11 Le déploiement

Pour déployer le front-end de mon application, j'ai utilisé AWS. Voici comment j'ai
procédé :
   -   J'ai créé un bucket AWS S3 : J'ai configuré un nouveau bucket S3 via la console
       AWS et autorisé l'accès public pour permettre à CloudFront de servir les fichiers.
   -   J'ai téléchargé les fichiers de build : J'ai exécuté npm run build pour construire le
       front-end, puis j'ai uploadé tous les fichiers de sortie dans le bucket S3 que j'ai
       créé précédemment. (voir annexe 15)
   -   J'ai mis en place AWS CloudFront : J'ai créé une nouvelle distribution CloudFront
       qui utilise le bucket S3 comme origine.
   -   J'ai pointé le domaine vers CloudFront : J'ai mis à jour les enregistrements DNS du
       domaine pour qu'ils pointent vers l'URL de CloudFront, rendant ainsi l'application
       accessible en ligne.



19/12/2024                                                                               27
ML-Explorer                                                                   Edouard Halimi


              5.2   Réalisation du back-end

J’ai choisi le cadre de travail (framework) Node.js pour la réalisation du back-end de mon
application.


J’ai choisis une architecture MVC (Modèle-Vue-Contrôleur), j'ai divisé l'application en
trois composants principaux :


Modèle : J'ai représenté les données de l'application et les règles métier.


Vue : Je me suis occupé de la présentation des données (l'interface utilisateur).


Contrôleur : J'ai géré l'interaction entre la vue et le modèle.


Puis, j’ai structuré l’application ceci:




/ML-Explorer
|-- /model
   |-- user.js
   |-- dataset.js
|-- /view
   |-- home.js
   |-- login.js
   |-- register.js
|-- /controller
   |-- userController.js
   |-- datasetController.js
|-- server.js
|-- package.json




19/12/2024                                                                               28
ML-Explorer                                                                    Edouard Halimi


                     5.2.1 Initialisation du projet

   -   Installation de Node.js et NPM : J'ai installé Node.js qui est l'environnement
       d'exécution utilisé pour exécuter mon serveur en JavaScript, et NPM qui est le
       gestionnaire de paquets de Node.js. Suite à l'installation de Node.js, NPM a été
       installé simultanément.
   -   Initialisation du projet : J'ai initialisé mon projet en exécutant la commande npm
       init -y dans l'invite de commandes. En conséquence, un fichier package.json a été
       créé dans le répertoire de mon projet. Ce fichier contient les informations
       relatives à mon projet et ses dépendances.




                     5.2.2 Installation des dépendances

   -   express : Il s'agit d'un framework pour Node.js qui est utilisé pour créer le serveur.
   -   bcryptjs : C'est une bibliothèque pour crypter des mots de passe.
   -   jsonwebtoken : C'est utilisé pour créer des tokens d'accès pour l'authentification.
   -   dotenv : C'est une bibliothèque qui permet de charger des variables
       d'environnement à partir d'un fichier .env.
   -   mongodb : C'est l'interface officielle de MongoDB pour Node.js. Je l'utilise pour
       interagir avec la base de données MongoDB.
   -   mongoose : C'est une bibliothèque d'Object Data Modelling (ODM) pour
       MongoDB et Node.js. Elle aide à gérer les relations entre les données et fournit
       des fonctionnalités de validation des schémas.
   -   passport et passport-local : Passport est un middleware d'authentification pour
       Node.js. Passport-local est un plugin pour Passport qui gère l'authentification
       avec nom d'utilisateur et mot de passe.
   -   express-session : Il s'agit d'un middleware pour gérer les sessions pour Express.
   -   connect-flash : Il s'agit d'un middleware qui fournit un moyen facile de flasher des
       messages à l'utilisateur, généralement après qu'une action ait été effectuée.
   -   axios : C'est une bibliothèque qui facilite les requêtes HTTP depuis Node.js.



                     5.2.3 Configuration du serveur Express

Voici comment j’ai configuré mon serveur Express dans mon fichier server.js (voir
Annexe 11) :


19/12/2024                                                                                29
ML-Explorer                                                                    Edouard Halimi


   -   Importation des dépendances : Le fichier commence par l'importation de toutes
       les dépendances nécessaires telles que express (pour la configuration du
       serveur), dotenv (pour la gestion des variables d'environnement), mongoose
       (pour la connexion et la gestion de la base de données MongoDB), passport et
       passport-local (pour l'autorisation et l'authentification des utilisateurs), bcryptjs
       (pour le cryptage des mots de passe), express-session (pour gérer les sessions),
       path (pour gérer les chemins de fichiers), jsonwebtoken (pour gérer les tokens
       d'authentification) et connect-flash (pour afficher les messages flash).

   -   Configuration de la base de données MongoDB : Ensuite, une connexion est
       établie à la base de données MongoDB avec mongoose.connect en utilisant la
       chaîne de connexion provenant des variables d’environnement du fichier .env.
   -   Création du schéma utilisateur: Un nouveau schéma Mongoose est créé pour
       les utilisateurs, contenant un nom d’utilisateur (username) et un mot de passe
       (password).
   -   Configuration de la session express : La session express est configurée avec
       une clé secrète provenant du fichier dotenv (process.env.SESSION_SECRET).
       D’autres configurations comprennent resave : false (qui spécifie que la session
       ne doit pas être enregistrée si elle n’a pas été modifiée) et saveUninitialized : false
       (qui empêche de stocker des sessions inutiles jusqu’à ce qu’une session soit
       modifiée).
   -   Configuration de Passport.js : Passport est configuré pour utiliser LocalStrategy
       (stratégie locale). Les fonctions permettant de sérialiser et désérialiser
       l’utilisateur sont définies pour la gestion des sessions avec Passport.
   -   Importation des routes d'authentification : Un module de routes
       d'authentification est importé et utilisé avec le préfixe /auth.
   -   Configuration du middleware express.static : Express.static est configuré pour
       servir les fichiers depuis le dossier dist.
   -   Démarrage du serveur : Enfin, le serveur est lancé sur le port spécifié dans la
       variable d’environnement process.env.PORT ou sur le port 3001 s’il n’y a pas de
       valeur spécifiée.



                      5.2.4 Présentation de la base de données

J’ai utilisé MongoDB pour la configuration de ma base de données :




19/12/2024                                                                                 30
ML-Explorer                                                             Edouard Halimi




J’ai ensuite connecté le cluster à mon application en local :




Enfin, j’ai pu manager la base de données directement depuis MongoDB Atlas, et
ajouter les principales tables de mon application, comme User ou Model :




19/12/2024                                                                         31
ML-Explorer                                                               Edouard Halimi




    Voici un extrait de code qui définit un schéma pour une collection "Users" dans une
    base de données MongoDB à l'aide de la bibliothèque Mongoose. Chaque document
    dans la collection "Users" aura un "firstName", un "lastName", un "email" et un
    "password" :




19/12/2024                                                                           32
ML-Explorer                                  Edouard Halimi


Voici le diagramme de ma base de données :




19/12/2024                                              33
ML-Explorer                                                                 Edouard Halimi




    Protection contre les injections No-SQL

    Avec MongoDB et Mongoose, il y a des mesures de protection intégrées contre les
    injections NoSQL. Mongoose fait du filtrage et de la validation de données, ce qui
    aide à prévenir les injections NoSQL. Cependant, il est toujours utile d'ajouter une
    couche supplémentaire de sécurité.

       Valider les entrées : Il est essentiel de valider les entrées côté serveur, même si
       une validation est également effectuée côté client. Vous pouvez utiliser des
       bibliothèques comme joi or express-validator pour valider les entrées.

       Utiliser les méthodes Mongoose : Certaines méthodes comme find(), findOne(),
       findOneAndUpdate(), etc., qui prennent un objet comme argument, sont à l'abri
       des injections NoSQL.

       Éviter $where et mapReduce: Les fonctions telles que $where et mapReduce
       peuvent ouvrir des failles pour les injections NoSQL car elles peuvent contenir du
       code JavaScript arbitraire. Il est donc conseillé de les éviter.

    Protection contre les attaques XSS

    Les attaques XSS (Cross-Site Scripting) injectent des scripts dans les entrées qui
    sont alors sauvegardés et peuvent être exécutés dans le navigateur des autres
    utilisateurs. Pour s'en prémunir :

       Échapper aux entrées : Il est important d'échapper aux entrées utilisateur avant
       de les afficher. Cela signifie que les caractères tels que <, >, {, }, etc. sont
       convertis en entités HTML sécurisées. Vous pouvez utiliser des bibliothèques
       comme he pour cela.

       Utiliser les politiques de sécurité de contenu (CSP) : Les CSP permettent de
       contrôler les ressources qui sont autorisées à s'exécuter sur votre page, ce qui
       peut aider à prévenir les attaques XSS.

       Configurer les cookies de façon sécurisée : Utilisez les attributs HttpOnly et
       Secure pour les cookies. HttpOnly empêche l'accès aux cookies via JavaScript.
       Secure garantit que les cookies sont envoyés uniquement via HTTPS.




19/12/2024                                                                             34
ML-Explorer                                                                    Edouard Halimi


                     5.2.5 Création des Routes et Contrôleurs

Au cours du développement de l'application, j'ai défini divers contrôleurs et routes pour
gérer les requêtes du client.
       Configuration des routes d'authentification : J'ai intégré un module appelé
       authRoutes qui comprenait toutes les routes liées à l'authentification. Ce module
       a été mis en place dans mon application Express avec le préfixe /auth. Cela
       signifie que toutes les routes définies dans authRoutes étaient préfixées par
       /auth.
       Création de l'utilisateur (Inscription) : J'ai configuré une route POST
       /auth/register qui a été employée pour l'inscription de nouveaux utilisateurs.
       L'ensemble des logiques associées à la gestion de cette route a été intégré dans
       le contrôleur dédié à cette route. (voir Annexe 12)
       Connexion de l'utilisateur (Login) : J'ai également mis en place une route POST
       /auth/login pour la connexion des utilisateurs existants. La logique nécessaire
       pour vérifier les identifiants de l'utilisateur et gérer sa session a été définie dans
       le contrôleur de cette route. (voir Annexe 13)
       Serveur de fichiers statiques : J'ai configuré mon serveur pour servir des fichiers
       statiques à partir du répertoire spécifié. Cela signifie que lorsque la requête du
       client correspond à un fichier existant dans ce répertoire, celui-ci est
       automatiquement renvoyé au client.
       Configuration d'une route catch-all pour servir l'index.html : Enfin, une route
       catch-all est mise en place qui renvoie le fichier index.html pour toutes les autres
       routes qui n’auraient pas été définies précédemment.


Chaque contrôleur est en charge de l'exécution d'une logique spécifique pour répondre
à la requête du client. Par exemple, lors de l'inscription d'un nouvel utilisateur, le
contrôleur de cette route est responsable de la validation des données envoyées par
l'utilisateur, de la création de l'utilisateur dans la base de données, et de l'envoi de la
réponse appropriée au client.



                     5.2.6   Création des middlewares

Au cours du processus de développement, j'ai créé plusieurs middlewares pour gérer
différentes tâches dans l'application.


19/12/2024                                                                                35
ML-Explorer                                                                   Edouard Halimi


Middleware d'authentification : J'ai mis en place un middleware d'authentification. Ce
middleware a été utilisé pour vérifier si un utilisateur était authentifié avant de lui
permettre d'accéder à certaines routes. Si l'utilisateur était authentifié, la requête
passait au prochain middleware ou au contrôleur de route. Sinon, une réponse avec un
code d'erreur approprié était envoyée.
Middleware de gestion des erreurs : J'ai également créé un middleware de gestion des
erreurs. Ce middleware a été utilisé pour attraper toutes les erreurs qui étaient lancées
dans l'application. Il a généré une réponse avec le bon code d'erreur et le message
d'erreur, répondant ainsi à la requête qui avait causé l'erreur.
Middleware de journalisation : J'ai mis en place un middleware de journalisation. Ce
middleware a été utilisé pour enregistrer les détails de chaque requête reçue par
l'application. Il a facilité le débogage et a permis de garder une trace de l'activité de
l'application.
Middleware de traitement des fichiers : J'ai défini un middleware pour le traitement des
fichiers. Avec ce middleware, j'ai géré le téléchargement de fichiers par les utilisateurs,
les enregistrant dans un répertoire spécifié et ajoutant des informations sur le fichier à
la requête pour un traitement ultérieur.
Pour chaque middleware, j'ai utilisé la fonction app.use() pour l'ajouter à la pile de
middlewares de l'application. Chaque requête entrante devait passer par cette pile de
middlewares dans l'ordre dans lequel ils ont été ajoutés.

                      5.2.7 Extraits de code

Dans cette section, je vais décrire quelques extraits de code essentiels que j’ai écrit pour
construire l’API.
Middleware d’authentification : J’ai créé un middleware pour vérifier la présence et la
validité d’un JWT dans le header d’authentification d’une requête. Cet extrait de code
illustre comment cela a été fait :




19/12/2024                                                                               36
ML-Explorer                                                                  Edouard Halimi




Route d’inscription : Pour créer la route d’inscription, j’ai défini une route POST dans
mon router Express. Cette route a utilisé un contrôleur pour inscrire un utilisateur :




Contrôleur d’inscription : Le contrôleur d’inscription était responsable de la validation
du « username » et « password », de la création d’un nouvel utilisateur et de l’envoi de la
réponse approprié :




19/12/2024                                                                                 37
ML-Explorer                                                                 Edouard Halimi




                     5.2.8 Test de l’API


Endpoints / Requests Utilisateur :


   •   POST api/auth /register : J'ai mis en place cet endpoint pour enregistrer un nouvel
       utilisateur. Les données d'entrée sont le nom d'utilisateur, l'email et le mot de
       passe en format JSON. La sortie sera un message de succès ou d'échec, ainsi que
       les détails de l'utilisateur en cas de succès.
   •   GET api/auth/login : Cet endpoint est utilisé pour connecter un utilisateur
       existant. Il accepte l'e-mail et le mot de passe en tant que données d'entrée au
       format JSON. En cas de succès, il renvoie un token d'authentification.
   •   PUT api/auth/profile : Cet endpoint permet à l’utilisateur authentifié, de modifier
       ces informations de profil. Il n'a pas besoin de données d'entrée car il utilise le
       token d'authentification dans l'en-tête de la requête. Il renvoie les détails de
       l'utilisateur modifiés
   •   DELETE /api/users/:id : J'ai conçu cet endpoint pour la suppression des profils
       utilisateur. Il nécessite l'ID de l'utilisateur comme paramètre dans l'URL. En
       retour, il émet un message de succès lorsque la suppression est effectuée. À
       noter que seul un utilisateur authentifié peut initier la suppression de son propre
       profil. En revanche, la suppression de profils d'autres utilisateurs ne peut être
       effectuée que par un administrateur.




19/12/2024                                                                             38
ML-Explorer                                                                     Edouard Halimi


Pour tester l'API de l'application, j'ai utilisé Postman, qui est un outil formidable qui
simplifie le processus de test des API. Voici comment j'ai procédé :
       Test de la route d'inscription : J'ai commencé par tester la route d'inscription de
       l'API (POST /auth/register). Dans Postman, j'ai défini la méthode de requête sur
       POST, j'ai entré l'URL complète de la route d'inscription, et dans le corps de la
       requête, j'ai ajouté un objet JSON avec un "username" et un "password" (voir
       annexe 14). Lorsque j'ai envoyé la requête, j'ai reçu en réponse un nouvel objet
       utilisateur, ce qui m'a indiqué que la route d'inscription fonctionnait
       correctement.
       Test de la route de connexion : Ensuite, j'ai testé la route de connexion (POST
       /auth/login). De la même manière, j'ai défini la méthode sur POST, j'ai entré l'URL
       de la connexion, et dans le corps de la requête, j'ai utilisé les mêmes identifiants
       que j'avais utilisés pour l'inscription. En réponse à cette requête, j'ai reçu un objet
       JWT (JSON Web Token) qui m'a indiqué que la connexion était un succès.
       Test des routes authentifiées : Après avoir réussi à me connecter, j'ai utilisé le
       JWT pour tester les routes qui nécessitaient une authentification. J'ai ajouté le
       JWT à l'en-tête 'Authorization' de mes requêtes vers les routes authentifiées. En
       réponse, j'ai reçu les données attendues, ce qui m'a confirmé que
       l'authentification fonctionnait correctement.
       Test des erreurs : J'ai également testé le comportement de l'API lors de l'envoi de
       requêtes incorrectes ou malformées. Par exemple, pour la route d'inscription, j'ai
       essayé d'envoyer une requête sans "username" ni "password", et en réponse, j'ai
       reçu une erreur appropriée.
L'utilisation de Postman a grandement facilité le processus de test, me permettant de
me concentrer sur le développement et l'amélioration de l'API.



              5.3   Présentation d’éléments de sécurité de l’application

                       5.3.1 Utilisation de variable d’environnement

En développant l'API, j'ai constaté qu'il était nécessaire d'utiliser des variables
d'environnement pour stocker les informations sensibles, telles que les chaînes de
connexion à la base de données et les secrets de l'authentification JWT. Pour ce faire, j'ai
utilisé le package dotenv.
Initialisation de dotenv : Pour utiliser dotenv, je l'ai d'abord installé via npm, puis je l'ai
importé et initialisé dans mon fichier principal (server.js). Voici comment l'initialisation
a été effectuée :


19/12/2024                                                                                  39
ML-Explorer                                                                  Edouard Halimi




Définition des variables dans .env : J'ai créé un fichier .env dans la racine du projet et
défini mes variables d'environnement dans ce fichier. Par exemple, j'ai défini la chaîne
de connexion à la base de données :




{exemple d’une variable de connexion à mongoDB et d’un token JWT}
Utilisation des variables d'environnement : Ensuite, j'ai utilisé ces variables dans
mon code en les appelant via l'objet process.env. Par exemple :




Sécurité : Il est crucial de ne pas commettre le fichier .env dans le dépôt git pour
empêcher la fuite d'informations sensibles. Pour ce faire, j'ai ajouté .env dans mon
fichier .gitignore. :




L'utilisation de dotenv et des variables d'environnement a permis de maintenir les
informations sensibles en dehors du code source, ce qui renforce la sécurité et la
flexibilité du projet.




19/12/2024                                                                               40
ML-Explorer                                                                   Edouard Halimi


                     5.3.2 Configuration CORS

La configuration de CORS (Cross-Origin Resource Sharing) est une pratique essentielle
pour contrôler comment les ressources de notre serveur peuvent être accessibles à
partir de différents domaines. Cela est d'autant plus important lorsqu'il s'agit d'un
serveur d'API REST, où les requêtes peuvent venir de différentes origines.
J'utilise le module cors de npm pour configurer CORS dans mon application Express.
Voici le processus que j'ai suivi :
  Installation du module CORS : J'ai commencé par installer le middleware cors via
npm comme suit : npm install cors.
   Importation et utilisation du middleware : J'ai ensuite importé le middleware cors
   dans mon fichier server.js et je l'ai ajouté à l'application Express comme suit :




                     5.3.3 Sécurités lors de la création d’un compte utilisateur

Lors de la création de comptes utilisateurs, j'ai mis en place plusieurs mesures pour
garantir la sécurité des données de l'utilisateur.
Hashage du mot de passe : Lors de la création du compte, j'ai veillé à ce que le mot de
passe fourni par l'utilisateur soit hashé avant d'être stocké en base de données. Pour
cela, j'ai utilisé la bibliothèque bcryptjs.
Voici un exemple de la manière dont j'ai procédé :




19/12/2024                                                                               41
ML-Explorer                                                                  Edouard Halimi




                     5.3.4 Authentification via Json Web Token (JWT)


Dans mon projet ML Explorer, j'ai mis en place le processus d'authentification via Json
Web Token (JWT). Voici je l'ai fait :
Création d'un token JWT : Lorsqu'un utilisateur s'authentifie avec succès (après avoir
vérifié son nom d'utilisateur et son mot de passe), j'ai créé un token JWT. Pour cela, j'ai
utilisé le package jsonwebtoken. Voici un exemple :




19/12/2024                                                                              42
ML-Explorer                                                                      Edouard Halimi




Dans cet exemple, process.env.JWT_SECRET est le secret utilisé pour signer le token et
process.env.JWT_EXPIRES_IN est la durée de validité du token.
Envoi du token à l'utilisateur : Une fois le token créé, je l'ai envoyé à l'utilisateur. Il sera
stocké côté client et envoyé avec chaque requête nécessitant une authentification.
Vérification du token : Pour les routes nécessitant une authentification, un middleware
vérifie si le token envoyé dans les headers de la requête. Si le token est valide, l'utilisateur
est authentifié et la requête peut continuer. Si le token n'est pas valide (par exemple, s'il
est expiré), une erreur est renvoyée.




              5.4   Présentation des tests

J’ai porté une attention particulière à tester les éléments de sécurité. J'ai utilisé pour cela
jest, un cadre de tests populaire pour JavaScript.
Tests d'authentification : J'ai écrit des tests pour vérifier le bon fonctionnement de
l'authentification des utilisateurs. Cela comprenait des tests pour s'assurer qu'un token
valide était bien délivré lors de l'enregistrement d'un nouvel utilisateur et lors de la
connexion d'un utilisateur existant.



19/12/2024                                                                                   43
ML-Explorer                                                               Edouard Halimi


Tests des routes sécurisées : J'ai vérifié que seuls les utilisateurs authentifiés
pouvaient accéder aux routes sécurisées. J'ai fait cela en envoyant des requêtes à ces
routes sans token JWT, et j'ai vérifié que ces requêtes échouaient.
Tests de hashage du mot de passe : J'ai écrit des tests pour confirmer que les mots de
passe étaient correctement hashés avant d'être stockés dans la base de données.
En somme, tester les éléments de sécurité a été un aspect essentiel de mon travail pour
m'assurer que les informations des utilisateurs étaient bien protégées. Cette série de
tests a permis de garantir que le système d'authentification fonctionne correctement et
respecte les standards de sécurité modernes.
Voici un tableau qui récapitule l’ensemble de ces tests :




19/12/2024                                                                           44
ML-Explorer                                                                  Edouard Halimi


              5.5   Description de la veille, vulnérabilités de sécurité

Dans le cadre de mon projet, la surveillance constante des problèmes et des
vulnérabilités de sécurité a été une partie importante de mes responsabilités. J'ai donc
procédé ainsi :
J'ai commencé par m'abonner aux bulletins de sécurité pour les technologies que j'ai
utilisées dans mon projet, notamment Node.js, Express et les packages NPM tels que
jsonwebtoken, bcryptjs. Ces bulletins ont souvent été ma première source d'information
sur les nouvelles vulnérabilités détectées et les correctifs disponibles.
En outre, j'ai utilisé des outils d'analyse de sécurité statique sur mon code pour détecter
les vulnérabilités potentielles. J'ai notamment utilisé eslint-plugin-security, un plugin
ESLint qui analyse le code à la recherche de motifs connus pour présenter des risques
de sécurité.
J'ai également effectué des audits de sécurité réguliers sur mes dépendances NPM à
l'aide de la commande npm audit. Cette commande vérifie les dépendances par rapport
à une base de données de vulnérabilités connues et propose des corrections lorsque
c'est possible.
De plus, j'ai cherché activement à comprendre les meilleures pratiques de sécurité et je
me suis efforcé de les implémenter dans mon projet. Par exemple, j'ai pris soin de
toujours hasher les mots de passe avant de les stocker et de valider et d'assainir les
entrées utilisateur pour prévenir les attaques d'injection.
Enfin, j'ai fait un effort pour rester au courant des dernières nouvelles et des dernières
recherches en matière de sécurité, en lisant régulièrement des blogs et des articles sur
le sujet. J'ai trouvé cela essentiel pour comprendre l'évolution constante du paysage de
la sécurité et pour m'assurer que mon application reste aussi sécurisée que possible
face aux menaces émergentes.
En résumé, la veille en matière de sécurité a été une activité continue tout au long de
mon projet. Elle m'a aidé à anticiper et à réagir rapidement aux vulnérabilités, en
assurant la sécurité de mon application et la protection des données de mes utilisateurs.



6 Conclusion

Pour conclure, la réalisation de ce projet a été une expérience incroyablement
enrichissante pour moi. J'ai pu développer mes compétences en programmation
JavaScript, tout en me familiarisant avec des outils et des cadres de travail tels que
Node.js, Express, et React. J'ai eu la possibilité d'approfondir ma compréhension des

19/12/2024                                                                              45
ML-Explorer                                                                   Edouard Halimi


systèmes de gestion de bases de données avec MongoDB et Mongoose, et j'ai également
acquis une expérience précieuse dans la manipulation des API REST.
La création d'un système d'authentification sûr à l'aide de JWT m'a permis de
comprendre en détail comment fonctionne l'authentification et la sécurité dans les
applications modernes. L'écriture de tests solides pour l'application était un défi
intéressant, et j'ai rapidement réalisé la valeur de ces tests pour maintenir la qualité du
code tout en ajoutant de nouvelles fonctionnalités.
Finalement, la surveillance continue des problèmes et des vulnérabilités de sécurité m'a
donné une bonne idée de l'importance de la sécurité dans le développement
d'applications et du rôle essentiel que joue la veille en matière de sécurité pour rester au
courant des menaces émergentes.
Dans l'ensemble, j'estime que ce projet a considérablement renforcé mes compétences
en développement full stack et en sécurité de l'information. Je suis impatient d'appliquer
ces compétences acquises à de futurs projets.




19/12/2024                                                                               46
ML-Explorer     Edouard Halimi



7 Annexes

Annexe 1 :
DataTable.jsx




19/12/2024                 47
ML-Explorer   Edouard Halimi




19/12/2024               48
ML-Explorer   Edouard Halimi




19/12/2024               49
ML-Explorer       Edouard Halimi


Annexe 2:


DataDisplay.jsx




19/12/2024                   50
ML-Explorer    Edouard Halimi


Annexe3:
DataCard.jsx




19/12/2024                51
ML-Explorer      Edouard Halimi


Annexe 4:
Model Card.jsx




19/12/2024                  52
ML-Explorer   Edouard Halimi




19/12/2024               53
ML-Explorer   Edouard Halimi


Annexe 5:
Predict.jsx




19/12/2024               54
ML-Explorer        Edouard Halimi




Annexe 6:
ResulDetails.jsx




19/12/2024                    55
ML-Explorer       Edouard Halimi


Annexe 7 :
ResultTable.jsx




19/12/2024                   56
ML-Explorer   Edouard Halimi




19/12/2024               57
ML-Explorer     Edouard Halimi


Annexe 8 :
SaveModel.jsx




19/12/2024                 58
ML-Explorer   Edouard Halimi




19/12/2024               59
ML-Explorer         Edouard Halimi


Annexe 9:
SelectDataset.jsx




19/12/2024                     60
ML-Explorer   Edouard Halimi




19/12/2024               61
ML-Explorer      Edouard Halimi


Annexe 10:
TrainModel.jsx




19/12/2024                  62
ML-Explorer   Edouard Halimi




19/12/2024               63
ML-Explorer   Edouard Halimi


Annexe 11:
Server.js




19/12/2024               64
ML-Explorer   Edouard Halimi




19/12/2024               65
ML-Explorer   Edouard Halimi


Annexe 12:
Register.js




19/12/2024               66
ML-Explorer   Edouard Halimi


Annexe 13:
Login.js




19/12/2024               67
ML-Explorer                       Edouard Halimi


Annexe 14:
Test registration avec POSTMAN:




Annexe 15
Tableau de bord AWS




19/12/2024                                   68
ML-Explorer                                   Edouard Halimi


Annexe 16:
Carte Trello “Documentation et Ressources »




19/12/2024                                               69
ML-Explorer                                  Edouard Halimi


Annexe 17 :
Carte Trello « Maquette de l’Application »




19/12/2024                                              70
ML-Explorer                            Edouard Halimi


Annexe 18
Carte Trello « Réalisation du Code »




19/12/2024                                        71
ML-Explorer   Edouard Halimi




19/12/2024               72
```
````
