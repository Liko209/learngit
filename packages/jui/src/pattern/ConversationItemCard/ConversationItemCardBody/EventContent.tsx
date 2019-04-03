/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-12-12 16:03:43
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey, spacing } from '../../../foundation/utils/styles';

type Props = {
  children: React.ReactNode;
  title?: string;
};

const StyledWrapper = styled.div`
  margin-top: ${spacing(2)};
`;

const StyledTitle = styled.div`
  ${typography('caption1')};
  color: ${grey('500')};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const JuiEventContent = memo((props: Props) => (
  <StyledWrapper>
    {props.title && <StyledTitle>{props.title}</StyledTitle>}
    {props.children}
  </StyledWrapper>
));

JuiEventContent.displayName = 'JuiEventContent';

export { JuiEventContent };
