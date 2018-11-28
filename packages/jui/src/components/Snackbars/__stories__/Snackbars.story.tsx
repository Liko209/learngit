/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:12:29
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import styled from '../../../foundation/styled-components';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiSnackbarContent, JuiSnackbarAction } from '..';

const Wrapper = styled.div`
  text-align: center;
  background: #f1f1f1;
  padding: 12px 24px;
  margin: 12px 0;

  && > div {
    margin-bottom: 10px;
  }
`;

storiesOf('Components/Snackbars', module)
  .addDecorator(withInfoDecorator(JuiSnackbarContent, { inline: true }))
  .add('toast', () => (
    <Wrapper>
      <JuiSnackbarContent
        type="success"
        message="This is an success message."
      />
      <JuiSnackbarContent
        type="error"
        message="This is an error message."
        action={<JuiSnackbarAction key="action1">Action</JuiSnackbarAction>}
      />
      <JuiSnackbarContent
        type="warn"
        message="This is an warning message."
        action={[
          <JuiSnackbarAction key="action1">Action</JuiSnackbarAction>,
          <JuiSnackbarAction key="action2">Action</JuiSnackbarAction>,
        ]}
      />
      <JuiSnackbarContent
        type="info"
        message="This is an informational message."
        action={[
          <JuiSnackbarAction key="action1">Action</JuiSnackbarAction>,
          <JuiSnackbarAction key="action2">Action</JuiSnackbarAction>,
          <JuiSnackbarAction key="action2" variant="icon">
            close
          </JuiSnackbarAction>,
        ]}
      />
    </Wrapper>
  ))
  .add('full width', () => (
    <Wrapper>
      <JuiSnackbarContent
        fullWidth={true}
        type="success"
        message="This is an success message."
      />
      <JuiSnackbarContent
        fullWidth={true}
        type="error"
        message="This is an error message."
        action={<JuiSnackbarAction key="action1">Action</JuiSnackbarAction>}
      />
      <JuiSnackbarContent
        fullWidth={true}
        type="warn"
        message="This is an warning message."
        action={[
          <JuiSnackbarAction key="action1">Action</JuiSnackbarAction>,
          <JuiSnackbarAction key="action2">Action</JuiSnackbarAction>,
        ]}
      />
      <JuiSnackbarContent
        fullWidth={true}
        type="info"
        message="This is an informational message."
        action={[
          <JuiSnackbarAction key="action1">Action</JuiSnackbarAction>,
          <JuiSnackbarAction key="action2">Action</JuiSnackbarAction>,
          <JuiSnackbarAction key="action2" variant="icon">
            close
          </JuiSnackbarAction>,
        ]}
      />
    </Wrapper>
  ));
