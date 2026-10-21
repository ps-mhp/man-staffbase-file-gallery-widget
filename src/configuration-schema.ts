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
export const FILTER_FIELD_ATTRIBUTE = "filter-field";
export const FILTER_OPERATOR_ATTRIBUTE = "filter-operator";
export const SORT_ATTRIBUTE = "sort";

/**
 * @see https://rjsf-team.github.io/react-jsonschema-form/docs/
 */
export const configurationSchema: JSONSchema7 = {
  properties: {
    [COLLECTION_ID_ATTRIBUTE]: {
      type: "string",
      title: "Collection (optional)",
    },
    [SORT_ATTRIBUTE]: {
      type: "string",
      title: "Reihenfolge",
      default: "newest",
      oneOf: [
        { const: "newest", title: "Neueste zuerst" },
        { const: "oldest", title: "Älteste zuerst" },
        { const: "name-asc", title: "Name A–Z" },
        { const: "name-desc", title: "Name Z–A" },
        { const: "size-desc", title: "Größte zuerst" },
        { const: "size-asc", title: "Kleinste zuerst" },
      ],
    },
    [FILTER_FIELD_ATTRIBUTE]: {
      type: "string",
      title: "Filter: Feld",
      default: "fileName",
      oneOf: [
        { const: "fileName", title: "Dateiname" },
        { const: "extension", title: "Dateiendung (z. B. pdf)" },
        { const: "creator", title: "Hochgeladen von" },
      ],
    },
    [FILTER_OPERATOR_ATTRIBUTE]: {
      type: "string",
      title: "Filter: Bedingung",
      default: "contains",
      oneOf: [
        { const: "contains", title: "Enthält" },
        { const: "notContains", title: "Enthält nicht" },
        { const: "startsWith", title: "Beginnt mit" },
        { const: "endsWith", title: "Endet mit" },
        { const: "equals", title: "Ist gleich" },
        { const: "regex", title: "Passt auf regulären Ausdruck" },
      ],
    },
    [FILTER_ATTRIBUTE]: {
      type: "string",
      title: "Filter: Wert",
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
      "Leer lassen, um die Dateien aller Collections zu zeigen, die Lesende sehen dürfen (Dateien ohne Collection fehlen dann). " +
      "Fehlt die gewünschte Collection in der Liste, „Andere Collection-ID eingeben …“ wählen und die 24-stellige ID eintragen.",
  },
  [FILTER_ATTRIBUTE]: {
    "ui:help":
      "Der Wert zur Bedingung, ohne Beachtung der Groß-/Kleinschreibung. Leer lassen für keinen Filter. " +
      "Bei „Passt auf regulären Ausdruck“ z. B. „^2026-\\d\\d_PIM_“ oder „Bericht|Protokoll“.",
  },
  [MAX_ITEMS_ATTRIBUTE]: {
    "ui:help": "Gilt nach Filter und Reihenfolge: „Neueste zuerst“ mit 5 zeigt die fünf neuesten Treffer. 0 zeigt alle.",
  },
};
