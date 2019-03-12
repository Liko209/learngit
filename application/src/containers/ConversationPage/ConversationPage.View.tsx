/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-08 09:21:02
 * Copyright © RingCentral. All rights reserved.
 */
import React, { Component, RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import { translate } from 'react-i18next';
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
import { ConversationPageViewProps } from './types';
import { action, observable, reaction } from 'mobx';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';

import { StreamViewComponent } from './Stream/Stream.View';
import { Stream } from './Stream';
import { AttachmentManager } from './MessageInput/Attachments';
import { AttachmentManagerViewComponent } from './MessageInput/Attachments/AttachmentManager.View';

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

  @observable
  streamKey = 0;
  constructor(props: ConversationPageViewProps) {
    super(props);
    reaction(
      () => getGlobalValue(GLOBAL_KEYS.JUMP_TO_POST_ID),
      () => {
        const id = getGlobalValue(GLOBAL_KEYS.JUMP_TO_POST_ID);
        if (id !== 0) {
          this.remountStream();
        }
      },
    );
  }
  sendHandler = () => {
    const stream = this._streamRef.current;
    if (!stream) {
      return;
    }
    if (stream.props.hasMore('down')) {
      this.remountStream();
    }
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

  private _preventStreamFolderDrop = () => {
    this._folderDetectMap[STREAM] = true;
  }

  private _preventInputFolderDrop = () => {
    this._folderDetectMap[INPUT] = true;
  }

  render() {
    const { t, groupId, canPost } = this.props;
    const streamNode = (
      <JuiStreamWrapper>
        <Stream
          groupId={groupId}
          viewRef={this._streamRef}
          key={`Stream_${groupId}_${this.streamKey}`}
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
        {canPost ? (
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
        ) : (
          <JuiDisabledInput
            data-test-automation-id="disabled-message-input"
            text={t('message.prompt.disabledText')}
          />
        )}
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
  translate('translations')(ConversationPageViewComponent),
);

export { ConversationPageView };
