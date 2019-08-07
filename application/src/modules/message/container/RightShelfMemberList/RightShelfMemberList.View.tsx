/*
 * @Author: Chris Zhan (chris.zhan@ringcentral.com)
 * @Date: 2019-07-26 13:15:31
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { RightShelfMemberListViewProps } from './types';
import {
  JuiRightShellMemberListHeader as MemberListHeader,
  JuiRightShellMemberListTitle as MemberListTitle,
  JuiRightShellMemberListBody as MemberListBody,
  JuiRightShellMemberListAvatarWrapper as MemberListAvatarWrapper,
  JuiRightShellMemberListSubTitle as MemberListSubTitle,
  JuiRightShellMemberListMoreCount as MemberListMoreCount,
} from 'jui/pattern/RightShelf/MemberList';
import { withTranslation, WithTranslation } from 'react-i18next';
import { observer } from 'mobx-react';
import JuiLink from 'jui/components/Link';
import { JuiIconButton } from 'jui/components/Buttons';
import { Presence } from '@/containers/Presence';
import { Avatar } from '@/containers/Avatar';
import ResizeObserver from 'resize-observer-polyfill';
import { OpenProfile } from '@/common/OpenProfile';
import { JuiDivider } from 'jui/components/Divider';
import { analyticsCollector } from '@/AnalyticsCollector';
import portalManager from '@/common/PortalManager';
import { Dialog } from '@/containers/Dialog';
import { NewConversation } from '@/containers/NewConversation';
import { AddMembers } from '../Profile/Dialog/Group/Content/AddMembers';
import { ANALYTICS_KEY } from '../Profile/Dialog/Group/Content/Members/constants';
import { CONVERSATION_TYPES } from '@/constants';
import { MiniCard } from '../MiniCard';
import { Profile, PROFILE_TYPE } from '../Profile';

type Props = WithTranslation & RightShelfMemberListViewProps;

@observer
class RightShelfMemberListViewComponent extends Component<Props> {
  private _header = React.createRef<HTMLDivElement>();
  private _resizeObserver: ResizeObserver | null = null;

  constructor(props: Props) {
    super(props);

    this._resizeObserver = new ResizeObserver((entries, observer) => {
      if (
        !entries[0] ||
        !entries[0].target ||
        entries[0].target.clientWidth === 0
      ) {
        observer.disconnect();
        return;
      }
      props.setWrapperWidth(entries[0].target.clientWidth);
    });
  }

  componentDidMount() {
    this.props.init();
    if (this._resizeObserver && this._header.current) {
      this._resizeObserver.observe(this._header.current);
    }
  }

  componentWillUnmount() {
    this.props.dispose();
    this._resizeObserver && this._resizeObserver.disconnect();
  }

  onAddMemberButtonClick = () => {
    if (this.props.isTeam) {
      this.addTeamMembers();
    } else {
      this.addGroupMembers();
    }
  };

  openProfile = () => {
    OpenProfile.show(this.props.groupId, null, null, {
      disableRestoreFocus: true,
    });
  };

  addTeamMembers() {
    analyticsCollector.conversationAddPerson('team', 'Right Rail');
    const { group } = this.props;
    portalManager.dismissLast();
    Dialog.simple(<AddMembers group={group} />, {
      size: 'medium',
    });
  }
  addGroupMembers() {
    analyticsCollector.conversationAddPerson('group', 'Right Rail');
    const { group } = this.props;
    portalManager.dismissLast();
    NewConversation.show({ group });
  }

  onAvatarClick = (id: number) => async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const anchor = event.currentTarget as HTMLElement;
    MiniCard.show(<Profile id={id} type={PROFILE_TYPE.MINI_CARD} />, {
      anchor,
    });
    analyticsCollector.openMiniProfile(ANALYTICS_KEY);
  };

  renderAvatar(id: number) {
    const { personNameMap } = this.props;
    return (
      <Avatar
        data-test-automation-id="rightShellMemberListAvatar"
        key={id}
        size="medium"
        tooltip={personNameMap[id]}
        aria-label={personNameMap[id]}
        uid={id}
        presence={<Presence uid={id} borderSize="medium" />}
        onClick={this.onAvatarClick(id)}
      />
    );
  }

  render() {
    const {
      t,
      group,
      isLoading,
      loadingH,
      fullMemberIds,
      fullGuestIds,
      shownMemberIds,
      shownGuestIds,
      allMemberLength,
      isTeam,
    } = this.props;
    const addButtonTip = isTeam
      ? t('people.team.addTeamMembers')
      : t('people.group.addPeople');
    const showLink = ![
      CONVERSATION_TYPES.NORMAL_ONE_TO_ONE,
      CONVERSATION_TYPES.ME,
      CONVERSATION_TYPES.SMS,
    ].includes(group.type);
    return group.type === CONVERSATION_TYPES.ME ? null : (
      <>
        <MemberListHeader
          ref={this._header}
          data-test-automation-id="rightShellMemberListHeader"
        >
          <div>
            <MemberListTitle>{t('people.team.Members')}</MemberListTitle>
            {showLink ? (
              <JuiLink
                size="small"
                handleOnClick={this.openProfile}
                data-test-automation-id="rightShellMemberListHeaderShowAllLink"
              >
                {t('people.team.showAllCount', { count: allMemberLength })}
              </JuiLink>
            ) : null}
          </div>
          <JuiIconButton
            variant="plain"
            color="grey.500"
            size="small"
            tooltipTitle={addButtonTip}
            aria-label={addButtonTip}
            onClick={this.onAddMemberButtonClick}
            data-test-automation-id="rightShellMemberListHeaderAddButton"
          >
            addmember_border
          </JuiIconButton>
        </MemberListHeader>
        <MemberListBody
          loading={isLoading}
          height={isLoading ? loadingH : 'auto'}
          data-test-automation-id="rightShellMemberListBody"
        >
          <MemberListAvatarWrapper data-test-automation-id="rightShellMemberListMembers">
            {shownMemberIds.map(id => this.renderAvatar(id))}
            {fullMemberIds.length > shownMemberIds.length ? (
              <MemberListMoreCount
                data-test-automation-id="rightShellMemberListMore"
                count={
                  (allMemberLength
                    ? allMemberLength - fullGuestIds.length
                    : fullMemberIds.length) - shownMemberIds.length
                }
              />
            ) : null}
          </MemberListAvatarWrapper>
          {fullGuestIds.length > 0 ? (
            <>
              <MemberListSubTitle>{t('message.guests')}</MemberListSubTitle>
              <MemberListAvatarWrapper data-test-automation-id="rightShellMemberListGuests">
                {shownGuestIds.map(id => this.renderAvatar(id))}
                {fullGuestIds.length > shownGuestIds.length ? (
                  <MemberListMoreCount
                    count={fullGuestIds.length - shownGuestIds.length}
                    data-test-automation-id="rightShellMemberListMore"
                  />
                ) : null}
              </MemberListAvatarWrapper>
            </>
          ) : null}
        </MemberListBody>
        <JuiDivider />
      </>
    );
  }
}

const RightShelfMemberListView = withTranslation('translations')(
  RightShelfMemberListViewComponent,
);

export { RightShelfMemberListView };
