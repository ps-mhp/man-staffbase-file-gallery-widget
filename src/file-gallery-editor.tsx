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
 * Der Rumpf des Fensters „Dateien auswählen“ im gemeinsamen Rahmen von
 * `@man/config-ui`: links die Quelle, in der Mitte das Formular – Kopf mit
 * der gewählten Quelle, „Filter & Reihenfolge“, „Darstellung“ –, in den
 * Geräteansichten die Vorschau. Dort stehen dieselben Felder rechts im
 * Inspektor, in zwei Reitern, damit man beim Umschalten weiter einstellen
 * kann und das Ergebnis sofort sieht.
 *
 * Nur im Studio nachgeladen (`file-gallery-dialog.tsx`): er bringt Radix,
 * react-aria und Tailwind mit, und das hat im Seitenbündel, das jede Leserin
 * lädt, nichts verloren. Kopf, Übernehmen, Rückgängig und Rückfrage kommen
 * vom Rahmen.
 */

import * as React from "react";
import { TriangleAlert } from "lucide-react";
import { FormSection } from "@man/config-ui/form/form-section";
import { InspectorPanel } from "@man/config-ui/inspector/inspector-panel";
import { ConfigWorkspace } from "@man/config-ui/layout/config-workspace";
import { useConfigShell } from "@man/config-ui/shell/shell-context";
import { useEntityCatalog } from "@shared/entity-picker/use-entity-catalog";

import { CollectionCatalog, CollectionLoader, findCollection, loadCollections as loadAllCollections } from "./collection-catalog";
import { FileGalleryConfig, shownSettings } from "./file-gallery-config";
import { FileGalleryPreview, FileLoader, useCachedFileLoader } from "./file-gallery-preview";
import { FILTER_ISSUE, validateFileGalleryConfig } from "./file-gallery-rules";
import { DisplayFields, FilterFields, ManualIdSection, SourceHeading } from "./file-gallery-sections";
import { ALL_FILES_ID, ALL_FILES_LABEL, SourceSidebar } from "./file-gallery-sidebar";

export { FileGalleryHelp } from "./file-gallery-help";

export interface FileGalleryEditorProps {
  value: FileGalleryConfig;
  onChange: (value: FileGalleryConfig) => void;
  /** Woher die Sammlungen kommen; offengelegt für Tests. */
  loadCollections?: CollectionLoader;
  /** Woher die Vorschau ihre Dateien holt; offengelegt für Tests. */
  loadFiles?: FileLoader;
}

interface HeadingText {
  title: string;
  kicker: string;
}

/** Was im Kopf des Formulars steht: Name der Quelle, wo bekannt, sonst die ID. */
export function headingOf(collectionId: string | null, catalog: Pick<CollectionCatalog, "status" | "items">): HeadingText {
  if (collectionId === null) return { title: ALL_FILES_LABEL, kicker: "Alle Sammlungen als Quelle" };
  const entry = findCollection(catalog.items, collectionId);
  if (entry !== undefined) return { title: entry.name, kicker: "Sammlung als Quelle" };
  return {
    title: collectionId,
    kicker: catalog.status === "ready" ? "Sammlung · nicht in der Liste" : "Sammlung als Quelle",
  };
}

/** Die Felder knapp, in zwei Reitern neben der Vorschau. */
function SettingsInspector({ value, onChange }: Pick<FileGalleryEditorProps, "value" | "onChange">): React.ReactElement {
  const { issuesVisible } = useConfigShell();
  const filterInvalid = issuesVisible && validateFileGalleryConfig(value).some((issue) => issue.id === FILTER_ISSUE);
  return (
    <InspectorPanel
      title="Einstellungen"
      tabs={[
        {
          id: "filter",
          label: "Filter & Reihenfolge",
          badge: filterInvalid ? (
            <>
              <TriangleAlert className="size-3.5 text-destructive" aria-hidden />
              <span className="sr-only">(fehlerhaft)</span>
            </>
          ) : undefined,
          content: <FilterFields value={value} onChange={onChange} detailed={false} />,
        },
        {
          id: "display",
          label: "Darstellung",
          content: <DisplayFields value={value} onChange={onChange} detailed={false} />,
        },
      ]}
    />
  );
}

export function FileGalleryEditor({ value, onChange, loadCollections, loadFiles }: FileGalleryEditorProps): React.ReactElement {
  const catalog = useEntityCatalog(loadCollections ?? loadAllCollections, { onError: "error" });
  const cachedLoad = useCachedFileLoader(loadFiles);
  const shown = shownSettings(value);
  const heading = headingOf(shown.collectionId, catalog);
  // Im Editor stehen die Felder in der Mitte; ein Inspektor daneben verdoppelte sie.
  const { view } = useConfigShell();

  const selectSource = (id: string): void => {
    const collectionId = id === ALL_FILES_ID ? "" : id;
    if (collectionId !== value.collectionId) onChange({ ...value, collectionId });
  };

  return (
    <ConfigWorkspace
      sidebar={<SourceSidebar catalog={catalog} collectionId={shown.collectionId} onSelect={selectSource} />}
      preview={<FileGalleryPreview settings={shown} loadFiles={cachedLoad} />}
      inspector={view === "editor" ? undefined : <SettingsInspector value={value} onChange={onChange} />}
    >
      <div className="flex max-w-[720px] flex-col gap-8 px-10 pt-6 pb-12" data-testid="file-gallery-editor">
        <SourceHeading collectionId={shown.collectionId} title={heading.title} kicker={heading.kicker} />
        <FormSection title="Filter & Reihenfolge">
          <FilterFields value={value} onChange={onChange} detailed />
        </FormSection>
        <FormSection title="Darstellung">
          <DisplayFields value={value} onChange={onChange} detailed />
        </FormSection>
        <ManualIdSection value={value} onChange={onChange} />
      </div>
    </ConfigWorkspace>
  );
}
