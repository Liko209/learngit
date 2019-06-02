/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-10-16 10:36:42
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import { storiesOf } from '@storybook/react';
import { JuiSnackbarContent } from '../';

storiesOf('Components/Banners', module).add('JuiSnackbars', () => {
  return (
    <div>
      <JuiSnackbarContent type={'warn'}>I'm warn snackbar</JuiSnackbarContent>
      <br />
      <JuiSnackbarContent type={'info'}>I'm info snackbar</JuiSnackbarContent>
      <br />
      <JuiSnackbarContent type={'success'}>
        I'm success snackbar
      </JuiSnackbarContent>
      <br />
      <JuiSnackbarContent type={'error'}>I'm error snackbar</JuiSnackbarContent>
    </div>
  );
});
