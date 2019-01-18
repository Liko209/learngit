/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-01-15 15:03:48
 * Copyright © RingCentral. All rights reserved.
 */
import { action, computed, observable } from 'mobx';
import { GroupService } from 'sdk/module/group';
import { AbstractViewModel } from '@/base';
import { getGlobalValue } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';
import { ViewModuleProps } from './types';

type SelectedMember = {
  id: number;
  label: string;
  email: string;
};

class AddMembersViewModel extends AbstractViewModel<ViewModuleProps> {
  private _groupService: GroupService = new GroupService();
  @observable
  disabledOkBtn: boolean = true;
  @observable
  members: number[] = [];

  @computed
  get isOffline() {
    return getGlobalValue(GLOBAL_KEYS.NETWORK) === 'offline';
  }

  @action
  handleSearchContactChange = (items: SelectedMember[]) => {
    const members = items.map((item: any) => {
      if (item.id) {
        return item.id;
      }
      return item.email;
    });
    this.disabledOkBtn = members.length ? false : true;
    this.members = members;
  }

  @action
  addTeamMembers = () => {
    const { group } = this.props;
    this._groupService.addTeamMembers(this.members, group.id);
  }
}

export { AddMembersViewModel };
