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
 * Die Teile des Formulars: Kopf mit der gewählten Quelle, „Filter &
 * Reihenfolge“, „Darstellung“ und – zugeklappt – die Sammlungs-ID von Hand.
 *
 * Aufgebaut wie im Screen: die Quelle wird links gewählt und steht hier nur
 * als Überschrift. Sortierung und die drei Teile des Filters sind Auswahlen
 * (sechs, drei und sechs Optionen), die Anordnung sind Pills.
 *
 * Dieselben Felder stehen in den Geräteansichten im Inspektor, dort knapp
 * (`detailed={false}`): einspaltig und ohne Hinweise, die die Vorschau
 * daneben ohnehin zeigt. Der Fehler zum Filter steht in beiden.
 */

import * as React from "react";
import { Field } from "@man/config-ui/form/field";
import { FormSection } from "@man/config-ui/form/form-section";
import type { SegmentedOption } from "@man/config-ui/form/segmented";
import { SegmentedField } from "@man/config-ui/form/segmented-field";
import { Input } from "@man/config-ui/primitives/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@man/config-ui/primitives/select";
import { cn } from "@man/config-ui/primitives/utils";
import { useConfigShell } from "@man/config-ui/shell/shell-context";
import { isStaffbaseId } from "@shared/staffbase/ids";

import type { FileSort, FilterField, FilterOperator } from "./file-collection";
import type { GalleryLayout } from "./file-gallery";
import { FileGalleryConfig, FilterPart, shownSettings, withFilterPart } from "./file-gallery-config";
import { FILTER_ISSUE, validateFileGalleryConfig } from "./file-gallery-rules";

export interface SectionProps {
  value: FileGalleryConfig;
  onChange: (value: FileGalleryConfig) => void;
}

interface Choice<T extends string> {
  id: T;
  label: string;
}

export const SORT_CHOICES: readonly Choice<FileSort>[] = [
  { id: "newest", label: "Neueste zuerst" },
  { id: "oldest", label: "Älteste zuerst" },
  { id: "name-asc", label: "Name A–Z" },
  { id: "name-desc", label: "Name Z–A" },
  { id: "size-desc", label: "Größte zuerst" },
  { id: "size-asc", label: "Kleinste zuerst" },
];

export const FIELD_CHOICES: readonly Choice<FilterField>[] = [
  { id: "fileName", label: "Dateiname" },
  { id: "extension", label: "Dateiendung" },
  { id: "creator", label: "Hochgeladen von" },
];

export const OPERATOR_CHOICES: readonly Choice<FilterOperator>[] = [
  { id: "contains", label: "enthält" },
  { id: "notContains", label: "enthält nicht" },
  { id: "startsWith", label: "beginnt mit" },
  { id: "endsWith", label: "endet mit" },
  { id: "equals", label: "ist gleich" },
  { id: "regex", label: "Regex" },
];

const LAYOUT_OPTIONS: readonly SegmentedOption<GalleryLayout>[] = [
  { id: "box", label: "Kacheln" },
  { id: "list", label: "Liste" },
];

const FILTER_HINT = "Leer lassen zeigt alle Dateien der Quelle. „Regex“ ist für reguläre Ausdrücke.";
const LAYOUT_HINT = "Kacheln zeigen das Vorschaubild oben, die Liste links neben Name und Größe.";
const HINT = "text-[13px] leading-[1.45] text-muted-foreground";

/** Die Meldung zum Filter, aber erst, wenn „Übernehmen“ an ihr gescheitert ist. */
function useFilterIssue(value: FileGalleryConfig): string | undefined {
  const { issuesVisible } = useConfigShell();
  if (!issuesVisible) return undefined;
  return validateFileGalleryConfig(value).find((issue) => issue.id === FILTER_ISSUE)?.message;
}

