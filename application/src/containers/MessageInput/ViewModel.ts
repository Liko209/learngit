/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-13 14:38:21
 * Copyright © RingCentral. All rights reserved.
 */

import { action, observable, computed, when } from 'mobx';
import { Quill } from 'quill';
import { GroupService, PostService } from 'sdk/service';
import { markdownFromDelta } from 'ui-components/MessageInput';
import { debounce, Cancelable } from 'lodash';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
import GroupModel from '@/store/models/Group';

interface IParams {
  draft: string;
  id: number;
}

type DebounceFunction = (params: IParams) => Promise<boolean>;

const CONTENT_LENGTH = 10000;
const CONTENT_ILLEGAL = '<script';

enum ERROR_TYPES {
  CONTENT_LENGTH = 'contentLength',
  CONTENT_ILLEGAL = 'contentIllegal',
}

class ViewModel {
  private _groupService: GroupService;
  private _postService: PostService;
  private _debounceUpdateGroupDraft: DebounceFunction & Cancelable;
  @observable
  private _id: number;
  private _init: boolean;
  keyboardEventHandler = {
    enter: {
      key: 13,
      handler: this._enterHandler(this),
    },
  };
  @observable
  draft: string = '';
  @observable
  error: string;

  constructor() {
    this._groupService = GroupService.getInstance();
    this._postService = PostService.getInstance();
    this._debounceUpdateGroupDraft = debounce<DebounceFunction>(
      this._groupService.updateGroupDraft,
      500,
    );

    this.sendPost = this.sendPost.bind(this);

    this._init = false;
  }

  @action
  init(id: number) {
    this._id = id;
    if (this._init) {
      this.draft = this.initDraft;
    } else {
      this._init = true;
      when(
        () => !!this.initDraft,
        () => {
          this.draft = this.initDraft;
        },
      );
    }
  }

  @action.bound
  changeDraft(draft: string) {
    this.error = '';
    this.draft = draft; // UI immediately sync
    this._debounceUpdateGroupDraft({ draft, id: this._id }); // DB sync 500 ms later
  }

  forceSaveDraft() {
    this._groupService.updateGroupDraft({ draft: this.draft, id: this._id }); // immediately save
  }

  @computed
  get initDraft() {
    const groupEntity = getEntity(ENTITY_NAME.GROUP, this._id) as GroupModel;
    return groupEntity.draft || '';
  }

  @action
  private _enterHandler(vm: ViewModel) {
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
        vm.sendPost(quill);
      }
    };
  }

  async sendPost(quill: Quill) {
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

export default ViewModel;
