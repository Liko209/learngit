/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-04-09 16:30:38
 * Copyright © RingCentral. All rights reserved.
 */

import React, { StatelessComponent } from 'react';
import { JuiEmptyScreen, JuiEmptyScreenProps } from '.';
import styled from '../../../foundation/styled-components';
import { spacing } from '../../../foundation/utils';

const Wrapper = styled.div`
  margin: ${spacing(20, 0)};
`;

const JuiRecentSearcnEmptyScreen: StatelessComponent<JuiEmptyScreenProps> = (
  props: JuiEmptyScreenProps,
) => (
  <Wrapper>
    <JuiEmptyScreen {...props} />
  </Wrapper>
);

export { JuiRecentSearcnEmptyScreen };
