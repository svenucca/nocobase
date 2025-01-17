import { OptionsComponentProvider, SigninPageExtensionProvider } from '@nocobase/client';
import React from 'react';
import { OIDCButton } from './OIDCButton';
import { authType } from '../constants';
import { Options } from './Options';

export default function (props) {
  return (
    <SigninPageExtensionProvider component={OIDCButton} authType={authType}>
      <OptionsComponentProvider authType={authType} component={Options}>
        {props.children}
      </OptionsComponentProvider>
    </SigninPageExtensionProvider>
  );
}
