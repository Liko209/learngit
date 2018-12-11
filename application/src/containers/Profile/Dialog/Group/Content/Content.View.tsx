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

@observer
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
    const { id, group, showMessage, dismiss } = this.props;
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
              {showMessage && (
                <Message
                  id={id}
                  dismiss={dismiss}
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
