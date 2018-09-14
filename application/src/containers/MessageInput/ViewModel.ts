/*
 * @Author: Devin Lin (devin.lin@ringcentral.com)
 * @Date: 2018-09-13 14:38:21
 * Copyright © RingCentral. All rights reserved.
 */

import { service } from 'sdk';
import { action, observable, computed, when } from 'mobx';
import { debounce, Cancelable } from 'lodash';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store/constants';
import GroupModel from '@/store/models/Group';

interface IParams {
  draft: string;
  id: number;
}

type DebounceFunction = (params: IParams) => Promise<boolean>;

class ViewModel {
  private _id: number;
  private _groupService: service.GroupService;
  private _debounceUpdateGroupDraft: DebounceFunction & Cancelable;
  @observable draft: string = '';

  constructor(id: number) {
    this._id = id;
    this._groupService = service.GroupService.getInstance();
    this._debounceUpdateGroupDraft = debounce<DebounceFunction>(this._groupService.updateGroupDraft, 500);
    when(
      () => !!this.initDraft,
      () => {
        this.draft = this.initDraft;
      },
    );

  }

  @action.bound
  changeDraft(draft: string) {
    this.draft = draft; // UI immediately sync
    this._debounceUpdateGroupDraft({ draft, id: this._id }); // DB sync 500 ms later
  }

  @computed get initDraft() {
    const groupEntity = getEntity(ENTITY_NAME.GROUP, this._id) as GroupModel;
    return groupEntity.draft || '';
  }
}

export default ViewModel;
