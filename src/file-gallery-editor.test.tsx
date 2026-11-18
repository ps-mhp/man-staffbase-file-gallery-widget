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

import * as React from "react";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfigShellProvider, type ConfigView } from "@man/config-ui/shell/shell-context";

import type { CollectionEntry, CollectionLoader } from "./collection-catalog";
import type { GalleryFile } from "./file-collection";
import type { FileGalleryConfig } from "./file-gallery-config";
import { FileGalleryEditor } from "./file-gallery-editor";
import type { FileLoader } from "./file-gallery-preview";

const FORMS = "aaaaaaaaaaaaaaaaaaaaaaaa";
const LOGOS = "bbbbbbbbbbbbbbbbbbbbbbbb";
const ELSEWHERE = "cccccccccccccccccccccccc";

const COLLECTIONS: CollectionEntry[] = [
  { id: FORMS, name: "Formulare Personal", count: 12 },
  { id: LOGOS, name: "Logos und Markenzeichen", count: 1 },
];

const file = (name: string): GalleryFile => ({
  id: name.padStart(24, "0").slice(-24).replace(/[^0-9a-f]/g, "0"),
  fileName: name,
  type: "raw",
  extension: "pdf",
  url: `/api/media/secure/${name}`,
  thumbnailUrl: null,
  bytes: 1024,
  created: "2026-10-01T10:00:00.000Z",
  creator: null,
});

interface HarnessProps {
  initial: FileGalleryConfig;
  loadCollections: CollectionLoader;
  loadFiles: FileLoader;
  onChange: (value: FileGalleryConfig) => void;
}

/** Hält den Entwurf wie der Rahmen: der Editor ist gesteuert. */
function Harness({ initial, loadCollections, loadFiles, onChange }: HarnessProps): React.ReactElement {
  const [value, setValue] = React.useState(initial);
  return (
    <FileGalleryEditor
      value={value}
      loadCollections={loadCollections}
      loadFiles={loadFiles}
      onChange={(next) => {
        onChange(next);
        setValue(next);
      }}
    />
  );
}

interface Options {
  view?: ConfigView;
  issuesVisible?: boolean;
  loadCollections?: CollectionLoader;
  loadFiles?: FileLoader;
}

async function renderEditor(initial: FileGalleryConfig = {}, options: Options = {}) {
  const onChange = jest.fn();
  const loadCollections = options.loadCollections ?? jest.fn().mockResolvedValue(COLLECTIONS);
  const loadFiles = options.loadFiles ?? jest.fn<ReturnType<FileLoader>, Parameters<FileLoader>>().mockResolvedValue([]);
  const shell = { view: options.view ?? "editor", setView: jest.fn(), preview: true, issuesVisible: options.issuesVisible ?? false };
  const view = render(
    <ConfigShellProvider value={shell}>
      <Harness initial={initial} loadCollections={loadCollections} loadFiles={loadFiles} onChange={onChange} />
    </ConfigShellProvider>,
  );
  await act(async () => undefined);
  return { ...view, onChange, loadFiles, lastValue: (): FileGalleryConfig => onChange.mock.lastCall?.[0] };
}

const sources = (): HTMLElement => screen.getByRole("grid", { name: "Quellen" });
const heading = (): HTMLElement => screen.getByTestId("file-gallery-heading");

async function choose(field: string, option: string): Promise<void> {
  await userEvent.click(screen.getByRole("combobox", { name: field }));
  await userEvent.click(await screen.findByRole("option", { name: option }));
}

