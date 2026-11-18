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
 * Die Felder älterer Fassungen im Staffbase-Dialog: lesen und ausblenden.
 *
 * Sie bleiben im Schema, damit der Dialog ihre Werte weiter führt – das
 * Fenster übernimmt die lesbaren beim ersten Öffnen als Ausgangsstand. Zu
 * sehen sollen sie nicht mehr sein: zwei Wege zum selben Wert laden zu
 * Widersprüchen ein.
 *
 * Gefunden wird jedes Feld über das, was RJSF und der Content Designer gleich
 * vergeben: `id="root_<key>"` am Eingabeelement oder `for="root_<key>"` an
 * seiner Beschriftung. Ausgeblendet wird die ganze Zeile: der größte
 * Vorfahre, der kein anderes Feld enthält.
 *
 * Nur im eigenen Dialog – dem Formular, das `file-gallery-config` führt.
 * Studio lädt alle Widget-Bündel in dasselbe Dokument, und `root_<key>` ist
 * widgetübergreifend: `layout` oder `filter` könnte auch ein anderes Widget
 * haben. Dokumentweit ausgeblendet, stiege die Zeile dort bis zum ganzen
 * Formular hoch (so geschehen im Hotspot-Widget bis 0.2.0-rc.7).
 *
 * Gleich gebaut wie `legacy-fields.ts` der Podcast-Anzeige; ein gemeinsamer
 * Baustein wäre der nächste Schritt.
 */

import { configFieldSelector } from "@shared/config-field-injector";

import { FILE_GALLERY_CONFIG_ATTRIBUTE, LEGACY_ATTRIBUTES, configurationSchema } from "./configuration-schema";
import type { LegacyDialogValues } from "./file-gallery-config";

const FIELD_MARK = '[id^="root_"], label[for^="root_"]';

const fieldKeyOf = (element: Element): string =>
  element instanceof HTMLLabelElement ? element.htmlFor : element.id;

function rowOf(anchor: Element): HTMLElement {
  const key = fieldKeyOf(anchor);
  let row = anchor as HTMLElement;
  while (row.parentElement !== null && row.parentElement.tagName !== "FORM") {
    const parent = row.parentElement;
    const foreign = Array.from(parent.querySelectorAll(FIELD_MARK)).some((node) => fieldKeyOf(node) !== key);
    if (foreign) break;
    row = parent;
  }
  return row;
}

function anchorOf(root: ParentNode, key: string): Element | null {
  const id = `root_${key}`;
  return root.querySelector(`[id="${id}"]`) ?? root.querySelector(`label[for="${id}"]`);
}

/** Die Formulare, die das eigene Feld führen – nur dort wird gelesen und ausgeblendet. */
function ownForms(root: ParentNode, ownKey: string): HTMLFormElement[] {
  const forms = Array.from(root.querySelectorAll(`[id="root_${ownKey}"]`)).map((field) => field.closest("form"));
  return Array.from(new Set(forms.filter((form): form is HTMLFormElement => form !== null)));
}

/**
 * Hält die Zeilen dieser Felder verborgen, solange der eigene Dialog sie zeigt.
 * @param keys die auszublendenden Felder.
 * @param ownKey das Feld, an dem der eigene Dialog zu erkennen ist.
 * @param root der zu beobachtende Teilbaum; offengelegt für Tests.
 * @returns eine Funktion, die aufhört und die Zeilen wieder zeigt.
 */
export function startHiddenFields(
  keys: readonly string[] = LEGACY_ATTRIBUTES,
  ownKey: string = FILE_GALLERY_CONFIG_ATTRIBUTE,
  root: ParentNode = document,
): () => void {
  const hidden = new Set<HTMLElement>();

  const apply = (): void => {
    for (const form of ownForms(root, ownKey)) {
      for (const key of keys) {
        const anchor = anchorOf(form, key);
        if (anchor === null) continue;
        const row = rowOf(anchor);
        if (row.style.display !== "none") row.style.display = "none";
        hidden.add(row);
      }
    }
  };

  apply();
  const observer = new MutationObserver(apply);
  const target = root === document ? document.body : (root as Node);
  observer.observe(target, { childList: true, subtree: true });

  return () => {
    observer.disconnect();
    hidden.forEach((row) => {
      row.style.display = "";
    });
    hidden.clear();
  };
}

type FormField = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

const isFormField = (element: Element | null | undefined): element is FormField =>
  element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement;

/**
 * Das Element, das den Wert eines Feldes trägt. Eine MUI-Auswahl legt die
 * Kennung auf ein `div` und den Wert in ein verstecktes Eingabefeld, das nur
 * den Namen `root_<key>` trägt; dann wird das genommen.
 */
function valueElementOf(form: ParentNode, key: string): FormField | null {
  const element = form.querySelector(configFieldSelector(key));
  if (isFormField(element)) return element;
  const named = form.querySelector(`[name="root_${key}"]`);
  return isFormField(named) ? named : null;
}

/** Die Werte eines Auswahlfelds in Schema-Reihenfolge; leer für Textfelder. */
function optionValuesOf(key: string): string[] {
  const property = configurationSchema.properties?.[key];
  if (typeof property !== "object" || !Array.isArray(property.oneOf)) return [];
  return property.oneOf.flatMap((option) =>
    typeof option === "object" && typeof option.const === "string" ? [option.const] : [],
  );
}

/**
 * RJSF schreibt in Auswahlfelder von sich aus die Stelle der Option
 * („0“, „1“), nicht ihren Wert. Zurück zum Wert über die Reihenfolge im Schema.
 */
function decodeOption(key: string, raw: string): string {
  const values = optionValuesOf(key);
  if (values.length === 0 || values.includes(raw) || !/^\d+$/.test(raw)) return raw;
  return values[Number(raw)] ?? raw;
}

/**
 * Der Wert eines Feldes, wenn er lesbar ist. Im Content Designer trägt ein
 * Auswahlfeld `root_<key>` womöglich an einem Element ganz ohne Wert – dann
 * `null`, und das Fenster lässt den Schlüssel weg.
 */
function readableValue(form: ParentNode, key: string): string | null {
  const element = valueElementOf(form, key);
  return element === null ? null : decodeOption(key, element.value);
}

/** Die alten Felder, wie der eigene Dialog sie gerade führt; leer ohne eigenen Dialog. */
export function readLegacyFromDialog(root: ParentNode = document): LegacyDialogValues {
  const [form] = ownForms(root, FILE_GALLERY_CONFIG_ATTRIBUTE);
  if (form === undefined) return {};
  return Object.fromEntries(
    LEGACY_ATTRIBUTES.flatMap((key) => {
      const value = readableValue(form, key);
      return value === null ? [] : [[key, value]];
    }),
  );
}
