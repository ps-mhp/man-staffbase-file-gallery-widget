# Settings

Everything is configured in the **Select Files** window. It opens with the
settings dialog; the dialog itself contains only the button that reopens
it.

| Setting | Description |
| --- | --- |
| Source (list on the left) | **All Files** (default) shows the files from **all collections** that readers are allowed to view. Files that are not part of any collection will not appear. A **collection** from the File Manager (Studio → Files) displays only its files. The search field above it finds collections by name. The selected source is displayed in the center as a heading. |
| Sorting | Newest first (default), Oldest first, Name A–Z, Name Z–A, Largest first, Smallest first. |
| Filter by | What the filter applies to: **File name** (default), **File extension** (e.g., `pdf`), or **Uploaded by**. |
| Condition | **contains** (default), **does not contain**, **starts with**, **ends with**, **is equal to**, or **Regex** (regular expression). Case-insensitive. |
| Value | The value for the condition. Blank = no filter. |
| Layout | **Tiles**: Preview image at the top, details below (default). **List**: Preview image on the left, details on the right. |
| Maximum | The maximum number of files to display. `0` (default) shows all. |
| Enter Collection ID Manually | Only necessary if a collection is missing from the list or the list fails to load: enter the 24-digit ID or the collection’s address. Collapsed below the form. |

The steps run in this order: first **Filter**, then
**Sorting**, then **Maximum**. “Newest first” set to 5 therefore shows the five
newest files that match the filter.

Examples of regular expressions in filenames: `^2026-\d\d_PIM_` (starts
with 2026, month, `_PIM_`) or `Report|Minutes` (either one).

## Notes

- An invalid regular expression cannot be applied. The
  status bar at the top and the **Value** field indicate the error.
- **Apply** enters the value into the settings dialog; it is not saved until
  you click **Save** there.
- Desktop, tablet, and mobile versions display the gallery exactly as the page shows it,
  using the actual files from the source. The settings are located on the right in
  the **Filter & Order** and **Display** tabs.
- Undo and Redo are located at the top of the window (⌘/Ctrl Z and ⇧⌘/Ctrl Z, respectively).
- Starting with this version, the entire configuration is contained in a single field
  (`file-gallery-config`). Galleries from older versions continue to display
  what they previously showed. When opened for the first time, the window adopts the old
  values, provided the dialog displays them legibly. In the Content Designer, the
  old selection fields (Sort, Filter by, Condition, Arrangement) are not
  readable: the window displays the default setting there, and on the side,
  the old value remains in effect until it is changed in the window.
