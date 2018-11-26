/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 15:06:52
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import MuiLock from '@material-ui/icons/Lock';
import { JuiSearchItemValue } from '../';
import styled from '../../../foundation/styled-components';
import {
  height,
  spacing,
  palette,
  grey,
  width,
  shape,
  typography,
} from '../../../foundation/utils/styles';

const SearchItemWrapper = styled(MenuItem)`
  && {
    height: ${height(6)};
    padding: ${spacing(1, 4)};
    &.hover,
    &:hover {
      background: ${({ theme }) => palette('grey', '500', 1)};
    }
    &:active {
      background: ${({ theme }) => palette('primary', 'main', 1)};
    }
  }
`;

const PrivateIcon = styled(MuiLock)`
  && {
    font-size: ${spacing(4)};
    color: ${grey('500')};
    margin: ${spacing(0, 2, 0, 1)};
  }
`;

const SearchItemAvatar = styled.div`
  margin-right: ${spacing(2)};
`;

const SearchItemValueWrapper = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  padding: ${spacing(0, 1, 0, 0)};
`;

const SearchItemActions = styled.div`
  display: flex;
`;

const Joined = styled.span`
  width: ${width(9)};
  height: ${height(4)};
  color: ${palette('common', 'white')};
  border-radius: ${shape('borderRadius', 4)};
  background: ${palette('primary', '700', 2)};
  ${typography('caption1')}
`;

type JuiSearchItemProps = {
  Avatar: JSX.Element;
  value: string;
  terms: string[];
  Actions?: JSX.Element;
  isJoined?: boolean;
  isPrivate?: boolean;
};

const JuiSearchItem = (props: JuiSearchItemProps) => {
  const { Avatar, Actions, value, terms, isPrivate, isJoined } = props;
  return (
    <SearchItemWrapper className="search-items" disableRipple={true}>
      <SearchItemAvatar>{Avatar}</SearchItemAvatar>
      <SearchItemValueWrapper>
        <JuiSearchItemValue value={value} terms={terms} />
        {isPrivate && <PrivateIcon />}
        {isJoined && <Joined>Joined</Joined>}
      </SearchItemValueWrapper>
      {Actions && <SearchItemActions>{Actions}</SearchItemActions>}
    </SearchItemWrapper>
  );
};

export { JuiSearchItem, JuiSearchItemProps };
