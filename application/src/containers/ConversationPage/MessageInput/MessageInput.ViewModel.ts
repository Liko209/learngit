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
import { GroupConfigService, notificationCenter } from 'sdk/service';
import { ItemService } from 'sdk/module/item';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
import GroupModel from '@/store/models/Group';
import PersonModel from '@/store/models/Person';
import StoreViewModel from '@/store/ViewModel';
import { markdownFromDelta } from 'jui/pattern/MessageInput/markdown';
import { Group } from 'sdk/module/group/entity';
import { UI_NOTIFICATION_KEY } from '@/constants';
import { mainLogger } from 'sdk';
import { PostService } from 'sdk/module/post';

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

  @observable
  private _memoryDraftMap: Map<number, string> = new Map();

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
    notificationCenter.on(UI_NOTIFICATION_KEY.QUOTE, ({ quote, groupId }) => {
      this._memoryDraftMap.set(groupId, quote);
    });
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

  @action
  cellWillChange = (newGroupId: number, oldGroupId: number) => {
    const draft = this._isEmpty(this._memoryDraftMap.get(oldGroupId) || '')
      ? ''
      : this._memoryDraftMap.get(oldGroupId) || '';
    this._groupConfigService.updateDraft({
      draft,
      id: oldGroupId,
    });
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

  @computed
  get draft() {
    if (this._memoryDraftMap.has(this.id)) {
      return this._memoryDraftMap.get(this.id) || '';
    }
    this.getDraftFromLocal();
    return '';
  }

  async getDraftFromLocal() {
    const draft = await this._groupConfigService.getDraft(this.id);
    this._memoryDraftMap.set(this.id, draft);
  }

  set draft(draft: string) {
    this._memoryDraftMap.set(this.id, draft);
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
      const items = vm.items;
      if (content.trim() || items.length > 0) {
        vm._sendPost(content, mentionIds);
      }
    };
  }

  private async _sendPost(content: string, ids: number[]) {
    this.contentChange('');
    this.forceSaveDraft();
    const items = this.items;
    try {
      let realContent: string = content;

      if (content.trim().length === 0) {
        realContent = '';
      }
      await this._postService.sendPost({
        text: realContent,
        groupId: this.id,
        itemIds: items.map(item => item.id),
        mentionNonItemIds: ids,
      });
      // clear context (attachments) after post
      //
      const onPostHandler = this.props.onPost;
      onPostHandler && onPostHandler();
      this._onPostCallbacks.forEach(callback => callback());
    } catch (e) {
      mainLogger.error(`send post error ${e}`);
      // You do not need to handle the error because the message will display a resend
    }
  }

  forceSendPost = () => {
    this._sendPost('', []);
  }

  addOnPostCallback = (callback: OnPostCallback) => {
    this._onPostCallbacks.push(callback);
  }
}

export { MessageInputViewModel, ERROR_TYPES, CONTENT_ILLEGAL, CONTENT_LENGTH };
