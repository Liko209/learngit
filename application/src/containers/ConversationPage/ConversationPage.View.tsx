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
import { ConversationPageViewProps } from './types';
import { action, observable } from 'mobx';

import { StreamViewComponent } from './Stream/Stream.View';
import { Stream } from './Stream';

@observer
class ConversationPageViewComponent extends Component<
  ConversationPageViewProps
> {
  private _streamRef: React.RefObject<StreamViewComponent> = React.createRef();

  @observable
  streamKey = 0;

  sendHandler = () => {
    const stream = this._streamRef.current;
    if (!stream) {
      return;
    }
    if (stream.props.hasMoreDown) {
      return this.remountStream();
    }
    return stream.scrollToBottom();
  }

  @action.bound
  remountStream() {
    return this.streamKey++;
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
          <Stream
            groupId={groupId}
            viewRef={this._streamRef}
            key={`Stream_${groupId}_${this.streamKey}`}
          />
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
