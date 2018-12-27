/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import { action, observable, computed } from 'mobx';
import {
  MessageInputProps,
  MessageInputViewProps,
  OnPostCallback,
} from './types';
import { PostService, GroupConfigService, ItemService } from 'sdk/service';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
import GroupModel from '@/store/models/Group';
import PersonModel from '@/store/models/Person';
import StoreViewModel from '@/store/ViewModel';
import { markdownFromDelta } from 'jui/pattern/MessageInput/markdown';
import { isAtMentions } from './handler';
import { Group, GroupConfig } from 'sdk/models';
import GroupConfigModel from '@/store/models/GroupConfig';

const CONTENT_LENGTH = 10000;
const CONTENT_ILLEGAL = '<script';
enum ERROR_TYPES {
  CONTENT_LENGTH = 'contentLength',
  CONTENT_ILLEGAL = 'contentIllegal',
}

class MessageInputViewModel extends StoreViewModel<MessageInputProps>
  implements MessageInputViewProps {
  private _postService: PostService;
  private _itemService: ItemService;

  private _onPostCallbacks: OnPostCallback[] = [];
  private _groupConfigService: GroupConfigService;
  @computed
  get id() {
    return this.props.id;
  }

  get items() {
    return this._itemService.getUploadItems(this.id);
  }

  private _oldId: number = this.id;

  @observable
  error: string = '';

  keyboardEventHandler = {
    enter: {
      key: 13,
      handler: this._enterHandler(this),
    },
  };

  constructor(props: MessageInputProps) {
    super(props);
    this._postService = PostService.getInstance();

    this._itemService = ItemService.getInstance();
    this._groupConfigService = GroupConfigService.getInstance();
    this._sendPost = this._sendPost.bind(this);
    this.reaction(
      () => this.id,
      () => {
        this._oldId = this.id;
        this.error = '';
        this.forceSaveDraft();
      },
    );
  }

  private _isEmpty = (content: string) => {
    const commentText = content.trim();
    const re = /^<p>(<br>|<br\/>|<br\s\/>|\s+|)<\/p>$/gm;
    return re.test(commentText);
  }

  @action
  contentChange = (draft: string) => {
    this.error = '';
    this.draft = this._isEmpty(draft) ? '' : draft;
  }

  forceSaveDraft = () => {
    const draft = this._isEmpty(this.draft) ? '' : this.draft;
    this._groupConfigService.updateDraft({
      draft,
      id: this._oldId,
    });
  }

  @computed
  get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.id);
  }

  @computed get _groupConfig() {
    return getEntity<GroupConfig, GroupConfigModel>(
      ENTITY_NAME.GROUP_CONFIG,
      this.id,
    );
  }

  @computed
  get draft() {
    return this._groupConfig.draft || '';
  }

  set draft(draft: string) {
    this._groupConfig.draft = draft;
  }

  @computed
  get _members() {
    return this._group.members;
  }

  @computed
  get _users() {
    return this._members.map((id: number) => {
      const { userDisplayName } = getEntity(
        ENTITY_NAME.PERSON,
        id,
      ) as PersonModel;
      return {
        id,
        display: userDisplayName,
      };
    });
  }

  @action
  private _enterHandler(vm: MessageInputViewModel) {
    return function () {
      // @ts-ignore
      const quill = (this as any).quill;
      const content = markdownFromDelta(quill.getContents());
      if (content.length > CONTENT_LENGTH) {
        vm.error = ERROR_TYPES.CONTENT_LENGTH;
        return;
      }
      if (content.includes(CONTENT_ILLEGAL)) {
        vm.error = ERROR_TYPES.CONTENT_ILLEGAL;
        return;
      }
      vm.error = '';
      const items = vm.items;
      if (content.trim() || items.length > 0) {
        vm._sendPost(content);
      }
    };
  }

  private async _sendPost(content: string) {
    this.contentChange('');
    this.forceSaveDraft();
    const atMentions = isAtMentions(content);
    const items = this.items;
    try {
      await this._postService.sendPost({
        atMentions,
        text: content,
        groupId: this.id,
        users: atMentions ? this._users : undefined,
        itemIds: items.map(item => item.id),
      });
      // clear context (attachments) after post
      //
      const onPostHandler = this.props.onPost;
      onPostHandler && onPostHandler();
      this._onPostCallbacks.forEach(callback => callback());
    } catch (e) {
      // You do not need to handle the error because the message will display a resend
    }
  }

  forceSendPost = () => {
    this._sendPost('');
  }

  addOnPostCallback = (callback: OnPostCallback) => {
    this._onPostCallbacks.push(callback);
  }
}

export { MessageInputViewModel, ERROR_TYPES, CONTENT_ILLEGAL, CONTENT_LENGTH };
