import { type StandardEditorProps } from '@grafana/data';
import { getTemplateSrv } from '@grafana/runtime';
import { Select } from '@grafana/ui';

export const VariableNameEditor = ({ value, onChange, id }: StandardEditorProps<string>) => {
  const options = getTemplateSrv()
    .getVariables()
    .map((variable) => ({
      label: variable.name,
      value: variable.name,
    }));

  return (
    <Select
      inputId={id}
      options={options}
      value={value}
      allowCustomValue
      placeholder="Variable name"
      onChange={(selected) => onChange(selected.value ?? '')}
    />
  );
};
