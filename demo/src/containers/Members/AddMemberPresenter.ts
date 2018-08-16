/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-06-12 10:13:06
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action } from 'mobx';

import BasePresenter from '@/store/base/BasePresenter';

import { service } from 'sdk';

const { SearchService, GroupService } = service;

interface SelectedMember {
  value: number;
  label: string;
}

export default class AddMemberPresenter extends BasePresenter {
  @observable existMembers: number[] = [];

  @action
  async fetchSearch(query: string) {
    const searchService = SearchService.getInstance<SearchService>();
    const result = await searchService.searchMembers(query);
    const filterMembers = result.filter((member) => {
      return !this.existMembers.find(existMember => existMember === member.id);
    });
    return filterMembers;
  }

  @action
  addMember(selectedMembers: SelectedMember[], id: number) {
    const groupService = GroupService.getInstance<GroupService>();
    const members = selectedMembers.map(
      ({ value }: { value: number; label: string }) => value,
    );

    return groupService.addTeamMembers(id, members);
  }
}
