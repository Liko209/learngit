/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-15 12:20:22
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../styled-components';
import MenuItem from '@material-ui/core/MenuItem';
import { spacing, height } from '../../utils/styles';

type TJuiSearchItemProps = {
  children: React.ReactNode;
};

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

const JuiSearchItem: React.SFC<TJuiSearchItemProps> = (
  props: TJuiSearchItemProps,
) => {
  const { children } = props;
  return <StyledMenuItem {...props}>{children}</StyledMenuItem>;
};

export default JuiSearchItem;
