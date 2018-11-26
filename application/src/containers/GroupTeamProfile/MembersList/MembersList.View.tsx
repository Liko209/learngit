/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate } from 'react-i18next';
import { JuiGroupProfileList } from 'jui/pattern/GroupTeamProfile';
import { Avatar } from '@/containers/Avatar';
import styled from 'jui/foundation/styled-components';
import { MemberListViewProps } from './types';
import {
  spacing,
  grey,
  width,
  height,
} from 'jui/foundation/utils/styles';

const StyledList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;
const StyledBottomBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border: ${width(3)} solid ${({ theme }) => theme.palette.common.white};
  box-shadow: 0 -2px 4px -2px rgba(0, 0, 0, 0.14);
`;
const StyledGuestIdentifier = styled.span`
  width: ${width(12)};
  height: ${height(4)};
  color: ${({ theme }) => theme.palette.common.white};
  background-color: ${grey('400')};
  border-radius: ${({ theme }) => theme.shape.borderRadius * 2}px;
  line-height: ${height(4)};
  text-align: center;
  font-size: ${({ theme }) => theme.typography.caption.fontSize};
  margin-left: ${spacing(3)};
`;
const StyledAdminIdentifier = styled(StyledGuestIdentifier)`
  background-color: ${({ theme }) => theme.palette.secondary.main};
`;
@observer
class MembersList extends React.Component<MemberListViewProps> {
  render() {
    const {
      membersList,
      isThePersonAdmin,
      isThePersonGuest,
    } = this.props;
    return (
      <>
        <StyledList>
          {membersList.map((item: any, idx: number) => {
            return (
              <JuiGroupProfileList key={idx}>
                <Avatar uid={item.id} />
                {item.userDisplayName}
                {isThePersonGuest[idx] ? (
                  <StyledGuestIdentifier>Guest</StyledGuestIdentifier>
                ) : null}
                {isThePersonAdmin[idx] ? (
                  <StyledAdminIdentifier>Admin</StyledAdminIdentifier>
                ) : null}
              </JuiGroupProfileList>
            );
          })}
        </StyledList>
        <StyledBottomBar />
      </>
    );
  }
}
const MembersListView = translate('translations')(MembersList);

export { MembersListView };
