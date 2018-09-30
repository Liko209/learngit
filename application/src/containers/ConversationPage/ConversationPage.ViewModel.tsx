/*
 * @Author: Jeffrey Huang(jeffrey.huang@ringcentral.com)
 * @Date: 2018-09-18 20:21:49
 * Copyright © RingCentral. All rights reserved.
 */

import { action, observable, computed } from 'mobx';
import { GroupService, PERMISSION_ENUM } from 'sdk/service';
import { Group } from 'sdk/models';
import { AbstractViewModel } from '@/base';

class ConversationPageViewModel extends AbstractViewModel {
  private _groupService: GroupService = new GroupService();
  @observable
  private _permissions: PERMISSION_ENUM[] = [];
  @observable
  id: number;

  @action
  async onReceiveProps({ id }: { id: number }) {
    if (id !== this.id && id) {
      const group = (await this._groupService.getById(id)) as Group;
      this._permissions = this._groupService.getPermissions(group);
      this.id = id;
    }
  }

  @computed
  get canPost() {
    return this._permissions.includes(PERMISSION_ENUM.TEAM_POST);
  }
}

export { ConversationPageViewModel };
