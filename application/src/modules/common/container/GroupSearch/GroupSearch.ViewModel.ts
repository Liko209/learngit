/*
 * @Author: Wayne Zhou (wayne.zhou@ringcentral.com)
 * @Date: 2019-08-22 16:34:45
 * Copyright © RingCentral. All rights reserved.
 */

import { GroupSearchProps, IGroupSearchViewModel } from './types';
import StoreViewModel from '@/store/ViewModel';
import { observable, computed } from 'mobx';
import GroupModel from '@/store/models/Group';
import { SortableModel } from 'sdk/framework/model';
import { Group } from 'sdk/module/group/entity';
import { mapGroupModelToItem } from './lib';
import { GlipTypeUtil, TypeDictionary } from 'sdk/utils';
import PersonModel from '@/store/models/Person';
import { Person } from 'sdk/module/person/entity';
import { ContactSearchItem } from '@/containers/Downshift/ContactSearch/ContactSearchItem';

export class GroupSearchViewModel extends StoreViewModel<GroupSearchProps>
  implements IGroupSearchViewModel {
  @observable list: number[] = [];
  searchResult: SortableModel<Group | Person>[];

  @computed
  get size() {
    return this.list.length;
  }

  getItemComponent = (id: number) => {
    const sortableModel = this.searchResult[this.list.indexOf(id)];
    const type = GlipTypeUtil.extractTypeId(id);
    switch (type) {
      case TypeDictionary.TYPE_ID_PERSON: {
        const personModel = new PersonModel(sortableModel.entity as Person);
        return {
          Item: ContactSearchItem,
          props: { itemId: personModel.id, size: 'large' },
        };
      }
      default: {
        const groupModel = new GroupModel(sortableModel.entity as Group);
        return mapGroupModelToItem(groupModel);
      }
    }
  };

  searchGroups = async (searchKey: string) => {
    let result;
    if (searchKey === '') {
      result = await this.props.defaultList();
    } else {
      result = await this.props.searchFunc(searchKey);
    }
    this.searchResult = result;
    this.list = result.map(item => item.id);
  };
}
