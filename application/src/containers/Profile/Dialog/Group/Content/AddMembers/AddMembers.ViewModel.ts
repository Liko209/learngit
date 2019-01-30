/*
 * @Author: Looper Wang (looper.wang@ringcentral.com)
 * @Date: 2019-01-15 15:03:48
 * Copyright © RingCentral. All rights reserved.
 */
import { action, observable } from 'mobx';
import { NewGroupService } from 'sdk/module/group';
import { AbstractViewModel } from '@/base';
import { ViewModuleProps } from './types';

type SelectedMember = {
  id: number;
  label: string;
  email: string;
};

class AddMembersViewModel extends AbstractViewModel<ViewModuleProps> {
  @observable
  disabledOkBtn: boolean = true;
  @observable
  members: number[] = [];

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
  addTeamMembers = async () => {
    const { group } = this.props;
    const groupService: NewGroupService = NewGroupService.getInstance();
    await groupService.addTeamMembers(this.members, group.id);
  }
}

export { AddMembersViewModel };
