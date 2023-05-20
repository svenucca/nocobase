import { observer, RecursionField, useField, useFieldSchema } from '@formily/react';
import React from 'react';
import { useActionContext } from '.';
import { ActionDrawer } from './Action.Drawer';
import { ActionModal } from './Action.Modal';
import { ActionPage } from './Action.Page';
import type { ComposedActionDrawer } from './types';

export const ActionContainer: ComposedActionDrawer = observer((props: any) => {
  const { openMode } = useActionContext();
  if (openMode === 'drawer') {
    return <ActionDrawer footerNodeName={'Action.Container.Footer'} {...props} />;
  }
  if (openMode === 'modal') {
    return <ActionModal footerNodeName={'Action.Container.Footer'} {...props} />;
  }
  return <ActionPage footerNodeName={'Action.Container.Footer'} {...props} />;
});

ActionContainer.Footer = observer(() => {
  const field = useField();
  const schema = useFieldSchema();
  return <RecursionField basePath={field.address} schema={schema} onlyRenderProperties />;
});

export default ActionContainer;
