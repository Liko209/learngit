/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-27 14:33:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { Avatar } from '@/containers/Avatar';
import { Presence } from '@/containers/Presence';
import { MembersViewProps } from './types';
import {
  JuiProfileDialogContentMemberListItem,
  JuiProfileDialogContentMemberListItemName,
  JuiProfileDialogContentMemberListItemAdmin,
  JuiProfileDialogContentMemberListItemGuest,
} from 'jui/pattern/Profile/Dialog';

@observer
class MemberListItem extends React.Component<
  WithNamespaces & MembersViewProps
> {
  render() {
    const { pid, person, t, isThePersonGuest, isThePersonAdmin } = this.props;
    const presence = <Presence uid={pid} borderSize="medium" />;
    const ListItem = JuiProfileDialogContentMemberListItem;
    const ListItemName = JuiProfileDialogContentMemberListItemName;
    const ListItemAdmin = JuiProfileDialogContentMemberListItemAdmin;
    const ListItemGuest = JuiProfileDialogContentMemberListItemGuest;
    return (
      <ListItem>
        <Avatar uid={pid} presence={presence} />
        <ListItemName>{person.userDisplayName}</ListItemName>
        {isThePersonAdmin && <ListItemAdmin>{t('admin')}</ListItemAdmin>}
        {isThePersonGuest && <ListItemGuest>{t('guest')}</ListItemGuest>}
      </ListItem>
    );
  }
}
const MemberListItemView = translate('translations')(MemberListItem);

export { MemberListItemView };
