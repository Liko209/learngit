/*
 * @Author: Vicky Zhu(vicky.zhu@ringcentral.com)
 * @Date: 2019-07-09 14:07:28
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action } from 'mobx';
import { differenceBy } from 'lodash';

import { ENTITY_NAME } from '@/store';
import { SearchService } from 'sdk/module/search';
import { Group } from 'sdk/module/group/entity';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { SortableModel } from 'sdk/framework/model';
import { StoreViewModel } from '@/store/ViewModel';
import { ContactAndGroupSearchProps, SelectedMember } from './types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { FuzzySearchContactOptions } from 'sdk/module/search/entity';

class ContactAndGroupSearchViewModel extends StoreViewModel<
  ContactAndGroupSearchProps
> {
  @observable existMembers: number[] = [];
  @observable suggestions: SelectedMember[] = [];
  @observable groupMembers: number[] = [];
  @observable selectedItems: SelectedMember[] = [];
  @observable inputValue: string = '';

  constructor(props: ContactAndGroupSearchProps) {
    super(props);
    this.reaction(
      () => this.props.groupId,
      () => {
        this._setSelectedItems();
      },
      {
        fireImmediately: true,
      },
    );
  }
  @action
  handleSelectChange = (items: SelectedMember[]) => {
    const { onSelectChange } = this.props;
    this.suggestions = [];
    this.selectedItems = items;
    this.inputValue = '';
    return onSelectChange && onSelectChange(items);
  };
  @action
  private _setSelectedItems() {
    const { groupId } = this.props;
    if (groupId) {
      const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, groupId);
      this.groupMembers = group.members;
      return;
    }
    this.groupMembers = [];
    return;
  }

  @action
  fetchPersons = async (query: string) => {
    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );
    const contactSearchOptions: FuzzySearchContactOptions = {
      excludeSelf: this.props.isExcludeMe,
      recentFirst: true,
    };

    const groupSearchOptions = {
      myGroupsOnly: true,
      recentFirst: true,
    };

    if (this.groupMembers.length) {
      Object.assign(contactSearchOptions, { arrangeIds: this.groupMembers });
    }
    const {
      sortableModels,
    } = await searchService.doFuzzySearchPersonsAndGroups(
      query,
      contactSearchOptions,
      groupSearchOptions,
    );
    const { hasMembers } = this.props;
    const existMembers =
      hasMembers && hasMembers.length
        ? [...this.existMembers, ...hasMembers]
        : this.existMembers;

    const filterMembers = differenceBy(sortableModels, existMembers, 'id');
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
    this.fetchPersons(value).then((data: SortableModel<SelectedMember>[]) => {
      members = data.map(member => ({
        id: member.id,
        label: member.displayName,
        email: member.entity && member.entity.email,
      }));
      this.suggestions = differenceBy(members, this.selectedItems, 'id');
    });
  };
}

export { ContactAndGroupSearchViewModel };
