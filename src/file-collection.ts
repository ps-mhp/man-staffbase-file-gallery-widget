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
}

export interface CollectionPage {
  files: GalleryFile[];
  total: number | null;
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

/**
 * Die Dateien einer Collection, in der Reihenfolge der API, höchstens `limit`
 * Stück (`0` = alle); `accept` sortiert Dateien vorab aus.
 */
export async function fetchCollectionFiles(
  collectionId: string,
  limit: number,
  accept: (file: GalleryFile) => boolean = () => true,
  fetchImpl: typeof fetch = (...args) => fetch(...args),
): Promise<CollectionPage> {
  if (!isStaffbaseId(collectionId)) throw new CollectionError("Keine gültige Collection-ID", null);

  const files: GalleryFile[] = [];
  let cursor: string | null = null;
  let total: number | null = null;
  do {
    const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
    if (cursor) query.set("cursor", cursor);
    const page: Paged<RawEntry> = await getJson<Paged<RawEntry>>(
      `${COLLECTIONS_ENDPOINT}/${collectionId}/entries?${query}`,
      fetchImpl,
    );
    total = typeof page.total === "number" ? page.total : total;
    for (const entry of page.entries ?? []) {
      const file = toGalleryFile(entry);
      // Gefiltert wird vor dem Zählen gegen `limit`, sonst fehlten Treffer hinter nicht passenden Dateien.
      if (file !== null && accept(file)) files.push(file);
    }
    // Ein Cursor ohne neue Einträge würde endlos weiterblättern.
    cursor = (page.entries?.length ?? 0) > 0 ? (page.cursor ?? null) : null;
  } while (cursor !== null && (limit <= 0 || files.length < limit));

  return { files: limit > 0 ? files.slice(0, limit) : files, total };
}

/** Die Collections, die der Konfigurationsdialog zur Auswahl anbietet. */
export const collectionCatalogSource: EntityCatalogSource<RawCollection> = {
  async fetchList(): Promise<RawCollection[]> {
    const all: RawCollection[] = [];
    let cursor: string | null = null;
    do {
      const query = new URLSearchParams({ limit: String(PAGE_SIZE) });
      if (cursor) query.set("cursor", cursor);
      const page: Paged<RawCollection> = await getJson<Paged<RawCollection>>(
        `${COLLECTIONS_ENDPOINT}?${query}`,
        (...args) => fetch(...args),
      );
      all.push(...(page.entries ?? []));
      cursor = (page.entries?.length ?? 0) > 0 ? (page.cursor ?? null) : null;
    } while (cursor !== null);
    return all;
  },

  toOption(entry: RawCollection): EntityOption | null {
    if (!isStaffbaseId(entry?.id)) return null;
    const name = typeof entry.name === "string" && entry.name.trim() !== "" ? entry.name.trim() : entry.id;
    const count = typeof entry.mediumCount === "number" ? ` (${entry.mediumCount} Dateien)` : "";
    return { id: entry.id, title: `${name}${count}` };
  },
};

/**
 * Der Filter-Ausdruck der Redaktion, ohne Beachtung der Groß-/Kleinschreibung.
 * `null` heißt: kein Filter; `error` zeigt die View, statt still alles zu zeigen.
 */
export type FileFilter = { regex: RegExp } | { error: string } | null;

export function parseFileFilter(pattern: string): FileFilter {
  if (pattern.trim() === "") return null;
  try {
    return { regex: new RegExp(pattern, "i") };
  } catch (error) {
    return { error: error instanceof Error ? error.message : String(error) };
  }
}
