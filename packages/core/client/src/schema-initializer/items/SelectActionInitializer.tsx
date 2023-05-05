import React from 'react';
import { useField, useFieldSchema } from '@formily/react';
import { useCollection } from '../../';
import { ActionInitializer } from './ActionInitializer';

export const SelectActionInitializer = (props) => {
  const { getField } = useCollection();
  const fieldSchema = useFieldSchema();
  const collectionField = getField(fieldSchema.name);
  const schema = {
    type: 'void',
    title: '{{ t("Select") }}',
    'x-action': 'update',
    'x-designer': 'Action.Designer',
    'x-component': 'Action',
    'x-component-props': {
      openMode: 'drawer',
    },
    properties: {
      drawer: {
        type: 'void',
        'x-decorator': 'RecordPickerProvider',
        'x-decorator-props': {
          size: 'small',
          fieldNames: props.fieldNames,
          multiple: ['o2m', 'm2m'].includes(collectionField?.interface),
          association: {
            target: collectionField?.target,
          },
          onChange: props?.onChange,
        },
        'x-component': 'AssociationField.Selector',
        title: '{{ t("Select record") }}',
        'x-component-props': {
          className: 'nb-record-picker-selector',
        },
        properties: {
          grid: {
            type: 'void',
            'x-component': 'Grid',
            'x-initializer': 'TableSelectorInitializers',
            properties: {},
          },
          footer: {
            'x-component': 'Action.Container.Footer',
            'x-component-props': {},
            properties: {
              actions: {
                type: 'void',
                'x-component': 'ActionBar',
                'x-component-props': {},
                properties: {
                  submit: {
                    title: '{{ t("Submit") }}',
                    'x-action': 'submit',
                    'x-component': 'Action',
                    'x-designer': 'Action.Designer',
                    'x-component-props': {
                      type: 'primary',
                      htmlType: 'submit',
                      useProps: '{{ usePickActionProps }}',
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  };
  return <ActionInitializer {...props} schema={schema} />;
};