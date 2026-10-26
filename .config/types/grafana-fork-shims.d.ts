/**
 * Augmentations for Grafana SDK types used by the forked geomap panel.
 * Must import the module so this file is treated as augmentation (not replacement).
 */
import type { MapLayerOptions } from '@grafana/data';

declare global {
  interface Window {
    __grafana_public_path__?: string;
  }
}

declare module '@grafana/data' {
  interface MapLayerRegistryItem<TConfig = unknown> {
    /** Attribution required for this basemap/layer (Grafana core geomap extension). */
    requiresAttribution?: boolean | ((options: MapLayerOptions<TConfig>) => boolean);
  }
}
