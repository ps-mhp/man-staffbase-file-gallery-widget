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
import { render, screen } from "@testing-library/react";

import { CollectionError, GalleryFile } from "./file-collection";
import { FileGallery, MESSAGES } from "./file-gallery";

const COLLECTION = "699465f50cd34b34daa5c188";

const file = (overrides: Partial<GalleryFile> = {}): GalleryFile => ({
  id: "69416c647717816dc7fd000c",
  fileName: "Fahrerhaus.png",
  type: "image",
  extension: "png",
  url: "/api/media/secure/external/v2/image/upload/69416c647717816dc7fd000c.png",
  thumbnailUrl: "/api/media/secure/external/v2/image/upload/t_preview/69416c647717816dc7fd000c.png",
  bytes: 356701,
  created: null,
  creator: null,
  ...overrides,
});

describe("FileGallery", () => {
  it("loads all files when no collection is set", async () => {
    const loadFiles = jest.fn().mockResolvedValue([file()]);
    render(<FileGallery collectionId={null} maxItems={0} loadFiles={loadFiles} />);
    expect(await screen.findByText("Fahrerhaus.png")).toBeTruthy();
    expect(loadFiles).toHaveBeenCalledWith(null);
  });

  it("shows each file as a link that opens it, with preview or type badge", async () => {
    const loadFiles = jest.fn().mockResolvedValue([file(), file({ id: "69416c7452f71c195ff6a578", fileName: "Bericht.pdf", extension: "pdf", thumbnailUrl: null })]);
    render(<FileGallery collectionId={COLLECTION} maxItems={5} loadFiles={loadFiles} />);

    const link = (await screen.findByText("Fahrerhaus.png")).closest("a");
    expect(link?.getAttribute("href")).toBe(file().url);
    expect(link?.getAttribute("target")).toBe("_blank");
    expect(link?.querySelector("img")?.getAttribute("src")).toBe(file().thumbnailUrl);
    expect(screen.getByText("PDF")).toBeTruthy();
  });

  it("explains a refused request as missing access", async () => {
    const loadFiles = jest.fn().mockRejectedValue(new CollectionError("HTTP 403", 403));
    render(<FileGallery collectionId={COLLECTION} maxItems={0} loadFiles={loadFiles} />);
    expect((await screen.findByRole("alert")).textContent).toBe(MESSAGES.forbidden);
  });

  it("says so when the collection is empty", async () => {
    const loadFiles = jest.fn().mockResolvedValue([]);
    render(<FileGallery collectionId={COLLECTION} maxItems={0} loadFiles={loadFiles} />);
    expect(await screen.findByText(MESSAGES.empty)).toBeTruthy();
  });

  it("marks the layout so the list can show the image left of the details", async () => {
    const loadFiles = jest.fn().mockResolvedValue([file()]);
    render(<FileGallery collectionId={COLLECTION} maxItems={0} layout="list" loadFiles={loadFiles} />);
    await screen.findByText("Fahrerhaus.png");
    expect(screen.getByTestId("file-gallery").className).toContain("man-file-gallery--list");
  });

  it("filters and sorts the loaded files without loading again", async () => {
    const loadFiles = jest.fn().mockResolvedValue([
      file({ id: "000000000000000000000001", fileName: "alt.pdf", created: "2026-01-01T00:00:00Z" }),
      file({ id: "000000000000000000000002", fileName: "neu.pdf", created: "2026-03-01T00:00:00Z" }),
      file({ id: "000000000000000000000003", fileName: "neu.png", created: "2026-04-01T00:00:00Z" }),
    ]);
    const { rerender } = render(
      <FileGallery collectionId={null} maxItems={0} filter="pdf" filterOperator="endsWith" loadFiles={loadFiles} />,
    );
    await screen.findByText("neu.pdf");
    expect(screen.queryByText("neu.png")).toBeNull();
    const names = (): string[] => screen.getAllByRole("link").map((a) => a.textContent ?? "");
    expect(names()[0]).toContain("neu.pdf");

    rerender(<FileGallery collectionId={null} maxItems={1} sort="oldest" loadFiles={loadFiles} />);
    expect(names()).toHaveLength(1);
    expect(names()[0]).toContain("alt.pdf");
    expect(loadFiles).toHaveBeenCalledTimes(1);
  });

  it("names a filter without matches", async () => {
    const loadFiles = jest.fn().mockResolvedValue([file()]);
    render(<FileGallery collectionId={COLLECTION} maxItems={0} filter="zzz" loadFiles={loadFiles} />);
    expect(await screen.findByText(MESSAGES.noMatch)).toBeTruthy();
  });

  it("shows an invalid filter as an error", () => {
    const loadFiles = jest.fn().mockReturnValue(new Promise(() => {}));
    render(<FileGallery collectionId={COLLECTION} maxItems={0} filter="(" filterOperator="regex" loadFiles={loadFiles} />);
    expect(screen.getByRole("alert").textContent).toContain(MESSAGES.badFilter);
  });
});
