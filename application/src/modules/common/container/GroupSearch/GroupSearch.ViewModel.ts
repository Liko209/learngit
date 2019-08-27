/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-22 16:34:45
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupSearchProps, IGroupSearchViewModel } from './types';
import StoreViewModel from '@/store/ViewModel';
import { observable, computed } from 'mobx';

export class GroupSearchViewModel extends StoreViewModel<GroupSearchProps>
  implements IGroupSearchViewModel {
  @observable list: number[] = [];

  @computed
  get size() {
    return this.list.length;
  }

  searchGroups = async (searchKey: string) => {
    const result = await this.props.searchFunc(searchKey)
    this.list = result.sortableModels.map(item => item.id);
  };
}
