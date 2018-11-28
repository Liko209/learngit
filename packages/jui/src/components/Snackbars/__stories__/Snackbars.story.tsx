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
  padding: 0 24px;
  margin: 12px 0;
`;

storiesOf('Components|Snackbars', module)
  .addDecorator(withInfoDecorator(JuiSnackbarContent, { inline: true }))
  .add('toast', () => (
    <Wrapper>
      <JuiSnackbarContent
        fullWidth={false}
        messageAlign="center"
        type="success"
        message="yo hello"
      />
    </Wrapper>
  ))
  .add('full width', () => (
    <Wrapper>
      <JuiSnackbarContent
        fullWidth={true}
        messageAlign="center"
        type="success"
        message="yo hello"
        actions={[
          <JuiSnackbarAction key="action1">Action</JuiSnackbarAction>,
          <JuiSnackbarAction key="close">close</JuiSnackbarAction>,
        ]}
      />
    </Wrapper>
  ));
