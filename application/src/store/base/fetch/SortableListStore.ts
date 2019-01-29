/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:11:41
 * Copyright © RingCentral. All rights reserved.
 */
import { computed, action } from 'mobx';
import { ListStore } from './ListStore';
import { ISortableModel, ISortFunc } from './types';
import _ from 'lodash';

const defaultSortFunc: ISortFunc<ISortableModel> = (
  first: ISortableModel,
  second: ISortableModel,
) => first.sortValue - second.sortValue;

export class SortableListStore<T = any> extends ListStore<ISortableModel<T>> {
  private _sortFunc: ISortFunc<ISortableModel<T>>;

  constructor(sortFunc: ISortFunc<ISortableModel<T>> = defaultSortFunc) {
    super();
    this._sortFunc = sortFunc;
  }

  @action
  upsert(idArray: ISortableModel<T>[]) {
    if (idArray.length) {
      const unionAndSortIds = _.unionBy(idArray, this.items, 'id').sort(
        this._sortFunc,
      );
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
    return _.find(this.items, { id });
  }
}
