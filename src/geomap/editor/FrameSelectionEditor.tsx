import { useMemo } from 'react';

import { FrameMatcherID, type MatcherConfig, type StandardEditorProps } from '@grafana/data';
import { Select } from '@grafana/ui';

export const FrameSelectionEditor = ({ value, context, onChange, id }: StandardEditorProps<MatcherConfig>) => {
  const options = useMemo(() => {
    const refIds = [...new Set(context.data.map((frame) => frame.refId).filter(Boolean))];
    return [{ label: 'All data', value: '' }, ...refIds.map((refId) => ({ label: refId, value: refId }))];
  }, [context.data]);

  return (
    <Select
      inputId={id}
      options={options}
      value={typeof value?.options === 'string' ? value.options : ''}
      onChange={(selected) => {
        const next = selected.value;
        onChange(next ? { id: FrameMatcherID.byRefId, options: next } : undefined);
      }}
      placeholder="All data"
    />
  );
};
