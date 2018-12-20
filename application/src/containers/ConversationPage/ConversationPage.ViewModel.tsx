/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-18 20:21:49
 * Copyright © RingCentral. All rights reserved.
 */

import { action, observable, computed } from 'mobx';
import { GroupService, StateService } from 'sdk/service';
import { Group } from 'sdk/models';
import { getEntity } from '@/store/utils';
import { AbstractViewModel } from '@/base';
import GroupModel from '@/store/models/Group';
import { ENTITY_NAME } from '@/store';
import { ConversationPageProps } from './types';
import _ from 'lodash';

class ConversationPageViewModel extends AbstractViewModel {
  private _groupService: GroupService = GroupService.getInstance();
  private _stateService: StateService = StateService.getInstance();

  private _throttledUpdateLastGroup = _.wrap(
    _.throttle(
      (groupId: number) => {
        this._stateService.updateLastGroup(groupId);
      },
      3000,
      { trailing: true, leading: false },
    ),
    (func, groupId: number) => {
      return func(groupId);
    },
  );

  @observable
  groupId: number;

  @computed
  private get _group() {
    return this.groupId
      ? getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, this.groupId)
      : ({} as GroupModel);
  }

  @computed
  get canPost() {
    return this._group.canPost;
  }

  @action
  async onReceiveProps({ groupId }: ConversationPageProps) {
    if (!_.isEqual(groupId, this.groupId) && groupId) {
      const group = (await this._groupService.getById(groupId)) as Group;
      this.groupId = group.id;
      this.groupId && this._readGroup(groupId);
    }
  }

  private async _readGroup(groupId: number) {
    this._throttledUpdateLastGroup(groupId);
  }
}

export { ConversationPageViewModel };