describe("FileGalleryEditor – Quelle", () => {
  it("zeigt „Alle Dateien“ und die Sammlungen mit Dateizahl", async () => {
    await renderEditor();

    const rows = within(sources()).getAllByRole("row");
    expect(rows.map((row) => row.textContent)).toEqual([
      "Alle Dateienohne Einschränkung",
      "Formulare PersonalSammlung · 12 Dateien",
      "Logos und MarkenzeichenSammlung · 1 Datei",
    ]);
    expect(screen.getByText("(3)")).toBeInTheDocument();
    expect(rows[0]).toHaveAttribute("aria-selected", "true");
    expect(heading()).toHaveTextContent("Alle Dateien");
    expect(heading()).toHaveTextContent("Alle Sammlungen als Quelle");
    expect(heading()).toHaveTextContent("Dateien, die in keiner Sammlung liegen, erscheinen dabei nicht.");
  });

  it("wählt eine Sammlung und zurück „Alle Dateien“", async () => {
    const { lastValue } = await renderEditor({ layout: "list" });

    await userEvent.click(within(sources()).getByRole("row", { name: /Formulare Personal/ }));
    expect(lastValue()).toEqual({ layout: "list", collectionId: FORMS });
    expect(heading()).toHaveTextContent("Formulare Personal");
    expect(heading()).toHaveTextContent("Sammlung als Quelle");

    await userEvent.click(within(sources()).getByRole("row", { name: /Alle Dateien/ }));
    expect(lastValue()).toEqual({ layout: "list", collectionId: "" });
  });

  it("sucht Sammlungen; Escape leert erst die Suche", async () => {
    await renderEditor();
    const search = screen.getByRole("searchbox", { name: "Sammlung suchen" });

    await userEvent.type(search, "logo");
    expect(within(sources()).getAllByRole("row")).toHaveLength(1);
    expect(sources()).toHaveTextContent("Logos und Markenzeichen");

    fireEvent.keyDown(search, { key: "Escape" });
    expect(search).toHaveValue("");
    expect(within(sources()).getAllByRole("row")).toHaveLength(3);
  });

  it("nennt eine Sammlung, die nicht in der Liste steht, mit ihrer ID", async () => {
    await renderEditor({ collectionId: ELSEWHERE });

    expect(heading()).toHaveTextContent(ELSEWHERE);
    expect(heading()).toHaveTextContent("Sammlung · nicht in der Liste");
  });

  it("bietet „Alle Dateien“ auch, wenn die Sammlungen nicht laden, und lädt auf Wunsch neu", async () => {
    const loadCollections = jest.fn().mockRejectedValueOnce(new Error("HTTP 500")).mockResolvedValueOnce(COLLECTIONS);
    await renderEditor({}, { loadCollections });

    expect(screen.getByRole("alert")).toHaveTextContent("Die Sammlungen konnten nicht geladen werden.");
    expect(within(sources()).getAllByRole("row")).toHaveLength(1);

    await userEvent.click(screen.getByRole("button", { name: "Erneut versuchen" }));
    expect(within(sources()).getAllByRole("row")).toHaveLength(3);
  });

  it("nimmt eine Sammlungs-ID oder Adresse von Hand", async () => {
    const { lastValue } = await renderEditor();

    await userEvent.click(screen.getByRole("button", { name: "Sammlungs-ID von Hand eintragen" }));
    const input = screen.getByRole("textbox", { name: "Sammlungs-ID oder Adresse" });
    await userEvent.type(input, "keine-id");
    expect(screen.getByText("Keine gültige ID erkannt")).toBeInTheDocument();

    await userEvent.clear(input);
    await userEvent.type(input, `https://app.example.test/studio/media/collections/${ELSEWHERE}`);
    expect(lastValue()).toEqual({ collectionId: ELSEWHERE });
  });
});

describe("FileGalleryEditor – Filter & Reihenfolge", () => {
  it("zeigt die Felder wie im Screen, Fehlendes mit den Vorgaben", async () => {
    await renderEditor({});

    expect(screen.getByRole("region", { name: "Filter & Reihenfolge" })).toBeInTheDocument();
    expect(screen.getByRole("combobox", { name: "Sortierung" })).toHaveTextContent("Neueste zuerst");
    expect(screen.getByRole("combobox", { name: "Filtern nach" })).toHaveTextContent("Dateiname");
    expect(screen.getByRole("combobox", { name: "Bedingung" })).toHaveTextContent("enthält");
    expect(screen.getByRole("textbox", { name: "Wert" })).toHaveAccessibleDescription(
      "Leer lassen zeigt alle Dateien der Quelle. „Regex“ ist für reguläre Ausdrücke.",
    );
  });

  it("schreibt die Sortierung allein", async () => {
    const { lastValue } = await renderEditor({ layout: "list" });

    await choose("Sortierung", "Name A–Z");

    expect(lastValue()).toEqual({ layout: "list", sort: "name-asc" });
  });

  it("schreibt mit einem Teil des Filters die beiden anderen so mit, wie sie zu sehen sind", async () => {
    const { lastValue } = await renderEditor({});

    await choose("Bedingung", "beginnt mit");
    expect(lastValue()).toEqual({ filterField: "fileName", filterOperator: "startsWith", filter: "" });

    await userEvent.type(screen.getByRole("textbox", { name: "Wert" }), "Antrag");
    expect(lastValue()).toEqual({ filterField: "fileName", filterOperator: "startsWith", filter: "Antrag" });
  });

  it("schlägt für die Dateiendung ein Beispiel vor", async () => {
    await renderEditor({ filterField: "extension" });

    expect(screen.getByRole("textbox", { name: "Wert" })).toHaveAttribute("placeholder", "z. B. pdf");
  });

  it("zeigt einen ungültigen regulären Ausdruck erst nach gescheitertem Übernehmen am Feld", async () => {
    const config: FileGalleryConfig = { filterOperator: "regex", filter: "(" };
    const quiet = await renderEditor(config);
    expect(screen.getByRole("textbox", { name: "Wert" })).not.toHaveAttribute("aria-invalid");
    quiet.unmount();

    await renderEditor(config, { issuesVisible: true });
    expect(screen.getByRole("textbox", { name: "Wert" })).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("alert")).toHaveTextContent("Der Filter ist kein gültiger regulärer Ausdruck");
  });
});

