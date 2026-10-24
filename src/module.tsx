import { PanelPlugin } from '@grafana/data';
import { t, Trans } from '@grafana/i18n';
import { config } from '@grafana/runtime';
import { commonOptionsBuilder } from '@grafana/ui';

import { bridgeNativeGeomap } from './geomap/bridgeNativeGeomap';
import { LayersEditor } from './geomap/editor/LayersEditor';
import { MapViewEditor } from './geomap/editor/MapViewEditor';
import { VariableNameEditor } from './geomap/editor/VariableNameEditor';
import { getLayerEditor } from './geomap/editor/layerEditor';
import { GeomapPanel } from './geomap/GeomapPanel';
import { mapMigrationHandler, mapPanelChangedHandler } from './geomap/migrations';
import { defaultMapViewConfig, type Options, TooltipMode } from './geomap/panelcfg.gen';
import { geomapSuggestionsSupplier } from './geomap/suggestions';
import { type GeomapInstanceState } from './geomap/types';

export const plugin = new PanelPlugin<Options>(GeomapPanel)
  .setNoPadding()
  .setPanelChangeHandler(mapPanelChangedHandler)
  .setMigrationHandler(mapMigrationHandler)
  .useFieldConfig({
    useCustomConfig: (builder) => {
      commonOptionsBuilder.addHideFrom(builder);
    },
  })
  .setPanelOptions((builder, context) => {
    let category = [t('geomap.category-map-view', 'Map view')];
    builder.addCustomEditor({
      category,
      id: 'view',
      path: 'view',
      name: t('geomap.name-initial-view', 'Initial view'),
      description: 'This location will show when the panel first loads.',
      editor: MapViewEditor,
      defaultValue: defaultMapViewConfig,
    });

    builder.addBooleanSwitch({
      category,
      path: 'view.shared',
      description: 'Use the same view across multiple panels. This may require a dashboard reload.',
      name: t('geomap.name-share-view', 'Share view'),
      defaultValue: defaultMapViewConfig.shared,
    });

    builder.addBooleanSwitch({
      category,
      path: 'view.noRepeat',
      name: t('geomap.name-no-repeat', 'No map repeating'),
      description: 'Prevent the map from repeating horizontally',
      defaultValue: false,
    });

    builder.addBooleanSwitch({
      category,
      path: 'view.dashboardVariable',
      name: t('geomap.name-sync-view-variable', 'Sync view to dashboard variable'),
      description: 'Store view bounds in a dashboard variable for use in queries',
      defaultValue: false,
    });

    builder.addCustomEditor({
      category,
      id: 'view.dashboardVariableName',
      path: 'view.dashboardVariableName',
      name: t('geomap.name-variable-name', 'Variable name'),
      description: 'Specify the dashboard variable to store view bounds',
      editor: VariableNameEditor,
      showIf: (options) => options.view?.dashboardVariable === true,
    });

    const state = context.instanceState as GeomapInstanceState | undefined;
    if (state?.layers) {
      const layersCategory = [t('geomap.category-map-layers', 'Map layers')];
      const basemapCategory = [t('geomap.category-basemap-layer', 'Basemap layer')];
      builder.addCustomEditor({
        category: layersCategory,
        id: 'layers',
        path: '',
        name: '',
        editor: LayersEditor,
      });

      const selected = state.layers[state.selected];
      if (state.selected && selected) {
        builder.addNestedOptions(
          getLayerEditor({
            state: selected,
            category: layersCategory,
            basemaps: false,
          })
        );
      }

      const baselayer = state.layers[0];
      if (config.geomapDisableCustomBaseLayer) {
        builder.addCustomEditor({
          category: basemapCategory,
          id: 'basemap-admin',
          path: '',
          name: '',
          editor: () => (
            <div>
              <Trans i18nKey="geomap.plugin.basemap-layer-configured-server-admin">
                The basemap layer is configured by the server admin.
              </Trans>
            </div>
          ),
        });
      } else if (baselayer) {
        builder.addNestedOptions(
          getLayerEditor({
            state: baselayer,
            category: basemapCategory,
            basemaps: true,
          })
        );
      }
    }

    category = [t('geomap.category-map-controls', 'Map controls')];
    builder
      .addBooleanSwitch({
        category,
        path: 'controls.showZoom',
        description: 'Show zoom control buttons in the upper left corner',
        name: t('geomap.name-show-zoom', 'Show zoom control'),
        defaultValue: true,
      })
      .addBooleanSwitch({
        category,
        path: 'controls.mouseWheelZoom',
        description: 'Enable zoom control via mouse wheel',
        name: t('geomap.name-mouse-wheel-zoom', 'Mouse wheel zoom'),
        defaultValue: true,
      })
      .addBooleanSwitch({
        category,
        path: 'controls.showAttribution',
        name: t('geomap.name-show-optional-attribution', 'Show optional attribution'),
        description:
          'Show the map source attribution info in the lower right. Attribution required by a layer license is always shown.',
        defaultValue: true,
      })
      .addBooleanSwitch({
        category,
        path: 'controls.showScale',
        name: t('geomap.name-show-scale', 'Show scale'),
        description: 'Indicate map scale',
        defaultValue: false,
      })
      .addBooleanSwitch({
        category,
        path: 'controls.showMeasure',
        name: t('geomap.name-show-measure', 'Show measure tools'),
        description: 'Show tools for making measurements on the map',
        defaultValue: false,
      })
      .addBooleanSwitch({
        category,
        path: 'controls.showDebug',
        name: t('geomap.name-show-debug', 'Show debug'),
        description: 'Show map info',
        defaultValue: false,
      })
      .addBooleanSwitch({
        category,
        path: 'controls.syncLayersVariable',
        name: t('geomap.name-sync-layers-variable', 'Sync layers to dashboard variable'),
        description: 'Combo → panels (live). Legend does not update the variable. Presets: Label : A|B.',
        defaultValue: false,
      })
      .addCustomEditor({
        category,
        id: 'controls.layersVariableName',
        path: 'controls.layersVariableName',
        name: t('geomap.name-layers-variable-name', 'Layers variable name'),
        description: 'Custom variable name (e.g. mapLayers). Values = layer names, optional | presets.',
        editor: VariableNameEditor,
        defaultValue: 'mapLayers',
        showIf: (options) => options.controls?.syncLayersVariable === true,
      })
      .addRadio({
        category,
        path: 'tooltip.mode',
        name: t('geomap.name-tooltip', 'Tooltip'),
        defaultValue: TooltipMode.Details,
        settings: {
          options: [
            {
              label: 'None',
              value: TooltipMode.None,
              description: 'Show contents on click, not hover',
            },
            {
              label: 'Details',
              value: TooltipMode.Details,
              description: 'Show popup on hover',
            },
          ],
        },
      });
  })
  .setSuggestionsSupplier(geomapSuggestionsSupplier);

bridgeNativeGeomap();
