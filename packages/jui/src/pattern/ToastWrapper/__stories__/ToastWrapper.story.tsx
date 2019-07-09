/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-01-18 13:31:41
 * Copyright © RingCentral. All rights reserved.
 */
import * as React from 'react';
import { storiesOf } from '@storybook/react';
import JuiToastWrapper from '../ToastWrapper';
import { number, text, select } from '@storybook/addon-knobs';
import Slide from '@material-ui/core/Slide';
import {
  JuiSnackbar,
  JuiSnackbarContent,
  JuiSnackbarsType,
} from '../../../components/Snackbars';

function transitionDown(props: any) {
  return <Slide {...props} direction='down' />;
}
storiesOf('Pattern/ToastWrapper', module).add('ToastWrapper', () => {
  const message = text(
    'message',
    'Sorry, something went wrong. Please try again.',
  );
  const type = select(
    'type',
    {
      success: 'success',
      info: 'info',
      warn: 'warn',
      error: 'error',
    },
    'error',
  );
  const paddingTop = number('padding top', 64);
  const count = number('count', 2);
  const arr = [];
  for (let i = 0; i < count; i++) {
    arr.unshift({
      key: i,
      type: type as JuiSnackbarsType,
      message: `${message} ${i}`,
    });
  }
  return (
    <JuiToastWrapper paddingTop={paddingTop}>
      {arr.map(item => (
        <JuiSnackbar
          key={item.key}
          noFix
          open
          TransitionComponent={transitionDown}
        >
          <JuiSnackbarContent {...item} />
        </JuiSnackbar>
      ))}
    </JuiToastWrapper>
  );
});
