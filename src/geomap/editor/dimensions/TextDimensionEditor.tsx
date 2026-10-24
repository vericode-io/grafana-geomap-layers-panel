import { useMemo } from 'react';

import { type StandardEditorProps } from '@grafana/data';
import { type TextDimensionConfig, TextDimensionMode } from '@grafana/schema';
import { Button, Combobox, InlineField, InlineFieldRow, Input, RadioButtonGroup } from '@grafana/ui';

import { fieldSelectOptions, fixedOption } from './fields';

const SOURCES = [
  { label: 'Fixed', value: TextDimensionMode.Fixed, description: 'Fixed value' },
  { label: 'Field', value: TextDimensionMode.Field, description: 'Display field value' },
];

export function TextDimensionEditor({ value, onChange, context }: StandardEditorProps<TextDimensionConfig>) {
  const current = value ?? { mode: TextDimensionMode.Field, field: '' };
  const mode = current.mode ?? TextDimensionMode.Fixed;
  const empty = useMemo(() => fixedOption('Select field'), []);
  const options = fieldSelectOptions(context.data, current.field, empty).filter((option) => option.value !== empty.value);

  return (
    <>
      <InlineFieldRow>
        <InlineField label="Source" labelWidth={9} grow>
          <RadioButtonGroup
            value={mode}
            options={SOURCES}
            onChange={(next) => onChange({ ...current, mode: next })}
            fullWidth
          />
        </InlineField>
      </InlineFieldRow>
      {mode !== TextDimensionMode.Fixed && (
        <InlineFieldRow>
          <InlineField label="Field" labelWidth={9} grow>
            <Combobox
              options={options}
              value={options.find((option) => option.value === current.field) ?? null}
              onChange={(selection) => onChange({ ...current, mode: TextDimensionMode.Field, field: selection?.value })}
            />
          </InlineField>
        </InlineFieldRow>
      )}
      {mode === TextDimensionMode.Fixed && (
        <InlineFieldRow>
          <InlineField label="Value" labelWidth={9} grow>
            <Input
              value={current.fixed ?? ''}
              onChange={(event) => onChange({ ...current, mode: TextDimensionMode.Fixed, fixed: event.currentTarget.value })}
              suffix={
                current.fixed ? (
                  <Button icon="times" variant="secondary" fill="text" size="sm" onClick={() => onChange({ ...current, fixed: '' })} />
                ) : undefined
              }
            />
          </InlineField>
        </InlineFieldRow>
      )}
    </>
  );
}
