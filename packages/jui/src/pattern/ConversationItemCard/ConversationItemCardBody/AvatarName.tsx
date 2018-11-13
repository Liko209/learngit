/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-11-08 10:33:56
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../../foundation/styled-components';
import { spacing } from '../../../foundation/utils/styles';

type Props = {
  avatar: JSX.Element;
  name: string;
};

const StyledAvatarName = styled.div`
  display: flex;
  align-items: flex-end;
  margin-right: ${spacing(1)};
`;

const StyledName = styled.span`
  margin-left: ${spacing(1)};
`;

// const StyledName = styled.div``

const JuiAvatarName = (props: Props) => (
  <StyledAvatarName>
    {props.avatar} <StyledName>{props.name}</StyledName>
  </StyledAvatarName>
);

JuiAvatarName.displayName = 'JuiAvatarName';

export { JuiAvatarName };
