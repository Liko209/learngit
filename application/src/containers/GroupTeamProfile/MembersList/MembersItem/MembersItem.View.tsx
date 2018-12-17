/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-27 14:33:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { Avatar } from '@/containers/Avatar';
import {
  JuiGroupProfileList,
  JuiGroupProfileGuestIdentifier,
  JuiGroupProfileAdminIdentifier,
  JuiGroupProfileListName,
} from 'jui/pattern/GroupTeamProfile';
import { Presence } from '@/containers/Presence';
import { MembersViewProps } from './types';

type Props = WithNamespaces & MembersViewProps;
@observer
class MembersItem extends React.Component<Props> {
  private _presence = (id: number) => {
    return <Presence uid={id} borderSize="medium" />;
  }
  render() {
    const { uid, member, t, isThePersonGuest, isThePersonAdmin } = this.props;
    return (
      <JuiGroupProfileList>
        <Avatar uid={uid} presence={this._presence(uid)} />
        <JuiGroupProfileListName>{member.userDisplayName}</JuiGroupProfileListName>
        {isThePersonGuest ? (
          <JuiGroupProfileGuestIdentifier>{t('Guest')}</JuiGroupProfileGuestIdentifier>
        ) : null}
        {isThePersonAdmin ? (
          <JuiGroupProfileAdminIdentifier>{t('Admin')}</JuiGroupProfileAdminIdentifier>
        ) : null}
      </JuiGroupProfileList>
    );
  }
}
const MembersItemView = translate('translations')(MembersItem);
export { MembersItemView };
