/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-08 09:21:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import { translate } from 'react-i18next';
import {
  JuiConversationPage,
  JuiStreamWrapper,
} from 'jui/pattern/ConversationPage';
import { JuiDisabledInput } from 'jui/pattern/DisabledInput';

import { Header } from './Header';
import { MessageInput } from './MessageInput';
import { Stream } from './Stream';
import { ConversationPageViewProps } from './types';

@observer
class ConversationPageViewComponent extends Component<
  ConversationPageViewProps
> {
  private _scrollToBottom: () => any;

  private _setScrollMethod = (func: () => any) => {
    this._scrollToBottom = func;
  }

  sendHandler = () => {
    this._scrollToBottom();
  }

  render() {
    const { t, groupId, canPost } = this.props;

    return groupId ? (
      <JuiConversationPage
        className="conversation-page"
        data-group-id={groupId}
        data-test-automation-id="messagePanel"
      >
        <Header id={groupId} />
        <JuiStreamWrapper>
          <Stream groupId={groupId} setMethods={this._setScrollMethod} />
          <div id="jumpToFirstUnreadButtonRoot" />
        </JuiStreamWrapper>
        {canPost ? (
          <MessageInput id={groupId} onPost={this.sendHandler} />
        ) : (
          <JuiDisabledInput text={t('disabledText')} />
        )}
      </JuiConversationPage>
    ) : null;
  }
}

const ConversationPageView = translate('Conversations')(
  ConversationPageViewComponent,
);

export { ConversationPageView };
