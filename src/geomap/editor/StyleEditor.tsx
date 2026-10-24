import { capitalize } from 'lodash';
import { useMemo } from 'react';
import { type Observable, of } from 'rxjs';

import { type FrameMatcher, type StandardEditorProps, type StandardEditorsRegistryItem } from '@grafana/data';
import { t } from '@grafana/i18n';
import { ColorPicker, Field, InlineField, InlineFieldRow, InlineLabel, RadioButtonGroup, Stack } from '@grafana/ui';

import { defaultTextConfig } from '../../vendor/dimensions/types';
import { type LayerContentInfo } from '../utils/getFeatures';
import {
  HorizontalAlign,
  VerticalAlign,
  defaultStyleConfig,
  GeometryTypeId,
  type StyleConfig,
  TextAlignment,
  TextBaseline,
} from '../style/types';
import { styleUsesText } from '../style/utils';

import { NumberInput } from './NumberInput';
import { SliderValueEditor } from './SliderValueEditor';
import { ColorDimensionEditor } from './dimensions/ColorDimensionEditor';
import { ResourceDimensionEditor } from './dimensions/ResourceDimensionEditor';
import { ScalarDimensionEditor } from './dimensions/ScalarDimensionEditor';
import { ScaleDimensionEditor } from './dimensions/ScaleDimensionEditor';
import { TextDimensionEditor } from './dimensions/TextDimensionEditor';
import { useObservable } from './useObservable';

interface StyleEditorOptions {
  layerInfo?: Observable<LayerContentInfo>;
  simpleFixedValues?: boolean;
  displayRotation?: boolean;
  hideSymbol?: boolean;
  frameMatcher?: FrameMatcher;
}

const opacitySettings = { settings: { min: 0, max: 1, step: 0.1 } } as StandardEditorsRegistryItem;

