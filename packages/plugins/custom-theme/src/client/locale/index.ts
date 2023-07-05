import { i18n } from '@nocobase/client';
import { useTranslation as useT } from 'react-i18next';
import enUS from './en-US';
import zhCN from './zh-CN';

export const NAMESPACE = 'mobile-client';

i18n.addResources('zh-CN', NAMESPACE, zhCN);
i18n.addResources('en-US', NAMESPACE, enUS);

export function useTranslation() {
  return useT([NAMESPACE, 'client'], {
    nsMode: 'fallback',
  });
}
