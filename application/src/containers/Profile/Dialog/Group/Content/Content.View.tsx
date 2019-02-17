/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
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
  JuiProfileDialogContentMembers as Members,
} from 'jui/pattern/Profile/Dialog';
import { goToConversation } from '@/common/goToConversation';
import { MemberHeader, MemberList } from './Members';
import { AddMembers } from './AddMembers';
import { Dialog } from '@/containers/Dialog';
import { joinTeam } from '@/common/joinPublicTeam';
import portalManager from '@/common/PortalManager';
import { renderButton } from './common/button';

@observer
class ProfileDialogGroupContentViewComponent extends Component<
  WithNamespaces & ProfileDialogGroupContentViewProps
> {
  joinTeamAfterClick = () => {
    const handerJoinTeam = joinTeam(this.props.group);
    portalManager.dismiss();
    handerJoinTeam();
  }

  messageAfterClick = async () => {
    const { id } = this.props;
    await goToConversation({ id });
    portalManager.dismiss();
  }

  addTeamMembers = () => {
    const { group } = this.props;
    portalManager.dismiss();
    Dialog.simple(<AddMembers group={group} />, {
      size: 'medium',
    });
  }

  render() {
    const { id, group, showMessage, showJoinTeam } = this.props;
    return (
      <>
        <Summary data-test-automation-id="profileDialogSummary">
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
                  'chat_bubble',
                  'message.message',
                  ['people.team.ariaGoToTeam', 'people.team.ariaGoToGroup'],
                  this.props,
                  this.messageAfterClick,
                )}
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
        <Members>
          <MemberHeader id={id} AddTeamMembers={this.addTeamMembers} />
          <MemberList id={id} />
        </Members>
      </>
    );
  }
}

const ProfileDialogGroupContentView = translate('translations')(
  ProfileDialogGroupContentViewComponent,
);

export { ProfileDialogGroupContentView };
