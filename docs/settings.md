# Einstellungen

| Einstellung | Beschreibung |
| --- | --- |
| Collection (optional) | Die Collection aus dem Datei-Manager, deren Dateien angezeigt werden. Leer = die Dateien **aller Collections**, die Lesende sehen dürfen. Dateien, die in keiner Collection liegen, erscheinen dann nicht. |
| Reihenfolge | Neueste zuerst (voreingestellt), Älteste zuerst, Name A–Z, Name Z–A, Größte zuerst, Kleinste zuerst. |
| Filter: Feld | Worauf der Filter wirkt: **Dateiname**, **Dateiendung** (z. B. `pdf`) oder **Hochgeladen von**. |
| Filter: Bedingung | **Enthält**, **Enthält nicht**, **Beginnt mit**, **Endet mit**, **Ist gleich** oder **Passt auf regulären Ausdruck**. Groß-/Kleinschreibung spielt keine Rolle. |
| Filter: Wert | Der Wert zur Bedingung. Leer = kein Filter. |
| Darstellung | **Box**: Vorschaubild oben, Details darunter (voreingestellt). **Liste**: Vorschaubild links, Details rechts. |
| Höchstens anzeigen | Wie viele Dateien höchstens erscheinen. `0` (voreingestellt) zeigt alle. |

Die Schritte laufen in dieser Reihenfolge: erst **Filter**, dann **Reihenfolge**,
dann **Höchstens anzeigen**. „Neueste zuerst“ mit 5 zeigt also die fünf
neuesten Dateien, die zum Filter passen.

Beispiele für reguläre Ausdrücke im Dateinamen: `^2026-\d\d_PIM_` (beginnt
mit 2026, Monat, `_PIM_`) oder `Bericht|Protokoll` (eines von beiden).
