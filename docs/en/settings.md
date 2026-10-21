# Settings

| Setting | Description |
| --- | --- |
| Collection (optional) | The collection from the file manager whose files are displayed. Empty = the files **of all collections** that readers are allowed to see. Files that are not in a collection will not appear. |
| Order | Newest first (default), Oldest first, Name A-Z, Name Z-A, Largest first, Smallest first. |
| Filter: Field | What the filter works on: **Filename**, **File extension** (e.g. 'pdf') or **Uploaded by**. |
| Filter: Condition | **Contains**, **Does not contain**, **Starts with**, **Ends with**, **Equals** or **Matches regular expression**. Case-insensitive. |
| Filter: Value | The value for the condition. Blank = no filter. |
| Display | **Box**: Preview image at the top, details below (default). **List**: Preview image on the left, details on the right. |
| Show at most | The maximum number of files that appear. '0' (default) shows all of them. |

The steps run in this order: first **filter**, then **order**, 
then **Show at most**. So "Newest first" with 5 shows the five
latest files that match the filter. 

Examples of regular expressions in the file name: '^2026-\d\d_PIM_' (starts
with 2026, month, '_PIM_') or 'Report| Protocol' (one of the two).