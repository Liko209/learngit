/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-22 11:27:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate } from 'react-i18next';
import {
  JuiGroupProfileList,
  StyledGuestIdentifier,
  StyledAdminIdentifier,
  StyledList,
} from 'jui/pattern/GroupTeamProfile';
import { Avatar } from '@/containers/Avatar';
import { MemberListViewProps } from './types';

@observer
class MembersList extends React.Component<MemberListViewProps> {
  render() {
    const { membersList, isThePersonAdmins, isThePersonGuests, t } = this.props;
    return (
      <StyledList>
        {membersList.map((item: any, idx: number) => {
          return (
            <JuiGroupProfileList key={idx}>
              <Avatar uid={item.id} />
              {item.userDisplayName}
              {isThePersonGuests[idx] ? (
                <StyledGuestIdentifier>{t('Guest')}</StyledGuestIdentifier>
              ) : null}
              {isThePersonAdmins[idx] ? (
                <StyledAdminIdentifier>{t('Admin')}</StyledAdminIdentifier>
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
