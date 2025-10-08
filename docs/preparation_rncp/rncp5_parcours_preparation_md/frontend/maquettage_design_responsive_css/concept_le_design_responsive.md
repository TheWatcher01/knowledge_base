# concept le design responsive

> **Source** : `concept_le_design_responsive.pdf`  
> **Converti** : 2025-10-08 20:40:06

---

````
07/10/2025 11:33                             Concept: Le design responsive | Holberton Toulouse, France Intranet


         (/)

     Curriculum
     [C#24] RNCP 5 - Parcours de préparation 
     Average: %                                           



    Le design responsive

    Le design responsive
    Le design responsive est une approche de conception web qui permet aux sites et applications de s'adapter
    automatiquement à différentes tailles d'écrans (ordinateurs, tablettes, mobiles).




    Avantages :
            Meilleure expérience utilisateur : Adaptation fluide du contenu selon la taille de l'écran.
            SEO amélioré : Google favorise les sites compatibles avec les mobiles dans son classement.
            Coût de maintenance réduit : Un seul site au lieu de versions séparées pour mobile et bureau.




    Cas d'utilisation :

            Pour tout site ou application qui doit être consulté sur différents appareils (mobile, tablette, desktop,
            écran géant).




    Comment faire de design responsive ?
            On peut faire de design responsive avec du CSS pur.
            On peut aussi créer des design responsive avec des librairies et des frameworks CSS comme
            Bootstrap, Bulma CSS, Material UI, Tailwind etc…




    Application de design responsive avec du CSS
    pur :

         1. Media queries : Utiliser @media pour adapter le style en fonction de la largeur de l'écran.

https://intranet.hbtn.io/concepts/1242                                                                                  1/2
07/10/2025 11:33                                Concept: Le design responsive | Holberton Toulouse, France Intranet

          @media (max-width: 768px) {
         (/)
               body {
                 font-size: 14px;
               }
           }


         1. En utilisant Flexbox ou Grid de CSS




    Application de design responsive Bootstrap

               Bootstrap fournit des classes prédéfinies pour le responsive. Par exemple :

                     Grille responsive : Utiliser des classes comme .col-sm-6, .col-md-4 pour ajuster la largeur des
                     colonnes selon la taille de l'écran. <div class="row"> <div class="col-sm-6 col-md-
                     4">Content</div> <div class="col-sm-6 col-md-4">Content</div> </div>




    Application de design responsive avec Tailwind

               Tailwind offre une approche utilitaire avec des classes spécifiques pour les tailles d'écrans :

                     Classes de tailles d’écran : Utiliser des préfixes comme sm:, md:, lg: pour changer le style en
                     fonction de l'appareil.
                     Exemple <div class="w-full md:w-1/2 lg:w-1/3">Content</div>
               Centrer et gérer la disposition avec des classes utilitaires comme flex, grid, hidden.




https://intranet.hbtn.io/concepts/1242                                                                                 2/2
```
````
