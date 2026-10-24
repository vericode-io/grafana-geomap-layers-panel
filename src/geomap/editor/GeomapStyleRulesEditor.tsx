import { type StandardEditorProps } from '@grafana/data';
import { ComparisonOperation } from '@grafana/schema';
import { Button, ColorPicker, Field, Input, Select } from '@grafana/ui';

import { DEFAULT_STYLE_RULE } from '../layers/data/geojsonLayer';
import { defaultStyleConfig } from '../style/types';
import { type FeatureStyleConfig } from '../types';

const OPERATIONS = [
  { label: 'Equals', value: ComparisonOperation.EQ },
  { label: 'Not equals', value: ComparisonOperation.NEQ },
  { label: 'Greater than', value: ComparisonOperation.GT },
  { label: 'Greater or equal', value: ComparisonOperation.GTE },
  { label: 'Less than', value: ComparisonOperation.LT },
  { label: 'Less or equal', value: ComparisonOperation.LTE },
];

export function GeomapStyleRulesEditor({ value, onChange }: StandardEditorProps<FeatureStyleConfig[]>) {
  const rules = value ?? [];

  const updateRule = (index: number, next: FeatureStyleConfig) => {
    const copy = rules.slice();
    copy[index] = next;
    onChange(copy);
  };

  return (
    <div>
      {rules.map((rule, index) => (
        <div key={index}>
          <Field label="Property">
            <Input
              value={rule.check?.property ?? ''}
              onChange={(event) =>
                updateRule(index, {
                  ...rule,
                  check: {
                    property: event.currentTarget.value,
                    operation: rule.check?.operation ?? ComparisonOperation.EQ,
                    value: rule.check?.value ?? '',
                  },
                })
              }
            />
          </Field>
          <Field label="Operation">
            <Select
              options={OPERATIONS}
              value={rule.check?.operation ?? ComparisonOperation.EQ}
              onChange={(selected) =>
                updateRule(index, {
                  ...rule,
                  check: {
                    property: rule.check?.property ?? '',
                    operation: selected.value ?? ComparisonOperation.EQ,
                    value: rule.check?.value ?? '',
                  },
                })
              }
            />
          </Field>
          <Field label="Value">
            <Input
              value={String(rule.check?.value ?? '')}
              onChange={(event) =>
                updateRule(index, {
                  ...rule,
                  check: {
                    property: rule.check?.property ?? '',
                    operation: rule.check?.operation ?? ComparisonOperation.EQ,
                    value: event.currentTarget.value,
                  },
                })
              }
            />
          </Field>
          <Field label="Color">
            <ColorPicker
              color={rule.style?.color?.fixed ?? defaultStyleConfig.color.fixed}
              onChange={(color) =>
                updateRule(index, {
                  ...rule,
                  style: {
                    ...defaultStyleConfig,
                    ...rule.style,
                    color: { fixed: color },
                  },
                })
              }
            />
          </Field>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => onChange(rules.filter((_, ruleIndex) => ruleIndex !== index))}
          >
            Remove rule
          </Button>
        </div>
      ))}
      <Button
        size="sm"
        variant="secondary"
        icon="plus"
        onClick={() => onChange([...rules, { ...DEFAULT_STYLE_RULE, style: { ...defaultStyleConfig } }])}
      >
        Add style rule
      </Button>
    </div>
  );
}
