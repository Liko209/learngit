/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:12:29
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import styled from '../../../foundation/styled-components';
import { withInfoDecorator } from '../../../foundation/utils/decorators';
import { JuiCircularProgress } from '..';

const Wrapper = styled.div`
  text-align: center;
  ${JuiCircularProgress} {
    margin: 0 30px;
  }
`;

storiesOf('Components/Progress', module)
  .addDecorator(withInfoDecorator(JuiCircularProgress, { inline: true }))
  .addWithJSX('CircularProgress', () => (
    <Wrapper>
      <JuiCircularProgress />
      <JuiCircularProgress size={32} color="secondary" />
      <JuiCircularProgress size={40} color="grey" />
    </Wrapper>
  ));
