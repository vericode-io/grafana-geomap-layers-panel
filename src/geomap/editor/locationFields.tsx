import { type DataFrame, FieldType, type Field, type PanelOptionsEditorBuilder, type StandardEditorProps } from '@grafana/data';
import { t } from '@grafana/i18n';
import { type FrameGeometrySource, FrameGeometrySourceMode } from '@grafana/schema';
import { Select } from '@grafana/ui';

const MODE_OPTIONS = [
  {
    value: FrameGeometrySourceMode.Auto,
    label: 'Auto',
    description: 'Automatically identify location data based on default field names',
  },
  {
    value: FrameGeometrySourceMode.Coords,
    label: 'Coords',
    description: 'Specify latitude and longitude fields',
  },
  {
    value: FrameGeometrySourceMode.Geohash,
    label: 'Geohash',
    description: 'Specify geohash field',
  },
  {
    value: FrameGeometrySourceMode.Lookup,
    label: 'Lookup',
    description: 'Specify gazetteer and lookup field',
  },
];

export const LocationModeEditor = ({ value, onChange, id }: StandardEditorProps<string>) => {
  return <Select inputId={id} options={MODE_OPTIONS} value={value} onChange={(selected) => onChange(selected.value)} />;
};

export function addLocationFields<TOptions>(
  _title: string,
  prefix: string,
  builder: PanelOptionsEditorBuilder<TOptions>,
  source?: FrameGeometrySource,
  _data?: DataFrame[]
) {
  builder.addCustomEditor({
    id: 'modeEditor',
    path: `${prefix}mode`,
    name: t('geo.location-editor.name-location-mode', 'Location Mode'),
    editor: LocationModeEditor,
  });

  const numeric = (field: Field) => field.type === FieldType.number;
  const text = (field: Field) => field.type === FieldType.string;

  switch (source?.mode) {
    case FrameGeometrySourceMode.Coords:
      builder
        .addFieldNamePicker({
          path: `${prefix}latitude`,
          name: t('geo.location-editor.name-latitude-field', 'Latitude field'),
          settings: {
            filter: numeric,
            noFieldsMessage: 'No numeric fields found',
          },
        })
        .addFieldNamePicker({
          path: `${prefix}longitude`,
          name: t('geo.location-editor.name-longitude-field', 'Longitude field'),
          settings: {
            filter: numeric,
            noFieldsMessage: 'No numeric fields found',
          },
        });
      break;
    case FrameGeometrySourceMode.Geohash:
      builder.addFieldNamePicker({
        path: `${prefix}geohash`,
        name: t('geo.location-editor.name-geohash-field', 'Geohash field'),
        settings: {
          filter: text,
          noFieldsMessage: 'No string fields found',
        },
      });
      break;
    case FrameGeometrySourceMode.Lookup:
      builder
        .addFieldNamePicker({
          path: `${prefix}lookup`,
          name: t('geo.location-editor.name-lookup-field', 'Lookup field'),
          settings: {
            filter: text,
            noFieldsMessage: 'No string fields found',
          },
        })
        .addTextInput({
          path: `${prefix}gazetteer`,
          name: t('geo.location-editor.name-gazetteer', 'Gazetteer'),
          settings: {
            placeholder: 'public/gazetteer/countries.json',
          },
        });
      break;
    default:
      break;
  }
}
