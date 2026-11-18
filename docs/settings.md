# Einstellungen

Alles wird im Fenster **Dateien auswählen** gepflegt. Es öffnet sich mit dem
Einstellungsdialog; im Dialog selbst steht nur der Knopf, der es wieder
öffnet.

| Einstellung | Beschreibung |
| --- | --- |
| Quelle (Liste links) | **Alle Dateien** (Voreinstellung) zeigt die Dateien **aller Sammlungen**, die Lesende sehen dürfen. Dateien, die in keiner Sammlung liegen, erscheinen dann nicht. Eine **Sammlung** aus dem Datei-Manager (Studio → Dateien) zeigt nur deren Dateien. Das Suchfeld darüber findet Sammlungen nach Name. Die gewählte Quelle steht in der Mitte als Überschrift. |
| Sortierung | Neueste zuerst (Voreinstellung), Älteste zuerst, Name A–Z, Name Z–A, Größte zuerst, Kleinste zuerst. |
| Filtern nach | Worauf der Filter wirkt: **Dateiname** (Voreinstellung), **Dateiendung** (z. B. `pdf`) oder **Hochgeladen von**. |
| Bedingung | **enthält** (Voreinstellung), **enthält nicht**, **beginnt mit**, **endet mit**, **ist gleich** oder **Regex** (regulärer Ausdruck). Groß-/Kleinschreibung spielt keine Rolle. |
| Wert | Der Wert zur Bedingung. Leer = kein Filter. |
| Anordnung | **Kacheln**: Vorschaubild oben, Details darunter (Voreinstellung). **Liste**: Vorschaubild links, Details rechts. |
| Höchstens | Wie viele Dateien höchstens erscheinen. `0` (Voreinstellung) zeigt alle. |
| Sammlungs-ID von Hand eintragen | Nur nötig, wenn eine Sammlung in der Liste fehlt oder die Liste nicht lädt: die 24-stellige ID oder die Adresse der Sammlung einfügen. Zugeklappt unter dem Formular. |

Die Schritte laufen in dieser Reihenfolge: erst **Filter**, dann
**Sortierung**, dann **Höchstens**. „Neueste zuerst“ mit 5 zeigt also die fünf
neuesten Dateien, die zum Filter passen.

Beispiele für reguläre Ausdrücke im Dateinamen: `^2026-\d\d_PIM_` (beginnt
mit 2026, Monat, `_PIM_`) oder `Bericht|Protokoll` (eines von beiden).

## Hinweise

- Ein ungültiger regulärer Ausdruck lässt sich nicht übernehmen. Die
  Statuszeile oben und das Feld **Wert** nennen den Fehler.
- **Übernehmen** schreibt in den Einstellungsdialog; gesichert wird erst mit
  dessen **Speichern**.
- Desktop, Tablet und Mobil zeigen die Galerie so, wie die Seite sie zeigt,
  mit den echten Dateien der Quelle. Die Einstellungen stehen dort rechts in
  den Reitern **Filter & Reihenfolge** und **Darstellung**.
- Rückgängig und Wiederholen stehen oben im Fenster (⌘/Strg Z bzw. ⇧⌘/Strg Z).
- Seit dieser Fassung steht die ganze Einstellung in einem Feld
  (`file-gallery-config`). Galerien aus älteren Fassungen zeigen unverändert,
  was sie bisher zeigten. Beim ersten Öffnen übernimmt das Fenster die alten
  Werte, soweit der Dialog sie lesbar führt. Im Content Designer sind die
  alten Auswahlfelder (Sortierung, Filtern nach, Bedingung, Anordnung) nicht
  lesbar: das Fenster zeigt dort die Voreinstellung, und an der Seite gilt
  der alte Wert weiter, bis er im Fenster geändert wird.
