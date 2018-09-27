/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-18 14:33:00
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action } from 'mobx';

import SearchService from 'sdk/service/search';
import { Person } from 'sdk/src/models';

class SearchContactVM {
  @observable
  existMembers: number[] = [];

  @action
  async fetchSearch(query: string) {
    const searchService = SearchService.getInstance<SearchService>();
    const result = await searchService.searchMembers(query);
    const filterMembers = result.filter((member: Person) => {
      return !this.existMembers.find(existMember => existMember === member.id);
    });
    return filterMembers;
  }
}

export default SearchContactVM;
