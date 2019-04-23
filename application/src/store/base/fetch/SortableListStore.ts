/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:11:41
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, action } from 'mobx';
import { ListStore } from './ListStore';
import { ISortableModel, ISortFunc } from './types';
import _ from 'lodash';
import { mainLogger } from 'sdk';

// const defaultSortFunc: ISortFunc<ISortableModel> = (
//   first: ISortableModel,
//   second: ISortableModel,
// ) => first.sortValue - second.sortValue;

export class SortableListStore<T = any> extends ListStore<ISortableModel<T>> {
  private _sortFunc?: ISortFunc<ISortableModel<T>>;

  constructor(sortFunc?: ISortFunc<ISortableModel<T>>, limit?: number) {
    super(limit);
    this._sortFunc = sortFunc;
  }

  @action
  upsert(idArray: ISortableModel<T>[]) {
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
          (objValue: ISortableModel<T>, otherValue: ISortableModel<T>) => {
            return objValue.id === otherValue.id;
          },
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
  removeByIds(ids: number[]) {
    if (!ids.length) {
      return;
    }
    ids.forEach((id: number) => {
      const index = this.findIndexById(id);
      if (index > -1) {
        this.removeAt(index);
      }
    });
  }

  findIndexById(id: number) {
    return this.items.findIndex(item => item.id === id);
  }

  @computed
  get getIds() {
    return _.map(this.items, 'id');
  }

  getById(id: number) {
    return _.find(this.items, { id });
  }
}
