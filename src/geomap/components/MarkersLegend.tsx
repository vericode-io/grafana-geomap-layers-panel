import { css } from '@emotion/css';

import { type GrafanaTheme2 } from '@grafana/data';
import { useStyles2 } from '@grafana/ui';

import { type StyleConfigState } from '../style/types';

export interface MarkersLegendProps {
  layerName?: string;
  styleConfig?: StyleConfigState;
}

export function MarkersLegend({ layerName, styleConfig }: MarkersLegendProps) {
  const styles = useStyles2(getStyles);
  if (!styleConfig) {
    return null;
  }

  return (
    <div className={styles.row}>
      <span className={styles.swatch} style={{ background: styleConfig.base.color }} />
      <span>{layerName}</span>
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  row: css({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 8px',
    background: theme.colors.background.primary,
    borderRadius: theme.shape.radius.default,
    fontSize: theme.typography.bodySmall.fontSize,
  }),
  swatch: css({
    width: 10,
    height: 10,
    borderRadius: 10,
  }),
});
