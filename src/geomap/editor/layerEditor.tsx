import { get as lodashGet, isEqual } from 'lodash';

import {
  FrameGeometrySourceMode,
  getFrameMatchers,
  type MapLayerOptions,
  type NestedPanelOptions,
  type NestedValueAccess,
} from '@grafana/data';
import { t } from '@grafana/i18n';

import { defaultMarkersConfig } from '../layers/data/markersLayer';
import { DEFAULT_BASEMAP_CONFIG, geomapLayerRegistry, getLayersOptions } from '../layers/registry';
import { type MapLayerState } from '../types';

import { FrameSelectionEditor } from './FrameSelectionEditor';
import { addLocationFields } from './locationFields';
import { setOptionImmutably } from './setOptionImmutably';

export interface LayerEditorOptions {
  state: MapLayerState;
  category: string[];
  basemaps: boolean;
}

export function getLayerEditor(opts: LayerEditorOptions): NestedPanelOptions<MapLayerOptions> {
  return {
    category: opts.category,
    path: '--',
    defaultValue: opts.basemaps ? DEFAULT_BASEMAP_CONFIG : defaultMarkersConfig,
    values: (_parent: NestedValueAccess) => ({
      getContext: (parent) => {
        return { ...parent, options: opts.state.options, instanceState: opts.state };
      },
      getValue: (path: string) => lodashGet(opts.state.options, path),
      onChange: (path: string, value: unknown) => {
        const { state } = opts;
        const { options } = state;
        if (path === 'type' && value) {
          const layer = geomapLayerRegistry.getIfExists(String(value));
          if (layer) {
            const next = {
              ...options,
              type: layer.id,
              config: { ...layer.defaultOptions },
            };
            if (layer.showLocation) {
              if (!next.location?.mode) {
                next.location = { mode: FrameGeometrySourceMode.Auto };
              }
            } else {
              delete next.location;
            }
            state.onChange(next);
            return;
          }
        }
        state.onChange(setOptionImmutably(options, path, value));
      },
    }),
    build: (builder, context) => {
      if (!opts.state) {
        return;
      }

      const { handler, options } = opts.state;
      const layer = geomapLayerRegistry.getIfExists(options?.type);
      const layerTypes = getLayersOptions(
        opts.basemaps,
        options?.type ? options.type : DEFAULT_BASEMAP_CONFIG.type
      );

      builder.addSelect({
        path: 'type',
        name: t('geomap.layer-editor.name-layer-type', 'Layer type'),
        settings: {
          options: layerTypes.options,
        },
      });

      if (handler.update) {
        builder.addCustomEditor({
          id: 'filterData',
          path: 'filterData',
          name: t('geomap.layer-editor.name-data', 'Data'),
          editor: FrameSelectionEditor,
          defaultValue: undefined,
        });
      }

      if (!layer || options.type === DEFAULT_BASEMAP_CONFIG.type) {
        return;
      }

      if (layer.showLocation) {
        let data = context.data;
        if (options.filterData) {
          const matcherFunc = getFrameMatchers(options.filterData);
          if (data.some(matcherFunc)) {
            data = data.filter(matcherFunc);
          }
        }
        addLocationFields('Location', 'location.', builder, options.location, data);
      }

      handler.registerOptionsUI?.(builder, context);

      if (!isEqual(opts.category, [t('geomap.layer-editor.category-base-layer', 'Base layer')])) {
        if (!layer.hideOpacity) {
          builder.addSliderInput({
            path: 'opacity',
            name: t('geomap.layer-editor.name-opacity', 'Opacity'),
            defaultValue: 1,
            settings: {
              min: 0,
              max: 1,
              step: 0.1,
            },
          });
        }
        builder.addBooleanSwitch({
          path: 'tooltip',
          name: t('geomap.layer-editor.name-display-tooltip', 'Display tooltip'),
          description: t('geomap.layer-editor.description-display-tooltip', 'Show the tooltip for layer'),
          defaultValue: true,
        });
      }
    },
  };
}
