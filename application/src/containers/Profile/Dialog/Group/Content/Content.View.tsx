/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { ProfileDialogGroupContentViewProps } from './types';
import { JuiDivider } from 'jui/components/Divider';
import { GroupAvatar } from '@/containers/Avatar';
import {
  JuiProfileDialogContentSummary,
  JuiProfileDialogContentSummaryLeft,
  JuiProfileDialogContentSummaryRight,
  JuiProfileDialogContentSummaryName,
  JuiProfileDialogContentSummaryDescription,
  JuiProfileDialogContentSummaryButtons,
  JuiProfileDialogContentSummaryButton,
  JuiProfileDialogContentMembers,
} from 'jui/pattern/Profile/Dialog';
import { Message } from '@/containers/common/Message';
import { JuiIconography } from 'jui/foundation/Iconography';
import { MemberHeader, MemberList } from './Members';

class ProfileDialogGroupContentViewComponent extends Component<
  WithNamespaces & ProfileDialogGroupContentViewProps
> {
  renderMessage = () => {
    const { t } = this.props;
    return (
      <JuiProfileDialogContentSummaryButton>
        <JuiIconography fontSize="small">chat_bubble</JuiIconography>
        {t('message')}
      </JuiProfileDialogContentSummaryButton>
    );
  }
  render() {
    const { id, group, dismiss } = this.props;
    const Summary = JuiProfileDialogContentSummary;
    const Left = JuiProfileDialogContentSummaryLeft;
    const Right = JuiProfileDialogContentSummaryRight;
    const Name = JuiProfileDialogContentSummaryName;
    const Description = JuiProfileDialogContentSummaryDescription;
    const Buttons = JuiProfileDialogContentSummaryButtons;
    const Members = JuiProfileDialogContentMembers;
    return (
      <>
        <Summary>
          <Left>
            <GroupAvatar cid={id} size="xlarge" />
          </Left>
          <Right>
            <Name needEllipsis={!group.isTeam}>{group.displayName}</Name>
            <Description>{group.description}</Description>
            <Buttons>
              <Message id={id} dismiss={dismiss} render={this.renderMessage} />
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
