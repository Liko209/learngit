/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-18 14:33:00
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action, computed } from 'mobx';
import { differenceBy } from 'lodash';

import { ENTITY_NAME } from '@/store';
import { SearchService } from 'sdk/module/search';
import { Group } from 'sdk/module/group/entity';
import { Person } from 'sdk/module/person/entity';
import GroupModel from '@/store/models/Group';
import { SortableModel } from 'sdk/framework/model';
import { StoreViewModel } from '@/store/ViewModel';
import { ContactSearchProps, SelectedMember } from './types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { PersonService } from 'sdk/module/person';
import { getGlobalValue, getEntity } from '@/store/utils';
import { GLOBAL_KEYS } from '@/store/constants';

class ContactSearchViewModel extends StoreViewModel<ContactSearchProps> {
  @observable existMembers: number[] = [];
  @observable suggestions: SelectedMember[] = [];
  @observable groupMembers: number[] = [];
  @observable selectedItems: SelectedMember[] = [];
  @observable inputValue: string = '';

  constructor(props: ContactSearchProps) {
    super(props);
    this.autorun(() => {
      const { prefillMembers } = this.props;
      prefillMembers && this._setSelectedItems(prefillMembers);
    });
    this.reaction(
      () => this.props.groupId,
      () => {
        this._setArrangeMembers();
      },
      {
        fireImmediately: true,
      },
    );
  }

  handleSelectChange = (items: SelectedMember[]) => {
    const { onSelectChange } = this.props;
    this.suggestions = [];
    this.selectedItems = items;
    this.inputValue = '';
    return onSelectChange && onSelectChange(items);
  };

  @computed
  private get _isExcludeMe() {
    return this.props.isExcludeMe;
  }

  private _setArrangeMembers() {
    const { groupId } = this.props;
    if (groupId) {
      const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, groupId);
      this.groupMembers = group.members;
      return;
    }
    this.groupMembers = [];
  }

  private async _setSelectedItems(ids: number[]) {
    const userId = getGlobalValue(GLOBAL_KEYS.CURRENT_USER_ID);
    const personService = ServiceLoader.getInstance<PersonService>(
      ServiceConfig.PERSON_SERVICE,
    );
    const people = await personService.getPersonsByIds(ids);
    const temp: SelectedMember[] = [];
    people.forEach(person => {
      if (person.id !== userId) {
        temp.push({
          id: person.id,
          label: personService.getFullName(person) || '',
          email: person.email,
        });
      }
    });
    this.handleSelectChange(temp);
  }

  @action
  fetchPersons = async (query: string) => {
    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );
    const params = {
      excludeSelf: this._isExcludeMe,
      recentFirst: true,
    };
    if (this.groupMembers.length) {
      Object.assign(params, { arrangeIds: this.groupMembers });
    }
    const result = await searchService.doFuzzySearchPersons(query, params);
    const { hasMembers } = this.props;
    const existMembers = hasMembers
      ? [...this.existMembers, ...hasMembers]
      : this.existMembers;

    const filterMembers = result.sortableModels.filter(
      (member: SortableModel<Person>) =>
        !existMembers.find(existMember => existMember === member.id),
    );
    return filterMembers;
  };

  @action
  searchMembers = (value: string) => {
    this.inputValue = value;
    if (!value) {
      this.suggestions = [];
      return;
    }
    let members: SelectedMember[] = [];
    this.fetchPersons(value).then((data: SortableModel<Person>[]) => {
      members = data.map(member => ({
        id: member.id,
        label: member.displayName,
        email: member.entity.email,
      }));
      this.suggestions = differenceBy(members, this.selectedItems, 'id');
    });
  };
}

export { ContactSearchViewModel };