export const StyleEditor = ({ value, onChange, item, context: incoming }: StandardEditorProps<StyleConfig, StyleEditorOptions>) => {
  const context = useMemo(() => {
    if (!item.settings?.frameMatcher) {
      return incoming;
    }
    return { ...incoming, data: incoming.data.filter(item.settings.frameMatcher) };
  }, [incoming, item.settings]);

  const settings = item.settings;
  const layerInfo = useMemo(() => settings?.layerInfo ?? of(undefined as unknown as LayerContentInfo), [settings?.layerInfo]);
  const propertyOptions = useObservable(layerInfo);
  const featuresHavePoints = propertyOptions?.geometryType === GeometryTypeId.Point;
  const hasTextLabel = styleUsesText(value);
  const symbolSettings = {
    settings: { showSourceRadio: false },
  } as StandardEditorsRegistryItem;
  const rotationSettings = {
    settings: { min: defaultStyleConfig.rotation.min, max: defaultStyleConfig.rotation.max },
  } as StandardEditorsRegistryItem;
  const sizeSettings = { settings: { min: 1, max: 100 } } as StandardEditorsRegistryItem;

  if (settings?.simpleFixedValues) {
    return (
      <>
        {featuresHavePoints && (
          <>
            <InlineFieldRow>
              <InlineField label={t('geomap.style-editor.label-symbol', 'Symbol')}>
                <ResourceDimensionEditor
                  value={value?.symbol ?? defaultStyleConfig.symbol}
                  context={context}
                  onChange={(symbol) => onChange({ ...value, symbol })}
                  item={symbolSettings}
                />
              </InlineField>
            </InlineFieldRow>
            <Field label={t('geomap.style-editor.label-rotation-angle', 'Rotation angle')}>
              <ScalarDimensionEditor
                value={value?.rotation ?? defaultStyleConfig.rotation}
                context={context}
                onChange={(rotation) => onChange({ ...value, rotation })}
                item={rotationSettings}
              />
            </Field>
          </>
        )}
        <InlineFieldRow>
          <InlineField label={t('geomap.style-editor.label-color', 'Color')} labelWidth={10}>
            <InlineLabel width={4}>
              <ColorPicker
                color={value?.color?.fixed ?? defaultStyleConfig.color.fixed}
                onChange={(fixed) => onChange({ ...value, color: { fixed } })}
              />
            </InlineLabel>
          </InlineField>
        </InlineFieldRow>
        <InlineFieldRow>
          <InlineField label={t('geomap.style-editor.label-opacity', 'Opacity')} labelWidth={10} grow>
            <SliderValueEditor
              value={value?.opacity ?? defaultStyleConfig.opacity}
              context={context}
              onChange={(opacity) => onChange({ ...value, opacity })}
              item={opacitySettings}
            />
          </InlineField>
        </InlineFieldRow>
      </>
    );
  }

  return (
    <>
      <Field label={t('geomap.style-editor.label-size', 'Size')}>
        <ScaleDimensionEditor
          value={value?.size ?? defaultStyleConfig.size}
          context={context}
          onChange={(size) => onChange({ ...value, size })}
          item={sizeSettings}
        />
      </Field>
      {!settings?.hideSymbol && (
        <>
          <Field label={t('geomap.style-editor.label-symbol', 'Symbol')}>
            <ResourceDimensionEditor
              value={value?.symbol ?? defaultStyleConfig.symbol}
              context={context}
              onChange={(symbol) => onChange({ ...value, symbol })}
              item={symbolSettings}
            />
          </Field>
          <Field label={t('geomap.style-editor.label-symbol-vertical-align', 'Symbol vertical align')}>
            <RadioButtonGroup
              value={value?.symbolAlign?.vertical ?? defaultStyleConfig.symbolAlign.vertical}
              onChange={(vertical: VerticalAlign) =>
                onChange({ ...value, symbolAlign: { ...value?.symbolAlign, vertical } })
              }
              options={[
                { value: VerticalAlign.Top, label: 'Top' },
                { value: VerticalAlign.Center, label: 'Center' },
                { value: VerticalAlign.Bottom, label: 'Bottom' },
              ]}
            />
          </Field>
          <Field label={t('geomap.style-editor.label-symbol-horizontal-align', 'Symbol horizontal align')}>
            <RadioButtonGroup
              value={value?.symbolAlign?.horizontal ?? defaultStyleConfig.symbolAlign.horizontal}
              onChange={(horizontal: HorizontalAlign) =>
                onChange({ ...value, symbolAlign: { ...value?.symbolAlign, horizontal } })
              }
              options={[
                { value: HorizontalAlign.Left, label: 'Left' },
                { value: HorizontalAlign.Center, label: 'Center' },
                { value: HorizontalAlign.Right, label: 'Right' },
              ]}
            />
          </Field>
        </>
      )}
      <Field label={t('geomap.style-editor.label-color', 'Color')}>
        <ColorDimensionEditor
          value={value?.color ?? defaultStyleConfig.color}
          context={context}
          onChange={(color) => onChange({ ...value, color })}
          item={{} as StandardEditorsRegistryItem}
        />
      </Field>
      <Field label={t('geomap.style-editor.label-fill-opacity', 'Fill opacity')}>
        <SliderValueEditor
          value={value?.opacity ?? defaultStyleConfig.opacity}
          context={context}
          onChange={(opacity) => onChange({ ...value, opacity })}
          item={opacitySettings}
        />
      </Field>
      {settings?.displayRotation && (
        <Field label={t('geomap.style-editor.label-rotation-angle', 'Rotation angle')}>
          <ScalarDimensionEditor
            value={value?.rotation ?? defaultStyleConfig.rotation}
            context={context}
            onChange={(rotation) => onChange({ ...value, rotation })}
            item={rotationSettings}
          />
        </Field>
      )}
      <Field label={t('geomap.style-editor.label-text-label', 'Text label')}>
        <TextDimensionEditor
          value={value?.text ?? defaultTextConfig}
          context={context}
          onChange={(text) => onChange({ ...value, text })}
          item={{} as StandardEditorsRegistryItem}
        />
      </Field>
      {hasTextLabel && (
        <>
          <Stack gap={1}>
            <Field label={t('geomap.style-editor.label-font-size', 'Font size')}>
              <NumberInput
                width={8}
                value={value?.textConfig?.fontSize ?? defaultStyleConfig.textConfig.fontSize}
                onChange={(fontSize) => onChange({ ...value, textConfig: { ...value?.textConfig, fontSize } })}
              />
            </Field>
            <Field label={t('geomap.style-editor.label-x-offset', 'X offset')}>
              <NumberInput
                width={8}
                value={value?.textConfig?.offsetX ?? defaultStyleConfig.textConfig.offsetX}
                onChange={(offsetX) => onChange({ ...value, textConfig: { ...value?.textConfig, offsetX } })}
              />
            </Field>
            <Field label={t('geomap.style-editor.label-y-offset', 'Y offset')}>
              <NumberInput
                width={8}
                value={value?.textConfig?.offsetY ?? defaultStyleConfig.textConfig.offsetY}
                onChange={(offsetY) => onChange({ ...value, textConfig: { ...value?.textConfig, offsetY } })}
              />
            </Field>
          </Stack>
          <Field label={t('geomap.style-editor.label-align', 'Align')}>
            <RadioButtonGroup
              value={value?.textConfig?.textAlign ?? defaultStyleConfig.textConfig.textAlign}
              onChange={(textAlign: TextAlignment) =>
                onChange({ ...value, textConfig: { ...value?.textConfig, textAlign } })
              }
              options={[
                { value: TextAlignment.Left, label: capitalize(TextAlignment.Left) },
                { value: TextAlignment.Center, label: capitalize(TextAlignment.Center) },
                { value: TextAlignment.Right, label: capitalize(TextAlignment.Right) },
              ]}
            />
          </Field>
          <Field label={t('geomap.style-editor.label-baseline', 'Baseline')}>
            <RadioButtonGroup
              value={value?.textConfig?.textBaseline ?? defaultStyleConfig.textConfig.textBaseline}
              onChange={(textBaseline: TextBaseline) =>
                onChange({ ...value, textConfig: { ...value?.textConfig, textBaseline } })
              }
              options={[
                { value: TextBaseline.Top, label: capitalize(TextBaseline.Top) },
                { value: TextBaseline.Middle, label: capitalize(TextBaseline.Middle) },
                { value: TextBaseline.Bottom, label: capitalize(TextBaseline.Bottom) },
              ]}
            />
          </Field>
        </>
      )}
    </>
  );
};
