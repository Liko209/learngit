/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-07 10:05:39
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey, spacing } from '../../../foundation/utils/styles';

type Props = {
  description: string;
};

const StyledEventDescription = styled.div`
  margin-top: ${spacing(2)};
  ${typography('body1')};
  color: ${grey('500')};
`;

const JuiEventDescription = memo((props: Props) => (
  <StyledEventDescription>{props.description}</StyledEventDescription>
));

JuiEventDescription.displayName = 'JuiEventDescription';

export { JuiEventDescription };
