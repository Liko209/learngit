/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 09:41:34
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../../foundation/styled-components';
import { typography, grey, spacing } from '../../../foundation/utils/styles';

// type person = {
//   url: string;
//   name: string;
// }
type Props = {
  avatarNames: JSX.Element[] | null[] | JSX.Element;
  count: number;
  tOther: string;
};

const StyledTaskAvatarName = styled.div`
  margin: ${spacing(2)} 0;
  display: flex;
  flex-wrap: wrap;
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
    <StyledTaskOther>{props.count > 2 ? props.tOther : ''}</StyledTaskOther>
  </StyledTaskAvatarName>
);

export { JuiTaskAvatarName };
