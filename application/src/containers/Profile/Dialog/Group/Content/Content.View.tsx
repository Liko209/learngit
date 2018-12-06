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
    return (
      <>
        <JuiProfileDialogContentSummary>
          <JuiProfileDialogContentSummaryLeft>
            <GroupAvatar cid={id} size="xlarge" />
          </JuiProfileDialogContentSummaryLeft>
          <JuiProfileDialogContentSummaryRight>
            <JuiProfileDialogContentSummaryName needEllipsis={!group.isTeam}>
              {group.displayName}
            </JuiProfileDialogContentSummaryName>
            <JuiProfileDialogContentSummaryDescription>
              {group.description}
            </JuiProfileDialogContentSummaryDescription>
            <JuiProfileDialogContentSummaryButtons>
              <Message id={id} dismiss={dismiss} render={this.renderMessage} />
            </JuiProfileDialogContentSummaryButtons>
          </JuiProfileDialogContentSummaryRight>
        </JuiProfileDialogContentSummary>
        <JuiDivider />
        <JuiProfileDialogContentMembers>
          <MemberHeader id={id} />
          <MemberList id={id} />
        </JuiProfileDialogContentMembers>
      </>
    );
  }
}

const ProfileDialogGroupContentView = translate('translations')(
  ProfileDialogGroupContentViewComponent,
);

export { ProfileDialogGroupContentView };
