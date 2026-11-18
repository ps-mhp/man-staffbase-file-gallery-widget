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
 * Das Fenster „Dateien auswählen“ im gemeinsamen Rahmen von
 * `@man/config-ui`, eingehängt in einen echten RJSF-Dialog: Ausgangsstand aus
 * den alten Feldern, Übernehmen nach `file-gallery-config`, Prüfung,
 * Ausblenden nur im eigenen Dialog, Nachladen des Editors.
 */

import * as React from "react";
import { act, fireEvent, render } from "@testing-library/react";
import Form from "@rjsf/mui";
import validator from "@rjsf/validator-ajv8";

import { modalRoot, settleModal, settleEditor, clickElement } from "@shared/ui/config-modal.testing";
import { LEGACY_ATTRIBUTES, configurationSchema } from "./configuration-schema";
import { readFileGalleryConfig, resolveFileGallerySettings, serializeFileGalleryConfig } from "./file-gallery-config";
import { fileGalleryEditorShell, startFileGalleryDialog } from "./file-gallery-dialog";

const EDITOR_SELECTOR = '[aria-label="Quellen"] [role="row"]:nth-child(2)';

const mockEditorLoaded = jest.fn();
jest.mock("./file-gallery-editor", () => {
  mockEditorLoaded();
  return jest.requireActual("./file-gallery-editor");
});

const FORMS = "aaaaaaaaaaaaaaaaaaaaaaaa";

/** Antwortet wie die Medialibrary-API: eine Sammlung „Formulare Personal“ mit einer Datei. */
function answer(url: string): Response {
  if (url.startsWith(`/api/medialibrary/collections/${FORMS}/entries`)) {
    return Response.json({
      entries: [
        {
          id: "111111111111111111111111",
          fileName: "Antrag Elternzeit.pdf",
          fileExtension: "pdf",
          original: { url: "/api/media/secure/external/v2/raw/upload/antrag.pdf", size: 2048 },
        },
      ],
      cursor: null,
    });
  }
  if (url.startsWith("/api/medialibrary/collections")) {
    return Response.json({ entries: [{ id: FORMS, name: "Formulare Personal", mediumCount: 1 }], cursor: null });
  }
  return new Response("{}", { status: 404 });
}

beforeEach(() => {
  jest.spyOn(globalThis, "fetch").mockImplementation(async (input) => answer(String(input)));
});

afterEach(() => {
  jest.restoreAllMocks();
});

const fieldValue = (container: HTMLElement): string =>
  container.querySelector<HTMLInputElement>('#own [id="root_file-gallery-config"]')!.value;

const inModal = (selector: string): HTMLElement | null => modalRoot()?.querySelector<HTMLElement>(selector) ?? null;

const buttonNamed = (name: string): HTMLElement | null =>
  Array.from(modalRoot()?.querySelectorAll<HTMLElement>('button, [role="radio"], [role="row"]') ?? []).find(
    (button) => button.textContent?.trim() === name || button.getAttribute("aria-label") === name,
  ) ?? null;

/** Der eigene Dialog neben einem fremden mit gleichen Feldnamen. */
function Dialogs({ formData }: { formData: Record<string, unknown> }): React.ReactElement {
  return (
    <>
      <div id="own">
        <Form schema={configurationSchema} validator={validator} formData={formData} />
      </div>
      <form id="foreign">
        <div data-row="layout">
          <label htmlFor="root_layout">Layout</label>
          <input id="root_layout" defaultValue="grid" />
        </div>
      </form>
    </>
  );
}

async function open(formData: Record<string, unknown>): Promise<{ container: HTMLElement; stop: () => void }> {
  const { container } = render(<Dialogs formData={formData} />);
  let stop = (): void => {};
  await act(async () => {
    stop = startFileGalleryDialog(container);
  });
  await settleEditor(EDITOR_SELECTOR);
  return { container, stop };
}

const apply = (): Promise<void> => clickElement(inModal('[data-testid="config-shell-apply"]'));

describe("Nachladen", () => {
  // Muss zuerst laufen: einmal geladen, bleibt das Modul im Speicher.
  it("lädt den Editor erst, wenn ein eigener Dialog erscheint", async () => {
    const container = document.createElement("div");
    document.body.append(container);
    const stop = startFileGalleryDialog(container);
    await settleModal();

    expect(mockEditorLoaded).not.toHaveBeenCalled();
    await act(async () => stop());
    container.remove();

    const opened = await open({});
    expect(mockEditorLoaded).toHaveBeenCalledTimes(1);
    expect(inModal('[data-testid="file-gallery-editor"]')).not.toBeNull();
    await act(async () => opened.stop());
  });
});

