/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-12-08 21:00:26
 * Copyright © RingCentral. All rights reserved.
 */
import Quill from 'quill';
import { IMessageService } from '@/modules/message/interface';
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
import { Dialog } from '@/containers/Dialog';
import i18nT from '@/utils/i18nT';
import { TypeDictionary } from 'sdk/utils';
import { ItemService } from 'sdk/module/item';
import { isMentionIdsContainTeam } from '../utils';

const CONTENT_LENGTH = 10000;
const CONTENT_ILLEGAL = '<script';
enum ERROR_TYPES {
  CONTENT_LENGTH = 'message.prompt.contentLength',
  CONTENT_ILLEGAL = 'message.prompt.contentIllegal',
}

class EditMessageInputViewModel extends StoreViewModel<EditMessageInputProps>
  implements EditMessageInputViewProps {
  @IMessageService private _messageService: IMessageService;
  private _postService: PostService;
  private _itemService = ServiceLoader.getInstance<ItemService>(
    ServiceConfig.ITEM_SERVICE,
  );

  @observable error: string = '';

  @computed get id() {
    return this.props.id;
  }

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
        handler: this._buildEnterHandler(),
      },
      escape: {
        key: Keys.ESCAPE,
        handler: this._buildEscHandler(),
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
    return this._messageService.getDraft(this.props.id);
  }
  @action
  saveDraft(draft: string) {
    return this._messageService.enterEditMode(this.props.id, draft);
  }
  @action
  removeDraft() {
    return this._messageService.leaveEditMode(this.props.id);
  }

  @computed
  get _itemLinks() {
    const { itemTypeIds } = this._post;
    return itemTypeIds && itemTypeIds[TypeDictionary.TYPE_ID_LINK];
  }

  @computed
  get _onlyExistLink() {
    const { itemTypeIds } = this._post;
    return this._itemLinks && Object.keys(itemTypeIds as object).length === 1;
  }

  @action
  private _buildEnterHandler = () => {
    const self = this;

    return function(this: any) {
      const quill: Quill = this.quill;
      const { content, mentionIds } = markdownFromDelta(quill.getContents());
      const mentionIdsContainTeam = isMentionIdsContainTeam(mentionIds);
      if (content.length > CONTENT_LENGTH) {
        self.error = ERROR_TYPES.CONTENT_LENGTH;
        return;
      }
      if (content.includes(CONTENT_ILLEGAL)) {
        self.error = ERROR_TYPES.CONTENT_ILLEGAL;
        return;
      }
      self.error = '';
      const value = content.trim();

      if (!value && self._itemLinks) {
        // The post is deleted if the post only contains a link
        if (self._onlyExistLink) {
          self._handleDelete();
        } else {
          // The link card should be deleted if one post with other files
          self._itemLinks.forEach((id: number) => {
            self._itemService.deleteItem(id);
          });
          self._editPost(value, mentionIds, mentionIdsContainTeam);
        }
      } else if (value || self._post.itemIds.length) {
        self._editPost(value, mentionIds, mentionIdsContainTeam);
      } else {
        self._handleDelete();
      }
      self.removeDraft();
    };
  };

  private _buildEscHandler = () => this._exitEditMode;

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
  })
  @action
  private async _handleEditPost(
    content: string,
    ids: number[],
    mentionIdsContainTeam: boolean,
  ) {
    await this._postService.editPost({
      text: content,
      groupId: this.gid,
      postId: this.id,
      mentionNonItemIds: ids,
      isTeamMention: mentionIdsContainTeam,
    });
  }

  private _editPost(
    content: string,
    ids: number[],
    mentionIdsContainTeam: boolean,
  ) {
    this._exitEditMode();
    this._handleEditPost(content, ids, mentionIdsContainTeam);
  }

  @catchError.flash({
    server: 'message.prompt.deletePostFailedForServerIssue',
    network: 'message.prompt.deletePostFailedForNetworkIssue',
  })
  private _deletePost = async () => {
    await this._postService.deletePost(this.id);
  };

  private _handleDelete = async () => {
    Dialog.confirm({
      modalProps: { 'data-test-automation-id': 'deleteConfirmDialog' },
      okBtnProps: { 'data-test-automation-id': 'deleteOkButton' },
      cancelBtnProps: { 'data-test-automation-id': 'deleteCancelButton' },
      title: await i18nT('message.prompt.deletePostTitle'),
      content: await i18nT('message.prompt.deletePostContent'),
      okText: await i18nT('common.dialog.delete'),
      okType: 'negative',
      cancelText: await i18nT('common.dialog.cancel'),
      onOK: () => {
        this._deletePost();
      },
    });
  };
}

export {
  EditMessageInputViewModel,
  ERROR_TYPES,
  CONTENT_ILLEGAL,
  CONTENT_LENGTH,
};
