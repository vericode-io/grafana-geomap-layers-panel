import { css } from '@emotion/css';
import { useMemo } from 'react';

import { type GrafanaTheme2, type StandardEditorProps } from '@grafana/data';
import { type ColorDimensionConfig } from '@grafana/schema';
import { ColorPicker, Combobox, useStyles2 } from '@grafana/ui';

import { fieldSelectOptions, fixedOption, isFixedValue } from './fields';

export function ColorDimensionEditor({
  value,
  onChange,
  context,
  id,
}: StandardEditorProps<ColorDimensionConfig>) {
  const styles = useStyles2(getStyles);
  const fixed = useMemo(() => fixedOption('Fixed color'), []);
  const options = fieldSelectOptions(context.data, value?.field, fixed);
  const selected = isFixedValue(value?.field) ? fixed : options.find((option) => option.value === value?.field);

  return (
    <div className={styles.container}>
      <Combobox
        id={id}
        value={selected}
        options={options}
        onChange={(selection) => {
          if (!selection || isFixedValue(selection.value)) {
            onChange({ fixed: value?.fixed ?? 'dark-green' });
            return;
          }
          onChange({ ...value, field: selection.value });
        }}
      />
      {isFixedValue(value?.field) && (
        <div className={styles.picker}>
          <ColorPicker
            color={value?.fixed ?? 'dark-green'}
            onChange={(color) => onChange({ fixed: color })}
            enableNamedColors
          />
        </div>
      )}
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  container: css({
    display: 'flex',
    flexWrap: 'nowrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
  }),
  picker: css({
    paddingLeft: theme.spacing(1),
  }),
});
