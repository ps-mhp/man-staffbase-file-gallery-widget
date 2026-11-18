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

import { encodePayload } from "@shared/payload";

import {
  DEFAULT_SETTINGS,
  FileGalleryConfig,
  configFromLegacy,
  effectiveSettings,
  mergeConfig,
  readFileGalleryConfig,
  readFilterOperator,
  readMaxItems,
  resolveFileGallerySettings,
  serializeFileGalleryConfig,
  shownSettings,
  withFilterPart,
} from "./file-gallery-config";

const COLLECTION = "699465f50cd34b34daa5c188";

describe("Leseseite ohne file-gallery-config", () => {
  // Alte Blöcke: genau wie bis 0.1.0-rc.7 aus den einzelnen Attributen.
  it("liest die einzelnen Attribute wie bisher", () => {
    expect(
      resolveFileGallerySettings({
        "collection-id": COLLECTION,
        "max-items": 5,
        layout: "list",
        sort: "name-asc",
        "filter-field": "extension",
        "filter-operator": "equals",
        filter: "pdf",
      }),
    ).toEqual({
      collectionId: COLLECTION,
      maxItems: 5,
      layout: "list",
      sort: "name-asc",
      filterField: "extension",
      filterOperator: "equals",
      filter: "pdf",
    });
  });

  it("nimmt ohne Attribute die bisherigen Vorgaben, die Bedingung als regulären Ausdruck", () => {
    // Blöcke aus der Zeit, als es nur den Regex-Filter gab, haben keine Bedingung.
    expect(resolveFileGallerySettings({})).toEqual({
      collectionId: null,
      maxItems: 0,
      layout: "box",
      sort: "newest",
      filterField: "fileName",
      filterOperator: "regex",
      filter: "",
    });
  });

  it("verwirft Unbrauchbares wie bisher", () => {
    expect(
      resolveFileGallerySettings({
        "collection-id": "keine-id",
        "max-items": "-3",
        layout: "grid",
        sort: "random",
        "filter-field": "owner",
        "filter-operator": "like",
        // `parseAttributes` macht aus "2026" eine Zahl; die las die Galerie nie als Filter.
        filter: 2026,
      }),
    ).toEqual({ ...DEFAULT_SETTINGS, collectionId: null, filterOperator: "regex" });
  });

  it("liest die Höchstzahl aus Zahl und Text, abgerundet", () => {
    expect(readMaxItems(7.9)).toBe(7);
    expect(readMaxItems("12")).toBe(12);
    expect(readMaxItems("")).toBe(0);
    expect(readFilterOperator(undefined)).toBe("regex");
  });
});

describe("Leseseite mit file-gallery-config", () => {
  const attribute = (config: FileGalleryConfig): string => serializeFileGalleryConfig(config);

  it("nimmt je Schlüssel den neuen Wert vor dem alten Attribut", () => {
    expect(
      resolveFileGallerySettings({
        "file-gallery-config": attribute({ layout: "list", maxItems: 3, filter: "Antrag" }),
        "collection-id": COLLECTION,
        layout: "box",
        "max-items": 10,
        sort: "oldest",
      }),
    ).toEqual({
      collectionId: COLLECTION,
      maxItems: 3,
      layout: "list",
      sort: "oldest",
      filterField: "fileName",
      filterOperator: "regex",
      filter: "Antrag",
    });
  });

  it("lässt eine leere Quelle für „alle Dateien“ gelten, auch vor einer alten Collection", () => {
    expect(
      resolveFileGallerySettings({ "file-gallery-config": attribute({ collectionId: "" }), "collection-id": COLLECTION })
        .collectionId,
    ).toBeNull();
  });

  it("fällt bei einem kaputten Attribut auf die alten Felder zurück", () => {
    expect(resolveFileGallerySettings({ "file-gallery-config": "b64:%%%", layout: "list" }).layout).toBe("list");
    expect(resolveFileGallerySettings({ "file-gallery-config": "[1,2]", sort: "oldest" }).sort).toBe("oldest");
  });
});

describe("readFileGalleryConfig", () => {
  it("liest kodiertes und rohes JSON", () => {
    expect(readFileGalleryConfig(encodePayload('{"sort":"oldest"}'))).toEqual({ sort: "oldest" });
    expect(readFileGalleryConfig('{"layout":"list"}')).toEqual({ layout: "list" });
  });

  it("lässt nur gültige Werte durch", () => {
    expect(
      readFileGalleryConfig(
        JSON.stringify({
          collectionId: "nope",
          sort: "random",
          filterField: "extension",
          filterOperator: "regex",
          filter: 12,
          layout: "list",
          maxItems: -1,
          extra: true,
        }),
      ),
    ).toEqual({ filterField: "extension", filterOperator: "regex", layout: "list" });
    expect(readFileGalleryConfig(JSON.stringify({ maxItems: 4.6, collectionId: "" }))).toEqual({
      collectionId: "",
      maxItems: 4,
    });
  });

  it("liefert ein leeres Objekt für Leeres und Unlesbares", () => {
    expect(readFileGalleryConfig("")).toEqual({});
    expect(readFileGalleryConfig(undefined)).toEqual({});
    expect(readFileGalleryConfig("kein json")).toEqual({});
  });
});

