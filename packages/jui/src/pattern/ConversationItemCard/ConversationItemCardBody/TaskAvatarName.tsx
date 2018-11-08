/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 09:41:34
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey } from '../../../foundation/utils/styles';

// type person = {
//   url: string;
//   name: string;
// }
type Props = {
  avatarNames: JSX.Element[] | null[];
  count: number;
};

const StyledTaskAvatarName = styled.div`
  display: flex;
  ${typography('body1')};
  color: ${grey('900')};
`;

const StyledTaskOther = styled.div`
  display: flex;
  align-items: flex-end;
`;

const JuiTaskAvatarName = (props: Props) => (
  <StyledTaskAvatarName>
    {props.avatarNames}
    <StyledTaskOther>
      {props.count > 2 ? `and other ${props.count - 2} people` : ''}
    </StyledTaskOther>
  </StyledTaskAvatarName>
);

export { JuiTaskAvatarName };
