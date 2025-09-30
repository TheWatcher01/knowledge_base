# QA checklist — Notes / Files / URLs permissions

This checklist covers manual scenarios to validate role-based permissions using the
seeded fixtures (admin@test.local, editor@test.local, viewer@test.local).

> Pré-requis :
> - Docker services et `pnpm --filter web dev` lancés
> - Fixtures importées via `pnpm --filter web run seed:authz-fixtures`
> - Sessions de navigateur séparées ou navigation privée pour chaque rôle
>
> Conseils généraux : gardez la console et l'onglet Réseau ouverts (F12) et
> filtrez sur les requêtes `notes`, `files` ou `urls` pour repérer les 401/403.

## Admin (admin@test.local)
- [ ] Authentification : connexion réussie, redirection vers le tableau de bord.
- [ ] Accès Notes : création, édition, suppression d'une note → requêtes `POST /api/notebook` et `PATCH/DELETE /api/notebook/[id]` renvoient 200 ; toast de confirmation.
- [ ] Accès Fichiers : upload d'un fichier texte → `POST /api/files` 201, vérification de l'entrée dans la liste.
- [ ] Accès URLs : ajout d'une URL → `POST /api/urls` 201, état affiché (queued/synced) ; messages d'ingestion affichés si erreur.
- [ ] Gestion utilisateurs : accès à `/admin` (ou section dédiée) autorisé, création/suppression/modification d'utilisateurs renvoie 2xx.
- [ ] Vérifier logs console : aucune erreur non maîtrisée, warnings ingestion acceptables.

## Editor (editor@test.local)
- [ ] Authentification : connexion OK, accès à son knowledge base.
- [ ] Notes : création, édition, suppression OK ; UI affiche erreurs si payload invalide (laisser titre vide pour voir message).
- [ ] Fichiers : upload autorisé ; vérifier qu'un Viewer ne peut pas être sélectionné dans le rôle (s'il existe une UI partagée).
- [ ] URLs : création déclenche ingestion → surveiller messages informatifs (queued/disabled) dans la bannière.
- [ ] Limitation admin : absence de menu Admin ou accès renvoie 403/redirect login.

## Viewer (viewer@test.local)
- [ ] Authentification : connexion OK ; interface en lecture seule.
- [ ] Notes : boutons de création/édition désactivés, message `viewOnlyMessage` visible ; toute tentative manuelle de POST (via devtools) doit renvoyer 403.
- [ ] Fichiers : champ de dépôt désactivé ; interception d'un `POST /api/files` manuel renvoie 403.
- [ ] URLs : formulaire désactivé ; tentative de POST via console renvoie 403.
- [ ] Navigation : aucune action n'affiche de toast d'erreur non gérée ; la vue liste se charge (GET 200).

## Regression / smoke
- [ ] Déconnexion : bouton logout fonctionne pour chaque rôle, redirection vers page login.
- [ ] Localisation : changer le locale via l'UI conserve les restrictions de rôle.
- [ ] Session expirée : (optionnel) supprimer le cookie dans devtools puis rafraîchir → redirection vers `/login`.

Consignez tout 401/403 inattendu avec : rôle utilisé, endpoint, payload, extrait de log console.
