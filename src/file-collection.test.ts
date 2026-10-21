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
  FileSelection,
  GalleryFile,
  collectionCatalogSource,
  fetchCollectionFiles,
  fetchFiles,
  parseFileFilter,
  selectFiles,
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
  it("follows the cursor and returns every file", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce(json({ entries: [entry(id(1)), entry(id(2))], cursor: "next" }))
      .mockResolvedValueOnce(json({ entries: [entry(id(3))], cursor: "more" }))
      .mockResolvedValueOnce(json({ entries: [], cursor: "more" }));

    const files = await fetchCollectionFiles(COLLECTION, fetchImpl);

    expect(files.map((f) => f.id)).toEqual([id(1), id(2), id(3)]);
    expect(fetchImpl.mock.calls[1][0]).toContain("cursor=next");
  });

  it("reports the HTTP status of a refused request", async () => {
    const fetchImpl = jest.fn().mockResolvedValue(new Response("", { status: 403 }));
    await expect(fetchCollectionFiles(COLLECTION, fetchImpl)).rejects.toMatchObject({ name: "CollectionError", status: 403 });
  });

  it("refuses an id that is not a Staffbase id without asking the API", async () => {
    const fetchImpl = jest.fn();
    await expect(fetchCollectionFiles("../users", fetchImpl)).rejects.toBeInstanceOf(CollectionError);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe("fetchFiles without a collection", () => {
  it("merges all visible collections and lists a shared file once", async () => {
    const fetchImpl = jest.fn(async (url: string) => {
      if (url.includes("/entries")) {
        return json({ entries: url.includes(id(10)) ? [entry(id(1)), entry(id(2))] : [entry(id(2)), entry(id(3))] });
      }
      return json({ entries: [{ id: id(10) }, { id: id(11) }] });
    });

    const files = await fetchFiles(null, fetchImpl as unknown as typeof fetch);

    expect(files.map((f) => f.id).sort()).toEqual([id(1), id(2), id(3)]);
  });
});

describe("selectFiles", () => {
  const f = (n: number, overrides: Record<string, unknown> = {}): GalleryFile =>
    toGalleryFile(entry(id(n), { fileName: `f${n}.pdf`, fileExtension: "pdf", ...overrides }))!;
  const base = { sort: "newest", field: "fileName", operator: "contains", value: "", limit: 0 } as const;
  const run = (files: GalleryFile[], over: Partial<FileSelection> = {}): string[] => {
    const selection = { ...base, ...over };
    return selectFiles(files, selection, parseFileFilter(selection)).map((x) => x.fileName);
  };

  const files = [
    f(1, { created: "2026-01-01T00:00:00Z", original: { size: 300, url: "/api/media/a" } }),
    f(2, { created: "2026-03-01T00:00:00Z", original: { size: 100, url: "/api/media/b" } }),
    f(3, { created: "2026-02-01T00:00:00Z", original: { size: 200, url: "/api/media/c" }, fileName: "Bericht.docx", fileExtension: "docx", createdBy: { firstName: "Ada", lastName: "Lovelace" } }),
  ];

  it("sorts newest and oldest first", () => {
    expect(run(files, { sort: "newest" })).toEqual(["f2.pdf", "Bericht.docx", "f1.pdf"]);
    expect(run(files, { sort: "oldest" })).toEqual(["f1.pdf", "Bericht.docx", "f2.pdf"]);
  });

  it("sorts by size", () => {
    expect(run(files, { sort: "size-desc" })).toEqual(["f1.pdf", "Bericht.docx", "f2.pdf"]);
  });

  it("limits after sorting, so '2 newest' are the newest matches", () => {
    expect(run(files, { sort: "newest", limit: 2 })).toEqual(["f2.pdf", "Bericht.docx"]);
    expect(run(files, { sort: "newest", field: "extension", operator: "equals", value: "pdf", limit: 1 })).toEqual(["f2.pdf"]);
  });

  it("supports contains, notContains, startsWith, endsWith and equals case-insensitively", () => {
    expect(run(files, { operator: "contains", value: "BERICHT" })).toEqual(["Bericht.docx"]);
    expect(run(files, { operator: "notContains", value: "bericht", sort: "oldest" })).toEqual(["f1.pdf", "f2.pdf"]);
    expect(run(files, { operator: "startsWith", value: "f1" })).toEqual(["f1.pdf"]);
    expect(run(files, { operator: "endsWith", value: ".DOCX" })).toEqual(["Bericht.docx"]);
    expect(run(files, { field: "extension", operator: "equals", value: "docx" })).toEqual(["Bericht.docx"]);
  });

  it("filters by creator and by regular expression", () => {
    expect(run(files, { field: "creator", operator: "contains", value: "lovelace" })).toEqual(["Bericht.docx"]);
    expect(run(files, { operator: "regex", value: "^f\\d\\.pdf$", sort: "oldest" })).toEqual(["f1.pdf", "f2.pdf"]);
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
  it("treats an empty value as no filter", () => {
    expect(parseFileFilter({ field: "fileName", operator: "contains", value: "  " })).toBeNull();
  });

  it("reports an invalid expression instead of throwing", () => {
    expect(parseFileFilter({ field: "fileName", operator: "regex", value: "(" })).toEqual({ error: expect.any(String) });
  });
});
