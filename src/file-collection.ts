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

import { EntityCatalogSource, EntityOption } from "@shared/entity-picker/entity-catalog";
import { isMediaUrl, isStaffbaseId } from "@shared/staffbase/ids";

/**
 * Die Collections des Datei-Managers (Studio → Dateien). Gemessen am
 * 21.10.2026 gegen www.mti.man: `{ entries, cursor, limit, total }`, die
 * Einträge seitenweise per `cursor`.
 */
export const COLLECTIONS_ENDPOINT = "/api/medialibrary/collections";

/** Größte Seite, die die Medialibrary-API ohne Murren liefert. */
const PAGE_SIZE = 100;

/** Eine Datei, so wie die Galerie sie zeigt. */
export interface GalleryFile {
  id: string;
  fileName: string;
  /** "image" | "video" | "raw" | … wie vom Medienserver gemeldet. */
  type: string;
  /** Kleinbuchstaben, ohne Punkt; leer, wenn unbekannt. */
  extension: string;
  /** Same-origin-Pfad zur Originaldatei. */
  url: string;
  /** Same-origin-Pfad zum Vorschaubild, falls der Server eins gerendert hat. */
  thumbnailUrl: string | null;
  bytes: number | null;
  created: string | null;
  /** "Vorname Nachname" des Uploaders; `null` bei Systemdateien ohne Ersteller. */
  creator: string | null;
}

/** Fehler mit HTTP-Status, damit die View 401/403 gesondert erklären kann. */
export class CollectionError extends Error {
  public constructor(
    message: string,
    public readonly status: number | null,
  ) {
    super(message);
    this.name = "CollectionError";
  }
}

interface RawEntry {
  id?: unknown;
  fileName?: unknown;
  fileExtension?: unknown;
  type?: unknown;
  created?: unknown;
  createdBy?: { firstName?: unknown; lastName?: unknown } | null;
  original?: { url?: unknown; size?: unknown };
  thumbnail?: { url?: unknown };
}

interface RawCollection {
  id?: unknown;
  name?: unknown;
  mediumCount?: unknown;
}

interface Paged<T> {
  entries?: T[];
  cursor?: string | null;
  total?: number;
}

/**
 * Macht aus einer Medien-URL einen Pfad der eigenen Herkunft.
 *
 * Die API liefert absolute URLs mit dem Host, unter dem die Instanz früher
 * lief (`www.onetruck.man`, gesehen 21.10.2026 auf www.mti.man). Dort hat der
 * Leser keine Sitzung — als Pfad gelesen landet dieselbe Datei auf dem
 * aktuellen Host. Alles, was danach kein Medium der eigenen App ist, fällt weg.
 */
export function toSameOriginMediaPath(url: unknown): string | null {
  if (typeof url !== "string" || url === "") return null;
  let path: string;
  try {
    const parsed = new URL(url, window.location.origin);
    path = `${parsed.pathname}${parsed.search}`;
  } catch {
    return null;
  }
  return isMediaUrl(path) ? path : null;
}

function creatorName(createdBy: RawEntry["createdBy"]): string | null {
  const name = [createdBy?.firstName, createdBy?.lastName]
    .filter((part): part is string => typeof part === "string" && part !== "")
    .join(" ");
  return name === "" ? null : name;
}

export function toGalleryFile(entry: RawEntry): GalleryFile | null {
  if (!isStaffbaseId(entry?.id)) return null;
  const url = toSameOriginMediaPath(entry.original?.url);
  if (url === null) return null;
  const fileName = typeof entry.fileName === "string" && entry.fileName !== "" ? entry.fileName : entry.id;
  const extension =
    typeof entry.fileExtension === "string" && entry.fileExtension !== ""
      ? entry.fileExtension.toLowerCase()
      : (/\.([a-z0-9]+)$/i.exec(fileName)?.[1].toLowerCase() ?? "");
  return {
    id: entry.id,
    fileName,
    type: typeof entry.type === "string" ? entry.type : "raw",
    extension,
    url,
    thumbnailUrl: toSameOriginMediaPath(entry.thumbnail?.url),
    bytes: typeof entry.original?.size === "number" ? entry.original.size : null,
    created: typeof entry.created === "string" ? entry.created : null,
    creator: creatorName(entry.createdBy),
  };
}

async function getJson<T>(path: string, fetchImpl: typeof fetch): Promise<T> {
  let response: Response;
  try {
    response = await fetchImpl(path, { credentials: "same-origin", headers: { Accept: "application/json" } });
  } catch (error) {
    throw new CollectionError(error instanceof Error ? error.message : "Netzwerkfehler", null);
  }
  if (!response.ok) throw new CollectionError(`HTTP ${response.status}`, response.status);
  return (await response.json()) as T;
}

/** Alle Collections, die die angemeldete Person sehen darf (seitenweise). */
export async function fetchCollections(fetchImpl: typeof fetch = (...args) => fetch(...args)): Promise<RawCollection[]> {
  const all: RawCollection[] = [];
  let cursor: string | null = null;
  do {
    const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
    if (cursor) query.set("cursor", cursor);
    const page: Paged<RawCollection> = await getJson<Paged<RawCollection>>(`${COLLECTIONS_ENDPOINT}?${query}`, fetchImpl);
    all.push(...(page.entries ?? []));
    // Ein Cursor ohne neue Einträge würde endlos weiterblättern.
    cursor = (page.entries?.length ?? 0) > 0 ? (page.cursor ?? null) : null;
  } while (cursor !== null);
  return all;
}

