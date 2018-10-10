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

class ConversationPageViewModel extends AbstractViewModel {
  private _groupService: GroupService = GroupService.getInstance();
  private _stateService: StateService = StateService.getInstance();

  @observable
  private _permissions: PERMISSION_ENUM[] = [];

  @observable
  groupId: number;

  @computed
  get canPost() {
    return this._permissions.includes(PERMISSION_ENUM.TEAM_POST);
  }

  @action
  async onReceiveProps({ groupId }: ConversationPageProps) {
    if (groupId !== this.groupId && groupId) {
      const group = (await this._groupService.getById(groupId)) as Group;
      this._permissions = this._groupService.getPermissions(group);
      this.groupId = groupId;
      this._readGroup(groupId);
    }
  }

  private _readGroup(groupId: number) {
    this._stateService.markAsRead(groupId);
    this._stateService.updateLastGroup(groupId);
  }
}

export { ConversationPageViewModel };
