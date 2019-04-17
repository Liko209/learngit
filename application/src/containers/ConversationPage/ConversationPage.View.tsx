/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-08 09:21:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { NativeTypes } from 'react-dnd-html5-backend';
import { DropTargetMonitor } from 'react-dnd';
import {
  JuiConversationPage,
  JuiStreamWrapper,
} from 'jui/pattern/ConversationPage';
import { StreamDropZoneClasses } from 'jui/pattern/ConversationPage/StreamWrapper';
import { MessageInputDropZoneClasses } from 'jui/pattern/MessageInput/MessageInput';
import {
  JuiDropZone,
  withDragDropContext,
} from 'jui/pattern/MessageInput/DropZone';
import { JuiDisabledInput } from 'jui/pattern/DisabledInput';

import { Header } from './Header';
import { MessageInput } from './MessageInput';
import { MessageInputViewComponent } from './MessageInput/MessageInput.View';
import { ConversationPageViewProps, STATUS } from './types';
import { StreamViewComponent } from './Stream/Stream.View';
import { Stream } from './Stream';
import { AttachmentManager } from './MessageInput/Attachments';
import { AttachmentManagerViewComponent } from './MessageInput/Attachments/AttachmentManager.View';
import { withRouter } from 'react-router';
import { goToConversation } from '@/common/goToConversation';

const STREAM = 'stream';
const INPUT = 'input';

@observer
class ConversationPageViewComponent extends Component<
  ConversationPageViewProps
> {
  private _streamRef: RefObject<StreamViewComponent> = createRef();
  private _messageInputRef: RefObject<MessageInputViewComponent> = createRef();
  private _attachmentManagerRef: RefObject<
    AttachmentManagerViewComponent
  > = createRef();
  private _folderDetectMap: { string: boolean } = {} as { string: boolean };

  streamKey = 0;

  updateStatus = (status: STATUS) => {
    this.setState({ status });
  }

  sendHandler = () => {
    const stream = this._streamRef.current;
    if (!stream) {
      return;
    }
    if (stream.props.hasMore('down')) {
      goToConversation({ conversationId: this.props.groupId });
      this.remountStream();
    }
  }

  remountStream = () => {
    this.streamKey++;
    this.forceUpdate();
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

  private _preventStreamFolderDrop = () => {
    this._folderDetectMap[STREAM] = true;
  }

  private _preventInputFolderDrop = () => {
    this._folderDetectMap[INPUT] = true;
  }

  private _hookInitialPostsError = () => {
    this.updateStatus(STATUS.FAILED);
  }

  state = {
    status: STATUS.SUCCESS,
  };

  private get messageInput() {
    const { status } = this.state;
    const { t, groupId, canPost } = this.props;

    if (status === STATUS.FAILED) {
      return null;
    }

    if (!canPost) {
      return (
        <JuiDisabledInput
          data-test-automation-id="disabled-message-input"
          text={t('message.prompt.disabledText')}
        />
      );
    }

    return (
      <JuiDropZone
        accepts={[NativeTypes.FILE]}
        onDrop={this._handleDropFileInMessageInput}
        dropzoneClass={MessageInputDropZoneClasses}
        detectedFolderDrop={this._preventInputFolderDrop}
        hasDroppedFolder={() => this._folderDetectMap[INPUT]}
        clearFolderDetection={() => delete this._folderDetectMap[INPUT]}
      >
        <MessageInput
          viewRef={this._messageInputRef}
          id={groupId}
          onPost={this.sendHandler}
        />
      </JuiDropZone>
    );
  }

  render() {
    const { groupId, canPost, location } = this.props;
    const streamNode = (
      <JuiStreamWrapper>
        <Stream
          groupId={groupId}
          viewRef={this._streamRef}
          key={`Stream_${groupId}_${this.streamKey}`}
          refresh={this.remountStream}
          jumpToPostId={
            location.state ? location.state.jumpToPostId : undefined
          }
          hookInitialPostsError={this._hookInitialPostsError}
        />
        <div id="jumpToFirstUnreadButtonRoot" />
      </JuiStreamWrapper>
    );
    return groupId ? (
      <JuiConversationPage
        className="conversation-page"
        data-group-id={groupId}
        data-test-automation-id="messagePanel"
      >
        <Header id={groupId} />
        <JuiDropZone
          disabled={!canPost}
          accepts={[NativeTypes.FILE]}
          onDrop={this._handleDropFileInStream}
          dropzoneClass={StreamDropZoneClasses}
          detectedFolderDrop={this._preventStreamFolderDrop}
          hasDroppedFolder={() => this._folderDetectMap[STREAM]}
          clearFolderDetection={() => delete this._folderDetectMap[STREAM]}
        >
          {streamNode}
        </JuiDropZone>
        {this.messageInput}
        <AttachmentManager
          id={groupId}
          viewRef={this._attachmentManagerRef}
          forceSaveDraft={false}
        />
      </JuiConversationPage>
    ) : null;
  }
}

const ConversationPageView = withDragDropContext(
  withRouter(withTranslation('translations')(ConversationPageViewComponent)),
);

export { ConversationPageView };
