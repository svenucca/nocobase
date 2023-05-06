export default {
  Nester: {
    type: 'void',
    'x-component': 'AssociationField.Nester',
    properties: {
      grid: {
        type: 'void',
        'x-component': 'Grid',
        'x-initializer': 'FormItemInitializers',
      },
    },
  },
  AddNewer: {
    type: 'void',
    'x-component': 'AssociationField.AddNewer',
    'x-action': 'create',
    title: '{{ t("Add record") }}',
    'x-component-props': {
      className: 'nb-action-popup',
    },
    properties: {
      tabs: {
        type: 'void',
        'x-component': 'Tabs',
        'x-component-props': {},
        'x-initializer': 'TabPaneInitializersForCreateFormBlock',
        properties: {
          tab1: {
            type: 'void',
            title: '{{t("Add new")}}',
            'x-component': 'Tabs.TabPane',
            'x-designer': 'Tabs.Designer',
            'x-component-props': {},
            properties: {
              grid: {
                type: 'void',
                'x-component': 'Grid',
                'x-initializer': 'CreateFormBlockInitializers',
                properties: {},
              },
            },
          },
        },
      },
    },
  },
  Selector: {
    type: 'void',
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
  Viewer: {
    type: 'void',
    title: '{{ t("View record") }}',
    'x-component': 'AssociationField.Viewer',
    'x-component-props': {
      className: 'nb-action-popup',
    },
    properties: {
      tabs: {
        type: 'void',
        'x-component': 'Tabs',
        'x-component-props': {},
        'x-initializer': 'TabPaneInitializers',
        properties: {
          tab1: {
            type: 'void',
            title: '{{t("Details")}}',
            'x-component': 'Tabs.TabPane',
            'x-designer': 'Tabs.Designer',
            'x-component-props': {},
            properties: {
              grid: {
                type: 'void',
                'x-component': 'Grid',
                'x-initializer': 'RecordBlockInitializers',
                properties: {},
              },
            },
          },
        },
      },
    },
  },
  SubTable: {
    type: 'void',
    'x-decorator': 'TableBlockProvider',
    'x-component': 'AssociationField.SubTable',
    properties: {
      actions: {
        type: 'void',
        'x-initializer': 'SubTableActionInitializers',
        'x-component': 'AssociationField.SubTable.ActionBar',
        'x-component-props': {},
      },
      table: {
        type: 'array',
        'x-initializer': 'TableColumnInitializers',
        'x-component': 'TableV2',
        'x-component-props': {
          rowSelection: {
            type: 'checkbox',
          },
          useProps: '{{ useTableBlockProps }}',
        },
      },
    },
  },
};
