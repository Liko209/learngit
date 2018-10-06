/*
 * @Author: Steve Chen (steve.chen@ringcentral.com)
 * @Date: 2018-10-07 00:11:41
 * Copyright © RingCentral. All rights reserved.
 */
import ListStore from '../ListStore';
import ISortableModel from './ISortableModel';
import _ from 'lodash';

export type ISortFunc = <T>(
  first: ISortableModel<T>,
  second: ISortableModel<T>,
) => number;

const defaultSortFunc: ISortFunc = <T>(
  first: ISortableModel<T>,
  second: ISortableModel<T>,
) => first.sortValue - second.sortValue;

export default class SortableListStore<T = any> extends ListStore<
  ISortableModel<T>
> {
  private _sortFunc: ISortFunc;

  constructor(sortFunc: ISortFunc = defaultSortFunc) {
    super();
    this._sortFunc = sortFunc;
  }

  upsert(idArray: ISortableModel<T>[]) {
    const unionAndSortIds = _.unionBy(idArray, this.getItems(), 'id').sort(
      this._sortFunc,
    );

    this.replaceAll(unionAndSortIds);
  }

  removeById(ids: number[]) {
    ids.forEach((id: number) => {
      _.remove(this.getItems(), { id });
    });

    this._atom.reportChanged();
  }

  getIds() {
    this._atom.reportObserved();
    return _.map(this.getItems(), 'id');
  }

  getById(id: number) {
    this._atom.reportObserved();
    return _.find(this.getItems(), { id });
  }
}
