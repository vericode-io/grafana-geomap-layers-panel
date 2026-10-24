# Geomap Layers

A página do repositório, em inglês, está em [README.md](../README.md). Este arquivo é o overview em português.

Painel do Grafana baseado no **Geomap** nativo, com legenda para mostrar ou ocultar cada layer (incluindo o basemap). O id é `vericode-geomaplayers-panel`. O nome no Grafana é **Geomap Layers**. Exige Grafana 11.0.0 ou mais novo e ainda não tem assinatura.

É um fork do painel Geomap do Grafana (OpenLayers), licença **AGPL-3.0**. Mantém basemap, markers, GeoJSON, route, tiles XYZ, tooltip, measure e controles de mapa. O que o nativo não traz — e motivou este plugin — é o controle fino de visibilidade das layers na operação e a ligação com variável de dashboard / URL.

## Por que não só o Geomap nativo

No Geomap padrão não há uma legenda simples para ligar/desligar cada layer (incluindo o mapa base) no painel. Em dashboards ONS/operacionais isso aparece o tempo todo: “mostrar só usinas e rota”, “esconder satélite”, compartilhar um link com o conjunto certo já aberto.

Este painel resolve isso no runtime, sem editar o JSON do painel a cada vez.

## O que este plugin faz

### Legenda Layers

Controle no **canto superior esquerdo** (abaixo do zoom, se o zoom estiver ligado):

- Ícone de **2 layers** → abre a lista
- **X** → fecha
- Checkboxes por layer (nome configurado no painel)

A legenda mexe só no estado visual do mapa. Não grava de volta na variável do dashboard.

### Sync com variável / URL

Opção em **Map controls**:

- **Sync layers to dashboard variable**
- **Layers variable name** (padrão: `mapLayers`)

Fluxo **unidirecional**:

1. Usuário muda a **combo** (ou a URL `var-mapLayers=...`)
2. Todos os painéis com sync ligado aplicam a visibilidade
3. Se o usuário só marcar/desmarcar na legenda, a combo **não** muda

`All` = todas as layers visíveis.

### Presets (vários layers num item da combo)

Na variável Custom do Grafana, use `Rótulo : valor` e junte nomes com `|`:

```
Principal (Usinas & Rotas) : Usinas|Rota, Basemap, Satelite, Regioes, Usinas, Rota
```

- Na combo aparece **Principal (Usinas & Rotas)**
- No load / mudança, o plugin aplica `Usinas` e `Rota`
- Os nomes precisam ser **iguais** aos nomes das layers no painel

URL de exemplo:

```
.../d/<uid>?var-mapLayers=Usinas|Rota
```

## Demo local

```bash
npm install
npm run build
npm run server
```

http://localhost:3000 — dashboard provisionado `geomap-layers.json` (home):

- Painel principal com Basemap, Satelite, Usinas, Regioes, Rota
- Quatro painéis de exemplo (Markers, GeoJSON, Route, XYZ)
- Variável `mapLayers` com preset Principal
- GeoJSON de demo montado em `public/maps/ons-demo.geojson` no container

## Peças principais (código)

| Área | Onde |
| --- | --- |
| Painel / mapa | `src/geomap/GeomapPanel.tsx` |
| Legenda | `src/geomap/components/LayerVisibilityControl.tsx` |
| Variável / presets `|` | `src/geomap/utils/layersVariable.ts` |
| Opções do editor | `src/module.tsx` |
| Dashboard demo | `provisioning/dashboards/geomap-layers.json` |
| Logo | `src/img/logo.png` |

## Instalação

Na raiz, `npm install` e `npm run build` geram `dist/`. A pasta no Grafana deve se chamar `vericode-geomaplayers-panel` e conter `plugin.json` e `module.js`.

```ini
[plugins]
allow_loading_unsigned_plugins = vericode-geomaplayers-panel
```

Reinicie o Grafana. Se aparecer "Plugin not signed", o id não está na allow-list ou o serviço não reiniciou.

## Logo

Ícone atual: SVG (`src/img/logo.svg`). Na UI o tamanho típico é ~48×48.

## Licença

GNU Affero General Public License v3.0 (AGPL-3.0), por derivar do Geomap do Grafana.
