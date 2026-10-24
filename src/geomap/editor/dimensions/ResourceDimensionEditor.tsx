import { type StandardEditorProps } from '@grafana/data';
import { type ResourceDimensionConfig, ResourceDimensionMode } from '@grafana/schema';
import { Combobox, InlineField, InlineFieldRow, RadioButtonGroup } from '@grafana/ui';

import { fieldSelectOptions, fixedOption } from './fields';

const MARKERS = [
  { label: 'Circle', value: 'img/icons/marker/circle.svg' },
  { label: 'Square', value: 'img/icons/marker/square.svg' },
  { label: 'Triangle', value: 'img/icons/marker/triangle.svg' },
  { label: 'Star', value: 'img/icons/marker/star.svg' },
  { label: 'Cross', value: 'img/icons/marker/cross.svg' },
  { label: 'X', value: 'img/icons/marker/x-mark.svg' },
];

const SOURCES = [
  { label: 'Fixed', value: ResourceDimensionMode.Fixed, description: 'Fixed value' },
  { label: 'Field', value: ResourceDimensionMode.Field, description: 'Use a string field result' },
];

export function ResourceDimensionEditor({
  value,
  onChange,
  context,
  item,
}: StandardEditorProps<ResourceDimensionConfig, { showSourceRadio?: boolean }>) {
  const current = value ?? { mode: ResourceDimensionMode.Fixed, fixed: MARKERS[0].value };
  const mode = current.mode ?? ResourceDimensionMode.Fixed;
  const showSource = item.settings?.showSourceRadio ?? true;
  const fields = fieldSelectOptions(context.data, current.field, fixedOption('Select field')).slice(1);

  return (
    <>
      {showSource && (
        <InlineFieldRow>
          <InlineField label="Source" labelWidth={9} grow>
            <RadioButtonGroup value={mode} options={SOURCES} onChange={(next) => onChange({ ...current, mode: next })} fullWidth />
          </InlineField>
        </InlineFieldRow>
      )}
      {mode !== ResourceDimensionMode.Fixed && (
        <InlineFieldRow>
          <InlineField label="Field" labelWidth={9} grow>
            <Combobox
              options={fields}
              value={fields.find((option) => option.value === current.field) ?? null}
              onChange={(selection) => onChange({ ...current, mode: ResourceDimensionMode.Field, field: selection?.value })}
            />
          </InlineField>
        </InlineFieldRow>
      )}
      {mode === ResourceDimensionMode.Fixed && (
        <Combobox
          options={MARKERS}
          value={MARKERS.find((option) => option.value === current.fixed) ?? MARKERS[0]}
          onChange={(selection) =>
            onChange({
              ...current,
              mode: ResourceDimensionMode.Fixed,
              fixed: selection?.value ?? MARKERS[0].value,
            })
          }
        />
      )}
    </>
  );
}
