/*
 * @Author: Valor Lin (valor.lin@ringcentral.com)
 * @Date: 2018-11-08 09:21:02
 * Copyright © RingCentral. All rights reserved.
 */
/* eslint-disable */
import React, { Component, RefObject, createRef } from 'react';
import { observer } from 'mobx-react';
import { withTranslation } from 'react-i18next';
import { NativeTypes } from 'react-dnd-html5-backend';
import { DropTargetMonitor } from 'react-dnd';
import {
  JuiConversationPage,
  JuiStreamWrapper
} from 'jui/pattern/ConversationPage';
import { StreamDropZoneClasses } from 'jui/pattern/ConversationPage/StreamWrapper';
import { MessageInputDropZoneClasses } from 'jui/pattern/MessageInput/MessageInput';
import {
  JuiDropZone,
  withDragDropContext
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
import findLastIndex from 'lodash/findLastIndex';
import { ENTITY_NAME } from '@/store';
import { GLOBAL_KEYS } from '@/store/constants';
import { getEntity, getGlobalValue } from '@/store/utils';
import PostModel from '../../../../store/models/Post';
import { Post } from 'sdk/module/post/entity/Post';
import { StreamItem } from './Stream/types';
import storeManager from '@/store/base/StoreManager';
import { jumpToPost } from '@/common/jumpToPost';
import { StreamItemType } from '@/modules/message/container/ConversationPage/Stream/types';
import { IMessageService } from '@/modules/message/interface';
import { isEditable } from '../ConversationCard/utils/index';
import { isMultipleLine } from './MessageInput/helper';

const STREAM = 'stream';
const INPUT = 'input';

@observer
class ConversationPageViewComponent extends Component<
  ConversationPageViewProps
> {
  @IMessageService private _messageService: IMessageService;

  private _streamRef: RefObject<StreamViewComponent> = createRef();
  private _messageInputRef: RefObject<MessageInputViewComponent> = createRef();
  private _attachmentManagerRef: RefObject<
    AttachmentManagerViewComponent
  > = createRef();
  private _folderDetectMap: { string: boolean } = {} as { string: boolean };

  streamKey = 0;

  sendHandler = () => {
    const stream = this._streamRef.current;
    if (!stream) {
      return;
    }
    if (stream.props.hasMore('down')) {
      goToConversation({ conversationId: this.props.groupId });
      this.remountStream();
    }
  };

  remountStream = () => {
    this.streamKey++;
    this.forceUpdate();
  };

  _handleDropFileInStream = (item: any, monitor: DropTargetMonitor) => {
    if (monitor) {
      const { files } = monitor.getItem();
      const { current } = this._attachmentManagerRef;
      if (current) {
        current.directPostFiles && current.directPostFiles(files);
      }
    }
  };

  _handleDropFileInMessageInput = (item: any, monitor: DropTargetMonitor) => {
    if (monitor) {
      const { files } = monitor.getItem();
      const { current } = this._messageInputRef;
      if (current) {
        current.handleDropFile && current.handleDropFile(files);
      }
    }
  };

  private _preventStreamFolderDrop = () => {
    this._folderDetectMap[STREAM] = true;
  };

  private _preventInputFolderDrop = () => {
    this._folderDetectMap[INPUT] = true;
  };

  private _editLastPost = (content:string) => {
    if (isMultipleLine(content)){
      return;
    }
    const stream = this._streamRef.current;
    if (!stream) {
      return;
    }
    const { items } = stream.props;
    const uid = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    const lastPostIndex = findLastIndex(items, (item: StreamItem) => {
      const { value: id, type } = item;
      if (!id || type !== StreamItemType.POST) {
        return false;
      }
      const post = getEntity<Post, PostModel>(ENTITY_NAME.POST, id);
      const { creatorId, text } = post;
      return !!(creatorId === uid && text.trim() && isEditable(post));
    });
    if (~lastPostIndex) {
      const postId = items[lastPostIndex].value as number;
      const editPostIds = getGlobalValue(GLOBAL_KEYS.IN_EDIT_MODE_POST_IDS);
      jumpToPost({ id: postId, groupId: this.props.groupId });
      storeManager
        .getGlobalStore()
        .set(GLOBAL_KEYS.IN_EDIT_MODE_POST_IDS, [...editPostIds, postId]);
      this._messageService.setEditInputFocus(postId);
    }
  };

  private _hasDroppedFolder = () => this._folderDetectMap[STREAM];

  private _clearFolderDetection = () => { 
    delete this._folderDetectMap[STREAM]
  }

  private get messageInput() {
    const { t, groupId, canPost, loadingStatus } = this.props;

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
        disabled={loadingStatus !== STATUS.SUCCESS}
        hidden={loadingStatus !== STATUS.SUCCESS}
        accepts={[NativeTypes.FILE]}
        onDrop={this._handleDropFileInMessageInput}
        dropzoneClass={MessageInputDropZoneClasses}
        detectedFolderDrop={this._preventInputFolderDrop}
        hasDroppedFolder={this._hasDroppedFolder}
        clearFolderDetection={this._clearFolderDetection}
      >
        <MessageInput
          viewRef={this._messageInputRef}
          id={groupId}
          onPost={this.sendHandler}
          onUpArrowPressed={this._editLastPost}
        />
      </JuiDropZone>
    );
  }

  componentWillUnmount() {
    delete this._clearFolderDetection;
  }

  render() {
    const { groupId, canPost, location, updateStatus } = this.props;
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
          updateConversationStatus={updateStatus}
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
          hasDroppedFolder={this._hasDroppedFolder}
          clearFolderDetection={this._clearFolderDetection}
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
  withRouter(withTranslation('translations')(ConversationPageViewComponent))
);

export { ConversationPageView };
