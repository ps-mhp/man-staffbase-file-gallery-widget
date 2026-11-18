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
 * Was der Konfigurationsdialog zeigt: ein einziges Fenster „Dateien
 * auswählen“ am Feld `file-gallery-config`, die einzelnen Felder älterer
 * Fassungen ausgeblendet.
 *
 * Das Fenster beginnt mit `file-gallery-config` und ergänzt, was die alten
 * Felder des eigenen Dialogs lesbar tragen. Was sich nicht lesen lässt
 * (Auswahlfelder im Content Designer), bleibt im neuen Attribut weg, solange
 * es niemand ändert – dann gilt am Block weiter das alte Attribut.
 */

import * as React from "react";
import { Folder } from "lucide-react";

import { FieldModalShellOptions, startFieldModalInjector } from "@shared/config-modal";
import { legacyFieldsFromSchema, readLegacyFields, startHiddenFields } from "@shared/legacy-fields";

import { FILE_GALLERY_CONFIG_ATTRIBUTE, LEGACY_ATTRIBUTES, configurationSchema } from "./configuration-schema";
import {
  FileGalleryConfig,
  LegacyDialogValues,
  configFromLegacy,
  mergeConfig,
  readFileGalleryConfig,
  serializeFileGalleryConfig,
} from "./file-gallery-config";
import { fileGalleryChangesStatus, validateFileGalleryConfig } from "./file-gallery-rules";

const LEGACY_FIELDS = legacyFieldsFromSchema(LEGACY_ATTRIBUTES, configurationSchema);

/** Die alten Felder, wie der eigene Dialog sie gerade führt. */
const readLegacyFromDialog = (root: ParentNode): LegacyDialogValues =>
  readLegacyFields(LEGACY_FIELDS, FILE_GALLERY_CONFIG_ATTRIBUTE, root).values as LegacyDialogValues;

/**
 * Der Editor kommt erst, wenn ein Dialog ihn zeigt: er baut auf
 * `@man/config-ui` (Radix, react-aria, Tailwind) – nichts davon gehört ins
 * Seitenbündel, das jede Leserin lädt. Hier bleiben nur Prüfung und Status;
 * der Rahmen braucht sie, bevor der Editor da ist.
 */
const loadEditor = () => import("./file-gallery-editor");

const LazyFileGalleryEditor = React.lazy(() =>
  loadEditor().then((module) => ({ default: module.FileGalleryEditor })),
);

/** Die Hilfe aus demselben Chunk wie der Editor. */
const LazyFileGalleryHelp = React.lazy(() => loadEditor().then((module) => ({ default: module.FileGalleryHelp })));

const LOADING = <p className="p-6 text-sm text-muted-foreground">Editor wird geladen …</p>;

/** Was der gemeinsame Rahmen von der Dateigalerie wissen muss. Offengelegt für Tests. */
export const fileGalleryEditorShell: FieldModalShellOptions<FileGalleryConfig> = {
  widgetName: "Dateigalerie",
  title: "Dateien auswählen",
  icon: Folder,
  preview: true,
  help: (
    <React.Suspense fallback={null}>
      <LazyFileGalleryHelp />
    </React.Suspense>
  ),
  statusText: fileGalleryChangesStatus,
  validate: validateFileGalleryConfig,
};

/**
 * Der Ausgangsstand des Fensters: die lesbaren alten Felder, darüber, was
 * `file-gallery-config` schon trägt.
 */
export function initialFileGalleryConfig(raw: string, root: ParentNode = document): FileGalleryConfig {
  return mergeConfig(configFromLegacy(readLegacyFromDialog(root)), readFileGalleryConfig(raw));
}

/**
 * Wartet auf den Konfigurationsdialog des Widgets, setzt das Fenster an die
 * Stelle von `file-gallery-config` und blendet die alten Felder aus – beides
 * nur im eigenen Dialog.
 *
 * @param root der zu beobachtende Teilbaum; standardmäßig das Dokument.
 * Offengelegt, damit Tests den Beobachter auf einen Container begrenzen.
 * @returns eine Funktion, die die Beobachtung beendet und alles abbaut.
 */
export function startFileGalleryDialog(root: ParentNode = document): () => void {
  const stopModal = startFieldModalInjector<FileGalleryConfig>({
    fieldKey: FILE_GALLERY_CONFIG_ATTRIBUTE,
    root,
    reopenLabel: "Dateien auswählen",
    modalTestId: "file-gallery-editor-modal",
    reopenTestId: "file-gallery-editor-reopen",
    parse: (raw) => initialFileGalleryConfig(raw, root),
    serialize: serializeFileGalleryConfig,
    shell: fileGalleryEditorShell,
    render: ({ value, onChange }) => (
      <React.Suspense fallback={LOADING}>
        <LazyFileGalleryEditor value={value} onChange={onChange} />
      </React.Suspense>
    ),
  });
  const stopHiding = startHiddenFields(LEGACY_ATTRIBUTES, FILE_GALLERY_CONFIG_ATTRIBUTE, root);
  return () => {
    stopModal();
    stopHiding();
  };
}
