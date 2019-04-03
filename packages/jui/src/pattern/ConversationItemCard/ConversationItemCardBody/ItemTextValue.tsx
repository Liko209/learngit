/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-18 18:01:07
 * Copyright © RingCentral. All rights reserved.
 */

import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey } from '../../../foundation/utils/styles';

type Props = {
  description: string;
};

const StyledWrapper = styled.div`
  ${typography('caption1')};
  color: ${grey('900')};
`;

const JuiItemTextValue = memo(({ description, ...rest }: Props) => (
  <StyledWrapper {...rest}>{description}</StyledWrapper>
));

JuiItemTextValue.displayName = 'JuiItemTextValue';

export { JuiItemTextValue };
