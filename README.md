# Geomap Layers

Grafana panel based on the native Geomap, with a legend that shows or hides each layer, including the basemap.

Plugin id: `vericode-geomaplayers-panel` · Panel name: **Geomap Layers** · Grafana **11.0+** · License **AGPL-3.0**

Derived from [Grafana Geomap](https://github.com/grafana/grafana/tree/main/public/app/plugins/panel/geomap).

Portuguese overview: [docs/README.md](docs/README.md).

## Overview

Same map engine as Grafana Geomap (OpenLayers): basemap, markers, GeoJSON, route, XYZ tiles, tooltips, measure, and the usual map controls.

What this panel adds:

| Feature | Behavior |
| --- | --- |
| **Layers legend** | Toggle (top-left): open with a 2-layer icon, close with **X**. Checkboxes show/hide each layer, including the basemap. |
| **Dashboard variable sync** | Optional. Combo / URL → panels (live). Legend does **not** write back to the variable. |
| **Presets** | Custom variable values can group layers with `\|`, e.g. label `Principal (Usinas & Rotas)` → value `Usinas\|Rota`. |

Layer names in the variable must match the layer **Name** in panel options (e.g. `Basemap`, `Satelite`, `Usinas`, `Regioes`, `Rota`).

## Requirements

- Grafana 11.0.0 or later

## Development

Scaffolded with [`@grafana/create-plugin`](https://github.com/grafana/plugin-tools).

```bash
npm install
npm run build
npm run server
```

Open http://localhost:3000 — the demo dashboard is the home dashboard.

Useful scripts: `npm run dev` (watch), `npm run typecheck`, `npm run lint`, `npm run test:ci`.

## Installation

The plugin is not signed yet. Grafana loads it only if the plugin id is allowed.

1. Build with `npm install` and `npm run build`, or use an existing `dist` folder.
2. Copy that folder to the Grafana plugins directory and name it `vericode-geomaplayers-panel` (must contain `plugin.json` and `module.js`).
3. Allow the unsigned plugin in `grafana.ini`:

```ini
[plugins]
allow_loading_unsigned_plugins = vericode-geomaplayers-panel
```

4. Restart Grafana.

On Docker:

```yaml
environment:
  GF_PLUGINS_ALLOW_LOADING_UNSIGNED_PLUGINS: vericode-geomaplayers-panel
volumes:
  - ./dist:/var/lib/grafana/plugins/vericode-geomaplayers-panel
```

## Usage

1. Add a panel and choose **Geomap Layers**.
2. Configure basemap and data layers as in native Geomap (name each layer clearly).
3. Use the **Layers** control (top-left) to show or hide layers at runtime.
4. Optional — Map controls:
   - **Sync layers to dashboard variable** — combo/URL drives visibility.
   - **Layers variable name** — e.g. `mapLayers`.

Demo dashboard (`provisioning/dashboards/geomap-layers.json`): main panel + Markers / GeoJSON / Route / XYZ, shared `mapLayers` variable, layout with the main map on the left and four examples on the right.

## Initial layers via URL / combo

1. Create a dashboard variable (Custom; multi optional), e.g. `mapLayers`.
2. Values must match **layer names**. For named presets use Grafana `Label : value` and join layers with `|`:

   ```
   Principal (Usinas & Rotas) : Usinas|Rota, Basemap, Satelite, Regioes, Usinas, Rota
   ```

   The combo shows **Principal (Usinas & Rotas)**; the value applied is `Usinas|Rota`.
3. Panel options → Map controls: enable sync and set the variable name.
4. Changing the combo (or URL) updates all synced panels. The Layers legend does **not** update the variable.

```
.../d/<uid>?var-mapLayers=Usinas|Rota
.../d/<uid>?var-mapLayers=Usinas&var-mapLayers=Regioes
```

`All` means every layer is visible.

## Logo

Plugin icon: `src/img/logo.svg` (square SVG). Display size in the UI is about **48×48**.

## License

GNU Affero General Public License v3.0 (AGPL-3.0). Based on the Grafana Geomap panel.
