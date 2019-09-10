/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-18 14:33:00
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action } from 'mobx';
import { differenceBy } from 'lodash';

import { ENTITY_NAME } from '@/store';
import { Group } from 'sdk/module/group/entity';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { SortableModel } from 'sdk/framework/model';
import { StoreViewModel } from '@/store/ViewModel';
import { GroupSearchProps, SelectedMember } from './types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SearchService } from 'sdk/module/search/service';

class GroupSearchViewModel extends StoreViewModel<GroupSearchProps> {
  @observable existMembers: number[] = [];
  @observable suggestions: SelectedMember[] = [];
  @observable selectedItems: SelectedMember[] = [];
  @observable inputValue: string = '';
  autoFocusInput: boolean = false;

  constructor(props: GroupSearchProps) {
    super(props);
    this.reaction(
      () => this.props.groupId,
      (id: number) => {
        id && this._setSelectedItems(id);
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
    items[0] && this._setSelectedItems(items[0].id);
    return onSelectChange && onSelectChange(items);
  };

  private _setSelectedItems(id: number) {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, id);
    this.selectedItems = [
      {
        id,
        label: group.displayName,
        email: group.displayName,
      },
    ];
    this.autoFocusInput = true;
  }

  @action
  fetchGroups = async (query: string) => {
    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );
    const result = await searchService.doFuzzySearchAllGroups(query, {
      fetchAllIfSearchKeyEmpty: false,
      myGroupsOnly: true,
      recentFirst: true,
    });

    return result.sortableModels;
  };

  @action
  searchGroups = (value: string) => {
    this.inputValue = value;
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
      this.suggestions = differenceBy(groups, this.selectedItems, 'id');
    });
  };
}

export { GroupSearchViewModel };
