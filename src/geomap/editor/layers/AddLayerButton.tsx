import { type SelectableValue } from '@grafana/data';
import { ValuePicker } from '@grafana/ui';

export function AddLayerButton({
  onChange,
  options,
  label,
}: {
  onChange: (selection: SelectableValue<string>) => void;
  options: Array<SelectableValue<string>>;
  label: string;
}) {
  return <ValuePicker icon="plus" label={label} variant="secondary" options={options} onChange={onChange} isFullWidth />;
}
