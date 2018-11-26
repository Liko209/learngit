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

const StyledList = styled.ul`
  position: relative;
  list-style: none;
  padding: 0;
  margin: 0;
`;
const StyledBottomBar = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  border: 12px solid #fff;
  box-shadow: 0 -2px 4px -2px rgba(0, 0, 0, 0.14);
`;
const StyledGuestIdentifier = styled.span`
  width: 48px;
  height: 16px;
  color: #fff;
  background-color: #bdbdbd;
  border-radius: 8px;
  line-height: 16px;
  text-align: center;
  font-size: 12px;
  margin-left: 12px;
`;
const StyledAdminIdentifier = styled(StyledGuestIdentifier)`
  background-color: #ff8800;
`;
@observer
class MembersList extends React.Component<MemberListViewProps> {
  render() {
    const {
      membersList,
      isThePersonAdmin,
      isThePersonGuest,
      isShowBottomShadow,
    } = this.props;
    return (
      <StyledList>
        {membersList.map((item: any, idx: number) => {
          return (
            <JuiGroupProfileList key={idx}>
              <Avatar uid={item.id} />
              {item.displayName}
              {isThePersonGuest[idx] ? (
                <StyledGuestIdentifier>Guest</StyledGuestIdentifier>
              ) : null}
              {isThePersonAdmin[idx] ? (
                <StyledAdminIdentifier>Admin</StyledAdminIdentifier>
              ) : null}
            </JuiGroupProfileList>
          );
        })}
        {isShowBottomShadow ? <StyledBottomBar /> : null}
      </StyledList>
    );
  }
}
const MembersListView = translate('translations')(MembersList);

export { MembersListView };
