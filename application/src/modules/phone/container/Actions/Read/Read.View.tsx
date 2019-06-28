/*
 * @Author: joy.zhang (joy.zhang@ringcentral.com)
 * @Date: 2019-05-24 07:22:04
 * Copyright © RingCentral. All rights reserved.
 */

import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { withTranslation, WithTranslation } from 'react-i18next';
import { ReadViewProps, BUTTON_TYPE } from './types';
import { JuiIconButton } from 'jui/components/Buttons';
import { JuiMenuItem } from 'jui/components/Menus';
import { JuiActionIconWrapper } from 'jui/pattern/Phone/VoicemailItem';
import { catchError } from '@/common/catchError';

type Props = ReadViewProps & WithTranslation;

@observer
class ReadViewComponent extends Component<Props> {
  @catchError.flash({
    network: 'voicemail.prompt.notAbleToUnreadVoicemalForNetworkIssue',
    server: 'voicemail.prompt.notAbleToUnreadVoicemalForServerIssue',
  })
  private _handleUnread = () => {
    return this.props.read();
  }

  @catchError.flash({
    network: 'voicemail.prompt.notAbleToReadVoicemailForNetworkIssue',
    server: 'voicemail.prompt.notAbleToReadVoicemailForServerIssue',
  })
  private _handleRead = () => {
    return this.props.read();
  }

  private _handleClick = () => {
    const { isRead, hookAfterClick } = this.props;
    if (isRead) {
      this._handleUnread();
    } else {
      this._handleRead();
    }
    hookAfterClick && hookAfterClick();
  }

  get title() {
    const { isRead, t } = this.props;
    return isRead ? t('voicemail.markUnread') : t('voicemail.markRead');
  }

  get screenreaderText() {
    const { isRead, t } = this.props;
    return isRead
      ? t('voicemail.messageIsReadMarkItAsUnread')
      : t('voicemail.messageIsUnreadMarkItAsRead');
  }

  render() {
    const { type, isRead } = this.props;
    if (type === BUTTON_TYPE.ICON) {
      return (
        <JuiActionIconWrapper>
          <JuiIconButton
            color="common.white"
            variant="round"
            autoFocus={false}
            size="small"
            key="voicemail-read"
            onClick={this._handleClick}
            data-test-automation-id="voicemail-read-button"
            tooltipTitle={this.title}
            ariaLabel={this.screenreaderText}
          >
            {isRead ? 'unread' : 'read'}
          </JuiIconButton>
        </JuiActionIconWrapper>
      );
    }
    return (
      <JuiMenuItem
        onClick={this._handleClick}
        icon={isRead ? 'read' : 'unread'}
        data-test-automation-id="voicemail-read-button"
        aria-label={this.screenreaderText}
      >
        {this.title}
      </JuiMenuItem>
    );
  }
}

const ReadView = withTranslation('translations')(ReadViewComponent);

export { ReadView };
