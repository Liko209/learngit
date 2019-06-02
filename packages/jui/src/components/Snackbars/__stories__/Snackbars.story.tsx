/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:12:29
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import styled from '../../../foundation/styled-components';
import { select, boolean } from '@storybook/addon-knobs';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import {
  JuiSnackbarContent,
  JuiSnackbarAction,
  JuiSnackbarContentProps,
} from '..';
import close from '../../../assets/jupiter-icon/icon-close.svg';

const Wrapper = styled.div`
  text-align: center;
  background: #f1f1f1;
  padding: 12px 24px;
  margin: 12px 0;

  && > div {
    margin-bottom: 10px;
  }
`;

const knobs = {
  type: () =>
    select<JuiSnackbarContentProps['type']>(
      'type',
      {
        success: 'success',
        info: 'info',
        error: 'error',
        warn: 'warn',
      },
      'success',
    ),
  messageAlign: () =>
    select<JuiSnackbarContentProps['messageAlign']>(
      'messageAlign',
      {
        left: 'left',
        center: 'center',
      },
      'left',
    ),
  message: () =>
    select<JuiSnackbarContentProps['message']>(
      'message',
      {
        success: 'This is a success message.',
        error: 'This is an error message.',
        warning: 'This is an warning message.',
        info: 'This is an informational message.',
      },
      'This is a success message.',
    ),
};

storiesOf('Components/Snackbars', module)
  .addDecorator(withInfoDecorator(JuiSnackbarContent, { inline: true }))
  .add('toast', () => (
    <Wrapper>
      <JuiSnackbarContent
        type={knobs.type()}
        fullWidth={boolean('fullWidth', false)}
        message={knobs.message()}
        messageAlign={knobs.messageAlign()}
      />
      <JuiSnackbarContent
        type="error"
        message="This is an error message."
        messageAlign={knobs.messageAlign()}
        fullWidth={boolean('fullWidth', false)}
        action={<JuiSnackbarAction key="action1">Action</JuiSnackbarAction>}
      />
      <JuiSnackbarContent
        type="warn"
        message="This is an warning message."
        messageAlign={knobs.messageAlign()}
        fullWidth={boolean('fullWidth', false)}
        action={[
          <JuiSnackbarAction key="action1">Action</JuiSnackbarAction>,
          <JuiSnackbarAction key="action2">Action</JuiSnackbarAction>,
        ]}
      />
      <JuiSnackbarContent
        type="info"
        message="This is an informational message."
        messageAlign={knobs.messageAlign()}
        fullWidth={boolean('fullWidth', false)}
        action={[
          <JuiSnackbarAction key="action1">Action</JuiSnackbarAction>,
          <JuiSnackbarAction key="action2">Action</JuiSnackbarAction>,
          <JuiSnackbarAction key="action2" variant="icon" icon={close} />,
        ]}
      />
    </Wrapper>
  ));
