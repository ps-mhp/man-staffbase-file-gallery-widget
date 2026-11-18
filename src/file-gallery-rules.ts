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

/**
 * Prüfung und Status des Fensters „Dateien auswählen“.
 *
 * Liegt im Seitenbündel, nicht beim nachgeladenen Editor: der Rahmen braucht
 * beides schon, bevor der Editor da ist. Darum nur reine Funktionen, nichts
 * aus `@man/config-ui` außer Typen.
 */

import type { ValidationIssue } from "@man/config-ui/shell/shell-context";

import { parseFileFilter } from "./file-collection";
import { FileGalleryConfig, FileGallerySettings, shownSettings } from "./file-gallery-config";
import { MESSAGES } from "./file-gallery";

/** Kennung der Meldung zum Filterwert; das Feld „Wert“ zeigt sie. */
export const FILTER_ISSUE = "filter";

/**
 * Was so nicht auf die Seite darf. Ein ungültiger regulärer Ausdruck ließe
 * die Galerie statt der Dateien nur eine Fehlermeldung zeigen.
 */
export function validateFileGalleryConfig(config: FileGalleryConfig): ValidationIssue[] {
  const { filterField, filterOperator, filter } = shownSettings(config);
  const parsed = parseFileFilter({ field: filterField, operator: filterOperator, value: filter });
  if (parsed === null || !("error" in parsed)) return [];
  return [{ id: FILTER_ISSUE, message: `${MESSAGES.badFilter}: ${parsed.error}` }];
}

function joinGerman(parts: readonly string[]): string {
  if (parts.length <= 1) return parts.join("");
  return `${parts.slice(0, -1).join(", ")} und ${parts[parts.length - 1]}`;
}

const differs = (a: FileGallerySettings, b: FileGallerySettings, keys: readonly (keyof FileGallerySettings)[]): boolean =>
  keys.some((key) => a[key] !== b[key]);

/**
 * Was sich gegenüber dem übernommenen Stand geändert hat, so wie es zu sehen
 * ist: „Quelle gewählt“, „Filter geändert“, „Quelle gewählt, Filter und
 * Darstellung geändert“. Verglichen wird das Gezeigte – ein Teil des Filters,
 * der nur mitgeschrieben wurde, ist keine Änderung.
 */
export function fileGalleryChangesStatus(draft: FileGalleryConfig, saved: FileGalleryConfig): string | undefined {
  const now = shownSettings(draft);
  const before = shownSettings(saved);
  const changed = [
    differs(now, before, ["filterField", "filterOperator", "filter"]) && "Filter",
    differs(now, before, ["sort"]) && "Reihenfolge",
    differs(now, before, ["layout", "maxItems"]) && "Darstellung",
  ].filter((part): part is string => part !== false);
  const parts = [
    now.collectionId !== before.collectionId && "Quelle gewählt",
    changed.length > 0 && `${joinGerman(changed)} geändert`,
  ].filter((part): part is string => part !== false);
  return parts.length === 0 ? undefined : parts.join(", ");
}
