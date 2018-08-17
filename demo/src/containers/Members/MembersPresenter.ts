/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-06-11 16:46:30
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action } from 'mobx';

import BasePresenter from '@/store/base/BasePresenter';

import { service } from 'sdk';

const { GroupService, PERMISSION_ENUM } = service;

export default class MembersPresenter extends BasePresenter {
  @observable showAddMember = false;

  @action
  hasAddMemberPermissionByGroupId(id: number) {
    const groupService: GroupService = GroupService.getInstance();

    groupService
      .hasPermissionWithGroupId(id, PERMISSION_ENUM.TEAM_ADD_MEMBER)
      .then((res) => {
        this.showAddMember = res;
      });
  }
}
