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
  CollectionError,
  collectionCatalogSource,
  fetchCollectionFiles,
  parseFileFilter,
  toGalleryFile,
} from "./file-collection";

const COLLECTION = "699465f50cd34b34daa5c188";

const entry = (id: string, overrides: Record<string, unknown> = {}): Record<string, unknown> => ({
  id,
  type: "image",
  fileName: `${id}.png`,
  fileExtension: "png",
  created: "2026-10-01T10:00:00.000Z",
  original: { size: 2048, url: `https://www.onetruck.man/api/media/secure/external/v2/image/upload/${id}.png` },
  thumbnail: { url: `https://www.onetruck.man/api/media/secure/external/v2/image/upload/t_preview/${id}.png` },
  ...overrides,
});

const id = (n: number): string => n.toString(16).padStart(24, "0");

const json = (body: unknown, status = 200): Response => new Response(JSON.stringify(body), { status });

describe("toGalleryFile", () => {
  it("rewrites media URLs of a former host to same-origin paths", () => {
    const file = toGalleryFile(entry(id(1)));
    expect(file?.url).toBe(`/api/media/secure/external/v2/image/upload/${id(1)}.png`);
    expect(file?.thumbnailUrl).toBe(`/api/media/secure/external/v2/image/upload/t_preview/${id(1)}.png`);
  });

  it("drops entries whose file is not a media path", () => {
    expect(toGalleryFile(entry(id(1), { original: { url: "javascript:alert(1)" } }))).toBeNull();
    expect(toGalleryFile(entry(id(1), { original: { url: "https://evil.example/x.png" } }))).toBeNull();
    expect(toGalleryFile(entry(id(1), { thumbnail: { url: "data:image/png;base64,AAAA" } }))?.thumbnailUrl).toBeNull();
  });

  it("keeps files without a preview and derives the extension from the name", () => {
    const file = toGalleryFile(entry(id(2), { type: "raw", fileName: "Bericht.PDF", fileExtension: undefined, thumbnail: undefined }));
    expect(file).toMatchObject({ thumbnailUrl: null, extension: "pdf" });
  });
});

describe("fetchCollectionFiles", () => {
  it("follows the cursor until the limit is reached", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(json({ entries: [entry(id(1)), entry(id(2))], cursor: "next", total: 5 }))
      .mockResolvedValueOnce(json({ entries: [entry(id(3)), entry(id(4))], cursor: "more", total: 5 }));

    const page = await fetchCollectionFiles(COLLECTION, 3, undefined, fetchImpl);

    expect(page.files.map((f) => f.id)).toEqual([id(1), id(2), id(3)]);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(fetchImpl.mock.calls[1][0]).toContain("cursor=next");
  });

  it("stops on an empty page even when the API still sends a cursor", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(json({ entries: [entry(id(1))], cursor: "next" }))
      .mockResolvedValueOnce(json({ entries: [], cursor: "next" }));

    const page = await fetchCollectionFiles(COLLECTION, 0, undefined, fetchImpl);

    expect(page.files).toHaveLength(1);
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });

  it("applies the filter before the limit, so matches behind other files are found", async () => {
    const fetchImpl = jest.fn().mockResolvedValueOnce(
      json({
        entries: [entry(id(1), { fileName: "a.png" }), entry(id(2), { fileName: "b.pdf" }), entry(id(3), { fileName: "c.pdf" })],
      }),
    );

    const page = await fetchCollectionFiles(COLLECTION, 1, (f) => f.fileName.endsWith(".pdf"), fetchImpl);

    expect(page.files.map((f) => f.id)).toEqual([id(2)]);
  });

  it("reports the HTTP status of a refused request", async () => {
    const fetchImpl = jest.fn().mockResolvedValue(new Response("", { status: 403 }));
    await expect(fetchCollectionFiles(COLLECTION, 0, undefined, fetchImpl)).rejects.toMatchObject({
      name: "CollectionError",
      status: 403,
    });
  });

  it("refuses an id that is not a Staffbase id without asking the API", async () => {
    const fetchImpl = jest.fn();
    await expect(fetchCollectionFiles("../users", 0, undefined, fetchImpl)).rejects.toBeInstanceOf(CollectionError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("collectionCatalogSource", () => {
  afterEach(() => jest.restoreAllMocks());

  it("pages through all collections", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(json({ entries: [{ id: id(1), name: "A" }], cursor: "c" }))
      .mockResolvedValueOnce(json({ entries: [], cursor: null }));
    await expect(collectionCatalogSource.fetchList()).resolves.toEqual([{ id: id(1), name: "A" }]);
  });

  it("labels a collection with its name and file count", () => {
    expect(collectionCatalogSource.toOption({ id: id(1), name: " Alle Bilder ", mediumCount: 462 })).toEqual({
      id: id(1),
      title: "Alle Bilder (462 Dateien)",
    });
  });
});

describe("parseFileFilter", () => {
  it("treats an empty pattern as no filter and matches case-insensitively", () => {
    expect(parseFileFilter("  ")).toBeNull();
    const filter = parseFileFilter("\\.pdf$");
    expect(filter && "regex" in filter && filter.regex.test("Bericht.PDF")).toBe(true);
  });

  it("reports an invalid expression instead of throwing", () => {
    expect(parseFileFilter("(")).toEqual({ error: expect.any(String) });
  });
});
