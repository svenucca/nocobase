import React from 'react';
import type { ISchema } from '@formily/react';

import { InitializerWithSwitch } from './InitializerWithSwitch';

export const TableCollectionFieldInitializer = (props) => {
  const schema: ISchema = {};
  return <InitializerWithSwitch {...props} schema={schema} type={'x-collection-field'} />;
};
