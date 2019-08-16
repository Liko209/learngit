/*
 * @Author: Nello Huang (nello.huang@ringcentral.com)
 * @Date: 2019-03-31 21:49:32
 * Copyright © RingCentral. All rights reserved.
 */
import { container } from 'framework/ioc';
import { getEntity } from '@/store/utils';
import { ENTITY_NAME } from '@/store';
import { Group } from 'sdk/module/group/entity';
import GroupModel from '@/store/models/Group';
import { observable, action } from 'mobx';
import { SearchService } from 'sdk/module/search';
import { ServiceConfig, ServiceLoader } from 'sdk/module/serviceLoader';

import { changeToSearchType, changeToRecordTypes } from '../common/changeTypes';
import { GlobalSearchStore } from '../../store';
import {
  SearchItemTypes,
  RecentSearchProps,
  RecentSearchViewProps,
  RecentRecord,
  RecentSearchModel,
} from './types';
import { SearchCellViewModel } from '../common/SearchCell.ViewModel';

class RecentSearchViewModel extends SearchCellViewModel<RecentSearchProps>
  implements RecentSearchViewProps {
  @observable recentRecord: RecentRecord[] = [];
  private _globalSearchStore: GlobalSearchStore = container.get(
    GlobalSearchStore,
  );

  constructor() {
    super();
    this.reaction(
      () => ({
        key: this._globalSearchStore.searchKey,
        open: this._globalSearchStore.open,
      }),
      async ({ key, open }) => {
        if (key === '' && open) {
          await this.fetchRecent();
        }
      },
      {
        fireImmediately: true,
      },
    );
  }

  @action
  onKeyDown = () => {
    const selectIndex = this.selectIndex;
    const len = this.recentRecord.length - 1;
    this.selectIndex = selectIndex === len ? len : selectIndex + 1;
  };

  // if search item removed need update selectIndex
  @action
  selectIndexChange = (index: number) => {
    const data = this.recentRecord.slice();
    data.splice(index, 1);
    if (index === this.selectIndex) {
      this.setSelectIndex(-1);
      return;
    }
    if (index < this.selectIndex) {
      this.setSelectIndex(this.selectIndex - 1);
    }
  };

  get currentItemValue() {
    return this.recentRecord[this.selectIndex].value;
  }

  get currentItemType() {
    return this.recentRecord[this.selectIndex].type;
  }

  get currentGroupId() {
    const params = this.recentRecord[this.selectIndex].queryParams;
    if (!params) {
      return null;
    }
    return params && params.groupId;
  }

  @action
  onEnter = (e: KeyboardEvent) => {
    if (this.selectIndex < 0) {
      return;
    }
    const currentItemValue = this.currentItemValue;

    if (!currentItemValue) {
      return;
    }

    const currentItemType = this.currentItemType;
    const groupId = this.currentGroupId;
    const params = groupId ? { groupId } : undefined;

    this.onSelectItem(e, currentItemValue, currentItemType, params);
    this.addRecentRecord(currentItemValue, params);
  };

  addRecentRecord = (value: number | string, params?: { groupId: number }) => {
    const type = changeToRecordTypes(this.currentItemType);
    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );
    searchService.addRecentSearchRecord(type, value, params ? params : {});
  };

  @action
  clearRecent = () => {
    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );
    searchService.clearRecentSearchRecords();
    this.recentRecord = [];
  };

  isValidGroup(value?: number) {
    if (!value) {
      return false;
    }
    try {
      const group = getEntity<Group, GroupModel>(ENTITY_NAME.GROUP, value);
      const { isMember, deactivated, isArchived, isTeam, privacy } = group;
      const isPrivate = isTeam && privacy === 'private';
      const shouldHidden =
        deactivated || isArchived || (!isMember && isPrivate);
      return shouldHidden !== undefined && !shouldHidden;
    } catch {
      return false;
    }
  }

  isValidRecord = (record: RecentRecord) => {
    const { value, type } = record;
    if (type === SearchItemTypes.GROUP || type === SearchItemTypes.TEAM) {
      return this.isValidGroup(typeof value === 'string' ? undefined : value);
    }
    return true;
  };

  @action
  fetchRecent = async () => {
    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );
    const records = await searchService.getRecentSearchRecords();
    this.recentRecord = records
      .map((record: RecentSearchModel) => {
        const { id, value, query_params } = record;
        return {
          id,
          value,
          queryParams: query_params as { groupId: number },
          type: changeToSearchType(record.type),
        };
      })
      .filter(this.isValidRecord);
  };
}

export { RecentSearchViewModel };
