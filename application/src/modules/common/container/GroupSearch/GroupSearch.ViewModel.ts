/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-22 16:34:45
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupSearchProps, IGroupSearchViewModel } from './types';
import StoreViewModel from '@/store/ViewModel';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SearchService } from 'sdk/module/search';
import { observable, computed } from 'mobx';

export class GroupSearchViewModel extends StoreViewModel<GroupSearchProps>
  implements IGroupSearchViewModel {
  @observable list: number[] = [];

  @computed
  get size() {
    return this.list.length;
  }

  searchGroups = async (searchKey: string) => {
    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );
    const result = await searchService.doFuzzySearchAllGroups(searchKey, {
      myGroupsOnly: true,
      fetchAllIfSearchKeyEmpty: true,
      sortFunc: (lhs, rhs) => {
        const lhsModifiedAt = lhs.entity.most_recent_content_modified_at;
        const rhsModifiedAt = rhs.entity.most_recent_content_modified_at;

        if (lhsModifiedAt < rhsModifiedAt) return 1;
        if (lhsModifiedAt > rhsModifiedAt) return -1;
        return 0;
      },
    });
    this.list = result.sortableModels.map(item => item.id);
  };
}
