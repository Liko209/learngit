/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-27 16:12:29
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import { storiesOf } from '@storybook/react';
import styled from '../../../foundation/styled-components';
import { RuiCircularProgress } from '../';

const Wrapper = styled.div`
  text-align: center;
  ${RuiCircularProgress} {
    margin: 0 30px;
  }
`;

storiesOf('Progress', module).add('CircularProgress', () => (
  <Wrapper>
    <RuiCircularProgress />
    <RuiCircularProgress size={32} color="secondary" />
  </Wrapper>
));
