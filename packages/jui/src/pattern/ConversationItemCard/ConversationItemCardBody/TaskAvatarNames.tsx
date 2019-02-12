/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 09:41:34
 * Copyright © RingCentral. All rights reserved.
 */

import React, { memo } from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey, height } from '../../../foundation/utils/styles';

type Props = {
  children: React.ReactNode;
  count?: number;
  otherText?: string;
};

const StyledTaskAvatarNames = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  ${typography('body1')};
  color: ${grey('900')};
`;

const StyledTaskOther = styled.div`
  display: flex;
  align-items: center;
  height: ${height(6)};
`;

const JuiTaskAvatarNames = memo(({ children, otherText, count }: Props) => (
  <StyledTaskAvatarNames className="task-avatar-name">
    {children}
    {otherText && count && (
      <StyledTaskOther>{count > 2 ? otherText : ''}</StyledTaskOther>
    )}
  </StyledTaskAvatarNames>
));

export { JuiTaskAvatarNames };
