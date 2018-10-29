/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-10-29 10:00:00
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, action, observable } from 'mobx';
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

  @action
  async onReceiveProps() {
    const groups = await this._groupService.getGroupByPersonId(this.creator.id);
    this.creatorGroupId = groups[0].id;
  }
}

export { ConversationInitialPostViewModel };
