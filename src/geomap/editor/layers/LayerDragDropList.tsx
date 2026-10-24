import { css, cx } from '@emotion/css';
import { DragDropContext, Draggable, Droppable, type DropResult } from '@hello-pangea/dnd';
import { type JSX } from 'react';

import { type GrafanaTheme2 } from '@grafana/data';
import { Icon, IconButton, useStyles2 } from '@grafana/ui';

import { type MapLayerState } from '../../types';

import { LayerName } from './LayerName';

export function LayerDragDropList({
  layers,
  getLayerInfo,
  onDragEnd,
  onSelect,
  onDelete,
  showActions,
  selection,
  excludeBaseLayer = false,
  onNameChange,
  verifyLayerNameUniqueness,
}: {
  layers: MapLayerState[];
  getLayerInfo: (element: MapLayerState) => string;
  onDragEnd: (result: DropResult) => void;
  onSelect: (element: MapLayerState) => void;
  onDelete: (element: MapLayerState) => void;
  showActions: (element: MapLayerState) => boolean;
  selection?: string[];
  excludeBaseLayer?: boolean;
  onNameChange: (element: MapLayerState, name: string) => void;
  verifyLayerNameUniqueness?: (nameToCheck: string) => boolean;
}) {
  const style = useStyles2(getStyles);
  const lastLayerIndex = excludeBaseLayer ? 1 : 0;
  const dragThreshold = excludeBaseLayer ? 2 : 1;

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="droppable">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {(() => {
              const rows: JSX.Element[] = [];
              for (let index = layers.length - 1; index >= lastLayerIndex; index--) {
                const element = layers[index];
                const uid = element.getName();
                const isSelected = Boolean(selection?.includes(uid));
                rows.push(
                  <Draggable key={uid} draggableId={uid} index={rows.length}>
                    {(dragProvided) => (
                      <div
                        className={isSelected ? `${style.row} ${style.selected}` : style.row}
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
                        onClick={() => onSelect(element)}
                      >
                        <LayerName
                          name={uid}
                          onChange={(name) => onNameChange(element, name)}
                          verifyLayerNameUniqueness={verifyLayerNameUniqueness}
                        />
                        <div className={style.text}>&nbsp; {getLayerInfo(element)}</div>
                        {showActions(element) && (
                          <IconButton
                            name="trash-alt"
                            tooltip="Remove"
                            className={cx(style.actionIcon, style.dragIcon)}
                            onClick={(event) => {
                              event.stopPropagation();
                              onDelete(element);
                            }}
                          />
                        )}
                        {layers.length > dragThreshold && (
                          <Icon
                            aria-label="Drag and drop to reorder"
                            name="draggabledots"
                            size="lg"
                            className={style.dragIcon}
                          />
                        )}
                      </div>
                    )}
                  </Draggable>
                );
              }
              return rows;
            })()}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

const getStyles = (theme: GrafanaTheme2) => ({
  row: css({
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.radius.default,
    background: theme.colors.background.secondary,
    minHeight: theme.spacing(4),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
    cursor: 'pointer',
    border: `1px solid ${theme.components.input.borderColor}`,
    '&:hover': {
      border: `1px solid ${theme.components.input.borderHover}`,
    },
  }),
  selected: css({
    border: `1px solid ${theme.colors.primary.border}`,
    '&:hover': {
      border: `1px solid ${theme.colors.primary.border}`,
    },
  }),
  dragIcon: css({
    cursor: 'drag',
  }),
  actionIcon: css({
    color: theme.colors.text.secondary,
    '&:hover': {
      color: theme.colors.text.primary,
    },
  }),
  text: css({
    display: 'flex',
    alignItems: 'center',
    flexGrow: 1,
    overflow: 'hidden',
    marginRight: theme.spacing(1),
  }),
});
