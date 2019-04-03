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
import { OpenProfile } from '@/common/OpenProfile';
import { RecentSearchTypes } from 'sdk/module/search/entity';

import { GlobalSearchStore } from '../../store';
import { GlobalSearchService } from '../../service';
import {
  RecentSearchProps,
  RecentSearchViewProps,
  RecentSearchModel,
  Group,
} from './types';
import { SearchViewModel } from '../common/Search.ViewModel';

const InitIndex = -1;

class RecentSearchViewModel extends SearchViewModel<RecentSearchProps>
  implements RecentSearchViewProps {
  @observable recentRecord: RecentSearchModel[] = [];
  @observable selectIndex: number = InitIndex;
  private _globalSearchStore: GlobalSearchStore = container.get(
    GlobalSearchStore,
  );

  constructor() {
    super();
    this.reaction(
      () => ({
        searchKey: this._globalSearchStore.searchKey,
      }),
      ({ searchKey }: { searchKey: string }) => {
        if (searchKey === '') {
          this.getRecent();
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

  setSelectIndex = (index: number) => {
    this.selectIndex = index;
  }

  onKeyUp = () => {
    const selectIndex = this.selectIndex;
    this.selectIndex = selectIndex === 0 ? 0 : selectIndex - 1;
  }

  onKeyDown = () => {
    const selectIndex = this.selectIndex;
    const len = this.recentRecord.length - 1;
    this.selectIndex = selectIndex === len ? len : selectIndex + 1;
  }

  // if search item removed need update selectIndex
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

  private get _currentItemValue() {
    return this.recentRecord[this.selectIndex].value;
  }

  private get _currentItemType() {
    return this.recentRecord[this.selectIndex].type;
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
  onEnter = (e: KeyboardEvent) => {
    const currentItemValue = this._currentItemValue;
    const currentItemType = this._currentItemType;
    if (!currentItemValue) {
      return;
    }
    this.addRecentRecord(currentItemValue);

    if (typeof currentItemValue === 'string') {
      // TODO search message && go to full search
      return;
    }
    if (currentItemType === RecentSearchTypes.PEOPLE) {
      OpenProfile.show(currentItemValue, null, this.onClose);
      return;
    }

    const { canJoin, group } = this.joinTeam(currentItemValue);
    if (canJoin) {
      e.preventDefault();
      this.handleJoinTeam(group);
    } else {
      this.goToConversation(currentItemValue);
    }
  }

  addRecentRecord = (value: number | string) => {
    SearchService.getInstance().addRecentSearchRecord(
      this._currentItemType,
      value,
    );
  }

  clearRecent = () => {
    SearchService.getInstance().clearRecentSearchRecords();
    this.recentRecord = [];
  }

  getRecent = () => {
    this.recentRecord = SearchService.getInstance().getRecentSearchRecords();
  }
}

export { RecentSearchViewModel };
