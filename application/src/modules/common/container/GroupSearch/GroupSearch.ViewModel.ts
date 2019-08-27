/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-22 16:34:45
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupSearchProps, IGroupSearchViewModel } from './types';
import StoreViewModel from '@/store/ViewModel';
import { observable, computed } from 'mobx';
import GroupModel from '@/store/models/Group';
import { SortableModel } from 'sdk/src/framework/model';
import { Group } from 'sdk/src/module/group/entity';
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
    const result = await this.props.searchFunc(searchKey)
    this.searchResult = result;
    this.list = result.map(item => item.id);
  };
}
