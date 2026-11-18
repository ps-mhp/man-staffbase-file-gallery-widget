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

import { readLegacyFromDialog, startHiddenFields } from "./legacy-fields";

const OWN = "file-gallery-config";
const LEGACY = ["collection-id", "max-items", "layout", "filter", "filter-field", "filter-operator", "sort"];

function row(key: string, value = ""): string {
  return `<div data-row="${key}"><label for="root_${key}">${key}</label><input id="root_${key}" value="${value}"><p>Hilfe</p></div>`;
}

const rowOf = (selector: string): HTMLElement | null => document.querySelector<HTMLElement>(selector);

afterEach(() => {
  document.body.innerHTML = "";
});

describe("startHiddenFields", () => {
  it("blendet die alten Felder im eigenen Dialog ganz aus und lässt das eigene stehen", () => {
    document.body.innerHTML = `<form>${row(OWN)}${LEGACY.map((key) => row(key)).join("")}</form>`;

    const stop = startHiddenFields();

    for (const key of LEGACY) expect(rowOf(`[data-row="${key}"]`)?.style.display).toBe("none");
    expect(rowOf(`[data-row="${OWN}"]`)?.style.display).toBe("");
    stop();
  });

  it("erfasst Felder, die erst später erscheinen, und gibt sie beim Aufhören wieder frei", async () => {
    document.body.innerHTML = "<form></form>";
    const stop = startHiddenFields();

    document.querySelector("form")?.insertAdjacentHTML("beforeend", `${row(OWN)}${row("layout")}`);
    await Promise.resolve();

    const layout = rowOf('[data-row="layout"]');
    expect(layout?.style.display).toBe("none");
    stop();
    expect(layout?.style.display).toBe("");
  });

  // Studio lädt alle Widget-Bündel in dasselbe Dokument, und `layout` oder
  // `filter` sind naheliegende Namen auch für andere Widgets.
  it("lässt den Dialog eines anderen Widgets mit gleichen Feldnamen unberührt", () => {
    document.body.innerHTML =
      `<form id="foreign"><div data-wrap>${row("config")}${row("layout")}${row("sort")}</div></form>` +
      `<form id="own">${row(OWN)}${row("layout")}</form>`;

    const stop = startHiddenFields();

    expect(rowOf('#foreign [data-row="layout"]')?.style.display).toBe("");
    expect(rowOf('#foreign [data-row="sort"]')?.style.display).toBe("");
    expect(rowOf("#foreign [data-wrap]")?.style.display).toBe("");
    expect(rowOf('#own [data-row="layout"]')?.style.display).toBe("none");
    stop();
  });

  it("beobachtet nur den übergebenen Teilbaum", () => {
    document.body.innerHTML = `<div id="scope"><form>${row(OWN)}${row("filter")}</form></div><form>${row(OWN)}${row("filter")}</form>`;

    const stop = startHiddenFields(LEGACY, OWN, document.getElementById("scope")!);

    expect(rowOf('#scope [data-row="filter"]')?.style.display).toBe("none");
    expect(rowOf('body > form [data-row="filter"]')?.style.display).toBe("");
    stop();
  });
});

describe("readLegacyFromDialog", () => {
  it("liest die alten Felder aus dem eigenen Dialog, nicht aus einem fremden", () => {
    document.body.innerHTML =
      `<form id="foreign">${row("config")}${row("layout", "grid")}</form>` +
      `<form id="own">${row(OWN)}${row("collection-id", "abc")}${row("layout", "list")}${row("max-items", "5")}</form>`;

    expect(readLegacyFromDialog()).toEqual({ "collection-id": "abc", layout: "list", "max-items": "5" });
  });

  it("liefert nichts ohne eigenen Dialog", () => {
    document.body.innerHTML = `<form>${row("layout", "list")}</form>`;

    expect(readLegacyFromDialog()).toEqual({});
  });

  // Im Content Designer sind Auswahlfelder keine echten `<select>`: was dort
  // `root_<key>` trägt, hat keinen lesbaren Wert. Der Schlüssel fehlt dann.
  it("überspringt Felder ohne lesbaren Wert", () => {
    document.body.innerHTML = `<form>${row(OWN)}<div id="root_sort" role="combobox">Älteste zuerst</div></form>`;

    expect(readLegacyFromDialog()).toEqual({});
  });

  // RJSF schreibt die Stelle der Option, nicht ihren Wert.
  it("übersetzt die Stelle einer Option in ihren Wert", () => {
    document.body.innerHTML =
      `<form>${row(OWN)}<select id="root_sort"><option value="0">Neueste</option>` +
      `<option value="1" selected>Älteste</option></select></form>`;

    expect(readLegacyFromDialog()).toEqual({ sort: "oldest" });
  });

  // MUI legt die Kennung auf ein `div`, der Wert steht im versteckten Feld mit dem Namen daneben.
  it("liest eine MUI-Auswahl über ihr verstecktes Eingabefeld", () => {
    document.body.innerHTML =
      `<form>${row(OWN)}<div class="row"><div id="root_filter-operator" role="combobox">Ist gleich</div>` +
      `<input aria-hidden="true" tabindex="-1" id="_r_8_" name="root_filter-operator" value="4"></div></form>`;

    expect(readLegacyFromDialog()).toEqual({ "filter-operator": "equals" });
  });

  it("lässt Text und Zahlen in Textfeldern, wie sie sind", () => {
    document.body.innerHTML = `<form>${row(OWN)}${row("filter", "2026")}${row("max-items", "0")}</form>`;

    expect(readLegacyFromDialog()).toEqual({ filter: "2026", "max-items": "0" });
  });
});
