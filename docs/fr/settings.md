# Décors

| Cadre | Description |
| --- | --- |
| Collection (optionnelle) | La collection issue du gestionnaire de fichiers dont les fichiers sont affichés. Vide = les fichiers **de toutes les collections** que les lecteurs sont autorisés à voir. Les fichiers qui ne font pas partie d’une collection n’apparaîtront pas. |
| Ordre | Le plus récent en premier (par défaut), le plus ancien en premier, nom A-Z, nom Z-A, le plus grand en premier, le plus petit en premier. |
| Filtre : Champ | Sur quoi fonctionne le filtre : **Nom de fichier**, **Extension de fichier** (par exemple 'pdf') ou **Téléchargé par**. |
| Filtre : Condition | **Contient**, **Ne contient pas**, **Commence par**, **Finit par**, **Égal** ou **Correspond à l’expression régulière**. Insensible à la majuscule. |
| Filtre : Valeur | La valeur de la condition. Blank = pas de filtre. |
| Affichage | **Boîte** : Image d’aperçu en haut, détails ci-dessous (par défaut). **Liste** : Image d’aperçu à gauche, détails à droite. |
| Afficher au maximum | Le nombre maximal de fichiers qui apparaissent. « 0 » (par défaut) les affiche tous. |

Les étapes suivent cet ordre : d’abord **filtrer**, puis **ordre**, 
alors **Montrer au maximum**. Donc « Le plus récent d’abord » avec 5 montre les cinq
Derniers fichiers correspondant au filtre. 

Exemples d’expressions régulières dans le nom du fichier : '^2026-\d\d_PIM_' (débuts
avec le mois 2026, '_PIM_') ou 'Signal| Protocole' (l’un des deux).