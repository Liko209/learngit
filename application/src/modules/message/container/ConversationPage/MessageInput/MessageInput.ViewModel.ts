/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import {
  action,
  runInAction,
  observable,
  computed,
} from 'mobx';
import {
  MessageInputProps,
  MessageInputViewProps,
  OnPostCallback,
} from './types';
import { notificationCenter } from 'sdk/service';
import { GroupConfigService } from 'sdk/module/groupConfig';
import { GroupService } from 'sdk/module/group';
import { ItemService } from 'sdk/module/item';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
import GroupModel from '@/store/models/Group';
import PersonModel from '@/store/models/Person';
import StoreViewModel from '@/store/ViewModel';
import { markdownFromDelta } from 'jui/pattern/MessageInput/markdown';
import { Group } from 'sdk/module/group/entity';
import { UI_NOTIFICATION_KEY } from '@/constants';
import {isMentionIdsContainTeam} from '../../ConversationCard/utils'
import { mainLogger } from 'foundation/log';
import { PostService } from 'sdk/module/post';
import { FileItem } from 'sdk/module/item/module/file/entity';
import { UploadRecentLogs, FeedbackService } from '@/modules/feedback';
import { container } from 'framework/ioc';
import _ from 'lodash';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { analyticsCollector } from '@/AnalyticsCollector';
import { SendTrigger } from '@/AnalyticsCollector/types';
import { ConvertList, WhiteOnlyList } from 'jui/pattern/Emoji/excludeList';
import { ZipItemLevel } from 'sdk/module/log/types';
import debounce from 'lodash/debounce';
import { isEmpty } from './helper';
import { DeltaStatic } from 'quill';

const DEBUG_COMMAND_MAP = {
  '/debug': () => UploadRecentLogs.show(),
  '/debug-all': () => UploadRecentLogs.show({ level: ZipItemLevel.DEBUG_ALL }),
  '/debug-save': () => {
    container.get(FeedbackService).saveRecentLogs(ZipItemLevel.NORMAL);
  },
  '/debug-save-all': () => {
    container.get(FeedbackService).saveRecentLogs(ZipItemLevel.DEBUG_ALL);
  },
};

