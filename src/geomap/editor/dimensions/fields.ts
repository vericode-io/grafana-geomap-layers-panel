import { type DataFrame, type Field, type FieldType } from '@grafana/data';

const FIXED = '_____fixed_____';

export const fixedOption = (label: string) => ({ label, value: FIXED });

export function isFixedValue(value?: string) {
  return !value || value === FIXED;
}

export function fieldSelectOptions(
  frames: DataFrame[] | undefined,
  current: string | undefined,
  first: { label: string; value: string },
  fieldType?: FieldType
) {
  const names = new Set<string>();
  for (const frame of frames ?? []) {
    for (const field of frame.fields) {
      if (fieldType && field.type !== fieldType) {
        continue;
      }
      if (field.name) {
        names.add(field.name);
      }
    }
  }
  if (current && current !== FIXED) {
    names.add(current);
  }
  return [first, ...[...names].map((name) => ({ label: name, value: name }))];
}

export function numericFields(field: Field, fieldType?: FieldType) {
  return !fieldType || field.type === fieldType;
}
