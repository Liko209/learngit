/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-18 18:01:07
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey } from '../../../foundation/utils/styles';

type Props = {
  description: string;
};

const StyledWrapper = styled.div`
  ${typography('caption1')};
  color: ${grey('900')};
`;

const JuiItemTextValue = (props: Props) => (
  <StyledWrapper>{props.description}</StyledWrapper>
);

JuiItemTextValue.displayName = 'JuiItemTextValue';

export { JuiItemTextValue };
