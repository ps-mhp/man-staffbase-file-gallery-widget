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
 * Die Vorschau im Gerätrahmen des Fensters: die echte Galerie mit dem
 * Entwurf, samt „wird geladen“ und Fehlermeldung, denn die Dateien kommen
 * auch hier aus dem Netz – nur lesend, wie auf der Seite.
 *
 * `inert`: ein Klick auf eine Karte öffnete die Datei in einem neuen Tab,
 * und Tab-Wandern bedeutet in der Vorschau nichts. Das Raster richtet sich
 * nach der Breite des Rahmens (`auto-fill`), nicht nach dem Studio-Fenster.
 *
 * Geladene Dateien bleiben je Quelle für die Dauer des Fensters: wer
 * zwischen Editor und Geräten wechselt oder am Filter dreht, lädt nicht jedes
 * Mal alle Sammlungen neu. Ein Fehler wird nicht gemerkt – der nächste Blick
 * versucht es wieder.
 */

import * as React from "react";
import { useConfigShell } from "@man/config-ui/shell/shell-context";

import { GalleryFile, fetchFiles } from "./file-collection";
import { FileGallery } from "./file-gallery";
import type { FileGallerySettings } from "./file-gallery-config";

export type FileLoader = (collectionId: string | null) => Promise<GalleryFile[]>;

/** Ein Lader, der jede Quelle nur einmal holt; stabil, solange `load` gleich bleibt. */
export function useCachedFileLoader(load: FileLoader = fetchFiles): FileLoader {
  return React.useMemo(() => {
    const cache = new Map<string, Promise<GalleryFile[]>>();
    return (collectionId) => {
      const key = collectionId ?? "";
      const cached = cache.get(key);
      if (cached !== undefined) return cached;
      const pending = load(collectionId);
      cache.set(key, pending);
      pending.catch(() => cache.delete(key));
      return pending;
    };
  }, [load]);
}

export interface FileGalleryPreviewProps {
  settings: FileGallerySettings;
  loadFiles: FileLoader;
}

export function FileGalleryPreview({ settings, loadFiles }: FileGalleryPreviewProps): React.ReactElement {
  const { view } = useConfigShell();
  return (
    <div inert className={view === "mobile" ? "p-4" : "px-10 py-8"} data-testid="file-gallery-preview">
      <FileGallery {...settings} loadFiles={loadFiles} />
    </div>
  );
}
