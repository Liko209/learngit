/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-12-05 16:33:44
 * Copyright © RingCentral. All rights reserved.
 */

import React from 'react';
import styled from '../../../foundation/styled-components';
import {
  spacing,
  grey,
  typography,
  height,
  width,
  palette,
  ellipsis,
} from '../../../foundation/utils/styles'; // use external instead of injected due to incompatible with SortableElement
import { JuiListItem, JuiListItemProps } from '../../../components/Lists';

const JuiProfileDialogContentMembers = styled('div')<{ height?: number }>`
  padding: 0;
  display: flex;
  flex-direction: column;
  overflow: auto;
  flex: 1;
  height: ${props => (props.height ? height(props.height / 4) : '100%')};
  min-height: ${props => (props.height ? height(props.height / 4) : '100%')};
  max-height: ${height(66)};
`;

const JuiProfileDialogContentMemberHeader = styled('div')`
  ${typography('subheading1')};
  color: ${grey('900')};
  padding: ${spacing(4, 6, 3)};
  flex-shrink: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  &.shadow {
    box-shadow: ${({ theme }) => theme.shadows[3]};
    z-index: ${({ theme }) => theme.zIndex.memberListHeader};
  }
`;

const JuiProfileDialogContentMemberHeaderTitle = styled('div')`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const JuiProfileDialogContentMemberHeaderSearch = styled('div')`
  margin-top: ${spacing(2)};
`;

const JuiProfileDialogContentMemberList = styled('ul')`
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
`;

const JuiProfileDialogContentMemberListItemRightWrapper = styled('div')`
  > div {
    display: inline-block;
  }
  width: ${width(5)};
  height: ${height(5)};
  margin-right: ${spacing(4)};
  margin-left: ${spacing(6)};
  display: flex;
  flex: 1;
  justify-content: flex-end;
  z-index: ${({ theme }) => theme.zIndex.elementOnRipple};
  color: ${palette('grey', '400')};
  font-size: ${spacing(5)};
`;
type MemberListItemProps = {
  isHover: boolean;
} & JuiListItemProps;
const MemberListItem = ({ isHover, ...rest }: MemberListItemProps) => (
  <JuiListItem {...rest} />
);

const JuiProfileDialogContentMemberListItem = styled(MemberListItem)`
  && {
    display: flex;
    height: ${height(12)};
    align-items: center;
    padding: ${spacing(0, 4, 0, 8)};
    cursor: pointer;
    background-color: ${({ isHover }) =>
      (isHover ? grey('100') : palette('common', 'white'))};
    /* &:nth-last-child(1) {
      margin-bottom: ${spacing(10)};
    } */
  }
`;

const JuiProfileDialogContentMemberListItemName = styled('p')`
  margin-left: ${spacing(3)};
  ${ellipsis()}
`;

const JuiProfileDialogContentMemberShadow = styled('div')`
  background: white;
  border-radius: ${spacing(0, 0, 1, 1)};
  box-shadow: ${props => props.theme.shadows[2]};
  height: ${height(6)};
  z-index: ${({ theme }) => theme.zIndex.loading};
  flex-shrink: 0;
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
`;

export {
  JuiProfileDialogContentMembers,
  JuiProfileDialogContentMemberHeader,
  JuiProfileDialogContentMemberHeaderTitle,
  JuiProfileDialogContentMemberHeaderSearch,
  JuiProfileDialogContentMemberList,
  JuiProfileDialogContentMemberListItem,
  JuiProfileDialogContentMemberListItemName,
  JuiProfileDialogContentMemberShadow,
  JuiProfileDialogContentMemberListItemRightWrapper,
};