/** Alle Dateien einer Collection, in der Reihenfolge der API. */
export async function fetchCollectionFiles(
  collectionId: string,
  fetchImpl: typeof fetch = (...args) => fetch(...args),
): Promise<GalleryFile[]> {
  if (!isStaffbaseId(collectionId)) throw new CollectionError("Keine gültige Collection-ID", null);

  const files: GalleryFile[] = [];
  let cursor: string | null = null;
  do {
    const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
    if (cursor) query.set("cursor", cursor);
    const page: Paged<RawEntry> = await getJson<Paged<RawEntry>>(
      `${COLLECTIONS_ENDPOINT}/${collectionId}/entries?${query}`,
      fetchImpl,
    );
    for (const entry of page.entries ?? []) {
      const file = toGalleryFile(entry);
      if (file !== null) files.push(file);
    }
    cursor = (page.entries?.length ?? 0) > 0 ? (page.cursor ?? null) : null;
  } while (cursor !== null);
  return files;
}

/**
 * Die Dateien einer Collection — oder, ohne Collection, aller sichtbaren
 * Collections. `POST /api/medialibrary/entries/all`, das die Studio-Ansicht
 * „Alle Dateien“ nutzt, braucht ein CSRF-Token und das Datei-Manager-Recht
 * und scheidet für Leser aus (gemessen 21.10.2026). Dateien, die in keiner
 * Collection liegen, fehlen deshalb; eine Datei in mehreren Collections
 * erscheint einmal.
 */
export async function fetchFiles(
  collectionId: string | null,
  fetchImpl: typeof fetch = (...args) => fetch(...args),
): Promise<GalleryFile[]> {
  if (collectionId !== null) return fetchCollectionFiles(collectionId, fetchImpl);

  const collections = await fetchCollections(fetchImpl);
  const perCollection = await Promise.all(
    collections.filter((c) => isStaffbaseId(c.id)).map((c) => fetchCollectionFiles(c.id as string, fetchImpl)),
  );
  const byId = new Map<string, GalleryFile>();
  for (const file of perCollection.flat()) byId.set(file.id, file);
  return [...byId.values()];
}

export type FileSort = "newest" | "oldest" | "name-asc" | "name-desc" | "size-desc" | "size-asc";
export type FilterField = "fileName" | "extension" | "creator";
export type FilterOperator = "contains" | "notContains" | "startsWith" | "endsWith" | "equals" | "regex";

export interface FileSelection {
  sort: FileSort;
  field: FilterField;
  operator: FilterOperator;
  /** Leer = kein Filter. */
  value: string;
  /** `0` = alle. */
  limit: number;
}

/** Ein Prädikat für den Filter; `{ error }`, wenn der reguläre Ausdruck ungültig ist; `null` ohne Filter. */
export type FileFilter = { test: (file: GalleryFile) => boolean } | { error: string } | null;

const fieldValue = (file: GalleryFile, field: FilterField): string =>
  (field === "fileName" ? file.fileName : field === "extension" ? file.extension : (file.creator ?? "")).toLowerCase();

export function parseFileFilter(selection: Pick<FileSelection, "field" | "operator" | "value">): FileFilter {
  const { field, operator, value } = selection;
  if (value.trim() === "") return null;
  if (operator === "regex") {
    try {
      const regex = new RegExp(value, "i");
      return { test: (file) => regex.test(fieldValue(file, field)) };
    } catch (error) {
      return { error: error instanceof Error ? error.message : String(error) };
    }
  }
  const needle = value.trim().toLowerCase();
  const tests: Record<Exclude<FilterOperator, "regex">, (haystack: string) => boolean> = {
    contains: (h) => h.includes(needle),
    notContains: (h) => !h.includes(needle),
    startsWith: (h) => h.startsWith(needle),
    endsWith: (h) => h.endsWith(needle),
    equals: (h) => h === needle,
  };
  const test = tests[operator];
  return { test: (file) => test(fieldValue(file, field)) };
}

const time = (file: GalleryFile): number => (file.created === null ? 0 : Date.parse(file.created) || 0);

const COMPARATORS: Record<FileSort, (a: GalleryFile, b: GalleryFile) => number> = {
  newest: (a, b) => time(b) - time(a),
  oldest: (a, b) => time(a) - time(b),
  "name-asc": (a, b) => a.fileName.localeCompare(b.fileName, "de", { numeric: true, sensitivity: "base" }),
  "name-desc": (a, b) => b.fileName.localeCompare(a.fileName, "de", { numeric: true, sensitivity: "base" }),
  "size-desc": (a, b) => (b.bytes ?? 0) - (a.bytes ?? 0),
  "size-asc": (a, b) => (a.bytes ?? 0) - (b.bytes ?? 0),
};

/** Filtern, dann sortieren, dann begrenzen — die Reihenfolge entscheidet, was „die neuesten 5“ sind. */
export function selectFiles(files: GalleryFile[], selection: FileSelection, filter: FileFilter): GalleryFile[] {
  const kept = filter !== null && "test" in filter ? files.filter(filter.test) : [...files];
  kept.sort(COMPARATORS[selection.sort]);
  return selection.limit > 0 ? kept.slice(0, selection.limit) : kept;
}

/** Die Collections, die der Konfigurationsdialog zur Auswahl anbietet. */
export const collectionCatalogSource: EntityCatalogSource<RawCollection> = {
  fetchList: () => fetchCollections(),

  toOption(entry: RawCollection): EntityOption | null {
    if (!isStaffbaseId(entry?.id)) return null;
    const name = typeof entry.name === "string" && entry.name.trim() !== "" ? entry.name.trim() : entry.id;
    const count = typeof entry.mediumCount === "number" ? ` (${entry.mediumCount} Dateien)` : "";
    return { id: entry.id, title: `${name}${count}` };
  },
};
