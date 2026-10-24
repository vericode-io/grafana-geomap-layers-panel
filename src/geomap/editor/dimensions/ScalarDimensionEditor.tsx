import { css } from '@emotion/css';
import { useMemo } from 'react';

import { FieldType, type GrafanaTheme2, type StandardEditorProps } from '@grafana/data';
import { ScalarDimensionMode, type ScalarDimensionConfig } from '@grafana/schema';
import { Combobox, InlineField, InlineFieldRow, RadioButtonGroup, useStyles2 } from '@grafana/ui';

import { NumberInput } from '../NumberInput';

import { fieldSelectOptions, fixedOption, isFixedValue } from './fields';

const LIMITS = [
  { label: 'Mod', value: ScalarDimensionMode.Mod, description: 'Use field values, mod from max' },
  { label: 'Clamped', value: ScalarDimensionMode.Clamped, description: 'Use field values, clamped to max and min' },
];

export function ScalarDimensionEditor({
  value,
  onChange,
  context,
  item,
}: StandardEditorProps<ScalarDimensionConfig, { min?: number; max?: number }>) {
  const styles = useStyles2(getStyles);
  const fixed = useMemo(() => fixedOption('Fixed value'), []);
  const options = fieldSelectOptions(context.data, value?.field, fixed, FieldType.number);
  const current = value ?? { fixed: 0, min: item.settings?.min ?? -360, max: item.settings?.max ?? 360, mode: ScalarDimensionMode.Mod };
  const selected = isFixedValue(current.field) ? fixed : options.find((option) => option.value === current.field);

  return (
    <>
      <InlineFieldRow>
        <InlineField label="Limit" labelWidth={8} grow>
          <RadioButtonGroup
            value={current.mode ?? ScalarDimensionMode.Mod}
            options={LIMITS}
            onChange={(mode) => onChange({ ...current, mode })}
            fullWidth
          />
        </InlineField>
      </InlineFieldRow>
      <Combobox
        aria-label="Scalar"
        value={selected}
        options={options}
        onChange={(selection) => {
          if (!selection || isFixedValue(selection.value)) {
            onChange({ ...current, field: undefined, fixed: current.fixed ?? 0 });
            return;
          }
          onChange({ ...current, field: selection.value });
        }}
      />
      {isFixedValue(current.field) && (
        <div className={styles.range}>
          <InlineFieldRow>
            <InlineField label="Value" labelWidth={8} grow>
              <NumberInput
                value={current.fixed ?? 0}
                min={item.settings?.min}
                max={item.settings?.max}
                onChange={(fixed) => onChange({ ...current, field: undefined, fixed: fixed ?? 0 })}
              />
            </InlineField>
          </InlineFieldRow>
        </div>
      )}
    </>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  range: css({
    paddingTop: theme.spacing(1),
  }),
});
