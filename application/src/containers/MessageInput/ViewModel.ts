/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-13 14:38:21
 * Copyright © RingCentral. All rights reserved.
 */

import { action, observable, computed, when } from 'mobx';
import { debounce } from 'lodash';
import { Quill } from 'react-quill';
import { GroupService, PostService } from 'sdk/service';
import { markdownFromDelta } from 'ui-components/MessageInput';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
import GroupModel from '@/store/models/Group';

class ViewModel {
  private _groupService: GroupService;
  private _postService: PostService;
  private _id: number;
  private _editor: Quill;
  @observable
  draft: string = '';

  constructor(id: number) {
    this._groupService = GroupService.getInstance();
    this._postService = PostService.getInstance();
    this._id = id;
    when(
      () => !!this.initDraft,
      () => {
        this.draft = this.initDraft;
      },
    );

    this._enterHandler = this._enterHandler.bind(this);
    this.setEditor = this.setEditor.bind(this);
    this.getKeyboardEvent = this.getKeyboardEvent.bind(this);
  }

  @action.bound
  changeDraft(draft: string, editor: any) {
    this.draft = draft; // UI immediately sync
    this._editor = editor;
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

  private _enterHandler(groupId: number) {
    if (this.draft) {
      this.sendPost(groupId);
    }
  }

  @action.bound
  async sendPost(groupId: number) {
    this.draft = '';
    const text = markdownFromDelta(this._editor.getContents());
    await this._postService.sendPost({
      groupId,
      text,
    });
  }

  getKeyboardEvent(groupId: number) {
    return {
      enter: {
        key: 13,
        handler: () => this._enterHandler(groupId),
      },
    };
  }

  setEditor(editor: Quill) {
    this._editor = editor;
  }
}

export default ViewModel;
