/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:49:32
 * Copyright © RingCentral. All rights reserved.
 */
import { observable, action } from 'mobx';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { ENTITY_NAME } from '@/store/constants';
import { RecentSearchTypes } from 'sdk/module/search/entity';
import { IndexRange } from 'jui/components/VirtualizedList/types';
import {
  ItemListViewProps,
  Group,
} from './types';
import { SearchViewModel } from '../common/Search.ViewModel';

const InitIndex = -1;

class ItemListViewModel extends SearchViewModel<ItemListViewProps> {
  @observable selectIndex: number = InitIndex;
  @observable startIndex: number = 0;
  @observable stopIndex: number = 0;

  @action
  resetSelectIndex = () => {
    this.selectIndex = InitIndex;
  }

  @action
  setSelectIndex = (index: number) => {
    this.selectIndex = index;
  }

  @action
  setRangeIndex = (range: IndexRange) => {
    this.startIndex = range.startIndex;
    this.stopIndex = range.stopIndex;
  }

  @action
  onKeyUp = () => {
    const selectIndex = this.selectIndex;
    this.selectIndex = selectIndex <= 0 ? 0 : selectIndex - 1;
  }

  @action
  onKeyDown = (list: number[]) => {
    const selectIndex = this.selectIndex;
    const len = list.length - 1;
    this.selectIndex = selectIndex === len ? len : selectIndex + 1;
  }

  joinTeam = (id: number) => {
    const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, id);
    const { isMember, isTeam, privacy } = group;
    return {
      group,
      canJoin: !!(isTeam && privacy === 'protected' && !isMember),
    };
  }

  @action
  onEnter = (e: KeyboardEvent, list: number[], currentItemType: RecentSearchTypes) => {
    const currentItemValue = list[this.selectIndex];
    if (!currentItemValue) {
      return;
    }

    if (typeof currentItemValue === 'string') {
      return;
    }

    if (currentItemType === RecentSearchTypes.PEOPLE) {
      this.goToConversation(currentItemValue as number);
      return;
    }

    const { canJoin, group } = this.joinTeam(currentItemValue as number);
    if (canJoin) {
      e.preventDefault();
      this.handleJoinTeam(group);
    } else {
      this.goToConversation(currentItemValue);
    }
  }
}

export { ItemListViewModel };
