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

import {
  CollectionEntry,
  filterCollections,
  findCollection,
  loadCollections,
} from "./collection-catalog";

const id = (n: number): string => n.toString(16).padStart(24, "0");
const json = (body: unknown): Response => new Response(JSON.stringify(body), { status: 200 });

afterEach(() => jest.restoreAllMocks());

describe("loadCollections", () => {
  it("liefert Name und Dateizahl je Sammlung und verwirft, was keine ID hat", async () => {
    jest.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      json({
        entries: [
          { id: id(1), name: " Formulare Personal ", mediumCount: 12 },
          { id: id(2), name: "" },
          { id: "kaputt", name: "X" },
        ],
        cursor: null,
      }),
    );

    await expect(loadCollections()).resolves.toEqual([
      { id: id(1), name: "Formulare Personal", count: 12 },
      { id: id(2), name: id(2), count: null },
    ]);
  });
});

describe("filterCollections", () => {
  const collections: CollectionEntry[] = [
    { id: id(1), name: "Formulare Personal", count: 3 },
    { id: id(2), name: "Logos und Markenzeichen", count: null },
  ];

  it("findet Sammlungen nach Name, ohne auf Groß- und Kleinschreibung zu achten, und nach ID", () => {
    expect(filterCollections(collections, "  LOGO ")).toEqual([collections[1]]);
    expect(filterCollections(collections, id(1))).toEqual([collections[0]]);
    expect(filterCollections(collections, "")).toBe(collections);
  });

  it("findet die gewählte Sammlung nur, wenn sie in der Liste steht", () => {
    expect(findCollection(collections, id(2))).toBe(collections[1]);
    expect(findCollection([], id(2))).toBeUndefined();
    expect(findCollection(collections, null)).toBeUndefined();
  });
});
