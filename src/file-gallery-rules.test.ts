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

import { FILTER_ISSUE, fileGalleryChangesStatus, validateFileGalleryConfig } from "./file-gallery-rules";

const COLLECTION = "699465f50cd34b34daa5c188";

describe("validateFileGalleryConfig", () => {
  it("lässt jede Konfiguration ohne kaputten regulären Ausdruck durch", () => {
    expect(validateFileGalleryConfig({})).toEqual([]);
    expect(validateFileGalleryConfig({ filterOperator: "contains", filter: "(" })).toEqual([]);
    expect(validateFileGalleryConfig({ filterOperator: "regex", filter: "^2026-\\d\\d_PIM_" })).toEqual([]);
    expect(validateFileGalleryConfig({ filterOperator: "regex", filter: "" })).toEqual([]);
  });

  it("hält einen ungültigen regulären Ausdruck auf", () => {
    expect(validateFileGalleryConfig({ filterOperator: "regex", filter: "(" })).toEqual([
      { id: FILTER_ISSUE, message: expect.stringContaining("Der Filter ist kein gültiger regulärer Ausdruck: ") },
    ]);
  });
});

describe("fileGalleryChangesStatus", () => {
  it("nennt, was sich gegenüber dem übernommenen Stand geändert hat", () => {
    expect(fileGalleryChangesStatus({ filter: "Antrag" }, {})).toBe("Filter geändert");
    expect(fileGalleryChangesStatus({ collectionId: COLLECTION }, { collectionId: "" })).toBe("Quelle gewählt");
    expect(fileGalleryChangesStatus({ sort: "oldest", layout: "list" }, {})).toBe("Reihenfolge und Darstellung geändert");
    expect(
      fileGalleryChangesStatus({ collectionId: COLLECTION, filter: "x", sort: "oldest", maxItems: 3 }, { collectionId: "" }),
    ).toBe("Quelle gewählt, Filter, Reihenfolge und Darstellung geändert");
  });

  it("zählt mitgeschriebene, gleich aussehende Teile des Filters nicht", () => {
    expect(fileGalleryChangesStatus({ filterField: "fileName", filterOperator: "contains", filter: "" }, {})).toBeUndefined();
    expect(fileGalleryChangesStatus({}, {})).toBeUndefined();
  });
});
