/*
 * @Author: Alvin Huang (alvin.huang@ringcentral.com)
 * @Date: 2018-11-27 14:33:02
 * Copyright © RingCentral. All rights reserved.
 */
import { observer } from 'mobx-react';
import React from 'react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { Avatar } from '@/containers/Avatar';
import { Presence } from '@/containers/Presence';
import { analyticsCollector } from '@/AnalyticsCollector';
import { ANALYTICS_KEY } from '../constants';

import {
  JuiProfileDialogContentMemberListItem,
  JuiProfileDialogContentMemberListItemName,
  JuiProfileDialogContentMemberListItemRightWrapper,
} from 'jui/pattern/Profile/Dialog';
import { RuiTag } from 'rcui/components/Tag';

import { Menu } from '../Menu';
import { MembersViewProps } from './types';
import { ProfileMiniCard } from '@/modules/message/container/MiniCard/Profile';
import { ProfileMiniCardPerson } from '@/modules/message/container/Profile/MiniCard/Person';

type State = {
  isHover: boolean;
};

@observer
class MemberListItem extends React.Component<
  WithTranslation & MembersViewProps,
  State
> {
  state = {
    isHover: false,
  };
  private _handleMouseEnter = () => {
    this.setState({
      isHover: true,
    });
  };

  private _handleMouseLeave = () => {
    this.setState({
      isHover: false,
    });
  };

  private _onMenuClose = () => {
    this.setState({
      isHover: false,
    });
  };

  onClickAvatar = async (event: React.MouseEvent) => {
    const { pid } = this.props;
    event.stopPropagation();
    const anchor = event.currentTarget as HTMLElement;
    const profileMiniCard = new ProfileMiniCard();

    profileMiniCard.show({
      anchor,
      cardContent: <ProfileMiniCardPerson id={pid} />,
    });

    analyticsCollector.openMiniProfile(ANALYTICS_KEY);
  };

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
      adminNumber,
      isTeam,
    } = this.props;
    const { isHover } = this.state;
    const presence = <Presence uid={pid} borderSize="medium" />;
    const ListItem = JuiProfileDialogContentMemberListItem;
    const ListItemName = JuiProfileDialogContentMemberListItemName;
    const ListRightWrapper = JuiProfileDialogContentMemberListItemRightWrapper;
    const isCurrentUserSelf = currentUserId === pid;
    const ableChangeAdmin = !(adminNumber === 1 && isCurrentUserSelf);
    return (
      <ListItem
        data-id={pid}
        button={false}
        isHover={isHover}
        onMouseOver={this._handleMouseEnter}
        onMouseLeave={this._handleMouseLeave}
      >
        <Avatar uid={pid} presence={presence} onClick={this.onClickAvatar} />
        <ListItemName data-test-automation-id="profileDialogMemberListItemPersonName">
          {person.userDisplayName}
        </ListItemName>
        {isThePersonAdmin && (
          <RuiTag content={t('people.profile.admin')} color="primary" data-test-automation-id="profileDialogMemberListItemPersonAdmin" />
        )}
        {isThePersonGuest && (
          <RuiTag content={t('people.profile.guest')} color="secondary" data-test-automation-id="profileDialogMemberListItemPersonGuest" />
        )}
        {isTeam && isCurrentUserAdmin && isHover && ableChangeAdmin && (
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
const MemberListItemView = withTranslation('translations')(MemberListItem);

export { MemberListItemView };
