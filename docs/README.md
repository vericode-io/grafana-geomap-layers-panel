# Geomap Layers

Guia em português. A página curta do repositório (inglês, estilo catálogo Grafana) está em [README.md](../README.md).

## O que é

Painel Grafana baseado no **Geomap** nativo, com legenda para mostrar ou ocultar cada layer (incluindo o basemap), e sync opcional com variável de dashboard / URL.

- **Id:** `vericode-geomaplayers-panel`
- **Nome no Grafana:** Geomap Layers
- **Grafana:** 12.0.0 ou mais novo
- **Licença:** AGPL-3.0 (por derivar do Geomap do Grafana)

Ainda sem assinatura: precisa do id na allow-list de plugins unsigned.

## Por que existe

No Geomap padrão não há legenda simples para ligar/desligar cada layer (incluindo o mapa base) na operação. Em dashboards ONS/operacionais isso é constante: “só usinas e rota”, “esconder satélite”, link com o conjunto certo já aberto — sem editar o JSON do painel a cada vez.

## O que este plugin faz

Mantém o motor do Geomap (OpenLayers): basemap, markers, GeoJSON, route, tiles XYZ, tooltip, measure, controles de mapa.

### Legenda Layers

Controle no **canto superior esquerdo** (abaixo do zoom, se estiver ligado):

- Ícone de **2 layers** → abre a lista
- **X** → fecha
- Checkboxes por layer (nome configurado no painel)

A legenda mexe só na visibilidade do mapa. **Não** grava de volta na variável do dashboard.

### Sync com variável / URL

Em **Map controls**:

- **Sync layers to dashboard variable**
- **Layers variable name** (ex.: `mapLayers`)

Fluxo **unidirecional**: combo ou URL → painéis sincronizados. Mudança só na legenda **não** altera a combo.

`All` = todas as layers visíveis.

### Presets (`|`)

Na variável Custom do Grafana, use `Rótulo : valor` e junte nomes com `|`:

```
Principal (Usinas & Rotas) : Usinas|Rota, Basemap, Satelite, Regioes, Usinas, Rota
```

- Na combo: **Principal (Usinas & Rotas)**
- Aplicado: `Usinas` e `Rota`
- Nomes devem ser **iguais** aos **Name** das layers no painel

URL:

```
.../d/<uid>?var-mapLayers=Usinas|Rota
.../d/<uid>?var-mapLayers=Usinas&var-mapLayers=Regioes
```

## Instalação

### Desenvolvimento local

```bash
npm install
npm run build
npm run server
```

http://localhost:3000 — login **admin / admin**. Home = dashboard provisionado `geomap-layers.json` (painel principal + exemplos Markers / GeoJSON / Route / XYZ, variável `mapLayers`, GeoJSON de demo).

### Em um Grafana existente

1. `npm run build` → pasta `dist/`
2. Copie como `vericode-geomaplayers-panel` no diretório de plugins
3. Allow-list:

```ini
[plugins]
allow_loading_unsigned_plugins = vericode-geomaplayers-panel
```

4. Reinicie o Grafana

## Como usar

1. Adicione o painel **Geomap Layers**
2. Configure basemap e layers de dados (dê nomes claros)
3. Use o controle **Layers** no mapa para show/hide
4. Opcional: crie a variável Custom, ligue o sync nas opções do painel

## Peças principais (código)

| Área | Onde |
| --- | --- |
| Painel / mapa | `src/geomap/GeomapPanel.tsx` |
| Legenda | `src/geomap/components/LayerVisibilityControl.tsx` |
| Variável / presets `|` | `src/geomap/utils/layersVariable.ts` |
| Opções do editor | `src/module.tsx` |
| Dashboard demo | `provisioning/dashboards/geomap-layers.json` |
| Logo | `src/img/logo.svg` |

## Desenvolvimento (atalhos)

| Comando | Função |
| --- | --- |
| `npm run build` | Build → `dist/` |
| `npm run dev` | Watch |
| `npm run typecheck` / `lint` / `test:ci` | Gates de CI |
| `npm run server` | Grafana 12 via Docker Compose |

## Licença

GNU Affero General Public License v3.0 (AGPL-3.0). Baseado no painel Geomap do Grafana.
