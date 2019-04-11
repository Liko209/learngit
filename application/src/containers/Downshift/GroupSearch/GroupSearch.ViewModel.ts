/*
 * @Author: Shining Miao (shining.miao@ringcentral.com)
 * @Date: 2018-09-18 14:33:00
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action, comparer } from 'mobx';
import { differenceBy } from 'lodash';

import { ENTITY_NAME } from '@/store';
import { GroupService } from 'sdk/module/group';
import { Group } from 'sdk/module/group/entity';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { SortableModel } from 'sdk/framework/model';
import { StoreViewModel } from '@/store/ViewModel';
import { GroupSearchProps, SelectedMember } from './types';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';

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
      () => {
        this._setSelectedItems();
      },
      {
        fireImmediately: true,
        equals: comparer.structural,
      },
    );
  }

  handleSelectChange = (items: SelectedMember[]) => {
    const { onSelectChange } = this.props;
    this.suggestions = [];
    this.selectedItems = items;
    this.inputValue = '';
    return onSelectChange && onSelectChange(items);
  }

  private _setSelectedItems() {
    const { groupId } = this.props;
    if (groupId) {
      const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, groupId);
      this.selectedItems = [
        {
          id: groupId,
          label: group.displayName,
          email: group.displayName,
        },
      ];
      this.autoFocusInput = true;
    }
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
      this.suggestions = differenceBy(
        groups.slice(0, 20),
        this.selectedItems,
        'id',
      );
    });
  }
}

export { GroupSearchViewModel };
