/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-06-13 14:42:34
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action } from 'mobx';

import BasePresenter from '@/store/base/BasePresenter';

import { service } from 'sdk';

const { SearchService, GroupService, AccountService } = service;
interface Model {
  name: string;
  memberIds: number[];
  description: string;
  options: {
    isPublic: boolean;
    canAddMember: boolean;
    canPost: boolean;
    canAddIntegrations: boolean;
    canPin: boolean;
  };
}

export default class CreateTeamPresenter extends BasePresenter {
  @observable
  model: Model = {
    name: '',
    memberIds: [],
    description: '',
    options: {
      isPublic: false,
      canAddMember: true,
      canPost: true,
      canAddIntegrations: true,
      canPin: true,
    },
  };
  @observable currentUserId: number;

  constructor() {
    super();
    const accountService = AccountService.getInstance<AccountService>();
    this.currentUserId = accountService.getCurrentUserId() as number;
  }

  @action
  async fetchSearch(query: string) {
    const searchService = SearchService.getInstance<SearchService>();
    const result = await searchService.searchMembers(query);

    return result;
  }

  @action
  createTeam() {
    const groupService = GroupService.getInstance<GroupService>();
    const accountService = AccountService.getInstance<AccountService>();
    const creator = accountService.getCurrentUserId() as number;
    const { name, memberIds, description, options } = this.model;

    return groupService.createTeam(
      name,
      creator,
      memberIds,
      description,
      options,
    );
  }
}
