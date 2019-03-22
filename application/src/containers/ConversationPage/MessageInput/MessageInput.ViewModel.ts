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
import { notificationCenter } from 'sdk/service';
import { GroupConfigService } from 'sdk/module/groupConfig';
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
import { FileItem } from 'sdk/module/item/module/file/entity';

const CONTENT_LENGTH = 10000;
const CONTENT_ILLEGAL = '<script';
enum ERROR_TYPES {
  CONTENT_LENGTH = 'message.prompt.contentLength',
  CONTENT_ILLEGAL = 'message.prompt.contentIllegal',
}

class MessageInputViewModel extends StoreViewModel<MessageInputProps>
  implements MessageInputViewProps {
  private _postService: PostService;
  private _itemService: ItemService;

  private _onPostCallbacks: OnPostCallback[] = [];
  private _groupConfigService: GroupConfigService;

  @observable
  private _memoryDraftMap: Map<number, string> = new Map();

  get items() {
    return this._itemService.getUploadItems(this.props.id);
  }

  private _oldId: number;

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
    this._oldId = props.id;
    this.reaction(
      () => this.props.id,
      (id: number) => {
        this._oldId = id;
        this.error = '';
        this.forceSaveDraft();
      },
    );
    notificationCenter.on(UI_NOTIFICATION_KEY.QUOTE, this._handleQuoteChanged);
  }

  dispose = () => {
    notificationCenter.off(UI_NOTIFICATION_KEY.QUOTE, this._handleQuoteChanged);
  }

  @action
  private _handleQuoteChanged = ({
    quote,
    groupId,
  }: {
    quote: string;
    groupId: number;
  }) => {
    this._memoryDraftMap.set(groupId, quote);
  }

  private _isEmpty = (content: string) => {
    const commentText = content.trim();
    const re = /^(<p>(<br>|<br\/>|<br\s\/>|\s+|)<\/p>)+$/gm;
    return re.test(commentText);
  }

  @action
  contentChange = (draft: string) => {
    this.error = '';
    this.draft = draft;
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
    this._memoryDraftMap.set(this.props.id, draft);
    this._groupConfigService.updateDraft({
      draft,
      id: this._oldId,
    });
  }

  cleanDraft = () => {
    this._groupConfigService.updateDraft({
      draft: '',
      id: this._oldId,
      attachment_item_ids: [],
    });
  }

  @computed
  get _group() {
    return getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.props.id);
  }

  @computed
  get draft() {
    if (this._memoryDraftMap.has(this.props.id)) {
      return this._memoryDraftMap.get(this.props.id) || '';
    }
    this.getDraftFromLocal();
    return '';
  }

  async getDraftFromLocal() {
    const draft = await this._groupConfigService.getDraft(this.props.id);
    this._memoryDraftMap.set(this.props.id, draft);
  }

  set draft(draft: string) {
    this._memoryDraftMap.set(this.props.id, draft);
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
    this.cleanDraft();
    const items = this.items;
    try {
      let realContent: string = content;

      if (content.trim().length === 0) {
        realContent = '';
      }
      await this._postService.sendPost({
        text: realContent,
        groupId: this.props.id,
        itemIds: items.map((item: FileItem) => item.id),
        mentionNonItemIds: ids,
      });
      // clear context (attachments) after post
      //
      this._onPostCallbacks.forEach((callback: OnPostCallback) => callback());
    } catch (e) {
      mainLogger.error(`send post error ${e}`);
      // You do not need to handle the error because the message will display a resend
    } finally {
      const onPostHandler = this.props.onPost;
      onPostHandler && onPostHandler();
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
