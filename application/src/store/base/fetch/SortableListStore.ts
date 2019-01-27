/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:11:41
 * Copyright © RingCentral. All rights reserved.
 */
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

  upsert(idArray: ISortableModel<T>[]) {
    if (!idArray.length) {
      return;
    }
    const unionAndSortIds = _.unionBy(idArray, this.items, 'id').sort(
      this._sortFunc,
    );
    this.replaceAll(unionAndSortIds);
  }

  removeByIds(ids: number[]) {
    if (!ids.length) {
      return;
    }
    ids.forEach((id: number) => {
      _.remove(this.items, { id });
    });
    this._atom.reportChanged();
  }

  getIds() {
    this._atom.reportObserved();
    return _.map(this.items, 'id');
  }

  getById(id: number) {
    this._atom.reportObserved();
    return _.find(this.items, { id });
  }
}
