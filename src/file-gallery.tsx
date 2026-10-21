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
  CollectionPage,
  GalleryFile,
  fetchCollectionFiles,
  parseFileFilter,
} from "./file-collection";
import galleryCss from "./styles/file-gallery.scss";

export const MESSAGES = {
  missingCollection: "Keine Collection gewählt. Bitte in den Widget-Einstellungen eine Collection auswählen.",
  loading: "Dateien werden geladen …",
  empty: "Diese Collection enthält keine Dateien.",
  forbidden: "Sie haben keinen Zugriff auf diese Dateien.",
  noMatch: "Keine Datei passt zum Filter.",
  badFilter: "Der Filter ist kein gültiger regulärer Ausdruck",
  failed: "Dateien konnten nicht geladen werden",
};

type State =
  | { status: "loading" }
  | { status: "ready"; files: GalleryFile[] }
  | { status: "error"; message: string };

export interface FileGalleryProps {
  collectionId: string | null;
  maxItems: number;
  layout?: GalleryLayout;
  /** Regulärer Ausdruck gegen den Dateinamen; leer = alle Dateien. */
  filter?: string;
  loadFiles?: (collectionId: string, limit: number, accept?: (file: GalleryFile) => boolean) => Promise<CollectionPage>;
}

export type GalleryLayout = "box" | "list";

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
    <li className="man-file-gallery__item">
      <a className="man-file-gallery__link" href={file.url} target="_blank" rel="noopener noreferrer">
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
    </li>
  );
}

/** Die Dateien einer Collection als Kachelraster; jede Kachel öffnet die Datei. */
export function FileGallery({
  collectionId,
  maxItems,
  layout = "box",
  filter = "",
  loadFiles = fetchCollectionFiles,
}: FileGalleryProps): React.JSX.Element {
  const liveCss = useHotStyle(galleryCss, "file-gallery-widget", "styles/file-gallery.scss");
  const [state, setState] = React.useState<State>({ status: "loading" });
  const parsed = React.useMemo(() => parseFileFilter(filter), [filter]);
  const badFilter = parsed !== null && "error" in parsed ? parsed.error : null;
  const regex = parsed !== null && "regex" in parsed ? parsed.regex : null;

  React.useEffect(() => {
    if (collectionId === null || badFilter !== null) return;
    // Eine geänderte Auswahl macht die laufende Antwort zur falschen.
    let current = true;
    setState({ status: "loading" });
    loadFiles(collectionId, maxItems, regex === null ? undefined : (file) => regex.test(file.fileName))
      .then(({ files }) => {
        if (current) setState({ status: "ready", files });
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
  }, [collectionId, maxItems, regex, badFilter, loadFiles]);

  let body: React.JSX.Element;
  if (collectionId === null) {
    body = <p className="man-file-gallery__status">{MESSAGES.missingCollection}</p>;
  } else if (badFilter !== null) {
    body = (
      <p className="man-file-gallery__status man-file-gallery__status--error" role="alert">
        {MESSAGES.badFilter}: {badFilter}
      </p>
    );
  } else if (state.status === "loading") {
    body = <p className="man-file-gallery__status">{MESSAGES.loading}</p>;
  } else if (state.status === "error") {
    body = (
      <p className="man-file-gallery__status man-file-gallery__status--error" role="alert">
        {state.message}
      </p>
    );
  } else if (state.files.length === 0) {
    body = <p className="man-file-gallery__status">{regex === null ? MESSAGES.empty : MESSAGES.noMatch}</p>;
  } else {
    body = (
      <ul className={`man-file-gallery__grid man-file-gallery__grid--${layout}`}>
        {state.files.map((file) => (
          <FileTile key={file.id} file={file} />
        ))}
      </ul>
    );
  }

  return (
    <div className={`man-file-gallery man-file-gallery--${layout}`} data-testid="file-gallery">
      <style>{liveCss}</style>
      {body}
    </div>
  );
}
