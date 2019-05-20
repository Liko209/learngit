/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-12-12 16:03:43
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey } from '../../../foundation/utils/styles';

type Props = {
  children: React.ReactNode;
  label: string;
};

const Wrapper = styled.div``;

const StyledTitle = styled.div`
  ${typography('caption1')};
  color: ${grey('500')};
  overflow: hidden;
  text-overflow: ellipsis;
`;

const JuiLabelWithContent = memo((props: Props) => (
  <Wrapper>
    {props.label && <StyledTitle>{props.label}</StyledTitle>}
    {props.children}
  </Wrapper>
));

JuiLabelWithContent.displayName = 'JuiLabelWithContent';

export { JuiLabelWithContent };
