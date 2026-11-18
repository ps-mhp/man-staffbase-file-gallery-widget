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
 * Die ganze Konfiguration der Dateigalerie in einem Attribut:
 * `file-gallery-config`.
 *
 * Bis 0.1.0-rc.7 lag sie auf sieben Feldern des Staffbase-Dialogs. Im
 * Content Designer sind dessen Auswahlfelder keine echten `<select>`, ihr
 * Wert ist von außen nicht zu lesen. Seither pflegt das Fenster „Dateien
 * auswählen“ alles und schreibt es hierher.
 *
 * Jeder Schlüssel darf fehlen. Dann gilt das alte Attribut, sonst die
 * Vorgabe – so rendert ein alter Block ohne dieses Attribut genau wie
 * bisher, und ein Wert, den das Fenster nicht lesen konnte, wird nicht
 * stillschweigend durch eine Vorgabe ersetzt.
 */

import { decodePayload, encodePayload } from "@shared/payload";
import { isStaffbaseId } from "@shared/staffbase/ids";

import {
  COLLECTION_ID_ATTRIBUTE,
  FILE_GALLERY_CONFIG_ATTRIBUTE,
  FILTER_ATTRIBUTE,
  FILTER_FIELD_ATTRIBUTE,
  FILTER_OPERATOR_ATTRIBUTE,
  LAYOUT_ATTRIBUTE,
  LegacyAttribute,
  MAX_ITEMS_ATTRIBUTE,
  SORT_ATTRIBUTE,
} from "./configuration-schema";
import type { FileSort, FilterField, FilterOperator } from "./file-collection";
import type { GalleryLayout } from "./file-gallery";

export const SORTS: readonly FileSort[] = ["newest", "oldest", "name-asc", "name-desc", "size-desc", "size-asc"];
export const FILTER_FIELDS: readonly FilterField[] = ["fileName", "extension", "creator"];
export const FILTER_OPERATORS: readonly FilterOperator[] = [
  "contains",
  "notContains",
  "startsWith",
  "endsWith",
  "equals",
  "regex",
];
export const LAYOUTS: readonly GalleryLayout[] = ["box", "list"];

/** Was die Galerie zum Zeichnen braucht – jeder Wert bestimmt. */
export interface FileGallerySettings {
  /** `null` = die Dateien aller sichtbaren Collections. */
  collectionId: string | null;
  /** `0` = alle. */
  maxItems: number;
  layout: GalleryLayout;
  sort: FileSort;
  filterField: FilterField;
  filterOperator: FilterOperator;
  /** Leer = kein Filter. */
  filter: string;
}

/**
 * Was in `file-gallery-config` steht. Ein fehlender Schlüssel heißt „wie im
 * alten Attribut“, nicht „Vorgabe“.
 */
export interface FileGalleryConfig {
  /** Leer = alle Dateien, sonst eine Staffbase-ID. */
  collectionId?: string;
  sort?: FileSort;
  filterField?: FilterField;
  filterOperator?: FilterOperator;
  filter?: string;
  layout?: GalleryLayout;
  maxItems?: number;
}

export type ConfigKey = keyof FileGalleryConfig;

/** Die Schlüssel in der Reihenfolge, in der sie geschrieben werden. */
export const CONFIG_KEYS: readonly ConfigKey[] = [
  "collectionId",
  "sort",
  "filterField",
  "filterOperator",
  "filter",
  "layout",
  "maxItems",
];

/** Zu jedem Schlüssel das alte Attribut, das gilt, solange er fehlt. */
export const LEGACY_ATTRIBUTE_OF: Readonly<Record<ConfigKey, LegacyAttribute>> = {
  collectionId: COLLECTION_ID_ATTRIBUTE,
  sort: SORT_ATTRIBUTE,
  filterField: FILTER_FIELD_ATTRIBUTE,
  filterOperator: FILTER_OPERATOR_ATTRIBUTE,
  filter: FILTER_ATTRIBUTE,
  layout: LAYOUT_ATTRIBUTE,
  maxItems: MAX_ITEMS_ATTRIBUTE,
};

/** Die Attribute alter Fassungen, so wie sie am Element ankommen. */
export type LegacyFileGalleryAttributes = Partial<Record<LegacyAttribute, unknown>>;

/** Die Vorgaben des Schemas. */
export const DEFAULT_SETTINGS: Readonly<FileGallerySettings> = {
  collectionId: null,
  maxItems: 0,
  layout: "box",
  sort: "newest",
  filterField: "fileName",
  filterOperator: "contains",
  filter: "",
};

