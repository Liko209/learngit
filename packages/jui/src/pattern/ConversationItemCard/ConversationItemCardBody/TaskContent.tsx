/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-12 14:18:40
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey } from '../../../foundation/utils/styles';

type Props = {
  children: React.ReactNode;
  title?: string;
};

const StyledTitle = styled.div`
  ${typography('caption1')};
  color: ${grey('500')};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const JuiTaskContent = memo((props: Props) => (
  <div>
    {props.title && <StyledTitle>{props.title}</StyledTitle>}
    {props.children}
  </div>
));

JuiTaskContent.displayName = 'JuiTaskContent';

export { JuiTaskContent };
