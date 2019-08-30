/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ProfileDialogGroupContentViewProps } from './types';
import { JuiDivider } from 'jui/components/Divider';
import { GroupAvatar } from '@/containers/Avatar';
import {
  JuiProfileDialogContentSummary as Summary,
  JuiProfileDialogContentSummaryLeft as Left,
  JuiProfileDialogContentSummaryRight as Right,
  JuiProfileDialogContentSummaryName as Name,
  JuiProfileDialogContentSummaryDescription as Description,
  JuiProfileDialogContentSummaryButtons as Buttons,
} from 'jui/pattern/Profile/Dialog';
import { goToConversationWithLoading } from '@/common/goToConversation';
import { Members } from './Members';
import { joinPublicTeam } from '@/common/joinPublicTeam';
import portalManager from '@/common/PortalManager';
import { renderButton } from './common/button';
import { ProfileContext } from '../types';
import RO from 'resize-observer-polyfill';
import { AudioConference } from '@/modules/telephony/container/AudioConference';
import { analyticsCollector } from '@/AnalyticsCollector';

// padding for `Summary`
const PADDING_FIX = 20 + 20;
@observer
class ProfileDialogGroupContentViewComponent extends Component<
  WithTranslation & ProfileDialogGroupContentViewProps
> {
  static contextType = ProfileContext;
  private _ref: RefObject<any> = createRef();
  private _observer?: RO;
  private _handleResize = (entries: ResizeObserverEntry[]) => {
    const entry = entries[0];
    const { width, height } = entry.contentRect;
    const { sizeManager } = this.context;
    sizeManager.updateSize('profileDialogSummary', {
      width,
      height: height + PADDING_FIX,
    });
  };

  componentDidMount() {
    const { current } = this._ref;
    if (current) {
      this._observer = new RO(this._handleResize);
      this._observer.observe(current);
    }
  }

  componentWillUnmount() {
    if (this._observer) {
      this._observer.disconnect();
    }
  }

  joinTeamAfterClick = () => {
    portalManager.dismissLast();
    joinPublicTeam(this.props.group);
  };

  messageAfterClick = async () => {
    const { destinationId, analysisType } = this.props;
    analyticsCollector.goToConversation('profileDialog', analysisType);
    await goToConversationWithLoading({ id: destinationId });
    portalManager.dismissLast();
  };

  render() {
    const { id, group, showMessage, showJoinTeam } = this.props;
    return (
      <>
        <Summary ref={this._ref} data-test-automation-id="profileDialogSummary">
          <Left>
            <GroupAvatar
              cid={id}
              size="xlarge"
              data-test-automation-id="profileAvatar"
            />
          </Left>
          <Right>
            <Name
              needEllipsis={!group.isTeam}
              data-test-automation-id="profileDialogSummaryName"
            >
              {group.displayName}
            </Name>
            <Description data-test-automation-id="profileDialogSummaryDescription">
              {group.description}
            </Description>
            <Buttons>
              {showMessage &&
                renderButton(
                  'chat',
                  'message.message',
                  ['people.team.ariaGoToTeam', 'people.team.ariaGoToGroup'],
                  this.props,
                  this.messageAfterClick,
                )}
              <AudioConference
                groupId={group.id}
                variant="text"
                size="medium"
                analysisSource="profileDialog"
              />
              {showJoinTeam &&
                renderButton(
                  'add_member',
                  'people.team.joinTeam',
                  ['people.team.ariaJoinTeam', 'people.team.ariaJoinTeam'],
                  this.props,
                  this.joinTeamAfterClick,
                )}
            </Buttons>
          </Right>
        </Summary>
        <JuiDivider />
        <Members id={id} />
      </>
    );
  }
}

const ProfileDialogGroupContentView = withTranslation('translations')(
  ProfileDialogGroupContentViewComponent,
);

export { ProfileDialogGroupContentView };
