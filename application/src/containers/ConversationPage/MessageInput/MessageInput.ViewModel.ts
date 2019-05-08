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
import { UploadRecentLogs, FeedbackService } from '@/modules/feedback';
import { container } from 'framework';
import { saveBlob } from '@/common/blobUtils';
import _ from 'lodash';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { analyticsCollector } from '@/AnalyticsCollector';
import { ConvertList, WhiteOnlyList } from 'jui/pattern/Emoji/excludeList';

const DEBUG_COMMAND_MAP = {
  '/debug': () => UploadRecentLogs.show(),
  '/debug-save': () => {
    // todo use schema
    // feedback://..., object;
    container
      .get(FeedbackService)
      .zipRecentLogs()
      .then(zipResult => {
        if (!zipResult) {
          mainLogger.debug('Zip log fail.');
          return;
        }
        const [name, blob] = zipResult;
        saveBlob(name, blob);
      });
  },
};

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
    this._postService = ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    );

    this._itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    this._groupConfigService = ServiceLoader.getInstance<GroupConfigService>(
      ServiceConfig.GROUP_CONFIG_SERVICE,
    );
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

  private _doToneTransfer = (colons: string) => {
    if (WhiteOnlyList.indexOf(colons.split('::')[0].replace(':', '')) > -1) {
      return colons.replace(/:skin-tone-+\d+:/g, '');
    }
    let newString: string = colons;
    const index = Number((newString.match(/\d/g) || []).pop()) - 1;
    newString = newString
      .replace('::skin-', '_')
      .replace('::skin', '')
      .replace(/\d+:/g, `${index.toString()}:`)
      .replace('tone_', 'tone')
      .replace('tone-', 'tone');
    return newString;
  }

  private _doUnderscoreTransfer = (colons: string) => {
    return colons.split('-').join('_');
  }

  @action
  insertEmoji = (emoji: any) => {
    console.log('nye insert emoji');
    let colons = emoji.colons;
    if (ConvertList.indexOf(colons.split(':').join('')) > -1) {
      colons = this._doUnderscoreTransfer(colons);
    }

    if (colons.indexOf('::skin') > -1) {
      colons = this._doToneTransfer(colons);
    }
    const query = '.conversation-page>div>div>.quill>.ql-container';
    const quill = (document.querySelector(query) as any).__quill;
    quill.focus();
    const index = quill.getSelection().index;

    quill.insertText(index, colons);
    setTimeout(() => {
      quill.focus();
      quill.setSelection(index + colons.length, 0);
    },         0);
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
    if (_.isEmpty(ids) && content && DEBUG_COMMAND_MAP[content.trim()]) {
      DEBUG_COMMAND_MAP[content.trim()]();
      this.contentChange('');
      return;
    }
    this.contentChange('');
    this.cleanDraft();
    const items = this.items;
    try {
      this._trackSendPost();
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

  private _trackSendPost() {
    const type = this.items.length ? 'file' : 'text';
    analyticsCollector.sendPost(
      'conversation thread',
      type,
      this._group.analysisType,
    );
  }
}

export { MessageInputViewModel, ERROR_TYPES, CONTENT_ILLEGAL, CONTENT_LENGTH };