describe("serializeFileGalleryConfig", () => {
  it("schreibt nur gesetzte Schlüssel, kodiert und in fester Reihenfolge", () => {
    const raw = serializeFileGalleryConfig({ maxItems: 2, collectionId: COLLECTION });

    expect(raw.startsWith("b64:")).toBe(true);
    expect(readFileGalleryConfig(raw)).toEqual({ collectionId: COLLECTION, maxItems: 2 });
    expect(raw).toBe(serializeFileGalleryConfig({ collectionId: COLLECTION, maxItems: 2 }));
  });

  it("schreibt nichts für eine leere Konfiguration", () => {
    expect(serializeFileGalleryConfig({})).toBe("");
  });
});

describe("Altwerte aus dem Dialog", () => {
  it("übernimmt lesbare Felder als Konfiguration", () => {
    expect(
      configFromLegacy({
        "collection-id": ` ${COLLECTION} `,
        "max-items": "8",
        layout: "list",
        sort: "size-desc",
        "filter-field": "creator",
        "filter-operator": "startsWith",
        filter: "Ada",
      }),
    ).toEqual({
      collectionId: COLLECTION,
      maxItems: 8,
      layout: "list",
      sort: "size-desc",
      filterField: "creator",
      filterOperator: "startsWith",
      filter: "Ada",
    });
  });

  it("lässt Felder weg, die fehlen oder nichts Gültiges tragen", () => {
    // Weggelassen gilt am Block weiter das alte Attribut.
    expect(configFromLegacy({ sort: "", layout: "grid", "collection-id": "abc" })).toEqual({});
    expect(configFromLegacy({ "collection-id": "", "max-items": "" })).toEqual({ collectionId: "", maxItems: 0 });
  });

  it("lässt gespeicherte Werte vor den alten gelten", () => {
    expect(mergeConfig({ layout: "list", sort: "oldest" }, { layout: "box" })).toEqual({ layout: "box", sort: "oldest" });
  });

  it("lässt einen Filter weg, den die Galerie nie als Filter las", () => {
    // `parseAttributes` machte aus "2026" die Zahl 2026; die Galerie filterte nicht.
    expect(configFromLegacy({ filter: "2026" })).toEqual({});
    expect(configFromLegacy({ filter: "true" })).toEqual({});
    expect(configFromLegacy({ filter: "2026_PIM" })).toEqual({ filter: "2026_PIM" });
    expect(configFromLegacy({ filter: "" })).toEqual({ filter: "" });
  });
});

describe("Öffnen und Übernehmen ändert keinen Block", () => {
  // So kommen die Attribute über `parseAttributes` an der Galerie an …
  const block = {
    "collection-id": COLLECTION,
    "max-items": 5,
    layout: "list",
    sort: "name-desc",
    "filter-field": "extension",
    "filter-operator": "equals",
    filter: 2026,
  };
  // … und so stehen sie als Text im Dialog. Im Content Designer sind die
  // Auswahlfelder nicht lesbar und fehlen.
  const classic = {
    "collection-id": COLLECTION,
    "max-items": "5",
    layout: "list",
    sort: "name-desc",
    "filter-field": "extension",
    "filter-operator": "equals",
    filter: "2026",
  };
  const contentDesigner = { "collection-id": COLLECTION, "max-items": "5", filter: "2026" };

  it.each([
    ["im klassischen Dialog", classic],
    ["im Content Designer", contentDesigner],
  ])("%s", (_, dialog) => {
    const written = serializeFileGalleryConfig(configFromLegacy(dialog));

    expect(resolveFileGallerySettings({ ...block, "file-gallery-config": written })).toEqual(
      resolveFileGallerySettings(block),
    );
  });
});

describe("effectiveSettings", () => {
  it("füllt Fehlendes aus den alten Attributen, dann aus den Vorgaben", () => {
    expect(effectiveSettings({ filter: "x" }, { layout: "list" })).toEqual({
      ...DEFAULT_SETTINGS,
      layout: "list",
      filter: "x",
      filterOperator: "regex",
    });
  });
});

describe("shownSettings", () => {
  it("zeigt Fehlendes mit den Vorgaben des Schemas, die Bedingung als „Enthält“", () => {
    expect(shownSettings({})).toEqual(DEFAULT_SETTINGS);
    expect(DEFAULT_SETTINGS.filterOperator).toBe("contains");
  });

  it("liest „alle Dateien“ und eine Sammlung", () => {
    expect(shownSettings({ collectionId: "" }).collectionId).toBeNull();
    expect(shownSettings({ collectionId: COLLECTION, layout: "list" })).toEqual({
      ...DEFAULT_SETTINGS,
      collectionId: COLLECTION,
      layout: "list",
    });
  });
});

describe("withFilterPart", () => {
  it("schreibt die übrigen Teile des Filters so mit, wie sie zu sehen sind", () => {
    expect(withFilterPart({ layout: "list" }, "filter", "Antrag")).toEqual({
      layout: "list",
      filterField: "fileName",
      filterOperator: "contains",
      filter: "Antrag",
    });
    expect(withFilterPart({ filter: "pdf", filterField: "extension" }, "filterOperator", "equals")).toEqual({
      filterField: "extension",
      filterOperator: "equals",
      filter: "pdf",
    });
  });
});