const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

export function readCollectionId(value: unknown): string | null {
  const id = typeof value === "string" ? value.trim() : "";
  return isStaffbaseId(id) ? id : null;
}

export function readMaxItems(value: unknown): number {
  const number = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

export const readLayout = (value: unknown): GalleryLayout => (value === "list" ? "list" : "box");

export const readSort = (value: unknown): FileSort => pick(value, SORTS, DEFAULT_SETTINGS.sort);

export const readFilterField = (value: unknown): FilterField => pick(value, FILTER_FIELDS, DEFAULT_SETTINGS.filterField);

/**
 * Ein Block aus der Zeit, als es nur den Regex-Filter gab, hat keine Bedingung
 * gespeichert; sein Wert war ein regulärer Ausdruck und bleibt es.
 */
export const readFilterOperator = (value: unknown): FilterOperator => pick(value, FILTER_OPERATORS, "regex");

/**
 * Nur Text gilt als Filter. `parseAttributes` macht aus „2026“ eine Zahl –
 * die las die Galerie nie als Filter, und ein alter Block bleibt dabei.
 */
export const readFilter = (value: unknown): string => (typeof value === "string" ? value : "");

/**
 * Was gilt: je Schlüssel der neue Wert, sonst das alte Attribut, sonst die
 * Vorgabe – gelesen mit denselben Funktionen wie bis 0.1.0-rc.7.
 */
export function effectiveSettings(
  config: FileGalleryConfig,
  legacy: LegacyFileGalleryAttributes = {},
): FileGallerySettings {
  const value = (key: ConfigKey): unknown => config[key] ?? legacy[LEGACY_ATTRIBUTE_OF[key]];
  return {
    collectionId: readCollectionId(value("collectionId")),
    maxItems: readMaxItems(value("maxItems")),
    layout: readLayout(value("layout")),
    sort: readSort(value("sort")),
    filterField: readFilterField(value("filterField")),
    filterOperator: readFilterOperator(value("filterOperator")),
    filter: readFilter(value("filter")),
  };
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const only = <T extends string>(value: unknown, allowed: readonly T[]): T | undefined =>
  allowed.includes(value as T) ? (value as T) : undefined;

/** Ein gültiger Wert je Schlüssel oder nichts. */
const SANITIZERS: { [K in ConfigKey]: (value: unknown) => FileGalleryConfig[K] } = {
  collectionId: (value) => (value === "" || isStaffbaseId(value) ? value : undefined),
  sort: (value) => only(value, SORTS),
  filterField: (value) => only(value, FILTER_FIELDS),
  filterOperator: (value) => only(value, FILTER_OPERATORS),
  filter: (value) => (typeof value === "string" ? value : undefined),
  layout: (value) => only(value, LAYOUTS),
  maxItems: (value) => (typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : undefined),
};

/** Behält nur gültige Schlüssel; Unbrauchbares fällt weg, damit das alte Attribut gilt. */
function sanitize(value: Record<string, unknown>): FileGalleryConfig {
  return Object.fromEntries(
    CONFIG_KEYS.flatMap((key) => {
      const clean = SANITIZERS[key](value[key]);
      return clean === undefined ? [] : [[key, clean]];
    }),
  ) as FileGalleryConfig;
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

/**
 * Liest `file-gallery-config`; leer, wenn dort nichts Brauchbares steht –
 * leer, kaputt kodiert oder kein Objekt. Dann gelten die alten Felder.
 */
export function readFileGalleryConfig(raw: unknown): FileGalleryConfig {
  if (isRecord(raw)) return sanitize(raw);
  if (typeof raw !== "string" || raw.trim() === "") return {};
  const trimmed = raw.trim();
  const value = parseJson(decodePayload(trimmed) ?? trimmed);
  return isRecord(value) ? sanitize(value) : {};
}

/**
 * Schreibt `file-gallery-config`, kodiert wie die übrigen JSON-Attribute
 * (`@shared/payload`). Nur gesetzte Schlüssel, in fester Reihenfolge; ohne
 * einen davon bleibt das Feld leer.
 */
export function serializeFileGalleryConfig(config: FileGalleryConfig): string {
  const clean = sanitize({ ...config });
  if (Object.keys(clean).length === 0) return "";
  return encodePayload(JSON.stringify(clean));
}

/** Die alten Felder, so wie der Dialog sie als Text führt. */
export type LegacyDialogValues = Partial<Record<LegacyAttribute, string>>;

/**
 * Ob `parseAttributes` einen Text als Text lässt. Zahlen und `true`/`false`
 * macht es zu Zahl und Wahrheitswert – ein alter Filter „2026“ kam so nie als
 * Filter an.
 */
function staysText(raw: string): boolean {
  const trimmed = raw.trim();
  if (trimmed === "") return true;
  return trimmed !== "true" && trimmed !== "false" && Number.isNaN(Number(trimmed));
}

/**
 * Die lesbaren alten Felder als Konfiguration. Was fehlt oder nichts Gültiges
 * trägt, bleibt weg – dann gilt am Block weiter das alte Attribut.
 *
 * Ein Filter, den die Galerie bisher nie als Filter las (eine Zahl), bleibt
 * ebenfalls weg: übernommen wirkte er plötzlich, und Öffnen und Übernehmen
 * änderte die Seite.
 */
export function configFromLegacy(values: LegacyDialogValues): FileGalleryConfig {
  const raw = (key: ConfigKey): string | undefined => values[LEGACY_ATTRIBUTE_OF[key]];
  const collection = raw("collectionId")?.trim();
  const maxItems = raw("maxItems");
  const filter = raw("filter");
  return sanitize({
    collectionId: collection,
    sort: raw("sort"),
    filterField: raw("filterField"),
    filterOperator: raw("filterOperator"),
    filter: filter !== undefined && staysText(filter) ? filter : undefined,
    layout: raw("layout"),
    // Ein leeres Feld heißt im Dialog „0“, so liest es auch die Galerie.
    maxItems: maxItems === undefined ? undefined : readMaxItems(maxItems),
  });
}

/**
 * Was das Fenster zeigt: je Schlüssel der Wert aus `file-gallery-config` (samt
 * der übernommenen lesbaren Altwerte), sonst die Vorgabe des Schemas – also
 * das, was der Dialog an dieser Stelle auch zeigte.
 *
 * Anders als {@link effectiveSettings} gilt eine fehlende Bedingung hier als
 * „Enthält“, nicht als regulärer Ausdruck: der Ausweg für Blöcke aus der
 * Regex-Zeit gehört auf die Leseseite, ein neuer Block beginnt mit „Enthält“.
 */
export function shownSettings(config: FileGalleryConfig): FileGallerySettings {
  return {
    collectionId: config.collectionId === undefined ? DEFAULT_SETTINGS.collectionId : readCollectionId(config.collectionId),
    maxItems: config.maxItems ?? DEFAULT_SETTINGS.maxItems,
    layout: config.layout ?? DEFAULT_SETTINGS.layout,
    sort: config.sort ?? DEFAULT_SETTINGS.sort,
    filterField: config.filterField ?? DEFAULT_SETTINGS.filterField,
    filterOperator: config.filterOperator ?? DEFAULT_SETTINGS.filterOperator,
    filter: config.filter ?? DEFAULT_SETTINGS.filter,
  };
}

/** Die drei Teile des Filters; sie wirken nur zusammen. */
export type FilterPart = "filterField" | "filterOperator" | "filter";

/**
 * Ändert einen Teil des Filters und schreibt die beiden anderen so mit, wie
 * das Fenster sie zeigt. Sonst gälte für einen nicht lesbaren Teil weiter das
 * alte Attribut, und die Seite filterte anders, als das Fenster es anzeigt.
 */
export function withFilterPart<K extends FilterPart>(
  config: FileGalleryConfig,
  key: K,
  value: FileGallerySettings[K],
): FileGalleryConfig {
  const shown = shownSettings(config);
  return {
    ...config,
    filterField: shown.filterField,
    filterOperator: shown.filterOperator,
    filter: shown.filter,
    [key]: value,
  };
}

/** Gespeicherte Werte vor den alten. */
export function mergeConfig(legacy: FileGalleryConfig, stored: FileGalleryConfig): FileGalleryConfig {
  return { ...legacy, ...stored };
}

/** Was am Block gilt: `file-gallery-config` je Schlüssel vor den einzelnen Feldern. */
export function resolveFileGallerySettings(
  attrs: LegacyFileGalleryAttributes & { [FILE_GALLERY_CONFIG_ATTRIBUTE]?: unknown },
): FileGallerySettings {
  return effectiveSettings(readFileGalleryConfig(attrs[FILE_GALLERY_CONFIG_ATTRIBUTE]), attrs);
}
