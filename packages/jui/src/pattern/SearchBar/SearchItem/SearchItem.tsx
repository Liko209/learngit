/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2018-11-22 15:06:52
 * Copyright © RingCentral. All rights reserved.
 */
import React from 'react';
import MenuItem from '@material-ui/core/MenuItem';
import { JuiSearchItemValue } from '../';
import styled from '../../../foundation/styled-components';
import { height, spacing, palette } from '../../../foundation/utils/styles';

const SearchItemWrapper = styled(MenuItem)`
  && {
    height: ${height(6)};
    padding: ${spacing(1, 4)};
    &:hover {
      background: ${({ theme }) => palette('grey', '500', 1)};
    }
    &:active {
      background: ${({ theme }) => palette('primary', 'main', 1)};
    }
  }
`;

const SearchItemAvatar = styled.div`
  margin-right: ${spacing(2)};
`;

const SearchItemValueWrapper = styled.div`
  flex: 1;
  min-width: 0;
  padding: ${spacing(0, 1, 0, 0)};
`;

const SearchItemActions = styled.div`
  display: flex;
`;

type JuiSearchItemProps = {
  Avatar: JSX.Element;
  value: string;
  terms: string[];
  Actions?: JSX.Element;
};

const JuiSearchItem = (props: JuiSearchItemProps) => {
  const { Avatar, Actions, value, terms } = props;
  return (
    <SearchItemWrapper disableRipple={true}>
      <SearchItemAvatar>{Avatar}</SearchItemAvatar>
      <SearchItemValueWrapper>
        <JuiSearchItemValue value={value} terms={terms} />
      </SearchItemValueWrapper>
      {Actions && <SearchItemActions>{Actions}</SearchItemActions>}
    </SearchItemWrapper>
  );
};

export { JuiSearchItem, JuiSearchItemProps };
