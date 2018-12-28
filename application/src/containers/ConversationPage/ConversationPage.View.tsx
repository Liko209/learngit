/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-08 09:21:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import { translate } from 'react-i18next';
import HTML5Backend, { NativeTypes } from 'react-dnd-html5-backend';
import { DragDropContextProvider, DropTargetMonitor } from 'react-dnd';
import {
  JuiConversationPage,
  JuiStreamWrapper,
} from 'jui/pattern/ConversationPage';
import { StreamDropZoneClasses } from 'jui/pattern/ConversationPage/StreamWrapper';
import { MessageInputDropZoneClasses } from 'jui/pattern/MessageInput/MessageInput';
import { JuiDropZone } from 'jui/pattern/MessageInput/DropZone';
import { JuiDisabledInput } from 'jui/pattern/DisabledInput';

import { Header } from './Header';
import { MessageInput } from './MessageInput';
import { MessageInputViewComponent } from './MessageInput/MessageInput.View';
import { ConversationPageViewProps } from './types';
import { action, observable } from 'mobx';

import { StreamViewComponent } from './Stream/Stream.View';
import { Stream } from './Stream';
import { AttachmentManager } from './MessageInput/Attachments';
import { AttachmentManagerViewComponent } from './MessageInput/Attachments/AttachmentManager.View';

@observer
class ConversationPageViewComponent extends Component<
  ConversationPageViewProps
> {
  private _streamRef: RefObject<StreamViewComponent> = createRef();
  private _messageInputRef: RefObject<MessageInputViewComponent> = createRef();
  private _attachmentManagerRef: RefObject<
    AttachmentManagerViewComponent
  > = createRef();

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

  _handleDropFileInStream = (item: any, monitor: DropTargetMonitor) => {
    if (monitor) {
      const { files } = monitor.getItem();
      const { current } = this._attachmentManagerRef;
      if (current) {
        current.directPostFiles && current.directPostFiles(files);
      }
    }
  }

  _handleDropFileInMessageInput = (item: any, monitor: DropTargetMonitor) => {
    if (monitor) {
      const { files } = monitor.getItem();
      const { current } = this._messageInputRef;
      if (current) {
        current.handleDropFile && current.handleDropFile(files);
      }
    }
  }

  render() {
    const { t, groupId, canPost } = this.props;

    return groupId ? (
      <DragDropContextProvider backend={HTML5Backend}>
        <JuiConversationPage
          className="conversation-page"
          data-group-id={groupId}
          data-test-automation-id="messagePanel"
        >
          <Header id={groupId} />
          <JuiDropZone
            accepts={[NativeTypes.FILE]}
            onDrop={this._handleDropFileInStream}
            dropzoneClass={StreamDropZoneClasses}
          >
            <JuiStreamWrapper>
              <Stream
                groupId={groupId}
                viewRef={this._streamRef}
                key={`Stream_${groupId}_${this.streamKey}`}
              />
              <div id="jumpToFirstUnreadButtonRoot" />
            </JuiStreamWrapper>
          </JuiDropZone>
          {canPost ? (
            <JuiDropZone
              accepts={[NativeTypes.FILE]}
              onDrop={this._handleDropFileInMessageInput}
              dropzoneClass={MessageInputDropZoneClasses}
            >
              <MessageInput
                viewRef={this._messageInputRef}
                id={groupId}
                onPost={this.sendHandler}
              />
            </JuiDropZone>
          ) : (
            <JuiDisabledInput text={t('disabledText')} />
          )}
          <AttachmentManager
            id={groupId}
            viewRef={this._attachmentManagerRef}
          />
        </JuiConversationPage>
      </DragDropContextProvider>
    ) : null;
  }
}

const ConversationPageView = translate('Conversations')(
  ConversationPageViewComponent,
);

export { ConversationPageView };
