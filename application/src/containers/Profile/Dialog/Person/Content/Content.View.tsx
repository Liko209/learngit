/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-11-12 11:29:35
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate, WithNamespaces } from 'react-i18next';
import { ProfileDialogPersonContentViewProps } from './types';
import { JuiDivider } from 'jui/components/Divider';
import { Avatar } from '@/containers/Avatar';
import { Presence } from '@/containers/Presence';
import {
  JuiProfileDialogContentSummary,
  JuiProfileDialogContentSummaryLeft,
  JuiProfileDialogContentSummaryRight,
  JuiProfileDialogContentSummaryName,
  JuiProfileDialogContentSummaryButtons,
  JuiProfileDialogContentSummaryButton,
  JuiProfileDialogContentSummaryStatus,
  JuiProfileDialogContentSummaryTitle,
} from 'jui/pattern/Profile/Dialog';
import { Message } from '@/containers/common/Message';
import { JuiIconography } from 'jui/foundation/Iconography';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';

@observer
class ProfileDialogPersonContentViewComponent extends Component<
  WithNamespaces & ProfileDialogPersonContentViewProps
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
    const { id, person, dismiss } = this.props;
    const Summary = JuiProfileDialogContentSummary;
    const Left = JuiProfileDialogContentSummaryLeft;
    const Right = JuiProfileDialogContentSummaryRight;
    const Name = JuiProfileDialogContentSummaryName;
    const Status = JuiProfileDialogContentSummaryStatus;
    const Title = JuiProfileDialogContentSummaryTitle;
    const Buttons = JuiProfileDialogContentSummaryButtons;
    const presence = <Presence uid={id} size="xlarge" borderSize="xlarge" />;
    const currentUserId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    return (
      <>
        <Summary emphasize={id === currentUserId}>
          <Left>
            <Avatar uid={id} size="xlarge" presence={presence} />
          </Left>
          <Right>
            <Name>{person.userDisplayName}</Name>
            <Status>{person.awayStatus}</Status>
            <Title>{person.jobTitle}</Title>
            <Buttons>
              <Message id={id} dismiss={dismiss} render={this.renderMessage} />
            </Buttons>
          </Right>
        </Summary>
        <JuiDivider />
      </>
    );
  }
}

const ProfileDialogPersonContentView = translate('translations')(
  ProfileDialogPersonContentViewComponent,
);

export { ProfileDialogPersonContentView };
