/*
 * @Author: Steven Zhuang (steven.zhuang@ringcentral.com)
 * @Date: 2019-01-19 14:12:25
 * Copyright © RingCentral. All rights reserved.
 */

import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey, spacing } from '../../../foundation/utils/styles';

type Props = {
  description: string;
};

const StyledWrapper = styled.div`
  margin-top: ${spacing(0.5)};
  margin-left: ${spacing(1)};
  margin-right: ${spacing(1)};
  ${typography('caption1')};
  color: ${grey('900')};
`;

const JuiItemConjunctionText = memo(({ description, ...rest }: Props) => (
  <StyledWrapper {...rest}>{description}</StyledWrapper>
));

JuiItemConjunctionText.displayName = 'JuiItemConjunctionText';

export { JuiItemConjunctionText };
