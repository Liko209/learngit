/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-13 14:38:21
 * Copyright © RingCentral. All rights reserved.
 */

import { service } from 'sdk';
import { action, observable, computed, when, IReactionDisposer } from 'mobx';
import { debounce } from 'lodash';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
import GroupModel from '@/store/models/Group';

class ViewModel {
  private _groupService: service.GroupService;
  private _id: number;
  private _disposer: IReactionDisposer;
  @observable draft: string = '';

  constructor(id: number) {
    this._groupService = service.GroupService.getInstance();
    this._id = id;
    this._disposer = when(
      () => !!this.initDraft,
      () => {
        this.draft = this.initDraft;
        this._disposer();
      },
    );
  }

  @action.bound
  changeDraft(draft: string) {
    this.draft = draft; // UI immediately sync
    const debounceUpdateGroupDraft = debounce(this._groupService.updateGroupDraft, 500); // DB sync 500 ms later
    debounceUpdateGroupDraft({ draft, id: this._id });
  }

  @computed get initDraft() {
    const groupEntity = getEntity(ENTITY_NAME.GROUP, this._id) as GroupModel;
    return groupEntity.draft || '';
  }
}

export default ViewModel;
