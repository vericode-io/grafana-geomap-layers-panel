import { useCallback, useMemo } from 'react';

import { type SelectableValue, type StandardEditorContext } from '@grafana/data';
import { t } from '@grafana/i18n';
import { InlineField, InlineFieldRow, RadioButtonGroup, Select } from '@grafana/ui';

import { type MapViewConfig, type Options } from '../panelcfg.gen';
import { type GeomapInstanceState } from '../types';

import { NumberInput } from './NumberInput';

type Props = {
  labelWidth: number;
  value: MapViewConfig;
  onChange: (value?: MapViewConfig) => void;
  context: StandardEditorContext<Options, GeomapInstanceState>;
};

enum DataScopeValues {
  all = 'all',
  layer = 'layer',
  last = 'last',
}

const dataScopeOptions: Array<SelectableValue<DataScopeValues>> = [
  { label: 'All layers', value: DataScopeValues.all },
  { label: 'Layer', value: DataScopeValues.layer },
  { label: 'Last value', value: DataScopeValues.last },
];

export const FitMapViewEditor = ({ labelWidth, value, onChange, context }: Props) => {
  const layers = useMemo(() => {
    return (context.options?.layers ?? []).map((layer) => ({
      label: layer.name,
      value: layer.name,
    }));
  }, [context.options?.layers]);

  const onSelectLayer = useCallback(
    (selection: SelectableValue<string>) => {
      onChange({ ...value, layer: selection.value });
    },
    [value, onChange]
  );

  const currentDataScope = value.allLayers
    ? DataScopeValues.all
    : value.lastOnly
      ? DataScopeValues.last
      : DataScopeValues.layer;

  const onDataScopeChange = (dataScope: DataScopeValues) => {
    onChange({
      ...value,
      allLayers: dataScope === DataScopeValues.all,
      lastOnly: dataScope === DataScopeValues.last,
      layer: dataScope === DataScopeValues.all ? value.layer : (value.layer ?? layers[0]?.value),
    });
  };

  return (
    <>
      <InlineFieldRow>
        <InlineField label={t('geomap.fit-map-view-editor.label-data', 'Data')} labelWidth={labelWidth} grow>
          <RadioButtonGroup value={currentDataScope} options={dataScopeOptions} onChange={onDataScopeChange} />
        </InlineField>
      </InlineFieldRow>
      {!value?.allLayers && (
        <InlineFieldRow>
          <InlineField label={t('geomap.fit-map-view-editor.label-layer', 'Layer')} labelWidth={labelWidth} grow>
            <Select options={layers} onChange={onSelectLayer} value={value.layer} />
          </InlineField>
        </InlineFieldRow>
      )}
      {!value?.lastOnly && (
        <InlineFieldRow>
          <InlineField
            label={t('geomap.fit-map-view-editor.label-padding', 'Padding')}
            labelWidth={labelWidth}
            grow
            tooltip="Sets padding in relative percent beyond data extent"
          >
            <NumberInput
              value={value?.padding ?? 5}
              min={0}
              step={1}
              onChange={(padding) => onChange({ ...value, padding })}
            />
          </InlineField>
        </InlineFieldRow>
      )}
    </>
  );
};
