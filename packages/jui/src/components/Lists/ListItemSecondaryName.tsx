/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2019-01-15 17:13:45
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../foundation/styled-components';
import { ellipsis } from '../../foundation/utils';

type JuiListItemSecondaryNameProps = {
  name: string;
};

const StyledListItemSecondaryName = styled.span`
  && {
    ${ellipsis()};
  }
`;

const JuiListItemSecondaryName = (props: JuiListItemSecondaryNameProps) => {
  const { name } = props;
  return <StyledListItemSecondaryName>{name}</StyledListItemSecondaryName>;
};

JuiListItemSecondaryName.displayName = 'JuiListItemSecondaryName';

export { JuiListItemSecondaryName, JuiListItemSecondaryNameProps };