const CONTENT_LENGTH = 10000;
const CONTENT_ILLEGAL = '<script';
const DRAFT_SAVE_WAIT: number = 1000;
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
  private _groupService: GroupService;
  private _trigger: SendTrigger;
  @observable
  private _memoryDraftMap: Map<number, string> = new Map();

  get items() {
    return this._itemService.getUploadItems(this.props.id);
  }
  private _rawDraft :string
  private _oldId: number;
  private _debounceFactor: number = 3e2;
  @observable
  error: string = '';

  private _upHandler = debounce(
    () => {
      this.props.onUpArrowPressed(this._rawDraft);
      return true;
    },
    this._debounceFactor,
    {
      leading: true,
    },
  );

  keyboardEventHandler: any = {
    enter: {
      key: 13,
      handler: this._enterHandler(this),
    },
    up: {
      key: 38,
      empty: true,
      handler: this._upHandler
    },
  };

  @observable
  hasFocused = false;

  constructor(props: MessageInputProps) {
    super(props);
    this._postService = ServiceLoader.getInstance<PostService>(
      ServiceConfig.POST_SERVICE,
    );

    this._groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );

    this._itemService = ServiceLoader.getInstance<ItemService>(
      ServiceConfig.ITEM_SERVICE,
    );
    this._groupConfigService = ServiceLoader.getInstance<GroupConfigService>(
      ServiceConfig.GROUP_CONFIG_SERVICE,
    );
    this._oldId = props.id;
    this.reaction(
      () => this.props.id,
      (id: number) => {
        this._oldId = id;
        this.hasFocused = false;
        this.error = '';
        this.forceSaveDraft();
      },
    );
    this.reaction(() => ({
      hasDraft: this._memoryDraftMap.has(this.props.id),
    }), ({ hasDraft }) => {
      setTimeout(() => this.hasFocused = hasDraft, 0);
    });
    notificationCenter.on(UI_NOTIFICATION_KEY.QUOTE, this._handleQuoteChanged);
    window.addEventListener(
      'beforeunload',
      this._handleBeforeUnload,
    );
  }

  dispose = () => {
    notificationCenter.off(UI_NOTIFICATION_KEY.QUOTE, this._handleQuoteChanged);
    window.removeEventListener(
      'beforeunload',
      this._handleBeforeUnload,
    );

    this.keyboardEventHandler.up.handler.cancel();
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

  private _doUnderscoreTransfer = (colons: string) => colons.split('-').join('_')

  @action
  insertEmoji = (emoji: any, cb: Function) => {
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
    }, 0);
    cb && cb();
  }

  @action
  contentChange = (draft: string) => {
    this._rawDraft = draft;
    if ((isEmpty(draft) && isEmpty(this.draft)) || draft === this.draft) {
      return;
    }
    this.error = '';
    this.draft = draft;
    this._groupService.sendTypingEvent(this._oldId, isEmpty(draft));
    this._handleDraftSave()
  }

  @action
  cellWillChange = (newGroupId: number, oldGroupId: number) => {
    const draft = isEmpty(this._memoryDraftMap.get(oldGroupId) || '')
      ? ''
      : this._memoryDraftMap.get(oldGroupId) || '';
    this._groupConfigService.updateDraft({
      draft,
      id: oldGroupId,
    });
  }

  @action
  forceSaveDraft = async() => {
    const draft = isEmpty(this.draft) ? '' : this.draft;
    this._memoryDraftMap.set(this.props.id, draft);
    await this._groupConfigService.updateDraft({
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
  private get _group() {
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

  getDraftFromLocal = async () => {
    const draft = await this._groupConfigService.getDraft(this.props.id);
    runInAction(() => {
      this.draft = draft;
    });
  }

  set draft(draft: string) {
    this._memoryDraftMap.set(this.props.id, draft);
  }

  @computed
  get hasInput() {
    return !isEmpty(this.draft);
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
      vm.handleContentSent('enter', quill.getContents());
    };
  }

  handleContentSent = (trigger: SendTrigger, contents: DeltaStatic) => {
    this._trigger = trigger;
    const { content, mentionIds } = markdownFromDelta(contents);
    const mentionIdsContainTeam = isMentionIdsContainTeam(mentionIds);
    if (content.length > CONTENT_LENGTH) {
      this.error = ERROR_TYPES.CONTENT_LENGTH;
      return;
    }
    if (content.includes(CONTENT_ILLEGAL)) {
      this.error = ERROR_TYPES.CONTENT_ILLEGAL;
      return;
    }
    this.error = '';
    const items = this.items;
    if (content.trim() || items.length > 0) {
      this._sendPost(content, mentionIds, mentionIdsContainTeam);
    }
  }

  private _sendPost = async (content: string, ids: number[], containsTeamMention: boolean) => {
    if (_.isEmpty(ids) && content && DEBUG_COMMAND_MAP[content.trim()]) {
      DEBUG_COMMAND_MAP[content.trim()]();
      this.contentChange('');
      return;
    }
    this.contentChange('');
    this.cleanDraft();
    const items = this.items;
    try {
      this._trackSendPost(containsTeamMention);
      const realContent: string = content.trim();
      await this._postService.sendPost({
        text: realContent,
        groupId: this.props.id,
        itemIds: items.map((item: FileItem) => item.id),
        mentionNonItemIds: ids,
        isTeamMention: containsTeamMention,
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
    this._sendPost('', [],false);
  }

  addOnPostCallback = (callback: OnPostCallback) => {
    this._onPostCallbacks.push(callback);
  }

  @action
  private _trackSendPost(containsTeamMention:boolean) {
    const type = this.items.length ? 'file' : 'text';
    const isAtTeam = containsTeamMention ? 'yes' : 'no'
    analyticsCollector.sendPost(
      this._trigger,
      'conversation thread',
      type,
      this._group.analysisType,
      isAtTeam,
    );
  }

  private _handleDraftSave = debounce(() => {
    this.forceSaveDraft();
  }, DRAFT_SAVE_WAIT)

  private _handleBeforeUnload = () => {
    this._handleDraftSave.cancel()
    this.forceSaveDraft();
  }

}

export {
  MessageInputViewModel, ERROR_TYPES, CONTENT_ILLEGAL, CONTENT_LENGTH,
};
