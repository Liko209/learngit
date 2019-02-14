/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-05 16:33:44
 * Copyright © RingCentral. All rights reserved.
 */

// import React from 'react';
import styled from '../../../foundation/styled-components';
import {
  spacing,
  grey,
  typography,
  height,
  palette,
  ellipsis,
} from '../../../foundation/utils/styles';
import { JuiListItem } from '../../../components/Lists';

const JuiProfileDialogContentMembers = styled('div')`
  padding: 0;
  display: flex;
  flex-direction: column;
  /* box-shadow: ${props => props.theme.shadows[2]}; */
  /* box-shadow: ${({ theme }) => theme.boxShadow.val2}; */
`;

const JuiProfileDialogContentMemberHeader = styled('div')`
  ${typography('subheading1')};
  color: ${grey('900')};
  padding: ${spacing(4, 6, 3)};
  flex-basis: ${height(12.5)};
  flex-shrink: 0;
  box-sizing: border-box;
  display: flex;
  justify-content: space-between;
  &.shadow {
    box-shadow: ${({ theme }) => theme.boxShadow.val3};
    z-index: ${({ theme }) => theme.zIndex.memberListHeader};
  }
`;

const JuiProfileDialogContentMemberList = styled('ul')`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
`;

const JuiProfileDialogContentMemberListItem = styled(JuiListItem)`
  && {
    display: flex;
    height: ${height(12)};
    background-color: ${palette('common', 'white')};
    align-items: center;
    padding: ${spacing(0, 4, 0, 8)};
    &:hover {
      background-color: ${grey('100')};
    }
    /* &:nth-last-child(1) {
      margin-bottom: ${spacing(10)};
    } */
  }
`;

const JuiProfileDialogContentMemberListItemName = styled('p')`
  margin-left: ${spacing(3)};
  ${ellipsis()}
`;

const JuiProfileDialogContentMemberListItemAdmin = styled.span`
  color: ${palette('common', 'white')};
  border-radius: ${spacing(2)};
  text-align: center;
  background-color: ${palette('secondary', 'main')};
  padding: ${spacing(0, 1.5)};
  ${typography('caption1')};
  margin-left: ${spacing(3)};
`;

const JuiProfileDialogContentMemberListItemGuest = styled(
  JuiProfileDialogContentMemberListItemAdmin,
)`
  background-color: ${grey('400')};
`;

const JuiProfileDialogContentMemberShadow = styled('div')`
  box-shadow: ${props => props.theme.shadows[2]};
  height: ${height(6)};
  z-index: 1;
  flex-shrink: 0;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`;

export {
  JuiProfileDialogContentMembers,
  JuiProfileDialogContentMemberHeader,
  JuiProfileDialogContentMemberList,
  JuiProfileDialogContentMemberListItem,
  JuiProfileDialogContentMemberListItemName,
  JuiProfileDialogContentMemberListItemAdmin,
  JuiProfileDialogContentMemberListItemGuest,
  JuiProfileDialogContentMemberShadow,
};
