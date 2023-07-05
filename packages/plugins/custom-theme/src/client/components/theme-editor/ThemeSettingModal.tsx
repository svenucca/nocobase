import { useAPIClient } from '@nocobase/client';
import { error } from '@nocobase/utils/client';
import { Button, Form, Input, Modal, Space, theme as antdTheme } from 'antd';
import React from 'react';
import { ThemeConfig } from '../../../types';
import { useUpdateThemeSettings } from '../../hooks/useThemeSettings';
import { useTranslation } from '../../locale';
import { useThemeListContext } from '../ThemeListProvider';
interface Props {
  open: boolean;
  theme: ThemeConfig;
  onOk?(data: { name: string }): void;
  onCancel?(): void;
}

const ThemeSettingModal = (props: Props) => {
  const { t } = useTranslation();
  const api = useAPIClient();
  const { open, onOk, onCancel, theme } = props;
  const [loading, setLoading] = React.useState(false);
  const { refresh } = useThemeListContext();
  const { updateThemeSettingsOnly } = useUpdateThemeSettings();

  const handleFormValue = React.useCallback(
    async (values) => {
      setLoading(true);
      try {
        const data = await api.request({
          url: 'themeConfig:create',
          method: 'POST',
          data: {
            config: {
              ...parseTheme(theme),
              name: values.name,
            },
            optional: true,
            isBuiltIn: false,
          },
        });
        await updateThemeSettingsOnly(data.data.data.id);
        onOk?.(values);
        refresh?.();
      } catch (err) {
        error(err);
      }
      setLoading(false);
    },
    [theme],
  );

  return (
    <Modal title={t('Save theme')} open={open} onCancel={onCancel} footer={null}>
      <Form onFinish={handleFormValue} autoComplete="off">
        <Form.Item name="name" rules={[{ required: true, message: t('Please input the theme name') }]}>
          <Input placeholder={t('Please set a name for this theme')} />
        </Form.Item>
        <Space align="end" style={{ width: '100%', justifyContent: 'flex-end' }}>
          <Button key="back" onClick={onCancel}>
            {t('Cancel')}
          </Button>
          <Button key="submit" type="primary" loading={loading} htmlType="submit">
            {t('Save')}
          </Button>
        </Space>
      </Form>
    </Modal>
  );
};

ThemeSettingModal.displayName = 'ThemeSettingModal';

export default ThemeSettingModal;

export function parseTheme(themeConfig: any) {
  if (!themeConfig.algorithm) {
    return themeConfig;
  }
  if (Array.isArray(themeConfig.algorithm)) {
    themeConfig.algorithm = themeConfig.algorithm.map((algorithm) => parseAlgorithm(algorithm));
  } else {
    themeConfig.algorithm = parseAlgorithm(themeConfig.algorithm);
  }
  return themeConfig;
}

function parseAlgorithm(algorithm: ThemeConfig['algorithm']): string {
  if (typeof algorithm === 'string') {
    return algorithm;
  }
  if (algorithm.toString() === antdTheme.darkAlgorithm.toString()) {
    return 'darkAlgorithm';
  }
  if (algorithm.toString() === antdTheme.compactAlgorithm.toString()) {
    return 'compactAlgorithm';
  }
  return algorithm.toString();
}
