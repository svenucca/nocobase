import {
  AdminLayout,
  AntdConfigProvider,
  AntdSchemaComponentProvider,
  APIClientProvider,
  AuthLayout,
  CollectionManagerProvider,
  compose,
  DesignableSwitch,
  DocumentTitleProvider,
  i18n,
  RouteSchemaComponent,
  RouteSwitch,
  RouteSwitchProvider,
  SchemaComponentProvider,
  SchemaInitializerProvider,
  SigninPage,
  SignupPage,
  SystemSettingsProvider,
  useRequest,
} from '@nocobase/client';
import { Spin } from 'antd';
import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { Link, MemoryRouter, NavLink } from 'react-router-dom';
import apiClient from './apiClient';

const providers = [
  // [HashRouter],
  [MemoryRouter, { initialEntries: ['/'] }],
  [APIClientProvider, { apiClient }],
  [I18nextProvider, { i18n }],
  [AntdConfigProvider, { remoteLocale: true }],
  SystemSettingsProvider,
  [{ components: { DesignableSwitch } }],
  [SchemaComponentProvider, { components: { Link, NavLink } }],
  CollectionManagerProvider,
  AntdSchemaComponentProvider,
  SchemaInitializerProvider,
  [DocumentTitleProvider, { addonAfter: 'NocoBase' }],
  [RouteSwitchProvider, { components: { AuthLayout, AdminLayout, RouteSchemaComponent, SigninPage, SignupPage } }],
];

const App = compose(...providers)(() => {
  const { data, loading } = useRequest<{
    data: any;
  }>({
    url: 'routes:getAccessible',
  });
  if (loading) {
    return <Spin />;
  }
  return (
    <div>
      <RouteSwitch routes={data?.data || []} />
    </div>
  );
});

export default App;
