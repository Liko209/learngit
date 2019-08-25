/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-22 16:34:45
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupSearchProps, IGroupSearchViewModel } from './types';
import StoreViewModel from '@/store/ViewModel';
import { ServiceLoader, ServiceConfig } from 'sdk/module/serviceLoader';
import { SearchService } from 'sdk/module/search';
import { GroupService } from 'sdk/module/group';
import { observable, computed } from 'mobx';

export class GroupSearchViewModel extends StoreViewModel<GroupSearchProps>
  implements IGroupSearchViewModel {
  @observable list: number[] = [];
  get groupService() {
    return ServiceLoader.getInstance<GroupService>(ServiceConfig.GROUP_SERVICE);
  }

  @computed
  get size() {
    return this.list.length;
  }

  searchGroups = async (searchKey: string) => {
    const searchService = ServiceLoader.getInstance<SearchService>(
      ServiceConfig.SEARCH_SERVICE,
    );
    const result = await searchService.doFuzzySearchAllGroups(searchKey, true);
    this.list = result.sortableModels.map(item => item.id);
  };
}
