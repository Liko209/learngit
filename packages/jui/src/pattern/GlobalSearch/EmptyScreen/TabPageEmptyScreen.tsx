/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-09 16:30:53
 * Copyright © RingCentral. All rights reserved.
 */

import React, { StatelessComponent } from 'react';
import { JuiEmptyScreen, JuiEmptyScreenProps } from '../EmptyScreen';
import styled from '../../../foundation/styled-components';
import { spacing } from '../../../foundation/utils';

const Wrapper = styled.div`
  margin: ${spacing(4, 0, 15)};
`;

const JuiTabPageEmptyScreen: StatelessComponent<JuiEmptyScreenProps> = (
  props: JuiEmptyScreenProps,
) => (
  <Wrapper>
    <JuiEmptyScreen {...props} />
  </Wrapper>
);

export { JuiTabPageEmptyScreen };
