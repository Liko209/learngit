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
import { MiniCard } from '../MiniCard';
import { Profile, PROFILE_TYPE } from '../Profile';
import moize from 'moize';

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
    this._header.current &&
      !this.props.shouldHide &&
      this._resizeObserver &&
      this._resizeObserver.observe(this._header.current);
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this._header.current &&
      prevProps.shouldHide &&
      !this.props.shouldHide
    ) {
      this._resizeObserver &&
        this._resizeObserver.observe(this._header.current);
    } else if (!prevProps.shouldHide && this.props.shouldHide) {
      this._resizeObserver && this._resizeObserver.disconnect();
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

    analyticsCollector.profileDialog(
      this.props.isTeam ? 'Team' : 'Group',
      'rightShelf_showAll',
    );
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

  onAvatarClick = moize((id: number) => async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    const anchor = event.currentTarget as HTMLElement;
    MiniCard.show(<Profile id={id} type={PROFILE_TYPE.MINI_CARD} />, {
      anchor,
    });
    analyticsCollector.openMiniProfile(ANALYTICS_KEY);
  });

  buildPresence = moize((id: number) => {
    return <Presence uid={id} borderSize="medium" />
  })


  renderAvatar = (id: number) => {
    const {
      membersData: { personNameMap },
    } = this.props;

    return (
      <Avatar
        data-test-automation-id="rightShelfMemberListAvatar"
        key={id}
        size="medium"
        tooltip={personNameMap[id]}
        aria-label={personNameMap[id]}
        uid={id}
        presence={this.buildPresence(id)}
        onClick={this.onAvatarClick(id)}
      />
    );
  }

  private get _renderAddMembers() {
    const { t, canAddMembers, isTeam } = this.props;

    if (!canAddMembers) {
      return null;
    }

    const addButtonTip = isTeam
      ? t('people.team.addTeamMembers')
      : t('people.group.addPeople');

    return (
      <JuiIconButton
        variant="plain"
        color="grey.500"
        size="small"
        tooltipTitle={addButtonTip}
        aria-label={addButtonTip}
        onClick={this.onAddMemberButtonClick}
        data-test-automation-id="rightShelfMemberListHeaderAddButton"
      >
        addmember_border
      </JuiIconButton>
    );
  }

  render() {
    const {
      t,
      membersData: {
        isLoading,
        fullMemberLen,
        fullGuestLen,
        shownMemberIds,
        shownGuestIds,
      },
      shouldShowLink,
      loadingH,
      allMemberLength,
      shouldHide,
    } = this.props;

    return shouldHide ? null : (
      <>
        <MemberListHeader
          ref={this._header}
          data-test-automation-id="rightShelfMemberListHeader"
        >
          <div>
            <MemberListTitle>{t('people.team.Members')}</MemberListTitle>
            {shouldShowLink ? (
              <JuiLink
                size="small"
                handleOnClick={this.openProfile}
                data-test-automation-id="rightShelfMemberListHeaderShowAllLink"
              >
                {t('people.team.showAllCount', { count: allMemberLength })}
              </JuiLink>
            ) : null}
          </div>
          {this._renderAddMembers}
        </MemberListHeader>
        <MemberListBody
          loading={isLoading}
          height={isLoading ? loadingH : 'auto'}
          data-test-automation-id="rightShelfMemberListBody"
        >
          <MemberListAvatarWrapper data-test-automation-id="rightShelfMemberListMembers">
            {shownMemberIds.map(id => this.renderAvatar(id))}
            {fullMemberLen > shownMemberIds.length ? (
              <MemberListMoreCount
                data-test-automation-id="rightShelfMemberListMore"
                count={fullMemberLen - shownMemberIds.length}
              />
            ) : null}
          </MemberListAvatarWrapper>
          {fullGuestLen > 0 ? (
            <>
              <MemberListSubTitle>{t('message.guests')}</MemberListSubTitle>
              <MemberListAvatarWrapper data-test-automation-id="rightShelfMemberListGuests">
                {shownGuestIds.map(id => this.renderAvatar(id))}
                {fullGuestLen > shownGuestIds.length ? (
                  <MemberListMoreCount
                    count={fullGuestLen - shownGuestIds.length}
                    data-test-automation-id="rightShelfMemberListMore"
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
