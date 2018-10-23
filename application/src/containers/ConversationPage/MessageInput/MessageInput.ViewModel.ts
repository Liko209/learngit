/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-28 16:29:03
 * Copyright © RingCentral. All rights reserved.
 */

import { action, observable, computed, when } from 'mobx';
import { Quill } from 'quill';
import { debounce, Cancelable } from 'lodash';
import { AbstractViewModel } from '@/base';
import { MessageInputProps, MessageInputViewProps } from './types';
import { GroupService, PostService } from 'sdk/service';
import { markdownFromDelta } from 'jui/pattern/MessageInput';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
import GroupModel from '@/store/models/Group';

const CONTENT_LENGTH = 10000;
const CONTENT_ILLEGAL = '<script';
enum ERROR_TYPES {
  CONTENT_LENGTH = 'contentLength',
  CONTENT_ILLEGAL = 'contentIllegal',
}

type DebounceFunction = (
  params: { id: number; draft: string },
) => Promise<boolean>;

class MessageInputViewModel extends AbstractViewModel
  implements MessageInputViewProps {
  private _groupService: GroupService;
  private _postService: PostService;
  private _debounceUpdateGroupDraft: DebounceFunction & Cancelable;
  private _isInit: boolean;
  @observable
  _id: number;
  @observable
  draft: string = '';
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
    this._groupService = GroupService.getInstance();
    this._postService = PostService.getInstance();
    this._debounceUpdateGroupDraft = debounce<DebounceFunction>(
      this._groupService.updateGroupDraft.bind(this._groupService),
      500,
    );
    this._sendPost = this._sendPost.bind(this);
    this._isInit = false;
  }

  onReceiveProps({ id }: MessageInputProps) {
    if (id !== this._id) {
      this._init(id);
    }
  }

  @action
  private _init(id: number) {
    this._id = id;
    if (this._isInit) {
      this.draft = this._initDraft;
    } else {
      this._isInit = true;
      when(
        () => !!this._initDraft,
        () => {
          this.draft = this._initDraft;
        },
      );
    }
  }

  @action
  changeDraft = (draft: string) => {
    this.error = '';
    // UI immediately sync
    this.draft = draft;
    // DB sync 500 ms later
    this._debounceUpdateGroupDraft({
      draft,
      id: this._id,
    });
  }

  forceSaveDraft = () => {
    // immediately save
    this._groupService.updateGroupDraft({
      draft: this.draft,
      id: this._id,
    });
  }

  @computed
  get _initDraft() {
    const groupEntity = getEntity(ENTITY_NAME.GROUP, this._id) as GroupModel;
    return groupEntity.draft || '';
  }

  @action
  private _enterHandler(vm: MessageInputViewModel) {
    return function () {
      // @ts-ignore
      const quill = (this as any).quill;
      const content = quill.getText() as string;
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
        vm._sendPost(quill);
        const onPostHandler = (vm.props as MessageInputProps).onPost;
        onPostHandler && onPostHandler();
      }
    };
  }

  private async _sendPost(quill: Quill) {
    const text = markdownFromDelta(quill.getContents());
    this.changeDraft('');
    try {
      await this._postService.sendPost({
        text,
        groupId: this._id,
      });
    } catch (e) {
      // You do not need to handle the error because the message will display a resend
    }
  }
}

export { MessageInputViewModel, ERROR_TYPES, CONTENT_ILLEGAL, CONTENT_LENGTH };
