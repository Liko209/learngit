/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-18 14:33:00
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action, computed } from 'mobx';
import { debounce } from 'lodash';

import { SearchService } from 'sdk/module/search';
import { Person } from 'sdk/module/person/entity';
import { SortableModel } from 'sdk/framework/model';
import { StoreViewModel } from '@/store/ViewModel';
import { ContactSearchProps, SelectedMember } from './types';

class ContactSearchViewModel extends StoreViewModel<ContactSearchProps> {
  @observable existMembers: number[] = [];
  @observable suggestions: SelectedMember[] = [];

  onContactSelectChange = (arg: any) => {
    this.suggestions = [];
    return this.props.onSelectChange(arg);
  }

  @computed
  private get _isExcludeMe() {
    return this.props.isExcludeMe;
  }

  constructor(props: ContactSearchProps) {
    super(props);
    this.searchMembers = debounce(this.searchMembers.bind(this), 300);
  }

  @action
  fetchSearch = async (query: string) => {
    const searchService = SearchService.getInstance();
    const result = await searchService.doFuzzySearchPersons({
      searchKey: query,
      excludeSelf: this._isExcludeMe,
      recentFirst: true,
    });
    const { hasMembers } = this.props;
    const existMembers = hasMembers
      ? [...this.existMembers, ...hasMembers]
      : this.existMembers;

    if (result) {
      const filterMembers = result.sortableModels.filter(
        (member: SortableModel<Person>) => {
          return !existMembers.find(existMember => existMember === member.id);
        },
      );
      return filterMembers;
    }
    return null;
  }

  @action
  searchMembers = (value: string) => {
    if (!value) {
      this.suggestions = [];
      return;
    }
    let members: SelectedMember[] = [];
    this.fetchSearch(value).then((data: SortableModel<Person>[]) => {
      members = data.map(member => ({
        id: member.id,
        label: member.displayName,
        email: member.entity.email,
      }));
      this.suggestions = members.slice(0, 20);
    });
  }
}

export { ContactSearchViewModel };
