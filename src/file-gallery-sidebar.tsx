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
 * Die linke Spalte im Fenster „Dateien auswählen“: Kopf „Quelle (n)“, die
 * Suche, darunter „Alle Dateien“ und die Sammlungen des Datei-Managers.
 *
 * „Alle Dateien“ steht immer da, auch während die Sammlungen laden oder wenn
 * sie nicht ankommen – diese Wahl braucht keine Liste. Jeder andere Zustand
 * ist zu sehen: Laden, Fehler mit „Erneut versuchen“, keine Sammlungen,
 * keine Treffer. Eine stumm leere Spalte sähe aus wie ein kaputtes Fenster.
 */

import * as React from "react";
import { Folder, Menu } from "lucide-react";
import { Button } from "@man/config-ui/primitives/button";
import { ItemList, type ListItem } from "@man/config-ui/sidebar/item-list";
import { SidebarPanel } from "@man/config-ui/sidebar/sidebar-panel";
import { SidebarSearch } from "@man/config-ui/sidebar/sidebar-search";

import { CollectionCatalog, CollectionEntry, filterCollections } from "./collection-catalog";

/** Kennung der Zeile „Alle Dateien“; eine Sammlung hat immer 24 Hexziffern. */
export const ALL_FILES_ID = "all";

export const ALL_FILES_LABEL = "Alle Dateien";

export interface SourceSidebarProps {
  catalog: CollectionCatalog;
  /** `null` = alle Dateien. */
  collectionId: string | null;
  /** Bekommt {@link ALL_FILES_ID} oder die ID einer Sammlung. */
  onSelect: (id: string) => void;
}

const NOTE = "px-3 py-4 text-center text-[13px] text-muted-foreground";
const SEARCH_LABEL = "Sammlung suchen";
const KIND_ICON = "size-[18px] text-muted-foreground";

const filesText = (count: number): string => (count === 1 ? "1 Datei" : `${count} Dateien`);

const ALL_FILES_ITEM: ListItem = {
  id: ALL_FILES_ID,
  label: ALL_FILES_LABEL,
  description: "ohne Einschränkung",
  thumbnail: <Menu className={KIND_ICON} aria-hidden />,
};

function itemOf(entry: CollectionEntry): ListItem {
  return {
    id: entry.id,
    label: entry.name,
    description: entry.count === null ? "Sammlung" : `Sammlung · ${filesText(entry.count)}`,
    thumbnail: <Folder className={KIND_ICON} aria-hidden />,
  };
}

/** „Alle Dateien“, solange die Suche dazu passt, dann die passenden Sammlungen. */
export function sourceItems(collections: readonly CollectionEntry[], query: string): ListItem[] {
  const needle = query.trim().toLocaleLowerCase("de");
  const all = needle === "" || ALL_FILES_LABEL.toLocaleLowerCase("de").includes(needle) ? [ALL_FILES_ITEM] : [];
  return [...all, ...filterCollections(collections, query).map(itemOf)];
}

function RetryNote({ message, onRetry }: { message: string; onRetry: () => void }): React.ReactElement {
  return (
    <div className="flex flex-col items-center gap-3 px-3 py-4 text-center">
      <p role="alert" className="text-[13px] text-destructive">
        {message}
      </p>
      <Button type="button" variant="outline" size="sm" className="h-10" onClick={onRetry}>
        Erneut versuchen
      </Button>
    </div>
  );
}

/** Was unter der Liste steht, solange die Sammlungen nicht (alle) da sind. */
function CatalogNote({ catalog }: { catalog: CollectionCatalog }): React.ReactElement | null {
  const { status, items, reload } = catalog;
  if (status === "loading") {
    return (
      <p role="status" className={NOTE}>
        Sammlungen werden geladen …
      </p>
    );
  }
  if (status === "error") {
    return <RetryNote message="Die Sammlungen konnten nicht geladen werden." onRetry={reload} />;
  }
  if (items.length === 0) {
    return <p className={NOTE}>Keine Sammlungen gefunden, die dieses Konto sehen darf.</p>;
  }
  return null;
}

export function SourceSidebar({ catalog, collectionId, onSelect }: SourceSidebarProps): React.ReactElement {
  const [query, setQuery] = React.useState("");
  const collections = catalog.items;
  const items = React.useMemo(() => sourceItems(collections, query), [collections, query]);
  const ready = catalog.status === "ready";
  return (
    <SidebarPanel title="Quelle" count={ready ? collections.length + 1 : undefined}>
      {collections.length > 0 && <SidebarSearch aria-label={SEARCH_LABEL} value={query} onValueChange={setQuery} />}
      <ItemList
        aria-label="Quellen"
        items={items}
        selectedId={collectionId ?? ALL_FILES_ID}
        onSelect={onSelect}
        emptyState={`Nichts gefunden zu „${query.trim()}“`}
      />
      <CatalogNote catalog={catalog} />
    </SidebarPanel>
  );
}
