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
  palette,
  typography,
} from 'jui/foundation/utils/styles';

const StyledList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const StyledGuestIdentifier = styled.span`
  width: ${width(12)};
  height: ${height(4)};
  color: ${palette('common', 'white')};
  background-color: ${grey('400')};
  border-radius: ${({ theme }) => theme.shape.borderRadius * 2}px;
  line-height: ${height(4)};
  text-align: center;
  ${typography('caption1')};
  margin-left: ${spacing(3)};
`;
const StyledAdminIdentifier = styled(StyledGuestIdentifier)`
  background-color: ${palette('secondary', 'main')};
`;
@observer
class MembersList extends React.Component<MemberListViewProps> {
  render() {
    const {
      membersList,
      isThePersonAdmins,
      isThePersonGuests,
    } = this.props;
    return (
      <StyledList>
        {membersList.map((item: any, idx: number) => {
          return (
            <JuiGroupProfileList key={idx}>
              <Avatar uid={item.id} />
              {item.userDisplayName}
              {isThePersonGuests[idx] ? (
                <StyledGuestIdentifier>Guest</StyledGuestIdentifier>
              ) : null}
              {isThePersonAdmins[idx] ? (
                <StyledAdminIdentifier>Admin</StyledAdminIdentifier>
              ) : null}
            </JuiGroupProfileList>
          );
        })}
      </StyledList>
    );
  }
}
const MembersListView = translate('translations')(MembersList);

export { MembersListView };
