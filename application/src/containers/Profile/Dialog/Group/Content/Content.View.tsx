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
  JuiProfileDialogContentSummaryButton,
  JuiProfileDialogContentMembers as Members,
} from 'jui/pattern/Profile/Dialog';
import { goToConversation } from '@/common/goToConversation';
import { JuiIconography } from 'jui/foundation/Iconography';
import { MemberHeader, MemberList } from './Members';
import { TypeDictionary } from 'sdk/utils';
import { joinTeam } from '@/common/joinPublicTeam';
import portalManager from '@/common/PortalManager';

@observer
class ProfileDialogGroupContentViewComponent extends Component<
  WithNamespaces & ProfileDialogGroupContentViewProps
> {
  getAriaLabelKey = ([ariaTeam, ariaGroup]: string[]) => {
    const { typeId } = this.props;
    const mapping = {
      [TypeDictionary.TYPE_ID_TEAM]: ariaTeam,
      [TypeDictionary.TYPE_ID_GROUP]: ariaGroup,
    };
    return mapping[typeId];
  }

  joinTeamAfterClick = () => {
    const handerJoinTeam = joinTeam(this.props.group);
    portalManager.dismiss();
    handerJoinTeam();
  }

  renderButton = (
    iconName: string,
    buttonMessage: string,
    ariaLabelKey: string[],
    handerClick: (e: React.MouseEvent<HTMLElement>) => any,
  ) => {
    const { t, group } = this.props;
    return (
      <JuiProfileDialogContentSummaryButton
        aria-label={t(this.getAriaLabelKey(ariaLabelKey), {
          name: group.displayName,
        })}
        tabIndex={0}
        onClick={handerClick}
      >
        <JuiIconography fontSize="small">{iconName}</JuiIconography>
        {t(buttonMessage)}
      </JuiProfileDialogContentSummaryButton>
    );
  }

  messageAfterClick = async () => {
    const { id } = this.props;
    await goToConversation({ id });
    portalManager.dismiss();
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
                this.renderButton(
                  'chat_bubble',
                  'message',
                  ['ariaGoToTeam', 'ariaGoToGroup'],
                  this.messageAfterClick,
                )}
              {showJoinTeam &&
                this.renderButton(
                  'chat_bubble',
                  'joinTeam',
                  ['ariaJoinTeam', 'ariaJoinTeam'],
                  this.joinTeamAfterClick,
                )}
            </Buttons>
          </Right>
        </Summary>
        <JuiDivider />
        <Members>
          <MemberHeader id={id} />
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