interface ChoiceFieldProps<T extends string> {
  label: string;
  choices: readonly Choice<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/** Eine Auswahl mit Beschriftung; das Label zeigt über `Field` auf den Auslöser. */
function ChoiceField<T extends string>({ label, choices, value, onChange, className }: ChoiceFieldProps<T>): React.ReactElement {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as T)}>
      <Field label={label} className={className}>
        <SelectTrigger className="h-10 w-full cursor-pointer">
          <SelectValue />
        </SelectTrigger>
      </Field>
      <SelectContent position="popper">
        {choices.map((choice) => (
          <SelectItem key={choice.id} value={choice.id}>
            {choice.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export interface SourceHeadingProps {
  /** `null` = alle Dateien. */
  collectionId: string | null;
  /** Name der Sammlung, sonst ihre ID. */
  title: string;
  /** Die Zeile daneben, etwa „Sammlung als Quelle“. */
  kicker: string;
}

/** Der Kopf des Formulars: welche Quelle gilt. */
export function SourceHeading({ collectionId, title, kicker }: SourceHeadingProps): React.ReactElement {
  return (
    <div className="flex flex-col gap-1.5" data-testid="file-gallery-heading">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h2 className="text-xl leading-[1.3] font-semibold text-foreground">{title}</h2>
        <span className="text-[13px] text-muted-foreground">{kicker}</span>
      </div>
      {collectionId === null && (
        <p className={HINT}>Dateien, die in keiner Sammlung liegen, erscheinen dabei nicht.</p>
      )}
    </div>
  );
}

export interface FilterFieldsProps extends SectionProps {
  /** Im Formular dreispaltig mit Hinweis; im Inspektor untereinander. */
  detailed: boolean;
}

/** Sortierung und Filter. Ein Teil des Filters schreibt die anderen mit (`withFilterPart`). */
export function FilterFields({ value, onChange, detailed }: FilterFieldsProps): React.ReactElement {
  const shown = shownSettings(value);
  const issue = useFilterIssue(value);
  const hintId = `${React.useId()}-hint`;
  const setPart = <K extends FilterPart>(key: K, part: (typeof shown)[K]): void =>
    onChange(withFilterPart(value, key, part));

  return (
    <div className="flex flex-col gap-4" data-testid="file-gallery-filter-fields">
      <ChoiceField
        label="Sortierung"
        choices={SORT_CHOICES}
        value={shown.sort}
        onChange={(sort) => onChange({ ...value, sort })}
        className={detailed ? "max-w-[320px]" : undefined}
      />
      <div className={cn("gap-4", detailed ? "grid grid-cols-3 max-lg:grid-cols-1" : "flex flex-col")}>
        <ChoiceField
          label="Filtern nach"
          choices={FIELD_CHOICES}
          value={shown.filterField}
          onChange={(field) => setPart("filterField", field)}
        />
        <ChoiceField
          label="Bedingung"
          choices={OPERATOR_CHOICES}
          value={shown.filterOperator}
          onChange={(operator) => setPart("filterOperator", operator)}
        />
        <Field label="Wert" error={issue}>
          <Input
            className="h-10"
            value={shown.filter}
            placeholder={shown.filterField === "extension" ? "z. B. pdf" : undefined}
            aria-describedby={hintId}
            onChange={(event) => setPart("filter", event.target.value)}
          />
        </Field>
      </div>
      <p id={hintId} className={HINT}>
        {FILTER_HINT}
      </p>
    </div>
  );
}

export interface DisplayFieldsProps extends SectionProps {
  /** Im Formular mit Hinweis zur Anordnung. */
  detailed: boolean;
}

/** Anordnung und Höchstzahl. */
export function DisplayFields({ value, onChange, detailed }: DisplayFieldsProps): React.ReactElement {
  const shown = shownSettings(value);
  return (
    <div className="flex flex-col gap-4" data-testid="file-gallery-display-fields">
      <SegmentedField
        label="Anordnung"
        options={LAYOUT_OPTIONS}
        value={shown.layout}
        onChange={(layout) => onChange({ ...value, layout })}
        hint={detailed ? LAYOUT_HINT : undefined}
      />
      <Field className="max-w-[200px]" label="Höchstens" hint="0 = alle Dateien">
        <MaxItemsInput value={shown.maxItems} onChange={(maxItems) => onChange({ ...value, maxItems })} />
      </Field>
    </div>
  );
}

/** Eine ganze Zahl ab 0 aus dem Feld; sonst `null`. */
export function readWholeNumber(text: string): number | null {
  const trimmed = text.trim();
  return /^\d+$/.test(trimmed) ? Number(trimmed) : null;
}

/** Zahl und Rückruf, dazu, was `Field` am Eingabefeld verdrahtet. */
type MaxItemsInputProps = {
  value: number;
  onChange: (value: number) => void;
} & Pick<React.ComponentProps<"input">, "id" | "aria-describedby" | "aria-invalid" | "aria-required">;

/**
 * Die Höchstzahl mit eigenem Text: ein geleertes Feld ist mitten im Tippen
 * keine 0 – die Galerie zeigte sonst kurz alle Dateien –, und es springt auch
 * nicht auf die alte Zahl zurück. Erst beim Verlassen kehrt Unbrauchbares zur
 * geltenden Zahl zurück. Rückgängig und Wiederholen kommen von außen und
 * gelten sofort.
 */
function MaxItemsInput({ value, onChange, ...wiring }: MaxItemsInputProps): React.ReactElement {
  const [text, setText] = React.useState(String(value));
  React.useEffect(() => {
    setText((current) => (readWholeNumber(current) === value ? current : String(value)));
  }, [value]);
  return (
    <Input
      {...wiring}
      type="number"
      min={0}
      step={1}
      inputMode="numeric"
      className="h-10"
      value={text}
      onChange={(event) => {
        setText(event.target.value);
        const next = readWholeNumber(event.target.value);
        if (next !== null && next !== value) onChange(next);
      }}
      onBlur={() => setText(String(value))}
    />
  );
}

/** Die ID aus einer eingefügten ID oder Adresse; `null`, wenn keine darin steht. */
export function readCollectionInput(text: string): string | null {
  const match = /[0-9a-f]{24}/i.exec(text.trim());
  return match !== null && isStaffbaseId(match[0]) ? match[0] : null;
}

/**
 * Der Ausweg, den der Dialog schon bisher bot („Andere Collection-ID
 * eingeben …“): lädt die Liste nicht oder fehlt die Sammlung darin, lässt
 * sich ihre ID oder Adresse einfügen.
 */
export function ManualIdSection({ value, onChange }: SectionProps): React.ReactElement {
  const [text, setText] = React.useState("");
  const current = shownSettings(value).collectionId;
  const unreadable = text.trim() !== "" && readCollectionInput(text) === null;
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    setText(event.target.value);
    const id = readCollectionInput(event.target.value);
    if (id !== null && id !== current) onChange({ ...value, collectionId: id });
  };
  return (
    <FormSection
      title="Sammlungs-ID von Hand eintragen"
      description="Nur nötig, wenn die Sammlung links fehlt: die 24-stellige ID aus Studio → Dateien oder die Adresse der Sammlung einfügen."
      collapsible
      defaultOpen={false}
    >
      <Field
        label="Sammlungs-ID oder Adresse"
        error={unreadable ? "Keine gültige ID erkannt" : undefined}
        hint={`Aktuell: ${current ?? "alle Dateien"}`}
      >
        <Input className="h-10" value={text} onChange={handleChange} placeholder="ID oder Adresse einfügen" />
      </Field>
    </FormSection>
  );
}
