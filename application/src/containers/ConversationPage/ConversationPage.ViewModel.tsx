/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-18 20:21:49
 * Copyright © RingCentral. All rights reserved.
 */

import { action, observable, computed } from 'mobx';
import { GroupService, StateService, PERMISSION_ENUM } from 'sdk/service';
import { Group } from 'sdk/models';
import { AbstractViewModel } from '@/base';
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
  private _permissions: PERMISSION_ENUM[] = [];

  @observable
  groupId: number;

  @computed
  get canPost() {
    if (this._permissions.length === 0) {
      return true;
    }
    return this._permissions.includes(PERMISSION_ENUM.TEAM_POST);
  }

  @action
  async onReceiveProps({ groupId }: ConversationPageProps) {
    if (!_.isEqual(groupId, this.groupId) && groupId) {
      this.groupId = groupId;
      const group = (await this._groupService.getById(groupId)) as Group;
      this._permissions = this._groupService.getPermissions(group);
      this._readGroup(groupId);
    }
  }

  private async _readGroup(groupId: number) {
    this._throttledUpdateLastGroup(groupId);
  }
}

export { ConversationPageViewModel };
