/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { translate, WithNamespaces } from 'react-i18next';
import { ProfileDialogGroupContentViewProps } from './types';
// import { JuiDivider } from 'jui/components/Divider';
import { GroupAvatar } from '@/containers/Avatar';
import {
  JuiProfileDialogContentBlock,
  JuiProfileDialogContentSummary,
  JuiProfileDialogContentSummaryLeft,
  JuiProfileDialogContentSummaryRight,
  JuiProfileDialogContentSummaryName,
  JuiProfileDialogContentSummaryDescription,
  JuiProfileDialogContentSummaryButtons,
  JuiProfileDialogContentSummaryButton,
} from 'jui/pattern/Profile/Dialog';
import { Message } from '@/containers/common/Message';
import { JuiIconography } from 'jui/foundation/Iconography';

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
        <JuiProfileDialogContentBlock>
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
                <Message
                  id={id}
                  dismiss={dismiss}
                  render={this.renderMessage}
                />
              </JuiProfileDialogContentSummaryButtons>
            </JuiProfileDialogContentSummaryRight>
          </JuiProfileDialogContentSummary>
        </JuiProfileDialogContentBlock>
        <JuiProfileDialogContentBlock>
          Members list
        </JuiProfileDialogContentBlock>
      </>
    );
  }
}

const ProfileDialogGroupContentView = translate('translations')(
  ProfileDialogGroupContentViewComponent,
);

export { ProfileDialogGroupContentView };
