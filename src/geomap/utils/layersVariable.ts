import { getTemplateSrv } from '@grafana/runtime';

const ALL = '$__all';

/** Split preset values like `Usinas|Rota` into individual layer names. */
export function expandLayerVariableTokens(values: string[]): string[] {
  const out: string[] = [];
  for (const raw of values) {
    for (const part of String(raw).split('|')) {
      const token = part.trim();
      if (token && !out.includes(token)) {
        out.push(token);
      }
    }
  }
  return out;
}

/**
 * Current dashboard variable as layer-name tokens, or null when absent / All.
 * Supports Custom `Label : LayerA|LayerB` presets (value may contain `|`).
 * Combo/URL → panels (live). Legend toggles do not write back to the variable.
 */
export function getLayersVariableValues(variableName: string | undefined): string[] | null {
  if (!variableName?.trim()) {
    return null;
  }

  const variable = getTemplateSrv()
    .getVariables()
    .find((item) => item.name === variableName);

  if (!variable) {
    return null;
  }

  const current = (variable as { current?: { value?: string | string[] } }).current?.value;
  if (current == null || current === '') {
    return null;
  }

  const values = (Array.isArray(current) ? current : [current]).map(String);
  if (values.includes(ALL)) {
    return null;
  }

  return expandLayerVariableTokens(values);
}
