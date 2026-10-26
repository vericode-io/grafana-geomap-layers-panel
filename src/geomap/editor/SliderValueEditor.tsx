import { type FieldConfigPropertyItem, type StandardEditorProps } from '@grafana/data';
import { Slider } from '@grafana/ui';

export function SliderValueEditor({
  value,
  onChange,
  item,
  id,
}: StandardEditorProps<number, { min?: number; max?: number; step?: number }>) {
  const settings = (item as FieldConfigPropertyItem<{ min?: number; max?: number; step?: number }>)?.settings ?? {};
  const min = settings.min ?? 0;
  const max = settings.max ?? 1;

  return (
    <Slider
      inputId={id ?? 'slider-value-editor'}
      min={min}
      max={max}
      step={settings.step ?? 0.1}
      value={value ?? min}
      onChange={(next) => onChange(next)}
      included
    />
  );
}
