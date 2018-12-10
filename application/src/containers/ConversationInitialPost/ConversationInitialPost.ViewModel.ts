/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-29 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, action, observable } from 'mobx';
import { TranslationFunction } from 'i18next';
import { ConversationInitialPostViewProps } from './types';
import { service } from 'sdk';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import GroupModel from '@/store/models/Group';
import StoreViewModel from '@/store/ViewModel';

const { GroupService } = service;

class ConversationInitialPostViewModel extends StoreViewModel<
  ConversationInitialPostViewProps
> {
  t: TranslationFunction;
  private _groupService: service.GroupService = GroupService.getInstance();
  @observable
  creatorGroupId: number;

  @computed
  get groupId() {
    return this.props.id;
  }

  @computed
  private get _group() {
    return getEntity(ENTITY_NAME.GROUP, this.groupId) as GroupModel;
  }

  @computed
  get displayName() {
    const arr = String(this._group.displayName).split(',');
    if (arr.length > 1) {
      arr.splice(
        arr.length - 2,
        2,
        `${arr[arr.length - 2]} and ${arr[arr.length - 1]}`,
      );
      return arr.join(',');
    }
    return this._group.displayName;
  }

  @computed
  get groupType() {
    return this._group.type;
  }

  @computed
  get groupDescription() {
    return this._group.description;
  }

  @computed
  get creator() {
    return this._group.creator;
  }

  @computed
  get isTeam() {
    return this._group.isTeam;
  }

  @action
  async onReceiveProps() {
    const result = await this._groupService.getGroupByPersonId(this.creator.id);
    if (result.isOk()) {
      this.creatorGroupId = result.data.id;
    }
  }
}

export { ConversationInitialPostViewModel };
