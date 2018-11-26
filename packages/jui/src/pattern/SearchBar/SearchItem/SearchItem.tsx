/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 15:06:52
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import styled from '../../../foundation/styled-components';
import MenuItem from '@material-ui/core/MenuItem';
import tinycolor from 'tinycolor2';

import { height, spacing, palette } from '../../../foundation/utils/styles';

const SearchItemWrapper = styled(MenuItem)`
  && {
    height: ${height(6)};
    padding: ${spacing(1, 4)};
    &:hover {
      background: ${({ theme }) =>
        tinycolor(palette('grey', '500')({ theme }))
          .setAlpha(theme.palette.action.hoverOpacity)
          .toRgbString()};
    }
    &:active {
      background: ${({ theme }) =>
        tinycolor(palette('primary', 'main')({ theme }))
          .setAlpha(theme.palette.action.hoverOpacity)
          .toRgbString()};
    }
  }
`;

const SearchItemAvatar = styled.div`
  margin-right: ${spacing(2)};
`;

const SearchItemValueWrapper = styled.div`
  flex: 1;
`;

const SearchItemActions = styled.div`
  display: flex;
`;

type JuiSearchItemProps = {
  avatar: JSX.Element;
  itemValue: JSX.Element;
  actions?: JSX.Element[];
};

const JuiSearchItem = (props: JuiSearchItemProps) => {
  const { avatar, itemValue, actions } = props;
  return (
    <SearchItemWrapper disableRipple={true}>
      <SearchItemAvatar>{avatar}</SearchItemAvatar>
      <SearchItemValueWrapper>{itemValue}</SearchItemValueWrapper>
      {actions && <SearchItemActions>{actions}</SearchItemActions>}
    </SearchItemWrapper>
  );
};

export { JuiSearchItem, JuiSearchItemProps };
