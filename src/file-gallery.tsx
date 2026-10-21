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

import React from "react";

import { useHotStyle } from "@shared/hot-style";
import {
  CollectionError,
  FileSort,
  FilterField,
  FilterOperator,
  GalleryFile,
  fetchFiles,
  parseFileFilter,
  selectFiles,
} from "./file-collection";
import galleryCss from "./styles/file-gallery.scss";

export const MESSAGES = {
  loading: "Dateien werden geladen …",
  empty: "Keine Dateien gefunden.",
  forbidden: "Sie haben keinen Zugriff auf diese Dateien.",
  noMatch: "Keine Datei passt zum Filter.",
  badFilter: "Der Filter ist kein gültiger regulärer Ausdruck",
  failed: "Dateien konnten nicht geladen werden",
};

type State =
  | { status: "loading" }
  | { status: "error"; message: string };

export type GalleryLayout = "box" | "list";

export interface FileGalleryProps {
  /** `null` = die Dateien aller sichtbaren Collections. */
  collectionId: string | null;
  maxItems: number;
  layout?: GalleryLayout;
  sort?: FileSort;
  filterField?: FilterField;
  filterOperator?: FilterOperator;
  /** Wert der Filter-Bedingung; leer = kein Filter. */
  filter?: string;
  loadFiles?: (collectionId: string | null) => Promise<GalleryFile[]>;
}

export function formatBytes(bytes: number | null): string {
  if (bytes === null) return "";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const language = document.documentElement.getAttribute("lang") || undefined;
  return `${value.toLocaleString(language, { maximumFractionDigits: unit === 0 ? 0 : 1 })} ${units[unit]}`;
}

function FileTile({ file }: { file: GalleryFile }): React.JSX.Element {
  const meta = [file.extension.toUpperCase(), formatBytes(file.bytes)].filter((part) => part !== "").join(" · ");
  return (
    <a className="man-file-gallery__card" href={file.url} target="_blank" rel="noopener noreferrer">
      <span className="man-file-gallery__preview">
        {file.thumbnailUrl !== null ? (
          <img className="man-file-gallery__image" src={file.thumbnailUrl} alt="" loading="lazy" />
        ) : (
          <span className="man-file-gallery__badge" aria-hidden="true">
            {file.extension.toUpperCase() || "DATEI"}
          </span>
        )}
      </span>
      <span className="man-file-gallery__name">{file.fileName}</span>
      {meta !== "" && <span className="man-file-gallery__meta">{meta}</span>}
    </a>
  );
}

/** Die Dateien einer Collection (oder aller) als Kartenraster; jede Karte öffnet die Datei. */
export function FileGallery({
  collectionId,
  maxItems,
  layout = "box",
  sort = "newest",
  filterField = "fileName",
  filterOperator = "contains",
  filter = "",
  loadFiles = fetchFiles,
}: FileGalleryProps): React.JSX.Element {
  const liveCss = useHotStyle(galleryCss, "file-gallery-widget", "styles/file-gallery.scss");
  const [state, setState] = React.useState<State>({ status: "loading" });
  const [loaded, setLoaded] = React.useState<GalleryFile[] | null>(null);

  // Geladen wird nur bei geänderter Collection; Filter und Reihenfolge arbeiten auf dem Geladenen.
  React.useEffect(() => {
    let current = true;
    setState({ status: "loading" });
    setLoaded(null);
    loadFiles(collectionId)
      .then((files) => {
        if (current) setLoaded(files);
      })
      .catch((error: unknown) => {
        if (!current) return;
        const status = error instanceof CollectionError ? error.status : null;
        const message =
          status === 401 || status === 403
            ? MESSAGES.forbidden
            : `${MESSAGES.failed}: ${error instanceof Error ? error.message : String(error)}`;
        setState({ status: "error", message });
      });
    return () => {
      current = false;
    };
  }, [collectionId, loadFiles]);

  const parsed = React.useMemo(
    () => parseFileFilter({ field: filterField, operator: filterOperator, value: filter }),
    [filterField, filterOperator, filter],
  );
  const badFilter = parsed !== null && "error" in parsed ? parsed.error : null;
  const hasFilter = parsed !== null && "test" in parsed;
  const files = React.useMemo(
    () =>
      loaded === null || badFilter !== null
        ? null
        : selectFiles(loaded, { sort, field: filterField, operator: filterOperator, value: filter, limit: maxItems }, parsed),
    [loaded, badFilter, sort, filterField, filterOperator, filter, maxItems, parsed],
  );

  let body: React.JSX.Element;
  if (badFilter !== null) {
    body = (
      <p className="man-file-gallery__status man-file-gallery__status--error" role="alert">
        {MESSAGES.badFilter}: {badFilter}
      </p>
    );
  } else if (state.status === "error") {
    body = (
      <p className="man-file-gallery__status man-file-gallery__status--error" role="alert">
        {state.message}
      </p>
    );
  } else if (files === null) {
    body = <p className="man-file-gallery__status">{MESSAGES.loading}</p>;
  } else if (files.length === 0) {
    body = <p className="man-file-gallery__status">{hasFilter ? MESSAGES.noMatch : MESSAGES.empty}</p>;
  } else {
    body = (
      <div className={`man-file-gallery__grid man-file-gallery__grid--${layout}`}>
        {files.map((file) => (
          <FileTile key={file.id} file={file} />
        ))}
      </div>
    );
  }

  return (
    <div className={`man-file-gallery man-file-gallery--${layout}`} data-testid="file-gallery">
      <style>{liveCss}</style>
      {body}
    </div>
  );
}
