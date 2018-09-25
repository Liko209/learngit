/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-18 20:21:49
 * Copyright © RingCentral. All rights reserved.
 */

import { action, observable, computed } from 'mobx';
import { GroupService, PERMISSION_ENUM } from 'sdk/service';
import { Group } from 'sdk/models';

class ConversationPageViewModel {
  private _groupService: GroupService;
  @observable
  private _permissions: PERMISSION_ENUM[] = [];

  constructor() {
    this._groupService = new GroupService();
  }

  @action
  async init(id: number) {
    const group = (await this._groupService.getById(id)) as Group;
    this._permissions = this._groupService.getPermissions(group);
  }

  @computed
  get canPost() {
    return this._permissions.includes(PERMISSION_ENUM.TEAM_POST);
  }
}

export default ConversationPageViewModel;
