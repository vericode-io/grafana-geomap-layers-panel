import { css, cx } from '@emotion/css';
import { useState } from 'react';

import { type GrafanaTheme2 } from '@grafana/data';
import { Icon, useStyles2 } from '@grafana/ui';

export interface LayerVisibilityItem {
  key: string;
  label: string;
  visible: boolean;
}

interface Props {
  items: LayerVisibilityItem[];
  onToggle: (key: string) => void;
}

/** Two stacked map layers — clearer than the 3-layer unicon at small size. */
function LayersTwoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" width="16" height="16" aria-hidden focusable="false">
      <path
        fill="currentColor"
        d="M12 3.2 3.6 8a1 1 0 0 0 0 1.75L12 14.55l8.4-4.8a1 1 0 0 0 0-1.75L12 3.2zm0 2.3 5.7 3.25L12 11.95 6.3 8.75 12 5.5zM3.6 13.1a1 1 0 0 0 0 1.75L12 19.65l8.4-4.8a1 1 0 1 0-1-1.75L12 17.15l-7.4-4.25a1 1 0 0 0-1 0z"
      />
    </svg>
  );
}

/** Collapsible layer list — toggle below zoom (top-left), 2-layer icon / times. */
export function LayerVisibilityControl({ items, onToggle }: Props) {
  const styles = useStyles2(getStyles);
  const [collapsed, setCollapsed] = useState(true);

  if (!items.length) {
    return null;
  }

  return (
    <div className={cx(styles.control, collapsed ? styles.collapsed : styles.expanded)}>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Show layers' : 'Hide layers'}
        title="Layers"
        onClick={() => setCollapsed((value) => !value)}
      >
        {collapsed ? <LayersTwoIcon className={styles.layersIcon} /> : <Icon name="times" size="md" />}
      </button>
      {!collapsed && (
        <div className={styles.box}>
          <div className={styles.title}>Layers</div>
          {items.map((item) => (
            <label key={item.key} className={styles.row}>
              <input type="checkbox" checked={item.visible} onChange={() => onToggle(item.key)} />
              <span>{item.label}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  control: css({
    display: 'inline-flex',
    alignItems: 'flex-start',
    maxWidth: 280,
    pointerEvents: 'auto',
  }),
  collapsed: css({}),
  expanded: css({
    gap: 4,
  }),
  toggle: css({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 26,
    height: 26,
    margin: 0,
    padding: 0,
    border: `1px solid ${theme.colors.border.medium}`,
    borderRadius: theme.shape.radius.default,
    background: theme.colors.background.primary,
    color: theme.colors.text.primary,
    boxShadow: theme.shadows.z1,
    cursor: 'pointer',
    flexShrink: 0,
    '&:hover': {
      background: theme.colors.background.secondary,
      color: theme.colors.text.maxContrast,
    },
  }),
  layersIcon: css({
    display: 'block',
    opacity: 1,
  }),
  box: css({
    margin: 0,
    padding: '8px 10px',
    minWidth: 160,
    border: `1px solid ${theme.colors.border.medium}`,
    borderRadius: theme.shape.radius.default,
    background: theme.colors.background.primary,
    color: theme.colors.text.primary,
    boxShadow: theme.shadows.z2,
  }),
  title: css({
    marginBottom: 4,
    fontSize: theme.typography.bodySmall.fontSize,
    fontWeight: theme.typography.fontWeightMedium,
  }),
  row: css({
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '3px 0',
    cursor: 'pointer',
    fontSize: theme.typography.bodySmall.fontSize,
  }),
});
