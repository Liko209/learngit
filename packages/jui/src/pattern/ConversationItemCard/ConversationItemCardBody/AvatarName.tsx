/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 10:33:56
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../../foundation/styled-components';
import { spacing, ellipsis, width } from '../../../foundation/utils/styles';

type Props = {
  Avatar: JSX.Element;
  name: string;
};

const StyledAvatarName = styled.div`
  display: flex;
  align-items: center;
  margin: ${spacing(0, 4, 0, 0)};
  & span {
    max-width: ${width(45)};
    ${ellipsis()};
  }
`;

const StyledName = styled.span`
  margin-left: ${spacing(1)};
`;

const JuiAvatarName = (props: Props) => (
  <StyledAvatarName>
    {props.Avatar} <StyledName>{props.name}</StyledName>
  </StyledAvatarName>
);

JuiAvatarName.displayName = 'JuiAvatarName';

export { JuiAvatarName };