describe("FileGalleryEditor – Darstellung", () => {
  it("wählt die Anordnung über Pills", async () => {
    const { lastValue } = await renderEditor({});
    const group = screen.getByRole("radiogroup", { name: "Anordnung" });

    expect(within(group).getByRole("radio", { name: "Kacheln" })).toHaveAttribute("aria-checked", "true");
    await userEvent.click(within(group).getByRole("radio", { name: "Liste" }));

    expect(lastValue()).toEqual({ layout: "list" });
  });

  it("nimmt nur ganze Zahlen ab 0 als Höchstzahl und lässt das Feld beim Tippen leer", async () => {
    const { onChange, lastValue } = await renderEditor({ maxItems: 5 });
    const input = screen.getByRole("spinbutton", { name: "Höchstens" });
    expect(input).toHaveAccessibleDescription("0 = alle Dateien");

    await userEvent.clear(input);
    expect(input).toHaveValue(null);
    expect(onChange).not.toHaveBeenCalled();

    await userEvent.type(input, "12");
    expect(lastValue()).toEqual({ maxItems: 12 });

    await userEvent.clear(input);
    fireEvent.blur(input);
    expect(input).toHaveValue(12);
  });
});

describe("FileGalleryEditor – Geräteansicht", () => {
  it("zeigt die Vorschau mit dem Entwurf und die Felder in zwei Reitern rechts", async () => {
    const loadFiles = jest.fn<ReturnType<FileLoader>, Parameters<FileLoader>>().mockResolvedValue([
      file("Antrag Elternzeit.pdf"),
      file("Reisekosten.pdf"),
    ]);
    const { lastValue } = await renderEditor({ collectionId: FORMS, filter: "Antrag" }, { view: "desktop", loadFiles });

    const preview = screen.getByTestId("file-gallery-preview");
    expect(preview).toHaveAttribute("inert");
    expect(await within(preview).findByText("Antrag Elternzeit.pdf")).toBeInTheDocument();
    expect(within(preview).queryByText("Reisekosten.pdf")).toBeNull();
    expect(loadFiles).toHaveBeenCalledWith(FORMS);
    expect(screen.queryByTestId("file-gallery-editor")).toBeNull();

    const inspector = screen.getByRole("complementary", { name: "Einstellungen" });
    expect(within(inspector).getByRole("tab", { name: "Filter & Reihenfolge" })).toHaveAttribute("aria-selected", "true");
    await userEvent.click(within(inspector).getByRole("tab", { name: "Darstellung" }));
    await userEvent.click(within(inspector).getByRole("radio", { name: "Liste" }));

    expect(lastValue()).toEqual({ collectionId: FORMS, filter: "Antrag", layout: "list" });
    // Dieselbe Quelle lädt nicht noch einmal.
    expect(loadFiles).toHaveBeenCalledTimes(1);
  });

  it("markiert den Reiter mit einem Fehler", async () => {
    await renderEditor({ filterOperator: "regex", filter: "(" }, { view: "tablet", issuesVisible: true });

    expect(screen.getByRole("tab", { name: /Filter & Reihenfolge.*fehlerhaft/ })).toBeInTheDocument();
  });

  it("zeigt im Editor keinen Inspektor", async () => {
    await renderEditor();

    expect(screen.queryByRole("complementary", { name: "Einstellungen" })).toBeNull();
    expect(screen.getByTestId("file-gallery-editor")).toBeInTheDocument();
  });
});
