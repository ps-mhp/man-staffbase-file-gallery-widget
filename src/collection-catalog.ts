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
 * Die Sammlungen des Datei-Managers für die Seitenleiste „Quelle“: laden und
 * durchsuchen. Geladen wird mit `useEntityCatalog(…, { onError: "error" })`:
 * ein Fehler bleibt als eigener Zustand stehen – die Seitenleiste sagt ihn an
 * und bietet „Erneut versuchen“ und die Eingabe von Hand.
 *
 * Nur im Studio nachgeladen, zusammen mit dem Editor.
 */

import type { EntityCatalog } from "@shared/entity-picker/use-entity-catalog";
import { isStaffbaseId } from "@shared/staffbase/ids";

import { fetchCollections } from "./file-collection";

/** Eine Sammlung, so wie die Seitenleiste sie zeigt. */
export interface CollectionEntry {
  id: string;
  name: string;
  /** Zahl der Dateien, wenn die API sie nennt. */
  count: number | null;
}

export type CollectionLoader = () => Promise<CollectionEntry[]>;

export type CollectionCatalog = EntityCatalog<CollectionEntry>;

/** Was das Widget wirklich lädt: alle Sammlungen, die die Person sehen darf. */
export const loadCollections: CollectionLoader = async () => {
  const raw = await fetchCollections();
  return raw.flatMap((entry) => {
    const id: unknown = entry?.id;
    if (!isStaffbaseId(id)) return [];
    const name = typeof entry.name === "string" && entry.name.trim() !== "" ? entry.name.trim() : id;
    const count = typeof entry.mediumCount === "number" ? entry.mediumCount : null;
    return [{ id, name, count }];
  });
};

/** Die Sammlungen, deren Name oder ID die Suche enthält. */
export function filterCollections(collections: readonly CollectionEntry[], query: string): readonly CollectionEntry[] {
  const needle = query.trim().toLocaleLowerCase("de");
  if (needle === "") return collections;
  return collections.filter(
    (entry) => entry.name.toLocaleLowerCase("de").includes(needle) || entry.id.includes(needle),
  );
}

/** Die gewählte Sammlung, wenn sie in der Liste steht. */
export function findCollection(items: readonly CollectionEntry[], id: string | null): CollectionEntry | undefined {
  if (id === null) return undefined;
  return items.find((entry) => entry.id === id);
}