describe("startFileGalleryDialog", () => {
  it("öffnet das Fenster im gemeinsamen Rahmen mit Vorschau-Umschalter", async () => {
    const { stop } = await open({});

    expect(modalRoot()!.textContent).toContain("Dateigalerie");
    expect(modalRoot()!.querySelector("h1")).toHaveTextContent("Dateien auswählen");
    expect(inModal('[aria-label="Ansicht"]')).not.toBeNull();
    expect(inModal('[role="grid"][aria-label="Quellen"]')).toHaveTextContent("Formulare Personal");

    await act(async () => stop());
  });

  it("blendet die alten Felder nur im eigenen Dialog aus", async () => {
    const { container, stop } = await open({});

    for (const key of LEGACY_ATTRIBUTES) {
      const field = container.querySelector(`#own [id="root_${key}"]`);
      expect(field).not.toBeNull();
      expect(field!.closest<HTMLElement>('[style*="display: none"]')).not.toBeNull();
    }
    expect(container.querySelector<HTMLElement>('#foreign [data-row="layout"]')?.style.display).toBe("");

    await act(async () => stop());
    expect(container.querySelector('#own [id="root_layout"]')!.closest('[style*="display: none"]')).toBeNull();
  });

  const LEGACY_BLOCK = {
    "collection-id": FORMS,
    "max-items": 5,
    layout: "list",
    sort: "name-desc",
    "filter-field": "extension",
    "filter-operator": "equals",
    filter: "pdf",
  };

  it("schreibt beim bloßen Öffnen nichts – auch nicht per Tastenkürzel", async () => {
    const { container, stop } = await open(LEGACY_BLOCK);
    expect(inModal('[data-testid="config-shell-apply"]')).toBeDisabled();
    expect(inModal('[data-testid="file-gallery-heading"]')).toHaveTextContent("Formulare Personal");
    expect(buttonNamed("Liste")).toHaveAttribute("aria-checked", "true");

    await act(async () => {
      fireEvent.keyDown(inModal('[data-testid="config-shell"]')!, { key: "s", metaKey: true });
    });

    expect(fieldValue(container)).toBe("");
    await act(async () => stop());
  });

  it("übernimmt mit einer Änderung die lesbaren alten Felder; sonst wirkt am Block alles wie bisher", async () => {
    const { container, stop } = await open(LEGACY_BLOCK);

    await clickElement(buttonNamed("Kacheln"));
    await apply();

    const written = fieldValue(container);
    // RJSF mit MUI: Auswahlfelder über ihr verstecktes Eingabefeld lesbar.
    expect(readFileGalleryConfig(written)).toEqual({
      collectionId: FORMS,
      sort: "name-desc",
      filterField: "extension",
      filterOperator: "equals",
      filter: "pdf",
      layout: "box",
      maxItems: 5,
    });
    expect(resolveFileGallerySettings({ ...LEGACY_BLOCK, "file-gallery-config": written })).toEqual({
      ...resolveFileGallerySettings(LEGACY_BLOCK),
      layout: "box",
    });

    await act(async () => stop());
  });

  it("schreibt Geändertes nach file-gallery-config und lässt die alten Felder stehen", async () => {
    const { container, stop } = await open({ "max-items": 5 });

    await clickElement(buttonNamed("Liste"));
    expect(inModal('[role="status"]')).toHaveTextContent("Darstellung geändert");
    await apply();

    expect(readFileGalleryConfig(fieldValue(container))).toEqual(
      expect.objectContaining({ layout: "list", maxItems: 5 }),
    );
    expect(container.querySelector<HTMLInputElement>('#own [id="root_max-items"]')!.value).toBe("5");

    await act(async () => stop());
  });

  it("nimmt eine vorhandene file-gallery-config vor den alten Feldern", async () => {
    const config = serializeFileGalleryConfig({ collectionId: FORMS, layout: "box" });
    const { stop } = await open({ "file-gallery-config": config, layout: "list" });

    expect(buttonNamed("Kacheln")).toHaveAttribute("aria-checked", "true");
    expect(inModal('[role="row"][aria-selected="true"]')).toHaveTextContent("Formulare Personal");

    await act(async () => stop());
  });

  it("übernimmt keinen ungültigen regulären Ausdruck", async () => {
    const config = serializeFileGalleryConfig({ filterOperator: "regex", filter: "(" });
    const { container, stop } = await open({ "file-gallery-config": config });

    await clickElement(buttonNamed("Liste"));
    await apply();

    expect(fieldValue(container)).toBe(config);
    // Ein einzelner Fehler steht im Status mit seinem Text, am Feld „Wert“ ebenso.
    expect(inModal('[role="status"]')).toHaveTextContent("Der Filter ist kein gültiger regulärer Ausdruck");
    expect(inModal('[role="alert"]')).toHaveTextContent("Der Filter ist kein gültiger regulärer Ausdruck");

    await act(async () => stop());
  });

  it("zeigt in der Vorschau die echten Dateien der Quelle", async () => {
    const config = serializeFileGalleryConfig({ collectionId: FORMS });
    const { stop } = await open({ "file-gallery-config": config });

    await clickElement(buttonNamed("Desktop"));
    await settleModal();

    expect(inModal('[data-testid="file-gallery-preview"]')).toHaveAttribute("inert");
    expect(inModal('[data-testid="file-gallery-preview"]')).toHaveTextContent("Antrag Elternzeit.pdf");
    expect(inModal('[aria-label="Einstellungen"]')).not.toBeNull();

    await act(async () => stop());
  });
});

describe("fileGalleryEditorShell", () => {
  it("erklärt in der Hilfe Quelle, Filter, Reihenfolge und den Weg von Hand", async () => {
    const { container } = render(<>{fileGalleryEditorShell.help}</>);
    await act(async () => undefined);

    expect(container).toHaveTextContent("Alle Dateien");
    expect(container).toHaveTextContent("Regex");
    expect(container).toHaveTextContent("Höchstens");
    expect(container).toHaveTextContent("Sammlungs-ID von Hand eintragen");
  });
});
