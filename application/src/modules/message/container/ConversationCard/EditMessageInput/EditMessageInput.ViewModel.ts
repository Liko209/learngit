/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-12-08 21:00:26
 * Copyright © RingCentral. All rights reserved.
 */

import { action, observable, computed } from 'mobx';
import { EditMessageInputProps, EditMessageInputViewProps } from './types';
import { PostService } from 'sdk/module/post';
import { getEntity } from '@/store/utils';
import storeManager from '@/store';
import { GLOBAL_KEYS, ENTITY_NAME } from '@/store/constants';
import PostModel from '@/store/models/Post';
import { Post } from 'sdk/module/post/entity';
import StoreViewModel from '@/store/ViewModel';
import { markdownFromDelta } from 'jui/pattern/MessageInput/markdown';
import Keys from 'jui/pattern/MessageInput/keys';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { catchError } from '@/common/catchError';

const CONTENT_LENGTH = 10000;
const CONTENT_ILLEGAL = '<script';
enum ERROR_TYPES {
  CONTENT_LENGTH = 'message.prompt.contentLength',
  CONTENT_ILLEGAL = 'message.prompt.contentIllegal',
}

class EditMessageInputViewModel extends StoreViewModel<EditMessageInputProps>
  implements EditMessageInputViewProps {
  private static _draftMap = new Map<number, string>();
  private _postService: PostService;
  @computed
  get id() {
    return this.props.id;
  }
  @observable
  error: string = '';
  keyboardEventHandler: {
    enter: {
      key: number;
      handler: () => void;
    };
    escape: {
      key: number;
      handler: () => void;
    };
  };

  constructor(props: EditMessageInputProps) {
    super(props);
    this._postService = ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    );
    this._exitEditMode = this._exitEditMode.bind(this);
    this._editPost = this._editPost.bind(this);
    this.saveDraft = this.saveDraft.bind(this);
    this.removeDraft = this.removeDraft.bind(this);

    this.keyboardEventHandler = {
      enter: {
        key: Keys.ENTER,
        handler: this._enterHandler(this),
      },
      escape: {
        key: Keys.ESCAPE,
        handler: this._escHandler(),
      },
    };
  }

  @computed
  private get _post() {
    return getEntity<Post, PostModel>(ENTITY_NAME.POST, this.id);
  }

  @computed
  get gid() {
    return this._post.groupId;
  }

  @computed
  get text() {
    return this._post.text;
  }

  @computed
  get draft() {
    const draftMap = EditMessageInputViewModel._draftMap;
    return draftMap.get(this.props.id) || '';
  }

  saveDraft(draft: string) {
    const draftMap = EditMessageInputViewModel._draftMap;
    draftMap.set(this.props.id, draft);
  }

  removeDraft() {
    const draftMap = EditMessageInputViewModel._draftMap;
    draftMap.delete(this.props.id);
  }

  @action
  private _enterHandler(vm: EditMessageInputViewModel) {
    return function () {
      // @ts-ignore
      const quill = (this as any).quill;
      const { content, mentionIds } = markdownFromDelta(quill.getContents());
      if (content.length > CONTENT_LENGTH) {
        vm.error = ERROR_TYPES.CONTENT_LENGTH;
        return;
      }
      if (content.includes(CONTENT_ILLEGAL)) {
        vm.error = ERROR_TYPES.CONTENT_ILLEGAL;
        return;
      }
      vm.error = '';
      if (content.trim()) {
        vm._editPost(content, mentionIds);
      }
      vm.removeDraft();
    };
  }

  private _escHandler() {
    return this._exitEditMode;
  }

  @action
  private _exitEditMode() {
    const globalStore = storeManager.getGlobalStore();
    const inEditModePostIds = globalStore.get(
      GLOBAL_KEYS.IN_EDIT_MODE_POST_IDS,
    );
    inEditModePostIds.splice(inEditModePostIds.indexOf(this.id), 1);
    globalStore.set(GLOBAL_KEYS.IN_EDIT_MODE_POST_IDS, [...inEditModePostIds]);
    this.removeDraft();
  }

  @catchError.flash({
    server: 'message.prompt.editPostFailedForServerIssue',
    network: 'message.prompt.editPostFailedForNetworkIssue',
    doGeneral: true,
  })
  private _handleEditPost(content: string, ids: number[]) {
    return this._postService.editPost({
      text: content,
      groupId: this.gid,
      postId: this.id,
      mentionNonItemIds: ids,
    });
  }

  private async _editPost(content: string, ids: number[]) {
    await this._handleEditPost(content, ids);
    this._exitEditMode();
  }
}

export {
  EditMessageInputViewModel,
  ERROR_TYPES,
  CONTENT_ILLEGAL,
  CONTENT_LENGTH,
};
