/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 15:06:52
 * Copyright © RingCentral. All rights reserved.
 */
import React, { ReactNode, memo } from 'react';
import MenuItem, { MenuItemProps } from '@material-ui/core/MenuItem';
import MuiLock from '@material-ui/icons/Lock';
import { JuiSearchItemValue } from '../SearchItemValue';
import styled from '../../../foundation/styled-components';
import {
  height,
  spacing,
  palette,
  grey,
  shape,
  typography,
  primary,
} from '../../../foundation/utils/styles';

const SearchItemActions = styled.div`
  display: flex;
  display: none;
  & button {
    margin-left: ${spacing(3)};
  }
`;

const SearchItemWrapper = styled(MenuItem)`
  && {
    height: ${height(8)};
    padding: ${spacing(1, 4)};
    &:hover {
      background: none;
    }
    &.hover {
      background: ${grey('500', 1)};
      ${SearchItemActions} {
        display: block;
      }
    }

    &:active {
      background: ${primary('main', 1)};
    }
  }
`;

const PrivateIcon = styled(MuiLock)`
  && {
    font-size: ${spacing(4)};
    color: ${grey('500')};
    margin: ${spacing(0, 0, 0, 1)};
  }
`;

const SearchItemAvatar = styled.div`
  display: flex;
  margin-right: ${spacing(2)};
`;

const SearchItemValueWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  padding: ${spacing(0, 1, 0, 0)};
`;

const Joined = styled.span`
  padding: ${spacing(0, 1)};
  color: ${palette('common', 'white')};
  border-radius: ${shape('borderRadius', 4)};
  background: ${primary('700', 2)};
  ${typography('caption1')}
  margin: ${spacing(0, 0, 0, 1.5)}; // icon and joined will has 2px spacing
`;

type JuiSearchItemProps = {
  Avatar: JSX.Element;
  value: string;
  terms?: string[];
  Actions?: ReactNode;
  isJoined?: boolean;
  isPrivate?: boolean;
  hovered?: boolean;
} & MenuItemProps;

const JuiSearchItem = memo((props: JuiSearchItemProps) => {
  const {
    Avatar,
    Actions,
    value,
    terms,
    isPrivate,
    isJoined,
    hovered,
    ...rest
  } = props;
  // e2e also will be use it. shouldn't change the class name
  const className = hovered ? 'search-items hover' : 'search-items';
  return (
    <SearchItemWrapper className={className} disableRipple={true} {...rest}>
      <SearchItemAvatar data-test-automation-id="search-item-avatar">
        {Avatar}
      </SearchItemAvatar>
      <SearchItemValueWrapper>
        <JuiSearchItemValue
          value={value}
          terms={terms}
          data-test-automation-id="search-item-text"
        />
        {isPrivate && (
          <PrivateIcon data-test-automation-id="search-item-private" />
        )}
        {isJoined && (
          <Joined data-test-automation-id="search-item-joined">Joined</Joined>
        )}
      </SearchItemValueWrapper>
      {Actions && <SearchItemActions>{Actions}</SearchItemActions>}
    </SearchItemWrapper>
  );
});

export { JuiSearchItem, JuiSearchItemProps };
