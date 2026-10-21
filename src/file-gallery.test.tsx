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
  ...overrides,
});

describe("FileGallery", () => {
  it("asks for a collection when none is configured", () => {
    const loadFiles = jest.fn();
    render(<FileGallery collectionId={null} maxItems={0} loadFiles={loadFiles} />);
    expect(screen.getByText(MESSAGES.missingCollection)).toBeTruthy();
    expect(loadFiles).not.toHaveBeenCalled();
  });

  it("shows each file as a link that opens it, with preview or type badge", async () => {
    const loadFiles = jest.fn().mockResolvedValue({
      files: [file(), file({ id: "69416c7452f71c195ff6a578", fileName: "Bericht.pdf", extension: "pdf", thumbnailUrl: null })],
      total: 2,
    });
    render(<FileGallery collectionId={COLLECTION} maxItems={5} loadFiles={loadFiles} />);

    const link = (await screen.findByText("Fahrerhaus.png")).closest("a");
    expect(link?.getAttribute("href")).toBe(file().url);
    expect(link?.getAttribute("target")).toBe("_blank");
    expect(link?.querySelector("img")?.getAttribute("src")).toBe(file().thumbnailUrl);
    expect(screen.getByText("PDF")).toBeTruthy();
    expect(loadFiles).toHaveBeenCalledWith(COLLECTION, 5, undefined);
  });

  it("explains a refused request as missing access", async () => {
    const loadFiles = jest.fn().mockRejectedValue(new CollectionError("HTTP 403", 403));
    render(<FileGallery collectionId={COLLECTION} maxItems={0} loadFiles={loadFiles} />);
    expect((await screen.findByRole("alert")).textContent).toBe(MESSAGES.forbidden);
  });

  it("says so when the collection is empty", async () => {
    const loadFiles = jest.fn().mockResolvedValue({ files: [], total: 0 });
    render(<FileGallery collectionId={COLLECTION} maxItems={0} loadFiles={loadFiles} />);
    expect(await screen.findByText(MESSAGES.empty)).toBeTruthy();
  });

  it("marks the layout so the list can show the image left of the details", async () => {
    const loadFiles = jest.fn().mockResolvedValue({ files: [file()], total: 1 });
    render(<FileGallery collectionId={COLLECTION} maxItems={0} layout="list" loadFiles={loadFiles} />);
    await screen.findByText("Fahrerhaus.png");
    expect(screen.getByTestId("file-gallery").className).toContain("man-file-gallery--list");
  });

  it("hands the filter to the loader and names a filter without matches", async () => {
    const loadFiles = jest.fn().mockResolvedValue({ files: [], total: 0 });
    render(<FileGallery collectionId={COLLECTION} maxItems={0} filter="pdf$" loadFiles={loadFiles} />);
    expect(await screen.findByText(MESSAGES.noMatch)).toBeTruthy();
    const accept = loadFiles.mock.calls[0][2] as (f: GalleryFile) => boolean;
    expect(accept(file({ fileName: "x.PDF" }))).toBe(true);
    expect(accept(file({ fileName: "x.png" }))).toBe(false);
  });

  it("shows an invalid filter as an error and loads nothing", () => {
    const loadFiles = jest.fn();
    render(<FileGallery collectionId={COLLECTION} maxItems={0} filter="(" loadFiles={loadFiles} />);
    expect(screen.getByRole("alert").textContent).toContain(MESSAGES.badFilter);
    expect(loadFiles).not.toHaveBeenCalled();
  });
});
