import { css } from '@emotion/css';
import { useMemo } from 'react';

import { type GrafanaTheme2, type StandardEditorProps } from '@grafana/data';
import { type ScaleDimensionConfig } from '@grafana/schema';
import { Combobox, InlineField, InlineFieldRow, useStyles2 } from '@grafana/ui';

import { NumberInput } from '../NumberInput';

import { fieldSelectOptions, fixedOption, isFixedValue } from './fields';

export function ScaleDimensionEditor({
  value,
  onChange,
  context,
  item,
  id,
}: StandardEditorProps<ScaleDimensionConfig, { min?: number; max?: number; hideRange?: boolean }>) {
  const styles = useStyles2(getStyles);
  const fixed = useMemo(() => fixedOption('Fixed value'), []);
  const options = fieldSelectOptions(context.data, value?.field, fixed);
  const selected = isFixedValue(value?.field) ? fixed : options.find((option) => option.value === value?.field);
  const current = value ?? { min: item.settings?.min ?? 1, max: item.settings?.max ?? 100, fixed: 5 };

  return (
    <>
      <Combobox
        id={id}
        value={selected}
        options={options}
        onChange={(selection) => {
          if (!selection || isFixedValue(selection.value)) {
            onChange({ ...current, field: undefined });
            return;
          }
          onChange({ ...current, field: selection.value });
        }}
      />
      <div className={styles.range}>
        {isFixedValue(current.field) && (
          <InlineFieldRow>
            <InlineField label="Value" labelWidth={8} grow>
              <NumberInput
                value={current.fixed}
                min={item.settings?.min}
                max={item.settings?.max}
                onChange={(fixed) => onChange({ ...current, field: undefined, fixed })}
              />
            </InlineField>
          </InlineFieldRow>
        )}
        {!isFixedValue(current.field) && !item.settings?.hideRange && (
          <>
            <InlineFieldRow>
              <InlineField label="Min" labelWidth={8} grow>
                <NumberInput
                  value={current.min}
                  min={item.settings?.min}
                  max={item.settings?.max}
                  onChange={(min) => onChange({ ...current, min: min ?? current.min })}
                />
              </InlineField>
            </InlineFieldRow>
            <InlineFieldRow>
              <InlineField label="Max" labelWidth={8} grow>
                <NumberInput
                  value={current.max}
                  min={item.settings?.min}
                  max={item.settings?.max}
                  onChange={(max) => onChange({ ...current, max: max ?? current.max })}
                />
              </InlineField>
            </InlineFieldRow>
          </>
        )}
      </div>
    </>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  range: css({
    paddingTop: theme.spacing(1),
  }),
});
