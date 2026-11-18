/*!
 * Copyright 2026, MHP Management und IT-Beratung GmbH and contributors.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Die Hilfe des Fensters „Dateien auswählen“. Tasten und den Satz zu
 * „Übernehmen“ ergänzt der Rahmen selbst. Nachgeladen mit dem Editor: im
 * Seitenbündel, das jede Leserin lädt, hätte der Text nichts verloren.
 */

import * as React from "react";

export function FileGalleryHelp(): React.ReactElement {
  return (
    <ul className="flex list-disc flex-col gap-2 pl-5">
      <li>
        Links die <strong>Quelle</strong> wählen: eine Sammlung aus dem Datei-Manager (Studio → Dateien) oder{" "}
        <strong>Alle Dateien</strong>. Die Suche darüber findet Sammlungen nach Name.
      </li>
      <li>
        <strong>Alle Dateien</strong> zeigt die Dateien aller Sammlungen, die Lesende sehen dürfen. Dateien, die in keiner
        Sammlung liegen, fehlen dann.
      </li>
      <li>
        Der <strong>Filter</strong> prüft Dateiname, Dateiendung (z. B. pdf) oder „Hochgeladen von“, ohne auf Groß- und
        Kleinschreibung zu achten. Ein leerer Wert filtert nicht. Mit <strong>Regex</strong> etwa{" "}
        <code>^2026-\d\d_PIM_</code> oder <code>Bericht|Protokoll</code>.
      </li>
      <li>
        Erst wird gefiltert, dann sortiert, dann begrenzt: „Neueste zuerst“ mit <strong>Höchstens</strong> 5 zeigt die fünf
        neuesten Treffer. 0 zeigt alle.
      </li>
      <li>
        <strong>Kacheln</strong> zeigen das Vorschaubild oben, die <strong>Liste</strong> links neben Name und Größe.
      </li>
      <li>In Desktop, Tablet und Mobil stehen die Einstellungen rechts neben der Vorschau mit den echten Dateien.</li>
      <li>Fehlt eine Sammlung in der Liste, lässt sich ihre ID unter „Sammlungs-ID von Hand eintragen“ einfügen.</li>
    </ul>
  );
}
