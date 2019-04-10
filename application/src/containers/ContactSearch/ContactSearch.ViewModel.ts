/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-18 14:33:00
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action, comparer, computed } from 'mobx';
import { debounce, differenceBy } from 'lodash';

import { ENTITY_NAME } from '@/store';
import { SearchService } from 'sdk/module/search';
import { GroupService } from 'sdk/module/group';
import { Group } from 'sdk/module/group/entity';
import { Person } from 'sdk/module/person/entity';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { SortableModel } from 'sdk/framework/model';
import { StoreViewModel } from '@/store/ViewModel';
import { ContactSearchProps, SelectedMember } from './types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
class ContactSearchViewModel extends StoreViewModel<ContactSearchProps> {
  @observable existMembers: number[] = [];
  @observable suggestions: SelectedMember[] = [];
  @observable initialSelectedItem: SelectedMember;
  @observable groupMembers: number[] = [];
  selectedItems: SelectedMember[] = [];

  constructor(props: ContactSearchProps) {
    super(props);
    this.reaction(
      () => this.props.groupId,
      () => {
        this._setInitialSelectedItem();
      },
      {
        fireImmediately: true,
        equals: comparer.structural,
      },
    );
    this.searchMembers = debounce(this.searchMembers.bind(this), 300);
    this.searchGroups = debounce(this.searchGroups.bind(this), 300);
  }

  onContactSelectChange = (items: SelectedMember[]) => {
    const { onSelectChange } = this.props;
    this.suggestions = [];
    this.selectedItems = items;
    return onSelectChange && onSelectChange(items);
  }

  @computed
  private get _isExcludeMe() {
    return this.props.isExcludeMe;
  }

  private _setInitialSelectedItem() {
    const { groupId } = this.props;
    if (groupId) {
      const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, groupId);
      this.initialSelectedItem = {
        id: groupId,
        label: group.displayName,
        email: group.displayName,
      };
      this.groupMembers = group.members;
    }
  }

  @action
  fetchPersons = async (query: string) => {
    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );
    const params = {
      searchKey: query,
      excludeSelf: this._isExcludeMe,
      recentFirst: true,
    };
    if (this.groupMembers.length) {
      Object.assign(params, { arrangeIds: this.groupMembers });
    }
    const result = await searchService.doFuzzySearchPersons(params);
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
  fetchGroups = async (query: string) => {
    const groupService = ServiceLoader.getInstance<GroupService>(
      ServiceConfig.GROUP_SERVICE,
    );
    const result = await groupService.doFuzzySearchALlGroups(
      query,
      false,
      true,
    );

    return result ? result.sortableModels : null;
  }

  @action
  searchMembers = (value: string) => {
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
      this.suggestions = differenceBy(
        members.slice(0, 20),
        this.selectedItems,
        'id',
      );
    });
  }

  @action
  searchGroups = (value: string) => {
    if (!value) {
      this.suggestions = [];
      return;
    }
    let groups: SelectedMember[] = [];
    this.fetchGroups(value).then((data: SortableModel<Group>[]) => {
      groups = data.map(group => ({
        id: group.id,
        label: group.displayName,
        email: group.displayName,
      }));
      this.suggestions = differenceBy(
        groups.slice(0, 20),
        this.selectedItems,
        'id',
      );
    });
  }
}

export { ContactSearchViewModel };
