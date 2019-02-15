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
import {
  JuiProfileDialogContentMemberListItem,
  JuiProfileDialogContentMemberListItemName,
  JuiProfileDialogContentMemberListItemAdmin,
  JuiProfileDialogContentMemberListItemGuest,
  JuiProfileDialogContentMemberListItemRightWrapper,
} from 'jui/pattern/Profile/Dialog';
import { Menu } from '../Menu';
import { MembersViewProps } from './types';
type State = {
  isHover: boolean;
};
@observer
class MemberListItem extends React.Component<
  WithNamespaces & MembersViewProps,
  State
> {
  state = {
    isHover: false,
  };
  private _handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({
      isHover: true,
    });
  }

  private _handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    this.setState({
      isHover: false,
    });
  }

  private _onMenuClose = () => {
    this.setState({
      isHover: false,
    });
  }

  render() {
    const {
      pid,
      cid,
      person,
      t,
      isThePersonGuest,
      isThePersonAdmin,
      isCurrentUserAdmin,
      currentUserId,
      isOnlyOneAdmin,
    } = this.props;
    const { isHover } = this.state;
    const presence = <Presence uid={pid} borderSize="medium" />;
    const ListItem = JuiProfileDialogContentMemberListItem;
    const ListItemName = JuiProfileDialogContentMemberListItemName;
    const ListItemAdmin = JuiProfileDialogContentMemberListItemAdmin;
    const ListItemGuest = JuiProfileDialogContentMemberListItemGuest;
    const ListRightWrapper = JuiProfileDialogContentMemberListItemRightWrapper;
    const isCurrentUserSelf = currentUserId === pid;
    const ableChangeAdmin = !(isOnlyOneAdmin && isCurrentUserSelf);
    return (
      <ListItem
        data-id={pid}
        button={false}
        isHover={isHover}
        onMouseOver={this._handleMouseEnter}
        onMouseLeave={this._handleMouseLeave}
      >
        <Avatar uid={pid} presence={presence} />
        <ListItemName data-test-automation-id="profileDialogMemberListItemPersonName">
          {person.userDisplayName}
        </ListItemName>
        {isThePersonAdmin && (
          <ListItemAdmin data-test-automation-id="profileDialogMemberListItemPersonAdmin">
            {t('admin')}
          </ListItemAdmin>
        )}
        {isThePersonGuest && (
          <ListItemGuest data-test-automation-id="profileDialogMemberListItemPersonGuest">
            {t('guest')}
          </ListItemGuest>
        )}
        {isCurrentUserAdmin && isHover && ableChangeAdmin && (
          <ListRightWrapper>
            <Menu
              personId={pid}
              groupId={cid}
              onMenuClose={this._onMenuClose}
              isCurrentUserSelf={isCurrentUserSelf}
              isThePersonAdmin={isThePersonAdmin}
              isThePersonGuest={isThePersonGuest}
            />
          </ListRightWrapper>
        )}
      </ListItem>
    );
  }
}
const MemberListItemView = translate('translations')(MemberListItem);

export { MemberListItemView };
