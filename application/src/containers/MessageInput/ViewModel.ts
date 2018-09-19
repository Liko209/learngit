/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-13 14:38:21
 * Copyright © RingCentral. All rights reserved.
 */

import { action, observable, computed, when } from 'mobx';
import { debounce } from 'lodash';
import { Quill } from 'quill';
import { GroupService, PostService } from 'sdk/service';
import { markdownFromDelta } from 'ui-components/MessageInput';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
import GroupModel from '@/store/models/Group';

class ViewModel {
  private _groupService: GroupService;
  private _postService: PostService;
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

  constructor() {
    this._groupService = GroupService.getInstance();
    this._postService = PostService.getInstance();

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
    this.draft = draft; // UI immediately sync
    const debounceUpdateGroupDraft = debounce(
      this._groupService.updateGroupDraft,
      500,
    ); // DB sync 500 ms later
    debounceUpdateGroupDraft({ draft, id: this._id });
  }

  @computed
  get initDraft() {
    const groupEntity = getEntity(ENTITY_NAME.GROUP, this._id) as GroupModel;
    return groupEntity.draft || '';
  }

  private _enterHandler(vm: ViewModel) {
    return function () {
      // @ts-ignore
      const quill = (this as any).quill;
      if (quill.getText().trim()) {
        vm.sendPost(quill);
      }
    };
  }

  async sendPost(quill: Quill) {
    const text = markdownFromDelta(quill.getContents());
    this.changeDraft('');
    await this._postService.sendPost({
      text,
      groupId: this._id,
    });
  }
}

export default ViewModel;
