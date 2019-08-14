/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-04-02 19:43:46
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { action, observable } from 'mobx';
import GroupModel from '@/store/models/Group';
import { SearchViewModel } from './Search.ViewModel';
import { getEntity } from '@/store/utils';
import { Group } from 'sdk/module/group/entity';
import { ENTITY_NAME } from '@/store/constants';
import { SearchItemTypes, SEARCH_SCOPE, SEARCH_VIEW } from '../../types';
import { GlobalSearchStore } from '../../store';

const InitIndex = -1;

class SearchCellViewModel<T> extends SearchViewModel<T> {
  @observable selectIndex: number = InitIndex;

  @action
  resetSelectIndex = () => {
    this.selectIndex = InitIndex;
  }

  @action
  setSelectIndex = (index: number) => {
    this.selectIndex = index;
  }

  @action
  onKeyUp = () => {
    const selectIndex = this.selectIndex;
    this.selectIndex = selectIndex <= 0 ? 0 : selectIndex - 1;
  }

  canJoinTeam = (id: number) => {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, id);
    const { isMember, isTeam, privacy } = group;
    return {
      group,
      canJoin: !!(isTeam && privacy === 'protected' && !isMember),
    };
  }

  @action
  onSelectItem = (
    e: KeyboardEvent,
    currentItemValue: number | string,
    currentItemType: SearchItemTypes,
    params?:
    | {
      groupId?: number;
    }
    | undefined,
  ) => {
    if (!currentItemValue) {
      return;
    }

    // select message item
    if (typeof currentItemValue === 'string') {
      const store = container.get(GlobalSearchStore);

      if (params && params.groupId) {
        store.setGroupId(params.groupId);
      }
      store.setSearchKey(currentItemValue);
      store.setSearchScope(SEARCH_SCOPE.CONVERSATION);
      store.setCurrentView(SEARCH_VIEW.FULL_SEARCH);
      return;
    }

    if (currentItemType === SearchItemTypes.PEOPLE) {
      this.goToConversation(currentItemValue as number);
      return;
    }

    const { canJoin, group } = this.canJoinTeam(currentItemValue);
    if (canJoin) {
      e.preventDefault();
      this.handleJoinTeam(group);
    } else {
      this.goToConversation(currentItemValue);
    }
  }
}

export { SearchCellViewModel };
