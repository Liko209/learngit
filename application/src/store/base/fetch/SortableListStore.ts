/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:11:41
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, action } from 'mobx';
import { ListStore } from './ListStore';
import { ISortFunc, ISortableModel } from './types';
import _ from 'lodash';

// const defaultSortFunc: ISortFunc<ISortableModel> = (
//   first: ISortableModel,
//   second: ISortableModel,
// ) => first.sortValue - second.sortValue;

export class SortableListStore<
  SortableModel extends ISortableModel = ISortableModel
> extends ListStore<SortableModel> {
  private _sortFunc?: ISortFunc<SortableModel>;

  constructor(sortFunc?: ISortFunc<SortableModel>) {
    super();
    this._sortFunc = sortFunc;
  }

  @action
  upsert(idArray: SortableModel[]) {
    if (idArray.length) {
      const unionArray = _.unionBy(idArray, this.items, 'id');
      const unionAndSortIds = this._sortFunc
        ? unionArray.sort(this._sortFunc)
        : _.sortBy(unionArray, 'sortValue');
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
    return this._items.findIndex(item => item.id === id);
  }

  @computed
  get getIds() {
    return _.map(this.items, 'id');
  }

  getById(id: number) {
    return _.find(this.items, { id }) as SortableModel | undefined;
  }
}
