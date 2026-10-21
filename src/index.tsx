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

import { startWidget } from "@shared/dev-mode/start-widget";
import { setPublicPathFromBundle } from "@shared/public-path";

// Must run before any dynamic `import()`, so that lazily loaded chunks come
// from the CDN the bundle was served from and not from the hosting page.
setPublicPathFromBundle("file-gallery-widget.js");
import React from "react";
import ReactDOM from "react-dom/client";

import { BlockFactory, BlockDefinition, ExternalBlockDefinition, BaseBlock } from "widget-sdk";
import { fetchEntityCatalog } from "@shared/entity-picker/entity-catalog";
import { startEntityPickerInjector } from "@shared/entity-picker/entity-picker-injector";
import { isStaffbaseId } from "@shared/staffbase/ids";
import {
  COLLECTION_ID_ATTRIBUTE,
  FILTER_ATTRIBUTE,
  LAYOUT_ATTRIBUTE,
  MAX_ITEMS_ATTRIBUTE,
  configurationSchema,
  uiSchema,
} from "./configuration-schema";
import { collectionCatalogSource } from "./file-collection";
import { FileGallery, GalleryLayout } from "./file-gallery";
import icon from "../resources/file-gallery-widget.svg";
import pkg from "../package.json";

/** Attributes handled by the widget; mirrored in the configuration schema. */
const widgetAttributes: string[] = [
  COLLECTION_ID_ATTRIBUTE,
  MAX_ITEMS_ATTRIBUTE,
  LAYOUT_ATTRIBUTE,
  FILTER_ATTRIBUTE,
];

export function readCollectionId(value: unknown): string | null {
  const id = typeof value === "string" ? value.trim() : "";
  return isStaffbaseId(id) ? id : null;
}

export function readMaxItems(value: unknown): number {
  const number = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0;
}

export function readLayout(value: unknown): GalleryLayout {
  return value === "list" ? "list" : "box";
}

/** Exported only so tests can dispose of the observer on teardown. */
export const stopCollectionPickerInjector = startEntityPickerInjector({
  fieldKey: COLLECTION_ID_ATTRIBUTE,
  fetchOptions: () => fetchEntityCatalog(collectionCatalogSource),
  labels: {
    placeholder: "Collection auswählen …",
    manualOption: "Andere Collection-ID eingeben …",
    unavailableNotice: "Die Liste der Collections konnte nicht geladen werden. Bitte die Collection-ID eintragen.",
  },
});

const factory: BlockFactory = (BaseBlockClass, _widgetApi) => {
  return class FileGalleryWidgetBlock extends BaseBlockClass implements BaseBlock {
    private _root: ReactDOM.Root | null = null;

    public renderBlock(container: HTMLElement): void {
      const attrs = this.parseAttributes<Record<string, unknown>>();
      this._root ??= ReactDOM.createRoot(container);
      this._root.render(
        <FileGallery
          collectionId={readCollectionId(attrs[COLLECTION_ID_ATTRIBUTE])}
          maxItems={readMaxItems(attrs[MAX_ITEMS_ATTRIBUTE])}
          layout={readLayout(attrs[LAYOUT_ATTRIBUTE])}
          filter={typeof attrs[FILTER_ATTRIBUTE] === "string" ? (attrs[FILTER_ATTRIBUTE] as string) : ""}
        />,
      );
    }

    public unmountBlock(_container: HTMLElement): void {
      this._root?.unmount();
      this._root = null;
    }

    public static get observedAttributes(): string[] {
      return widgetAttributes;
    }

    public attributeChangedCallback(...args: [string, string | undefined, string | undefined]): void {
      super.attributeChangedCallback.apply(this, args);
    }
  };
};

const blockDefinition: BlockDefinition = {
  name: "file-gallery-widget",
  factory: factory,
  attributes: widgetAttributes,
  blockLevel: "block",
  configurationSchema: configurationSchema,
  uiSchema: uiSchema,
  label: "Dateigalerie",
  iconUrl: icon,
};

const externalBlockDefinition: ExternalBlockDefinition = {
  blockDefinition,
  author: pkg.author,
  version: pkg.version,
};

if (typeof window.defineBlock === "function") {
  void startWidget({
    name: "file-gallery-widget",
    version: pkg.version,
    register: () => window.defineBlock(externalBlockDefinition),
  });
}
