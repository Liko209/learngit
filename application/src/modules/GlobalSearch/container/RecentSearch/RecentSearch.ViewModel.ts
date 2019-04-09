/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:49:32
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework';
import { observable, action } from 'mobx';
import { SearchService } from 'sdk/module/search';
import { getEntity } from '@/store/utils';
import GroupModel from '@/store/models/Group';
import { ENTITY_NAME } from '@/store/constants';

import { changeToSearchType, changeToRecordTypes } from '../common/changeTypes';
import { GlobalSearchStore } from '../../store';
import { GlobalSearchService } from '../../service';
import {
  RecentSearchProps,
  RecentSearchViewProps,
  RecentRecord,
  RecentSearchModel,
  Group,
  SearchItemTypes,
} from './types';
import { SearchViewModel } from '../common/Search.ViewModel';

const InitIndex = -1;

class RecentSearchViewModel extends SearchViewModel<RecentSearchProps>
  implements RecentSearchViewProps {
  @observable recentRecord: RecentRecord[] = [];
  @observable selectIndex: number = InitIndex;
  private _globalSearchStore: GlobalSearchStore = container.get(
    GlobalSearchStore,
  );

  constructor() {
    super();
    this.reaction(
      () => this._globalSearchStore.searchKey,
      (searchKey: string) => {
        if (searchKey === '') {
          this.fetchRecent();
        }
      },
      {
        fireImmediately: true,
      },
    );
  }

  @action
  onClear = () => {
    this._globalSearchStore.clearSearchKey();
  }

  @action
  onClose = () => {
    container.get(GlobalSearchService).closeGlobalSearch();
  }

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
    this.selectIndex = selectIndex === 0 ? 0 : selectIndex - 1;
  }

  @action
  onKeyDown = () => {
    const selectIndex = this.selectIndex;
    const len = this.recentRecord.length - 1;
    this.selectIndex = selectIndex === len ? len : selectIndex + 1;
  }

  // if search item removed need update selectIndex
  @action
  selectIndexChange = (index: number) => {
    const data = this.recentRecord.slice();
    data.splice(index, 1);
    if (index === this.selectIndex) {
      this.setSelectIndex(InitIndex);
      return;
    }
    if (index < this.selectIndex) {
      this.setSelectIndex(this.selectIndex - 1);
    }
  }

  get currentItemValue() {
    return this.recentRecord[this.selectIndex].value;
  }

  get currentItemType() {
    return this.recentRecord[this.selectIndex].type;
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
  onEnter = (e: KeyboardEvent) => {
    const currentItemValue = this.currentItemValue;
    const currentItemType = this.currentItemType;
    if (!currentItemValue) {
      return;
    }
    this.addRecentRecord(currentItemValue);

    if (typeof currentItemValue === 'string') {
      // TODO search message && go to full search
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

  addRecentRecord = (value: number | string) => {
    const type = changeToRecordTypes(this.currentItemType);
    SearchService.getInstance().addRecentSearchRecord(type, value);
  }

  @action
  clearRecent = () => {
    SearchService.getInstance().clearRecentSearchRecords();
    this.recentRecord = [];
  }

  @action
  fetchRecent = () => {
    const records = SearchService.getInstance().getRecentSearchRecords();
    this.recentRecord = records.map((record: RecentSearchModel) => {
      const { id, value, query_params } = record;
      return {
        id,
        value,
        queryParams: query_params,
        type: changeToSearchType(record.type),
      };
    });
  }
}

export { RecentSearchViewModel };
