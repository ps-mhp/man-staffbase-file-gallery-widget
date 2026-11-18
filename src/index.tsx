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
import { ALL_ATTRIBUTES, configurationSchema, uiSchema } from "./configuration-schema";
import { FileGallery } from "./file-gallery";
import { resolveFileGallerySettings } from "./file-gallery-config";
import { startFileGalleryDialog } from "./file-gallery-dialog";
import icon from "../resources/file-gallery-widget.svg";
import pkg from "../package.json";

/**
 * Die Attribute des Widgets, aus dem Schema genommen, damit beide nicht
 * auseinanderlaufen: `file-gallery-config` zuerst, dahinter die einzelnen
 * Felder älterer Fassungen.
 */
const widgetAttributes: string[] = ALL_ATTRIBUTES;

const factory: BlockFactory = (BaseBlockClass, _widgetApi) => {
  return class FileGalleryWidgetBlock extends BaseBlockClass implements BaseBlock {
    private _root: ReactDOM.Root | null = null;

    public renderBlock(container: HTMLElement): void {
      // `file-gallery-config` je Schlüssel vor den einzelnen Feldern älterer
      // Fassungen; ein alter Block ohne das neue Attribut liest sich wie bisher.
      const settings = resolveFileGallerySettings(this.parseAttributes<Record<string, unknown>>());
      this._root ??= ReactDOM.createRoot(container);
      this._root.render(<FileGallery {...settings} />);
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

// Das Fenster „Dateien auswählen“ hängt am Anmelden, nicht am Laden: auf
// Modulebene gestartet, belegte das installierte Bündel das Feld
// `file-gallery-config`, bevor feststeht, ob ein lokaler Entwicklungsserver
// übernimmt – dann käme die Ansicht von dort, das Fenster aber aus der
// veröffentlichten Fassung (im Hero-Slider-Widget so beobachtet).
if (typeof window.defineBlock === "function") {
  void startWidget({
    name: "file-gallery-widget",
    version: pkg.version,
    register: () => {
      startFileGalleryDialog();
      window.defineBlock(externalBlockDefinition);
    },
  });
}
