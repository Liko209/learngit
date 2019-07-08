/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:22:04
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ReadViewProps } from './types';
import { ActionButton } from 'jui/pattern/Phone/VoicemailItem';
import { catchError } from '@/common/catchError';
import { analyticsCollector } from '@/AnalyticsCollector';
import { PHONE_ITEM_ACTIONS } from '@/AnalyticsCollector/constants';

type Props = ReadViewProps & WithTranslation;

@observer
class ReadViewComponent extends Component<Props> {
  @catchError.flash({
    network: 'voicemail.prompt.notAbleToUnreadVoicemalForNetworkIssue',
    server: 'voicemail.prompt.notAbleToUnreadVoicemalForServerIssue',
  })
  private _handleUnread = () => {
    const tabName = this.props.tabName;
    analyticsCollector.phoneActions(tabName, PHONE_ITEM_ACTIONS.MARK_UNREAD);
    return this.props.read();
  }

  @catchError.flash({
    network: 'voicemail.prompt.notAbleToReadVoicemailForNetworkIssue',
    server: 'voicemail.prompt.notAbleToReadVoicemailForServerIssue',
  })
  private _handleRead = () => {
    const tabName = this.props.tabName;
    analyticsCollector.phoneActions(tabName, PHONE_ITEM_ACTIONS.MARK_READ);
    return this.props.read();
  }

  private _handleClick = () => {
    const { isRead } = this.props;
    if (isRead) {
      this._handleUnread();
    } else {
      this._handleRead();
    }
  }

  get title() {
    const { isRead, t } = this.props;
    return isRead ? t('voicemail.markUnread') : t('voicemail.markRead');
  }

  render() {
    const { type, isRead, entity } = this.props;
    return (
      <ActionButton
        key="voicemail-read"
        icon={isRead ? 'read' : 'unread'}
        type={type}
        tooltip={this.title}
        onClick={this._handleClick}
        screenReader={this.title}
        automationId={`${entity}-read-button`}
      />
    );
  }
}

const ReadView = withTranslation('translations')(ReadViewComponent);

export { ReadView };
