import { type ComponentProps } from 'react';

import { Input } from '@grafana/ui';

interface Props extends Omit<ComponentProps<typeof Input>, 'value' | 'onChange' | 'type'> {
  value?: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value?: number) => void;
}

export function NumberInput({ value, min, max, step, onChange, ...rest }: Props) {
  return (
    <Input
      {...rest}
      type="number"
      min={min}
      max={max}
      step={step}
      value={value ?? ''}
      onChange={(event) => {
        const raw = event.currentTarget.value;
        onChange(raw === '' ? undefined : Number(raw));
      }}
    />
  );
}
