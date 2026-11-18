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
 * Die Sammlungen des Datei-Managers für die Seitenleiste „Quelle“: laden,
 * neu laden, durchsuchen.
 *
 * Nur im Studio nachgeladen, zusammen mit dem Editor. Ein Fehler bleibt als
 * eigener Zustand stehen – die Seitenleiste sagt ihn an und bietet
 * „Erneut versuchen“ und die Eingabe von Hand.
 */

import * as React from "react";
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

export type CollectionCatalogState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; collections: readonly CollectionEntry[] };

export interface CollectionCatalog {
  state: CollectionCatalogState;
  reload: () => void;
}

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

export function useCollectionCatalog(load: CollectionLoader = loadCollections): CollectionCatalog {
  const [state, setState] = React.useState<CollectionCatalogState>({ status: "loading" });
  const [round, setRound] = React.useState(0);

  React.useEffect(() => {
    // Ein neuer Ladelauf macht das Ergebnis des alten bedeutungslos.
    let current = true;
    setState({ status: "loading" });
    load()
      .then((collections) => {
        if (current) setState({ status: "ready", collections });
      })
      .catch(() => {
        if (current) setState({ status: "error" });
      });
    return () => {
      current = false;
    };
  }, [load, round]);

  const reload = React.useCallback(() => setRound((value) => value + 1), []);
  return { state, reload };
}

const NO_COLLECTIONS: readonly CollectionEntry[] = [];

/** Die Sammlungen, sobald geladen; sonst leer. */
export const collectionsOf = (state: CollectionCatalogState): readonly CollectionEntry[] =>
  state.status === "ready" ? state.collections : NO_COLLECTIONS;

/** Die Sammlungen, deren Name oder ID die Suche enthält. */
export function filterCollections(collections: readonly CollectionEntry[], query: string): readonly CollectionEntry[] {
  const needle = query.trim().toLocaleLowerCase("de");
  if (needle === "") return collections;
  return collections.filter(
    (entry) => entry.name.toLocaleLowerCase("de").includes(needle) || entry.id.includes(needle),
  );
}

/** Die gewählte Sammlung, wenn sie in der Liste steht. */
export function findCollection(state: CollectionCatalogState, id: string | null): CollectionEntry | undefined {
  if (id === null) return undefined;
  return collectionsOf(state).find((entry) => entry.id === id);
}
