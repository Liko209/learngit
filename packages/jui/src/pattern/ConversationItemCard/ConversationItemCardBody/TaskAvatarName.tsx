/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 09:41:34
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey, spacing } from '../../../foundation/utils/styles';

type Props = {
  children: React.ReactNode;
  count?: number;
  otherText?: string;
};

const StyledTaskAvatarName = styled.div`
  margin-top: ${spacing(2)};
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  ${typography('body1')};
  color: ${grey('900')};
`;

const StyledTaskOther = styled.div`
  display: flex;
  align-items: flex-end;
`;

const JuiTaskAvatarName = ({ children, otherText, count }: Props) => (
  <StyledTaskAvatarName>
    {children}
    {otherText && count && (
      <StyledTaskOther>{count > 2 ? otherText : ''}</StyledTaskOther>
    )}
  </StyledTaskAvatarName>
);

export { JuiTaskAvatarName };
