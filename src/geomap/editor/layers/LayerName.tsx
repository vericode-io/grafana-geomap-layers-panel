import { css, cx } from '@emotion/css';
import { useState } from 'react';

import { type GrafanaTheme2 } from '@grafana/data';
import { Icon, Input, FieldValidationMessage, useStyles2 } from '@grafana/ui';

export function LayerName({
  name,
  onChange,
  verifyLayerNameUniqueness,
}: {
  name: string;
  onChange: (name: string) => void;
  verifyLayerNameUniqueness?: (nameToCheck: string) => boolean;
}) {
  const styles = useStyles2(getStyles);
  const [isEditing, setIsEditing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const finish = (nextName: string) => {
    setIsEditing(false);
    if (validationError) {
      setValidationError(null);
      return;
    }
    if (name !== nextName) {
      onChange(nextName);
    }
  };

  return (
    <div className={styles.wrapper}>
      {!isEditing && (
        <button className={styles.layerNameWrapper} title="Edit layer name" onClick={() => setIsEditing(true)}>
          <span className={styles.layerName}>{name}</span>
          <Icon name="pen" className={styles.layerEditIcon} size="sm" />
        </button>
      )}
      {isEditing && (
        <>
          <Input
            type="text"
            defaultValue={name}
            autoFocus
            invalid={validationError !== null}
            className={styles.layerNameInput}
            onFocus={(event) => event.target.select()}
            onChange={(event) => {
              const nextName = event.currentTarget.value.trim();
              if (!nextName) {
                setValidationError('An empty layer name is not allowed');
                return;
              }
              if (verifyLayerNameUniqueness && !verifyLayerNameUniqueness(nextName) && nextName !== name) {
                setValidationError('Layer name already exists');
                return;
              }
              setValidationError(null);
            }}
            onBlur={(event) => finish(event.currentTarget.value.trim())}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                finish(event.currentTarget.value.trim());
              }
            }}
          />
          {validationError && <FieldValidationMessage horizontal>{validationError}</FieldValidationMessage>}
        </>
      )}
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  wrapper: css({
    display: 'flex',
    alignItems: 'center',
    marginLeft: theme.spacing(0.5),
  }),
  layerNameWrapper: css({
    display: 'flex',
    cursor: 'pointer',
    border: '1px solid transparent',
    borderRadius: theme.shape.radius.default,
    alignItems: 'center',
    padding: `0 0 0 ${theme.spacing(0.5)}`,
    margin: 0,
    background: 'transparent',
    '&:hover': {
      background: theme.colors.action.hover,
      border: `1px dashed ${theme.colors.border.strong}`,
    },
    '&:hover .query-name-edit-icon, &:focus .query-name-edit-icon': {
      visibility: 'visible',
    },
  }),
  layerName: css({
    fontWeight: theme.typography.fontWeightMedium,
    color: theme.colors.primary.text,
    cursor: 'pointer',
    overflow: 'hidden',
    marginLeft: theme.spacing(0.5),
  }),
  layerEditIcon: cx(
    css({
      marginLeft: theme.spacing(2),
      visibility: 'hidden',
    }),
    'query-name-edit-icon'
  ),
  layerNameInput: css({
    maxWidth: 300,
    margin: '-4px 0',
  }),
});
