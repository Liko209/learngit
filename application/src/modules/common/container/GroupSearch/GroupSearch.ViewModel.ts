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
import GroupModel from '@/store/models/Group';
import { SortableModel } from 'sdk/framework/model';
import { Group } from 'sdk/module/group/entity';
import { mapGroupModelToItem } from './lib';

export class GroupSearchViewModel extends StoreViewModel<GroupSearchProps>
  implements IGroupSearchViewModel {
  @observable list: number[] = [];
  searchResult: SortableModel<Group>[];

  @computed
  get size() {
    return this.list.length;
  }

  getItemComponent = (id: number) => {
    const sortableModel = this.searchResult[this.list.indexOf(id)];
    const groupModel = new GroupModel(sortableModel.entity);
    return mapGroupModelToItem(groupModel);
  };

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
    this.searchResult = result.sortableModels;
    this.list = result.sortableModels.map(item => item.id);
  };
}
