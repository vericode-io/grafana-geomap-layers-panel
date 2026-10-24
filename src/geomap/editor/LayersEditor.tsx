import { type StandardEditorProps } from '@grafana/data';
import { Container } from '@grafana/ui';

import { getLayersOptions } from '../layers/registry';
import { type Options } from '../panelcfg.gen';
import { type GeomapInstanceState, type MapLayerState } from '../types';

import { AddLayerButton } from './layers/AddLayerButton';
import { LayerDragDropList } from './layers/LayerDragDropList';

export const LayersEditor = ({ context }: StandardEditorProps<unknown, unknown, Options, GeomapInstanceState>) => {
  const { layers, selected, actions } = context.instanceState ?? {};
  if (!layers || !actions) {
    return <div>No layers?</div>;
  }

  const onSelect = (element: MapLayerState) => {
    actions.selectLayer(element.options.name);
  };

  return (
    <>
      <Container>
        <AddLayerButton
          onChange={(selection) => actions.addlayer(selection.value!)}
          options={getLayersOptions(false).options}
          label="Add layer"
        />
      </Container>
      <br />
      <LayerDragDropList
        layers={layers}
        showActions={() => layers.length > 2}
        getLayerInfo={(element) => element.options.type}
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }
          const count = layers.length - 1;
          const source = (result.source.index - count) * -1;
          const destination = (result.destination.index - count) * -1;
          actions.reorder(source, destination);
        }}
        onSelect={onSelect}
        onDelete={(element) => actions.deleteLayer(element.options.name)}
        selection={selected ? [layers[selected]?.getName()] : []}
        excludeBaseLayer
        onNameChange={(element, name) => element.onChange({ ...element.options, name })}
        verifyLayerNameUniqueness={actions.canRename}
      />
    </>
  );
};
