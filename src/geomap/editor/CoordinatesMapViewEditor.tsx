import { t } from '@grafana/i18n';
import { InlineField, InlineFieldRow } from '@grafana/ui';

import { type MapViewConfig } from '../panelcfg.gen';

import { NumberInput } from './NumberInput';

type Props = {
  labelWidth: number;
  value: MapViewConfig;
  onChange: (value?: MapViewConfig) => void;
};

export const CoordinatesMapViewEditor = ({ labelWidth, value, onChange }: Props) => {
  return (
    <>
      <InlineFieldRow>
        <InlineField label={t('geomap.coordinates-map-view-editor.label-latitude', 'Latitude')} labelWidth={labelWidth} grow>
          <NumberInput
            value={value.lat}
            min={-90}
            max={90}
            step={0.001}
            onChange={(latitude) => onChange({ ...value, lat: latitude })}
          />
        </InlineField>
      </InlineFieldRow>
      <InlineFieldRow>
        <InlineField
          label={t('geomap.coordinates-map-view-editor.label-longitude', 'Longitude')}
          labelWidth={labelWidth}
          grow
        >
          <NumberInput
            value={value.lon}
            min={-180}
            max={180}
            step={0.001}
            onChange={(longitude) => onChange({ ...value, lon: longitude })}
          />
        </InlineField>
      </InlineFieldRow>
    </>
  );
};
