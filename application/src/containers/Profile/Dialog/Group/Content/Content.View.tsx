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
import { Message } from '@/containers/common/Message';
import { JuiIconography } from 'jui/foundation/Iconography';
import { MemberHeader, MemberList } from './Members';
import { TypeDictionary } from 'sdk/utils';
import portalManager from '@/common/PortalManager';

@observer
class ProfileDialogGroupContentViewComponent extends Component<
  WithNamespaces & ProfileDialogGroupContentViewProps
> {
  getAriaLabelKey = () => {
    const { typeId } = this.props;
    const mapping = {
      [TypeDictionary.TYPE_ID_TEAM]: 'ariaGoToTeam',
      [TypeDictionary.TYPE_ID_GROUP]: 'ariaGoToGroup',
    };
    return mapping[typeId];
  }

  renderMessage = () => {
    const { t, group } = this.props;
    return (
      <JuiProfileDialogContentSummaryButton
        tabIndex={0}
        aria-label={t(this.getAriaLabelKey(), { name: group.displayName })}
      >
        <JuiIconography fontSize="small">chat_bubble</JuiIconography>
        {t('message')}
      </JuiProfileDialogContentSummaryButton>
    );
  }

  messageAfterClick = () => portalManager.dismiss();

  render() {
    const { id, group, showMessage } = this.props;
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
              {showMessage && (
                <Message
                  id={id}
                  afterClick={this.messageAfterClick}
                  render={this.renderMessage}
                />
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
