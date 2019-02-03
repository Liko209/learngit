/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-12 09:42:40
 * Copyright © RingCentral. All rights reserved.
 */
import React, { memo } from 'react';
import styled from '../../foundation/styled-components';
import MenuItem, { MenuItemProps } from '@material-ui/core/MenuItem';
import { spacing, height } from '../../foundation/utils/styles';

type TJuiSearchItemProps = {
  children: React.ReactNode;
} & MenuItemProps;

const StyledMenuItem = styled(MenuItem)`
  && {
    padding: 0 ${spacing(4)};
    height: ${height(11)};
    &:hover {
      opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity * 1};
    }
    &:active {
      opacity: ${({ theme }) => 1 - theme.palette.action.hoverOpacity * 2};
    }
  }
`;

const JuiSearchItem: React.SFC<TJuiSearchItemProps> = memo(
  (props: TJuiSearchItemProps) => {
    const { children, innerRef, ...rest } = props;
    return <StyledMenuItem {...rest}>{children}</StyledMenuItem>;
  },
);

export { JuiSearchItem };
