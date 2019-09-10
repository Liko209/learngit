/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:11:41
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, action } from 'mobx';
import { ListStore } from './ListStore';
import { ISortFunc, ISortableModel } from './types';
import _ from 'lodash';
import { mainLogger } from 'foundation/log';
import { ModelIdType } from 'sdk/framework/model';

export class SortableListStore<
  IdType extends ModelIdType = number,
  SortableModel extends ISortableModel<IdType> = ISortableModel<IdType>
> extends ListStore<SortableModel> {
  private _sortFunc?: ISortFunc<IdType, SortableModel>;

  constructor(sortFunc?: ISortFunc<IdType, SortableModel>, limit?: number) {
    super(limit);
    this._sortFunc = sortFunc;
  }

  @action
  upsert(idArray: SortableModel[]) {
    if (idArray.length) {
      const unionArray = _.unionBy(idArray, this.items, 'id');
      const unionAndSortIds = this._sortFunc
        ? unionArray.sort(this._sortFunc)
        : _.sortBy(unionArray, 'sortValue');
      if (
        this._limit &&
        unionAndSortIds.length === this._items.length &&
        _.isEqualWith(
          unionAndSortIds,
          this._items,
          (objValue: ISortableModel, otherValue: ISortableModel) =>
            objValue.id === otherValue.id,
        )
      ) {
        mainLogger.debug(
          'SortableListStore',
          `updated items.size=${
            unionAndSortIds.length
          }, is same with original items`,
        );
        return;
      }

      this.replaceAll(unionAndSortIds);
    }
  }

  @action
  removeByIds(ids: IdType[]) {
    if (!ids.length) {
      return;
    }
    ids.forEach((id: IdType) => {
      const index = this.findIndexById(id);
      if (index > -1) {
        this.removeAt(index);
      }
    });
  }

  findIndexById(id: IdType) {
    return this.items.findIndex(item => item.id === id);
  }

  @computed
  get getIds() {
    return _.map(this.items, 'id');
  }

  getById(id: IdType) {
    return this.items.find((item: SortableModel) => item.id === id);
  }
}
