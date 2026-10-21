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

import { UiSchema } from "@rjsf/utils";
import { JSONSchema7 } from "json-schema";

/**
 * Schema-Schlüssel, beim Host angemeldetes Attribut und Eintrag in
 * `widgets.json` müssen gleich heißen: der Host speichert unter dem
 * Schlüssel und verwirft Attribute, die er nicht kennt.
 */
export const COLLECTION_ID_ATTRIBUTE = "collection-id";
export const MAX_ITEMS_ATTRIBUTE = "max-items";
export const LAYOUT_ATTRIBUTE = "layout";
export const FILTER_ATTRIBUTE = "filter";

/**
 * @see https://rjsf-team.github.io/react-jsonschema-form/docs/
 */
export const configurationSchema: JSONSchema7 = {
  properties: {
    [COLLECTION_ID_ATTRIBUTE]: {
      type: "string",
      title: "Collection",
    },
    [LAYOUT_ATTRIBUTE]: {
      type: "string",
      title: "Darstellung",
      default: "box",
      oneOf: [
        { const: "box", title: "Box: Bild oben, Details darunter" },
        { const: "list", title: "Liste: Bild links, Details rechts" },
      ],
    },
    [FILTER_ATTRIBUTE]: {
      type: "string",
      title: "Filter (regulärer Ausdruck)",
    },
    [MAX_ITEMS_ATTRIBUTE]: {
      type: "number",
      title: "Höchstens anzeigen",
      minimum: 0,
      default: 0,
    },
  },
};

/**
 * @see https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/uiSchema
 */
export const uiSchema: UiSchema = {
  [COLLECTION_ID_ATTRIBUTE]: {
    "ui:help":
      "Die Collection aus dem Datei-Manager wählen, deren Dateien angezeigt werden. Fehlt sie in der Liste, " +
      "„Andere Collection-ID eingeben …“ wählen und die 24-stellige ID eintragen.",
  },
  [FILTER_ATTRIBUTE]: {
    "ui:help":
      "Zeigt nur Dateien, deren Dateiname zum regulären Ausdruck passt, ohne Beachtung der Groß-/Kleinschreibung. " +
      "Beispiele: „\\.pdf$“ nur PDFs, „^2026“ Namen mit 2026 am Anfang, „Bericht|Protokoll“ eins von beiden. Leer lassen für alle Dateien.",
  },
  [MAX_ITEMS_ATTRIBUTE]: {
    "ui:help": "0 zeigt alle Dateien der Collection.",
  },
};
