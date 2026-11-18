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

/**
 * Die ganze Konfiguration in einem Feld – siehe `file-gallery-config.ts`.
 * Der Name trägt das Widget: Editoren hängen sich über `root_<Attribut>` ein,
 * ohne das Widget zu kennen.
 */
export const FILE_GALLERY_CONFIG_ATTRIBUTE = "file-gallery-config";
export const COLLECTION_ID_ATTRIBUTE = "collection-id";
export const MAX_ITEMS_ATTRIBUTE = "max-items";
export const LAYOUT_ATTRIBUTE = "layout";
export const FILTER_ATTRIBUTE = "filter";
export const FILTER_FIELD_ATTRIBUTE = "filter-field";
export const FILTER_OPERATOR_ATTRIBUTE = "filter-operator";
export const SORT_ATTRIBUTE = "sort";

/**
 * Die einzelnen Felder bis 0.1.0-rc.7. Sie stehen weiter im Schema, damit der
 * Dialog ihre Werte führt: das Fenster „Dateien auswählen“ übernimmt sie beim
 * ersten Öffnen, und was es nicht lesen kann, gilt am Block weiter. Zu sehen
 * sind sie im eigenen Dialog nicht mehr (`@shared/legacy-fields`).
 */
export const LEGACY_ATTRIBUTES = [
  COLLECTION_ID_ATTRIBUTE,
  MAX_ITEMS_ATTRIBUTE,
  LAYOUT_ATTRIBUTE,
  FILTER_ATTRIBUTE,
  FILTER_FIELD_ATTRIBUTE,
  FILTER_OPERATOR_ATTRIBUTE,
  SORT_ATTRIBUTE,
] as const;

export type LegacyAttribute = (typeof LEGACY_ATTRIBUTES)[number];

/**
 * Zu sehen ist nur `file-gallery-config`: an seine Stelle tritt der Knopf zum
 * Fenster „Dateien auswählen“. Die übrigen Felder sind die der Fassungen bis
 * 0.1.0-rc.7; ihre Optionen braucht `@shared/legacy-fields`, um die Stelle einer
 * Auswahl in ihren Wert zurückzuübersetzen.
 *
 * @see https://rjsf-team.github.io/react-jsonschema-form/docs/
 */
export const configurationSchema: JSONSchema7 = {
  properties: {
    [FILE_GALLERY_CONFIG_ATTRIBUTE]: {
      type: "string",
      title: "Dateigalerie",
      default: "",
    },
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
 * Alle Attribute: das neue zuerst, die alten dahinter in der Reihenfolge, in
 * der sie in `widgets.json` stehen.
 */
export const ALL_ATTRIBUTES: string[] = [FILE_GALLERY_CONFIG_ATTRIBUTE, ...LEGACY_ATTRIBUTES];

/**
 * @see https://rjsf-team.github.io/react-jsonschema-form/docs/api-reference/uiSchema
 */
export const uiSchema: UiSchema = {
  [FILE_GALLERY_CONFIG_ATTRIBUTE]: {
    "ui:help":
      "Quelle, Filter, Sortierung und Darstellung werden im Fenster „Dateien auswählen“ gepflegt; " +
      "das Textfeld dahinter ist die Rohfassung.",
  },
};
