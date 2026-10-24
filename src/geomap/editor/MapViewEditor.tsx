import { toLonLat } from 'ol/proj';
import { useCallback, useId, useMemo } from 'react';

import { type SelectableValue, type StandardEditorProps } from '@grafana/data';
import { t, Trans } from '@grafana/i18n';
import { Button, InlineField, InlineFieldRow, Select, Stack } from '@grafana/ui';

import { type MapViewConfig, type Options } from '../panelcfg.gen';
import { type GeomapInstanceState } from '../types';
import { centerPointRegistry, MapCenterID } from '../view';

import { CoordinatesMapViewEditor } from './CoordinatesMapViewEditor';
import { FitMapViewEditor } from './FitMapViewEditor';
import { NumberInput } from './NumberInput';

export const MapViewEditor = ({
  value,
  onChange,
  context,
}: StandardEditorProps<MapViewConfig, unknown, Options, GeomapInstanceState>) => {
  const labelWidth = 10;
  const viewInputId = useId();
  const zoomInputId = useId();

  const views = useMemo(() => {
    const ids = value?.id ? [value.id] : [centerPointRegistry.list()[0].id];
    return centerPointRegistry.selectOptions(ids);
  }, [value?.id]);

  const onSetCurrentView = useCallback(() => {
    const map = context.instanceState?.map;
    if (!map) {
      return;
    }
    const view = map.getView();
    const coords = view.getCenter();
    if (!coords) {
      return;
    }
    const center = toLonLat(coords, view.getProjection());
    onChange({
      ...value,
      id: MapCenterID.Coordinates,
      lon: +center[0].toFixed(6),
      lat: +center[1].toFixed(6),
      zoom: +view.getZoom()!.toFixed(2),
    });
  }, [value, onChange, context.instanceState]);

  const onSelectView = useCallback(
    (selection: SelectableValue<string>) => {
      const next = centerPointRegistry.getIfExists(selection.value);
      if (!next) {
        return;
      }
      onChange({
        ...value,
        id: next.id,
        lat: next.lat ?? value?.lat,
        lon: next.lon ?? value?.lon,
        zoom: next.zoom ?? value?.zoom,
      });
    },
    [value, onChange]
  );

  return (
    <>
      <InlineFieldRow>
        <InlineField label={t('geomap.map-view-editor.label-view', 'View')} labelWidth={labelWidth} grow>
          <Select inputId={viewInputId} options={views.options} value={views.current} onChange={onSelectView} />
        </InlineField>
      </InlineFieldRow>
      {value?.id === MapCenterID.Coordinates && (
        <CoordinatesMapViewEditor labelWidth={labelWidth} value={value} onChange={onChange} />
      )}
      {value?.id === MapCenterID.Fit && (
        <FitMapViewEditor labelWidth={labelWidth} value={value} onChange={onChange} context={context} />
      )}
      <InlineFieldRow>
        <InlineField
          label={
            value?.id === MapCenterID.Fit
              ? t('geomap.map-view-editor.label-max-zoom', 'Max Zoom')
              : t('geomap.map-view-editor.label-zoom', 'Zoom')
          }
          labelWidth={labelWidth}
          grow
        >
          <NumberInput
            id={zoomInputId}
            value={value?.zoom ?? 1}
            min={1}
            max={18}
            step={0.01}
            onChange={(zoom) => onChange({ ...value, zoom })}
          />
        </InlineField>
      </InlineFieldRow>
      <Stack direction="column">
        <Button variant="secondary" size="sm" fullWidth onClick={onSetCurrentView}>
          <span>
            <Trans i18nKey="geomap.map-view-editor.use-current-map-settings">Use current map settings</Trans>
          </span>
        </Button>
      </Stack>
    </>
  );
};
