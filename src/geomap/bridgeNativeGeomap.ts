import { cloneDeep } from 'lodash';

import { getPluginImportUtils } from '@grafana/runtime';

const BRIDGE = '__vericodeGeomapBridge';
const SCENE_PATCH = '__vericodeSceneSwitch';
const LAST_OPTIONS = '__vericodeLastGeomapOptions';
const PLUGIN_IDS = new Set(['geomap', 'vericode-geomaplayers-panel', 'vericode-geomap-layers']);

declare global {
  interface Window {
    [LAST_OPTIONS]?: Record<string, unknown>;
  }
}

type ChangeHandler = (
  panel: unknown,
  prevPluginId: string,
  prevOptions: unknown,
  prevFieldConfig: unknown
) => unknown;

type PluginLike = {
  onPanelTypeChanged?: ChangeHandler;
  [BRIDGE]?: boolean;
};

type ScenePanel = {
  state?: { pluginId?: string; options?: Record<string, unknown> };
  changePluginType: (pluginId: string, options?: Record<string, unknown>, fieldConfig?: unknown) => unknown;
};

type SceneProto = {
  changePluginType: ScenePanel['changePluginType'];
  state?: ScenePanel['state'];
  [SCENE_PATCH]?: boolean;
};

type FiberNode = {
  return?: FiberNode;
  stateNode?: unknown;
  memoizedProps?: Record<string, unknown>;
  memoizedState?: { element?: unknown } | null;
  child?: FiberNode;
  sibling?: FiberNode;
};

function keepMapOptions(prevPluginId: string, prevOptions: unknown) {
  return PLUGIN_IDS.has(prevPluginId) && !!prevOptions && typeof prevOptions === 'object';
}

function isEmptyOptions(options: Record<string, unknown> | undefined) {
  return options == null || Object.keys(options).length === 0;
}

function wrap(plugin: PluginLike | undefined) {
  if (!plugin || plugin[BRIDGE] || typeof plugin.onPanelTypeChanged !== 'function') {
    return false;
  }
  const original = plugin.onPanelTypeChanged;
  plugin.onPanelTypeChanged = (panel, prevPluginId, prevOptions, prevFieldConfig) => {
    if (keepMapOptions(prevPluginId, prevOptions)) {
      return cloneDeep(prevOptions);
    }
    return original(panel, prevPluginId, prevOptions, prevFieldConfig);
  };
  plugin[BRIDGE] = true;
  return true;
}

function patchChangePluginType(panel: ScenePanel | undefined) {
  if (!panel || typeof panel.changePluginType !== 'function') {
    return false;
  }
  const proto = Object.getPrototypeOf(panel) as SceneProto | null;
  if (!proto || typeof proto.changePluginType !== 'function' || proto[SCENE_PATCH]) {
    return false;
  }
  const original = proto.changePluginType;
  proto.changePluginType = function (newPluginId, newOptions, fieldConfig) {
    const prevId = this.state?.pluginId;
    const prevOptions = this.state?.options;
    const switchingMaps = !!prevId && PLUGIN_IDS.has(prevId) && PLUGIN_IDS.has(newPluginId);
    if (switchingMaps && isEmptyOptions(newOptions as Record<string, unknown> | undefined)) {
      const keep = prevOptions && Object.keys(prevOptions).length ? prevOptions : window[LAST_OPTIONS];
      if (keep) {
        newOptions = cloneDeep(keep);
      }
    }
    return original.call(this, newPluginId, newOptions, fieldConfig);
  };
  proto[SCENE_PATCH] = true;
  return true;
}

function findScenePanel(fiber?: FiberNode | null, depth = 0): ScenePanel | undefined {
  if (!fiber || depth > 60) {
    return undefined;
  }
  const props = fiber.memoizedProps ?? {};
  for (const value of Object.values(props)) {
    if (value && typeof value === 'object' && typeof (value as ScenePanel).changePluginType === 'function') {
      return value as ScenePanel;
    }
  }
  const stateNode = fiber.stateNode;
  if (stateNode && typeof stateNode === 'object' && typeof (stateNode as ScenePanel).changePluginType === 'function') {
    return stateNode as ScenePanel;
  }
  return findScenePanel(fiber.return, depth + 1);
}

function walkFiber(fiber: FiberNode | undefined, visit: (node: FiberNode) => void, depth = 0) {
  if (!fiber || depth > 80) {
    return;
  }
  visit(fiber);
  walkFiber(fiber.child, visit, depth + 1);
  walkFiber(fiber.sibling, visit, depth + 1);
}

function patchFromElement(fromElement?: HTMLElement | null) {
  if (!fromElement) {
    return false;
  }
  const fiberKey = Object.keys(fromElement).find(
    (key) => key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance')
  );
  if (!fiberKey) {
    return false;
  }
  const fiber = (fromElement as unknown as Record<string, FiberNode | undefined>)[fiberKey];
  const panel = findScenePanel(fiber);
  return patchChangePluginType(panel);
}

function patchFromDocument() {
  if (typeof document === 'undefined') {
    return false;
  }
  let patched = false;
  const roots = document.querySelectorAll('#reactRoot, [data-testid="data-testid Panel editor content"], body');
  roots.forEach((root) => {
    const fiberKey = Object.keys(root).find(
      (key) => key.startsWith('__reactContainer') || key.startsWith('__reactFiber')
    );
    if (!fiberKey) {
      return;
    }
    const fiber = (root as unknown as Record<string, FiberNode | undefined>)[fiberKey];
    walkFiber(fiber, (node) => {
      const props = node.memoizedProps ?? {};
      for (const value of Object.values(props)) {
        if (value && typeof value === 'object' && typeof (value as ScenePanel).changePluginType === 'function') {
          if (patchChangePluginType(value as ScenePanel)) {
            patched = true;
          }
        }
      }
    });
  });
  return patched;
}

/**
 * Grafana's scene panel loads the next visualization with `{}` before
 * onPanelTypeChanged runs. Pass previous options into the load when the two
 * geomap plugins switch, and keep native Geomap's handler from wiping them.
 */
export function patchScenePanelSwitch(fromElement?: HTMLElement | null) {
  if (patchFromElement(fromElement)) {
    return;
  }
  patchFromDocument();
}

/** Remember the current map options so a switch can restore them if scene clears first. */
export function rememberGeomapOptions(options?: Record<string, unknown>) {
  if (options && typeof options === 'object' && Object.keys(options).length) {
    window[LAST_OPTIONS] = cloneDeep(options);
  }
}

/** Keep the configured map when the editor switches Geomap <-> Geomap Layers. */
export function bridgeNativeGeomap() {
  try {
    if (typeof getPluginImportUtils === 'function') {
      const utils = getPluginImportUtils();
      const cached = utils.getPanelPluginFromCache?.('geomap') as PluginLike | undefined;
      if (!wrap(cached)) {
        void utils.importPanelPlugin?.('geomap')?.then((plugin) => {
          wrap(plugin as PluginLike);
        });
      }
    }
  } catch {
    // Switching into Geomap Layers still keeps options via mapPanelChangedHandler.
  }

  if (typeof window !== 'undefined') {
    patchFromDocument();
    window.setTimeout(patchFromDocument, 0);
    window.setTimeout(patchFromDocument, 500);
    window.setTimeout(patchFromDocument, 1500);
  }
}
