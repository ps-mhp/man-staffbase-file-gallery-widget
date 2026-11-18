# Paramètres

Tout est géré dans la fenêtre **Sélectionner les fichiers**. Elle s'ouvre via la
boîte de dialogue des paramètres ; dans la boîte de dialogue elle-même, seul le bouton permettant de la
rouvrir est présent.

| Paramètre | Description |
| --- | --- |
| Source (liste de gauche) | **Tous les fichiers** (par défaut) affiche les fichiers de **toutes les collections** auxquels les lecteurs ont accès. Les fichiers qui ne font partie d’aucune collection n’apparaissent alors pas. Une **collection** issue du gestionnaire de fichiers (Studio → Fichiers) n’affiche que ses propres fichiers. Le champ de recherche situé au-dessus permet de rechercher des collections par nom. La source sélectionnée apparaît au centre sous forme d’en-tête. |
| Tri | Les plus récents en premier (par défaut), Les plus anciens en premier, Nom A–Z, Nom Z–A, Les plus volumineux en premier, Les plus petits en premier. |
| Filtrer par | Éléments sur lesquels s'applique le filtre : **nom de fichier** (par défaut), **extension de fichier** (par ex. `pdf`) ou **téléchargé par**. |
| Condition | **contient** (par défaut), **ne contient pas**, **commence par**, **se termine par**, **est égal à** ou **Regex** (expression régulière). La distinction entre majuscules et minuscules n’a pas d’importance. |
| Valeur | La valeur correspondant à la condition. Vide = aucun filtre. |
| Disposition | **Vignettes** : vignette en haut, détails en dessous (par défaut). **Liste** : vignette à gauche, détails à droite. |
| Nombre maximal | Nombre maximal de fichiers affichés. `0` (par défaut) affiche tous les fichiers. |
| Saisir manuellement l’ID de la collection | Nécessaire uniquement si une collection manque dans la liste ou si la liste ne se charge pas : saisir l’ID à 24 chiffres ou l’adresse de la collection. Masqué sous le formulaire. |

Les étapes s’enchaînent dans cet ordre : d’abord **Filtre**, puis
**Tri**, puis **Nombre maximal**. « Les plus récents en premier » avec 5 affiche donc les cinq
fichiers les plus récents correspondant au filtre.

Exemples d’expressions régulières dans le nom de fichier : `^2026-\d\d_PIM_` (commence
par 2026, le mois, `_PIM_`) ou `Rapport|Procès-verbal` (l’un ou l’autre).

## Remarques

- Une expression régulière non valide ne peut pas être appliquée. La
  barre d’état en haut et le champ **Valeur** indiquent l’erreur.
- **Appliquer** enregistre les modifications dans la boîte de dialogue des paramètres ; celles-ci ne sont validées qu’en
  cliquant sur **Enregistrer**.
- Sur ordinateur de bureau, tablette et mobile, la galerie s’affiche telle qu’elle apparaît sur la page,
  avec les fichiers réels de la source. Les paramètres se trouvent à droite dans
  les onglets **Filtre & Ordre** et **Affichage**.
- Les commandes **Annuler** et **Rétablir** se trouvent en haut de la fenêtre (⌘/Ctrl Z et ⇧⌘/Ctrl Z).
- Depuis cette version, l’ensemble des paramètres est regroupé dans un seul champ
  (`file-gallery-config`). Les galeries issues de versions antérieures s’affichent sans changement,
  comme auparavant. Lors de la première ouverture, la fenêtre reprend les anciennes
  valeurs, dans la mesure où la boîte de dialogue les affiche de manière lisible. Dans le Content Designer, les
  anciens champs de sélection (tri, filtrage par, condition, disposition) ne sont pas
  lisibles : la fenêtre y affiche le paramètre par défaut, et sur le côté,
  l'ancienne valeur reste valable jusqu’à ce qu’elle soit modifiée dans la fenêtre.
